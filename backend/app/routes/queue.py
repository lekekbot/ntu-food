from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.database import get_db
from app.models.queue import QueueEntry, QueueStatus
from app.models.order import Order
from app.schemas.queue import QueueEntryCreate, QueueEntryResponse, QueueStatusUpdate
from app.routes.auth import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/stall/{stall_id}", response_model=List[QueueEntryResponse])
def get_stall_queue(stall_id: int, db: Session = Depends(get_db)):
    queue_entries = db.query(QueueEntry).filter(
        QueueEntry.stall_id == stall_id,
        QueueEntry.status.in_([QueueStatus.WAITING, QueueStatus.PREPARING])
    ).order_by(QueueEntry.queue_number).all()
    return queue_entries

@router.post("/join", response_model=QueueEntryResponse)
def join_queue(
    queue_entry: QueueEntryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == queue_entry.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized for this order")

    existing_entry = db.query(QueueEntry).filter(QueueEntry.order_id == queue_entry.order_id).first()
    if existing_entry:
        raise HTTPException(status_code=400, detail="Order already in queue")

    last_queue_number = db.query(QueueEntry).filter(
        QueueEntry.stall_id == order.stall_id
    ).order_by(QueueEntry.queue_number.desc()).first()

    next_queue_number = (last_queue_number.queue_number + 1) if last_queue_number else 1

    db_queue_entry = QueueEntry(
        order_id=order.id,
        stall_id=order.stall_id,
        queue_number=next_queue_number,
        estimated_wait_time=queue_entry.estimated_wait_time
    )

    db.add(db_queue_entry)
    db.commit()
    db.refresh(db_queue_entry)
    return db_queue_entry

@router.get("/position/{order_id}")
def get_queue_position(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    queue_entry = db.query(QueueEntry).filter(QueueEntry.order_id == order_id).first()
    if not queue_entry:
        raise HTTPException(status_code=404, detail="Order not in queue")

    if queue_entry.order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this queue position")

    position = db.query(QueueEntry).filter(
        QueueEntry.stall_id == queue_entry.stall_id,
        QueueEntry.queue_number < queue_entry.queue_number,
        QueueEntry.status.in_([QueueStatus.WAITING, QueueStatus.PREPARING])
    ).count()

    return {
        "queue_number": queue_entry.queue_number,
        "position": position + 1,
        "status": queue_entry.status,
        "estimated_wait_time": queue_entry.estimated_wait_time
    }

@router.put("/{queue_id}/status", response_model=QueueEntryResponse)
def update_queue_status(
    queue_id: int,
    status_update: QueueStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    queue_entry = db.query(QueueEntry).filter(QueueEntry.id == queue_id).first()
    if not queue_entry:
        raise HTTPException(status_code=404, detail="Queue entry not found")

    if queue_entry.stall.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this queue")

    queue_entry.status = status_update.status
    if status_update.status == QueueStatus.READY:
        from datetime import datetime
        queue_entry.ready_at = datetime.utcnow()
    elif status_update.status == QueueStatus.COLLECTED:
        from datetime import datetime
        queue_entry.collected_at = datetime.utcnow()

    db.commit()
    db.refresh(queue_entry)
    return queue_entry