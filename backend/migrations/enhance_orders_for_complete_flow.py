"""
Migration to enhance orders table for complete ordering system with payment tracking.

Adds:
- payment_status enum column
- payment_method column
- pickup_window_start and pickup_window_end columns
- Updates order_status enum with new statuses
"""

from sqlalchemy import create_engine, text
from app.config import settings
import sys

def migrate():
    """Run the migration to enhance orders table."""
    engine = create_engine(settings.DATABASE_URL)

    with engine.connect() as conn:
        try:
            is_postgres = settings.DATABASE_URL.startswith("postgresql")

            print("\n🔄 Starting migration: Enhance orders table for complete ordering flow...")

            # Step 1: Update order_status enum to include new values (PostgreSQL only)
            if is_postgres:
                print("📝 Updating order_status enum with new values...")
                # Add new enum values to existing order_status type
                conn.execute(text("""
                    DO $$ BEGIN
                        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'pending_payment' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'order_status')) THEN
                            ALTER TYPE order_status ADD VALUE 'pending_payment';
                        END IF;
                    END $$;
                """))
                conn.execute(text("""
                    DO $$ BEGIN
                        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'confirmed' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'order_status')) THEN
                            ALTER TYPE order_status ADD VALUE 'confirmed';
                        END IF;
                    END $$;
                """))
                conn.commit()  # Commit enum changes before proceeding
                print("✅ Updated order_status enum")

            # Step 2: Add payment_status column
            print("📝 Adding payment_status column...")
            if is_postgres:
                # PostgreSQL: Create ENUM type first, then add column
                conn.execute(text("""
                    DO $$ BEGIN
                        CREATE TYPE payment_status AS ENUM ('pending', 'confirmed', 'failed');
                    EXCEPTION
                        WHEN duplicate_object THEN null;
                    END $$;
                """))
                conn.execute(text("""
                    ALTER TABLE orders
                    ADD COLUMN IF NOT EXISTS payment_status payment_status DEFAULT 'pending'
                """))
            else:
                # SQLite: Use TEXT with CHECK constraint
                conn.execute(text("""
                    ALTER TABLE orders
                    ADD COLUMN payment_status TEXT DEFAULT 'pending'
                    CHECK(payment_status IN ('pending', 'confirmed', 'failed'))
                """))
            print("✅ Added payment_status column")

            # Step 3: Add payment_method column
            print("📝 Adding payment_method column...")
            if is_postgres:
                conn.execute(text("""
                    ALTER TABLE orders
                    ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'paynow'
                """))
            else:
                conn.execute(text("""
                    ALTER TABLE orders
                    ADD COLUMN payment_method VARCHAR(50) DEFAULT 'paynow'
                """))
            print("✅ Added payment_method column")

            # Step 4: Add pickup window columns
            print("📝 Adding pickup window columns...")
            if is_postgres:
                conn.execute(text("""
                    ALTER TABLE orders
                    ADD COLUMN IF NOT EXISTS pickup_window_start TIMESTAMP,
                    ADD COLUMN IF NOT EXISTS pickup_window_end TIMESTAMP
                """))
            else:
                conn.execute(text("""
                    ALTER TABLE orders
                    ADD COLUMN pickup_window_start TIMESTAMP
                """))
                conn.execute(text("""
                    ALTER TABLE orders
                    ADD COLUMN pickup_window_end TIMESTAMP
                """))
            print("✅ Added pickup_window_start and pickup_window_end columns")

            # Step 5: Update existing order statuses to match new enum (only if there are orders)
            print("📝 Updating existing order statuses...")
            if is_postgres:
                conn.execute(text("""
                    UPDATE orders
                    SET status = 'pending_payment'
                    WHERE LOWER(status::text) = 'pending'
                """))
                conn.execute(text("""
                    UPDATE orders
                    SET status = 'confirmed'
                    WHERE LOWER(status::text) = 'accepted'
                """))
            else:
                conn.execute(text("""
                    UPDATE orders
                    SET status = 'pending_payment'
                    WHERE LOWER(status) = 'pending'
                """))
                conn.execute(text("""
                    UPDATE orders
                    SET status = 'confirmed'
                    WHERE LOWER(status) = 'accepted'
                """))
            print("✅ Updated existing order statuses")

            conn.commit()

            print("\n" + "="*60)
            print("✅ Migration completed successfully!")
            print("="*60)
            print("\n📊 Changes applied:")
            print("   • Added payment_status column (pending/confirmed/failed)")
            print("   • Added payment_method column (default: paynow)")
            print("   • Added pickup_window_start column")
            print("   • Added pickup_window_end column")
            print("   • Updated order status enum values")
            print("\n🎯 Order statuses now:")
            print("   pending_payment → confirmed → preparing → ready → completed")
            print("\n" + "="*60 + "\n")

        except Exception as e:
            conn.rollback()
            print(f"\n❌ Migration failed: {e}")
            print("\nRolling back changes...")
            sys.exit(1)

def rollback():
    """Rollback the migration."""
    engine = create_engine(settings.DATABASE_URL)

    with engine.connect() as conn:
        try:
            is_postgres = settings.DATABASE_URL.startswith("postgresql")

            print("\n🔄 Rolling back migration...")

            # Remove added columns
            if is_postgres:
                conn.execute(text("""
                    ALTER TABLE orders
                    DROP COLUMN IF EXISTS payment_status,
                    DROP COLUMN IF EXISTS payment_method,
                    DROP COLUMN IF EXISTS pickup_window_start,
                    DROP COLUMN IF EXISTS pickup_window_end
                """))
                # Drop enum type
                conn.execute(text("DROP TYPE IF EXISTS payment_status CASCADE"))
            else:
                conn.execute(text("ALTER TABLE orders DROP COLUMN payment_status"))
                conn.execute(text("ALTER TABLE orders DROP COLUMN payment_method"))
                conn.execute(text("ALTER TABLE orders DROP COLUMN pickup_window_start"))
                conn.execute(text("ALTER TABLE orders DROP COLUMN pickup_window_end"))

            conn.commit()
            print("✅ Rollback completed successfully!")

        except Exception as e:
            conn.rollback()
            print(f"❌ Rollback failed: {e}")
            sys.exit(1)

if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "rollback":
        rollback()
    else:
        migrate()
