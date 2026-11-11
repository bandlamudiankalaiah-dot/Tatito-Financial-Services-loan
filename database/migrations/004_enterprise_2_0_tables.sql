-- ============================================================================
-- Migration 004: Tatito Financial Services 2.0 — Complete Enterprise Schema
-- Adds wallet_transactions, roles, permissions, credit_assessments, commissions,
-- repayment_mode, and updates CHECK constraints for super_admin & 13 bill categories
-- ============================================================================

-- 1. Update users.role CHECK constraint to include super_admin
DO $$
BEGIN
  ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
  ALTER TABLE users ADD CONSTRAINT users_role_check
    CHECK (role IN ('customer', 'agent', 'credit_officer', 'admin', 'super_admin'));
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- 2. Update loan_applications.status CHECK constraint to include info_requested
DO $$
BEGIN
  ALTER TABLE loan_applications DROP CONSTRAINT IF EXISTS loan_applications_status_check;
  ALTER TABLE loan_applications ADD CONSTRAINT loan_applications_status_check
    CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'sanctioned', 'disbursed', 'rejected', 'closed', 'info_requested'));
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- 3. Update payments CHECK constraints for all 13 BBPS categories and sandbox modes
DO $$
BEGIN
  ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_payment_category_check;
  ALTER TABLE payments ADD CONSTRAINT payments_payment_category_check
    CHECK (payment_category IN (
      'loan_emi', 'electricity', 'mobile', 'mobile_prepaid', 'mobile_postpaid',
      'dth', 'fastag', 'water', 'gas', 'broadband', 'credit_card',
      'insurance_premium', 'rent', 'education_fees', 'municipal_tax',
      'utility', 'wallet_deposit'
    ));
  ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_payment_mode_check;
  ALTER TABLE payments ADD CONSTRAINT payments_payment_mode_check
    CHECK (payment_mode IN ('wallet', 'upi', 'upi_sandbox', 'netbanking', 'card', 'imps', 'neft'));
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- 4. Create wallet_transactions ledger table
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

-- 5. Create RBAC roles & permissions tables
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  role_code VARCHAR(50) UNIQUE NOT NULL,
  role_name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS permissions (
  id SERIAL PRIMARY KEY,
  role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
  permission_code VARCHAR(100) NOT NULL,
  module_name VARCHAR(100) NOT NULL,
  can_read BOOLEAN DEFAULT true,
  can_write BOOLEAN DEFAULT false,
  can_approve BOOLEAN DEFAULT false,
  UNIQUE(role_id, permission_code)
);

CREATE TABLE IF NOT EXISTS credit_assessments (
  id SERIAL PRIMARY KEY,
  application_id INTEGER REFERENCES loan_applications(id) ON DELETE CASCADE,
  officer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  cibil_score INTEGER NOT NULL DEFAULT 750,
  foir_pct NUMERIC(5, 2) DEFAULT 42.50,
  risk_grade VARCHAR(10) DEFAULT 'A',
  recommendation VARCHAR(50) DEFAULT 'approve',
  assessment_remarks TEXT,
  assessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS commissions (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  lead_id INTEGER REFERENCES agent_leads(id) ON DELETE SET NULL,
  application_id INTEGER REFERENCES loan_applications(id) ON DELETE SET NULL,
  disbursed_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  commission_rate NUMERIC(5, 2) NOT NULL DEFAULT 1.00,
  commission_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  payout_status VARCHAR(40) DEFAULT 'pending',
  settled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE loan_applications ADD COLUMN IF NOT EXISTS repayment_mode VARCHAR(40) DEFAULT 'reducing_emi';
ALTER TABLE loan_applications ADD COLUMN IF NOT EXISTS collateral_type VARCHAR(100);
ALTER TABLE loan_applications ADD COLUMN IF NOT EXISTS collateral_value NUMERIC(14, 2);
ALTER TABLE loan_applications ADD COLUMN IF NOT EXISTS guarantor_name VARCHAR(150);
ALTER TABLE loan_applications ADD COLUMN IF NOT EXISTS guarantor_phone VARCHAR(25);

-- 6. Seed Super Admin user & default RBAC roles
INSERT INTO users (id, full_name, email, phone, password_hash, role, wallet_balance, is_verified) VALUES
(5, 'M/s. Tatito Projects — Super Admin', 'superadmin@tatitofinance.com', '9440999999', '$2b$10$F9I0PKMdgXOuN0sFMywdROEPSHtHtKqF7p2N/vC8/LPDK03VHgQGG', 'super_admin', 500000.00, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO roles (role_code, role_name, description) VALUES
  ('super_admin', 'Super Administrator', 'Full governance over NBFC products, system configuration, roles, and audit trails'),
  ('admin', 'Branch Administrator', 'Operations oversight, loan sanctions, disbursements, and portfolio analytics'),
  ('credit_officer', 'Credit Underwriting Officer', 'KYC verification, CIBIL/FOIR evaluation, collateral appraisal, and credit decisions'),
  ('agent', 'DSA Field Partner Agent', 'Lead sourcing, borrower onboarding, and commission tracking'),
  ('customer', 'Retail / MSME Borrower & Investor', 'Loan applications, EMI schedules, stock trading, mutual funds, and utility payments')
ON CONFLICT (role_code) DO NOTHING;

-- 7. Seed baseline wallet_transactions for user #1
INSERT INTO wallet_transactions (id, user_id, transaction_type, amount, balance_after, description, reference_id) VALUES
  (1, 1, 'credit', 26270.00, 26270.00, 'Initial Wallet Credit via UPI Sandbox (ramesh@okaxis)', 'WAL-INIT-20261001'),
  (2, 1, 'debit', 1420.00, 24850.00, 'BBPS Utility Bill Payment - APSPDCL (Southern Power AP)', 'TT-TXN-20261010-4102')
ON CONFLICT (id) DO NOTHING;
