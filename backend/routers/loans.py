import math
import random
import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, LoanApplication, LoanAccount, Transaction, Notification
from ..schemas import (
    LoanApplyRequest, 
    LoanApplicationResponse, 
    LoanAccountResponse, 
    LoanEmiPayRequest, 
    EmiCalculationRequest, 
    EmiCalculationResponse
)
from ..auth_utils import get_current_user

router = APIRouter(prefix="/api/loans", tags=["Loans & EMI Tracker"])

# Official lending parameters from Tatito Financial Services guidelines
LOAN_LIMITS = {
    "personal": {"min_rate": 14.0, "max_amount": 1000000.0, "name": "Personal Loan"},
    "business": {"min_rate": 16.0, "max_amount": 5000000.0, "name": "Business Loan"},
    "gold": {"min_rate": 11.0, "max_amount": 2000000.0, "name": "Gold Loan"},
    "home": {"min_rate": 9.0, "max_amount": 10000000.0, "name": "Home Loan"},
    "vehicle": {"min_rate": 10.0, "max_amount": 2000000.0, "name": "Vehicle Loan"},
}

def calculate_monthly_emi(principal: float, annual_rate: float, tenure_months: int) -> float:
    monthly_rate = (annual_rate / 12.0) / 100.0
    if monthly_rate == 0:
        return principal / tenure_months
    emi = (principal * monthly_rate * math.pow(1 + monthly_rate, tenure_months)) / (math.pow(1 + monthly_rate, tenure_months) - 1)
    return round(emi, 2)

@router.post("/calculate-emi", response_model=EmiCalculationResponse)
def calculate_emi(data: EmiCalculationRequest):
    if data.principal <= 0 or data.tenure_months <= 0 or data.interest_rate_annual <= 0:
        raise HTTPException(status_code=400, detail="Invalid loan inputs for calculation")
    
    monthly_emi = calculate_monthly_emi(data.principal, data.interest_rate_annual, data.tenure_months)
    total_payment = round(monthly_emi * data.tenure_months, 2)
    total_interest = round(total_payment - data.principal, 2)

    return EmiCalculationResponse(
        monthly_emi=monthly_emi,
        total_interest=total_interest,
        total_payment=total_payment
    )

@router.post("/apply", response_model=LoanApplicationResponse)
def apply_for_loan(
    req: LoanApplyRequest, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    loan_type_key = req.loan_type.lower().strip()
    if loan_type_key not in LOAN_LIMITS:
        raise HTTPException(status_code=400, detail=f"Unsupported loan type: {req.loan_type}")

    spec = LOAN_LIMITS[loan_type_key]

    if req.requested_amount > spec["max_amount"]:
        raise HTTPException(
            status_code=400, 
            detail=f"Requested amount ₹{req.requested_amount:,.0f} exceeds max limit of ₹{spec['max_amount']:,.0f} for {spec['name']}"
        )
    
    if req.requested_amount < 10000:
        raise HTTPException(status_code=400, detail="Minimum loan amount is ₹10,000")

    app_no = f"TF-LN-{datetime.datetime.utcnow().strftime('%Y%m')}-{random.randint(1000, 9999)}"
    interest_rate = spec["min_rate"]

    application = LoanApplication(
        application_no=app_no,
        user_id=current_user.id,
        loan_type=loan_type_key,
        applicant_name=req.applicant_name,
        phone=req.phone,
        email=req.email,
        pan_card=req.pan_card.upper(),
        aadhaar_last4=req.aadhaar_last4,
        monthly_income=req.monthly_income,
        requested_amount=req.requested_amount,
        interest_rate=interest_rate,
        tenure_months=req.tenure_months,
        purpose=req.purpose,
        status="submitted",
        admin_remarks="Application submitted successfully. KYC verification initiated at Kadapa branch."
    )
    db.add(application)

    # Add notification
    notif = Notification(
        user_id=current_user.id,
        title=f"Loan Application Submitted ({spec['name']})",
        message=f"Your application #{app_no} for ₹{req.requested_amount:,.0f} has been submitted for review.",
        type="info"
    )
    db.add(notif)

    db.commit()
    db.refresh(application)
    return application

@router.get("/my-applications", response_model=List[LoanApplicationResponse])
def get_my_applications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(LoanApplication).filter(LoanApplication.user_id == current_user.id).order_by(LoanApplication.created_at.desc()).all()

@router.get("/my-accounts", response_model=List[LoanAccountResponse])
def get_my_loan_accounts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(LoanAccount).filter(LoanAccount.user_id == current_user.id).order_by(LoanAccount.created_at.desc()).all()

@router.post("/pay-emi", response_model=LoanAccountResponse)
def pay_loan_emi(
    req: LoanEmiPayRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    loan = db.query(LoanAccount).filter(
        LoanAccount.loan_account_no == req.loan_account_no,
        LoanAccount.user_id == current_user.id
    ).first()

    if not loan:
        raise HTTPException(status_code=404, detail="Loan account not found")

    if loan.status == "closed":
        raise HTTPException(status_code=400, detail="This loan is already fully repaid!")

    if req.payment_mode == "wallet":
        if current_user.wallet_balance < req.emi_amount:
            raise HTTPException(
                status_code=400, 
                detail=f"Insufficient wallet balance. You have ₹{current_user.wallet_balance:,.2f}, required: ₹{req.emi_amount:,.2f}"
            )
        current_user.wallet_balance -= req.emi_amount

    loan.emis_paid += 1
    # Estimate outstanding reduction
    principal_portion = loan.monthly_emi * 0.72 # approx principal portion in reducing balance
    loan.outstanding_balance = max(0.0, round(loan.outstanding_balance - principal_portion, 2))
    
    if loan.emis_paid >= loan.total_emis or loan.outstanding_balance <= 0:
        loan.status = "closed"
        loan.outstanding_balance = 0.0

    # Advance next EMI date by 1 month
    loan.next_emi_date = loan.next_emi_date + datetime.timedelta(days=30)

    # Record transaction
    ref_id = f"TT-EMI-{datetime.datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{random.randint(10, 99)}"
    txn = Transaction(
        reference_id=ref_id,
        bbps_ref_no=f"BBPS-LN-{random.randint(1000000, 9999999)}",
        user_id=current_user.id,
        category="loan_emi",
        operator=f"Tatito {loan.loan_type.capitalize()} Loan",
        account_identifier=loan.loan_account_no,
        customer_name=current_user.full_name,
        amount=req.emi_amount,
        payment_mode=req.payment_mode,
        status="SUCCESS",
        meta_info={
            "emi_no": f"{loan.emis_paid} of {loan.total_emis}",
            "remaining_balance": loan.outstanding_balance
        }
    )
    db.add(txn)

    # Create notification
    notif = Notification(
        user_id=current_user.id,
        title="EMI Paid Successfully",
        message=f"EMI of ₹{req.emi_amount:,.2f} for loan {loan.loan_account_no} was received. Outstanding: ₹{loan.outstanding_balance:,.2f}",
        type="success"
    )
    db.add(notif)

    db.commit()
    db.refresh(loan)
    return loan
