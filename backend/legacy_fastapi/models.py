import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(120), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    phone = Column(String(20), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default="user") # 'user' or 'admin'
    city = Column(String(60), default="Kadapa")
    state = Column(String(60), default="Andhra Pradesh")
    annual_income = Column(Float, default=750000.0)
    wallet_balance = Column(Float, default=25000.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    loan_applications = relationship("LoanApplication", back_populates="user", cascade="all, delete-orphan")
    loan_accounts = relationship("LoanAccount", back_populates="user", cascade="all, delete-orphan")
    investment_records = relationship("InvestmentRecord", back_populates="user", cascade="all, delete-orphan")
    portfolio = relationship("InvestmentPortfolio", back_populates="user", uselist=False, cascade="all, delete-orphan")
    contact_enquiries = relationship("ContactEnquiry", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")


class LoanApplication(Base):
    __tablename__ = "loan_applications"

    id = Column(Integer, primary_key=True, index=True)
    application_no = Column(String(40), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    loan_type = Column(String(30), nullable=False) # personal, business, gold, home, vehicle
    applicant_name = Column(String(120), nullable=False)
    phone = Column(String(20), nullable=False)
    email = Column(String(120), nullable=False)
    pan_card = Column(String(20), nullable=False)
    aadhaar_last4 = Column(String(10), nullable=False)
    monthly_income = Column(Float, nullable=False)
    requested_amount = Column(Float, nullable=False)
    interest_rate = Column(Float, nullable=False) # Annual interest rate %
    tenure_months = Column(Integer, nullable=False)
    purpose = Column(String(255), nullable=False)
    status = Column(String(30), default="pending") # pending, under_review, approved, rejected, disbursed
    admin_remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="loan_applications")


class LoanAccount(Base):
    __tablename__ = "loan_accounts"

    id = Column(Integer, primary_key=True, index=True)
    loan_account_no = Column(String(40), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    loan_type = Column(String(30), nullable=False)
    principal_amount = Column(Float, nullable=False)
    interest_rate = Column(Float, nullable=False)
    tenure_months = Column(Integer, nullable=False)
    monthly_emi = Column(Float, nullable=False)
    emis_paid = Column(Integer, default=0)
    total_emis = Column(Integer, nullable=False)
    next_emi_date = Column(DateTime, nullable=False)
    outstanding_balance = Column(Float, nullable=False)
    status = Column(String(20), default="active") # active, closed
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="loan_accounts")


class InvestmentPortfolio(Base):
    __tablename__ = "investment_portfolios"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    total_invested = Column(Float, default=0.0)
    current_value = Column(Float, default=0.0)
    total_returns = Column(Float, default=0.0)
    returns_percentage = Column(Float, default=0.0)
    day_gain = Column(Float, default=0.0)
    day_gain_percentage = Column(Float, default=0.0)
    last_updated = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="portfolio")


class InvestmentRecord(Base):
    __tablename__ = "investment_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    asset_symbol = Column(String(30), nullable=False) # e.g. 'NIFTY50_ETF', 'GOLD_BEES', 'RELIANCE', 'TCS'
    asset_name = Column(String(120), nullable=False)
    category = Column(String(40), nullable=False) # 'equity', 'gold', 'bond', 'mutual_fund'
    units = Column(Float, nullable=False)
    buy_price = Column(Float, nullable=False)
    current_price = Column(Float, nullable=False)
    invested_amount = Column(Float, nullable=False)
    current_amount = Column(Float, nullable=False)
    is_sip = Column(Boolean, default=False)
    sip_frequency = Column(String(20), default="monthly") # 'monthly', 'quarterly', 'one-time'
    status = Column(String(20), default="active") # 'active', 'redeemed'
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="investment_records")


class ContactEnquiry(Base):
    __tablename__ = "contact_enquiries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    full_name = Column(String(120), nullable=False)
    email = Column(String(120), nullable=False)
    phone = Column(String(20), nullable=False)
    subject = Column(String(200), nullable=False)
    category = Column(String(50), default="General Support") # 'Loan Enquiry', 'Investment Advice', 'BBPS Dispute', 'General Support'
    message = Column(Text, nullable=False)
    status = Column(String(30), default="new") # 'new', 'in_progress', 'resolved'
    admin_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="contact_enquiries")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    reference_id = Column(String(40), unique=True, index=True, nullable=False)
    bbps_ref_no = Column(String(50), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category = Column(String(30), nullable=False)
    operator = Column(String(100), nullable=False)
    account_identifier = Column(String(100), nullable=False)
    customer_name = Column(String(120), nullable=True)
    amount = Column(Float, nullable=False)
    payment_mode = Column(String(30), default="wallet")
    status = Column(String(20), default="SUCCESS")
    meta_info = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="transactions")


class BlogPost(Base):
    __tablename__ = "blog_posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    category = Column(String(50), nullable=False)
    summary = Column(Text, nullable=False)
    content = Column(Text, nullable=False)
    author = Column(String(100), default="Tatito Advisory Team")
    read_time = Column(String(20), default="5 min read")
    cover_image = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(30), default="info")
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="notifications")
