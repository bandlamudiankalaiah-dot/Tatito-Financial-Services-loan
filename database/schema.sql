-- ============================================================================
-- TATITO FINANCIAL SERVICES — POSTGRESQL PRODUCTION DATABASE SCHEMA
-- Branch: Kadapa Central Hub, Andhra Pradesh, India
-- Covers all 22 required relational tables with constraints, indexes & audit triggers
-- ============================================================================

-- Enable UUID extension if supported
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT gen_random_uuid() UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'agent', 'credit_officer', 'admin', 'super_admin')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    wallet_balance NUMERIC(15, 2) NOT NULL DEFAULT 25000.00 CHECK (wallet_balance >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 2. USER PROFILES TABLE
CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    dob DATE,
    gender VARCHAR(20),
    pan_number VARCHAR(10),
    aadhaar_last4 VARCHAR(4),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100) DEFAULT 'Kadapa',
    state VARCHAR(100) DEFAULT 'Andhra Pradesh',
    pincode VARCHAR(10) DEFAULT '516001',
    occupation_type VARCHAR(50) DEFAULT 'Salaried',
    employer_name VARCHAR(150),
    annual_income NUMERIC(15, 2) DEFAULT 750000.00,
    bank_account_no VARCHAR(30) DEFAULT '4821',
    bank_ifsc VARCHAR(20) DEFAULT 'SBIN0000840',
    bank_name VARCHAR(100) DEFAULT 'State Bank of India (Kadapa Main)',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. KYC RECORDS TABLE
CREATE TABLE IF NOT EXISTS kyc_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('pan', 'aadhaar', 'voter_id', 'passport', 'driving_licence')),
    document_number_masked VARCHAR(50) NOT NULL,
    verification_status VARCHAR(30) NOT NULL DEFAULT 'sandbox_simulated' CHECK (verification_status IN ('pending', 'under_review', 'verified', 'rejected', 'sandbox_simulated')),
    verification_provider VARCHAR(50) DEFAULT 'DigiLocker / NSDL KRA Sandbox',
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_kyc_user ON kyc_records(user_id);

-- 4. LOAN PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS loan_products (
    id SERIAL PRIMARY KEY,
    product_code VARCHAR(30) UNIQUE NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    min_amount NUMERIC(15, 2) NOT NULL,
    max_amount NUMERIC(15, 2) NOT NULL,
    base_interest_rate NUMERIC(5, 2) NOT NULL,
    min_tenure_months INTEGER NOT NULL,
    max_tenure_months INTEGER NOT NULL,
    processing_fee_pct NUMERIC(4, 2) NOT NULL DEFAULT 1.00,
    is_secured BOOLEAN NOT NULL DEFAULT FALSE,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. LOAN APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS loan_applications (
    id SERIAL PRIMARY KEY,
    application_no VARCHAR(40) UNIQUE NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES loan_products(id),
    agent_id INTEGER REFERENCES users(id),
    applicant_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(150) NOT NULL,
    monthly_income NUMERIC(15, 2) NOT NULL,
    requested_amount NUMERIC(15, 2) NOT NULL,
    interest_rate NUMERIC(5, 2) NOT NULL,
    tenure_months INTEGER NOT NULL,
    calculated_emi NUMERIC(15, 2) NOT NULL,
    purpose TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'sanctioned', 'disbursed', 'rejected', 'closed', 'info_requested')),
    credit_score INTEGER DEFAULT 742,
    officer_remarks TEXT,
    sanctioned_amount NUMERIC(15, 2),
    sanctioned_at TIMESTAMP WITH TIME ZONE,
    disbursed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_loans_user ON loan_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loan_applications(status);
CREATE INDEX IF NOT EXISTS idx_loans_app_no ON loan_applications(application_no);

-- 6. LOAN DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS loan_documents (
    id SERIAL PRIMARY KEY,
    application_id INTEGER NOT NULL REFERENCES loan_applications(id) ON DELETE CASCADE,
    document_category VARCHAR(50) NOT NULL CHECK (document_category IN ('id_proof', 'address_proof', 'income_slip', 'bank_statement', 'property_deed', 'gold_valuation')),
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100) DEFAULT 'application/pdf',
    file_size_kb INTEGER DEFAULT 512,
    verification_status VARCHAR(30) DEFAULT 'verified',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. COLLATERAL DETAILS TABLE
CREATE TABLE IF NOT EXISTS collateral_details (
    id SERIAL PRIMARY KEY,
    application_id INTEGER NOT NULL REFERENCES loan_applications(id) ON DELETE CASCADE,
    collateral_type VARCHAR(50) NOT NULL CHECK (collateral_type IN ('gold', 'real_estate_residential', 'real_estate_commercial', 'vehicle', 'fixed_deposit', 'shares')),
    estimated_market_value NUMERIC(15, 2) NOT NULL,
    eligible_ltv_pct NUMERIC(5, 2) NOT NULL,
    description TEXT,
    valuation_report_ref VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. GUARANTORS TABLE
CREATE TABLE IF NOT EXISTS guarantors (
    id SERIAL PRIMARY KEY,
    application_id INTEGER NOT NULL REFERENCES loan_applications(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    pan_number VARCHAR(10),
    annual_income NUMERIC(15, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. LOAN SANCTIONS TABLE
CREATE TABLE IF NOT EXISTS loan_sanctions (
    id SERIAL PRIMARY KEY,
    sanction_no VARCHAR(50) UNIQUE NOT NULL,
    application_id INTEGER NOT NULL REFERENCES loan_applications(id) ON DELETE CASCADE,
    approved_amount NUMERIC(15, 2) NOT NULL,
    sanctioned_rate NUMERIC(5, 2) NOT NULL,
    tenure_months INTEGER NOT NULL,
    monthly_emi NUMERIC(15, 2) NOT NULL,
    processing_fee_deducted NUMERIC(15, 2) NOT NULL,
    net_disbursable_amount NUMERIC(15, 2) NOT NULL,
    sanction_letter_url VARCHAR(500),
    sanctioned_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. DISBURSEMENTS TABLE
CREATE TABLE IF NOT EXISTS disbursements (
    id SERIAL PRIMARY KEY,
    disbursement_ref VARCHAR(50) UNIQUE NOT NULL,
    application_id INTEGER NOT NULL REFERENCES loan_applications(id) ON DELETE CASCADE,
    disbursed_amount NUMERIC(15, 2) NOT NULL,
    payment_mode VARCHAR(30) DEFAULT 'NEFT/RTGS',
    bank_account_no VARCHAR(30) NOT NULL,
    bank_ifsc VARCHAR(20) NOT NULL,
    utr_number VARCHAR(50) NOT NULL,
    disbursed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. EMI SCHEDULES TABLE
CREATE TABLE IF NOT EXISTS emi_schedules (
    id SERIAL PRIMARY KEY,
    application_id INTEGER NOT NULL REFERENCES loan_applications(id) ON DELETE CASCADE,
    installment_number INTEGER NOT NULL,
    due_date DATE NOT NULL,
    emi_amount NUMERIC(15, 2) NOT NULL,
    principal_component NUMERIC(15, 2) NOT NULL,
    interest_component NUMERIC(15, 2) NOT NULL,
    remaining_balance NUMERIC(15, 2) NOT NULL,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'overdue', 'partially_paid')),
    paid_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_emi_app ON emi_schedules(application_id);
CREATE INDEX IF NOT EXISTS idx_emi_due ON emi_schedules(due_date);

-- 12. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    payment_ref VARCHAR(50) UNIQUE NOT NULL,
    bbps_ref_no VARCHAR(50),
    user_id INTEGER NOT NULL REFERENCES users(id),
    application_id INTEGER REFERENCES loan_applications(id),
    payment_category VARCHAR(50) NOT NULL CHECK (payment_category IN ('loan_emi', 'electricity', 'mobile', 'mobile_prepaid', 'mobile_postpaid', 'dth', 'fastag', 'water', 'gas', 'broadband', 'credit_card', 'insurance_premium', 'rent', 'education_fees', 'municipal_tax', 'utility', 'wallet_deposit')),
    operator_name VARCHAR(100),
    account_identifier VARCHAR(100),
    amount NUMERIC(15, 2) NOT NULL,
    payment_mode VARCHAR(30) NOT NULL DEFAULT 'wallet' CHECK (payment_mode IN ('wallet', 'upi', 'upi_sandbox', 'netbanking', 'card', 'imps', 'neft')),
    status VARCHAR(30) NOT NULL DEFAULT 'SUCCESS' CHECK (status IN ('SUCCESS', 'DEMO_SUCCESS', 'PENDING', 'FAILED')),
    idempotency_key VARCHAR(100) UNIQUE,
    meta_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_idempotency ON payments(idempotency_key);

-- 13. DEMAT APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS demat_applications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) UNIQUE,
    client_code VARCHAR(40) UNIQUE NOT NULL,
    dp_id VARCHAR(40) NOT NULL DEFAULT 'IN300128-10049281',
    depository VARCHAR(20) NOT NULL DEFAULT 'NSDL',
    kyc_ckyc_number VARCHAR(30) DEFAULT '9021840192',
    linked_bank_account VARCHAR(30) NOT NULL,
    linked_bank_ifsc VARCHAR(20) NOT NULL,
    segments_enabled TEXT[] DEFAULT '{"equity_delivery", "mutual_funds", "sgb"}',
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('submitted', 'in_verification', 'active', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. INVESTMENT PORTFOLIOS TABLE
CREATE TABLE IF NOT EXISTS investment_portfolios (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    asset_symbol VARCHAR(30) NOT NULL,
    asset_name VARCHAR(150) NOT NULL,
    category VARCHAR(30) NOT NULL CHECK (category IN ('equity', 'mutual_fund', 'gold_etf', 'sovereign_bond')),
    quantity NUMERIC(12, 4) NOT NULL,
    avg_buy_price NUMERIC(12, 2) NOT NULL,
    current_price NUMERIC(12, 2) NOT NULL,
    invested_amount NUMERIC(15, 2) NOT NULL,
    current_valuation NUMERIC(15, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_portfolios_user ON investment_portfolios(user_id);

-- 15. WATCHLISTS TABLE
CREATE TABLE IF NOT EXISTS watchlists (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    symbol VARCHAR(30) NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, symbol)
);

-- 16. STOCK ORDERS TABLE
CREATE TABLE IF NOT EXISTS stock_orders (
    id SERIAL PRIMARY KEY,
    order_ref VARCHAR(50) UNIQUE NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id),
    symbol VARCHAR(30) NOT NULL,
    order_type VARCHAR(10) NOT NULL CHECK (order_type IN ('BUY', 'SELL')),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    executed_price NUMERIC(12, 2) NOT NULL,
    total_order_value NUMERIC(15, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'EXECUTED',
    is_simulated BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 17. MUTUAL FUNDS TABLE
CREATE TABLE IF NOT EXISTS mutual_funds (
    id SERIAL PRIMARY KEY,
    fund_code VARCHAR(30) UNIQUE NOT NULL,
    fund_name VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL,
    risk_level VARCHAR(30) NOT NULL,
    cagr_3y NUMERIC(5, 2) NOT NULL,
    cagr_5y NUMERIC(5, 2) NOT NULL,
    current_nav NUMERIC(10, 2) NOT NULL,
    min_sip_amount NUMERIC(10, 2) NOT NULL DEFAULT 500.00,
    fund_size_cr NUMERIC(12, 2) NOT NULL,
    expense_ratio_pct NUMERIC(4, 2) NOT NULL,
    fund_manager VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 18. MUTUAL FUND ORDERS TABLE
CREATE TABLE IF NOT EXISTS mutual_fund_orders (
    id SERIAL PRIMARY KEY,
    order_ref VARCHAR(50) UNIQUE NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id),
    fund_id INTEGER NOT NULL REFERENCES mutual_funds(id),
    investment_mode VARCHAR(20) NOT NULL CHECK (investment_mode IN ('lumpsum', 'sip')),
    amount NUMERIC(15, 2) NOT NULL,
    units_allocated NUMERIC(12, 4) NOT NULL,
    nav_at_execution NUMERIC(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'COMPLETED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 19. SIPS TABLE
CREATE TABLE IF NOT EXISTS sips (
    id SERIAL PRIMARY KEY,
    mandate_ref VARCHAR(50) UNIQUE NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id),
    fund_id INTEGER NOT NULL REFERENCES mutual_funds(id),
    monthly_amount NUMERIC(15, 2) NOT NULL CHECK (monthly_amount >= 500),
    debit_day INTEGER NOT NULL CHECK (debit_day BETWEEN 1 AND 28),
    next_debit_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 20. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR(30) NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'loans', 'investments', 'reminder', 'kyc')),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifs_user ON notifications(user_id);

-- 21. AGENTS TABLE
CREATE TABLE IF NOT EXISTS agents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    agent_code VARCHAR(30) UNIQUE NOT NULL,
    agency_name VARCHAR(150) NOT NULL,
    operating_region VARCHAR(100) DEFAULT 'Kadapa & Rayalaseema',
    commission_rate_pct NUMERIC(4, 2) DEFAULT 1.00,
    total_leads_count INTEGER DEFAULT 0,
    total_disbursed_volume NUMERIC(15, 2) DEFAULT 0.00,
    commission_earned NUMERIC(15, 2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 22. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    actor_id INTEGER REFERENCES users(id),
    action_type VARCHAR(100) NOT NULL,
    entity_name VARCHAR(50) NOT NULL,
    entity_id VARCHAR(50),
    ip_address VARCHAR(50) DEFAULT '127.0.0.1',
    user_agent TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);

-- 23. AGENT LEADS & COMMISSIONS TABLE
CREATE TABLE IF NOT EXISTS agent_leads (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    agent_code VARCHAR(30) NOT NULL,
    applicant_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(150),
    loan_product VARCHAR(100) NOT NULL,
    requested_amount NUMERIC(15, 2) NOT NULL,
    location VARCHAR(100) DEFAULT 'Kadapa',
    commission_rate_pct NUMERIC(4, 2) NOT NULL,
    commission_amount NUMERIC(15, 2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'Contacted' CHECK (status IN ('Contacted', 'In Review', 'Sanctioned', 'Disbursed', 'Rejected')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agent_leads_agent ON agent_leads(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_leads_status ON agent_leads(status);

-- 24. WALLET TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('credit', 'debit')),
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    balance_after NUMERIC(15, 2) NOT NULL,
    description TEXT NOT NULL,
    reference_id VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_wallet_tx_user ON wallet_transactions(user_id);

