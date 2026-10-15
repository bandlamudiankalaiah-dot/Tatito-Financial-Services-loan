import random
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Transaction, Notification
from ..schemas import BillFetchRequest, BillFetchResponse, BillPaymentRequest, TransactionResponse
from ..auth_utils import get_current_user

router = APIRouter(prefix="/api/bills", tags=["Bills & Recharges"])

# Mock names for realistic Andhra Pradesh bill lookups
NAMES_POOL = [
    "Venkata Subba Reddy", "Lakshmi Narayana Rao", "Siva Rama Krishna", 
    "Ankamma Rao Bandlamudi", "Ramesh Kumar Chennur", "Sunitha Devi Giddalur",
    "Srinivasulu Kadapa", "Mahesh Babu Rayalaseema", "Kavitha Reddy"
]

@router.post("/fetch", response_model=BillFetchResponse)
def fetch_bill(req: BillFetchRequest):
    """
    Simulates Bharat BillPay (BBPS) Central Unit lookup with operator validation
    """
    cleaned_id = req.account_identifier.strip()
    if len(cleaned_id) < 4:
        raise HTTPException(status_code=400, detail="Invalid consumer/account identifier provided")

    # Deterministic mock data generation based on identifier hash
    hash_seed = sum(ord(c) for c in cleaned_id)
    random.seed(hash_seed)
    
    customer_name = random.choice(NAMES_POOL)
    
    # Realistic amount determination based on category
    if req.category in ["electricity"]:
        amount = float(random.randint(650, 4800))
    elif req.category in ["water"]:
        amount = float(random.randint(180, 850))
    elif req.category in ["gas"]:
        amount = float(random.choice([950, 1053, 1120, 480])) # LPG cylinder or piped
    elif req.category in ["mobile"]:
        amount = float(random.choice([299, 349, 479, 666, 839, 999, 1499, 2999]))
    elif req.category in ["dth"]:
        amount = float(random.choice([250, 399, 499, 650, 1100]))
    elif req.category in ["fastag"]:
        amount = float(random.choice([500, 1000, 1500, 2000]))
    elif req.category in ["broadband"]:
        amount = float(random.choice([589, 825, 1179, 1769]))
    elif req.category in ["credit_card"]:
        amount = float(random.randint(3200, 48000))
    else:
        amount = float(random.randint(300, 2500))

    now = datetime.datetime.utcnow()
    bill_date = (now - datetime.timedelta(days=random.randint(5, 15))).strftime("%d %b %Y")
    due_date = (now + datetime.timedelta(days=random.randint(3, 12))).strftime("%d %b %Y")
    bill_number = f"BILL-{random.randint(100000, 999999)}"
    op_ref = f"BBPS-KDP-{random.randint(10000000, 99999999)}"

    # Reset seed
    random.seed(None)

    return BillFetchResponse(
        customer_name=customer_name,
        account_identifier=cleaned_id,
        operator=req.operator,
        category=req.category,
        bill_number=bill_number,
        bill_date=bill_date,
        due_date=due_date,
        amount_due=amount,
        convenience_fee=0.0,
        operator_reference=op_ref,
        status="UNPAID",
        additional_details={
            "circle": "Andhra Pradesh (Kadapa)",
            "bill_period": "Monthly Cycle",
            "biller_status": "Active & Verified",
            "bbps_biller_id": f"IN{random.randint(1000, 9999)}"
        }
    )

@router.post("/pay", response_model=TransactionResponse)
def pay_bill(
    payment: BillPaymentRequest, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Executes mock payment, updates wallet or processes chosen payment mode,
    and issues an authenticated BBPS receipt transaction.
    """
    if payment.payment_mode == "wallet":
        if current_user.wallet_balance < payment.amount:
            raise HTTPException(
                status_code=400, 
                detail=f"Insufficient wallet balance. You have ₹{current_user.wallet_balance:,.2f}, required: ₹{payment.amount:,.2f}"
            )
        # Deduct balance
        current_user.wallet_balance -= payment.amount

    # Generate reference codes
    ref_id = f"TT-TXN-{datetime.datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{random.randint(100, 999)}"
    bbps_ref = f"BBPS{random.randint(1000000000, 9999999999)}"

    meta = {
        "biller_name": payment.operator,
        "payment_channel": "Tatito Web Portal",
        "device": "Web Client",
        "consumer_name": payment.customer_name,
        "location": "Kadapa, Andhra Pradesh",
        "applied_coupon": payment.applied_coupon or None,
        "bbps_terminal_id": "KDP-CTR-01"
    }

    txn = Transaction(
        reference_id=ref_id,
        bbps_ref_no=bbps_ref,
        user_id=current_user.id,
        category=payment.category,
        operator=payment.operator,
        account_identifier=payment.account_identifier,
        customer_name=payment.customer_name,
        amount=payment.amount,
        payment_mode=payment.payment_mode,
        status="SUCCESS",
        meta_info=meta,
        created_at=datetime.datetime.utcnow()
    )
    db.add(txn)

    # Create notification
    notif = Notification(
        user_id=current_user.id,
        title="Payment Successful!",
        message=f"₹{payment.amount:,.2f} paid for {payment.operator} ({payment.account_identifier}). Ref: {ref_id}",
        type="success"
    )
    db.add(notif)

    db.commit()
    db.refresh(txn)

    return txn

@router.get("/history", response_model=List[TransactionResponse])
def get_transaction_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    txns = db.query(Transaction).filter(Transaction.user_id == current_user.id).order_by(Transaction.created_at.desc()).all()
    return txns
