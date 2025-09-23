from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from datetime import datetime, timedelta
from app.database.database import get_db
from app.models.queue import QueueEntry, QueueStatus
from app.models.order import Order, OrderStatus
from app.models.stall import Stall
from app.models.user import UserRole
from app.schemas.queue import (
    QueueJoinRequest, QueueEntryResponse, QueueStatusUpdate,
    QueuePositionResponse, StallQueueResponse, QueueUpdateRequest
)
from app.routes.auth import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/{stall_id}", response_model=StallQueueResponse)
def get_stall_queue(stall_id: int, db: Session = Depends(get_db)):
    stall = db.query(Stall).filter(Stall.id == stall_id).first()
    if not stall:
        raise HTTPException(status_code=404, detail="Stall not found")

    queue_entries = db.query(QueueEntry).options(
        joinedload(QueueEntry.order).joinedload(Order.user)
    ).filter(
        QueueEntry.stall_id == stall_id,
        QueueEntry.status.in_([QueueStatus.WAITING, QueueStatus.PREPARING, QueueStatus.READY])
    ).order_by(QueueEntry.queue_position).all()

    total_estimated_time = sum(entry.estimated_wait_time or 0 for entry in queue_entries)

    return StallQueueResponse(
        stall_id=stall_id,
        stall_name=stall.name,
        current_queue_length=len(queue_entries),
        estimated_wait_time=total_estimated_time,
        queue_entries=queue_entries
    )

@router.post("/join", response_model=QueueEntryResponse)
def join_queue(
    queue_request: QueueJoinRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == queue_request.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized for this order")

    if order.status not in [OrderStatus.PENDING, OrderStatus.ACCEPTED]:
        raise HTTPException(status_code=400, detail="Order cannot be added to queue in current status")

    existing_entry = db.query(QueueEntry).filter(QueueEntry.order_id == queue_request.order_id).first()
    if existing_entry:
        raise HTTPException(status_code=400, detail="Order already in queue")

    stall = db.query(Stall).filter(Stall.id == order.stall_id).first()
    if not stall:
        raise HTTPException(status_code=404, detail="Stall not found")

    current_queue_length = db.query(QueueEntry).filter(
        QueueEntry.stall_id == order.stall_id,
        QueueEntry.status.in_([QueueStatus.WAITING, QueueStatus.PREPARING])
    ).count()

    next_position = current_queue_length + 1
    estimated_wait_time = stall.avg_prep_time + (current_queue_length * 3)

    db_queue_entry = QueueEntry(
        order_id=order.id,
        stall_id=order.stall_id,
        queue_position=next_position,
        estimated_wait_time=estimated_wait_time,
        status=QueueStatus.WAITING
    )

    db.add(db_queue_entry)
    db.commit()
    db.refresh(db_queue_entry)
    return db_queue_entry

@router.get("/position/{order_id}", response_model=QueuePositionResponse)
def get_queue_position(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    queue_entry = db.query(QueueEntry).options(
        joinedload(QueueEntry.order)
    ).filter(QueueEntry.order_id == order_id).first()

    if not queue_entry:
        raise HTTPException(status_code=404, detail="Order not in queue")

    if queue_entry.order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this queue position")

    orders_ahead = db.query(QueueEntry).filter(
        QueueEntry.stall_id == queue_entry.stall_id,
        QueueEntry.queue_position < queue_entry.queue_position,
        QueueEntry.status.in_([QueueStatus.WAITING, QueueStatus.PREPARING])
    ).count()

    estimated_ready_time = None
    if queue_entry.estimated_wait_time:
        estimated_ready_time = queue_entry.joined_at + timedelta(minutes=queue_entry.estimated_wait_time)

    return QueuePositionResponse(
        order_id=order_id,
        stall_id=queue_entry.stall_id,
        queue_position=queue_entry.queue_position,
        estimated_wait_time=queue_entry.estimated_wait_time,
        orders_ahead=orders_ahead,
        status=queue_entry.status,
        joined_at=queue_entry.joined_at,
        estimated_ready_time=estimated_ready_time
    )

@router.put("/{queue_id}/status", response_model=QueueEntryResponse)
def update_queue_status(
    queue_id: int,
    status_update: QueueStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    queue_entry = db.query(QueueEntry).options(
        joinedload(QueueEntry.order),
        joinedload(QueueEntry.stall)
    ).filter(QueueEntry.id == queue_id).first()

    if not queue_entry:
        raise HTTPException(status_code=404, detail="Queue entry not found")

    if (current_user.role not in [UserRole.ADMIN] and
        queue_entry.stall.owner_id != current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized to update this queue")

    queue_entry.status = status_update.status

    if status_update.status == QueueStatus.PREPARING:
        queue_entry.order.status = OrderStatus.PREPARING
    elif status_update.status == QueueStatus.READY:
        queue_entry.ready_at = datetime.now()
        queue_entry.order.status = OrderStatus.READY
    elif status_update.status == QueueStatus.COLLECTED:
        queue_entry.collected_at = datetime.now()
        queue_entry.order.status = OrderStatus.COMPLETED
    elif status_update.status == QueueStatus.CANCELLED:
        queue_entry.order.status = OrderStatus.CANCELLED

    db.commit()
    db.refresh(queue_entry)
    return queue_entry

@router.put("/update", response_model=dict)
def update_queue_positions(
    update_request: QueueUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in [UserRole.STALL_OWNER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized to update queue positions")

    completed_orders = []
    stall_ids = set()

    for order_id in update_request.completed_order_ids:
        queue_entry = db.query(QueueEntry).options(
            joinedload(QueueEntry.order),
            joinedload(QueueEntry.stall)
        ).filter(QueueEntry.order_id == order_id).first()

        if not queue_entry:
            continue

        if (current_user.role != UserRole.ADMIN and
            queue_entry.stall.owner_id != current_user.id):
            continue

        queue_entry.status = QueueStatus.COLLECTED
        queue_entry.collected_at = datetime.now()
        queue_entry.order.status = OrderStatus.COMPLETED

        completed_orders.append(order_id)
        stall_ids.add(queue_entry.stall_id)

    for stall_id in stall_ids:
        remaining_entries = db.query(QueueEntry).filter(
            QueueEntry.stall_id == stall_id,
            QueueEntry.status.in_([QueueStatus.WAITING, QueueStatus.PREPARING, QueueStatus.READY])
        ).order_by(QueueEntry.queue_position).all()

        for i, entry in enumerate(remaining_entries):
            entry.queue_position = i + 1

    db.commit()

    return {
        "message": f"Updated {len(completed_orders)} orders",
        "completed_orders": completed_orders,
        "updated_stalls": list(stall_ids)
    }