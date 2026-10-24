from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..schemas import UserResponse, UserProfileUpdate
from ..auth_utils import get_current_user

router = APIRouter(prefix="/api/users", tags=["User Profiles"])

@router.get("/profile", response_model=UserResponse)
def get_user_profile(current_user: User = Depends(get_current_user)):
    """Retrieve the authenticated user profile."""
    return current_user

@router.put("/profile", response_model=UserResponse)
def update_user_profile(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update profile information (full name, phone, city, state, annual income)."""
    if profile_data.full_name is not None and profile_data.full_name.strip():
        current_user.full_name = profile_data.full_name.strip()
    if profile_data.phone is not None and profile_data.phone.strip():
        # Check if phone belongs to another user
        existing_phone = db.query(User).filter(User.phone == profile_data.phone.strip(), User.id != current_user.id).first()
        if existing_phone:
            raise HTTPException(status_code=400, detail="Phone number is already associated with another account")
        current_user.phone = profile_data.phone.strip()
    if profile_data.city is not None:
        current_user.city = profile_data.city.strip()
    if profile_data.state is not None:
        current_user.state = profile_data.state.strip()
    if profile_data.annual_income is not None and profile_data.annual_income >= 0:
        current_user.annual_income = profile_data.annual_income

    db.commit()
    db.refresh(current_user)
    return current_user
