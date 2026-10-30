from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    target_role: Optional[str] = "Data Analyst"
    target_city: Optional[str] = "Bengaluru"
    experience_years: Optional[float] = 2.0
    skills: Optional[str] = "Python,SQL,Excel"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    target_role: Optional[str] = None
    target_city: Optional[str] = None
    experience_years: Optional[float] = None
    skills: Optional[str] = None

class UserOut(BaseModel):
    id: int
    full_name: str
    email: str
    target_role: str
    target_city: str
    experience_years: float
    skills: str
    avatar_color: Optional[str] = "bg-blue-600"
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
