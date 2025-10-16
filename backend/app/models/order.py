from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Enum, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.database import Base
import enum

class OrderStatus(enum.Enum):
    PENDING_PAYMENT = "pending_payment"  # Order placed, awaiting payment confirmation
    CONFIRMED = "confirmed"              # Payment confirmed, in queue
    PREPARING = "preparing"              # Being prepared by stall
    READY = "ready"                      # Ready for pickup
    COMPLETED = "completed"              # Collected by student
    CANCELLED = "cancelled"              # Cancelled by student or stall

class PaymentStatus(enum.Enum):
    PENDING = "pending"                  # Awaiting payment
    CONFIRMED = "confirmed"              # Payment received
    FAILED = "failed"                    # Payment failed

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    stall_id = Column(Integer, ForeignKey("stalls.id"), nullable=False)
    total_amount = Column(Float, nullable=False)
    status = Column(Enum(OrderStatus, name='order_status', values_callable=lambda x: [e.value for e in x]), default=OrderStatus.PENDING_PAYMENT)
    payment_status = Column(Enum(PaymentStatus, name='payment_status', values_callable=lambda x: [e.value for e in x]), default=PaymentStatus.PENDING)
    payment_method = Column(String, default="paynow")  # paynow, cash, card
    queue_number = Column(Integer)
    pickup_window_start = Column(DateTime)  # Start of pickup window
    pickup_window_end = Column(DateTime)    # End of pickup window
    order_number = Column(String, unique=True, index=True)
    special_instructions = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="orders")
    stall = relationship("Stall", back_populates="orders")
    order_items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    queue_entry = relationship("QueueEntry", back_populates="order", uselist=False)

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    menu_item_id = Column(Integer, ForeignKey("menu_items.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    special_requests = Column(Text)

    order = relationship("Order", back_populates="order_items")
    menu_item = relationship("MenuItem", back_populates="order_items")