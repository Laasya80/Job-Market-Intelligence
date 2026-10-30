from sqlalchemy import Column, Integer, String, Float
from app.database import Base

class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    city = Column(String(100), unique=True, index=True, nullable=False)
    state = Column(String(100), nullable=True)
    country = Column(String(100), default="India")
    tier = Column(String(20), default="Tier-1")  # Tier-1 (Metro), Tier-2
    col_index = Column(Float, default=100.0)  # Cost of living index benchmark
