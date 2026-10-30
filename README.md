# JMI — Job Market Intelligence Platform

> **Final-Year Computer Science Capstone Project**  
> *Data Science, NLP, Machine Learning, Analytics & Visualization Engine for Labor Market Dynamics*

---

## 📌 1. Project Overview & Problem Statement

The modern technology job market evolves rapidly. Traditional career planning and job portals suffer from static keyword searches, vague job descriptions, and lack of quantitative intelligence regarding:
- Real-time skill demand trajectories and emerging vs. declining tools
- Salary benchmarks calibrated by city cost-of-living index
- Quantitative candidate skill gaps with actionable learning roadmaps
- Unsupervised discovery of latent job families and market anomalies

**JMI (Job Market Intelligence)** is a full-stack, production-grade analytics platform that transforms unstructured job postings into rich, empirical market intelligence using Python, NLP, and Machine Learning.

---

## 🎯 2. Core Objectives

1. **Skill Demand Extraction**: Extract 100+ technologies across AI/ML, Cloud, Data Science, Databases, and Web using word-boundary regex and phrase taxonomies.
2. **Time-Series Trend Decomposition**: Calculate smoothed month-over-month growth rates, market penetration, and blended emerging scores.
3. **Candidate Skill Gap Analysis**: Ingest PDF resumes or manual skill lists, calculate empirical match scores against real job postings, and generate prioritized learning roadmaps.
4. **Unsupervised Role Clustering**: Apply TF-IDF vectorization and K-Means clustering to discover latent role families and centroid keywords.
5. **Real-Time Market Anomaly Detection**: Surface statistical demand surges and compensation spikes using rolling Z-scores ($Z \ge 1.8$).

---

## 🛠️ 3. Tech Stack

### Frontend:
- **Framework**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS (Clean SaaS Theme: Blue primary, Teal secondary, Purple analytics accent)
- **Icons**: Lucide React
- **Charts & Visualizations**: Recharts (Radar, Horizontal Bar, Multi-line time series, Donut, Grouped Bar)
- **Routing & Networking**: React Router DOM v6, Axios

### Backend:
- **API Engine**: Python 3.11+ / FastAPI (Asynchronous REST API, Pydantic v2 schemas)
- **ORM & Database**: SQLAlchemy 2.0 (Dual-mode: Zero-config SQLite for immediate start + PostgreSQL production support)
- **Data Engineering & ML**: Pandas, NumPy, Scikit-learn (TF-IDF, KMeans, Cosine Similarity), PyPDF

### Deployment & Tooling:
- **Containerization**: Docker, Docker Compose
- **Quality Assurance**: Pytest (100% test suite passing across all modules)

---

## 📐 4. Mathematical Formulations & Data Science Methodology

### 4.1 Blended Emerging Skill Score
$$\text{Emerging Score} = 0.50 \cdot \widehat{\text{Growth}} + 0.30 \cdot \widehat{\text{Market Share}} + 0.20 \cdot \widehat{\text{Volume}}$$
$$\text{Growth Rate} = \frac{C_t - C_{t-1}}{\max(C_{t-1}, 1)} \times 100$$
*Growth rates are smoothed and normalized to prevent small-sample volatility from distorting rankings.*

### 4.2 Candidate Skill Gap & Priority Score
$$\text{Profile Match Score} = \frac{\sum_{s_i \in \text{Matched}} w_i + 0.5 \sum_{s_j \in \text{Partial}} w_j}{\sum_{s_k \in R} w_k} \times 100$$
$$\text{Priority Score}(s_m) = 0.50 \cdot \text{Demand}(s_m) + 0.30 \cdot \text{Growth}(s_m) + 0.20 \cdot \text{GapWeight}$$

### 4.3 Unsupervised Job Family Clustering
1. TF-IDF feature extraction over job descriptions ($N$-gram range: 1 to 2, sublinear term-frequency scaling).
2. K-Means clustering ($K=5$) minimizing Euclidean inertia:
   $$\arg\min_S \sum_{i=1}^{k} \sum_{x \in S_i} \|x - \mu_i\|^2$$
3. Extraction of top defining keywords via cluster centroids $\mu_k$.

### 4.4 Rolling Z-Score Anomaly Detection
$$Z = \frac{x_t - \mu_{t-1}}{\sigma_{t-1}}$$
*Alerts are triggered for $Z \ge 1.8$ with severity classification and descriptive insights.*

---

## 🖥️ 5. Application Modules & Pages

1. **Landing Page (`/`)**: Hero section, live feature overview, verified demo dataset statistics counter (128K+ Posts, 400+ Skills, 1000+ Companies).
2. **Dashboard Overview (`/dashboard`)**: Summary KPIs, Top 10 In-Demand Skills bar chart, Monthly Skill Demand Trends line chart, Role Distribution donut chart, Hiring Hotspots city list, Emerging Skills table, Automated Market Insight cards.
3. **Job Explorer (`/jobs`)**: Filterable data table (Role, Location, Experience, Salary, Work Mode, Skills), full-text search, and slide-over **Job Details Drawer** with match scores.
4. **Skill Trends (`/skills`)**: Monthly demand curves, Role-Skill Heatmap matrix, 1-on-1 Skill Comparison tool, and Apriori skill pair co-occurrences.
5. **Role Intelligence (`/roles`)**: 6-axis Competency Demand Radar Chart (SQL, Python, BI Tools, Statistics, Machine Learning, Communication), Career Progression Ladder with salary benchmarks, and Role vs Role comparator.
6. **Skill Gap Analyzer (`/skill-gap`)**: PDF Resume upload + manual skill entry, alignment gauge, Matched/Partial/Missing skill audit, and Prioritized Learning Roadmap with curated resources.
7. **Salary & Location (`/salary-location`)**: Salary LPA distribution histogram, Metro vs Non-Metro premium analysis, Cost-of-Living adjusted purchasing power, and Work Mode distribution.
8. **Data Pipeline (`/pipeline`)**: Visual 6-stage ETL flow, Data Quality metrics (Completeness, Consistency, Uniqueness, Validity), live telemetry logs, schema coverage, and CSV Dataset Uploader.
9. **Settings & ML Configuration (`/settings`)**: Interactive weight tuning sliders for emerging formulas, runtime telemetry, and KMeans cluster inspector.

---

## 📂 6. Folder Structure

```
job-market-intelligence/
├── backend/
│   ├── app/
│   │   ├── api/             # FastAPI routers (dashboard, jobs, skills, roles, salary, skill_gap, pipeline, analytics)
│   │   ├── models/          # SQLAlchemy ORM models (Job, Skill, JobSkill, Company, Role, Location, PipelineRun)
│   │   ├── schemas/         # Pydantic validation schemas
│   │   ├── services/        # Business logic, DataLoader, DataCleaner, SkillExtractor, TrendEngine, SkillGapEngine
│   │   ├── ml/              # TF-IDF Vectorizer, KMeans Clustering, EmergingSkills, AnomalyDetection
│   │   ├── utils/           # Helper formatters and math routines
│   │   ├── config.py        # Settings & CORS config
│   │   ├── database.py      # SQLAlchemy session factory
│   │   └── main.py          # FastAPI application entrypoint
│   ├── tests/               # Pytest suite
│   ├── requirements.txt     # Python dependencies
│   ├── Dockerfile           # Backend container
│   └── run.py               # Standalone runner script
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios API client
│   │   ├── components/      # Reusable UI (Sidebar, TopNavbar, KPICard, ChartCard, FilterBar, DataTable, JobDrawer)
│   │   ├── pages/           # 8 production pages + Landing Page
│   │   ├── types/           # TypeScript interfaces
│   │   ├── utils/           # LPA currency & percentage formatters
│   │   ├── App.tsx          # Router configuration
│   │   └── main.tsx         # React root
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── nginx.conf
│   └── Dockerfile
├── data/
│   ├── raw/                 # sample_jobs.csv (1,250+ records)
│   └── processed/           # cleaned_jobs.csv
├── notebooks/
│   ├── 01_data_cleaning.ipynb
│   ├── 02_exploratory_analysis.ipynb
│   ├── 03_skill_extraction.ipynb
│   ├── 04_skill_trend_analysis.ipynb
│   ├── 05_job_clustering.ipynb
│   └── 06_skill_gap_analysis.ipynb
├── docs/
│   ├── architecture.md
│   ├── data_dictionary.md
│   └── ml_methodology.md
├── docker-compose.yml
└── README.md
```

---

## 🚀 7. Installation & Quickstart

### Method 1: Local Development (Instant Zero-Config)

#### 1. Backend Setup:
```bash
cd backend
# Create virtual environment (optional)
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python run.py
```
*The backend automatically seeds the database with 1,250 verified job market records and starts at `http://127.0.0.1:8000`. Swagger docs available at `http://127.0.0.1:8000/docs`.*

#### 2. Frontend Setup:
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs at `http://localhost:5173` with instant hot-reloading and proxy configured to the backend.*

---

### Method 2: Multi-Container Docker Compose

```bash
docker compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- PostgreSQL: `localhost:5432`

---

## 🧪 8. Automated Testing

Run the comprehensive pytest suite in the `backend` directory:
```bash
cd backend
python -m pytest tests/test_api.py -v
```
All 8 test suites (Health, Dashboard KPIs, Top Skills, Jobs with Pagination & Filters, Role Intelligence Radar, Skill Gap Engine, KMeans Clustering, and Anomaly Alerts) will execute and validate.

---

## 📜 9. License & Academic Demonstration

Developed as a Final-Year Computer Science Capstone Project. Suitable for university presentations, viva demonstrations, and portfolio showcases.
