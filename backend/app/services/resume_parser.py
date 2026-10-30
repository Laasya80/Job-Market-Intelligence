import io
import re
from typing import List, Dict, Any, Tuple
from pypdf import PdfReader
from app.services.skill_extractor import skill_extractor

class ResumeParser:
    """Extracts raw text and parsed skills/experience from uploaded PDF resumes."""

    def extract_text_from_pdf(self, pdf_bytes: bytes) -> str:
        """Extract plain text from PDF byte stream."""
        try:
            reader = PdfReader(io.BytesIO(pdf_bytes))
            text_pages = []
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text_pages.append(extracted)
            return "\n".join(text_pages)
        except Exception as e:
            return ""

    def parse_resume(self, pdf_bytes: bytes) -> Dict[str, Any]:
        """Parses resume text and extracts candidate skills and experience hints."""
        text = self.extract_text_from_pdf(pdf_bytes)
        if not text:
            return {
                "raw_text": "",
                "skills": [],
                "estimated_experience_years": 1.0,
                "detected_roles": [],
                "candidate_name": None,
                "candidate_email": None,
                "candidate_phone": None
            }

        # Extract skills using taxonomy engine
        extracted_skills = skill_extractor.extract_skill_names(text)

        # Estimate experience
        exp_match = re.search(r"(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)\s*(?:of\s*)?experience", text, re.IGNORECASE)
        est_exp = float(exp_match.group(1)) if exp_match else 2.0

        # Detect prospective roles
        detected_roles = []
        for role in ["Data Analyst", "Data Scientist", "Data Engineer", "ML Engineer", "BI Developer", "Software Engineer"]:
            if re.search(rf"\b{re.escape(role)}\b", text, re.IGNORECASE):
                detected_roles.append(role)

        contact = self.extract_contact_details(text)

        return {
            "raw_text": text,
            "skills": extracted_skills,
            "estimated_experience_years": est_exp,
            "detected_roles": detected_roles,
            **contact
        }

    def extract_contact_details(self, text: str) -> Dict[str, Any]:
        email_match = re.search(r"[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}", text, re.IGNORECASE)
        phone_match = re.search(r"(?<!\w)(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{3,5}\)?[\s.-]?)?\d{5}[\s.-]?\d{5}(?!\w)", text)
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        candidate_name = None
        if lines:
            first_line = re.sub(r"\s{2,}.*$", "", lines[0]).strip()
            if len(first_line) <= 60 and not re.search(r"resume|curriculum|vitae|profile|email|phone|mobile|\d", first_line, re.IGNORECASE):
                candidate_name = first_line
        return {
            "candidate_name": candidate_name,
            "candidate_email": email_match.group(0) if email_match else None,
            "candidate_phone": phone_match.group(0).strip() if phone_match else None
        }

resume_parser = ResumeParser()
