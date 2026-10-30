from typing import List, Dict, Any, Optional
from collections import Counter
from app.services.skill_extractor import SKILL_TAXONOMY

class SkillGapEngine:
    """Computes candidate-to-market skill gap, match percentages, and prioritized learning roadmaps."""

    def __init__(self):
        # Default curriculum curation for popular skills
        self.learning_resources_map = {
            "SQL": ["SQL for Data Analysis (PostgreSQL/MySQL)", "Advanced Window Functions & CTEs Masterclass", "LeetCode Database 50"],
            "Python": ["Python for Data Science (NumPy, Pandas)", "Automating Real-world Workflows in Python", "Object-Oriented Design in Python"],
            "Power BI": ["Microsoft PL-300 Certification Guide", "DAX Formulas & Data Modeling in Power BI", "Enterprise Power BI Dashboards"],
            "Tableau": ["Tableau Desktop Specialist Bootcamp", "Data Storytelling & Visual Best Practices", "Tableau Calculations & LODs"],
            "Excel": ["Advanced Excel (Index/Match, XLOOKUP, Pivot)", "Financial & Statistical Modeling in Excel", "VBA & Macros Automation"],
            "Machine Learning": ["Applied Machine Learning with Scikit-learn", "Feature Engineering & Model Evaluation", "Hands-On Machine Learning (Gerón)"],
            "Deep Learning": ["Deep Learning Specialization (Andrew Ng)", "PyTorch Fundamentals for Computer Vision & NLP", "Fast.ai Practical Deep Learning"],
            "Statistics": ["Practical Statistics for Data Scientists", "Hypothesis Testing & A/B Experimentation", "Bayesian Statistics in Python"],
            "Spark": ["Apache Spark 3 with PySpark & Big Data", "Databricks Certified Associate Developer", "Distributed Data Pipelines"],
            "AWS": ["AWS Certified Solutions Architect / Cloud Practitioner", "Data Engineering on AWS (Glue, EMR, Athena)", "Serverless Microservices with Lambda"],
            "Docker": ["Docker & Containerization for Data Science", "Containerizing Web Apps and Microservices", "Docker Compose Multi-Container Workflows"],
            "Kubernetes": ["Kubernetes for Developers & MLOps", "Deploying Scalable Machine Learning Pipelines on K8s", "CKAD Guide"],
            "Generative AI": ["LangChain & LlamaIndex for LLM Applications", "Prompt Engineering & RAG Architectures", "Fine-Tuning Open Source LLMs (Hugging Face)"],
            "Airflow": ["Building Production Data Pipelines with Apache Airflow", "Data Orchestration Best Practices", "Airflow DAGs & Operators"],
            "Snowflake": ["Snowflake SnowPro Core Certification Prep", "Modern Data Warehousing with Snowflake", "SnowSQL & Stored Procedures"],
            "FastAPI": ["Building High-Performance APIs with FastAPI", "Asynchronous Python & Pydantic Validation", "FastAPI + Docker Deployment"],
            "React": ["React 18 & TypeScript Modern Frontend Development", "State Management with Zustand & React Query", "Tailwind CSS Component Design"]
        }

    def analyze_gap(
        self,
        candidate_skills: List[str],
        target_role: str,
        role_jobs: List[Dict[str, Any]],
        skill_growth_map: Optional[Dict[str, float]] = None
    ) -> Dict[str, Any]:
        """
        Analyze candidate skills against empirical role requirements.
        """
        if skill_growth_map is None:
            skill_growth_map = {}

        # 1. Normalize candidate skills
        cand_normalized = {s.strip().lower(): s.strip() for s in candidate_skills if s.strip()}
        
        # 2. Count empirical skill frequency in target role job postings
        skill_counter = Counter()
        total_role_jobs = len(role_jobs)

        for job in role_jobs:
            for skill in job.get("skills", []):
                skill_counter[skill] += 1

        # Fallback if no jobs found for role
        if total_role_jobs == 0 or not skill_counter:
            default_role_skills = {
                "Data Analyst": [("SQL", 90), ("Excel", 85), ("Power BI", 75), ("Python", 65), ("Statistics", 60), ("Tableau", 50)],
                "Data Scientist": [("Python", 95), ("Machine Learning", 90), ("SQL", 85), ("Statistics", 80), ("Pandas", 75), ("Deep Learning", 60)],
                "Data Engineer": [("SQL", 95), ("Python", 90), ("Spark", 80), ("AWS", 75), ("Airflow", 70), ("Docker", 65)],
                "ML Engineer": [("Python", 95), ("Machine Learning", 90), ("PyTorch", 85), ("Docker", 80), ("MLOps", 75), ("Kubernetes", 70)],
                "BI Developer": [("Power BI", 95), ("SQL", 90), ("Tableau", 80), ("Excel", 75), ("Data Modeling", 70)],
                "Software Engineer": [("Python", 85), ("JavaScript", 80), ("React", 75), ("SQL", 75), ("Docker", 70), ("Git", 70)]
            }
            presets = default_role_skills.get(target_role, default_role_skills["Data Analyst"])
            for skill, count in presets:
                skill_counter[skill] = count
            total_role_jobs = 100

        # Required skills are those appearing in > 10% of role jobs
        required_skills_data = []
        for skill, count in skill_counter.most_common(15):
            freq_pct = round((count / total_role_jobs) * 100.0, 1)
            required_skills_data.append((skill, freq_pct))

        matched = []
        partially_matched = []
        missing = []

        total_weight = 0.0
        earned_weight = 0.0

        for skill, freq_pct in required_skills_data:
            weight = freq_pct
            total_weight += weight
            skill_lower = skill.lower()

            if skill_lower in cand_normalized:
                matched.append(skill)
                earned_weight += weight
            elif any(skill_lower in c or c in skill_lower for c in cand_normalized if len(c) > 3):
                partially_matched.append(skill)
                earned_weight += (weight * 0.5)
            else:
                missing.append(skill)

        # Profile match score
        profile_match_score = round((earned_weight / max(total_weight, 1.0)) * 100.0, 1)
        profile_match_score = min(100.0, max(5.0, profile_match_score))

        # Benchmark market average (typically 55-65% for typical job seekers)
        benchmark_avg = 58.5

        # 3. Create Prioritized Learning Roadmap for missing & partial skills
        roadmap = []
        gap_candidates = missing + partially_matched

        for skill in gap_candidates:
            # Find market demand frequency
            freq_pct = next((f for s, f in required_skills_data if s == skill), 20.0)
            norm_demand = freq_pct / 100.0

            growth_rate = skill_growth_map.get(skill, 12.0)
            norm_growth = max(0.0, min(1.0, (growth_rate + 20.0) / 100.0))

            # Missing gets 1.0 gap weight, partial gets 0.5
            gap_weight = 1.0 if skill in missing else 0.5

            # Priority formula:
            priority_score = round((norm_demand * 0.50 + norm_growth * 0.30 + gap_weight * 0.20) * 100.0, 1)

            category = SKILL_TAXONOMY.get(skill, {}).get("category", "Technology")
            resources = self.learning_resources_map.get(skill, [
                f"Mastering {skill} Fundamentals & Practical Projects",
                f"Official {skill} Documentation and Best Practices",
                f"{skill} Real-world Case Studies & Portfolio Projects"
            ])

            # Duration estimate based on complexity
            est_weeks = 4 if category in ["ML/AI", "Cloud/DevOps", "Data Engineering"] else (3 if category in ["Programming", "Database"] else 2)

            roadmap.append({
                "skill": skill,
                "category": category,
                "market_demand_pct": freq_pct,
                "growth_rate_pct": round(growth_rate, 1),
                "gap_priority_score": priority_score,
                "recommended_duration_weeks": est_weeks,
                "learning_resources": resources
            })

        # Sort roadmap descending by priority score
        roadmap.sort(key=lambda x: x["gap_priority_score"], reverse=True)

        # Dynamic Insights
        insights = []
        if profile_match_score >= 80:
            insights.append(f"Strong fit for {target_role}! You possess {len(matched)} of the top {len(required_skills_data)} required competencies.")
        elif profile_match_score >= 50:
            insights.append(f"Moderate alignment for {target_role}. Mastering {roadmap[0]['skill'] if roadmap else 'core tools'} will elevate your profile significantly.")
        else:
            insights.append(f"Foundational gaps identified for {target_role}. Prioritize high-frequency skills like {roadmap[0]['skill'] if roadmap else 'SQL'}.")

        if missing:
            insights.append(f"Top missing skill '{missing[0]}' appears in {next((f for s, f in required_skills_data if s == missing[0]), 50)}% of target job openings.")

        return {
            "target_role": target_role,
            "profile_match_score": profile_match_score,
            "total_required_skills": len(required_skills_data),
            "matched_skills": matched,
            "partially_matched_skills": partially_matched,
            "missing_skills": missing,
            "benchmark_market_avg_score": benchmark_avg,
            "roadmap": roadmap,
            "insights": insights
        }

skill_gap_engine = SkillGapEngine()
