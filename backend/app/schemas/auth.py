from pydantic import BaseModel, EmailStr, validator, Field
from typing import Optional
import re
from app.models.user import UserRole

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    student_id: Optional[str] = None

class LoginRequest(BaseModel):
    ntu_email: EmailStr
    password: str

class UserCreate(BaseModel):
    ntu_email: EmailStr
    student_id: str = Field(..., min_length=8, max_length=15, description="Student ID (e.g., U1234567A)")
    name: str = Field(..., min_length=2, max_length=100)
    phone: str = Field(..., pattern=r"^\+65[689]\d{7}$", description="Singapore phone number (+65XXXXXXXX)")
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters")
    dietary_preferences: Optional[str] = Field(None, max_length=500)

    @validator('ntu_email')
    def validate_ntu_email(cls, v):
        email_str = str(v)
        if not email_str.endswith('@e.ntu.edu.sg'):
            raise ValueError('Email must be a valid NTU email address (@e.ntu.edu.sg)')
        return v

    @validator('student_id')
    def validate_student_id(cls, v):
        if not re.match(r'^[US]\d{7}[A-Z]$', v.upper()):
            raise ValueError('Student ID must be in format U1234567A or S1234567A')
        return v.upper()

    @validator('phone')
    def validate_phone(cls, v):
        if not re.match(r'^\+65[689]\d{7}$', v):
            raise ValueError('Phone number must be a valid Singapore number (+65XXXXXXXX)')
        return v

class UserResponse(BaseModel):
    id: int
    ntu_email: str
    student_id: str
    name: str
    phone: str
    dietary_preferences: Optional[str] = None
    role: UserRole
    is_active: bool
    is_verified: bool

    class Config:
        from_attributes = True

class UserProfile(BaseModel):
    id: int
    ntu_email: str
    student_id: str
    name: str
    phone: str
    dietary_preferences: Optional[str] = None
    role: UserRole
    is_active: bool
    is_verified: bool

    class Config:
        from_attributes = True