from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models import User, LoanApplication, LoanAccount, Transaction, Notification
from ..schemas import LoanApplicationResponse, LoanStatusUpdateRequest, TransactionResponse
from ..auth_utils import get_current_admin
from .loans import calculate_monthly_emi
import datetime

router = APIRouter(prefix="/api/admin", tags=["Admin Portal"])

@router.get("/stats")
def get_admin_stats(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).filter(User.role == "user").count()
    total_txns = db.query(Transaction).count()
    total_volume = db.query(func.sum(Transaction.amount)).scalar() or 0.0
    pending_apps = db.query(LoanApplication).filter(LoanApplication.status.in_(["submitted", "under_review"])).count()
    approved_apps = db.query(LoanApplication).filter(LoanApplication.status.in_(["approved", "disbursed"])).count()
    active_loans = db.query(LoanAccount).filter(LoanAccount.status == "active").count()
    total_disbursed = db.query(func.sum(LoanAccount.principal_amount)).scalar() or 0.0

    return {
        "total_users": total_users,
        "total_transactions": total_txns,
        "total_transaction_volume": round(total_volume, 2),
        "pending_loan_applications": pending_apps,
        "approved_loan_applications": approved_apps,
        "active_loan_accounts": active_loans,
        "total_disbursed_amount": round(total_disbursed, 2),
        "branch": "Kadapa Central Hub, Andhra Pradesh"
    }

@router.get("/applications", response_model=List[LoanApplicationResponse])
def get_all_loan_applications(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return db.query(LoanApplication).order_by(LoanApplication.created_at.desc()).all()

@router.put("/applications/{app_id}/status", response_model=LoanApplicationResponse)
def update_application_status(
    app_id: int,
    req: LoanStatusUpdateRequest,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    app = db.query(LoanApplication).filter(LoanApplication.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Loan application not found")

    old_status = app.status
    app.status = req.status
    if req.admin_remarks:
        app.admin_remarks = req.admin_remarks
    app.updated_at = datetime.datetime.utcnow()

    # If newly approved or disbursed, create a LoanAccount automatically
    if req.status in ["approved", "disbursed"] and old_status not in ["approved", "disbursed"]:
        # Check if already created
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
        message=f"Your {app.loan_type.capitalize()} Loan application status changed to '{req.status.upper()}'. Remarks: {req.admin_remarks or 'Verified by Kadapa Credit Desk'}",
        type="alert"
    )
    db.add(notif)

    db.commit()
    db.refresh(app)
    return app

@router.get("/transactions", response_model=List[TransactionResponse])
def get_all_transactions(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return db.query(Transaction).order_by(Transaction.created_at.desc()).limit(100).all()
