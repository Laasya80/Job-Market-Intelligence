import re
import json
import os
from typing import List, Dict, Tuple, Set, Optional, Any

# Comprehensive Default Skill Taxonomy
DEFAULT_SKILL_TAXONOMY: Dict[str, Dict[str, Any]] = {
    # Data Science & AI/ML
    "Python": {"category": "Programming", "aliases": ["python", "python3", "py"]},
    "R": {"category": "Programming", "aliases": ["r language", "r programming", "r-project"]},
    "SQL": {"category": "Database", "aliases": ["sql", "structured query language", "transact-sql", "t-sql", "pl/sql", "plsql"]},
    "Machine Learning": {"category": "ML/AI", "aliases": ["machine learning", "ml", "statistical learning", "supervised learning", "unsupervised learning"]},
    "Deep Learning": {"category": "ML/AI", "aliases": ["deep learning", "dl", "neural networks", "deep neural networks", "ann", "cnn", "rnn"]},
    "NLP": {"category": "ML/AI", "aliases": ["nlp", "natural language processing", "text mining", "computational linguistics", "tokenization", "bert"]},
    "Computer Vision": {"category": "ML/AI", "aliases": ["computer vision", "cv", "image processing", "object detection", "opencv", "yolo"]},
    "Generative AI": {"category": "ML/AI", "aliases": ["generative ai", "genai", "gen ai", "large language models", "llms", "llm", "langchain", "llamaindex", "rag", "fine-tuning"]},
    "TensorFlow": {"category": "ML/AI", "aliases": ["tensorflow", "tf", "keras"]},
    "PyTorch": {"category": "ML/AI", "aliases": ["pytorch", "torch"]},
    "Scikit-learn": {"category": "ML/AI", "aliases": ["scikit-learn", "sklearn", "scikit learn"]},
    "Pandas": {"category": "Data Science", "aliases": ["pandas"]},
    "NumPy": {"category": "Data Science", "aliases": ["numpy"]},
    "Statistics": {"category": "Data Science", "aliases": ["statistics", "statistical modeling", "hypothesis testing", "probability", "statistical analysis", "a/b testing"]},
    "Data Analysis": {"category": "Data Science", "aliases": ["data analysis", "data analytics", "exploratory data analysis", "eda"]},
    "Data Modeling": {"category": "Data Engineering", "aliases": ["data modeling", "data modelling", "dimensional modeling", "star schema", "snowflake schema"]},

    # BI & Visualization
    "Power BI": {"category": "BI/Analytics", "aliases": ["power bi", "powerbi", "dax", "power query", "power bi desktop"]},
    "Tableau": {"category": "BI/Analytics", "aliases": ["tableau", "tableau desktop", "tableau server", "tableau prep"]},
    "Looker": {"category": "BI/Analytics", "aliases": ["looker", "lookml", "looker studio", "google data studio"]},
    "Excel": {"category": "BI/Analytics", "aliases": ["excel", "ms excel", "microsoft excel", "advanced excel", "vlookup", "xlookup", "pivot tables"]},
    "Matplotlib": {"category": "BI/Analytics", "aliases": ["matplotlib"]},
    "Seaborn": {"category": "BI/Analytics", "aliases": ["seaborn"]},
    "Plotly": {"category": "BI/Analytics", "aliases": ["plotly"]},
    "Data Visualization": {"category": "BI/Analytics", "aliases": ["data visualization", "data visualisation", "dashboarding", "reporting", "bi reporting"]},

    # Big Data & Data Engineering
    "Spark": {"category": "Data Engineering", "aliases": ["spark", "apache spark", "pyspark", "spark sql", "spark streaming"]},
    "Hadoop": {"category": "Data Engineering", "aliases": ["hadoop", "hdfs", "mapreduce"]},
    "Kafka": {"category": "Data Engineering", "aliases": ["kafka", "apache kafka", "kafka streaming"]},
    "Airflow": {"category": "Data Engineering", "aliases": ["airflow", "apache airflow"]},
    "dbt": {"category": "Data Engineering", "aliases": ["dbt", "data build tool"]},
    "Snowflake": {"category": "Database", "aliases": ["snowflake", "snowflake db", "snowsql", "snowflake data cloud"]},
    "Databricks": {"category": "Data Engineering", "aliases": ["databricks", "delta lake"]},
    "ETL": {"category": "Data Engineering", "aliases": ["etl", "extract transform load", "elt", "data pipelines", "data ingestion", "data warehousing"]},
    "BigQuery": {"category": "Database", "aliases": ["bigquery", "google bigquery"]},
    "Redshift": {"category": "Database", "aliases": ["redshift", "amazon redshift"]},

    # Cloud & DevOps
    "AWS": {"category": "Cloud/DevOps", "aliases": ["aws", "amazon web services", "ec2", "s3", "lambda", "sagemaker", "athena", "glue", "emr"]},
    "Azure": {"category": "Cloud/DevOps", "aliases": ["azure", "microsoft azure", "azure data factory", "azure ml", "synapse"]},
    "GCP": {"category": "Cloud/DevOps", "aliases": ["gcp", "google cloud", "google cloud platform"]},
    "Docker": {"category": "Cloud/DevOps", "aliases": ["docker", "containerization", "containers"]},
    "Kubernetes": {"category": "Cloud/DevOps", "aliases": ["kubernetes", "k8s"]},
    "CI/CD": {"category": "Cloud/DevOps", "aliases": ["ci/cd", "continuous integration", "continuous deployment", "jenkins", "github actions", "gitlab ci"]},
    "Linux": {"category": "Cloud/DevOps", "aliases": ["linux", "unix", "ubuntu", "bash", "shell scripting", "centos"]},
    "Git": {"category": "Cloud/DevOps", "aliases": ["git", "github", "gitlab", "version control"]},
    "Terraform": {"category": "Cloud/DevOps", "aliases": ["terraform", "iac", "infrastructure as code"]},

    # Databases
    "PostgreSQL": {"category": "Database", "aliases": ["postgresql", "postgres", "psql"]},
    "MySQL": {"category": "Database", "aliases": ["mysql", "mariadb"]},
    "MongoDB": {"category": "Database", "aliases": ["mongodb", "mongo", "nosql", "documentdb"]},
    "Redis": {"category": "Database", "aliases": ["redis"]},
    "Oracle": {"category": "Database", "aliases": ["oracle", "oracle database", "oracle sql"]},

    # Software Engineering & Languages
    "Java": {"category": "Programming", "aliases": ["java", "core java", "j2ee"]},
    "JavaScript": {"category": "Programming", "aliases": ["javascript", "js", "ecmascript", "es6"]},
    "TypeScript": {"category": "Programming", "aliases": ["typescript", "ts"]},
    "C++": {"category": "Programming", "aliases": ["c++", "cpp"]},
    "C#": {"category": "Programming", "aliases": ["c#", "csharp", ".net", "dotnet", "asp.net"]},
    "Go": {"category": "Programming", "aliases": ["golang", "go language"]},
    "Scala": {"category": "Programming", "aliases": ["scala"]},
    "React": {"category": "Web/Frameworks", "aliases": ["react", "reactjs", "react.js", "next.js", "nextjs"]},
    "Node.js": {"category": "Web/Frameworks", "aliases": ["node", "nodejs", "node.js", "express.js"]},
    "FastAPI": {"category": "Web/Frameworks", "aliases": ["fastapi"]},
    "Django": {"category": "Web/Frameworks", "aliases": ["django", "django rest framework"]},
    "Flask": {"category": "Web/Frameworks", "aliases": ["flask"]},
    "Spring Boot": {"category": "Web/Frameworks", "aliases": ["spring boot", "spring framework", "spring"]},
    "REST API": {"category": "Web/Frameworks", "aliases": ["rest api", "restful", "rest apis", "api development", "web services", "apis", "graphql"]},
    "Agile": {"category": "Methodology", "aliases": ["agile", "scrum", "kanban", "sprint"]},
    "Communication": {"category": "Soft Skills", "aliases": ["communication", "stakeholder management", "presentation", "problem solving", "critical thinking"]}
}

class SkillExtractor:
    """Configurable, robust skill extraction engine utilizing boundary patterns and multi-word token matching."""

    def __init__(self, taxonomy: Optional[Dict[str, Dict[str, Any]]] = None):
        self.taxonomy: Dict[str, Dict[str, Any]] = taxonomy.copy() if taxonomy else DEFAULT_SKILL_TAXONOMY.copy()
        self._compiled_patterns: List[Tuple[str, re.Pattern]] = []
        self._build_patterns()

    def register_skill(self, name: str, category: str = "Other", aliases: Optional[List[str]] = None) -> None:
        """Dynamically add or update a skill in the taxonomy."""
        if aliases is None:
            aliases = [name.lower()]
        self.taxonomy[name] = {
            "category": category,
            "aliases": list(set(aliases + [name.lower()]))
        }
        self._build_patterns()

    def update_taxonomy(self, custom_taxonomy: Dict[str, Dict[str, Any]]) -> None:
        """Update entire taxonomy with a custom dictionary."""
        self.taxonomy.update(custom_taxonomy)
        self._build_patterns()

    def load_from_json(self, json_path: str) -> None:
        """Load taxonomy from an external JSON file."""
        if os.path.exists(json_path):
            with open(json_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                self.update_taxonomy(data)

    def _build_patterns(self) -> None:
        """Compile regex matching rules for all taxonomy items."""
        self._compiled_patterns = []
        for canonical_name, data in self.taxonomy.items():
            aliases = data.get("aliases", [canonical_name.lower()])
            patterns = []
            
            # Special regex rules for programming languages with symbols or single letters
            for alias in aliases:
                raw = alias.strip()
                if not raw:
                    continue
                
                esc = re.escape(raw)
                if raw.lower() in ["c++", "cpp"]:
                    patterns.append(r"(?:^|[\s,.(])c\+\+(?:$|[\s,.)!?;])")
                    patterns.append(r"\bcpp\b")
                elif raw.lower() in ["c#", "csharp"]:
                    patterns.append(r"(?:^|[\s,.(])c\#(?:$|[\s,.)!?;])")
                    patterns.append(r"\bcsharp\b")
                elif raw.lower() in [".net", "dotnet"]:
                    patterns.append(r"(?:^|[\s,.(])\.net\b")
                    patterns.append(r"\bdotnet\b")
                elif raw.lower() == "ci/cd":
                    patterns.append(r"\bci/cd\b")
                    patterns.append(r"\bcontinuous\s+integration\b")
                elif raw.lower() == "r":
                    # Standalone 'R' (surrounded by boundaries)
                    patterns.append(r"(?:^|[\s,.(])R(?:$|[\s,.)!?;])")
                else:
                    patterns.append(rf"\b{esc}\b")

            pattern_str = "|".join(patterns)
            # Match case-insensitively unless it contains exact single letter R
            flags = re.IGNORECASE if canonical_name != "R" else 0
            self._compiled_patterns.append((canonical_name, re.compile(pattern_str, flags)))

    def extract_skills(self, text: str) -> List[Dict[str, str]]:
        """
        Extract unique matched skills from the input text string.
        Returns a list of dicts: [{"name": canonical_name, "category": category, "normalized_name": lower_name}]
        """
        if not text or not isinstance(text, str):
            return []

        extracted_canonical: Set[str] = set()

        for canonical_name, pattern in self._compiled_patterns:
            if pattern.search(text):
                extracted_canonical.add(canonical_name)

        # Check single letter R specially if not found via regex
        if "R" not in extracted_canonical and re.search(r"\b(?:R\s+language|R\s+programming|R\s+script)\b", text, re.IGNORECASE):
            extracted_canonical.add("R")

        results = []
        for name in sorted(extracted_canonical):
            cat = self.taxonomy.get(name, {}).get("category", "General")
            results.append({
                "name": name,
                "category": cat,
                "normalized_name": name.lower()
            })
        return results

    def extract_skill_names(self, text: str) -> List[str]:
        """Convenience method returning sorted list of skill name strings."""
        return [item["name"] for item in self.extract_skills(text)]

# Export canonical SKILL_TAXONOMY dict and singleton extractor instance
SKILL_TAXONOMY = DEFAULT_SKILL_TAXONOMY
skill_extractor = SkillExtractor()
