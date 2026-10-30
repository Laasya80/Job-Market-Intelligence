import pytest
from app.services.skill_extractor import SkillExtractor, DEFAULT_SKILL_TAXONOMY, skill_extractor

def test_basic_skill_extraction():
    text = "We are seeking a Python developer experienced in SQL, Pandas, and building models with Scikit-learn."
    skills = skill_extractor.extract_skill_names(text)
    assert "Python" in skills
    assert "SQL" in skills
    assert "Pandas" in skills
    assert "Scikit-learn" in skills

def test_multi_word_and_acronym_extraction():
    text = "Proficiency in Machine Learning, Natural Language Processing (NLP), Deep Learning, and Power BI is required."
    skills = skill_extractor.extract_skill_names(text)
    assert "Machine Learning" in skills
    assert "NLP" in skills
    assert "Deep Learning" in skills
    assert "Power BI" in skills

def test_symbols_and_special_languages():
    text = "Requires experience in C++, C#, .NET microservices, Docker, and CI/CD deployment pipelines."
    skills = skill_extractor.extract_skill_names(text)
    assert "C++" in skills
    assert "C#" in skills
    assert "Docker" in skills
    assert "CI/CD" in skills

def test_single_letter_r_language():
    text_with_r = "Statistical data modeling using R language, Python, and SQL."
    skills = skill_extractor.extract_skill_names(text_with_r)
    assert "R" in skills
    assert "Python" in skills
    assert "SQL" in skills

def test_case_insensitivity():
    text = "strong skills in python, POSTGRESQL, PyTorch, and apache airflow."
    skills = skill_extractor.extract_skill_names(text)
    assert "Python" in skills
    assert "PostgreSQL" in skills
    assert "PyTorch" in skills
    assert "Airflow" in skills

def test_custom_taxonomy_and_dynamic_registration():
    custom_extractor = SkillExtractor()
    custom_extractor.register_skill(
        name="Polars",
        category="Data Science",
        aliases=["polars", "polars-dataframe"]
    )
    text = "Experience with high-performance Polars DataFrame processing in Python."
    skills = custom_extractor.extract_skill_names(text)
    assert "Polars" in skills
    assert "Python" in skills

def test_empty_and_none_text():
    assert skill_extractor.extract_skills("") == []
    assert skill_extractor.extract_skills(None) == []
