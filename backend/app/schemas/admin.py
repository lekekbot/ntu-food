from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, time
from app.models.user import UserRole
from app.models.order import OrderStatus

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    dietary_preferences: Optional[str] = None
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None
    role: Optional[UserRole] = None
    password: Optional[str] = None

class UserListResponse(BaseModel):
    id: int
    ntu_email: str
    student_id: str
    name: str
    phone: str
    role: UserRole
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class StallCreate(BaseModel):
    name: str
    location: str
    opening_time: Optional[time] = None
    closing_time: Optional[time] = None
    avg_prep_time: int = 15
    max_concurrent_orders: int = 10
    description: Optional[str] = None
    cuisine_type: Optional[str] = None
    image_url: Optional[str] = None
    is_open: bool = True
    owner_id: Optional[int] = None

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
    rating: Optional[float] = None
    owner_id: Optional[int] = None

class StallListResponse(BaseModel):
    id: int
    name: str
    location: str
    opening_time: Optional[time]
    closing_time: Optional[time]
    avg_prep_time: int
    max_concurrent_orders: int
    description: Optional[str]
    cuisine_type: Optional[str]
    image_url: Optional[str]
    is_open: bool
    rating: float
    owner_id: Optional[int]

    class Config:
        from_attributes = True

class MenuItemCreate(BaseModel):
    stall_id: int
    name: str
    description: Optional[str] = None
    price: float
    category: Optional[str] = None
    image_url: Optional[str] = None
    is_available: bool = True
    preparation_time: int = 10

class MenuItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    is_available: Optional[bool] = None
    preparation_time: Optional[int] = None

class MenuItemResponse(BaseModel):
    id: int
    stall_id: int
    name: str
    description: Optional[str]
    price: float
    category: Optional[str]
    image_url: Optional[str]
    is_available: bool
    preparation_time: int

    class Config:
        from_attributes = True

class OrderStatusUpdate(BaseModel):
    status: OrderStatus

class OrderItemResponse(BaseModel):
    id: int
    menu_item_id: int
    quantity: int
    unit_price: float
    special_requests: Optional[str]

    class Config:
        from_attributes = True

class OrderListResponse(BaseModel):
    id: int
    order_number: str
    user_id: int
    stall_id: int
    status: OrderStatus
    total_amount: float
    pickup_time: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DashboardStats(BaseModel):
    total_users: int
    active_users: int
    total_stalls: int
    total_orders: int
    active_orders: int
    total_revenue: float
    today_orders: int
    today_revenue: float

class AnalyticsResponse(BaseModel):
    dashboard_stats: DashboardStats