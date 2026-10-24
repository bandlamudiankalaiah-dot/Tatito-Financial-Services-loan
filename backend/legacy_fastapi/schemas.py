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
    annual_income: Optional[float] = 750000.0

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    annual_income: Optional[float] = None

class UserResponse(UserBase):
    id: int
    role: str
    wallet_balance: float
    is_active: bool
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
    pan_card: str
    aadhaar_last4: str
    monthly_income: float
    requested_amount: float
    interest_rate: float
    tenure_months: int
    purpose: str
    status: str
    admin_remarks: Optional[str]
    created_at: datetime.datetime
    updated_at: Optional[datetime.datetime]

    class Config:
        from_attributes = True

class LoanStatusUpdateRequest(BaseModel):
    status: str = Field(..., description="pending, under_review, approved, rejected, disbursed")
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


# --- Investment & Trading Schemas ---
class MarketQuote(BaseModel):
    symbol: str
    name: str
    category: str # 'Index', 'Equity', 'Gold', 'Commodity'
    price: float
    change_amount: float
    change_percentage: float
    day_high: float
    day_low: float
    last_updated: str

class InvestmentCreateRequest(BaseModel):
    asset_symbol: str
    asset_name: str
    category: str # 'equity', 'gold', 'bond', 'mutual_fund'
    amount: float
    is_sip: bool = False
    sip_frequency: str = "monthly"

class InvestmentRecordResponse(BaseModel):
    id: int
    asset_symbol: str
    asset_name: str
    category: str
    units: float
    buy_price: float
    current_price: float
    invested_amount: float
    current_amount: float
    is_sip: bool
    sip_frequency: str
    status: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class PortfolioResponse(BaseModel):
    total_invested: float
    current_value: float
    total_returns: float
    returns_percentage: float
    day_gain: float
    day_gain_percentage: float
    asset_allocation: Dict[str, float]
    holdings: List[InvestmentRecordResponse]
    disclaimer: str = "Simulated portfolio tracker for educational & wealth planning purposes. No real stock exchange execution occurs."


# --- Contact & Enquiry Schemas ---
class ContactCreateRequest(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    subject: str
    category: str = "General Support" # 'Loan Enquiry', 'Investment Advice', 'BBPS Dispute', 'General Support'
    message: str

class ContactEnquiryResponse(BaseModel):
    id: int
    user_id: Optional[int]
    full_name: str
    email: str
    phone: str
    subject: str
    category: str
    message: str
    status: str
    admin_notes: Optional[str]
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class ContactStatusUpdateRequest(BaseModel):
    status: str
    admin_notes: Optional[str] = None


# --- Admin Dashboard Stats Schemas ---
class AdminDashboardStats(BaseModel):
    total_users: int
    total_loan_applications: int
    pending_loan_applications: int
    approved_loan_applications: int
    rejected_loan_applications: int
    total_loan_disbursed: float
    total_transactions: int
    total_transaction_volume: float
    total_contact_enquiries: int
    new_contact_enquiries: int
    total_investments_volume: float
    branch: str = "Kadapa Central Hub, Andhra Pradesh"


# --- Bill / Recharge Schemas ---
class BillFetchRequest(BaseModel):
    category: str
    operator: str
    account_identifier: str
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
    payment_mode: str = "wallet"
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
