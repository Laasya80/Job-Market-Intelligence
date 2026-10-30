import requests

BASE_URL = "http://127.0.0.1:8000/api"

def test_live_server():
    # 1. Health check
    res = requests.get(f"{BASE_URL}/health")
    print(f"Health check status: {res.status_code}, data: {res.json()}")

    # 2. Pipeline status
    res = requests.get(f"{BASE_URL}/pipeline/status")
    print(f"Pipeline status: {res.status_code}, Ingested: {res.json().get('records_ingested')}")

    # 3. Test CSV Upload
    csv_data = (
        "position,organization,job_location,responsibilities,ctc,work_experience,key_skills\n"
        "Lead NLP Architect,InMobi,Bengaluru,Develop scalable LLM pipelines in PyTorch and AWS,₹30 - ₹45 LPA,4-8 yrs,\"NLP, PyTorch, AWS, Python, Generative AI\"\n"
        "Principal Data Engineer,PhonePe,Bengaluru,Manage large Databricks Lakehouse clusters,₹35 - ₹50 LPA,6-10 yrs,\"Spark, Databricks, AWS, SQL, Python\"\n"
    )

    files = {"file": ("live_test.csv", csv_data.encode("utf-8"), "text/csv")}
    upload_res = requests.post(f"{BASE_URL}/pipeline/upload", files=files)
    print(f"Upload status: {upload_res.status_code}, response: {upload_res.json()}")

if __name__ == "__main__":
    test_live_server()
