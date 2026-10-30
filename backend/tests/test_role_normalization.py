import pytest
from app.services.role_normalizer import RoleNormalizer, role_normalizer

def test_data_analyst_normalization():
    titles = [
        "Data Analyst",
        "Junior Data Analyst",
        "Sr. Data Analyst",
        "Senior Business Data Analyst",
        "Lead Reporting Analyst",
        "Product Data Analyst",
        "Quantitative Analyst"
    ]
    for t in titles:
        assert role_normalizer.normalize(t) == "Data Analyst", f"Failed for: {t}"

def test_data_scientist_normalization():
    titles = [
        "Data Scientist",
        "Lead Data Scientist",
        "Associate Data Scientist",
        "Applied Scientist",
        "Decision Scientist",
        "AI Research Scientist"
    ]
    for t in titles:
        assert role_normalizer.normalize(t) == "Data Scientist", f"Failed for: {t}"

def test_data_engineer_normalization():
    titles = [
        "Data Engineer",
        "Senior Data Engineer",
        "Big Data Pipeline Engineer",
        "ETL Developer",
        "Cloud Data Platform Engineer",
        "Data Warehouse Architect"
    ]
    for t in titles:
        assert role_normalizer.normalize(t) == "Data Engineer", f"Failed for: {t}"

def test_ml_engineer_normalization():
    titles = [
        "Machine Learning Engineer",
        "ML Engineer",
        "MLOps Engineer",
        "Senior AI/ML Engineer",
        "Deep Learning Specialist",
        "Computer Vision Engineer",
        "Generative AI Engineer"
    ]
    for t in titles:
        assert role_normalizer.normalize(t) == "ML Engineer", f"Failed for: {t}"

def test_bi_developer_normalization():
    titles = [
        "BI Developer",
        "Power BI Developer",
        "Tableau Specialist",
        "Senior Business Intelligence Developer",
        "Dashboard Developer",
        "Looker Developer"
    ]
    for t in titles:
        assert role_normalizer.normalize(t) == "BI Developer", f"Failed for: {t}"

def test_software_engineer_normalization():
    titles = [
        "Software Engineer",
        "Full Stack Developer",
        "Backend Engineer",
        "Frontend Developer",
        "Python Developer",
        "Java Developer",
        "SDE II"
    ]
    for t in titles:
        assert role_normalizer.normalize(t) == "Software Engineer", f"Failed for: {t}"

def test_dynamic_custom_rule():
    normalizer = RoleNormalizer()
    normalizer.add_rule("Quantum Computing Engineer", r"\bquantum\s+(?:software|computing)?\s*engineer\b")
    assert normalizer.normalize("Senior Quantum Software Engineer") == "Quantum Computing Engineer"

def test_fallback_and_empty_title():
    assert role_normalizer.normalize("") == "Software Engineer"
    assert role_normalizer.normalize(None) == "Software Engineer"
