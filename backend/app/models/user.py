from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    target_role = Column(String(100), default="Data Analyst")
    target_city = Column(String(100), default="Bengaluru")
    experience_years = Column(Float, default=2.0)
    skills = Column(Text, default="Python,SQL,Excel,Power BI")
    avatar_color = Column(String(20), default="bg-blue-600")
    created_at = Column(DateTime, default=datetime.utcnow)
