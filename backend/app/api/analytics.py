import pandas as pd
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.job import Job
from app.schemas.analytics import ClusterOut, AnomalyAlertOut
from app.ml.job_clustering import job_clustering_engine
from app.ml.anomaly_detection import anomaly_detection_engine

router = APIRouter(prefix="/analytics", tags=["Analytics & ML"])

@router.get("/clusters", response_model=List[ClusterOut])
def get_job_clusters(db: Session = Depends(get_db)):
    """Unsupervised KMeans clustering over TF-IDF vectors of job descriptions."""
    jobs = db.query(Job).all()
    if not jobs:
        return []

    jobs_data = []
    for j in jobs:
        jobs_data.append({
            "id": j.id,
            "job_title": j.job_title,
            "normalized_role": j.normalized_role,
            "description": j.description,
            "salary_min": j.salary_min,
            "salary_max": j.salary_max
        })

    df = pd.DataFrame(jobs_data)
    clusters = job_clustering_engine.cluster_jobs(df)
    return clusters

@router.get("/anomalies", response_model=List[AnomalyAlertOut])
def get_market_anomalies(db: Session = Depends(get_db)):
    """Detect statistical demand surges and salary anomalies."""
    jobs = db.query(Job).all()
    if not jobs:
        return []

    records = []
    for j in jobs:
        m_str = j.posted_date.strftime("%Y-%m")
        for s in j.skills:
            records.append({"skill": s.name, "month": m_str})

    df_skills = pd.DataFrame(records)
    grouped = df_skills.groupby(["skill", "month"]).size().reset_index(name="count") if not df_skills.empty else pd.DataFrame()

    role_df = pd.DataFrame([{"normalized_role": j.normalized_role, "salary_max": j.salary_max} for j in jobs])

    skill_alerts = anomaly_detection_engine.detect_skill_demand_anomalies(grouped)
    salary_alerts = anomaly_detection_engine.detect_salary_anomalies(role_df)

    all_alerts = skill_alerts + salary_alerts
    return all_alerts[:8]
