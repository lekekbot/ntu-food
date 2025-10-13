"""
Seed script for Supabase PostgreSQL database
Run this after migrating to Supabase to populate initial data
"""

import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent))

from app.database.database import SessionLocal
from app.models.user import User, UserRole
from app.models.stall import Stall
from app.models.menu import MenuItem
from passlib.context import CryptContext
from datetime import time

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def seed_database():
    """Seed the Supabase database with initial data"""
    db = SessionLocal()

    try:
        print("\n" + "="*60)
        print("SEEDING SUPABASE DATABASE")
        print("="*60 + "\n")

        # =====================================================
        # 1. CREATE ADMIN USER
        # =====================================================
        print("📝 Creating admin user...")

        existing_admin = db.query(User).filter(User.ntu_email == "admin@ntu.edu.sg").first()
        if not existing_admin:
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
            print("   ✓ Admin user created")
        else:
            print("   ⚠️  Admin user already exists, skipping...")

        # =====================================================
        # 2. CREATE TEST STUDENTS
        # =====================================================
        print("\n📝 Creating test student accounts...")

        test_students = [
            {
                "ntu_email": "test.student@e.ntu.edu.sg",
                "student_id": "U2234567A",
                "name": "Test Student",
                "phone": "+65 91234567",
                "password": "testpassword123",
                "dietary_preferences": "No preferences"
            },
            {
                "ntu_email": "john.doe@e.ntu.edu.sg",
                "student_id": "U2234568B",
                "name": "John Doe",
                "phone": "+65 91234568",
                "password": "testpassword123",
                "dietary_preferences": "Vegetarian"
            },
            {
                "ntu_email": "jane.smith@e.ntu.edu.sg",
                "student_id": "U2234569C",
                "name": "Jane Smith",
                "phone": "+65 91234569",
                "password": "testpassword123",
                "dietary_preferences": "Halal"
            }
        ]

        created_students = []
        for student_data in test_students:
            existing = db.query(User).filter(User.ntu_email == student_data["ntu_email"]).first()
            if not existing:
                student = User(
                    ntu_email=student_data["ntu_email"],
                    student_id=student_data["student_id"],
                    name=student_data["name"],
                    phone=student_data["phone"],
                    dietary_preferences=student_data["dietary_preferences"],
                    hashed_password=pwd_context.hash(student_data["password"]),
                    role=UserRole.STUDENT,
                    is_active=True,
                    is_verified=True
                )
                db.add(student)
                created_students.append(student)
                print(f"   ✓ Created: {student_data['name']} ({student_data['ntu_email']})")
            else:
                print(f"   ⚠️  {student_data['name']} already exists, skipping...")

        # Commit users before creating stalls
        db.commit()
        print("   ✓ All test students created")

        # =====================================================
        # 3. CREATE STALLS
        # =====================================================
        print("\n📝 Creating food stalls...")

        stalls_data = [
            {
                "name": "Western Food Paradise",
                "location": "North Spine Plaza",
                "description": "Delicious Western cuisine with pasta, steaks, and burgers",
                "cuisine_type": "Western",
                "opening_time": time(8, 0),
                "closing_time": time(20, 0),
                "avg_prep_time": 15,
                "max_concurrent_orders": 15,
                "is_open": True,
                "rating": 4.5
            },
            {
                "name": "Hainanese Chicken Rice",
                "location": "Canteen A",
                "description": "Authentic Hainanese chicken rice with fragrant rice and tender chicken",
                "cuisine_type": "Asian",
                "opening_time": time(7, 0),
                "closing_time": time(19, 0),
                "avg_prep_time": 10,
                "max_concurrent_orders": 20,
                "is_open": True,
                "rating": 4.7
            },
            {
                "name": "Mala Xiang Guo",
                "location": "Canteen B",
                "description": "Spicy Sichuan mala hotpot with customizable ingredients",
                "cuisine_type": "Chinese",
                "opening_time": time(11, 0),
                "closing_time": time(21, 0),
                "avg_prep_time": 12,
                "max_concurrent_orders": 10,
                "is_open": True,
                "rating": 4.3
            }
        ]

        created_stalls = []
        for stall_data in stalls_data:
            existing = db.query(Stall).filter(Stall.name == stall_data["name"]).first()
            if not existing:
                stall = Stall(**stall_data)
                db.add(stall)
                db.flush()  # Flush to get the stall ID
                created_stalls.append(stall)
                print(f"   ✓ Created: {stall_data['name']}")
            else:
                created_stalls.append(existing)
                print(f"   ⚠️  {stall_data['name']} already exists, using existing...")

        db.commit()
        print("   ✓ All stalls created")

        # =====================================================
        # 4. CREATE MENU ITEMS
        # =====================================================
        print("\n📝 Creating menu items...")

        # Western Food Paradise Menu
        western_menu = [
            {
                "name": "Grilled Chicken Chop",
                "price": 8.50,
                "category": "Main Course",
                "description": "Juicy grilled chicken with mashed potatoes and vegetables",
                "prep_time": 15,
                "is_available": True,
                "is_vegetarian": False,
                "is_halal": True
            },
            {
                "name": "Carbonara Pasta",
                "price": 7.00,
                "category": "Main Course",
                "description": "Creamy carbonara pasta with bacon and parmesan",
                "prep_time": 12,
                "is_available": True,
                "is_vegetarian": False,
                "is_halal": False
            },
            {
                "name": "Beef Burger",
                "price": 9.00,
                "category": "Main Course",
                "description": "Juicy beef patty with cheese, lettuce, and fries",
                "prep_time": 15,
                "is_available": True,
                "is_vegetarian": False,
                "is_halal": False
            },
            {
                "name": "Fish & Chips",
                "price": 8.00,
                "category": "Main Course",
                "description": "Crispy battered fish with golden fries",
                "prep_time": 12,
                "is_available": True,
                "is_vegetarian": False,
                "is_halal": True
            },
            {
                "name": "Garden Salad",
                "price": 5.50,
                "category": "Appetizer",
                "description": "Fresh mixed greens with vinaigrette dressing",
                "prep_time": 5,
                "is_available": True,
                "is_vegetarian": True,
                "is_halal": True
            }
        ]

        # Chicken Rice Menu
        chicken_rice_menu = [
            {
                "name": "Roasted Chicken Rice",
                "price": 4.50,
                "category": "Main Course",
                "description": "Tender roasted chicken with fragrant rice",
                "prep_time": 8,
                "is_available": True,
                "is_vegetarian": False,
                "is_halal": True
            },
            {
                "name": "Steamed Chicken Rice",
                "price": 4.00,
                "category": "Main Course",
                "description": "Healthy steamed chicken with aromatic rice",
                "prep_time": 8,
                "is_available": True,
                "is_vegetarian": False,
                "is_halal": True
            },
            {
                "name": "Mixed Chicken Rice",
                "price": 5.00,
                "category": "Main Course",
                "description": "Both roasted and steamed chicken with rice",
                "prep_time": 10,
                "is_available": True,
                "is_vegetarian": False,
                "is_halal": True
            },
            {
                "name": "Chicken Soup",
                "price": 2.00,
                "category": "Side Dish",
                "description": "Nourishing chicken soup",
                "prep_time": 5,
                "is_available": True,
                "is_vegetarian": False,
                "is_halal": True
            },
            {
                "name": "Braised Egg",
                "price": 1.00,
                "category": "Side Dish",
                "description": "Savory braised egg",
                "prep_time": 3,
                "is_available": True,
                "is_vegetarian": True,
                "is_halal": True
            }
        ]

        # Mala Xiang Guo Menu
        mala_menu = [
            {
                "name": "Small Mala Bowl",
                "price": 6.00,
                "category": "Main Course",
                "description": "Small portion of spicy mala with your choice of ingredients",
                "prep_time": 10,
                "is_available": True,
                "is_vegetarian": False,
                "is_halal": False
            },
            {
                "name": "Medium Mala Bowl",
                "price": 8.00,
                "category": "Main Course",
                "description": "Medium portion of spicy mala with your choice of ingredients",
                "prep_time": 12,
                "is_available": True,
                "is_vegetarian": False,
                "is_halal": False
            },
            {
                "name": "Large Mala Bowl",
                "price": 10.00,
                "category": "Main Course",
                "description": "Large portion of spicy mala with your choice of ingredients",
                "prep_time": 15,
                "is_available": True,
                "is_vegetarian": False,
                "is_halal": False
            },
            {
                "name": "Vegetarian Mala",
                "price": 7.00,
                "category": "Main Course",
                "description": "Vegetarian mala with tofu and vegetables",
                "prep_time": 12,
                "is_available": True,
                "is_vegetarian": True,
                "is_halal": True
            },
            {
                "name": "Mala Add-ons",
                "price": 2.00,
                "category": "Side Dish",
                "description": "Extra meat, seafood, or vegetables",
                "prep_time": 5,
                "is_available": True,
                "is_vegetarian": False,
                "is_halal": False
            }
        ]

        # Add menu items to stalls
        menu_data = [
            (created_stalls[0], western_menu, "Western Food Paradise"),
            (created_stalls[1], chicken_rice_menu, "Hainanese Chicken Rice"),
            (created_stalls[2], mala_menu, "Mala Xiang Guo")
        ]

        total_items = 0
        for stall, menu_items, stall_name in menu_data:
            for item_data in menu_items:
                existing = db.query(MenuItem).filter(
                    MenuItem.stall_id == stall.id,
                    MenuItem.name == item_data["name"]
                ).first()

                if not existing:
                    menu_item = MenuItem(stall_id=stall.id, **item_data)
                    db.add(menu_item)
                    total_items += 1

            print(f"   ✓ Created {len(menu_items)} items for {stall_name}")

        db.commit()
        print(f"   ✓ Total menu items created: {total_items}")

        # =====================================================
        # SUMMARY
        # =====================================================
        print("\n" + "="*60)
        print("✅ DATABASE SEEDED SUCCESSFULLY!")
        print("="*60)
        print("\n📊 SUMMARY:")
        print(f"   • Users: {db.query(User).count()} (1 admin + 3 students)")
        print(f"   • Stalls: {db.query(Stall).count()}")
        print(f"   • Menu Items: {db.query(MenuItem).count()}")

        print("\n🔐 LOGIN CREDENTIALS:")
        print("\n   ADMIN:")
        print("   Email: admin@ntu.edu.sg")
        print("   Password: admin123")

        print("\n   TEST STUDENTS:")
        for student in test_students:
            print(f"   Email: {student['ntu_email']}")
            print(f"   Password: {student['password']}")

        print("\n🌐 ACCESS URLS:")
        print("   Admin Panel: http://localhost:5174/admin/login")
        print("   Student Portal: http://localhost:5174/login")
        print("   API Docs: http://localhost:8000/docs")

        print("\n⚠️  IMPORTANT:")
        print("   • Change admin password after first login")
        print("   • Test students can order from all stalls")
        print("   • All data is now in Supabase PostgreSQL")
        print("\n" + "="*60 + "\n")

    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
