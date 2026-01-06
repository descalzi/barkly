from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db, DBDog, DBUser
from app.models import Dog, DogCreate, DogUpdate
from app.api.auth import get_current_user
import uuid

router = APIRouter()


@router.get("", response_model=List[Dog])
async def get_dogs(
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all dogs for the current user"""
    dogs = db.query(DBDog).filter(DBDog.user_id == current_user.id).all()
    return dogs


@router.post("", response_model=Dog, status_code=201)
async def create_dog(
    dog: DogCreate,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new dog for the current user"""
    db_dog = DBDog(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        name=dog.name,
        profile_picture=dog.profile_picture
    )
    db.add(db_dog)
    db.commit()
    db.refresh(db_dog)
    return db_dog


@router.get("/{dog_id}", response_model=Dog)
async def get_dog(
    dog_id: str,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific dog by ID"""
    dog = db.query(DBDog).filter(
        DBDog.id == dog_id,
        DBDog.user_id == current_user.id
    ).first()

    if not dog:
        raise HTTPException(status_code=404, detail="Dog not found")

    return dog


@router.put("/{dog_id}", response_model=Dog)
async def update_dog(
    dog_id: str,
    dog_update: DogUpdate,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a dog's information"""
    db_dog = db.query(DBDog).filter(
        DBDog.id == dog_id,
        DBDog.user_id == current_user.id
    ).first()

    if not db_dog:
        raise HTTPException(status_code=404, detail="Dog not found")

    # Update only provided fields
    if dog_update.name is not None:
        db_dog.name = dog_update.name
    if dog_update.profile_picture is not None:
        db_dog.profile_picture = dog_update.profile_picture

    db.commit()
    db.refresh(db_dog)
    return db_dog


@router.delete("/{dog_id}", status_code=204)
async def delete_dog(
    dog_id: str,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a dog (and all associated events)"""
    db_dog = db.query(DBDog).filter(
        DBDog.id == dog_id,
        DBDog.user_id == current_user.id
    ).first()

    if not db_dog:
        raise HTTPException(status_code=404, detail="Dog not found")

    db.delete(db_dog)
    db.commit()
    return None
