from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models.queue import QueueStatus

class QueueJoinRequest(BaseModel):
    order_id: int = Field(..., gt=0)

class QueueStatusUpdate(BaseModel):
    status: QueueStatus

class QueueEntryResponse(BaseModel):
    id: int
    order_id: int
    stall_id: int
    queue_position: int
    status: QueueStatus
    estimated_wait_time: Optional[int] = None
    joined_at: datetime
    ready_at: Optional[datetime] = None
    collected_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class QueuePositionResponse(BaseModel):
    order_id: int
    stall_id: int
    queue_position: int
    estimated_wait_time: Optional[int] = None
    orders_ahead: int
    status: QueueStatus
    joined_at: datetime
    estimated_ready_time: Optional[datetime] = None

class StallQueueResponse(BaseModel):
    stall_id: int
    stall_name: str
    current_queue_length: int
    estimated_wait_time: Optional[int] = None
    queue_entries: List[QueueEntryResponse] = []

class QueueUpdateRequest(BaseModel):
    completed_order_ids: List[int] = Field(..., description="List of order IDs that have been completed")