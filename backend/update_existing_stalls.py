"""
Update existing stalls with location data.
"""

from sqlalchemy.orm import Session
from app.database.database import SessionLocal
from app.models.stall import Stall

def update_stalls():
    """Update existing stalls with location coordinates."""

    db = SessionLocal()

    try:
        # Update stall ID 1 (Western Food)
        stall1 = db.query(Stall).filter(Stall.id == 1).first()
        if stall1:
            stall1.latitude = 1.3470
            stall1.longitude = 103.6802
            stall1.building_name = "North Spine Plaza"
            stall1.name = "Western Food Paradise"
            print(f"✅ Updated: {stall1.name}")

        # Update stall ID 2 (Chicken Rice)
        stall2 = db.query(Stall).filter(Stall.id == 2).first()
        if stall2:
            stall2.latitude = 1.3470
            stall2.longitude = 103.6802
            stall2.building_name = "North Spine Plaza"
            stall2.name = "Hainanese Chicken Rice"
            print(f"✅ Updated: {stall2.name}")

        # Update stall ID 3 (Mala)
        stall3 = db.query(Stall).filter(Stall.id == 3).first()
        if stall3:
            stall3.latitude = 1.3424
            stall3.longitude = 103.6824
            stall3.building_name = "South Spine (Koufu)"
            print(f"✅ Updated: {stall3.name}")

        db.commit()
        print("\n✅ All existing stalls updated with location data!")

    except Exception as e:
        db.rollback()
        print(f"\n❌ Error updating stalls: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("\n🔄 Updating existing stalls with location data...\n")
    update_stalls()
