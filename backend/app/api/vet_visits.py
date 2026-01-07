from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db, DBVetVisit, DBUser, DBDog, DBVet
from app.models import VetVisit, VetVisitCreate, VetVisitUpdate
from app.api.auth import get_current_user
import uuid

router = APIRouter()


@router.get("", response_model=List[VetVisit])
async def get_vet_visits(
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db),
    dog_id: str = None
):
    """Get all vet visits for the current user, optionally filtered by dog_id"""
    # Get all dog IDs that belong to the current user
    user_dog_ids = [dog.id for dog in db.query(DBDog).filter(DBDog.user_id == current_user.id).all()]

    # Build query to get vet visits only for user's dogs
    query = db.query(DBVetVisit).filter(DBVetVisit.dog_id.in_(user_dog_ids))

    # Optional filter by specific dog
    if dog_id:
        if dog_id not in user_dog_ids:
            raise HTTPException(status_code=403, detail="Access denied to this dog")
        query = query.filter(DBVetVisit.dog_id == dog_id)

    # Order by date descending (most recent first)
    vet_visits = query.order_by(DBVetVisit.date.desc()).all()
    return vet_visits


@router.post("", response_model=VetVisit, status_code=201)
async def create_vet_visit(
    vet_visit: VetVisitCreate,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new vet visit record"""
    # Verify the dog belongs to the current user
    dog = db.query(DBDog).filter(
        DBDog.id == vet_visit.dog_id,
        DBDog.user_id == current_user.id
    ).first()

    if not dog:
        raise HTTPException(status_code=404, detail="Dog not found or access denied")

    # Verify the vet belongs to the current user
    vet = db.query(DBVet).filter(
        DBVet.id == vet_visit.vet_id,
        DBVet.user_id == current_user.id
    ).first()

    if not vet:
        raise HTTPException(status_code=404, detail="Vet not found or access denied")

    db_vet_visit = DBVetVisit(
        id=str(uuid.uuid4()),
        dog_id=vet_visit.dog_id,
        vet_id=vet_visit.vet_id,
        date=vet_visit.date,
        time_of_day=vet_visit.time_of_day,
        notes=vet_visit.notes
    )
    db.add(db_vet_visit)
    db.commit()
    db.refresh(db_vet_visit)
    return db_vet_visit


@router.get("/{vet_visit_id}", response_model=VetVisit)
async def get_vet_visit(
    vet_visit_id: str,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific vet visit by ID"""
    vet_visit = db.query(DBVetVisit).filter(DBVetVisit.id == vet_visit_id).first()

    if not vet_visit:
        raise HTTPException(status_code=404, detail="Vet visit not found")

    # Verify the vet visit's dog belongs to the current user
    dog = db.query(DBDog).filter(
        DBDog.id == vet_visit.dog_id,
        DBDog.user_id == current_user.id
    ).first()

    if not dog:
        raise HTTPException(status_code=403, detail="Access denied")

    return vet_visit


@router.put("/{vet_visit_id}", response_model=VetVisit)
async def update_vet_visit(
    vet_visit_id: str,
    vet_visit_update: VetVisitUpdate,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a vet visit's information"""
    db_vet_visit = db.query(DBVetVisit).filter(DBVetVisit.id == vet_visit_id).first()

    if not db_vet_visit:
        raise HTTPException(status_code=404, detail="Vet visit not found")

    # Verify the vet visit's dog belongs to the current user
    dog = db.query(DBDog).filter(
        DBDog.id == db_vet_visit.dog_id,
        DBDog.user_id == current_user.id
    ).first()

    if not dog:
        raise HTTPException(status_code=403, detail="Access denied")

    # If changing the dog_id, verify the new dog also belongs to the user
    if vet_visit_update.dog_id is not None and vet_visit_update.dog_id != db_vet_visit.dog_id:
        new_dog = db.query(DBDog).filter(
            DBDog.id == vet_visit_update.dog_id,
            DBDog.user_id == current_user.id
        ).first()
        if not new_dog:
            raise HTTPException(status_code=404, detail="New dog not found or access denied")
        db_vet_visit.dog_id = vet_visit_update.dog_id

    # If changing the vet_id, verify the new vet also belongs to the user
    if vet_visit_update.vet_id is not None and vet_visit_update.vet_id != db_vet_visit.vet_id:
        new_vet = db.query(DBVet).filter(
            DBVet.id == vet_visit_update.vet_id,
            DBVet.user_id == current_user.id
        ).first()
        if not new_vet:
            raise HTTPException(status_code=404, detail="New vet not found or access denied")
        db_vet_visit.vet_id = vet_visit_update.vet_id

    # Update only provided fields
    if vet_visit_update.date is not None:
        db_vet_visit.date = vet_visit_update.date
    if vet_visit_update.time_of_day is not None:
        db_vet_visit.time_of_day = vet_visit_update.time_of_day
    if vet_visit_update.notes is not None:
        db_vet_visit.notes = vet_visit_update.notes

    db.commit()
    db.refresh(db_vet_visit)
    return db_vet_visit


@router.delete("/{vet_visit_id}", status_code=204)
async def delete_vet_visit(
    vet_visit_id: str,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a vet visit"""
    db_vet_visit = db.query(DBVetVisit).filter(DBVetVisit.id == vet_visit_id).first()

    if not db_vet_visit:
        raise HTTPException(status_code=404, detail="Vet visit not found")

    # Verify the vet visit's dog belongs to the current user
    dog = db.query(DBDog).filter(
        DBDog.id == db_vet_visit.dog_id,
        DBDog.user_id == current_user.id
    ).first()

    if not dog:
        raise HTTPException(status_code=403, detail="Access denied")

    db.delete(db_vet_visit)
    db.commit()
    return None
