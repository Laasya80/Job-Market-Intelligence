import io
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_pipeline_status():
    response = client.get("/api/pipeline/status")
    assert response.status_code == 200
    data = response.json()
    assert "records_ingested" in data
    assert "completeness_score" in data
    assert "consistency_score" in data
    assert "uniqueness_score" in data
    assert "validity_score" in data
    assert len(data["schema_coverage"]) > 0

def test_csv_upload_standard():
    csv_content = (
        "job_title,company,location,description,salary,experience,posted_date,skills\n"
        "Lead Data Analyst,Flipkart,Bengaluru,Work on SQL queries and Power BI dashboards,₹12 - ₹18 LPA,3-6 years,2026-02-01,\"SQL, Power BI, Python\"\n"
        "Applied ML Scientist,Swiggy,Hyderabad,Train PyTorch deep learning models,₹20 - ₹35 LPA,2-5 years,2026-02-05,\"PyTorch, Python, Machine Learning\"\n"
    )
    files = {
        "file": ("test_standard.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")
    }
    response = client.post("/api/pipeline/upload", files=files)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["details"]["records_ingested"] == 2
    assert data["details"]["records_failed"] == 0

def test_csv_upload_flexible_column_mapping():
    # Test alternative header aliases: title, company_name, job_location, job_description, ctc, exp, key_skills
    csv_content = (
        "title,company_name,job_location,job_description,ctc,exp,key_skills\n"
        "Business Intelligence Specialist,Razorpay,Mumbai,Build financial reporting tables in Tableau and SQL,14 Lakhs,4+ yrs,\"Tableau, SQL, Excel\"\n"
        "Big Data Pipeline Engineer,CRED,Bengaluru,Construct Kafka and Spark pipelines in AWS,₹18 - ₹28 LPA,3-7 yrs,\"Spark, AWS, Kafka, Python\"\n"
    )
    files = {
        "file": ("test_flexible_headers.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")
    }
    # Test both /api/pipeline/upload and /api/data/upload
    response = client.post("/api/data/upload", files=files)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["details"]["records_ingested"] == 2
    assert data["details"]["quality_metrics"]["consistency"] == 100.0

def test_csv_upload_invalid_extension():
    files = {
        "file": ("test.pdf", io.BytesIO(b"%PDF-1.4 sample content"), "application/pdf")
    }
    response = client.post("/api/pipeline/upload", files=files)
    assert response.status_code == 400
    assert "Only CSV files are supported" in response.json()["detail"]

def test_csv_upload_empty_file():
    files = {
        "file": ("empty.csv", io.BytesIO(b""), "text/csv")
    }
    response = client.post("/api/pipeline/upload", files=files)
    assert response.status_code == 400
