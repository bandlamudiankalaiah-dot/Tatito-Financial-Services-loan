from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import ContactEnquiry, User
from ..schemas import ContactCreateRequest, ContactEnquiryResponse

router = APIRouter(prefix="/api/contact", tags=["Contact & Enquiries"])

CATEGORIES = [
    "Loan Enquiry (Gold / Home / Business / Personal)",
    "Wealth & SIP Advisory",
    "BBPS Utility Payment Dispute",
    "Account & KYC Support",
    "Kadapa Branch Visit Request",
    "General Feedback"
]

@router.get("/categories", response_model=List[str])
def get_contact_categories():
    return CATEGORIES

@router.post("/", response_model=ContactEnquiryResponse, status_code=status.HTTP_201_CREATED)
def submit_contact_enquiry(
    req: ContactCreateRequest,
    db: Session = Depends(get_db)
):
    """
    Submits a contact message or enquiry into the database with input validation.
    """
    if len(req.full_name.strip()) < 2:
        raise HTTPException(status_code=400, detail="Please enter a valid full name")
    if len(req.phone.strip()) < 10:
        raise HTTPException(status_code=400, detail="Please enter a valid 10-digit phone number")
    if len(req.message.strip()) < 10:
        raise HTTPException(status_code=400, detail="Message must be at least 10 characters long")

    # Match user if existing email
    user = db.query(User).filter(User.email == req.email).first()

    enquiry = ContactEnquiry(
        user_id=user.id if user else None,
        full_name=req.full_name.strip(),
        email=req.email.strip().lower(),
        phone=req.phone.strip(),
        subject=req.subject.strip(),
        category=req.category,
        message=req.message.strip(),
        status="new"
    )
    db.add(enquiry)
    db.commit()
    db.refresh(enquiry)

    return enquiry
