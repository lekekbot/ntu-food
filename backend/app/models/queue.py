from sqlalchemy import Column, Integer, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.database import Base
import enum

class QueueStatus(enum.Enum):
    WAITING = "waiting"
    PREPARING = "preparing"
    READY = "ready"
    COLLECTED = "collected"
    CANCELLED = "cancelled"

class QueueEntry(Base):
    __tablename__ = "queue_entries"

    id = Column(Integer, primary_key=True, index=True)
    stall_id = Column(Integer, ForeignKey("stalls.id"), nullable=False)
    order_id = Column(Integer, ForeignKey("orders.id"), unique=True, nullable=False)
    queue_position = Column(Integer, nullable=False)
    estimated_wait_time = Column(Integer)
    status = Column(Enum(QueueStatus, name='queue_status', values_callable=lambda x: [e.value for e in x]), default=QueueStatus.WAITING)
    joined_at = Column(DateTime, default=datetime.utcnow)
    ready_at = Column(DateTime)
    collected_at = Column(DateTime)

    order = relationship("Order", back_populates="queue_entry")
    stall = relationship("Stall", back_populates="queue_entries")