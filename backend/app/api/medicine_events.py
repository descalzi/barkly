from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db, DBMedicineEvent, DBUser, DBDog, DBMedicine
from app.models import MedicineEvent, MedicineEventCreate, MedicineEventUpdate
from app.api.auth import get_current_user
import uuid

router = APIRouter()


@router.get("", response_model=List[MedicineEvent])
async def get_medicine_events(
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db),
    dog_id: str = None
):
    """Get all medicine events for the current user, optionally filtered by dog_id"""
    # Get all dog IDs that belong to the current user
    user_dog_ids = [dog.id for dog in db.query(DBDog).filter(DBDog.user_id == current_user.id).all()]

    # Build query to get medicine events only for user's dogs
    query = db.query(DBMedicineEvent).filter(DBMedicineEvent.dog_id.in_(user_dog_ids))

    # Optional filter by specific dog
    if dog_id:
        if dog_id not in user_dog_ids:
            raise HTTPException(status_code=403, detail="Access denied to this dog")
        query = query.filter(DBMedicineEvent.dog_id == dog_id)

    # Order by date descending (most recent first)
    medicine_events = query.order_by(DBMedicineEvent.date.desc()).all()
    return medicine_events


@router.post("", response_model=MedicineEvent, status_code=201)
async def create_medicine_event(
    medicine_event: MedicineEventCreate,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new medicine administration record"""
    # Verify the dog belongs to the current user
    dog = db.query(DBDog).filter(
        DBDog.id == medicine_event.dog_id,
        DBDog.user_id == current_user.id
    ).first()

    if not dog:
        raise HTTPException(status_code=404, detail="Dog not found or access denied")

    # Verify the medicine belongs to the current user
    medicine = db.query(DBMedicine).filter(
        DBMedicine.id == medicine_event.medicine_id,
        DBMedicine.user_id == current_user.id
    ).first()

    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found or access denied")

    db_medicine_event = DBMedicineEvent(
        id=str(uuid.uuid4()),
        dog_id=medicine_event.dog_id,
        medicine_id=medicine_event.medicine_id,
        date=medicine_event.date,
        time_of_day=medicine_event.time_of_day,
        dosage=medicine_event.dosage,
        notes=medicine_event.notes
    )
    db.add(db_medicine_event)
    db.commit()
    db.refresh(db_medicine_event)
    return db_medicine_event


@router.get("/{medicine_event_id}", response_model=MedicineEvent)
async def get_medicine_event(
    medicine_event_id: str,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific medicine event by ID"""
    medicine_event = db.query(DBMedicineEvent).filter(DBMedicineEvent.id == medicine_event_id).first()

    if not medicine_event:
        raise HTTPException(status_code=404, detail="Medicine event not found")

    # Verify the medicine event's dog belongs to the current user
    dog = db.query(DBDog).filter(
        DBDog.id == medicine_event.dog_id,
        DBDog.user_id == current_user.id
    ).first()

    if not dog:
        raise HTTPException(status_code=403, detail="Access denied")

    return medicine_event


@router.put("/{medicine_event_id}", response_model=MedicineEvent)
async def update_medicine_event(
    medicine_event_id: str,
    medicine_event_update: MedicineEventUpdate,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a medicine event's information"""
    db_medicine_event = db.query(DBMedicineEvent).filter(DBMedicineEvent.id == medicine_event_id).first()

    if not db_medicine_event:
        raise HTTPException(status_code=404, detail="Medicine event not found")

    # Verify the medicine event's dog belongs to the current user
    dog = db.query(DBDog).filter(
        DBDog.id == db_medicine_event.dog_id,
        DBDog.user_id == current_user.id
    ).first()

    if not dog:
        raise HTTPException(status_code=403, detail="Access denied")

    # If changing the dog_id, verify the new dog also belongs to the user
    if medicine_event_update.dog_id is not None and medicine_event_update.dog_id != db_medicine_event.dog_id:
        new_dog = db.query(DBDog).filter(
            DBDog.id == medicine_event_update.dog_id,
            DBDog.user_id == current_user.id
        ).first()
        if not new_dog:
            raise HTTPException(status_code=404, detail="New dog not found or access denied")
        db_medicine_event.dog_id = medicine_event_update.dog_id

    # If changing the medicine_id, verify the new medicine also belongs to the user
    if medicine_event_update.medicine_id is not None and medicine_event_update.medicine_id != db_medicine_event.medicine_id:
        new_medicine = db.query(DBMedicine).filter(
            DBMedicine.id == medicine_event_update.medicine_id,
            DBMedicine.user_id == current_user.id
        ).first()
        if not new_medicine:
            raise HTTPException(status_code=404, detail="New medicine not found or access denied")
        db_medicine_event.medicine_id = medicine_event_update.medicine_id

    # Update only provided fields
    if medicine_event_update.date is not None:
        db_medicine_event.date = medicine_event_update.date
    if medicine_event_update.time_of_day is not None:
        db_medicine_event.time_of_day = medicine_event_update.time_of_day
    if medicine_event_update.dosage is not None:
        db_medicine_event.dosage = medicine_event_update.dosage
    if medicine_event_update.notes is not None:
        db_medicine_event.notes = medicine_event_update.notes

    db.commit()
    db.refresh(db_medicine_event)
    return db_medicine_event


@router.delete("/{medicine_event_id}", status_code=204)
async def delete_medicine_event(
    medicine_event_id: str,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a medicine event"""
    db_medicine_event = db.query(DBMedicineEvent).filter(DBMedicineEvent.id == medicine_event_id).first()

    if not db_medicine_event:
        raise HTTPException(status_code=404, detail="Medicine event not found")

    # Verify the medicine event's dog belongs to the current user
    dog = db.query(DBDog).filter(
        DBDog.id == db_medicine_event.dog_id,
        DBDog.user_id == current_user.id
    ).first()

    if not dog:
        raise HTTPException(status_code=403, detail="Access denied")

    db.delete(db_medicine_event)
    db.commit()
    return None
