from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from app.models.order import OrderStatus, PaymentStatus

class OrderItemCreate(BaseModel):
    menu_item_id: int = Field(..., gt=0)
    quantity: int = Field(..., gt=0, le=10, description="Quantity must be between 1 and 10")
    special_requests: Optional[str] = Field(None, max_length=200)

class MenuItemBasic(BaseModel):
    id: int
    name: str
    price: float

    class Config:
        from_attributes = True

class StallBasic(BaseModel):
    id: int
    name: str
    location: str

    class Config:
        from_attributes = True

class OrderItemResponse(BaseModel):
    id: int
    menu_item_id: int
    quantity: int
    unit_price: float
    special_requests: Optional[str] = None

    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    stall_id: int = Field(..., gt=0)
    items: List[OrderItemCreate] = Field(..., min_items=1, max_items=20)
    pickup_window_start: datetime = Field(..., description="Start of pickup time window")
    pickup_window_end: datetime = Field(..., description="End of pickup time window")
    payment_method: Optional[str] = Field("paynow", description="Payment method: paynow, cash, card")
    special_instructions: Optional[str] = Field(None, max_length=500)

    @validator('items')
    def validate_items(cls, v):
        if not v:
            raise ValueError('Order must contain at least one item')
        return v

    @validator('pickup_window_start')
    def validate_pickup_window_start(cls, v):
        if v <= datetime.now():
            raise ValueError('Pickup time must be in the future')
        return v

    @validator('pickup_window_end')
    def validate_pickup_window_end(cls, v, values):
        if 'pickup_window_start' in values and v <= values['pickup_window_start']:
            raise ValueError('Pickup window end must be after pickup window start')
        return v

class OrderUpdate(BaseModel):
    status: OrderStatus

class OrderResponse(BaseModel):
    id: int
    user_id: int
    stall_id: int
    status: OrderStatus
    payment_status: PaymentStatus
    payment_method: str
    total_amount: float
    queue_number: Optional[int] = None
    order_number: Optional[str] = None
    pickup_window_start: Optional[datetime] = None
    pickup_window_end: Optional[datetime] = None
    special_instructions: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    order_items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True

class OrderSummary(BaseModel):
    id: int
    stall_id: int
    stall_name: str
    status: OrderStatus
    payment_status: PaymentStatus
    total_amount: float
    queue_number: Optional[int] = None
    order_number: Optional[str] = None
    pickup_window_start: Optional[datetime] = None
    pickup_window_end: Optional[datetime] = None
    created_at: datetime
    estimated_ready_time: Optional[datetime] = None

    class Config:
        from_attributes = True

# Additional schemas for stall owner order management
class ConfirmPaymentRequest(BaseModel):
    payment_confirmed: bool = True

class UpdateOrderStatusRequest(BaseModel):
    status: OrderStatus