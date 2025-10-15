from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.database import get_db
from app.models.stall import Stall
from app.schemas.stall import StallCreate, StallResponse, StallUpdate, StallWithDistance
from app.routes.auth import get_current_user
from app.models.user import User, UserRole
from app.utils.distance import get_distance_and_time

router = APIRouter()

@router.get("/", response_model=List[StallResponse])
def get_all_stalls(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    stalls = db.query(Stall).offset(skip).limit(limit).all()
    return stalls

@router.get("/nearby", response_model=List[StallWithDistance])
def get_nearby_stalls(
    lat: float = Query(..., description="User's latitude"),
    lng: float = Query(..., description="User's longitude"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get stalls sorted by distance from user's location.
    Returns stalls with distance and walking time information.

    Example: /api/stalls/nearby?lat=1.347&lng=103.680
    """
    # Get all stalls
    stalls = db.query(Stall).offset(skip).limit(limit).all()

    # Calculate distance and walking time for each stall
    stalls_with_distance = []
    for stall in stalls:
        distance_km, walking_time = get_distance_and_time(
            lat, lng, stall.latitude, stall.longitude
        )

        # Convert stall to dict and add distance info
        stall_dict = {
            "id": stall.id,
            "name": stall.name,
            "location": stall.location,
            "opening_time": stall.opening_time,
            "closing_time": stall.closing_time,
            "avg_prep_time": stall.avg_prep_time,
            "max_concurrent_orders": stall.max_concurrent_orders,
            "description": stall.description,
            "cuisine_type": stall.cuisine_type,
            "image_url": stall.image_url,
            "is_open": stall.is_open,
            "rating": stall.rating,
            "owner_id": stall.owner_id,
            "latitude": stall.latitude,
            "longitude": stall.longitude,
            "building_name": stall.building_name,
            "distance_km": distance_km,
            "walking_time_minutes": walking_time
        }
        stalls_with_distance.append(stall_dict)

    # Sort by distance (closest first), putting stalls without coordinates at the end
    stalls_with_distance.sort(
        key=lambda x: (x["distance_km"] is None, x["distance_km"] or float('inf'))
    )

    return stalls_with_distance

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