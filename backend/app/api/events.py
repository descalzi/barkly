from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db, DBEvent, DBUser, DBDog
from app.models import Event, EventCreate, EventUpdate
from app.api.auth import get_current_user
import uuid

router = APIRouter()


@router.get("", response_model=List[Event])
async def get_events(
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db),
    dog_id: str = None
):
    """Get all events for the current user, optionally filtered by dog_id"""
    # Get all dog IDs that belong to the current user
    user_dog_ids = [dog.id for dog in db.query(DBDog).filter(DBDog.user_id == current_user.id).all()]

    # Build query to get events only for user's dogs
    query = db.query(DBEvent).filter(DBEvent.dog_id.in_(user_dog_ids))

    # Optional filter by specific dog
    if dog_id:
        if dog_id not in user_dog_ids:
            raise HTTPException(status_code=403, detail="Access denied to this dog")
        query = query.filter(DBEvent.dog_id == dog_id)

    # Order by date descending (most recent first)
    events = query.order_by(DBEvent.date.desc()).all()
    return events


@router.post("", response_model=Event, status_code=201)
async def create_event(
    event: EventCreate,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new health event"""
    # Validate that either event_type or custom_event_id is provided (not both, not neither)
    if not event.event_type and not event.custom_event_id:
        raise HTTPException(status_code=400, detail="Either event_type or custom_event_id must be provided")
    if event.event_type and event.custom_event_id:
        raise HTTPException(status_code=400, detail="Cannot specify both event_type and custom_event_id")

    # Verify the dog belongs to the current user
    dog = db.query(DBDog).filter(
        DBDog.id == event.dog_id,
        DBDog.user_id == current_user.id
    ).first()

    if not dog:
        raise HTTPException(status_code=404, detail="Dog not found or access denied")

    # If custom_event_id is provided, verify it belongs to the current user
    if event.custom_event_id:
        from app.database import DBCustomEvent
        custom_event = db.query(DBCustomEvent).filter(
            DBCustomEvent.id == event.custom_event_id,
            DBCustomEvent.user_id == current_user.id
        ).first()
        if not custom_event:
            raise HTTPException(status_code=404, detail="Custom event not found or access denied")

    db_event = DBEvent(
        id=str(uuid.uuid4()),
        dog_id=event.dog_id,
        event_type=event.event_type,
        custom_event_id=event.custom_event_id,
        date=event.date,
        time_of_day=event.time_of_day,
        poo_quality=event.poo_quality,
        vomit_quality=event.vomit_quality,
        notes=event.notes
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event


@router.get("/{event_id}", response_model=Event)
async def get_event(
    event_id: str,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific event by ID"""
    event = db.query(DBEvent).filter(DBEvent.id == event_id).first()

    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Verify the event's dog belongs to the current user
    dog = db.query(DBDog).filter(
        DBDog.id == event.dog_id,
        DBDog.user_id == current_user.id
    ).first()

    if not dog:
        raise HTTPException(status_code=403, detail="Access denied")

    return event


@router.put("/{event_id}", response_model=Event)
async def update_event(
    event_id: str,
    event_update: EventUpdate,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an event's information"""
    db_event = db.query(DBEvent).filter(DBEvent.id == event_id).first()

    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Verify the event's dog belongs to the current user
    dog = db.query(DBDog).filter(
        DBDog.id == db_event.dog_id,
        DBDog.user_id == current_user.id
    ).first()

    if not dog:
        raise HTTPException(status_code=403, detail="Access denied")

    # If changing the dog_id, verify the new dog also belongs to the user
    if event_update.dog_id is not None and event_update.dog_id != db_event.dog_id:
        new_dog = db.query(DBDog).filter(
            DBDog.id == event_update.dog_id,
            DBDog.user_id == current_user.id
        ).first()
        if not new_dog:
            raise HTTPException(status_code=404, detail="New dog not found or access denied")
        db_event.dog_id = event_update.dog_id

    # If changing the custom_event_id, verify it belongs to the user
    if event_update.custom_event_id is not None:
        from app.database import DBCustomEvent
        custom_event = db.query(DBCustomEvent).filter(
            DBCustomEvent.id == event_update.custom_event_id,
            DBCustomEvent.user_id == current_user.id
        ).first()
        if not custom_event:
            raise HTTPException(status_code=404, detail="Custom event not found or access denied")
        db_event.custom_event_id = event_update.custom_event_id

    # Update only provided fields
    if event_update.event_type is not None:
        db_event.event_type = event_update.event_type
    if event_update.date is not None:
        db_event.date = event_update.date
    if event_update.time_of_day is not None:
        db_event.time_of_day = event_update.time_of_day
    if event_update.poo_quality is not None:
        db_event.poo_quality = event_update.poo_quality
    if event_update.vomit_quality is not None:
        db_event.vomit_quality = event_update.vomit_quality
    if event_update.notes is not None:
        db_event.notes = event_update.notes

    db.commit()
    db.refresh(db_event)
    return db_event


@router.delete("/{event_id}", status_code=204)
async def delete_event(
    event_id: str,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an event"""
    db_event = db.query(DBEvent).filter(DBEvent.id == event_id).first()

    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Verify the event's dog belongs to the current user
    dog = db.query(DBDog).filter(
        DBDog.id == db_event.dog_id,
        DBDog.user_id == current_user.id
    ).first()

    if not dog:
        raise HTTPException(status_code=403, detail="Access denied")

    db.delete(db_event)
    db.commit()
    return None
