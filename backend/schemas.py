import datetime
from typing import Optional, List, Any, Dict
from pydantic import BaseModel, EmailStr, Field

# --- User Schemas ---
class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    city: Optional[str] = "Kadapa"
    state: Optional[str] = "Andhra Pradesh"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    role: str
    wallet_balance: float
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenData(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None
    role: Optional[str] = None


# --- Bill / Recharge Schemas ---
class BillFetchRequest(BaseModel):
    category: str = Field(..., description="mobile, dth, fastag, electricity, water, gas, broadband, credit_card")
    operator: str
    account_identifier: str = Field(..., description="Mobile number, Consumer ID, Vehicle No, or Card No")
    sub_category: Optional[str] = None

class BillFetchResponse(BaseModel):
    customer_name: str
    account_identifier: str
    operator: str
    category: str
    bill_number: str
    bill_date: str
    due_date: str
    amount_due: float
    convenience_fee: float = 0.0
    operator_reference: str
    status: str = "PENDING"
    additional_details: Optional[Dict[str, Any]] = None

class BillPaymentRequest(BaseModel):
    category: str
    operator: str
    account_identifier: str
    customer_name: str
    amount: float
    payment_mode: str = "wallet" # wallet, upi, netbanking, card
    applied_coupon: Optional[str] = None

class TransactionResponse(BaseModel):
    id: int
    reference_id: str
    bbps_ref_no: Optional[str]
    category: str
    operator: str
    account_identifier: str
    customer_name: Optional[str]
    amount: float
    payment_mode: str
    status: str
    meta_info: Optional[Dict[str, Any]]
    created_at: datetime.datetime

    class Config:
        from_attributes = True


# --- Loan Schemas ---
class LoanApplyRequest(BaseModel):
    loan_type: str = Field(..., description="personal, business, gold, home, vehicle")
    applicant_name: str
    phone: str
    email: EmailStr
    pan_card: str
    aadhaar_last4: str
    monthly_income: float
    requested_amount: float
    tenure_months: int
    purpose: str

class LoanApplicationResponse(BaseModel):
    id: int
    application_no: str
    loan_type: str
    applicant_name: str
    phone: str
    email: str
    monthly_income: float
    requested_amount: float
    interest_rate: float
    tenure_months: int
    purpose: str
    status: str
    admin_remarks: Optional[str]
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class LoanStatusUpdateRequest(BaseModel):
    status: str = Field(..., description="under_review, approved, rejected, disbursed")
    admin_remarks: Optional[str] = None

class LoanAccountResponse(BaseModel):
    id: int
    loan_account_no: str
    loan_type: str
    principal_amount: float
    interest_rate: float
    tenure_months: int
    monthly_emi: float
    emis_paid: int
    total_emis: int
    next_emi_date: datetime.datetime
    outstanding_balance: float
    status: str

    class Config:
        from_attributes = True

class LoanEmiPayRequest(BaseModel):
    loan_account_no: str
    emi_amount: float
    payment_mode: str = "wallet"

class EmiCalculationRequest(BaseModel):
    principal: float
    interest_rate_annual: float
    tenure_months: int

class EmiCalculationResponse(BaseModel):
    monthly_emi: float
    total_interest: float
    total_payment: float


# --- Blog Schemas ---
class BlogPostResponse(BaseModel):
    id: int
    title: str
    slug: str
    category: str
    summary: str
    content: str
    author: str
    read_time: str
    cover_image: Optional[str]
    created_at: datetime.datetime

    class Config:
        from_attributes = True


# --- Notification Schemas ---
class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True
