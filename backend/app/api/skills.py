from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
import pandas as pd
from app.database import get_db
from app.models.job import Job
from app.models.skill import Skill
from app.schemas.skill import SkillOut, SkillTrendOut, EmergingSkillOut, SkillPairCooccurrence
from app.ml.emerging_skills import emerging_skills_engine
from app.services.trend_engine import trend_engine
from collections import defaultdict, Counter

router = APIRouter(prefix="/skills", tags=["Skills"])

@router.get("/list", response_model=List[SkillOut])
def get_all_skills(db: Session = Depends(get_db)):
    """List all registered skills in taxonomy."""
    skills = db.query(Skill).order_by(Skill.name.asc()).all()
    return [SkillOut(id=s.id, name=s.name, normalized_name=s.normalized_name, category=s.category) for s in skills]

@router.get("/trends")
def get_skill_trends(
    role: Optional[str] = None,
    city: Optional[str] = None,
    skills: Optional[str] = Query(None, description="Comma-separated skill names"),
    db: Session = Depends(get_db)
):
    """Retrieve monthly demand curves for skills with role and city filtering."""
    query = db.query(Job)
    if role and role.lower() != "all":
        query = query.filter(Job.normalized_role == role)
    if city and city.lower() != "all":
        query = query.filter(Job.city == city)

    jobs = query.all()
    total_jobs = len(jobs)
    
    # Default skills if none specified
    if skills:
        target_skills = [s.strip() for s in skills.split(",") if s.strip()]
    else:
        target_skills = ["Python", "SQL", "Machine Learning", "Power BI", "Tableau", "AWS"]

    month_skill_counts = defaultdict(lambda: defaultdict(int))
    month_totals = defaultdict(int)
    all_months = set()

    for j in jobs:
        m_str = j.posted_date.strftime("%Y-%m")
        all_months.add(m_str)
        month_totals[m_str] += 1
        job_skill_names = {s.name for s in j.skills}
        for ts in target_skills:
            if ts in job_skill_names:
                month_skill_counts[m_str][ts] += 1

    sorted_months = sorted(list(all_months))
    chart_data = []
    for m in sorted_months:
        row = {"month": m, "total_jobs_in_month": month_totals[m]}
        for ts in target_skills:
            cnt = month_skill_counts[m][ts]
            row[ts] = cnt
            row[f"{ts}_pct"] = round((cnt / max(month_totals[m], 1)) * 100.0, 1)
        chart_data.append(row)

    # Dynamic trend insight generation
    insights = []
    if chart_data and len(chart_data) >= 2:
        m_first, m_last = chart_data[0], chart_data[-1]
        for ts in target_skills[:3]:
            c_first = m_first.get(ts, 0)
            c_last = m_last.get(ts, 0)
            diff_pct = round(((c_last - c_first) / max(c_first, 1)) * 100.0, 1)
            direction = "increased" if diff_pct >= 0 else "decreased"
            insights.append(f"{ts} demand {direction} by {abs(diff_pct)}% between {m_first['month']} and {m_last['month']}.")

    return {
        "months": sorted_months,
        "skills": target_skills,
        "data": chart_data,
        "total_jobs_analyzed": total_jobs,
        "insights": insights
    }

@router.get("/emerging", response_model=List[EmergingSkillOut])
def get_emerging_skills(
    role: Optional[str] = None,
    limit: int = 15,
    db: Session = Depends(get_db)
):
    """Retrieve top emerging and rising skills based on smoothed growth rate and market share."""
    query = db.query(Job)
    if role and role.lower() != "all":
        query = query.filter(Job.normalized_role == role)

    jobs = query.all()
    total_jobs = len(jobs)
    if total_jobs == 0:
        return []

    records = []
    for j in jobs:
        m_str = j.posted_date.strftime("%Y-%m")
        for s in j.skills:
            records.append({"skill": s.name, "category": s.category, "month": m_str})

    df = pd.DataFrame(records)
    grouped = df.groupby(["skill", "category", "month"]).size().reset_index(name="count")
    emerging_list = emerging_skills_engine.calculate_emerging_skills(grouped, total_jobs)
    return emerging_list[:limit]

@router.get("/cooccurrence", response_model=List[SkillPairCooccurrence])
def get_skill_cooccurrences(
    min_support: int = 5,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Retrieve frequent skill pair co-occurrences and association metrics."""
    jobs = db.query(Job).all()
    job_skills_data = [[s.name for s in j.skills] for j in jobs]
    cooccurrences = trend_engine.compute_cooccurrences(job_skills_data, min_support=min_support, limit=limit)
    return cooccurrences

@router.get("/heatmap")
def get_skill_heatmap(top_n: int = 10, db: Session = Depends(get_db)):
    """Generate skill demand penetration heatmap across canonical roles."""
    jobs = db.query(Job).all()
    jobs_data = [{"normalized_role": j.normalized_role, "skills": [s.name for s in j.skills]} for j in jobs]
    return trend_engine.build_role_skill_heatmap(jobs_data, top_n_skills=top_n)

@router.get("/compare")
def compare_skills(
    skill_a: str = Query("Python", description="First skill"),
    skill_b: str = Query("Machine Learning", description="Second skill"),
    db: Session = Depends(get_db)
):
    """Compare two skills directly across roles, salary impact, and monthly volume."""
    jobs = db.query(Job).all()
    total_jobs = len(jobs)

    jobs_a = [j for j in jobs if any(s.name.lower() == skill_a.lower() for s in j.skills)]
    jobs_b = [j for j in jobs if any(s.name.lower() == skill_b.lower() for s in j.skills)]
    jobs_both = [j for j in jobs if any(s.name.lower() == skill_a.lower() for s in j.skills) and any(s.name.lower() == skill_b.lower() for s in j.skills)]

    sal_a = [j.salary_max for j in jobs_a if j.salary_max is not None]
    sal_b = [j.salary_max for j in jobs_b if j.salary_max is not None]
    sal_both = [j.salary_max for j in jobs_both if j.salary_max is not None]

    avg_sal_a = round(sum(sal_a) / max(len(sal_a), 1), 1) if sal_a else 0.0
    avg_sal_b = round(sum(sal_b) / max(len(sal_b), 1), 1) if sal_b else 0.0
    avg_sal_both = round(sum(sal_both) / max(len(sal_both), 1), 1) if sal_both else 0.0

    roles_a = Counter(j.normalized_role for j in jobs_a)
    roles_b = Counter(j.normalized_role for j in jobs_b)

    return {
        "skill_a": {
            "name": skill_a,
            "total_mentions": len(jobs_a),
            "market_share_pct": round((len(jobs_a) / max(total_jobs, 1)) * 100.0, 1),
            "average_salary_lpa": avg_sal_a,
            "top_roles": dict(roles_a.most_common(4))
        },
        "skill_b": {
            "name": skill_b,
            "total_mentions": len(jobs_b),
            "market_share_pct": round((len(jobs_b) / max(total_jobs, 1)) * 100.0, 1),
            "average_salary_lpa": avg_sal_b,
            "top_roles": dict(roles_b.most_common(4))
        },
        "cooccurrence": {
            "both_count": len(jobs_both),
            "both_avg_salary_lpa": avg_sal_both,
            "synergy_salary_premium_pct": round(((avg_sal_both - max(avg_sal_a, avg_sal_b)) / max(avg_sal_a, avg_sal_b, 1.0)) * 100.0, 1) if avg_sal_both > 0 else 0.0
        }
    }
