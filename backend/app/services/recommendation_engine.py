from typing import List, Dict, Any
from app.ml.similarity import job_similarity_engine

class RecommendationEngine:
    """Computes similarity-based job recommendations for candidate profiles."""

    def rank_jobs_for_candidate(
        self,
        candidate_skills: List[str],
        jobs: List[Dict[str, Any]],
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Rank job postings against candidate skills using TF-IDF and skill overlap.
        """
        if not candidate_skills or not jobs:
            return jobs[:limit]

        cand_text = " ".join(candidate_skills)
        job_descs = [f"{j.get('job_title', '')} {j.get('description', '')} {' '.join(j.get('skills', []))}" for j in jobs]

        sim_scores = job_similarity_engine.calculate_match_scores(cand_text, job_descs)

        scored_jobs = []
        for i, job in enumerate(jobs):
            direct_score, matched, partial, missing = job_similarity_engine.compute_direct_skill_match(
                candidate_skills, job.get("skills", [])
            )
            # Blend TF-IDF cosine score (40%) and direct skill match score (60%)
            blended_match = round(0.40 * sim_scores[i] + 0.60 * direct_score, 1)
            
            job_copy = dict(job)
            job_copy["match_score"] = blended_match
            job_copy["matched_skills"] = matched
            job_copy["missing_skills"] = missing
            scored_jobs.append(job_copy)

        scored_jobs.sort(key=lambda x: x.get("match_score", 0), reverse=True)
        return scored_jobs[:limit]

recommendation_engine = RecommendationEngine()
