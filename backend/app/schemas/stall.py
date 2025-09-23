from pydantic import BaseModel
from typing import Optional
from datetime import time

class StallBase(BaseModel):
    name: str
    location: str
    opening_time: Optional[time] = None
    closing_time: Optional[time] = None
    avg_prep_time: int = 15
    max_concurrent_orders: int = 10
    description: Optional[str] = None
    cuisine_type: Optional[str] = None
    image_url: Optional[str] = None

class StallCreate(StallBase):
    pass

class StallUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    opening_time: Optional[time] = None
    closing_time: Optional[time] = None
    avg_prep_time: Optional[int] = None
    max_concurrent_orders: Optional[int] = None
    description: Optional[str] = None
    cuisine_type: Optional[str] = None
    image_url: Optional[str] = None
    is_open: Optional[bool] = None

class StallResponse(StallBase):
    id: int
    is_open: bool
    rating: float
    owner_id: int

    class Config:
        from_attributes = True