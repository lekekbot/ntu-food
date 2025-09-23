from pydantic import BaseModel
from typing import Optional
from datetime import time

class StallBase(BaseModel):
    name: str
    description: Optional[str] = None
    location: str
    cuisine_type: Optional[str] = None
    image_url: Optional[str] = None
    opening_time: Optional[time] = None
    closing_time: Optional[time] = None

class StallCreate(StallBase):
    pass

class StallUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    cuisine_type: Optional[str] = None
    image_url: Optional[str] = None
    is_open: Optional[bool] = None
    opening_time: Optional[time] = None
    closing_time: Optional[time] = None

class StallResponse(StallBase):
    id: int
    is_open: bool
    rating: float
    owner_id: int

    class Config:
        from_attributes = True