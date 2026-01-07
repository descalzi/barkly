from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, dogs, vets, medicines, upload, events, vet_visits, medicine_events, custom_events
from app.database import init_db
import os

app = FastAPI(
    title="Barkly Backend API",
    description="Dog health tracking application API with Google OAuth authentication",
    version="1.0.0"
)

# CORS configuration
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:8080,http://localhost:8083"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(dogs.router, prefix="/api/dogs", tags=["Dogs"])
app.include_router(vets.router, prefix="/api/vets", tags=["Vets"])
app.include_router(medicines.router, prefix="/api/medicines", tags=["Medicines"])
app.include_router(custom_events.router, prefix="/api/custom-events", tags=["Custom Events"])
app.include_router(events.router, prefix="/api/events", tags=["Events"])
app.include_router(vet_visits.router, prefix="/api/vet-visits", tags=["Vet Visits"])
app.include_router(medicine_events.router, prefix="/api/medicine-events", tags=["Medicine Events"])
app.include_router(upload.router, prefix="/api/upload", tags=["Upload"])


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    init_db()


@app.get("/")
async def root():
    """API welcome message"""
    return {
        "message": "Welcome to Barkly API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}
