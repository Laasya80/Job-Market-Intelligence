from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

class DashboardSummaryOut(BaseModel):
    total_jobs: int
    total_skills_tracked: int
    average_salary_lpa: float
    fastest_growing_skill: str
    fastest_growth_rate_pct: float
    total_companies: int
    total_roles: int
    total_cities: int
    dataset_type: str = "Analyzed Demo Dataset (2025-2026)"

class TopSkillOut(BaseModel):
    skill: str
    count: int
    percentage: float
    category: str

class RoleDistributionOut(BaseModel):
    role: str
    count: int
    percentage: float
    average_salary: float

class HiringHotspotOut(BaseModel):
    city: str
    state: str
    job_count: int
    percentage: float
    average_salary_lpa: float
    col_index: float
    top_role: str

class RecentInsight(BaseModel):
    id: str
    title: str
    description: str
    category: str  # "growth", "salary", "role", "alert"
    impact: str    # "positive", "neutral", "negative"
    metric: Optional[str] = None

class SkillGapRequest(BaseModel):
    candidate_skills: List[str] = []
    target_role: str
    location: Optional[str] = None
    experience_years: Optional[float] = None
    raw_resume_text: Optional[str] = None

class LearningRoadmapItem(BaseModel):
    skill: str
    category: str
    market_demand_pct: float
    growth_rate_pct: float
    gap_priority_score: float
    recommended_duration_weeks: int
    learning_resources: List[str]

class SkillGapResponse(BaseModel):
    target_role: str
    profile_match_score: float
    total_required_skills: int
    matched_skills: List[str]
    partially_matched_skills: List[str]
    missing_skills: List[str]
    benchmark_market_avg_score: float
    roadmap: List[LearningRoadmapItem]
    insights: List[str]
    candidate_name: Optional[str] = None
    candidate_email: Optional[str] = None
    candidate_phone: Optional[str] = None

class SalaryDistributionBucket(BaseModel):
    salary_range: str
    count: int
    percentage: float

class CitySalaryComparison(BaseModel):
    city: str
    average_salary_lpa: float
    median_salary_lpa: float
    job_posts: int
    growth_rate_pct: float
    col_index: float
    adjusted_salary_lpa: float

class SalaryAnalyticsOut(BaseModel):
    overall_avg_salary_lpa: float
    overall_median_salary_lpa: float
    distribution: List[SalaryDistributionBucket]
    top_paying_cities: List[CitySalaryComparison]
    metro_avg_lpa: float
    non_metro_avg_lpa: float
    metro_salary_premium_pct: float
    work_mode_distribution: Dict[str, int]
    role_salary_table: List[Dict[str, Any]]
    insights: List[str]

class ClusterOut(BaseModel):
    cluster_id: int
    cluster_name: str
    job_count: int
    percentage: float
    top_keywords: List[str]
    representative_roles: List[str]
    avg_salary_lpa: float

class AnomalyAlertOut(BaseModel):
    id: str
    metric: str
    item_name: str
    anomaly_type: str  # "Demand Surge", "Salary Spike", "Hiring Shift"
    severity: str      # "High", "Medium", "Low"
    z_score: float
    baseline_value: float
    current_value: float
    description: str
    detected_at: str

class PipelineStatusOut(BaseModel):
    records_ingested: int
    missing_salary_pct: float
    skill_extraction_accuracy: float
    last_processing_time: str
    processing_status: str
    completeness_score: float
    consistency_score: float
    uniqueness_score: float
    validity_score: float
    active_connectors: List[str]
    recent_runs: List[Dict[str, Any]]
    logs: List[str]
    schema_coverage: List[Dict[str, Any]]
