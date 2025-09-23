from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database.database import Base

class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True, index=True)
    stall_id = Column(Integer, ForeignKey("stalls.id"), nullable=False)
    name = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    prep_time = Column(Integer, default=10)
    category = Column(String)
    is_available = Column(Boolean, default=True)
    description = Column(Text)
    image_url = Column(String)
    is_vegetarian = Column(Boolean, default=False)
    is_halal = Column(Boolean, default=True)

    stall = relationship("Stall", back_populates="menu_items")
    order_items = relationship("OrderItem", back_populates="menu_item")