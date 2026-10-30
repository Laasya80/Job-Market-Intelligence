from pydantic import BaseModel
from typing import List, Optional
from datetime import date, datetime

class JobSkillOut(BaseModel):
    id: int
    name: str
    category: str

    class Config:
        from_attributes = True

class JobBase(BaseModel):
    job_title: str
    normalized_role: str
    company: str
    location: Optional[str] = None
    city: str
    state: Optional[str] = None
    country: Optional[str] = "India"
    description: str
    experience_min: float = 0.0
    experience_max: float = 5.0
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    salary_currency: Optional[str] = "INR"
    salary_period: Optional[str] = "Annual"
    work_mode: Optional[str] = "Onsite"
    posted_date: date
    source: Optional[str] = "Dataset/CSV"

class JobCreate(JobBase):
    skills: List[str] = []

class JobOut(JobBase):
    id: int
    created_at: Optional[datetime] = None
    skills: List[JobSkillOut] = []
    match_score: Optional[float] = None

    class Config:
        from_attributes = True

class JobListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    total_pages: int
    jobs: List[JobOut]
