from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import json
from app.database import get_db
from app.models.job import Job
from app.schemas.analytics import SkillGapRequest, SkillGapResponse
from app.services.skill_gap_engine import skill_gap_engine
from app.services.resume_parser import resume_parser
from app.services.skill_extractor import skill_extractor

router = APIRouter(prefix="/skill-gap", tags=["Skill Gap Analyzer"])

@router.post("/analyze", response_model=SkillGapResponse)
def analyze_skill_gap(request: SkillGapRequest, db: Session = Depends(get_db)):
    """Analyze candidate skills against empirical target role job postings."""
    # Fetch job postings matching target role
    jobs = db.query(Job).filter(Job.normalized_role.ilike(f"%{request.target_role.strip()}%")).all()
    if not jobs:
        jobs = db.query(Job).all()

    role_jobs_data = [{"skills": [s.name for s in j.skills]} for j in jobs]
    
    # If raw resume text was provided, extract additional skills
    skills_to_use = list(request.candidate_skills)
    if request.raw_resume_text:
        extracted = skill_extractor.extract_skill_names(request.raw_resume_text)
        skills_to_use = list(set(skills_to_use + extracted))

    # Growth rate mapping for roadmap prioritization
    growth_map = {
        "Generative AI": 48.0,
        "Machine Learning": 34.5,
        "PyTorch": 29.0,
        "Power BI": 22.0,
        "AWS": 18.5,
        "Python": 14.0,
        "SQL": 8.5,
        "Tableau": 6.0,
        "Excel": 2.0
    }

    result = skill_gap_engine.analyze_gap(
        candidate_skills=skills_to_use,
        target_role=request.target_role,
        role_jobs=role_jobs_data,
        skill_growth_map=growth_map
    )

    return SkillGapResponse(**result)

@router.post("/upload-resume", response_model=SkillGapResponse)
async def upload_resume_and_analyze(
    file: UploadFile = File(...),
    target_role: str = Form("Data Analyst"),
    db: Session = Depends(get_db)
):
    """Upload a PDF resume, extract text/skills automatically, and analyze skill gap against target role."""
    if not file.filename.lower().endswith((".pdf", ".txt")):
        raise HTTPException(status_code=400, detail="Only PDF and TXT resumes are supported.")

    file_bytes = await file.read()
    if file.filename.lower().endswith(".pdf"):
        parsed = resume_parser.parse_resume(file_bytes)
        candidate_skills = parsed["skills"]
        raw_text = parsed["raw_text"]
    else:
        raw_text = file_bytes.decode("utf-8", errors="ignore")
        candidate_skills = skill_extractor.extract_skill_names(raw_text)
        parsed = resume_parser.extract_contact_details(raw_text)

    # If no skills could be extracted, add fallback defaults
    if not candidate_skills:
        candidate_skills = ["Python", "SQL", "Excel"]

    req = SkillGapRequest(
        candidate_skills=candidate_skills,
        target_role=target_role,
        raw_resume_text=raw_text
    )
    result = analyze_skill_gap(req, db=db)
    result_data = result.dict()
    result_data.update({
        "candidate_name": parsed.get("candidate_name"),
        "candidate_email": parsed.get("candidate_email"),
        "candidate_phone": parsed.get("candidate_phone")
    })
    return SkillGapResponse(**result_data)
