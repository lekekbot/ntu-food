"""
Seed script to add realistic NTU food stalls with menus to the database.
Run this script to populate the database with sample stall data.
"""

from datetime import time
from sqlalchemy.orm import Session
from app.database.database import SessionLocal, engine, Base
from app.models.stall import Stall
from app.models.menu import MenuItem
from app.models.user import User

def create_stalls_and_menus():
    """Create 3 realistic NTU food stalls with comprehensive menus."""

    db = SessionLocal()

    try:
        # Check if stalls already exist
        existing_stalls = db.query(Stall).count()
        if existing_stalls > 0:
            print(f"⚠️  Database already has {existing_stalls} stall(s).")
            response = input("Do you want to add more stalls anyway? (y/n): ")
            if response.lower() != 'y':
                print("❌ Operation cancelled.")
                return

        # Get admin user to assign as owner (optional)
        admin_user = db.query(User).filter(User.ntu_email == "admin@ntu.edu.sg").first()
        owner_id = admin_user.id if admin_user else None

        print("\n🏪 Creating NTU Food Stalls...\n")

        # ==================== STALL 1: Western Food Stall ====================
        stall1 = Stall(
            name="Western Food Stall",
            location="North Spine Food Court",
            opening_time=time(7, 0),
            closing_time=time(21, 0),
            avg_prep_time=12,
            max_concurrent_orders=8,
            description="Delicious Western cuisine with a local twist. Famous for our crispy fish & chips and hearty chicken chop!",
            cuisine_type="Western",
            is_open=True,
            rating=4.3,
            owner_id=owner_id,
            latitude=1.3470,
            longitude=103.6802,
            building_name="North Spine Plaza"
        )
        db.add(stall1)
        db.flush()  # Get the ID

        print(f"✅ Created: {stall1.name}")

        # Western Food Menu Items
        western_items = [
            MenuItem(
                stall_id=stall1.id,
                name="Fish & Chips",
                price=6.50,
                prep_time=15,
                category="Main Course",
                description="Crispy battered fish fillet served with golden fries and tartar sauce",
                is_available=True,
                is_vegetarian=False,
                is_halal=False
            ),
            MenuItem(
                stall_id=stall1.id,
                name="Chicken Chop",
                price=5.80,
                prep_time=12,
                category="Main Course",
                description="Grilled chicken chop with black pepper sauce, coleslaw and fries",
                is_available=True,
                is_vegetarian=False,
                is_halal=True
            ),
            MenuItem(
                stall_id=stall1.id,
                name="Carbonara Pasta",
                price=6.00,
                prep_time=10,
                category="Main Course",
                description="Creamy carbonara pasta with chicken ham and mushrooms",
                is_available=True,
                is_vegetarian=False,
                is_halal=False
            ),
            MenuItem(
                stall_id=stall1.id,
                name="Aglio Olio Pasta",
                price=5.50,
                prep_time=10,
                category="Main Course",
                description="Spicy garlic olive oil pasta with mushrooms and chili flakes",
                is_available=True,
                is_vegetarian=True,
                is_halal=True
            ),
            MenuItem(
                stall_id=stall1.id,
                name="Beef Burger",
                price=6.80,
                prep_time=15,
                category="Main Course",
                description="Juicy beef patty with cheese, lettuce, tomato and fries",
                is_available=True,
                is_vegetarian=False,
                is_halal=False
            )
        ]

        for item in western_items:
            db.add(item)

        print(f"   ➕ Added {len(western_items)} menu items")

        # ==================== STALL 2: Chicken Rice Stall ====================
        stall2 = Stall(
            name="Chicken Rice Stall",
            location="North Spine Food Court",
            opening_time=time(7, 30),
            closing_time=time(20, 30),
            avg_prep_time=10,
            max_concurrent_orders=10,
            description="Authentic Hainanese chicken rice, a local favorite! Using our secret family recipe passed down for generations.",
            cuisine_type="Chinese",
            is_open=True,
            rating=4.5,
            owner_id=owner_id,
            latitude=1.3470,
            longitude=103.6802,
            building_name="North Spine Plaza"
        )
        db.add(stall2)
        db.flush()

        print(f"✅ Created: {stall2.name}")

        # Chicken Rice Menu Items
        chicken_rice_items = [
            MenuItem(
                stall_id=stall2.id,
                name="Roasted Chicken Rice",
                price=4.50,
                prep_time=8,
                category="Main Course",
                description="Tender roasted chicken with fragrant rice, chili sauce and ginger paste",
                is_available=True,
                is_vegetarian=False,
                is_halal=False
            ),
            MenuItem(
                stall_id=stall2.id,
                name="Steamed Chicken Rice",
                price=4.00,
                prep_time=8,
                category="Main Course",
                description="Smooth steamed chicken served with aromatic rice and traditional sauces",
                is_available=True,
                is_vegetarian=False,
                is_halal=False
            ),
            MenuItem(
                stall_id=stall2.id,
                name="Roasted & Steamed Chicken Rice",
                price=5.00,
                prep_time=10,
                category="Main Course",
                description="Best of both worlds - half roasted, half steamed chicken with fragrant rice",
                is_available=True,
                is_vegetarian=False,
                is_halal=False
            ),
            MenuItem(
                stall_id=stall2.id,
                name="Char Siew Rice",
                price=4.50,
                prep_time=8,
                category="Main Course",
                description="Sweet and savory BBQ pork with fragrant rice",
                is_available=True,
                is_vegetarian=False,
                is_halal=False
            ),
            MenuItem(
                stall_id=stall2.id,
                name="Wonton Soup",
                price=3.50,
                prep_time=5,
                category="Side Dish",
                description="Clear soup with handmade wontons filled with minced pork and prawns",
                is_available=True,
                is_vegetarian=False,
                is_halal=False
            )
        ]

        for item in chicken_rice_items:
            db.add(item)

        print(f"   ➕ Added {len(chicken_rice_items)} menu items")

        # ==================== STALL 3: Mala Xiang Guo ====================
        stall3 = Stall(
            name="Mala Xiang Guo",
            location="Koufu @ South Spine",
            opening_time=time(10, 0),
            closing_time=time(21, 0),
            avg_prep_time=15,
            max_concurrent_orders=6,
            description="Spicy and numbing Sichuan-style stir-fry! Choose your ingredients and spice level. Perfect for spice lovers!",
            cuisine_type="Chinese",
            is_open=True,
            rating=4.4,
            owner_id=owner_id,
            latitude=1.3424,
            longitude=103.6824,
            building_name="South Spine (Koufu)"
        )
        db.add(stall3)
        db.flush()

        print(f"✅ Created: {stall3.name}")

        # Mala Xiang Guo Menu Items
        mala_items = [
            MenuItem(
                stall_id=stall3.id,
                name="Small Mala Bowl",
                price=6.00,
                prep_time=12,
                category="Main Course",
                description="Small bowl - pick up to 4 ingredients. Choose spice level from mild to extra spicy!",
                is_available=True,
                is_vegetarian=False,
                is_halal=False
            ),
            MenuItem(
                stall_id=stall3.id,
                name="Medium Mala Bowl",
                price=8.00,
                prep_time=15,
                category="Main Course",
                description="Medium bowl - pick up to 6 ingredients. Most popular choice!",
                is_available=True,
                is_vegetarian=False,
                is_halal=False
            ),
            MenuItem(
                stall_id=stall3.id,
                name="Large Mala Bowl",
                price=10.00,
                prep_time=18,
                category="Main Course",
                description="Large bowl - pick up to 8 ingredients. Perfect for sharing or big appetite!",
                is_available=True,
                is_vegetarian=False,
                is_halal=False
            ),
            MenuItem(
                stall_id=stall3.id,
                name="Vegetarian Mala Bowl",
                price=6.50,
                prep_time=12,
                category="Main Course",
                description="Meat-free option with fresh vegetables, tofu, and mushrooms in mala sauce",
                is_available=True,
                is_vegetarian=True,
                is_halal=True
            ),
            MenuItem(
                stall_id=stall3.id,
                name="Fried Rice Add-on",
                price=2.00,
                prep_time=5,
                category="Side Dish",
                description="Fragrant egg fried rice to complement your mala",
                is_available=True,
                is_vegetarian=False,
                is_halal=True
            ),
            MenuItem(
                stall_id=stall3.id,
                name="Mala Soup Base Upgrade",
                price=1.50,
                prep_time=2,
                category="Add-on",
                description="Upgrade to soup-based mala instead of dry stir-fry",
                is_available=True,
                is_vegetarian=True,
                is_halal=True
            )
        ]

        for item in mala_items:
            db.add(item)

        print(f"   ➕ Added {len(mala_items)} menu items")

        # Commit all changes
        db.commit()

        print("\n" + "="*60)
        print("✅ SUCCESS! Database seeded with 3 NTU food stalls!")
        print("="*60)
        print(f"\n📊 Summary:")
        print(f"   • Western Food Stall - 5 menu items")
        print(f"   • Chicken Rice Stall - 5 menu items")
        print(f"   • Mala Xiang Guo - 6 menu items")
        print(f"   • Total: 3 stalls, 16 menu items")
        print("\n🎯 Next Steps:")
        print("   1. Open http://localhost:5173/admin/dashboard")
        print("   2. Check the stalls in the admin panel")
        print("   3. Open http://localhost:5173/login (student app)")
        print("   4. Browse stalls and try ordering!")
        print("\n" + "="*60 + "\n")

    except Exception as e:
        db.rollback()
        print(f"\n❌ Error creating stalls: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("\n" + "="*60)
    print("🏪 NTU FOOD STALLS DATABASE SEEDER")
    print("="*60 + "\n")

    # Ensure tables exist
    Base.metadata.create_all(bind=engine)

    # Create stalls and menus
    create_stalls_and_menus()
