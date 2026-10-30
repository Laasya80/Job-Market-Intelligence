import hashlib
import os
import hmac
import json
import base64
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from app.models.user import User

SECRET_KEY = os.getenv("JMI_SECRET_KEY", "jmi-local-development-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30

def hash_password(password: str) -> str:
    """Hash password using SHA-256 with salt."""
    salt = "jmi_salt_2026"
    return hashlib.sha256(f"{salt}_{password}".encode("utf-8")).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plain password against hashed password."""
    return hash_password(plain_password) == hashed_password

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Generate simple signed token containing user ID and expiration."""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS))
    to_encode.update({"exp": expire.timestamp()})
    
    header = base64.urlsafe_b64encode(json.dumps({"alg": ALGORITHM, "typ": "JWT"}).encode()).decode().rstrip("=")
    payload = base64.urlsafe_b64encode(json.dumps(to_encode).encode()).decode().rstrip("=")
    
    signature = hmac.new(
        SECRET_KEY.encode(),
        f"{header}.{payload}".encode(),
        hashlib.sha256
    ).digest()
    sig_str = base64.urlsafe_b64encode(signature).decode().rstrip("=")
    return f"{header}.{payload}.{sig_str}"

def decode_access_token(token: str) -> Optional[dict]:
    """Decode and verify signed JWT token."""
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        header, payload, sig_str = parts
        # Verify signature
        expected_sig = hmac.new(
            SECRET_KEY.encode(),
            f"{header}.{payload}".encode(),
            hashlib.sha256
        ).digest()
        actual_sig = base64.urlsafe_b64decode(sig_str + "=" * (-len(sig_str) % 4))
        if not hmac.compare_digest(expected_sig, actual_sig):
            return None

        # Decode payload
        payload_bytes = base64.urlsafe_b64decode(payload + "=" * (-len(payload) % 4))
        data = json.loads(payload_bytes.decode())
        if "exp" in data and data["exp"] < datetime.utcnow().timestamp():
            return None  # Expired
        return data
    except Exception:
        return None

class AuthService:
    """Authentication and User Management Service."""

    DEFAULT_DEMO_USERS = [
        {
            "full_name": "Demo Student",
            "email": "student@jmi.ai",
            "password": "studentdemo2026",
            "target_role": "Data Analyst",
            "target_city": "Bengaluru",
            "experience_years": 0.0,
            "skills": "Python,SQL",
            "avatar_color": "bg-blue-600"
        }
    ]

    def seed_demo_users_if_empty(self, db: Session):
        """Seed initial demo accounts if users table is empty."""
        for user_data in self.DEFAULT_DEMO_USERS:
            existing = db.query(User).filter(User.email == user_data["email"]).first()
            if not existing:
                u = User(
                    full_name=user_data["full_name"],
                    email=user_data["email"],
                    hashed_password=hash_password(user_data["password"]),
                    target_role=user_data["target_role"],
                    target_city=user_data["target_city"],
                    experience_years=user_data["experience_years"],
                    skills=user_data["skills"],
                    avatar_color=user_data["avatar_color"]
                )
                db.add(u)
        db.commit()

    def register_user(self, user_in, db: Session) -> User:
        """Register a new distinct user."""
        existing = db.query(User).filter(User.email == user_in.email.lower()).first()
        if existing:
            raise ValueError("An account with this email address already exists.")

        avatar_colors = ["bg-blue-600", "bg-purple-600", "bg-emerald-600", "bg-amber-600", "bg-rose-600", "bg-indigo-600"]
        import random
        color = random.choice(avatar_colors)

        new_user = User(
            full_name=user_in.full_name.strip(),
            email=user_in.email.lower().strip(),
            hashed_password=hash_password(user_in.password),
            target_role=user_in.target_role or "Data Analyst",
            target_city=user_in.target_city or "Bengaluru",
            experience_years=user_in.experience_years or 1.0,
            skills=user_in.skills or "Python,SQL",
            avatar_color=color
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user

    def authenticate_user(self, email: str, password: str, db: Session) -> Optional[User]:
        """Authenticate user with email and password."""
        user = db.query(User).filter(User.email == email.lower().strip()).first()
        if not user or not verify_password(password, user.hashed_password):
            return None
        return user

    def get_user_by_id(self, user_id: int, db: Session) -> Optional[User]:
        return db.query(User).filter(User.id == user_id).first()

auth_service = AuthService()
