# Tatito Financial Services - FastAPI Backend

Production-ready RESTful backend built with Python, FastAPI, Pydantic v2, and SQLAlchemy ORM.

## Architecture & Features
- **User Authentication**: JWT-based access tokens with bcrypt hashing for Standard Users and Admin roles.
- **BBPS Utility & Recharges**: Interactive Bill fetching with operator identifier lookup, payment execution, and Bharat BillPay (BBPS) compliant transaction receipt generation.
- **Loan Management**:
  - Personal Loan (From 14% p.a. up to ₹10,00,000)
  - Business Loan (From 16% p.a. up to ₹50,00,000)
  - Gold Loan (From 11% p.a. up to ₹20,00,000)
  - Home Loan (From 9% p.a. up to ₹1,00,00,000)
  - Vehicle Loan (From 10% p.a. up to ₹20,00,000)
  - Reducing-balance monthly EMI Calculator
  - Active Loan Repayment Tracker with live outstanding balance decrement
- **Financial Literacy Blog**: Dynamic endpoints for Telugu & Indian financial education articles.
- **Admin Operations**: Review loan applications, approve/reject/disburse, view transactions log and branch analytics.

---

## Step-by-Step Setup & Launch Instructions

### 1. Requirements
- Python 3.10+
- `pip` and virtual environment tool (`venv`)

### 2. Create Virtual Environment & Install Dependencies
```bash
cd backend
python -m venv venv

# On Linux/macOS:
source venv/bin/activate

# On Windows:
venv\Scripts\activate

# Install dependencies:
pip install -r requirements.txt
```

### 3. Database Configuration
By default, the application runs on SQLite (`sqlite:///./tatito_finance.db`), requiring zero external database configuration.
Tables and seed demo data (Kadapa branch test users, active loans, demo transactions, and articles) are automatically created on startup via the FastAPI lifespan event.

To switch to PostgreSQL:
```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/tatito_db"
```

### 4. Start the FastAPI Server
```bash
# From the backend directory:
uvicorn main:app --reload --port 8000 --host 0.0.0.0
```

### 5. Interactive API Documentation
Once running, open your browser:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **Healthcheck**: `http://localhost:8000/api/health`

### 6. Default Demo Credentials
- **Standard User**: `ramesh@tatito.in` / `User@123` (Pre-seeded with ₹24,850 wallet, active Gold Loan & Personal Loan)
- **Admin**: `admin@tatitofinance.com` / `Admin@123`
