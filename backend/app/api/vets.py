from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db, DBVet, DBUser
from app.models import Vet, VetCreate, VetUpdate
from app.api.auth import get_current_user
import uuid

router = APIRouter()


@router.get("", response_model=List[Vet])
async def get_vets(
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all vets for the current user"""
    vets = db.query(DBVet).filter(DBVet.user_id == current_user.id).all()
    return vets


@router.post("", response_model=Vet, status_code=201)
async def create_vet(
    vet: VetCreate,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new vet for the current user"""
    db_vet = DBVet(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        name=vet.name,
        contact_info=vet.contact_info,
        notes=vet.notes
    )
    db.add(db_vet)
    db.commit()
    db.refresh(db_vet)
    return db_vet


@router.get("/{vet_id}", response_model=Vet)
async def get_vet(
    vet_id: str,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific vet by ID"""
    vet = db.query(DBVet).filter(
        DBVet.id == vet_id,
        DBVet.user_id == current_user.id
    ).first()

    if not vet:
        raise HTTPException(status_code=404, detail="Vet not found")

    return vet


@router.put("/{vet_id}", response_model=Vet)
async def update_vet(
    vet_id: str,
    vet_update: VetUpdate,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a vet's information"""
    db_vet = db.query(DBVet).filter(
        DBVet.id == vet_id,
        DBVet.user_id == current_user.id
    ).first()

    if not db_vet:
        raise HTTPException(status_code=404, detail="Vet not found")

    # Update only provided fields
    if vet_update.name is not None:
        db_vet.name = vet_update.name
    if vet_update.contact_info is not None:
        db_vet.contact_info = vet_update.contact_info
    if vet_update.notes is not None:
        db_vet.notes = vet_update.notes

    db.commit()
    db.refresh(db_vet)
    return db_vet


@router.delete("/{vet_id}", status_code=204)
async def delete_vet(
    vet_id: str,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a vet (and all associated vet visits)"""
    db_vet = db.query(DBVet).filter(
        DBVet.id == vet_id,
        DBVet.user_id == current_user.id
    ).first()

    if not db_vet:
        raise HTTPException(status_code=404, detail="Vet not found")

    db.delete(db_vet)
    db.commit()
    return None
