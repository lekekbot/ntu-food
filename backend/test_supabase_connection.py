"""
Quick test script to verify Supabase PostgreSQL connection
Run this to ensure your database is connected properly
"""

import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent))

from sqlalchemy import create_engine, text
from app.config import settings

def test_connection():
    """Test database connection to Supabase"""

    print("\n" + "="*60)
    print("TESTING SUPABASE CONNECTION")
    print("="*60 + "\n")

    # Show configuration
    print("📋 Configuration:")
    print(f"   Database URL: {settings.DATABASE_URL[:50]}...")
    print(f"   Supabase URL: {settings.SUPABASE_URL}")
    print(f"   Email Testing Mode: {settings.EMAIL_TESTING_MODE}")

    try:
        # Create engine
        print("\n🔌 Creating database engine...")
        engine = create_engine(settings.DATABASE_URL)

        # Test connection
        print("🔗 Testing connection...")
        with engine.connect() as connection:
            # Test basic query
            result = connection.execute(text("SELECT version();"))
            version = result.fetchone()[0]
            print(f"   ✓ Connected to PostgreSQL")
            print(f"   Version: {version[:80]}...")

            # Check tables exist
            print("\n📊 Checking tables...")
            result = connection.execute(text("""
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'public'
                ORDER BY table_name;
            """))
            tables = [row[0] for row in result.fetchall()]

            if tables:
                print(f"   ✓ Found {len(tables)} tables:")
                for table in tables:
                    print(f"      • {table}")
            else:
                print("   ⚠️  No tables found! Run migration script first.")
                return False

            # Count records in key tables
            if "users" in tables:
                print("\n🔢 Counting records...")
                for table in ["users", "stalls", "menu_items", "orders"]:
                    if table in tables:
                        result = connection.execute(text(f"SELECT COUNT(*) FROM {table};"))
                        count = result.fetchone()[0]
                        print(f"   • {table}: {count} records")

        print("\n" + "="*60)
        print("✅ CONNECTION TEST SUCCESSFUL!")
        print("="*60)
        print("\n✨ Your Supabase database is ready to use!")
        print("\n📝 Next steps:")
        print("   1. Run migration: Copy backend/supabase_migration.sql to Supabase SQL Editor")
        print("   2. Seed data: python seed_supabase.py")
        print("   3. Start backend: uvicorn app.main:app --reload")
        print("   4. Access app: http://localhost:5174")
        print("\n")

        return True

    except Exception as e:
        print("\n" + "="*60)
        print("❌ CONNECTION TEST FAILED")
        print("="*60)
        print(f"\n🔴 Error: {str(e)}\n")

        print("🔧 Troubleshooting tips:")
        print("   1. Check DATABASE_URL in .env file")
        print("   2. Verify Supabase project is not paused")
        print("   3. Confirm database password is correct")
        print("   4. Check if psycopg2-binary is installed: pip install psycopg2-binary")
        print("   5. Test connection in Supabase dashboard")
        print("\n")

        return False

if __name__ == "__main__":
    success = test_connection()
    sys.exit(0 if success else 1)
