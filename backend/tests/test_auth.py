import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_login_demo_user():
    response = client.post("/api/auth/login", json={
        "email": "arjun@jmi.ai",
        "password": "password123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["full_name"] == "Arjun Rao"
    assert data["user"]["target_role"] == "Data Analyst"

def test_login_invalid_password():
    response = client.post("/api/auth/login", json={
        "email": "arjun@jmi.ai",
        "password": "wrongpassword"
    })
    assert response.status_code == 401

def test_register_new_user():
    import uuid
    unique_email = f"user_{uuid.uuid4().hex[:6]}@example.com"
    response = client.post("/api/auth/register", json={
        "full_name": "Test User",
        "email": unique_email,
        "password": "mypassword123",
        "target_role": "Data Scientist",
        "target_city": "Hyderabad",
        "experience_years": 3.0,
        "skills": "Python,SQL,PyTorch"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["full_name"] == "Test User"
    assert data["user"]["email"] == unique_email

def test_demo_users_list():
    response = client.get("/api/auth/demo-users")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 3
