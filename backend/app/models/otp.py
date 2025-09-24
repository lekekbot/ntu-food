from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.database.database import Base
from datetime import datetime, timedelta

class OTPVerification(Base):
    __tablename__ = "otp_verifications"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    otp_code = Column(String, nullable=False)

    # Temporary registration data
    student_id = Column(String, nullable=False)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    dietary_preferences = Column(String, default="")
    hashed_password = Column(String, nullable=False)

    # OTP metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)
    attempts = Column(Integer, default=0)
    is_used = Column(Boolean, default=False)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Set expiry to 10 minutes from creation
        if not self.expires_at:
            self.expires_at = datetime.utcnow() + timedelta(minutes=10)

    def is_expired(self):
        return datetime.utcnow() > self.expires_at

    def is_valid(self):
        return not self.is_used and not self.is_expired() and self.attempts < 5