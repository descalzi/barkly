from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from app.database import TimeOfDay, EventType, VomitQuality, MedicineType


# Authentication models
class GoogleAuthRequest(BaseModel):
    """Request model for Google OAuth authentication"""
    token: str


class User(BaseModel):
    """User response model"""
    id: str
    email: EmailStr
    name: str
    picture: Optional[str] = None

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    """Response model for successful authentication"""
    access_token: str
    token_type: str = "bearer"
    user: User


# Dog models
class DogBase(BaseModel):
    """Base dog model"""
    name: str
    profile_picture: Optional[str] = None


class DogCreate(DogBase):
    """Dog creation model"""
    pass


class DogUpdate(BaseModel):
    """Dog update model - all fields optional"""
    name: Optional[str] = None
    profile_picture: Optional[str] = None


class Dog(DogBase):
    """Dog response model"""
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Vet models
class VetBase(BaseModel):
    """Base vet model"""
    name: str
    contact_info: Optional[str] = None
    notes: Optional[str] = None


class VetCreate(VetBase):
    """Vet creation model"""
    pass


class VetUpdate(BaseModel):
    """Vet update model - all fields optional"""
    name: Optional[str] = None
    contact_info: Optional[str] = None
    notes: Optional[str] = None


class Vet(VetBase):
    """Vet response model"""
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Medicine models
class MedicineBase(BaseModel):
    """Base medicine model"""
    name: str
    type: MedicineType
    description: Optional[str] = None


class MedicineCreate(MedicineBase):
    """Medicine creation model"""
    pass


class MedicineUpdate(BaseModel):
    """Medicine update model - all fields optional"""
    name: Optional[str] = None
    type: Optional[MedicineType] = None
    description: Optional[str] = None


class Medicine(MedicineBase):
    """Medicine response model"""
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Event models
class EventBase(BaseModel):
    """Base event model"""
    dog_id: str
    event_type: EventType
    date: datetime
    time_of_day: TimeOfDay
    poo_quality: Optional[int] = None  # 1-7 for Poo events
    vomit_quality: Optional[VomitQuality] = None  # For Vomit events
    notes: Optional[str] = None


class EventCreate(EventBase):
    """Event creation model"""
    pass


class EventUpdate(BaseModel):
    """Event update model - all fields optional"""
    dog_id: Optional[str] = None
    event_type: Optional[EventType] = None
    date: Optional[datetime] = None
    time_of_day: Optional[TimeOfDay] = None
    poo_quality: Optional[int] = None
    vomit_quality: Optional[VomitQuality] = None
    notes: Optional[str] = None


class Event(EventBase):
    """Event response model"""
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Vet Visit models
class VetVisitBase(BaseModel):
    """Base vet visit model"""
    dog_id: str
    vet_id: str
    date: datetime
    time_of_day: TimeOfDay
    notes: Optional[str] = None


class VetVisitCreate(VetVisitBase):
    """Vet visit creation model"""
    pass


class VetVisitUpdate(BaseModel):
    """Vet visit update model - all fields optional"""
    dog_id: Optional[str] = None
    vet_id: Optional[str] = None
    date: Optional[datetime] = None
    time_of_day: Optional[TimeOfDay] = None
    notes: Optional[str] = None


class VetVisit(VetVisitBase):
    """Vet visit response model"""
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Medicine Event models
class MedicineEventBase(BaseModel):
    """Base medicine event model"""
    dog_id: str
    medicine_id: str
    date: datetime
    time_of_day: TimeOfDay
    dosage: float
    notes: Optional[str] = None


class MedicineEventCreate(MedicineEventBase):
    """Medicine event creation model"""
    pass


class MedicineEventUpdate(BaseModel):
    """Medicine event update model - all fields optional"""
    dog_id: Optional[str] = None
    medicine_id: Optional[str] = None
    date: Optional[datetime] = None
    time_of_day: Optional[TimeOfDay] = None
    dosage: Optional[float] = None
    notes: Optional[str] = None


class MedicineEvent(MedicineEventBase):
    """Medicine event response model"""
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Upload model
class UploadResponse(BaseModel):
    """Response model for file uploads"""
    data: str  # Base64 encoded image
