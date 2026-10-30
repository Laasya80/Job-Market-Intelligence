import requests

BASE_URL = "http://127.0.0.1:8000/api/dashboard"

def test_dashboard_endpoints():
    endpoints = [
        "summary",
        "top-skills?limit=10",
        "monthly-trends?skills=Python,SQL,Machine%20Learning,Power%20BI",
        "role-distribution",
        "hiring-hotspots",
        "emerging-skills?limit=6",
        "insights"
    ]

    for ep in endpoints:
        url = f"{BASE_URL}/{ep}"
        res = requests.get(url)
        print(f"Endpoint: {ep} -> Status: {res.status_code}")
        assert res.status_code == 200, f"Failed for {ep}: {res.text}"
        data = res.json()
        assert data is not None, f"Empty response for {ep}"

    print("All Dashboard endpoints verified successfully!")

if __name__ == "__main__":
    test_dashboard_endpoints()
