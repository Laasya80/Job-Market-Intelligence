import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "JMI — Job Market Intelligence"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Database configuration (Defaults to SQLite for instant zero-config launch; supports PostgreSQL)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./jmi_market.db")
    
    # CORS Origins
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]
    
    # ML & Extraction parameters
    EMERGING_GROWTH_WEIGHT: float = 0.50
    EMERGING_MARKET_SHARE_WEIGHT: float = 0.30
    EMERGING_VOLUME_WEIGHT: float = 0.20
    
    # Anomaly detection z-score threshold
    ANOMALY_ZSCORE_THRESHOLD: float = 2.0

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
