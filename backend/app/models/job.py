from sqlalchemy import Column, Integer, String, Float, Text, Date, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
from app.models.skill import job_skills

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    job_title = Column(String(255), index=True, nullable=False)
    normalized_role = Column(String(100), index=True, nullable=False)
    company = Column(String(255), index=True, nullable=False)
    location = Column(String(255), nullable=True)
    city = Column(String(100), index=True, nullable=False)
    state = Column(String(100), nullable=True)
    country = Column(String(100), default="India")
    description = Column(Text, nullable=False)
    experience_min = Column(Float, default=0.0)
    experience_max = Column(Float, default=5.0)
    salary_min = Column(Float, nullable=True)  # Stored in LPA (Lakhs Per Annum)
    salary_max = Column(Float, nullable=True)  # Stored in LPA
    salary_currency = Column(String(10), default="INR")
    salary_period = Column(String(20), default="Annual")
    work_mode = Column(String(50), index=True, default="Onsite")  # Onsite, Hybrid, Remote
    posted_date = Column(Date, index=True, nullable=False)
    source = Column(String(100), default="Dataset/CSV")
    created_at = Column(DateTime, default=datetime.utcnow)

    skills = relationship("Skill", secondary=job_skills, back_populates="jobs", lazy="selectin")
