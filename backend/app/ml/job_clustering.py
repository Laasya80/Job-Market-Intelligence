import numpy as np
import pandas as pd
from typing import List, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans

class JobClusteringEngine:
    """K-Means clustering on TF-IDF vectors of job descriptions to discover latent role families."""

    def __init__(self, n_clusters: int = 5):
        self.n_clusters = n_clusters

    def cluster_jobs(self, jobs_df: pd.DataFrame) -> List[Dict[str, Any]]:
        """
        Groups jobs into semantic clusters and extracts defining keywords and role profiles.
        Input DataFrame must contain: ['id', 'job_title', 'normalized_role', 'description', 'salary_min', 'salary_max']
        """
        if jobs_df.empty or len(jobs_df) < self.n_clusters:
            return []

        # Prepare corpus
        corpus = (
            jobs_df['job_title'].fillna('') + " " +
            jobs_df['normalized_role'].fillna('') + " " +
            jobs_df['description'].fillna('')
        ).tolist()

        vectorizer = TfidfVectorizer(
            stop_words='english',
            max_features=1500,
            ngram_range=(1, 2),
            min_df=2
        )
        X = vectorizer.fit_transform(corpus)

        k = min(self.n_clusters, len(jobs_df))
        kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
        cluster_labels = kmeans.fit_predict(X)
        jobs_df = jobs_df.copy()
        jobs_df['cluster'] = cluster_labels

        terms = vectorizer.get_feature_names_out()
        order_centroids = kmeans.cluster_centers_.argsort()[:, ::-1]

        cluster_results = []
        cluster_names = [
            "Advanced Analytics & BI",
            "Big Data Platforms & Cloud ETL",
            "Core Machine Learning & Deep Learning",
            "Full Stack & API Engineering",
            "Enterprise Data Science & Modeling"
        ]

        total_jobs = len(jobs_df)

        for i in range(k):
            cluster_subset = jobs_df[jobs_df['cluster'] == i]
            job_count = len(cluster_subset)
            if job_count == 0:
                continue

            # Top keywords from TF-IDF centroids
            top_term_indices = order_centroids[i, :8]
            top_keywords = [terms[ind] for ind in top_term_indices]

            # Representative canonical roles
            rep_roles = cluster_subset['normalized_role'].value_counts().head(3).index.tolist()

            # Average salary
            sal_series = cluster_subset['salary_max'].dropna()
            avg_sal = round(sal_series.mean(), 2) if not sal_series.empty else 10.5

            name = cluster_names[i % len(cluster_names)]
            if rep_roles:
                name = f"{rep_roles[0]} & {name.split('&')[-1].strip()}"

            cluster_results.append({
                "cluster_id": i + 1,
                "cluster_name": name,
                "job_count": job_count,
                "percentage": round((job_count / total_jobs) * 100.0, 1),
                "top_keywords": top_keywords,
                "representative_roles": rep_roles,
                "avg_salary_lpa": avg_sal
            })

        return sorted(cluster_results, key=lambda x: x['job_count'], reverse=True)

job_clustering_engine = JobClusteringEngine()
