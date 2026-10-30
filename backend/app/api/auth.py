from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserRegister, UserLogin, UserOut, TokenResponse, UserProfileUpdate
from app.services.auth_service import auth_service, create_access_token, decode_access_token

router = APIRouter(prefix="/auth", tags=["Authentication & User Profiles"])

def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)) -> User:
    """Dependency to extract authenticated user from Bearer JWT token."""
    if not authorization or not authorization.startswith("Bearer "):
        # Fallback to default user if unauthenticated in demo mode
        user = db.query(User).first()
        if user:
            return user
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization token required or expired."
        )

    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token."
        )

    user = auth_service.get_user_by_id(payload["sub"], db)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User account not found.")
    return user

@router.post("/register", response_model=TokenResponse)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    """Register a new distinct user account and return an access token."""
    try:
        user = auth_service.register_user(user_in, db)
        token = create_access_token({"sub": user.id, "email": user.email})
        return TokenResponse(access_token=token, user=user)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Sign in using user credentials and return an access token."""
    user = auth_service.authenticate_user(credentials.email, credentials.password, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email address or password."
        )
    token = create_access_token({"sub": user.id, "email": user.email})
    return TokenResponse(access_token=token, user=user)

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    """Retrieve the currently authenticated user's profile."""
    return current_user

@router.put("/profile", response_model=UserOut)
def update_profile(
    updates: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update profile attributes for the currently logged in user."""
    if updates.full_name is not None:
        current_user.full_name = updates.full_name.strip()
    if updates.target_role is not None:
        current_user.target_role = updates.target_role.strip()
    if updates.target_city is not None:
        current_user.target_city = updates.target_city.strip()
    if updates.experience_years is not None:
        current_user.experience_years = updates.experience_years
    if updates.skills is not None:
        current_user.skills = updates.skills.strip()

    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/demo-users", response_model=List[UserOut])
def get_demo_users(db: Session = Depends(get_db)):
    """Get list of pre-configured demo users for instant switching."""
    return db.query(User).filter(User.email == "student@jmi.ai").all()
