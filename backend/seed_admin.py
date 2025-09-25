import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent))

from app.database.database import SessionLocal
from app.models.user import User, UserRole
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_admin_user():
    db = SessionLocal()
    try:
        existing_admin = db.query(User).filter(User.role == UserRole.ADMIN).first()
        if existing_admin:
            print(f"✅ Admin user already exists: {existing_admin.ntu_email}")
            return

        admin = User(
            ntu_email="admin@ntu.edu.sg",
            student_id="ADMIN001",
            name="System Administrator",
            phone="+65 12345678",
            hashed_password=pwd_context.hash("admin123"),
            role=UserRole.ADMIN,
            is_active=True,
            is_verified=True
        )

        db.add(admin)
        db.commit()

        print("✅ Admin user created successfully!")
        print("\n" + "="*50)
        print("ADMIN LOGIN CREDENTIALS")
        print("="*50)
        print(f"Email: admin@ntu.edu.sg")
        print(f"Password: admin123")
        print("="*50)
        print("\n⚠️  IMPORTANT: Change this password after first login!")
        print(f"\nAdmin Panel URL: http://localhost:5173/admin/login")

    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()