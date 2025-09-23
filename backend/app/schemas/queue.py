from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.queue import QueueStatus

class QueueEntryCreate(BaseModel):
    order_id: int
    estimated_wait_time: Optional[int] = None

class QueueStatusUpdate(BaseModel):
    status: QueueStatus

class QueueEntryResponse(BaseModel):
    id: int
    order_id: int
    stall_id: int
    queue_number: int
    status: QueueStatus
    estimated_wait_time: Optional[int] = None
    joined_at: datetime
    ready_at: Optional[datetime] = None
    collected_at: Optional[datetime] = None

    class Config:
        from_attributes = True