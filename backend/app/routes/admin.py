from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import List, Optional
from datetime import datetime, date
from app.database.database import get_db
from app.models.user import User, UserRole
from app.models.stall import Stall
from app.models.menu import MenuItem
from app.models.order import Order, OrderItem, OrderStatus
from app.models.queue import QueueEntry, QueueStatus
from app.schemas.admin import (
    UserUpdate, StallCreate, StallUpdate, MenuItemCreate, MenuItemUpdate,
    OrderStatusUpdate, UserListResponse, StallListResponse, MenuItemResponse,
    OrderListResponse, AnalyticsResponse, DashboardStats
)
from app.routes.auth import get_current_user, get_password_hash

router = APIRouter()

async def get_admin_user(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

@router.get("/users", response_model=List[UserListResponse])
async def get_all_users(
    skip: int = 0,
    limit: int = 100,
    role: Optional[str] = None,
    is_active: Optional[bool] = None,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    query = db.query(User)

    if role:
        query = query.filter(User.role == role)
    if is_active is not None:
        query = query.filter(User.is_active == is_active)

    users = query.offset(skip).limit(limit).all()
    return users

@router.get("/users/{user_id}", response_model=UserListResponse)
async def get_user(
    user_id: int,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/users/{user_id}", response_model=UserListResponse)
async def update_user(
    user_id: int,
    user_update: UserUpdate,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    update_data = user_update.model_dump(exclude_unset=True)

    if "password" in update_data and update_data["password"]:
        update_data["hashed_password"] = get_password_hash(update_data.pop("password"))

    for field, value in update_data.items():
        setattr(db_user, field, value)

    db_user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_user)
    return db_user

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    if db_user.role == UserRole.ADMIN:
        raise HTTPException(status_code=400, detail="Cannot delete admin users")

    db.delete(db_user)
    db.commit()
    return {"message": "User deleted successfully"}

@router.get("/stalls", response_model=List[StallListResponse])
async def get_all_stalls(
    skip: int = 0,
    limit: int = 100,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    stalls = db.query(Stall).offset(skip).limit(limit).all()
    return stalls

@router.post("/stalls", response_model=StallListResponse)
async def create_stall(
    stall: StallCreate,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    if stall.owner_id:
        owner = db.query(User).filter(User.id == stall.owner_id).first()
        if not owner:
            raise HTTPException(status_code=404, detail="Owner user not found")
        if owner.role not in [UserRole.STALL_OWNER, UserRole.ADMIN]:
            raise HTTPException(status_code=400, detail="User must be a stall owner or admin")

    db_stall = Stall(**stall.model_dump())
    db.add(db_stall)
    db.commit()
    db.refresh(db_stall)
    return db_stall

@router.put("/stalls/{stall_id}", response_model=StallListResponse)
async def update_stall(
    stall_id: int,
    stall_update: StallUpdate,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    db_stall = db.query(Stall).filter(Stall.id == stall_id).first()
    if not db_stall:
        raise HTTPException(status_code=404, detail="Stall not found")

    update_data = stall_update.model_dump(exclude_unset=True)

    if "owner_id" in update_data and update_data["owner_id"]:
        owner = db.query(User).filter(User.id == update_data["owner_id"]).first()
        if not owner:
            raise HTTPException(status_code=404, detail="Owner user not found")
        if owner.role not in [UserRole.STALL_OWNER, UserRole.ADMIN]:
            raise HTTPException(status_code=400, detail="User must be a stall owner or admin")

    for field, value in update_data.items():
        setattr(db_stall, field, value)

    db.commit()
    db.refresh(db_stall)
    return db_stall

@router.delete("/stalls/{stall_id}")
async def delete_stall(
    stall_id: int,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    db_stall = db.query(Stall).filter(Stall.id == stall_id).first()
    if not db_stall:
        raise HTTPException(status_code=404, detail="Stall not found")

    db.delete(db_stall)
    db.commit()
    return {"message": "Stall deleted successfully"}

@router.get("/menu-items", response_model=List[MenuItemResponse])
async def get_all_menu_items(
    stall_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    query = db.query(MenuItem)
    if stall_id:
        query = query.filter(MenuItem.stall_id == stall_id)

    items = query.offset(skip).limit(limit).all()
    return items

@router.post("/menu-items", response_model=MenuItemResponse)
async def create_menu_item(
    menu_item: MenuItemCreate,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    stall = db.query(Stall).filter(Stall.id == menu_item.stall_id).first()
    if not stall:
        raise HTTPException(status_code=404, detail="Stall not found")

    db_item = MenuItem(**menu_item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.put("/menu-items/{item_id}", response_model=MenuItemResponse)
async def update_menu_item(
    item_id: int,
    item_update: MenuItemUpdate,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    db_item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Menu item not found")

    update_data = item_update.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(db_item, field, value)

    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/menu-items/{item_id}")
async def delete_menu_item(
    item_id: int,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    db_item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Menu item not found")

    db.delete(db_item)
    db.commit()
    return {"message": "Menu item deleted successfully"}

@router.get("/orders", response_model=List[OrderListResponse])
async def get_all_orders(
    status: Optional[str] = None,
    stall_id: Optional[int] = None,
    user_id: Optional[int] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    skip: int = 0,
    limit: int = 100,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    query = db.query(Order)

    if status:
        query = query.filter(Order.status == status)
    if stall_id:
        query = query.filter(Order.stall_id == stall_id)
    if user_id:
        query = query.filter(Order.user_id == user_id)
    if date_from:
        query = query.filter(Order.created_at >= date_from)
    if date_to:
        query = query.filter(Order.created_at <= date_to)

    orders = query.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()
    return orders

@router.get("/orders/{order_id}", response_model=OrderListResponse)
async def get_order(
    order_id: int,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.put("/orders/{order_id}/status")
async def update_order_status(
    order_id: int,
    status_update: OrderStatusUpdate,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = status_update.status
    order.updated_at = datetime.utcnow()

    if status_update.status == OrderStatus.READY:
        queue_entry = db.query(QueueEntry).filter(QueueEntry.order_id == order_id).first()
        if queue_entry:
            queue_entry.status = QueueStatus.READY
            queue_entry.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(order)
    return order

@router.delete("/orders/{order_id}")
async def delete_order(
    order_id: int,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    db.delete(order)
    db.commit()
    return {"message": "Order deleted successfully"}

@router.get("/analytics/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    total_users = db.query(func.count(User.id)).scalar()
    total_stalls = db.query(func.count(Stall.id)).scalar()
    total_orders = db.query(func.count(Order.id)).scalar()

    active_orders = db.query(func.count(Order.id)).filter(
        Order.status.in_([OrderStatus.PENDING, OrderStatus.PREPARING])
    ).scalar()

    total_revenue = db.query(func.sum(Order.total_amount)).filter(
        Order.status == OrderStatus.COMPLETED
    ).scalar() or 0.0

    today = datetime.utcnow().date()
    today_orders = db.query(func.count(Order.id)).filter(
        func.date(Order.created_at) == today
    ).scalar()

    today_revenue = db.query(func.sum(Order.total_amount)).filter(
        and_(
            func.date(Order.created_at) == today,
            Order.status == OrderStatus.COMPLETED
        )
    ).scalar() or 0.0

    active_users = db.query(func.count(User.id)).filter(User.is_active == True).scalar()

    return {
        "total_users": total_users,
        "active_users": active_users,
        "total_stalls": total_stalls,
        "total_orders": total_orders,
        "active_orders": active_orders,
        "total_revenue": total_revenue,
        "today_orders": today_orders,
        "today_revenue": today_revenue
    }

@router.get("/analytics/popular-items")
async def get_popular_items(
    limit: int = 10,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    popular_items = db.query(
        MenuItem.id,
        MenuItem.name,
        MenuItem.stall_id,
        Stall.name.label('stall_name'),
        func.count(OrderItem.id).label('order_count'),
        func.sum(OrderItem.quantity).label('total_quantity'),
        func.sum(OrderItem.quantity * OrderItem.unit_price).label('total_revenue')
    ).join(
        OrderItem, MenuItem.id == OrderItem.menu_item_id
    ).join(
        Order, OrderItem.order_id == Order.id
    ).join(
        Stall, MenuItem.stall_id == Stall.id
    ).filter(
        Order.status == OrderStatus.COMPLETED
    ).group_by(
        MenuItem.id, MenuItem.name, MenuItem.stall_id, Stall.name
    ).order_by(
        func.sum(OrderItem.quantity).desc()
    ).limit(limit).all()

    return [
        {
            "menu_item_id": item.id,
            "name": item.name,
            "stall_id": item.stall_id,
            "stall_name": item.stall_name,
            "order_count": item.order_count,
            "total_quantity": item.total_quantity,
            "total_revenue": float(item.total_revenue or 0)
        }
        for item in popular_items
    ]

@router.get("/analytics/stall-performance")
async def get_stall_performance(
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    stall_stats = db.query(
        Stall.id,
        Stall.name,
        func.count(Order.id).label('total_orders'),
        func.sum(Order.total_amount).label('total_revenue'),
        func.avg(Order.total_amount).label('avg_order_value'),
        func.count(
            func.distinct(Order.user_id)
        ).label('unique_customers')
    ).outerjoin(
        Order, Stall.id == Order.stall_id
    ).group_by(
        Stall.id, Stall.name
    ).order_by(
        func.sum(Order.total_amount).desc()
    ).all()

    return [
        {
            "stall_id": stat.id,
            "stall_name": stat.name,
            "total_orders": stat.total_orders,
            "total_revenue": float(stat.total_revenue or 0),
            "avg_order_value": float(stat.avg_order_value or 0),
            "unique_customers": stat.unique_customers
        }
        for stat in stall_stats
    ]

@router.get("/analytics/recent-activity")
async def get_recent_activity(
    limit: int = 20,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    recent_orders = db.query(Order).order_by(Order.created_at.desc()).limit(limit).all()

    return [
        {
            "id": order.id,
            "order_number": order.order_number,
            "user_id": order.user_id,
            "stall_id": order.stall_id,
            "status": order.status.value,
            "total_amount": order.total_amount,
            "created_at": order.created_at.isoformat(),
            "user_name": order.user.name if order.user else None,
            "stall_name": order.stall.name if order.stall else None
        }
        for order in recent_orders
    ]

@router.post("/seed-admin")
async def seed_admin_user(db: Session = Depends(get_db)):
    existing_admin = db.query(User).filter(User.role == UserRole.ADMIN).first()
    if existing_admin:
        return {"message": "Admin user already exists", "email": existing_admin.ntu_email}

    admin_user = User(
        ntu_email="admin@ntu.edu.sg",
        student_id="ADMIN001",
        name="System Administrator",
        phone="+65 12345678",
        hashed_password=get_password_hash("admin123"),
        role=UserRole.ADMIN,
        is_active=True,
        is_verified=True
    )

    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)

    return {
        "message": "Admin user created successfully",
        "email": "admin@ntu.edu.sg",
        "password": "admin123",
        "note": "Please change the password after first login"
    }