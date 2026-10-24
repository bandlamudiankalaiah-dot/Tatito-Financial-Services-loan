# Tatito Financial Services — Borrow, Invest, Trade

A production-oriented full-stack financial services platform built with a **Node.js + Express backend**, **PostgreSQL relational database architecture**, and a **semantic HTML5, modern CSS3, and Vanilla JavaScript (ES6+) frontend**.

Serving Kadapa and the Rayalaseema region of Andhra Pradesh, India.

---

## 1. Technology Stack Architecture

- **Frontend:** Pure HTML5, custom CSS3 design system, and Vanilla JavaScript (ES6+). Zero React, Vue, Angular, Next.js, Tailwind CSS, or Bootstrap runtime dependencies.
- **Backend:** Node.js with Express.js RESTful APIs, JWT Bearer token authentication, and secure password hashing using `bcryptjs`.
- **Database:** PostgreSQL schema with 22 relational tables, foreign keys, constraints, and audit logging (`/database/schema.sql` and `/database/migrations`).
- **Integrations:** Documented partner adapters with sandbox mock fallbacks (`/integrations/index.ts`).
- **Testing:** Automated test suite (`npm test`) covering Auth, Database, EMI calculation, KYC verification, and Credit Bureau adapters.

---

## 2. Directory Structure

```
tatito-financial-services/
├── backend/
│   ├── middleware/
│   │   └── auth.ts          # JWT token verification & role-based route guards
│   └── routes/
│       ├── auth.routes.ts   # Registration, JWT login, me, reset password
│       ├── users.routes.ts  # Customer profile, onboarding, wallet funding
│       ├── kyc.routes.ts    # DigiLocker PAN/Aadhaar verification & CIBIL score
│       ├── loans.routes.ts  # Products, EMI calc, applications, repayments
│       ├── payments.routes.ts # BBPS utility bills (electricity, water, etc.) & history
│       ├── investments.routes.ts # Stocks, watchlist, mutual funds, SIPs, Demat
│       ├── admin.routes.ts  # Underwriting queue, loan approval decisions, CSV
│       ├── agents.routes.ts # DSA partner leads & tiered commission calculations
│       └── notifications.routes.ts # Activity stream & unread alerts counter
├── database/
│   ├── schema.sql           # Production PostgreSQL DDL for all 22 relational tables
│   ├── seed.sql             # Realistic Kadapa seed dataset with hashed passwords
│   ├── migrations/
│   │   └── 001_initial_schema.sql # Versioned migration script
│   └── db.ts                # PostgreSQL pg.Pool manager with resilient local fallback
├── integrations/
│   └── index.ts             # 9 Documented fintech partner adapters (KYC, CIBIL, etc.)
├── tests/
│   └── api.test.ts          # Automated backend integration and logic test suite
├── index.html               # Public landing page (Hero, 3 Pillars, FAQ, Contact)
├── login.html               # 1-Click demo authentication with password reveal
├── register.html            # Registration form with client-side field validation
├── dashboard.html           # Unified customer dashboard with portfolio charts & active loans
├── loans.html               # Complete catalog of 7 tailored loan products
├── loan-application.html    # 5-step guided loan application wizard with reference tracking
├── emi-calculator.html      # Reducing-balance EMI calculator with amortization schedule & CSV
├── investments.html         # Master wealth hub with asset allocation visualizer
├── stocks.html              # Stock market simulator with technical SVG charts & buy/sell modal
├── mutual-funds.html        # Direct mutual funds catalog with SIP mandate registration
├── sip-calculator.html      # Compound wealth projection calculator with SVG growth curves
├── demat.html               # Electronic Demat account repository, DP ID & KYC status
├── profile.html             # Customer profile settings, password update & demo data reset
├── notifications.html       # Full notification center with categories & unread badges
├── admin.html               # Branch Admin review console with loan approval decisions
├── agents.html              # Direct Selling Agent (DSA) partner portal & lead pipeline
├── css/
│   ├── style.css            # Complete handcrafted design system (colors, cards, modals, tables)
│   └── responsive.css       # Breakpoints for desktop, tablet, and mobile off-canvas drawer
├── js/
│   ├── app.js               # TatitoApiClient, formatters, toast notices, modal manager
│   ├── auth.js              # Full-stack JWT authentication, session guards, and role routing
│   ├── dashboard.js         # Customer dashboard metrics & EMI payment processor
│   ├── loans.js             # Loan catalog renderer & 5-step application wizard logic
│   ├── emi-calculator.js    # Reducing-balance EMI formula & CSV amortization export
│   ├── sip-calculator.js    # Compound interest FV calculation & wealth growth SVG curves
│   ├── investments.js       # Unified portfolio aggregator & asset allocation manager
│   ├── stocks.js            # Live simulated quotes, watchlist, holdings & trade orders
│   ├── mutual-funds.js      # Mutual funds explorer, category filters & SIP mandates
│   ├── demat.js             # Depository credentials & segment activation disclosures
│   ├── admin.js             # Credit underwriting queue, application dossiers & approval actions
│   └── storage.js           # Client-side persistence engine pre-seeded with Kadapa datasets
├── assets/
│   └── brand-badge.svg      # Tatito Financial Services vector branding asset
├── server.ts                # Express backend server entry point mounting all API routes
├── .env.example             # Comprehensive environment configuration template
└── package.json
```

---

## 3. Database Schema (22 PostgreSQL Tables)

| # | Table Name | Purpose | Key Constraints & Indexes |
|---|---|---|---|
| 1 | `users` | Core user identity & roles | Unique email, phone, role check (`customer`, `agent`, `credit_officer`, `admin`) |
| 2 | `user_profiles` | Extended demographic & banking info | FK `users.id`, PAN, Aadhaar, annual income, bank IFSC |
| 3 | `kyc_records` | Document verification records | FK `users.id`, status check (`verified`, `pending`, `rejected`) |
| 4 | `loan_products` | Master loan product catalog | Unique `product_code`, interest rates, limits, tenure bounds |
| 5 | `loan_applications` | Customer loan applications | Unique `application_no`, status workflow, credit score index |
| 6 | `loan_documents` | Uploaded applicant verification files | Category check, application FK |
| 7 | `collateral_details` | Pledged property / gold / asset info | LTV ratio, market valuation, application FK |
| 8 | `guarantors` | Co-borrower / guarantor details | Application FK, relationship, PAN |
| 9 | `loan_sanctions` | Formal loan sanction terms | Sanction letter ref, net disbursable amount, officer FK |
| 10 | `disbursements` | Fund release records | UTR number, payment mode, bank account |
| 11 | `emi_schedules` | Month-by-month repayment schedule | Principal/interest split, status (`paid`, `pending`, `overdue`) |
| 12 | `payments` | Transaction logs (EMIs, BBPS bills) | Unique `payment_ref`, BBPS ref, category check |
| 13 | `demat_applications` | Electronic Demat accounts | Unique `client_code`, DP ID (`IN300128`), depository |
| 14 | `investment_portfolios` | Securities & fund holdings | Quantity, average buy price, current valuation |
| 15 | `watchlists` | User tracked ticker symbols | Composite unique (`user_id`, `symbol`) |
| 16 | `stock_orders` | Equity buy/sell trade executions | Order ref, execution price, quantity, simulated flag |
| 17 | `mutual_funds` | Direct-plan mutual fund schemes | Category, NAV, 3Y/5Y CAGR, expense ratio, AUM |
| 18 | `mutual_fund_orders` | Lump-sum & initial fund purchases | Units allocated, execution NAV, user FK |
| 19 | `sips` | Recurring auto-debit mandates | Monthly amount, debit day, next execution date |
| 20 | `notifications` | In-app alerts & reminders | Unread flag, category, user FK index |
| 21 | `agents` | Direct Selling Agents (DSA) | Unique `agent_code`, commission rate, volume tracked |
| 22 | `audit_logs` | Immutable audit trail | Actor FK, action type, IP address, JSON details |

---

## 4. Financial Partner Integrations

Documented in `/integrations/index.ts` with sandbox simulation fallbacks:

1. **Identity & e-KYC:** DigiLocker / NSDL KRA Sandbox integration for PAN & Aadhaar OCR.
2. **Credit Bureau:** CIBIL / Experian credit scoring engine returning scores between 300–900.
3. **E-Signature:** Aadhaar e-Sign for legally binding digital loan contracts.
4. **e-NACH Mandate:** NPCI automated recurring debit for monthly loan EMIs and mutual fund SIPs.
5. **Payment Gateway & BBPS:** Bharat BillPay (BBPS) integration for APSPDCL electricity, water, gas, FASTag, and mobile recharges.
6. **Lending Consortium:** NBFC & co-lending partner syndicate underwriting.
7. **Depository Participant:** NSDL / CDSL Demat participant gateway (`IN300128-10049281`).
8. **Market Data Feed:** Real-time constituent feeds for Nifty 50 and BSE Sensex.
9. **Mutual Fund Order Routing:** BSE StAR MF / MF Central transaction routing.

---

## 5. API Endpoints Reference

All endpoints accept and return `application/json` with standard HTTP status codes:

- `POST /api/auth/register` — Register new user account.
- `POST /api/auth/login` — Authenticate and receive signed JWT token.
- `GET  /api/auth/me` — Retrieve authenticated user profile.
- `GET  /api/users/profile` — Fetch user KYC, Demat, and banking details.
- `PUT  /api/users/profile` — Update address, income, or phone.
- `POST /api/users/deposit` — Simulate wallet balance deposit.
- `GET  /api/kyc/status` — Check PAN/Aadhaar verification status.
- `POST /api/kyc/verify-pan` — Verify PAN card via KRA adapter.
- `GET  /api/loans/products` — Retrieve catalog of 7 loan products.
- `POST /api/loans/calculate-emi` — Compute reducing-balance amortization schedule.
- `POST /api/loans/apply` — Submit new loan application.
- `GET  /api/loans/my-applications` — List user's submitted loan applications.
- `GET  /api/loans/my-accounts` — List user's active/sanctioned loan accounts.
- `POST /api/loans/pay-emi` — Pay loan installment with wallet deduction.
- `POST /api/payments/bills/fetch` — Fetch due bill via simulated BBPS.
- `POST /api/payments/bills/pay` — Pay utility bill and generate receipt.
- `GET  /api/investments/stocks` — Fetch market quotes for trading terminal.
- `POST /api/investments/stocks/order` — Execute simulated stock BUY/SELL trade.
- `GET  /api/investments/mutual-funds` — Explore curated direct mutual funds.
- `POST /api/investments/sips` — Authorize recurring monthly SIP mandate.
- `DELETE /api/investments/sips/:id` — Pause or cancel SIP mandate.
- `GET  /api/investments/portfolio` — Calculate net worth & asset allocation.
- `GET  /api/admin/dashboard-stats` — Branch KPI metrics (disbursements, AUM, queue).
- `GET  /api/admin/loans` — Filter loan applications for credit committee review.
- `PATCH /api/admin/loans/:id/decision` — Approve, Sanction, Disburse, or Reject loan.
- `GET  /api/admin/reports/csv` — Export complete loans dataset as CSV.
- `GET  /api/agents/leads` — DSA leads pipeline tracker.
- `POST /api/agents/leads` — Submit borrower lead with commission calculation.
- `GET  /api/agents/commissions` — Commission tier slabs & earnings.
- `GET  /api/notifications` — Activity stream and unread messages.

---

## 6. How to Run Locally

### Running the Application

```bash
# 1. Install dependencies:
npm install

# 2. Run automated test suite (38 master integration tests):
npm test

# 3. Run type checks and build:
npm run lint
npm run build

# 4. Start full-stack server (Node.js/Express on port 3000):
npm run dev
```

Open `http://localhost:3000` in your browser.

### Running with PostgreSQL (Production Source of Truth)

In production mode (`NODE_ENV=production`), PostgreSQL is the mandatory single source of truth. If PostgreSQL is disconnected, the server fails safely with an explicit HTTP 503 `DatabaseUnavailableError` to prevent split-brain state or data corruption.

1. Create database:
   ```bash
   createdb tatito_finance
   ```
2. Apply automated versioned migrations:
   ```bash
   npm run migrate
   ```
   *The Node.js migration runner applies all sequential `.sql` migrations in `database/migrations/`, records versions in `schema_migrations`, and safely updates existing tables without deleting user data.*

3. Set `DATABASE_URL` in `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tatito_finance"
   JWT_SECRET="tatito-kadapa-super-secret-jwt-key-change-in-production-min-32-chars"
   DATA_STORE_MODE="postgresql"
   ```

4. Start in production:
   ```bash
   NODE_ENV=production npm start
   ```

*Note: In development or sandbox test environments without a running PostgreSQL daemon, setting `DATA_STORE_MODE=demo` enables the isolated relational store with realistic Kadapa test data.*

---

## 7. Pre-Seeded Test Credentials

| Role | Name | Email | Password | Access Highlights |
|---|---|---|---|---|
| **Customer** | Ramesh Kumar Chennur | `ramesh@tatito.in` | `Password@123` | Active loans, Demat portfolio, trade stocks, start SIP, pay EMIs |
| **Branch Admin** | Ankalaiah Bandlamudi | `admin@tatitofinance.com` | `Password@123` | Underwrite loan applications, approve/reject loans, export CSV |
| **Channel Agent** | Siva Reddy (DSA) | `agent@tatito.in` | `Password@123` | Log borrower leads, track commission payouts (0.40% - 1.50%) |
| **Credit Officer**| Lakshmi Narayana Rao | `credit@tatito.in` | `Password@123` | Credit committee assessment, sanctioning, and disbursal checks |
