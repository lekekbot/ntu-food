from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.database.database import get_db
from app.models.user import User, UserRole
from app.models.otp import OTPVerification
from app.schemas.auth import (
    OTPRequest, OTPVerifyRequest, OTPResponse,
    ResendOTPRequest, UserResponse, Token
)
from app.services.email_service import email_service
import os
from app.utils.validators import (
    validate_ntu_email, validate_student_id,
    validate_phone, validate_password
)
from app.routes.auth import create_access_token, get_password_hash
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/register", response_model=OTPResponse)
async def register_with_otp(
    user_data: OTPRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Step 1: Register user and send OTP to their NTU email.
    """
    # Validate NTU email
    is_valid, error_msg = validate_ntu_email(user_data.ntu_email)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)

    # Validate student ID
    is_valid, error_msg = validate_student_id(user_data.student_id)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)

    # Validate password strength
    is_valid, error_msg = validate_password(user_data.password)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)

    # Check if email is already registered
    existing_user = db.query(User).filter(User.ntu_email == user_data.ntu_email.lower()).first()
    if existing_user:
        if existing_user.is_verified:
            raise HTTPException(status_code=400, detail="Email already registered and verified")
        else:
            # Delete unverified user to allow re-registration
            db.delete(existing_user)
            db.commit()

    # Check if student ID is already taken
    existing_student = db.query(User).filter(User.student_id == user_data.student_id.upper()).first()
    if existing_student:
        raise HTTPException(status_code=400, detail="Student ID already registered")

    # Check if there's an existing OTP for this email
    existing_otp = db.query(OTPVerification).filter(
        OTPVerification.email == user_data.ntu_email.lower()
    ).first()

    if existing_otp:
        # Check if we should rate limit
        if not existing_otp.is_expired() and existing_otp.created_at > datetime.utcnow() - timedelta(minutes=1):
            raise HTTPException(
                status_code=429,
                detail="Please wait at least 1 minute before requesting a new OTP"
            )
        # Delete old OTP
        db.delete(existing_otp)
        db.commit()

    # Generate OTP
    otp_code = email_service.generate_otp()

    # Store OTP and user data temporarily
    otp_verification = OTPVerification(
        email=user_data.ntu_email.lower(),
        otp_code=otp_code,
        student_id=user_data.student_id.upper(),
        name=user_data.name,
        phone=user_data.phone,
        dietary_preferences=user_data.dietary_preferences or "",
        hashed_password=get_password_hash(user_data.password)
    )
    db.add(otp_verification)
    db.commit()

    # Send OTP email in background
    background_tasks.add_task(
        email_service.send_otp_email,
        user_data.ntu_email,
        otp_code,
        user_data.name
    )

    logger.info(f"OTP sent to {user_data.ntu_email}")

    # Check if we're in testing mode
    testing_mode = os.getenv('EMAIL_TESTING_MODE', 'true').lower() == 'true'

    return OTPResponse(
        message="OTP sent successfully to your NTU email" if not testing_mode else "OTP generated for testing",
        email=user_data.ntu_email,
        expires_in_minutes=10,
        testing_otp=otp_code if testing_mode else None
    )

@router.post("/verify-otp", response_model=Token)
async def verify_otp(
    verify_data: OTPVerifyRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Step 2: Verify OTP and create the user account.
    """
    # Find OTP verification record
    otp_record = db.query(OTPVerification).filter(
        OTPVerification.email == verify_data.email.lower()
    ).first()

    if not otp_record:
        raise HTTPException(
            status_code=404,
            detail="No pending registration found for this email"
        )

    # Check if OTP is still valid
    if not otp_record.is_valid():
        if otp_record.is_expired():
            raise HTTPException(
                status_code=400,
                detail="OTP has expired. Please request a new one"
            )
        elif otp_record.is_used:
            raise HTTPException(
                status_code=400,
                detail="This OTP has already been used"
            )
        else:
            raise HTTPException(
                status_code=400,
                detail="Too many failed attempts. Please request a new OTP"
            )

    # Verify OTP code
    if otp_record.otp_code != verify_data.otp_code:
        # Increment attempts
        otp_record.attempts += 1
        db.commit()

        if otp_record.attempts >= 5:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid OTP. Maximum attempts reached. Please request a new OTP"
            )
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid OTP. {5 - otp_record.attempts} attempts remaining"
            )

    # OTP is valid, create the user
    new_user = User(
        ntu_email=otp_record.email,
        student_id=otp_record.student_id,
        name=otp_record.name,
        phone=otp_record.phone,
        dietary_preferences=otp_record.dietary_preferences,
        hashed_password=otp_record.hashed_password,
        role=UserRole.STUDENT,
        is_active=True,
        is_verified=True
    )

    # Mark OTP as used
    otp_record.is_used = True

    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        # Send welcome email in background
        background_tasks.add_task(
            email_service.send_welcome_email,
            new_user.ntu_email,
            new_user.name
        )

        # Create access token
        access_token = create_access_token(data={"sub": new_user.student_id})

        logger.info(f"User registered successfully: {new_user.ntu_email}")

        return {"access_token": access_token, "token_type": "bearer"}

    except Exception as e:
        db.rollback()
        logger.error(f"Error creating user: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while creating your account"
        )

@router.post("/resend-otp", response_model=OTPResponse)
async def resend_otp(
    resend_data: ResendOTPRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Resend OTP to the user's email.
    """
    # Find OTP verification record
    otp_record = db.query(OTPVerification).filter(
        OTPVerification.email == resend_data.email.lower()
    ).first()

    if not otp_record:
        raise HTTPException(
            status_code=404,
            detail="No pending registration found for this email"
        )

    # Check if already verified
    if otp_record.is_used:
        raise HTTPException(
            status_code=400,
            detail="This registration has already been completed"
        )

    # Rate limiting - wait at least 1 minute between resends
    if otp_record.created_at > datetime.utcnow() - timedelta(minutes=1):
        raise HTTPException(
            status_code=429,
            detail="Please wait at least 1 minute before requesting a new OTP"
        )

    # Generate new OTP
    new_otp_code = email_service.generate_otp()

    # Update OTP record
    otp_record.otp_code = new_otp_code
    otp_record.created_at = datetime.utcnow()
    otp_record.expires_at = datetime.utcnow() + timedelta(minutes=10)
    otp_record.attempts = 0  # Reset attempts

    db.commit()

    # Send OTP email in background
    background_tasks.add_task(
        email_service.send_otp_email,
        otp_record.email,
        new_otp_code,
        otp_record.name
    )

    logger.info(f"OTP resent to {otp_record.email}")

    # Check if we're in testing mode
    testing_mode = os.getenv('EMAIL_TESTING_MODE', 'true').lower() == 'true'

    return OTPResponse(
        message="New OTP sent successfully to your NTU email" if not testing_mode else "New OTP generated for testing",
        email=otp_record.email,
        expires_in_minutes=10,
        testing_otp=new_otp_code if testing_mode else None
    )

@router.delete("/cancel-registration/{email}")
async def cancel_registration(
    email: str,
    db: Session = Depends(get_db)
):
    """
    Cancel a pending registration.
    """
    # Find and delete OTP record
    otp_record = db.query(OTPVerification).filter(
        OTPVerification.email == email.lower()
    ).first()

    if not otp_record:
        raise HTTPException(
            status_code=404,
            detail="No pending registration found"
        )

    if otp_record.is_used:
        raise HTTPException(
            status_code=400,
            detail="This registration has already been completed"
        )

    db.delete(otp_record)
    db.commit()

    return {"message": "Registration cancelled successfully"}