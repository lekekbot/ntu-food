from pydantic import BaseModel
from typing import Optional

class MenuItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    category: Optional[str] = None
    image_url: Optional[str] = None
    is_vegetarian: bool = False
    is_halal: bool = True
    preparation_time: int = 10

class MenuItemCreate(MenuItemBase):
    stall_id: int

class MenuItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    is_available: Optional[bool] = None
    is_vegetarian: Optional[bool] = None
    is_halal: Optional[bool] = None
    preparation_time: Optional[int] = None

class MenuItemResponse(MenuItemBase):
    id: int
    stall_id: int
    is_available: bool

    class Config:
        from_attributes = True