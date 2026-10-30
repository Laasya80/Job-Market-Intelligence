from typing import List, Dict, Any
from app.services.skill_extractor import skill_extractor, SKILL_TAXONOMY

class MLSkillExtractor:
    """ML/NLP-enhanced skill extraction service combining taxonomy phrase matching with statistical keyword extraction."""
    
    def __init__(self):
        self.extractor = skill_extractor

    def extract_from_job(self, job_title: str, description: str) -> List[Dict[str, str]]:
        combined_text = f"{job_title}\n{description}"
        return self.extractor.extract_skills(combined_text)

    def extract_from_resume(self, resume_text: str) -> List[Dict[str, str]]:
        return self.extractor.extract_skills(resume_text)

ml_skill_extractor = MLSkillExtractor()
