from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db, DBMedicine, DBUser
from app.models import Medicine, MedicineCreate, MedicineUpdate
from app.api.auth import get_current_user
import uuid

router = APIRouter()


@router.get("", response_model=List[Medicine])
async def get_medicines(
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all medicines for the current user"""
    medicines = db.query(DBMedicine).filter(DBMedicine.user_id == current_user.id).all()
    return medicines


@router.post("", response_model=Medicine, status_code=201)
async def create_medicine(
    medicine: MedicineCreate,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new medicine for the current user"""
    db_medicine = DBMedicine(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        name=medicine.name,
        type=medicine.type,
        description=medicine.description
    )
    db.add(db_medicine)
    db.commit()
    db.refresh(db_medicine)
    return db_medicine


@router.get("/{medicine_id}", response_model=Medicine)
async def get_medicine(
    medicine_id: str,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific medicine by ID"""
    medicine = db.query(DBMedicine).filter(
        DBMedicine.id == medicine_id,
        DBMedicine.user_id == current_user.id
    ).first()

    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")

    return medicine


@router.put("/{medicine_id}", response_model=Medicine)
async def update_medicine(
    medicine_id: str,
    medicine_update: MedicineUpdate,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a medicine's information"""
    db_medicine = db.query(DBMedicine).filter(
        DBMedicine.id == medicine_id,
        DBMedicine.user_id == current_user.id
    ).first()

    if not db_medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")

    # Update only provided fields
    if medicine_update.name is not None:
        db_medicine.name = medicine_update.name
    if medicine_update.type is not None:
        db_medicine.type = medicine_update.type
    if medicine_update.description is not None:
        db_medicine.description = medicine_update.description

    db.commit()
    db.refresh(db_medicine)
    return db_medicine


@router.delete("/{medicine_id}", status_code=204)
async def delete_medicine(
    medicine_id: str,
    current_user: DBUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a medicine (and all associated medicine events)"""
    db_medicine = db.query(DBMedicine).filter(
        DBMedicine.id == medicine_id,
        DBMedicine.user_id == current_user.id
    ).first()

    if not db_medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")

    db.delete(db_medicine)
    db.commit()
    return None
