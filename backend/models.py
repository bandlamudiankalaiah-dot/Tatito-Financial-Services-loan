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
    wallet_balance = Column(Float, default=25000.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    loan_applications = relationship("LoanApplication", back_populates="user", cascade="all, delete-orphan")
    loan_accounts = relationship("LoanAccount", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    reference_id = Column(String(40), unique=True, index=True, nullable=False) # e.g. TT-TXN-20261014-9842
    bbps_ref_no = Column(String(50), nullable=True) # Bharat BillPay Reference
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category = Column(String(30), nullable=False) # 'mobile', 'dth', 'fastag', 'electricity', 'water', 'gas', 'broadband', 'credit_card', 'loan_emi'
    operator = Column(String(100), nullable=False)
    account_identifier = Column(String(100), nullable=False) # phone, consumer no, vehicle no, etc.
    customer_name = Column(String(120), nullable=True)
    amount = Column(Float, nullable=False)
    payment_mode = Column(String(30), default="wallet") # wallet, upi, netbanking, card
    status = Column(String(20), default="SUCCESS") # SUCCESS, PENDING, FAILED
    meta_info = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="transactions")


class LoanApplication(Base):
    __tablename__ = "loan_applications"

    id = Column(Integer, primary_key=True, index=True)
    application_no = Column(String(40), unique=True, index=True, nullable=False) # e.g. TF-LN-2026-9042
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
    status = Column(String(30), default="submitted") # submitted, under_review, approved, rejected, disbursed
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
    type = Column(String(30), default="info") # alert, reminder, success, promo
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="notifications")
