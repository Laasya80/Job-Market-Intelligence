import numpy as np
from typing import List, Dict, Any, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class JobSimilarityEngine:
    """TF-IDF and Cosine Similarity engine for candidate skill matching and job recommendations."""

    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            stop_words="english",
            ngram_range=(1, 2),
            sublinear_tf=True,
            max_features=5000
        )

    def calculate_match_scores(self, candidate_text: str, job_descriptions: List[str]) -> np.ndarray:
        """
        Compute cosine similarity scores between candidate profile text and a list of job descriptions.
        Returns 1D numpy array of float match percentages (0.0 to 100.0).
        """
        if not candidate_text or not job_descriptions:
            return np.zeros(len(job_descriptions))

        corpus = [candidate_text] + job_descriptions
        tfidf_matrix = self.vectorizer.fit_transform(corpus)
        
        cand_vec = tfidf_matrix[0:1]
        job_vecs = tfidf_matrix[1:]

        similarities = cosine_similarity(cand_vec, job_vecs)[0]
        # Scale to 0 - 100%
        return np.round(similarities * 100.0, 2)

    def compute_direct_skill_match(self, candidate_skills: List[str], required_skills: List[str]) -> Tuple[float, List[str], List[str], List[str]]:
        """
        Calculates direct set-theoretic skill overlap:
        - Matched skills
        - Partially related skills
        - Missing skills
        - Match score %
        """
        cand_set = {s.strip().lower() for s in candidate_skills if s.strip()}
        req_set = {s.strip().lower() for s in required_skills if s.strip()}

        if not req_set:
            return 100.0, candidate_skills, [], []

        matched = []
        partial = []
        missing = []

        # Find direct matches and partial matches
        for req in required_skills:
            req_l = req.strip().lower()
            if req_l in cand_set:
                matched.append(req)
            elif any(req_l in c or c in req_l for c in cand_set if len(c) > 3):
                partial.append(req)
            else:
                missing.append(req)

        # Weighted calculation (matched=1.0, partial=0.5)
        raw_score = (len(matched) * 1.0 + len(partial) * 0.5) / len(required_skills)
        match_score = round(min(100.0, raw_score * 100.0), 1)

        return match_score, matched, partial, missing

job_similarity_engine = JobSimilarityEngine()
