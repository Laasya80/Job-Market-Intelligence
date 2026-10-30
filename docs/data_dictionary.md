# JMI — Data Dictionary & Schema Specification

## 1. `jobs` Table
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | Integer | Primary Key, Auto-increment | Unique identifier for job post |
| `job_title` | String(255) | Non-Null, Indexed | Original raw job title |
| `normalized_role` | String(100) | Non-Null, Indexed | Canonical standardized role (e.g. Data Analyst) |
| `company` | String(255) | Non-Null, Indexed | Employer name |
| `location` | String(255) | Nullable | Full address or city/state string |
| `city` | String(100) | Non-Null, Indexed | Standardized city (e.g. Bengaluru) |
| `state` | String(100) | Nullable | State in India |
| `country` | String(100) | Default: "India" | Country name |
| `description` | Text | Non-Null | Full job description text |
| `experience_min` | Float | Default: 0.0 | Minimum years of experience |
| `experience_max` | Float | Default: 5.0 | Maximum years of experience |
| `salary_min` | Float | Nullable | Normalized lower bound salary in LPA |
| `salary_max` | Float | Nullable | Normalized upper bound salary in LPA |
| `salary_currency`| String(10) | Default: "INR" | Currency representation |
| `salary_period` | String(20) | Default: "Annual" | Billing period |
| `work_mode` | String(50) | Default: "Onsite" | Onsite / Hybrid / Remote |
| `posted_date` | Date | Non-Null, Indexed | Date of posting |
| `source` | String(100) | Default: "Dataset" | Ingestion source identifier |

## 2. `skills` Table
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | Integer | Primary Key | Unique skill ID |
| `name` | String(100) | Unique, Non-Null | Canonical skill title (e.g. PyTorch) |
| `normalized_name`| String(100) | Indexed | Lowercase normalized name |
| `category` | String(50) | Indexed | ML/AI, Cloud/DevOps, Database, etc. |

## 3. `job_skills` Table (M2M Association)
| Column Name | Data Type | Foreign Key |
| :--- | :--- | :--- |
| `job_id` | Integer | `jobs.id` (CASCADE) |
| `skill_id` | Integer | `skills.id` (CASCADE) |

## 4. `pipeline_runs` Table
| Column Name | Data Type | Description |
| :--- | :--- | :--- |
| `id` | Integer | Run ID |
| `filename` | String(255) | File ingested |
| `records_ingested` | Integer | Number of valid jobs added |
| `completeness_score` | Float | % non-null critical fields |
| `consistency_score` | Float | % canonical roles mapped |
| `uniqueness_score` | Float | 100 - duplicate percentage |
