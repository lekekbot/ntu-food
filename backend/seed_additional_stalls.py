"""
Seed script to add additional NTU food stalls for location testing.
These stalls are spread across different NTU locations for testing the nearby feature.
"""

from datetime import time
from sqlalchemy.orm import Session
from app.database.database import SessionLocal, engine, Base
from app.models.stall import Stall
from app.models.menu import MenuItem
from app.models.user import User

def create_additional_stalls():
    """Create additional NTU food stalls with various locations for testing."""

    db = SessionLocal()

    try:
        # Get admin user to assign as owner (optional)
        admin_user = db.query(User).filter(User.ntu_email == "admin@ntu.edu.sg").first()
        owner_id = admin_user.id if admin_user else None

        print("\n🏪 Creating Additional NTU Food Stalls for Location Testing...\n")

        # ==================== STALL 4: Canteen 2 ====================
        stall4 = Stall(
            name="Noodle House",
            location="Canteen 2",
            opening_time=time(8, 0),
            closing_time=time(20, 0),
            avg_prep_time=10,
            max_concurrent_orders=8,
            description="Delicious handmade noodles and soups. Try our famous laksa!",
            cuisine_type="Asian",
            is_open=True,
            rating=4.2,
            owner_id=owner_id,
            latitude=1.3483,
            longitude=103.6855,
            building_name="Canteen 2 (Hall 2)"
        )
        db.add(stall4)
        db.flush()
        print(f"✅ Created: {stall4.name} at {stall4.building_name}")

        # Noodle House Menu Items
        noodle_items = [
            MenuItem(
                stall_id=stall4.id,
                name="Laksa",
                price=4.50,
                prep_time=10,
                category="Main Course",
                description="Spicy coconut curry noodle soup with prawns and fish cake",
                is_available=True,
                is_vegetarian=False,
                is_halal=False
            ),
            MenuItem(
                stall_id=stall4.id,
                name="Prawn Mee",
                price=5.00,
                prep_time=12,
                category="Main Course",
                description="Flavorful prawn noodle soup with fresh prawns and pork ribs",
                is_available=True,
                is_vegetarian=False,
                is_halal=False
            ),
            MenuItem(
                stall_id=stall4.id,
                name="Wanton Mee",
                price=3.50,
                prep_time=8,
                category="Main Course",
                description="Springy noodles with char siew and homemade wontons",
                is_available=True,
                is_vegetarian=False,
                is_halal=False
            )
        ]
        for item in noodle_items:
            db.add(item)
        print(f"   ➕ Added {len(noodle_items)} menu items")

        # ==================== STALL 5: Canteen 1 (Hall 1) ====================
        stall5 = Stall(
            name="Vegetarian Delight",
            location="Canteen 1 (Hall 1)",
            opening_time=time(7, 0),
            closing_time=time(19, 30),
            avg_prep_time=10,
            max_concurrent_orders=10,
            description="Healthy vegetarian meals. All dishes are 100% vegetarian and halal!",
            cuisine_type="Vegetarian",
            is_open=True,
            rating=4.6,
            owner_id=owner_id,
            latitude=1.3466,
            longitude=103.6860,
            building_name="Canteen 1 (Hall 1)"
        )
        db.add(stall5)
        db.flush()
        print(f"✅ Created: {stall5.name} at {stall5.building_name}")

        # Vegetarian Menu Items
        veg_items = [
            MenuItem(
                stall_id=stall5.id,
                name="Vegetarian Bee Hoon",
                price=3.50,
                prep_time=8,
                category="Main Course",
                description="Stir-fried rice vermicelli with mixed vegetables and mock meat",
                is_available=True,
                is_vegetarian=True,
                is_halal=True
            ),
            MenuItem(
                stall_id=stall5.id,
                name="Mixed Vegetable Rice",
                price=4.00,
                prep_time=5,
                category="Main Course",
                description="Choose 3 vegetables with rice (vegetarian mock meat options available)",
                is_available=True,
                is_vegetarian=True,
                is_halal=True
            ),
            MenuItem(
                stall_id=stall5.id,
                name="Tofu & Mushroom Stew",
                price=4.50,
                prep_time=10,
                category="Main Course",
                description="Hearty stew with fresh tofu, mushrooms and seasonal vegetables",
                is_available=True,
                is_vegetarian=True,
                is_halal=True
            )
        ]
        for item in veg_items:
            db.add(item)
        print(f"   ➕ Added {len(veg_items)} menu items")

        # ==================== STALL 6: Canteen 11 (Hall 11) ====================
        stall6 = Stall(
            name="Indian Cuisine Corner",
            location="Canteen 11 (Hall 11)",
            opening_time=time(7, 30),
            closing_time=time(21, 0),
            avg_prep_time=15,
            max_concurrent_orders=6,
            description="Authentic North Indian cuisine. Fresh naan and flavorful curries!",
            cuisine_type="Indian",
            is_open=True,
            rating=4.4,
            owner_id=owner_id,
            latitude=1.3549,
            longitude=103.6865,
            building_name="Canteen 11 (Hall 11)"
        )
        db.add(stall6)
        db.flush()
        print(f"✅ Created: {stall6.name} at {stall6.building_name}")

        # Indian Cuisine Menu Items
        indian_items = [
            MenuItem(
                stall_id=stall6.id,
                name="Butter Chicken with Naan",
                price=6.50,
                prep_time=15,
                category="Main Course",
                description="Creamy tomato-based butter chicken served with fresh garlic naan",
                is_available=True,
                is_vegetarian=False,
                is_halal=True
            ),
            MenuItem(
                stall_id=stall6.id,
                name="Chicken Biryani",
                price=5.50,
                prep_time=12,
                category="Main Course",
                description="Fragrant basmati rice with spiced chicken and raita",
                is_available=True,
                is_vegetarian=False,
                is_halal=True
            ),
            MenuItem(
                stall_id=stall6.id,
                name="Paneer Tikka Masala",
                price=6.00,
                prep_time=15,
                category="Main Course",
                description="Grilled cottage cheese in rich tomato curry with naan",
                is_available=True,
                is_vegetarian=True,
                is_halal=True
            ),
            MenuItem(
                stall_id=stall6.id,
                name="Samosa (2pcs)",
                price=2.50,
                prep_time=5,
                category="Side Dish",
                description="Crispy pastry filled with spiced potatoes and peas",
                is_available=True,
                is_vegetarian=True,
                is_halal=True
            )
        ]
        for item in indian_items:
            db.add(item)
        print(f"   ➕ Added {len(indian_items)} menu items")

        # ==================== STALL 7: NIE Canteen ====================
        stall7 = Stall(
            name="Fusion Food Co.",
            location="NIE Canteen",
            opening_time=time(8, 0),
            closing_time=time(20, 0),
            avg_prep_time=12,
            max_concurrent_orders=8,
            description="Creative fusion dishes combining East and West. Try our signature Korean-Western fusion!",
            cuisine_type="Fusion",
            is_open=True,
            rating=4.3,
            owner_id=owner_id,
            latitude=1.3487,
            longitude=103.6776,
            building_name="NIE Canteen"
        )
        db.add(stall7)
        db.flush()
        print(f"✅ Created: {stall7.name} at {stall7.building_name}")

        # Fusion Menu Items
        fusion_items = [
            MenuItem(
                stall_id=stall7.id,
                name="Korean Fried Chicken Burger",
                price=7.00,
                prep_time=15,
                category="Main Course",
                description="Crispy Korean-style fried chicken in brioche bun with gochujang mayo",
                is_available=True,
                is_vegetarian=False,
                is_halal=True
            ),
            MenuItem(
                stall_id=stall7.id,
                name="Kimchi Fried Rice",
                price=5.50,
                prep_time=10,
                category="Main Course",
                description="Spicy kimchi fried rice topped with sunny side up egg",
                is_available=True,
                is_vegetarian=False,
                is_halal=False
            ),
            MenuItem(
                stall_id=stall7.id,
                name="Teriyaki Chicken Bowl",
                price=6.00,
                prep_time=12,
                category="Main Course",
                description="Grilled teriyaki chicken on Japanese rice with vegetables",
                is_available=True,
                is_vegetarian=False,
                is_halal=True
            )
        ]
        for item in fusion_items:
            db.add(item)
        print(f"   ➕ Added {len(fusion_items)} menu items")

        # Commit all changes
        db.commit()

        print("\n" + "="*60)
        print("✅ SUCCESS! Additional stalls created!")
        print("="*60)
        print(f"\n📊 Summary:")
        print(f"   • Noodle House (Canteen 2) - 3 items")
        print(f"   • Vegetarian Delight (Canteen 1 / Hall 1) - 3 items")
        print(f"   • Indian Cuisine Corner (Canteen 11 / Hall 11) - 4 items")
        print(f"   • Fusion Food Co. (NIE Canteen) - 3 items")
        print(f"   • Total: 4 additional stalls, 13 menu items")
        print("\n📍 Location Coverage:")
        print(f"   • North Spine Plaza (1.3470, 103.6802)")
        print(f"   • South Spine / Koufu (1.3424, 103.6824)")
        print(f"   • Canteen 1 / Hall 1 (1.3466, 103.6860)")
        print(f"   • Canteen 2 / Hall 2 (1.3483, 103.6855)")
        print(f"   • Canteen 11 / Hall 11 (1.3549, 103.6865)")
        print(f"   • NIE Canteen (1.3487, 103.6776)")
        print("\n🎯 Test the nearby feature:")
        print("   • Open student app and allow location")
        print("   • See stalls sorted by distance from your location")
        print("   • Distance and walking time displayed for each stall")
        print("\n" + "="*60 + "\n")

    except Exception as e:
        db.rollback()
        print(f"\n❌ Error creating stalls: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("\n" + "="*60)
    print("🏪 NTU FOOD - ADDITIONAL STALLS SEEDER")
    print("="*60 + "\n")

    # Ensure tables exist
    Base.metadata.create_all(bind=engine)

    # Create additional stalls
    create_additional_stalls()
