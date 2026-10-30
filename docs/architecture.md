# JMI — System Architecture & Design

## 1. Overview
JMI (Job Market Intelligence) is a multi-tier, full-stack Data Science and Analytics application designed to provide data-driven market intelligence across roles, skills, salaries, and geographic clusters.

## 2. High-Level Architecture
```
+-------------------------------------------------------------------------+
|                        Frontend Tier (React + Vite)                     |
|  - Pages: Landing, Dashboard, Job Explorer, Skill Trends, Roles,        |
|           Skill Gap, Salary & Location, Data Pipeline, Settings         |
|  - UI: Tailwind CSS, Lucide Icons, Recharts, Responsive Layout          |
+------------------------------------+------------------------------------+
                                     | HTTP / REST (Axios)
                                     v
+-------------------------------------------------------------------------+
|                        Backend Tier (FastAPI)                           |
|  - Routers: Dashboard, Jobs, Skills, Roles, Salary, Skill Gap, Pipeline |
|  - Service Layer: Data Cleaner, Ingestion, Resume Parser, Trend Engine  |
|  - ML Engines: TF-IDF Vectorizer, Cosine Sim, KMeans, Anomaly Spikes    |
+------------------------------------+------------------------------------+
                                     | SQLAlchemy ORM
                                     v
+-------------------------------------------------------------------------+
|                      Persistence Tier (PostgreSQL / SQLite)             |
|  - Models: jobs, skills, job_skills, companies, locations, pipeline_runs|
+-------------------------------------------------------------------------+
```

## 3. Data Processing Stages
1. **Data Ingestion**: Multi-source CSV upload & verified public datasets.
2. **Text Normalization**: Regex boundary stripping, punctuation cleanup, case folding.
3. **Skill Extraction Engine**: Taxonomy dictionary matching 100+ technologies across AI/ML, Cloud, Data Science, Databases, and Web.
4. **Canonical Role Normalization**: Maps diverse titles (`Sr. Reporting Analyst` -> `Data Analyst`).
5. **Salary Extraction Engine**: Converts multi-format expressions (`₹10-18 LPA`, `1,200,000 INR`) to standardized LPA.
6. **Machine Learning Engines**: Unsupervised clustering (KMeans), Cosine Similarity matching, Anomaly Detection (rolling Z-scores).
