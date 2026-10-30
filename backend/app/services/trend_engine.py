import pandas as pd
from typing import List, Dict, Any, Tuple
from itertools import combinations
from collections import defaultdict
from app.ml.emerging_skills import emerging_skills_engine

class TrendEngine:
    """Calculates time-series trends, role-skill matrices, and pairwise co-occurrences."""

    def compute_cooccurrences(self, job_skills_data: List[List[str]], min_support: int = 3, limit: int = 25) -> List[Dict[str, Any]]:
        """
        Calculates frequent skill co-occurrences and association metrics.
        Input: list of skill-lists per job posting.
        """
        pair_counts = defaultdict(int)
        single_counts = defaultdict(int)
        total_jobs = len(job_skills_data)

        if total_jobs == 0:
            return []

        for skills in job_skills_data:
            unique_skills = sorted(list(set(skills)))
            for s in unique_skills:
                single_counts[s] += 1
            for pair in combinations(unique_skills, 2):
                pair_counts[pair] += 1

        results = []
        for (s1, s2), count in pair_counts.items():
            if count >= min_support:
                support = round((count / total_jobs) * 100.0, 2)
                confidence = round((count / max(single_counts[s1], 1)) * 100.0, 2)
                results.append({
                    "source_skill": s1,
                    "target_skill": s2,
                    "cooccurrence_count": count,
                    "support": support,
                    "confidence": confidence
                })

        # Sort by co-occurrence count descending
        results.sort(key=lambda x: x["cooccurrence_count"], reverse=True)
        return results[:limit]

    def build_role_skill_heatmap(self, jobs_with_skills: List[Dict[str, Any]], top_n_skills: int = 10) -> Dict[str, Any]:
        """
        Builds a heatmap matrix of skills vs roles.
        Returns: {"roles": [...], "skills": [...], "matrix": [{role: "Data Analyst", "Python": 32.5, ...}]}
        """
        if not jobs_with_skills:
            return {"roles": [], "skills": [], "matrix": []}

        # Aggregate counts
        role_totals = defaultdict(int)
        role_skill_counts = defaultdict(lambda: defaultdict(int))
        all_skills_count = defaultdict(int)

        for job in jobs_with_skills:
            role = job["normalized_role"]
            role_totals[role] += 1
            for skill in job.get("skills", []):
                role_skill_counts[role][skill] += 1
                all_skills_count[skill] += 1

        top_skills = [s for s, _ in sorted(all_skills_count.items(), key=lambda x: x[1], reverse=True)[:top_n_skills]]
        roles = sorted(list(role_totals.keys()))

        matrix = []
        for role in roles:
            total_in_role = role_totals[role]
            row = {"role": role, "total_jobs": total_in_role}
            for skill in top_skills:
                pct = round((role_skill_counts[role][skill] / max(total_in_role, 1)) * 100.0, 1)
                row[skill] = pct
            matrix.append(row)

        return {
            "roles": roles,
            "skills": top_skills,
            "matrix": matrix
        }

trend_engine = TrendEngine()
