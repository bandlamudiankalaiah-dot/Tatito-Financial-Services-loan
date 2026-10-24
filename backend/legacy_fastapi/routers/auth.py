from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, InvestmentPortfolio
from ..schemas import UserCreate, UserLogin, UserResponse, Token
from ..auth_utils import verify_password, get_password_hash, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, response: Response, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email.lower().strip()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email is already registered")
    
    phone_exists = db.query(User).filter(User.phone == user_in.phone.strip()).first()
    if phone_exists:
        raise HTTPException(status_code=400, detail="Phone number is already registered")

    new_user = User(
        full_name=user_in.full_name.strip(),
        email=user_in.email.lower().strip(),
        phone=user_in.phone.strip(),
        city=user_in.city or "Kadapa",
        state=user_in.state or "Andhra Pradesh",
        annual_income=user_in.annual_income or 750000.0,
        hashed_password=get_password_hash(user_in.password),
        role="user",
        wallet_balance=25000.0
    )
    db.add(new_user)
    db.flush()

    # Create empty portfolio for new user
    portfolio = InvestmentPortfolio(
        user_id=new_user.id,
        total_invested=0.0,
        current_value=0.0
    )
    db.add(portfolio)

    db.commit()
    db.refresh(new_user)

    token = create_access_token(data={"sub": new_user.email, "user_id": new_user.id, "role": new_user.role})

    # Set secure cookie
    response.set_cookie(
        key="access_token",
        value=f"Bearer {token}",
        httponly=True,
        samesite="lax",
        secure=False # Set to True in HTTPS production
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": new_user
    }

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email.lower().strip()).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = create_access_token(data={"sub": user.email, "user_id": user.id, "role": user.role})

    response.set_cookie(
        key="access_token",
        value=f"Bearer {token}",
        httponly=True,
        samesite="lax",
        secure=False
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/logout")
def logout(response: Response):
    """Clears authentication session cookies."""
    response.delete_cookie("access_token")
    return {"message": "Logged out successfully"}
