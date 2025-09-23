from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Float, Time
from sqlalchemy.orm import relationship
from app.database.database import Base

class Stall(Base):
    __tablename__ = "stalls"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    location = Column(String, nullable=False)
    cuisine_type = Column(String)
    image_url = Column(String)
    is_open = Column(Boolean, default=True)
    rating = Column(Float, default=0.0)
    opening_time = Column(Time)
    closing_time = Column(Time)
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="owned_stalls")
    menu_items = relationship("MenuItem", back_populates="stall", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="stall")
    queue_entries = relationship("QueueEntry", back_populates="stall")