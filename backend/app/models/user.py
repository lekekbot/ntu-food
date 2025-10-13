from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.database import Base
import enum

class UserRole(enum.Enum):
    STUDENT = "student"
    STALL_OWNER = "stall_owner"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    ntu_email = Column(String, unique=True, index=True, nullable=False)
    student_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    dietary_preferences = Column(Text)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole, name='user_role', values_callable=lambda x: [e.value for e in x]), default=UserRole.STUDENT)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    orders = relationship("Order", back_populates="user")
    owned_stalls = relationship("Stall", back_populates="owner")