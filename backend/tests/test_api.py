import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_dashboard_summary():
    response = client.get("/api/dashboard/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["total_jobs"] > 0
    assert "average_salary_lpa" in data
    assert "fastest_growing_skill" in data

def test_top_skills():
    response = client.get("/api/dashboard/top-skills?limit=5")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert "skill" in data[0]

def test_jobs_list():
    response = client.get("/api/jobs?page=1&page_size=5")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] > 0
    assert len(data["jobs"]) == 5

def test_roles_analytics():
    response = client.get("/api/roles/Data%20Analyst/analytics")
    assert response.status_code == 200
    data = response.json()
    assert data["role"] == "Data Analyst"
    assert len(data["competencies"]) > 0

def test_skill_gap_analysis():
    payload = {
        "candidate_skills": ["Python", "SQL", "Excel"],
        "target_role": "Data Analyst"
    }
    response = client.post("/api/skill-gap/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "profile_match_score" in data
    assert "roadmap" in data

def test_clusters():
    response = client.get("/api/analytics/clusters")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0

def test_anomalies():
    response = client.get("/api/analytics/anomalies")
    assert response.status_code == 200
