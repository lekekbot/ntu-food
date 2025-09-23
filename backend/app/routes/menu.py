from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.database import get_db
from app.models.menu import MenuItem
from app.models.stall import Stall
from app.schemas.menu import MenuItemCreate, MenuItemResponse, MenuItemUpdate
from app.routes.auth import get_current_user
from app.models.user import User, UserRole

router = APIRouter()

@router.get("/stall/{stall_id}", response_model=List[MenuItemResponse])
def get_stall_menu(stall_id: int, db: Session = Depends(get_db)):
    stall = db.query(Stall).filter(Stall.id == stall_id).first()
    if not stall:
        raise HTTPException(status_code=404, detail="Stall not found")

    menu_items = db.query(MenuItem).filter(MenuItem.stall_id == stall_id).all()
    return menu_items

@router.get("/{item_id}", response_model=MenuItemResponse)
def get_menu_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return item

@router.post("/", response_model=MenuItemResponse)
def create_menu_item(
    menu_item: MenuItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    stall = db.query(Stall).filter(Stall.id == menu_item.stall_id).first()
    if not stall:
        raise HTTPException(status_code=404, detail="Stall not found")

    if stall.owner_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to add items to this stall")

    db_item = MenuItem(**menu_item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.put("/{item_id}", response_model=MenuItemResponse)
def update_menu_item(
    item_id: int,
    item_update: MenuItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")

    if item.stall.owner_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to update this item")

    for key, value in item_update.dict(exclude_unset=True).items():
        setattr(item, key, value)

    db.commit()
    db.refresh(item)
    return item

@router.delete("/{item_id}")
def delete_menu_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")

    if item.stall.owner_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to delete this item")

    db.delete(item)
    db.commit()
    return {"message": "Menu item deleted successfully"}