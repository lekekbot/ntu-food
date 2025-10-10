"""
Seed script to create test student accounts for demo/testing purposes.
"""

import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent))

from app.database.database import SessionLocal
from app.models.user import User, UserRole
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_test_users():
    db = SessionLocal()
    try:
        print("\n" + "="*60)
        print("🧪 CREATING TEST USER ACCOUNTS")
        print("="*60 + "\n")

        # Test student accounts
        test_users = [
            {
                "ntu_email": "test.student@e.ntu.edu.sg",
                "student_id": "U2021234A",
                "name": "Test Student",
                "phone": "+65 91234567",
                "password": "testpassword123",
                "role": UserRole.STUDENT,
                "dietary_preferences": "No pork, no beef"
            },
            {
                "ntu_email": "john.tan@e.ntu.edu.sg",
                "student_id": "U2022456B",
                "name": "John Tan Wei Ming",
                "phone": "+65 92345678",
                "password": "password123",
                "role": UserRole.STUDENT,
                "dietary_preferences": "Halal only"
            },
            {
                "ntu_email": "alice.lim@e.ntu.edu.sg",
                "student_id": "U2023789C",
                "name": "Alice Lim Mei Ling",
                "phone": "+65 93456789",
                "password": "password123",
                "role": UserRole.STUDENT,
                "dietary_preferences": "Vegetarian"
            }
        ]

        created_count = 0
        for user_data in test_users:
            # Check if user already exists
            existing_user = db.query(User).filter(
                User.ntu_email == user_data["ntu_email"]
            ).first()

            if existing_user:
                print(f"⏭️  User already exists: {user_data['ntu_email']}")
                continue

            # Create new user
            password = user_data.pop("password")
            user = User(
                **user_data,
                hashed_password=pwd_context.hash(password),
                is_active=True,
                is_verified=True
            )

            db.add(user)
            db.commit()
            created_count += 1
            print(f"✅ Created: {user.name} ({user.ntu_email})")

        print("\n" + "="*60)
        print(f"✅ COMPLETED: {created_count} new user(s) created")
        print("="*60)

        # Display all student accounts
        print("\n📋 ALL STUDENT ACCOUNTS:")
        print("="*60)
        students = db.query(User).filter(User.role == UserRole.STUDENT).all()

        for student in students:
            print(f"\n👤 {student.name}")
            print(f"   Email: {student.ntu_email}")
            print(f"   Student ID: {student.student_id}")
            print(f"   Phone: {student.phone}")
            if student.dietary_preferences:
                print(f"   Dietary: {student.dietary_preferences}")

        print("\n" + "="*60)
        print("🔑 DEFAULT PASSWORD FOR ALL TEST ACCOUNTS:")
        print("   testpassword123 (for test.student@e.ntu.edu.sg)")
        print("   password123 (for john.tan and alice.lim)")
        print("="*60)
        print("\n📱 Student App URL: http://localhost:5173/login")
        print("="*60 + "\n")

    except Exception as e:
        print(f"\n❌ Error creating test users: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_test_users()
