from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.order import OrderStatus

class OrderItemBase(BaseModel):
    menu_item_id: int
    quantity: int
    special_requests: Optional[str] = None

class OrderItemResponse(OrderItemBase):
    id: int
    price: float

    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    stall_id: int
    items: List[OrderItemBase]
    pickup_time: Optional[datetime] = None
    special_instructions: Optional[str] = None

class OrderUpdate(BaseModel):
    status: OrderStatus

class OrderResponse(BaseModel):
    id: int
    user_id: int
    stall_id: int
    status: OrderStatus
    total_amount: float
    order_number: Optional[str] = None
    pickup_time: Optional[datetime] = None
    special_instructions: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    order_items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True