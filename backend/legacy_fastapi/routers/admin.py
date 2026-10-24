import datetime
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models import User, LoanApplication, LoanAccount, Transaction, Notification, ContactEnquiry, InvestmentRecord
from ..schemas import (
    LoanApplicationResponse, 
    LoanStatusUpdateRequest, 
    TransactionResponse, 
    AdminDashboardStats, 
    UserResponse,
    ContactEnquiryResponse,
    ContactStatusUpdateRequest
)
from ..auth_utils import get_current_admin
from .loans import calculate_monthly_emi

router = APIRouter(prefix="/api/admin", tags=["Admin Portal"])

@router.get("/dashboard-stats", response_model=AdminDashboardStats)
def get_admin_dashboard_stats(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Computes real-time admin KPIs and metrics directly from database records.
    """
    total_users = db.query(User).filter(User.role == "user").count()
    total_apps = db.query(LoanApplication).count()
    pending_apps = db.query(LoanApplication).filter(LoanApplication.status.in_(["pending", "submitted", "under_review"])).count()
    approved_apps = db.query(LoanApplication).filter(LoanApplication.status.in_(["approved", "disbursed"])).count()
    rejected_apps = db.query(LoanApplication).filter(LoanApplication.status == "rejected").count()
    total_disbursed = db.query(func.sum(LoanAccount.principal_amount)).scalar() or 0.0

    total_txns = db.query(Transaction).count()
    total_volume = db.query(func.sum(Transaction.amount)).scalar() or 0.0

    total_enquiries = db.query(ContactEnquiry).count()
    new_enquiries = db.query(ContactEnquiry).filter(ContactEnquiry.status == "new").count()

    total_investments = db.query(func.sum(InvestmentRecord.invested_amount)).scalar() or 0.0

    return AdminDashboardStats(
        total_users=total_users,
        total_loan_applications=total_apps,
        pending_loan_applications=pending_apps,
        approved_loan_applications=approved_apps,
        rejected_loan_applications=rejected_apps,
        total_loan_disbursed=round(total_disbursed, 2),
        total_transactions=total_txns,
        total_transaction_volume=round(total_volume, 2),
        total_contact_enquiries=total_enquiries,
        new_contact_enquiries=new_enquiries,
        total_investments_volume=round(total_investments, 2),
        branch="Kadapa Central Hub, Andhra Pradesh"
    )

@router.get("/loans", response_model=List[LoanApplicationResponse])
def get_all_loans(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """GET /api/admin/loans - Returns all submitted loan applications."""
    return db.query(LoanApplication).order_by(LoanApplication.created_at.desc()).all()

@router.get("/applications", response_model=List[LoanApplicationResponse])
def get_all_loan_applications_alias(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Alias for /api/admin/loans."""
    return db.query(LoanApplication).order_by(LoanApplication.created_at.desc()).all()

def _update_loan_status(app_id: int, req: LoanStatusUpdateRequest, admin: User, db: Session) -> LoanApplication:
    app = db.query(LoanApplication).filter(LoanApplication.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Loan application not found")

    old_status = app.status.lower()
    new_status = req.status.lower()
    app.status = new_status
    if req.admin_remarks:
        app.admin_remarks = req.admin_remarks
    app.updated_at = datetime.datetime.utcnow()

    # If newly approved or disbursed, create a LoanAccount automatically
    if new_status in ["approved", "disbursed"] and old_status not in ["approved", "disbursed"]:
        existing_acc = db.query(LoanAccount).filter(LoanAccount.loan_account_no == f"ACC-{app.application_no}").first()
        if not existing_acc:
            monthly_emi = calculate_monthly_emi(app.requested_amount, app.interest_rate, app.tenure_months)
            acc = LoanAccount(
                loan_account_no=f"ACC-{app.application_no}",
                user_id=app.user_id,
                loan_type=app.loan_type,
                principal_amount=app.requested_amount,
                interest_rate=app.interest_rate,
                tenure_months=app.tenure_months,
                monthly_emi=monthly_emi,
                emis_paid=0,
                total_emis=app.tenure_months,
                next_emi_date=datetime.datetime.utcnow() + datetime.timedelta(days=30),
                outstanding_balance=app.requested_amount,
                status="active"
            )
            db.add(acc)

    # Notify applicant
    notif = Notification(
        user_id=app.user_id,
        title=f"Loan Application Update ({app.application_no})",
        message=f"Your {app.loan_type.capitalize()} Loan application status changed to '{new_status.upper()}'. Remarks: {req.admin_remarks or 'Reviewed by Kadapa Credit Desk'}",
        type="alert"
    )
    db.add(notif)

    db.commit()
    db.refresh(app)
    return app

@router.patch("/loans/{loan_id}/status", response_model=LoanApplicationResponse)
def patch_loan_status(
    loan_id: int,
    req: LoanStatusUpdateRequest,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """PATCH /api/admin/loans/{loan_id}/status endpoint."""
    return _update_loan_status(loan_id, req, admin, db)

@router.put("/applications/{app_id}/status", response_model=LoanApplicationResponse)
def put_application_status_alias(
    app_id: int,
    req: LoanStatusUpdateRequest,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Alias for updating loan application status."""
    return _update_loan_status(app_id, req, admin, db)

@router.get("/users", response_model=List[UserResponse])
def get_registered_users(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """GET /api/admin/users - Returns all registered customers."""
    return db.query(User).order_by(User.created_at.desc()).all()

@router.get("/contact-enquiries", response_model=List[ContactEnquiryResponse])
def get_contact_enquiries(
    status_filter: Optional[str] = None,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """GET /api/admin/contact-enquiries - Returns user feedback and support enquiries."""
    query = db.query(ContactEnquiry)
    if status_filter:
        query = query.filter(ContactEnquiry.status == status_filter)
    return query.order_by(ContactEnquiry.created_at.desc()).all()

@router.patch("/contact-enquiries/{id}/status", response_model=ContactEnquiryResponse)
def update_contact_enquiry_status(
    id: int,
    req: ContactStatusUpdateRequest,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    enquiry = db.query(ContactEnquiry).filter(ContactEnquiry.id == id).first()
    if not enquiry:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    enquiry.status = req.status
    if req.admin_notes:
        enquiry.admin_notes = req.admin_notes
    db.commit()
    db.refresh(enquiry)
    return enquiry

@router.get("/transactions", response_model=List[TransactionResponse])
def get_all_transactions(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return db.query(Transaction).order_by(Transaction.created_at.desc()).limit(100).all()
