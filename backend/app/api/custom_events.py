"""
API endpoints for managing custom event types
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.database import get_db, DBCustomEvent, DBUser
from app.models import CustomEvent, CustomEventCreate, CustomEventUpdate
from app.api.auth import get_current_user

router = APIRouter()


@router.get("", response_model=List[CustomEvent])
def get_custom_events(
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user)
):
    """Get all custom events for the current user"""
    custom_events = db.query(DBCustomEvent).filter(
        DBCustomEvent.user_id == current_user.id
    ).all()

    return custom_events


@router.post("", response_model=CustomEvent, status_code=status.HTTP_201_CREATED)
def create_custom_event(
    custom_event: CustomEventCreate,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user)
):
    """Create a new custom event type"""
    # Create new custom event
    db_custom_event = DBCustomEvent(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        name=custom_event.name
    )

    db.add(db_custom_event)
    db.commit()
    db.refresh(db_custom_event)

    return db_custom_event


@router.get("/{custom_event_id}", response_model=CustomEvent)
def get_custom_event(
    custom_event_id: str,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user)
):
    """Get a specific custom event by ID"""
    custom_event = db.query(DBCustomEvent).filter(
        DBCustomEvent.id == custom_event_id,
        DBCustomEvent.user_id == current_user.id
    ).first()

    if not custom_event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Custom event not found"
        )

    return custom_event


@router.put("/{custom_event_id}", response_model=CustomEvent)
def update_custom_event(
    custom_event_id: str,
    custom_event_update: CustomEventUpdate,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user)
):
    """Update a custom event type"""
    # Get existing custom event
    db_custom_event = db.query(DBCustomEvent).filter(
        DBCustomEvent.id == custom_event_id,
        DBCustomEvent.user_id == current_user.id
    ).first()

    if not db_custom_event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Custom event not found"
        )

    # Update fields
    if custom_event_update.name is not None:
        db_custom_event.name = custom_event_update.name

    db.commit()
    db.refresh(db_custom_event)

    return db_custom_event


@router.delete("/{custom_event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_custom_event(
    custom_event_id: str,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_user)
):
    """Delete a custom event type and all associated timeline entries"""
    # Get existing custom event
    db_custom_event = db.query(DBCustomEvent).filter(
        DBCustomEvent.id == custom_event_id,
        DBCustomEvent.user_id == current_user.id
    ).first()

    if not db_custom_event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Custom event not found"
        )

    # Delete the custom event (cascade will delete all related events)
    db.delete(db_custom_event)
    db.commit()

    return None
