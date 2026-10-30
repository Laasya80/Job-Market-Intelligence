from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from collections import Counter, defaultdict
import re
from app.database import get_db
from app.models.job import Job
from app.models.company import Company
from app.models.role import Role
from app.schemas.role import RoleAnalyticsOut, RoleComparisonOut, CompetencyScore, KeywordFreq, CareerProgressionStep

router = APIRouter(prefix="/roles", tags=["Roles"])

CAREER_PATHS = {
    "Data Analyst": [
        CareerProgressionStep(level="L1", title="Junior Data Analyst", experience_range="0-2 Yrs", average_salary_lpa=5.2, description="Data extraction, cleaning, basic dashboarding in Excel & Power BI."),
        CareerProgressionStep(level="L2", title="Senior Data Analyst", experience_range="2-5 Yrs", average_salary_lpa=10.5, description="Advanced SQL, business metric modeling, stakeholder presentations."),
        CareerProgressionStep(level="L3", title="Lead Business Analyst", experience_range="5-8 Yrs", average_salary_lpa=16.8, description="Cross-functional strategy, data governance, analytics architecture."),
        CareerProgressionStep(level="L4", title="Analytics Manager / Director", experience_range="8+ Yrs", average_salary_lpa=25.0, description="Leadership of data teams, organizational decision frameworks.")
    ],
    "Data Scientist": [
        CareerProgressionStep(level="L1", title="Associate Data Scientist", experience_range="0-2 Yrs", average_salary_lpa=8.5, description="EDA, baseline ML model development, feature engineering in Python."),
        CareerProgressionStep(level="L2", title="Data Scientist II", experience_range="2-5 Yrs", average_salary_lpa=15.2, description="Production ML models, A/B experimentation, statistical inference."),
        CareerProgressionStep(level="L3", title="Senior / Lead Data Scientist", experience_range="5-8 Yrs", average_salary_lpa=24.5, description="End-to-end model lifecycle, deep learning, business impact optimization."),
        CareerProgressionStep(level="L4", title="Principal Data Scientist / Head of AI", experience_range="8+ Yrs", average_salary_lpa=38.0, description="AI roadmaps, enterprise model architectures, research strategy.")
    ],
    "Data Engineer": [
        CareerProgressionStep(level="L1", title="Junior Data Engineer", experience_range="0-2 Yrs", average_salary_lpa=7.5, description="Writing SQL ETL scripts, database schema setup, maintenance."),
        CareerProgressionStep(level="L2", title="Data Engineer", experience_range="2-5 Yrs", average_salary_lpa=14.0, description="Building distributed pipelines using Spark, Airflow, and Cloud DWH."),
        CareerProgressionStep(level="L3", title="Senior Data Engineer / Architect", experience_range="5-8 Yrs", average_salary_lpa=22.5, description="Lakehouse architecture, streaming ingestion (Kafka), performance tuning."),
        CareerProgressionStep(level="L4", title="Principal Data Architect", experience_range="8+ Yrs", average_salary_lpa=35.0, description="Enterprise data fabric, cloud infrastructure modernization.")
    ],
    "ML Engineer": [
        CareerProgressionStep(level="L1", title="Junior ML Engineer", experience_range="0-2 Yrs", average_salary_lpa=9.0, description="Model training scripts, data preprocessing pipelines, Docker packaging."),
        CareerProgressionStep(level="L2", title="MLOps / ML Engineer", experience_range="2-5 Yrs", average_salary_lpa=17.5, description="Production inference services, model monitoring, CI/CD for ML."),
        CareerProgressionStep(level="L3", title="Senior ML Systems Engineer", experience_range="5-8 Yrs", average_salary_lpa=28.0, description="Distributed training, GPU cluster management, LLM fine-tuning pipelines."),
        CareerProgressionStep(level="L4", title="Staff AI Engineer / ML Architect", experience_range="8+ Yrs", average_salary_lpa=42.0, description="High-throughput inference engines, multimodal AI architectures.")
    ],
    "BI Developer": [
        CareerProgressionStep(level="L1", title="Associate BI Developer", experience_range="0-2 Yrs", average_salary_lpa=5.5, description="Report development, dashboard UI design in Power BI/Tableau."),
        CareerProgressionStep(level="L2", title="BI Developer", experience_range="2-5 Yrs", average_salary_lpa=11.0, description="DAX modeling, semantic layer management, query optimization."),
        CareerProgressionStep(level="L3", title="Senior BI Architect", experience_range="5-8 Yrs", average_salary_lpa=18.0, description="Self-service BI infrastructure, dimensional data mart design."),
        CareerProgressionStep(level="L4", title="Head of Enterprise Reporting", experience_range="8+ Yrs", average_salary_lpa=26.0, description="Corporate data literacy, executive dashboard systems.")
    ],
    "Software Engineer": [
        CareerProgressionStep(level="L1", title="Software Engineer (SDE I)", experience_range="0-2 Yrs", average_salary_lpa=7.0, description="Feature development, bug fixes, unit tests, REST API endpoints."),
        CareerProgressionStep(level="L2", title="Software Engineer II (SDE II)", experience_range="2-5 Yrs", average_salary_lpa=14.5, description="Microservices design, database optimization, CI/CD workflows."),
        CareerProgressionStep(level="L3", title="Senior Software Engineer / Tech Lead", experience_range="5-8 Yrs", average_salary_lpa=24.0, description="System design, mentoring, cross-team architecture reviews."),
        CareerProgressionStep(level="L4", title="Staff Engineer / Engineering Manager", experience_range="8+ Yrs", average_salary_lpa=36.0, description="System reliability, tech vision, organization-wide architecture.")
    ]
}

@router.get("", response_model=List[str])
def get_all_canonical_roles():
    """Retrieve list of canonical job roles."""
    return list(CAREER_PATHS.keys())

@router.get("/{role_name}/analytics", response_model=RoleAnalyticsOut)
def get_role_analytics(role_name: str, db: Session = Depends(get_db)):
    """Retrieve in-depth analytics, competency radar chart, keywords, and progression path for a role."""
    # Find matching jobs
    jobs = db.query(Job).filter(Job.normalized_role.ilike(f"%{role_name.strip()}%")).all()
    if not jobs:
        # Fallback to general query
        jobs = db.query(Job).all()

    total_openings = len(jobs)
    
    # Calculate salaries and experience
    salaries_max = [j.salary_max for j in jobs if j.salary_max is not None]
    salaries_min = [j.salary_min for j in jobs if j.salary_min is not None]
    experiences = [j.experience_min for j in jobs if j.experience_min is not None]

    avg_salary = round(sum(salaries_max) / max(len(salaries_max), 1), 1) if salaries_max else 10.0
    min_sal = round(min(salaries_min), 1) if salaries_min else 4.0
    max_sal = round(max(salaries_max), 1) if salaries_max else 25.0
    avg_exp = round(sum(experiences) / max(len(experiences), 1), 1) if experiences else 2.5

    # Skill counts
    skill_counts = Counter(s.name for j in jobs for s in j.skills)
    
    # Competency Radar calculations (Normalized to 100)
    competencies_keys = ["SQL", "Python", "BI Tools", "Statistics", "Machine Learning", "Communication"]
    competency_scores = []
    
    # Calculate presence
    for comp in competencies_keys:
        if comp == "BI Tools":
            c_cnt = skill_counts.get("Power BI", 0) + skill_counts.get("Tableau", 0) + skill_counts.get("Looker", 0)
        else:
            c_cnt = skill_counts.get(comp, 0)
        
        score_val = round((c_cnt / max(total_openings, 1)) * 100.0, 1)
        score_val = max(15.0, min(95.0, score_val))  # bounded for aesthetics
        competency_scores.append(CompetencyScore(competency=comp, score=score_val, full_mark=100.0))

    # Top tools & skills
    top_skills_list = [{"name": s, "count": c, "pct": round((c / max(total_openings, 1)) * 100.0, 1)} for s, c in skill_counts.most_common(8)]
    
    # Top industries from companies
    comp_lookup = {c.name: c.industry for c in db.query(Company).all()}
    ind_counts = Counter(comp_lookup.get(j.company, "Technology") for j in jobs)
    top_industries = [{"industry": ind, "count": c, "pct": round((c / max(total_openings, 1)) * 100.0, 1)} for ind, c in ind_counts.most_common(5)]
    top_industry_name = top_industries[0]["industry"] if top_industries else "Technology"

    # Common JD Keywords (Word Frequency from descriptions)
    desc_words = []
    stopwords = {"and", "the", "in", "to", "for", "with", "a", "of", "as", "is", "our", "you", "will", "we", "are", "on", "an", "at", "be", "by", "or", "from", "that", "this", "it", "team", "data", "experience", "role", "work", "skills", "job"}
    for j in jobs:
        words = re.findall(r"\b[A-Za-z]{3,15}\b", j.description.lower())
        desc_words.extend([w for w in words if w not in stopwords])
    keyword_counts = Counter(desc_words)
    common_keywords = [KeywordFreq(keyword=k.capitalize(), frequency=cnt) for k, cnt in keyword_counts.most_common(12)]

    # Recommended skills to learn (emerging/high demand skills for this role)
    recommended_skills = [s["name"] for s in top_skills_list[:5]]

    career_path = CAREER_PATHS.get(role_name, CAREER_PATHS["Data Analyst"])

    insights = [
        f"{role_name} openings command an average compensation of ₹{avg_salary} LPA, spanning from ₹{min_sal} to ₹{max_sal} LPA.",
        f"Top required competency is {top_skills_list[0]['name'] if top_skills_list else 'SQL'}, found in {top_skills_list[0]['pct'] if top_skills_list else 80}% of postings.",
        f"Leading hiring sector for {role_name} is {top_industry_name} followed by {top_industries[1]['industry'] if len(top_industries) > 1 else 'FinTech'}."
    ]

    return RoleAnalyticsOut(
        role=role_name,
        total_openings=total_openings,
        average_salary_lpa=avg_salary,
        salary_min_lpa=min_sal,
        salary_max_lpa=max_sal,
        average_experience=avg_exp,
        top_industry=top_industry_name,
        competencies=competency_scores,
        top_tools=top_skills_list[:6],
        top_skills=top_skills_list,
        top_industries=top_industries,
        common_keywords=common_keywords,
        career_path=career_path,
        recommended_skills=recommended_skills,
        insights=insights
    )

@router.get("/compare/roles", response_model=RoleComparisonOut)
def compare_two_roles(
    role_a: str = Query("Data Analyst", description="First role"),
    role_b: str = Query("Data Scientist", description="Second role"),
    db: Session = Depends(get_db)
):
    """Compare two roles directly across salary, experience, openings, and skill overlap."""
    jobs_a = db.query(Job).filter(Job.normalized_role.ilike(f"%{role_a.strip()}%")).all()
    jobs_b = db.query(Job).filter(Job.normalized_role.ilike(f"%{role_b.strip()}%")).all()

    sal_a = [j.salary_max for j in jobs_a if j.salary_max is not None]
    sal_b = [j.salary_max for j in jobs_b if j.salary_max is not None]
    exp_a = [j.experience_min for j in jobs_a if j.experience_min is not None]
    exp_b = [j.experience_min for j in jobs_b if j.experience_min is not None]

    skills_a_counts = Counter(s.name for j in jobs_a for s in j.skills)
    skills_b_counts = Counter(s.name for j in jobs_b for s in j.skills)

    top_skills_a = {s for s, _ in skills_a_counts.most_common(10)}
    top_skills_b = {s for s, _ in skills_b_counts.most_common(10)}

    common_skills = sorted(list(top_skills_a.intersection(top_skills_b)))
    unique_a = sorted(list(top_skills_a - top_skills_b))
    unique_b = sorted(list(top_skills_b - top_skills_a))

    avg_sal_a = round(sum(sal_a) / max(len(sal_a), 1), 1) if sal_a else 8.5
    avg_sal_b = round(sum(sal_b) / max(len(sal_b), 1), 1) if sal_b else 15.2

    avg_exp_a = round(sum(exp_a) / max(len(exp_a), 1), 1) if exp_a else 2.0
    avg_exp_b = round(sum(exp_b) / max(len(exp_b), 1), 1) if exp_b else 3.2

    metrics = {
        "average_salary_lpa": {"role_a": avg_sal_a, "role_b": avg_sal_b, "diff_pct": round(((avg_sal_b - avg_sal_a) / max(avg_sal_a, 1)) * 100.0, 1)},
        "openings": {"role_a": len(jobs_a), "role_b": len(jobs_b)},
        "avg_experience_years": {"role_a": avg_exp_a, "role_b": avg_exp_b},
        "python_penetration_pct": {
            "role_a": round((skills_a_counts.get("Python", 0) / max(len(jobs_a), 1)) * 100.0, 1),
            "role_b": round((skills_b_counts.get("Python", 0) / max(len(jobs_b), 1)) * 100.0, 1)
        },
        "sql_penetration_pct": {
            "role_a": round((skills_a_counts.get("SQL", 0) / max(len(jobs_a), 1)) * 100.0, 1),
            "role_b": round((skills_b_counts.get("SQL", 0) / max(len(jobs_b), 1)) * 100.0, 1)
        },
        "ml_penetration_pct": {
            "role_a": round((skills_a_counts.get("Machine Learning", 0) / max(len(jobs_a), 1)) * 100.0, 1),
            "role_b": round((skills_b_counts.get("Machine Learning", 0) / max(len(jobs_b), 1)) * 100.0, 1)
        }
    }

    summary = (
        f"{role_b} commands a {metrics['average_salary_lpa']['diff_pct']}% salary premium over {role_a} "
        f"(₹{avg_sal_b} LPA vs ₹{avg_sal_a} LPA), driven by higher emphasis on {', '.join(unique_b[:2]) if unique_b else 'Machine Learning'}."
    )

    return RoleComparisonOut(
        role_a=role_a,
        role_b=role_b,
        metrics=metrics,
        common_skills=common_skills,
        unique_to_a=unique_a,
        unique_to_b=unique_b,
        comparison_summary=summary
    )
