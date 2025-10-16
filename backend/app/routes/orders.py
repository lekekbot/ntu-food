from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from datetime import datetime, timedelta
from app.database.database import get_db
from app.models.order import Order, OrderItem, OrderStatus, PaymentStatus
from app.models.menu import MenuItem
from app.models.stall import Stall
from app.models.queue import QueueEntry, QueueStatus
from app.models.user import UserRole
from app.schemas.order import OrderCreate, OrderResponse, OrderUpdate, OrderSummary, ConfirmPaymentRequest, UpdateOrderStatusRequest
from app.routes.auth import get_current_user
from app.models.user import User

router = APIRouter()

def calculate_estimated_ready_time(stall_id: int, db: Session) -> datetime:
    stall = db.query(Stall).filter(Stall.id == stall_id).first()
    if not stall:
        return datetime.now() + timedelta(minutes=15)

    active_orders_count = db.query(QueueEntry).filter(
        QueueEntry.stall_id == stall_id,
        QueueEntry.status.in_([QueueStatus.WAITING, QueueStatus.PREPARING])
    ).count()

    base_time = stall.avg_prep_time
    queue_delay = active_orders_count * (base_time // 2)

    return datetime.now() + timedelta(minutes=base_time + queue_delay)

@router.post("/", response_model=OrderResponse)
def create_order(
    order: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    stall = db.query(Stall).filter(Stall.id == order.stall_id).first()
    if not stall:
        raise HTTPException(status_code=404, detail="Stall not found")

    if not stall.is_open:
        raise HTTPException(status_code=400, detail="Stall is currently closed")

    total_amount = 0
    order_items = []

    for item in order.items:
        menu_item = db.query(MenuItem).filter(MenuItem.id == item.menu_item_id).first()
        if not menu_item:
            raise HTTPException(status_code=404, detail=f"Menu item {item.menu_item_id} not found")
        if menu_item.stall_id != order.stall_id:
            raise HTTPException(status_code=400, detail=f"Menu item {menu_item.name} is not from this stall")
        if not menu_item.is_available:
            raise HTTPException(status_code=400, detail=f"{menu_item.name} is not available")

        item_total = menu_item.price * item.quantity
        total_amount += item_total

        order_item = OrderItem(
            menu_item_id=item.menu_item_id,
            quantity=item.quantity,
            unit_price=menu_item.price,
            special_requests=item.special_requests
        )
        order_items.append(order_item)

    current_queue_length = db.query(QueueEntry).filter(
        QueueEntry.stall_id == order.stall_id,
        QueueEntry.status.in_([QueueStatus.WAITING, QueueStatus.PREPARING])
    ).count()

    queue_number = current_queue_length + 1

    db_order = Order(
        user_id=current_user.id,
        stall_id=order.stall_id,
        total_amount=total_amount,
        queue_number=queue_number,
        pickup_window_start=order.pickup_window_start,
        pickup_window_end=order.pickup_window_end,
        payment_method=order.payment_method,
        payment_status=PaymentStatus.PENDING,
        status=OrderStatus.PENDING_PAYMENT,
        special_instructions=order.special_instructions,
        order_items=order_items
    )

    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    db_order.order_number = f"ORD{db_order.id:05d}"

    estimated_wait_time = stall.avg_prep_time + (current_queue_length * 3)

    queue_entry = QueueEntry(
        stall_id=order.stall_id,
        order_id=db_order.id,
        queue_position=queue_number,
        estimated_wait_time=estimated_wait_time,
        status=QueueStatus.WAITING
    )
    db.add(queue_entry)
    db.commit()

    return db_order

@router.get("/", response_model=List[OrderSummary])
def get_user_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    orders = db.query(Order).options(
        joinedload(Order.stall)
    ).filter(Order.user_id == current_user.id).order_by(Order.created_at.desc()).all()

    order_summaries = []
    for order in orders:
        estimated_ready_time = None
        if order.status in [OrderStatus.PENDING_PAYMENT, OrderStatus.CONFIRMED, OrderStatus.PREPARING]:
            estimated_ready_time = calculate_estimated_ready_time(order.stall_id, db)

        order_summaries.append(OrderSummary(
            id=order.id,
            stall_id=order.stall_id,
            stall_name=order.stall.name,
            status=order.status,
            payment_status=order.payment_status,
            total_amount=order.total_amount,
            queue_number=order.queue_number,
            order_number=order.order_number,
            pickup_window_start=order.pickup_window_start,
            pickup_window_end=order.pickup_window_end,
            created_at=order.created_at,
            estimated_ready_time=estimated_ready_time
        ))

    return order_summaries

@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = db.query(Order).options(
        joinedload(Order.order_items).joinedload(OrderItem.menu_item),
        joinedload(Order.stall)
    ).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if (order.user_id != current_user.id and
        current_user.role not in [UserRole.ADMIN] and
        (not order.stall.owner_id or order.stall.owner_id != current_user.id)):
        raise HTTPException(status_code=403, detail="Not authorized to view this order")

    return order

@router.get("/user/{user_id}", response_model=List[OrderSummary])
def get_user_order_history(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.id != user_id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to view this user's orders")

    orders = db.query(Order).options(
        joinedload(Order.stall)
    ).filter(Order.user_id == user_id).order_by(Order.created_at.desc()).all()

    order_summaries = []
    for order in orders:
        estimated_ready_time = None
        if order.status in [OrderStatus.PENDING_PAYMENT, OrderStatus.CONFIRMED, OrderStatus.PREPARING]:
            estimated_ready_time = calculate_estimated_ready_time(order.stall_id, db)

        order_summaries.append(OrderSummary(
            id=order.id,
            stall_id=order.stall_id,
            stall_name=order.stall.name,
            status=order.status,
            payment_status=order.payment_status,
            total_amount=order.total_amount,
            queue_number=order.queue_number,
            order_number=order.order_number,
            pickup_window_start=order.pickup_window_start,
            pickup_window_end=order.pickup_window_end,
            created_at=order.created_at,
            estimated_ready_time=estimated_ready_time
        ))

    return order_summaries

@router.put("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: int,
    status_update: OrderUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if (current_user.role not in [UserRole.ADMIN] and
        (not order.stall.owner_id or order.stall.owner_id != current_user.id)):
        raise HTTPException(status_code=403, detail="Not authorized to update this order")

    old_status = order.status
    order.status = status_update.status

    queue_entry = db.query(QueueEntry).filter(QueueEntry.order_id == order_id).first()
    if queue_entry:
        if status_update.status == OrderStatus.CONFIRMED:
            queue_entry.status = QueueStatus.WAITING
        elif status_update.status == OrderStatus.PREPARING:
            queue_entry.status = QueueStatus.PREPARING
        elif status_update.status == OrderStatus.READY:
            queue_entry.status = QueueStatus.READY
            queue_entry.ready_at = datetime.now()
        elif status_update.status == OrderStatus.COMPLETED:
            queue_entry.status = QueueStatus.COLLECTED
            queue_entry.collected_at = datetime.now()
        elif status_update.status == OrderStatus.CANCELLED:
            queue_entry.status = QueueStatus.CANCELLED

    db.commit()
    db.refresh(order)
    return order

@router.delete("/{order_id}")
def cancel_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to cancel this order")

    if order.status not in [OrderStatus.PENDING_PAYMENT, OrderStatus.CONFIRMED]:
        raise HTTPException(status_code=400, detail="Cannot cancel order in current status")

    order.status = OrderStatus.CANCELLED
    order.payment_status = PaymentStatus.FAILED

    queue_entry = db.query(QueueEntry).filter(QueueEntry.order_id == order_id).first()
    if queue_entry:
        queue_entry.status = QueueStatus.CANCELLED

    db.commit()
    return {"message": "Order cancelled successfully"}

# Stall Owner Endpoints

@router.get("/stall/{stall_id}/orders", response_model=List[OrderResponse])
def get_stall_orders(
    stall_id: int,
    status: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all orders for a specific stall (Stall Owner only)"""
    stall = db.query(Stall).filter(Stall.id == stall_id).first()
    if not stall:
        raise HTTPException(status_code=404, detail="Stall not found")

    # Check authorization
    if current_user.role not in [UserRole.ADMIN, UserRole.STALL_OWNER]:
        raise HTTPException(status_code=403, detail="Not authorized")

    if current_user.role == UserRole.STALL_OWNER and stall.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this stall's orders")

    query = db.query(Order).options(
        joinedload(Order.order_items).joinedload(OrderItem.menu_item),
        joinedload(Order.user)
    ).filter(Order.stall_id == stall_id)

    # Filter by status if provided
    if status:
        try:
            status_enum = OrderStatus(status)
            query = query.filter(Order.status == status_enum)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid status value")

    orders = query.order_by(Order.created_at.desc()).all()
    return orders

@router.put("/{order_id}/confirm-payment", response_model=OrderResponse)
def confirm_payment(
    order_id: int,
    payment_request: ConfirmPaymentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Confirm payment for an order (Stall Owner only)"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    stall = db.query(Stall).filter(Stall.id == order.stall_id).first()
    if current_user.role not in [UserRole.ADMIN] and stall.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to confirm payment for this order")

    if order.status != OrderStatus.PENDING_PAYMENT:
        raise HTTPException(status_code=400, detail="Order is not in pending payment status")

    if payment_request.payment_confirmed:
        order.payment_status = PaymentStatus.CONFIRMED
        order.status = OrderStatus.CONFIRMED
    else:
        order.payment_status = PaymentStatus.FAILED
        order.status = OrderStatus.CANCELLED

    db.commit()
    db.refresh(order)
    return order

@router.put("/{order_id}/start-preparing", response_model=OrderResponse)
def start_preparing_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark order as preparing (Stall Owner only)"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    stall = db.query(Stall).filter(Stall.id == order.stall_id).first()
    if current_user.role not in [UserRole.ADMIN] and stall.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    if order.status != OrderStatus.CONFIRMED:
        raise HTTPException(status_code=400, detail="Order must be confirmed before preparing")

    order.status = OrderStatus.PREPARING

    queue_entry = db.query(QueueEntry).filter(QueueEntry.order_id == order_id).first()
    if queue_entry:
        queue_entry.status = QueueStatus.PREPARING

    db.commit()
    db.refresh(order)
    return order

@router.put("/{order_id}/mark-ready", response_model=OrderResponse)
def mark_order_ready(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark order as ready for pickup (Stall Owner only)"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    stall = db.query(Stall).filter(Stall.id == order.stall_id).first()
    if current_user.role not in [UserRole.ADMIN] and stall.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    if order.status != OrderStatus.PREPARING:
        raise HTTPException(status_code=400, detail="Order must be preparing before marking as ready")

    order.status = OrderStatus.READY

    queue_entry = db.query(QueueEntry).filter(QueueEntry.order_id == order_id).first()
    if queue_entry:
        queue_entry.status = QueueStatus.READY
        queue_entry.ready_at = datetime.now()

    db.commit()
    db.refresh(order)
    return order

@router.put("/{order_id}/mark-completed", response_model=OrderResponse)
def mark_order_completed(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark order as completed/collected (Stall Owner only)"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    stall = db.query(Stall).filter(Stall.id == order.stall_id).first()
    if current_user.role not in [UserRole.ADMIN] and stall.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    if order.status != OrderStatus.READY:
        raise HTTPException(status_code=400, detail="Order must be ready before marking as completed")

    order.status = OrderStatus.COMPLETED

    queue_entry = db.query(QueueEntry).filter(QueueEntry.order_id == order_id).first()
    if queue_entry:
        queue_entry.status = QueueStatus.COLLECTED
        queue_entry.collected_at = datetime.now()

    db.commit()
    db.refresh(order)
    return order