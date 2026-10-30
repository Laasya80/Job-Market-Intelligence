import requests

BASE_URL = "http://127.0.0.1:8000/api"

def test_all_pages_live():
    # 1. Job Explorer
    res = requests.get(f"{BASE_URL}/jobs?page=1&page_size=5&role=Data%20Analyst")
    assert res.status_code == 200, f"Jobs failed: {res.text}"
    jobs_data = res.json()
    assert "jobs" in jobs_data
    assert len(jobs_data["jobs"]) > 0
    print("[1/6] Job Explorer: OK")

    # 2. Skill Trends
    res = requests.get(f"{BASE_URL}/skills/trends?role=Data%20Scientist")
    assert res.status_code == 200, f"Skill trends failed: {res.text}"
    res = requests.get(f"{BASE_URL}/skills/heatmap")
    assert res.status_code == 200, f"Skill heatmap failed: {res.text}"
    res = requests.get(f"{BASE_URL}/skills/compare?skill_a=Python&skill_b=SQL")
    assert res.status_code == 200, f"Skill compare failed: {res.text}"
    print("[2/6] Skill Trends: OK")

    # 3. Role Intelligence
    res = requests.get(f"{BASE_URL}/roles/Data%20Analyst/analytics")
    assert res.status_code == 200, f"Role analytics failed: {res.text}"
    role_data = res.json()
    assert "competencies" in role_data
    res = requests.get(f"{BASE_URL}/roles/compare/roles?role_a=Data%20Analyst&role_b=Data%20Scientist")
    assert res.status_code == 200, f"Role comparison failed: {res.text}"
    print("[3/6] Role Intelligence: OK")

    # 4. Skill Gap Analyzer
    res = requests.post(f"{BASE_URL}/skill-gap/analyze", json={
        "candidate_skills": ["Python", "SQL", "Excel"],
        "target_role": "Data Analyst"
    })
    assert res.status_code == 200, f"Skill gap failed: {res.text}"
    gap_data = res.json()
    assert "profile_match_score" in gap_data
    print("[4/6] Skill Gap Analyzer: OK")

    # 5. Salary & Location
    res = requests.get(f"{BASE_URL}/salary/analytics?role=All&city=All")
    assert res.status_code == 200, f"Salary analytics failed: {res.text}"
    sal_data = res.json()
    assert "top_paying_cities" in sal_data
    print("[5/6] Salary & Location: OK")

    # 6. Data Pipeline
    res = requests.get(f"{BASE_URL}/pipeline/status")
    assert res.status_code == 200, f"Pipeline status failed: {res.text}"
    pipe_data = res.json()
    assert "schema_coverage" in pipe_data
    print("[6/6] Data Pipeline: OK")

    print("\nALL 6 APPLICATION PAGES FULLY VERIFIED ON LIVE BACKEND!")

if __name__ == "__main__":
    test_all_pages_live()
