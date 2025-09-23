from pydantic import BaseModel, EmailStr
from typing import Optional

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    full_name: str
    password: str
    phone_number: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    full_name: str
    phone_number: Optional[str] = None
    is_active: bool
    is_verified: bool

    class Config:
        from_attributes = True