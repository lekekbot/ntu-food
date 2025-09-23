from sqlalchemy.orm import sessionmaker
from app.database.database import engine, Base
from app.models.user import User, UserRole
from app.models.stall import Stall
from app.models.menu import MenuItem
from app.models.order import Order, OrderItem, OrderStatus
from app.models.queue import QueueEntry, QueueStatus
from passlib.context import CryptContext
from datetime import time, datetime, timedelta

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def init_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = SessionLocal()

    try:
        create_test_data(session)
        session.commit()
        print("✅ Database initialized with test data successfully!")
    except Exception as e:
        session.rollback()
        print(f"❌ Error initializing database: {e}")
        raise
    finally:
        session.close()

def create_test_data(session):
    test_user = User(
        ntu_email="test.student@e.ntu.edu.sg",
        student_id="U123456789",
        name="Test Student",
        phone="+65 91234567",
        dietary_preferences="No pork, vegetarian options preferred",
        hashed_password=get_password_hash("testpassword123"),
        role=UserRole.STUDENT,
        is_verified=True
    )
    session.add(test_user)
    session.flush()

    stall_owner = User(
        ntu_email="stallowner@e.ntu.edu.sg",
        student_id="S987654321",
        name="Test Stall Owner",
        phone="+65 98765432",
        dietary_preferences="",
        hashed_password=get_password_hash("ownerpassword123"),
        role=UserRole.STALL_OWNER,
        is_verified=True
    )
    session.add(stall_owner)
    session.flush()

    stall_a = Stall(
        name="Test Stall A",
        location="North Canteen Level 1",
        opening_time=time(8, 0),
        closing_time=time(20, 0),
        avg_prep_time=12,
        max_concurrent_orders=8,
        description="Test stall serving Asian cuisine",
        cuisine_type="Asian",
        is_open=True,
        owner_id=stall_owner.id
    )
    session.add(stall_a)

    stall_b = Stall(
        name="Test Stall B",
        location="South Canteen Level 2",
        opening_time=time(9, 0),
        closing_time=time(21, 0),
        avg_prep_time=15,
        max_concurrent_orders=10,
        description="Test stall serving Western cuisine",
        cuisine_type="Western",
        is_open=True,
        owner_id=stall_owner.id
    )
    session.add(stall_b)

    stall_c = Stall(
        name="Test Stall C",
        location="Koufu Food Court",
        opening_time=time(7, 30),
        closing_time=time(22, 0),
        avg_prep_time=10,
        max_concurrent_orders=12,
        description="Test stall serving drinks and snacks",
        cuisine_type="Beverages",
        is_open=True,
        owner_id=stall_owner.id
    )
    session.add(stall_c)
    session.flush()

    menu_items_a = [
        MenuItem(stall_id=stall_a.id, name="Test Item A1", price=5.50, prep_time=10, category="Main", is_available=True),
        MenuItem(stall_id=stall_a.id, name="Test Item A2", price=4.80, prep_time=8, category="Main", is_available=True),
        MenuItem(stall_id=stall_a.id, name="Test Item A3", price=3.20, prep_time=5, category="Side", is_available=True),
        MenuItem(stall_id=stall_a.id, name="Test Item A4", price=6.00, prep_time=12, category="Main", is_available=False),
    ]

    menu_items_b = [
        MenuItem(stall_id=stall_b.id, name="Test Item B1", price=7.50, prep_time=15, category="Main", is_available=True),
        MenuItem(stall_id=stall_b.id, name="Test Item B2", price=6.80, prep_time=12, category="Main", is_available=True),
        MenuItem(stall_id=stall_b.id, name="Test Item B3", price=4.50, prep_time=8, category="Side", is_available=True),
        MenuItem(stall_id=stall_b.id, name="Test Item B4", price=8.00, prep_time=18, category="Main", is_available=True),
    ]

    menu_items_c = [
        MenuItem(stall_id=stall_c.id, name="Test Drink C1", price=2.50, prep_time=3, category="Beverage", is_available=True),
        MenuItem(stall_id=stall_c.id, name="Test Drink C2", price=3.00, prep_time=4, category="Beverage", is_available=True),
        MenuItem(stall_id=stall_c.id, name="Test Snack C3", price=2.00, prep_time=2, category="Snack", is_available=True),
    ]

    for item in menu_items_a + menu_items_b + menu_items_c:
        session.add(item)

    session.flush()

    sample_order = Order(
        user_id=test_user.id,
        stall_id=stall_a.id,
        total_amount=10.30,
        status=OrderStatus.PENDING,
        queue_number=1,
        pickup_time=datetime.now() + timedelta(minutes=15),
        order_number="ORD00001"
    )
    session.add(sample_order)
    session.flush()

    order_items = [
        OrderItem(order_id=sample_order.id, menu_item_id=menu_items_a[0].id, quantity=1, unit_price=5.50),
        OrderItem(order_id=sample_order.id, menu_item_id=menu_items_a[2].id, quantity=1, unit_price=3.20),
        OrderItem(order_id=sample_order.id, menu_item_id=menu_items_c[0].id, quantity=1, unit_price=2.50),
    ]

    for item in order_items:
        session.add(item)

    queue_entry = QueueEntry(
        stall_id=stall_a.id,
        order_id=sample_order.id,
        queue_position=1,
        estimated_wait_time=12,
        status=QueueStatus.WAITING
    )
    session.add(queue_entry)

def reset_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("✅ Database reset successfully!")

if __name__ == "__main__":
    init_database()