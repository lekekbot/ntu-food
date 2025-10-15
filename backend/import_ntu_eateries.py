"""
Import NTU eateries from CSV file into the database.
"""

import csv
from datetime import time
from sqlalchemy.orm import Session
from app.database.database import SessionLocal
from app.models.stall import Stall

def import_eateries():
    """Import eateries from ntu_eateries_partial_list.csv."""

    db = SessionLocal()

    try:
        csv_path = "/Users/ajitesh/Desktop/My Projects/NTU_Food/ntu-food/ntu_eateries_partial_list.csv"

        print("\n📥 Importing NTU eateries from CSV...\n")

        imported_count = 0
        skipped_count = 0

        with open(csv_path, 'r', encoding='utf-8') as file:
            csv_reader = csv.DictReader(file)

            for row in csv_reader:
                name = row['Name'].strip()
                category = row['Category'].strip()
                address = row['Area / Address'].strip()
                lat_str = row['Latitude'].strip()
                lng_str = row['Longitude'].strip()

                # Skip entries without coordinates
                if not lat_str or not lng_str:
                    print(f"⏭️  Skipped: {name} (no coordinates)")
                    skipped_count += 1
                    continue

                try:
                    latitude = float(lat_str)
                    longitude = float(lng_str)
                except ValueError:
                    print(f"⏭️  Skipped: {name} (invalid coordinates)")
                    skipped_count += 1
                    continue

                # Check if stall already exists
                existing = db.query(Stall).filter(Stall.name == name).first()
                if existing:
                    print(f"⏭️  Skipped: {name} (already exists)")
                    skipped_count += 1
                    continue

                # Map category to cuisine type
                cuisine_mapping = {
                    'Food court': 'Mixed',
                    'Restaurant': 'Mixed',
                    'Fast food': 'Fast Food',
                    'Café': 'Cafe',
                    'Restaurant/Bar': 'Western',
                    'Salad shop': 'Healthy'
                }
                cuisine_type = cuisine_mapping.get(category, 'Mixed')

                # Create stall
                stall = Stall(
                    name=name,
                    location=address,
                    opening_time=time(8, 0),  # Default 8 AM
                    closing_time=time(20, 0),  # Default 8 PM
                    avg_prep_time=12,
                    max_concurrent_orders=10,
                    description=f"{category} at {address}",
                    cuisine_type=cuisine_type,
                    is_open=True,
                    rating=4.0,  # Default rating
                    latitude=latitude,
                    longitude=longitude,
                    building_name=address.split(',')[0] if ',' in address else address
                )

                db.add(stall)
                print(f"✅ Imported: {name} ({latitude}, {longitude})")
                imported_count += 1

        db.commit()

        print("\n" + "="*60)
        print("✅ Import complete!")
        print("="*60)
        print(f"📊 Summary:")
        print(f"   • Imported: {imported_count} eateries")
        print(f"   • Skipped: {skipped_count} eateries")
        print(f"\n🎯 Total eateries in database: {db.query(Stall).count()}")
        print("="*60 + "\n")

    except Exception as e:
        db.rollback()
        print(f"\n❌ Error importing eateries: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    import_eateries()
