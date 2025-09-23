from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.database import get_db
from app.models.order import Order, OrderItem, OrderStatus
from app.models.menu import MenuItem
from app.schemas.order import OrderCreate, OrderResponse, OrderUpdate
from app.routes.auth import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/", response_model=OrderResponse)
def create_order(
    order: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    total_amount = 0
    order_items = []

    for item in order.items:
        menu_item = db.query(MenuItem).filter(MenuItem.id == item.menu_item_id).first()
        if not menu_item:
            raise HTTPException(status_code=404, detail=f"Menu item {item.menu_item_id} not found")
        if not menu_item.is_available:
            raise HTTPException(status_code=400, detail=f"{menu_item.name} is not available")

        item_total = menu_item.price * item.quantity
        total_amount += item_total

        order_item = OrderItem(
            menu_item_id=item.menu_item_id,
            quantity=item.quantity,
            price=menu_item.price,
            special_requests=item.special_requests
        )
        order_items.append(order_item)

    db_order = Order(
        user_id=current_user.id,
        stall_id=order.stall_id,
        total_amount=total_amount,
        pickup_time=order.pickup_time,
        special_instructions=order.special_instructions,
        order_items=order_items
    )

    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    db_order.order_number = f"ORD{db_order.id:05d}"
    db.commit()

    return db_order

@router.get("/", response_model=List[OrderResponse])
def get_user_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    orders = db.query(Order).filter(Order.user_id == current_user.id).all()
    return orders

@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.user_id != current_user.id and order.stall.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this order")

    return order

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

    if order.stall.owner_id != current_user.id and order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this order")

    order.status = status_update.status
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

    if order.status not in [OrderStatus.PENDING, OrderStatus.ACCEPTED]:
        raise HTTPException(status_code=400, detail="Cannot cancel order in current status")

    order.status = OrderStatus.CANCELLED
    db.commit()
    return {"message": "Order cancelled successfully"}