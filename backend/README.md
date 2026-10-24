# Tatito Financial Services – Full-Stack FastAPI Backend
**Tagline: Borrow, Invest, Trade**  
Headquarters: Trunk Road, Kadapa, Andhra Pradesh, India.

Production-ready RESTful backend built with Python, FastAPI, Pydantic v2, and SQLAlchemy ORM.

---

## 1. System Architecture & Modules

- **User Authentication (`/api/auth`)**: JWT access tokens, bcrypt password hashing, login, registration, current user (`/me`), and cookie-based session clearance (`/logout`).
- **User Profiles (`/api/users`)**: Profile details fetch (`GET /api/users/profile`) and updates (`PUT /api/users/profile`).
- **Loan Management (`/api/loans`)**:
  - `POST /api/loans`: Submit loan applications with limits validation (Personal up to ₹10L @ 14%, Business up to ₹50L @ 16%, Gold up to ₹20L @ 11%, Home up to ₹1Cr @ 9%, Vehicle up to ₹20L @ 10%).
  - `GET /api/loans/my-applications`: User's submitted loan applications with status (`pending`, `under_review`, `approved`, `rejected`, `disbursed`).
  - `POST /api/loans/calculate-emi`: Reducing balance monthly EMI computation.
  - `POST /api/loans/pay-emi`: Loan EMI repayment with automatic balance decrement.
- **Investments & Trading (`/api/investments`)**:
  - `GET /api/investments/market-quotes`: Verified live market benchmark quotes (Nifty 50, Sensex, Gold ETF, Reliance, TCS, Sovereign Bonds).
  - `GET /api/investments/portfolio`: Portfolio summary (Current Value, Total Invested, Returns %, Day Gain, Asset Allocation).
  - `POST /api/investments/invest`: Record new simulated holdings or SIPs.
  - Clear compliance disclaimer: Educational & simulated portfolio tracking without claimed stock exchange execution.
- **Contact & Enquiries (`/api/contact`)**:
  - `POST /api/contact`: Form input validation and database recording.
  - `GET /api/contact/categories`: Dropdown categories.
- **Admin Operations (`/api/admin`)**:
  - `GET /api/admin/dashboard-stats`: Dynamic KPI metrics computed directly from database tables.
  - `GET /api/admin/loans`: Applications review desk.
  - `PATCH /api/admin/loans/{loan_id}/status`: Credit approvals and rejection decisions.
  - `GET /api/admin/users`: Registered customers roster.
  - `GET /api/admin/contact-enquiries`: Customer feedback and dispute desk.
- **Bharat BillPay (BBPS) Gateway (`/api/bills`)**:
  - `POST /api/bills/fetch`: Simulated central BBPS lookup for APSPDCL, APEPDCL, Jio, Airtel, Indane Gas, FASTag, etc.
  - `POST /api/bills/pay`: Payment confirmation and BBPS reference receipt generation.

---

## 2. API Endpoints Table

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user | Public |
| `POST` | `/api/auth/login` | Login and obtain JWT Bearer token | Public |
| `GET` | `/api/auth/me` | Current authenticated user | Bearer Token |
| `POST` | `/api/auth/logout` | Logout & clear session cookies | Optional |
| `GET` | `/api/users/profile` | View profile information | Bearer Token |
| `PUT` | `/api/users/profile` | Update profile information | Bearer Token |
| `POST` | `/api/loans` | Submit loan application | Bearer Token |
| `GET` | `/api/loans/my-applications`| List user's submitted loan applications | Bearer Token |
| `POST` | `/api/loans/calculate-emi` | Calculate reducing balance EMI | Public |
| `POST` | `/api/loans/pay-emi` | Pay loan EMI | Bearer Token |
| `GET` | `/api/investments/market-quotes` | Real-time market benchmark quotes | Public |
| `GET` | `/api/investments/portfolio` | User investment portfolio summary | Bearer Token |
| `POST` | `/api/investments/invest` | Record new investment or SIP | Bearer Token |
| `POST` | `/api/contact` | Submit support enquiry message | Public |
| `GET` | `/api/admin/dashboard-stats` | Real-time database metrics | Admin Role |
| `GET` | `/api/admin/loans` | List all loan applications | Admin Role |
| `PATCH`| `/api/admin/loans/{id}/status` | Update loan status (approved, rejected, etc.) | Admin Role |
| `GET` | `/api/admin/contact-enquiries` | Review support enquiries | Admin Role |
| `GET` | `/api/admin/users` | List all registered users | Admin Role |

---

## 3. Local Development Setup

### Prerequisites
- Python 3.10+
- `pip` and virtual environment tool (`venv`)

### Commands
```bash
# 1. Navigate to backend directory
cd backend

# 2. Create and activate a Python virtual environment
python -m venv venv

# On Linux/macOS:
source venv/bin/activate

# On Windows:
venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Copy environment configuration
cp .env.example .env

# 5. Launch the FastAPI server
uvicorn main:app --reload --port 8000 --host 0.0.0.0
```

### Accessing Interactive Documentation
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **Health Check**: `http://localhost:8000/api/health`

---

## 4. Database Setup & Switching to PostgreSQL

By default, the backend runs on SQLite (`sqlite:///./tatito_finance.db`). On first boot, the database tables and initial Kadapa branch demo records are automatically created via the `lifespan` startup hook.

To switch to **PostgreSQL** in production:
1. Install PostgreSQL driver: `pip install psycopg2-binary`
2. Update `.env`:
   ```env
   DATABASE_URL="postgresql://tatito_user:securepassword@localhost:5432/tatito_db"
   ```
3. Restart the server. Tables will automatically migrate to the PostgreSQL instance.

---

## 5. Default Demo Credentials
- **Standard User**: `ramesh@tatito.in` / `User@123` (Pre-seeded with wallet balance, active loans & investment portfolio)
- **Branch Admin**: `admin@tatitofinance.com` / `Admin@123` (Admin privileges for reviewing loans & enquiries)
