from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class CompetencyScore(BaseModel):
    competency: str
    score: float
    full_mark: float = 100.0

class KeywordFreq(BaseModel):
    keyword: str
    frequency: int

class CareerProgressionStep(BaseModel):
    level: str
    title: str
    experience_range: str
    average_salary_lpa: float
    description: str

class RoleAnalyticsOut(BaseModel):
    role: str
    total_openings: int
    average_salary_lpa: float
    salary_min_lpa: float
    salary_max_lpa: float
    average_experience: float
    top_industry: str
    competencies: List[CompetencyScore]
    top_tools: List[Dict[str, Any]]
    top_skills: List[Dict[str, Any]]
    top_industries: List[Dict[str, Any]]
    common_keywords: List[KeywordFreq]
    career_path: List[CareerProgressionStep]
    recommended_skills: List[str]
    insights: List[str]

class RoleComparisonOut(BaseModel):
    role_a: str
    role_b: str
    metrics: Dict[str, Dict[str, Any]]
    common_skills: List[str]
    unique_to_a: List[str]
    unique_to_b: List[str]
    comparison_summary: str
