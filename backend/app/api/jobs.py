from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.job import Job
from app.models.skill import Skill
from app.schemas.job import JobListResponse, JobOut, JobSkillOut
from app.services.recommendation_engine import recommendation_engine
from app.ml.similarity import job_similarity_engine

router = APIRouter(prefix="/jobs", tags=["Jobs"])

@router.get("", response_model=JobListResponse)
def get_jobs(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    role: Optional[str] = None,
    city: Optional[str] = None,
    work_mode: Optional[str] = None,
    min_exp: Optional[float] = None,
    max_exp: Optional[float] = None,
    min_salary: Optional[float] = None,
    skill: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Retrieve filterable, searchable list of job postings with pagination."""
    query = db.query(Job)

    if search:
        s_term = f"%{search.strip()}%"
        query = query.filter(
            (Job.job_title.ilike(s_term)) |
            (Job.company.ilike(s_term)) |
            (Job.description.ilike(s_term))
        )

    if role and role.lower() != "all":
        query = query.filter(Job.normalized_role == role)

    if city and city.lower() != "all":
        query = query.filter(Job.city == city)

    if work_mode and work_mode.lower() != "all":
        query = query.filter(Job.work_mode == work_mode)

    if min_exp is not None:
        query = query.filter(Job.experience_min >= min_exp)

    if max_exp is not None:
        query = query.filter(Job.experience_max <= max_exp)

    if min_salary is not None:
        query = query.filter(Job.salary_max >= min_salary)

    if skill and skill.lower() != "all":
        query = query.filter(Job.skills.any(Skill.name.ilike(skill)))

    total = query.count()
    total_pages = (total + page_size - 1) // page_size

    jobs = (
        query.order_by(Job.posted_date.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    formatted_jobs = []
    for j in jobs:
        formatted_jobs.append(JobOut(
            id=j.id,
            job_title=j.job_title,
            normalized_role=j.normalized_role,
            company=j.company,
            location=j.location,
            city=j.city,
            state=j.state,
            country=j.country,
            description=j.description,
            experience_min=j.experience_min,
            experience_max=j.experience_max,
            salary_min=j.salary_min,
            salary_max=j.salary_max,
            salary_currency=j.salary_currency,
            salary_period=j.salary_period,
            work_mode=j.work_mode,
            posted_date=j.posted_date,
            source=j.source,
            created_at=j.created_at,
            skills=[JobSkillOut(id=s.id, name=s.name, category=s.category) for s in j.skills]
        ))

    return JobListResponse(
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
        jobs=formatted_jobs
    )

@router.get("/{job_id}", response_model=JobOut)
def get_job_by_id(job_id: int, db: Session = Depends(get_db)):
    """Retrieve details for a single job post."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail=f"Job post with ID {job_id} not found.")

    return JobOut(
        id=job.id,
        job_title=job.job_title,
        normalized_role=job.normalized_role,
        company=job.company,
        location=job.location,
        city=job.city,
        state=job.state,
        country=job.country,
        description=job.description,
        experience_min=job.experience_min,
        experience_max=job.experience_max,
        salary_min=job.salary_min,
        salary_max=job.salary_max,
        salary_currency=job.salary_currency,
        salary_period=job.salary_period,
        work_mode=job.work_mode,
        posted_date=job.posted_date,
        source=job.source,
        created_at=job.created_at,
        skills=[JobSkillOut(id=s.id, name=s.name, category=s.category) for s in job.skills]
    )
