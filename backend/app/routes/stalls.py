from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.database import get_db
from app.models.stall import Stall
from app.schemas.stall import StallCreate, StallResponse, StallUpdate
from app.routes.auth import get_current_user
from app.models.user import User, UserRole

router = APIRouter()

@router.get("/", response_model=List[StallResponse])
def get_all_stalls(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    stalls = db.query(Stall).offset(skip).limit(limit).all()
    return stalls

@router.get("/{stall_id}", response_model=StallResponse)
def get_stall(stall_id: int, db: Session = Depends(get_db)):
    stall = db.query(Stall).filter(Stall.id == stall_id).first()
    if not stall:
        raise HTTPException(status_code=404, detail="Stall not found")
    return stall

@router.post("/", response_model=StallResponse)
def create_stall(
    stall: StallCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in [UserRole.STALL_OWNER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized to create stalls")

    db_stall = Stall(**stall.dict(), owner_id=current_user.id)
    db.add(db_stall)
    db.commit()
    db.refresh(db_stall)
    return db_stall

@router.put("/{stall_id}", response_model=StallResponse)
def update_stall(
    stall_id: int,
    stall_update: StallUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    stall = db.query(Stall).filter(Stall.id == stall_id).first()
    if not stall:
        raise HTTPException(status_code=404, detail="Stall not found")

    if stall.owner_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to update this stall")

    for key, value in stall_update.dict(exclude_unset=True).items():
        setattr(stall, key, value)

    db.commit()
    db.refresh(stall)
    return stall

@router.delete("/{stall_id}")
def delete_stall(
    stall_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    stall = db.query(Stall).filter(Stall.id == stall_id).first()
    if not stall:
        raise HTTPException(status_code=404, detail="Stall not found")

    if stall.owner_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to delete this stall")

    db.delete(stall)
    db.commit()
    return {"message": "Stall deleted successfully"}