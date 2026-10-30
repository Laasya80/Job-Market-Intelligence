from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.models import *  # Ensure all SQLAlchemy models are registered
from app.api import api_router
from app.services.data_loader import data_loader
from app.services.auth_service import auth_service

def init_db():
    """Create database tables and seed realistic dataset and demo users."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        data_loader.seed_database_if_empty(db)
        auth_service.seed_demo_users_if_empty(db)
    finally:
        db.close()

# Initialize tables immediately so TestClient & tests have tables
init_db()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup & shutdown events."""
    init_db()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend API for JMI (Job Market Intelligence) — Data Science & Analytics Platform",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "Online",
        "docs": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "JMI Backend API"}
