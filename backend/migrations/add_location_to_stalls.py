"""
Migration script to add location data to stalls table
Adds latitude, longitude, and building_name columns
Works with both SQLite and PostgreSQL
"""

import sys
import os

# Add parent directory to path to import app modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.config import settings
from sqlalchemy import create_engine, text

def migrate():
    """Add location columns to stalls table"""

    # Create database connection
    engine = create_engine(settings.DATABASE_URL)

    try:
        with engine.connect() as conn:
            # Check if we're using PostgreSQL or SQLite
            is_postgres = settings.DATABASE_URL.startswith("postgresql")

            # Check if columns exist
            if is_postgres:
                # PostgreSQL check
                check_query = text("""
                    SELECT column_name
                    FROM information_schema.columns
                    WHERE table_name = 'stalls'
                """)
                result = conn.execute(check_query)
                existing_columns = [row[0] for row in result]
            else:
                # SQLite check
                result = conn.execute(text("PRAGMA table_info(stalls)"))
                existing_columns = [row[1] for row in result]

            # Add latitude column if not exists
            if "latitude" not in existing_columns:
                data_type = "DOUBLE PRECISION" if is_postgres else "REAL"
                conn.execute(text(f"ALTER TABLE stalls ADD COLUMN latitude {data_type}"))
                conn.commit()
                print("✅ Added latitude column")
            else:
                print("⏭️  latitude column already exists")

            # Add longitude column if not exists
            if "longitude" not in existing_columns:
                data_type = "DOUBLE PRECISION" if is_postgres else "REAL"
                conn.execute(text(f"ALTER TABLE stalls ADD COLUMN longitude {data_type}"))
                conn.commit()
                print("✅ Added longitude column")
            else:
                print("⏭️  longitude column already exists")

            # Add building_name column if not exists
            if "building_name" not in existing_columns:
                data_type = "VARCHAR(255)" if is_postgres else "TEXT"
                conn.execute(text(f"ALTER TABLE stalls ADD COLUMN building_name {data_type}"))
                conn.commit()
                print("✅ Added building_name column")
            else:
                print("⏭️  building_name column already exists")

        print("\n✅ Migration completed successfully!")

    except Exception as e:
        print(f"\n❌ Migration failed: {str(e)}")
        raise

def rollback():
    """Remove location columns from stalls table"""

    engine = create_engine(settings.DATABASE_URL)
    is_postgres = settings.DATABASE_URL.startswith("postgresql")

    if not is_postgres:
        print("⚠️  SQLite doesn't support DROP COLUMN directly.")
        print("To rollback, you would need to recreate the table.")
        return

    try:
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE stalls DROP COLUMN IF EXISTS latitude"))
            conn.execute(text("ALTER TABLE stalls DROP COLUMN IF EXISTS longitude"))
            conn.execute(text("ALTER TABLE stalls DROP COLUMN IF EXISTS building_name"))
            conn.commit()
            print("✅ Rollback completed successfully!")

    except Exception as e:
        print(f"❌ Rollback failed: {str(e)}")
        raise

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Add location data to stalls table")
    parser.add_argument("--rollback", action="store_true", help="Rollback the migration")
    args = parser.parse_args()

    if args.rollback:
        rollback()
    else:
        migrate()
