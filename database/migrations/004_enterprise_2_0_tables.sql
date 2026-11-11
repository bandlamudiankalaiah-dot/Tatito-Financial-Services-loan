-- ============================================================================
-- Migration 004: Tatito Financial Services 2.0 — Complete 28-Table Schema
-- Adds roles, permissions, credit_assessments, commissions, and repayment_mode
-- ============================================================================

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

-- Seed default RBAC roles
INSERT INTO roles (role_code, role_name, description) VALUES
  ('super_admin', 'Super Administrator', 'Full governance over NBFC products, system configuration, roles, and audit trails'),
  ('admin', 'Branch Administrator', 'Operations oversight, loan sanctions, disbursements, and portfolio analytics'),
  ('credit_officer', 'Credit Underwriting Officer', 'KYC verification, CIBIL/FOIR evaluation, collateral appraisal, and credit decisions'),
  ('agent', 'DSA Field Partner Agent', 'Lead sourcing, borrower onboarding, and commission tracking'),
  ('customer', 'Retail / MSME Borrower & Investor', 'Loan applications, EMI schedules, stock trading, mutual funds, and utility payments')
ON CONFLICT (role_code) DO NOTHING;
