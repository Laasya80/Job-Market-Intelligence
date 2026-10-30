from pydantic import BaseModel
from typing import List, Optional

class SkillBase(BaseModel):
    name: str
    normalized_name: str
    category: Optional[str] = "General"

class SkillOut(SkillBase):
    id: int
    count: Optional[int] = 0

    class Config:
        from_attributes = True

class MonthlyTrendPoint(BaseModel):
    month: str
    mentions: int
    percentage: float

class SkillTrendOut(BaseModel):
    skill: str
    category: str
    trends: List[MonthlyTrendPoint]
    total_mentions: int
    growth_rate: float

class EmergingSkillOut(BaseModel):
    skill: str
    category: str
    current_period_count: int
    previous_period_count: int
    growth_rate: float
    market_share: float
    emerging_score: float
    status: str  # "Emerging", "Stable", "Declining"

class SkillPairCooccurrence(BaseModel):
    source_skill: str
    target_skill: str
    cooccurrence_count: int
    support: float
    confidence: float
