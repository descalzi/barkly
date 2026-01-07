from sqlalchemy import create_engine, Column, String, Integer, Float, DateTime, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os
import enum

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./barkly.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# Enums
class TimeOfDay(str, enum.Enum):
    MORNING = "Morning"
    AFTERNOON = "Afternoon"
    EVENING = "Evening"
    OVERNIGHT = "Overnight"


class EventType(str, enum.Enum):
    POO = "Poo"
    VOMIT = "Vomit"
    NAUSEA = "Nausea"
    ITCHY = "Itchy"
    GRASS_MUNCHING = "Grass Munching"
    INJURY = "Injury"
    OTHER = "Other"


class VomitQuality(str, enum.Enum):
    FOOD = "Food"
    BILE = "Bile"
    FOOD_BILE = "Food+Bile"
    OTHER = "Other"


class MedicineType(str, enum.Enum):
    TABLET = "tablet"
    DROP = "drop"
    LIQUID = "liquid"
    OTHER = "other"


# Models
class DBUser(Base):
    """User model - stores Google OAuth user information"""
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)  # Google user ID
    email = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    picture = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    # Relationships
    dogs = relationship("DBDog", back_populates="user", cascade="all, delete-orphan")
    vets = relationship("DBVet", back_populates="user", cascade="all, delete-orphan")
    medicines = relationship("DBMedicine", back_populates="user", cascade="all, delete-orphan")
    custom_events = relationship("DBCustomEvent", back_populates="user", cascade="all, delete-orphan")


class DBDog(Base):
    """Dog model - stores information about user's dogs"""
    __tablename__ = "dogs"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    profile_picture = Column(Text, nullable=True)  # Base64 encoded image
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    # Relationships
    user = relationship("DBUser", back_populates="dogs")
    events = relationship("DBEvent", back_populates="dog", cascade="all, delete-orphan")
    vet_visits = relationship("DBVetVisit", back_populates="dog", cascade="all, delete-orphan")
    medicine_events = relationship("DBMedicineEvent", back_populates="dog", cascade="all, delete-orphan")


class DBVet(Base):
    """Vet model - stores information about veterinarians"""
    __tablename__ = "vets"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    contact_info = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    # Relationships
    user = relationship("DBUser", back_populates="vets")
    vet_visits = relationship("DBVetVisit", back_populates="vet", cascade="all, delete-orphan")


class DBMedicine(Base):
    """Medicine model - stores information about medicines"""
    __tablename__ = "medicines"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    type = Column(SQLEnum(MedicineType), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    # Relationships
    user = relationship("DBUser", back_populates="medicines")
    medicine_events = relationship("DBMedicineEvent", back_populates="medicine", cascade="all, delete-orphan")


class DBCustomEvent(Base):
    """Custom Event model - stores user-defined event types"""
    __tablename__ = "custom_events"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    # Relationships
    user = relationship("DBUser", back_populates="custom_events")
    events = relationship("DBEvent", back_populates="custom_event", cascade="all, delete-orphan")


class DBEvent(Base):
    """Event model - stores health events for dogs"""
    __tablename__ = "events"

    id = Column(String, primary_key=True, index=True)
    dog_id = Column(String, ForeignKey("dogs.id"), nullable=False, index=True)
    event_type = Column(SQLEnum(EventType), nullable=True)  # Nullable for custom events
    custom_event_id = Column(String, ForeignKey("custom_events.id"), nullable=True, index=True)  # For custom events
    date = Column(DateTime, nullable=False, index=True)
    time_of_day = Column(SQLEnum(TimeOfDay), nullable=False)

    # Event-specific fields
    poo_quality = Column(Integer, nullable=True)  # 1-7 for Poo events
    vomit_quality = Column(SQLEnum(VomitQuality), nullable=True)  # For Vomit events

    # Common field for all events
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    # Relationships
    dog = relationship("DBDog", back_populates="events")
    custom_event = relationship("DBCustomEvent", back_populates="events")


class DBVetVisit(Base):
    """Vet Visit model - stores vet visit records"""
    __tablename__ = "vet_visits"

    id = Column(String, primary_key=True, index=True)
    dog_id = Column(String, ForeignKey("dogs.id"), nullable=False, index=True)
    vet_id = Column(String, ForeignKey("vets.id"), nullable=False, index=True)
    date = Column(DateTime, nullable=False, index=True)
    time_of_day = Column(SQLEnum(TimeOfDay), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    # Relationships
    dog = relationship("DBDog", back_populates="vet_visits")
    vet = relationship("DBVet", back_populates="vet_visits")


class DBMedicineEvent(Base):
    """Medicine Event model - stores medicine administration records"""
    __tablename__ = "medicine_events"

    id = Column(String, primary_key=True, index=True)
    dog_id = Column(String, ForeignKey("dogs.id"), nullable=False, index=True)
    medicine_id = Column(String, ForeignKey("medicines.id"), nullable=False, index=True)
    date = Column(DateTime, nullable=False, index=True)
    time_of_day = Column(SQLEnum(TimeOfDay), nullable=False)
    dosage = Column(Float, nullable=False)  # 0.25 increments
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    # Relationships
    dog = relationship("DBDog", back_populates="medicine_events")
    medicine = relationship("DBMedicine", back_populates="medicine_events")


def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)


def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
