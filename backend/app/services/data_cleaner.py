import re
import pandas as pd
import numpy as np
from datetime import datetime, date, timedelta
from typing import Dict, Any, Tuple, List, Optional
from app.services.role_normalizer import role_normalizer
from app.services.salary_parser import salary_parser
from app.services.skill_extractor import skill_extractor

COLUMN_ALIASES: Dict[str, List[str]] = {
    "job_title": ["job_title", "title", "job title", "position", "role", "designation", "job_name", "headline", "jobtitle"],
    "company": ["company", "company_name", "company name", "organization", "employer", "firm", "companyname"],
    "location": ["location", "job_location", "job location", "city", "place", "location_raw", "address", "work_location"],
    "description": ["description", "job_description", "job description", "summary", "job_summary", "responsibilities", "details", "jd", "jobdescription"],
    "salary": ["salary", "salary_range", "salary range", "ctc", "compensation", "pay", "package", "salary_raw", "salary_text", "salary_min"],
    "experience": ["experience", "experience_required", "exp", "work_experience", "work experience", "experience_min", "min_exp", "years_of_experience", "experience_range"],
    "posted_date": ["posted_date", "post_date", "date", "created_at", "posting_date", "date_posted", "posteddate", "job_posted_date"],
    "skills": ["skills", "key_skills", "key skills", "technologies", "skillset", "required_skills", "tech_stack", "skills_list"],
    "work_mode": ["work_mode", "work mode", "employment_type", "type", "mode", "work_type", "workplace_type", "workmode"]
}

class DataCleaner:
    """Enterprise-grade cleaning, normalization, and data validation engine for job market datasets."""

    def map_dataframe_columns(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Normalize DataFrame column names using fuzzy/alias mapping.
        """
        df_copy = df.copy()
        current_cols = [str(c).strip().lower() for c in df_copy.columns]
        
        rename_map = {}
        for canonical, aliases in COLUMN_ALIASES.items():
            for alias in aliases:
                for idx, col in enumerate(current_cols):
                    if col == alias.lower() or col.replace("_", " ") == alias.lower() or col.replace(" ", "_") == alias.lower():
                        rename_map[df_copy.columns[idx]] = canonical
                        break
                if canonical in rename_map.values():
                    break

        df_mapped = df_copy.rename(columns=rename_map)
        return df_mapped

    def parse_experience_string(self, exp_val: Any) -> Tuple[float, float]:
        """
        Extract (min_exp, max_exp) in years from strings like '2-5 years', '3+ yrs', 'Freshers'.
        """
        if exp_val is None or pd.isna(exp_val):
            return 0.0, 5.0

        if isinstance(exp_val, (int, float)):
            val = float(exp_val)
            return max(0.0, val), max(0.0, val + 3.0)

        text = str(exp_val).strip().lower()
        if "fresher" in text or "entry" in text or "0" in text and ("year" not in text or "0-" in text or "0 to" in text):
            return 0.0, 2.0

        # Match ranges e.g. "3-6 years", "3 to 6 yrs", "3 - 5"
        range_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)", text)
        if range_match:
            try:
                min_e = float(range_match.group(1))
                max_e = float(range_match.group(2))
                return min(min_e, max_e), max(min_e, max_e)
            except ValueError:
                pass

        # Match single e.g. "5+ years", "3 yrs"
        single_match = re.search(r"(\d+(?:\.\d+)?)", text)
        if single_match:
            try:
                min_e = float(single_match.group(1))
                return min_e, min_e + 3.0
            except ValueError:
                pass

        return 0.0, 5.0

    def parse_posted_date(self, date_val: Any) -> date:
        """
        Robust date parsing supporting ISO, DD/MM/YYYY, DD-MM-YYYY, relative strings, and fallbacks.
        """
        if date_val is None or pd.isna(date_val):
            return date.today()

        if isinstance(date_val, date) and not isinstance(date_val, datetime):
            return date_val
        if isinstance(date_val, datetime):
            return date_val.date()

        date_str = str(date_val).strip()
        if not date_str:
            return date.today()

        # Handle relative formats
        date_lower = date_str.lower()
        if "today" in date_lower:
            return date.today()
        elif "yesterday" in date_lower:
            return date.today() - timedelta(days=1)
        
        days_ago = re.search(r"(\d+)\s*days?\s*ago", date_lower)
        if days_ago:
            return date.today() - timedelta(days=int(days_ago.group(1)))

        months_ago = re.search(r"(\d+)\s*(?:months?|mon)\s*ago", date_lower)
        if months_ago:
            return date.today() - timedelta(days=int(months_ago.group(1)) * 30)

        # Standard date patterns
        date_formats = [
            "%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y", "%m/%d/%Y",
            "%Y/%m/%d", "%d %b %Y", "%d %B %Y", "%b %d, %Y",
            "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d %H:%M:%S"
        ]

        for fmt in date_formats:
            try:
                return datetime.strptime(date_str, fmt).date()
            except ValueError:
                continue

        return date.today()

    def clean_and_normalize_record(self, raw_record: Dict[str, Any]) -> Dict[str, Any]:
        """Process and normalize a single raw job posting record."""
        # 1. Clean Title and Normalize Role
        raw_title = str(raw_record.get("job_title", "") or raw_record.get("title", "") or raw_record.get("position", "")).strip()
        normalized_role = raw_record.get("normalized_role")
        if not normalized_role:
            normalized_role = role_normalizer.normalize(raw_title)

        # 2. Company
        company = str(raw_record.get("company", "") or raw_record.get("company_name", "TechCorp")).strip()
        if not company or company.lower() in ["nan", "none", "null"]:
            company = "TechCorp Solutions"

        # 3. Location & City extraction
        location_raw = str(raw_record.get("location", "") or raw_record.get("city", "Bengaluru, Karnataka")).strip()
        city_raw = raw_record.get("city")
        
        city_matches = [
            ("Bengaluru", ["bengaluru", "bangalore", "blr"]),
            ("Hyderabad", ["hyderabad", "secunderabad", "hyd"]),
            ("Pune", ["pune"]),
            ("Mumbai", ["mumbai", "bombay", "navi mumbai", "thane"]),
            ("Delhi NCR", ["delhi", "delhi ncr", "gurgaon", "gurugram", "noida", "ncr", "faridabad", "ghaziabad"]),
            ("Chennai", ["chennai", "madras"])
        ]

        city = "Bengaluru"
        found_city = False
        target_text = f"{location_raw} {city_raw or ''}".lower()
        for canonical_city, aliases in city_matches:
            for alias in aliases:
                if re.search(rf"\b{re.escape(alias)}\b", target_text):
                    city = canonical_city
                    found_city = True
                    break
            if found_city:
                break

        # State mapping
        state_map = {
            "Bengaluru": "Karnataka",
            "Hyderabad": "Telangana",
            "Pune": "Maharashtra",
            "Mumbai": "Maharashtra",
            "Delhi NCR": "Delhi/NCR",
            "Chennai": "Tamil Nadu"
        }
        state = raw_record.get("state") or state_map.get(city, "Karnataka")

        # 4. Description
        description = str(raw_record.get("description", "") or raw_record.get("job_description", "")).strip()
        if not description or len(description) < 15 or description.lower() in ["nan", "none", "null"]:
            description = (
                f"We are hiring a skilled {raw_title or normalized_role} at {company} in {city}. "
                f"The candidate will develop data workflows, analytics pipelines, and collaborate across technical teams. "
                f"Relevant experience in data science, software tools, and communication is required."
            )

        # 5. Salary Parsing (Min, Max LPA)
        sal_min = raw_record.get("salary_min")
        sal_max = raw_record.get("salary_max")
        if sal_min is None or sal_max is None or pd.isna(sal_min) or pd.isna(sal_max):
            raw_salary = raw_record.get("salary") or raw_record.get("ctc") or raw_record.get("salary_range")
            if raw_salary is not None and not pd.isna(raw_salary):
                parsed_min, parsed_max, _, _ = salary_parser.parse_salary(raw_salary)
                sal_min = parsed_min if sal_min is None else sal_min
                sal_max = parsed_max if sal_max is None else sal_max

        # Fallback default reasonable LPA if both null
        if sal_min is None and sal_max is None:
            # Leave as None or estimate default
            pass

        # 6. Experience (Min, Max)
        exp_min = raw_record.get("experience_min")
        exp_max = raw_record.get("experience_max")
        if exp_min is None or exp_max is None or pd.isna(exp_min) or pd.isna(exp_max):
            raw_exp = raw_record.get("experience") or raw_record.get("exp") or raw_record.get("work_experience")
            parsed_min_e, parsed_max_e = self.parse_experience_string(raw_exp)
            exp_min = parsed_min_e if exp_min is None else float(exp_min)
            exp_max = parsed_max_e if exp_max is None else float(exp_max)
        else:
            exp_min, exp_max = float(exp_min), float(exp_max)

        # 7. Work Mode
        raw_mode = str(raw_record.get("work_mode", "") or raw_record.get("employment_type", "Onsite")).strip().capitalize()
        if "hybrid" in raw_mode.lower():
            work_mode = "Hybrid"
        elif "remote" in raw_mode.lower() or "wfh" in raw_mode.lower():
            work_mode = "Remote"
        else:
            work_mode = "Onsite"

        # 8. Posted Date
        posted_date = self.parse_posted_date(raw_record.get("posted_date") or raw_record.get("date"))

        # 9. Skill Extraction
        explicit_skills = raw_record.get("skills", [])
        if isinstance(explicit_skills, str):
            explicit_skills = [s.strip() for s in explicit_skills.split(",") if s.strip() and s.strip().lower() not in ["nan", "none"]]
        elif not isinstance(explicit_skills, list):
            explicit_skills = []

        extracted_skills = skill_extractor.extract_skill_names(f"{raw_title} {description}")
        all_skills = sorted(list(set(explicit_skills + extracted_skills)))

        return {
            "job_title": raw_title or f"{normalized_role}",
            "normalized_role": normalized_role,
            "company": company,
            "location": location_raw or f"{city}, {state}",
            "city": city,
            "state": state,
            "country": "India",
            "description": description,
            "experience_min": round(exp_min, 1),
            "experience_max": round(exp_max, 1),
            "salary_min": round(sal_min, 1) if sal_min is not None else None,
            "salary_max": round(sal_max, 1) if sal_max is not None else None,
            "salary_currency": "INR",
            "salary_period": "Annual",
            "work_mode": work_mode,
            "posted_date": posted_date,
            "source": str(raw_record.get("source", "Uploaded CSV")),
            "skills": all_skills
        }

    def compute_quality_metrics(self, df: pd.DataFrame) -> Dict[str, float]:
        """Compute data quality KPIs: Completeness, Consistency, Uniqueness, Validity."""
        if df.empty:
            return {"completeness": 100.0, "consistency": 100.0, "uniqueness": 100.0, "validity": 100.0}

        # Completeness: % of non-null critical values
        total_cells = df.size
        null_cells = df.isnull().sum().sum()
        completeness = round(((total_cells - null_cells) / max(total_cells, 1)) * 100.0, 2)

        # Uniqueness: 100 - duplicate percentage
        duplicates = df.duplicated(subset=["job_title", "company", "city"], keep=False).sum()
        uniqueness = round((1.0 - (duplicates / max(len(df), 1))) * 100.0, 2)
        uniqueness = max(0.0, min(100.0, uniqueness))

        # Validity: % of salaries and experiences within logical ranges
        valid_records = 0
        for _, row in df.iterrows():
            is_valid = True
            if "salary_min" in row and pd.notnull(row["salary_min"]) and row["salary_min"] < 0:
                is_valid = False
            if "experience_min" in row and pd.notnull(row["experience_min"]) and row["experience_min"] < 0:
                is_valid = False
            if is_valid:
                valid_records += 1
        validity = round((valid_records / max(len(df), 1)) * 100.0, 2)

        # Consistency: normalized roles belong to canonical list
        consistent_roles = 0
        canonical_set = {"Data Analyst", "Data Scientist", "Data Engineer", "ML Engineer", "BI Developer", "Software Engineer"}
        for _, row in df.iterrows():
            role = row.get("normalized_role", "")
            if role in canonical_set:
                consistent_roles += 1
        consistency = round((consistent_roles / max(len(df), 1)) * 100.0, 2)

        return {
            "completeness": completeness,
            "consistency": consistency,
            "uniqueness": uniqueness,
            "validity": validity
        }

data_cleaner = DataCleaner()
