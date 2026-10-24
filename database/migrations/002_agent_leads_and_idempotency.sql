-- Migration: 002_agent_leads_and_idempotency.sql
-- Description: Add agent_leads table, payments idempotency_key, and updated CHECK constraints safely.

-- 1. Create agent_leads table if not already created
CREATE TABLE IF NOT EXISTS agent_leads (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    agent_code VARCHAR(50) NOT NULL,
    applicant_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(150) NOT NULL,
    loan_product VARCHAR(100) NOT NULL,
    requested_amount NUMERIC(15, 2) NOT NULL,
    location VARCHAR(100) DEFAULT 'Kadapa',
    commission_rate_pct NUMERIC(5, 2) DEFAULT 1.00,
    status VARCHAR(30) NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'approved', 'disbursed', 'rejected')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agent_leads_agent ON agent_leads(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_leads_status ON agent_leads(status);

-- 2. Safely add idempotency_key column to payments table if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payments' AND column_name = 'idempotency_key'
    ) THEN
        ALTER TABLE payments ADD COLUMN idempotency_key VARCHAR(100) UNIQUE;
        CREATE INDEX IF NOT EXISTS idx_payments_idempotency ON payments(idempotency_key);
    END IF;
END $$;

-- 3. Safely update kyc_records CHECK constraint to include sandbox_simulated
DO $$
BEGIN
    ALTER TABLE kyc_records DROP CONSTRAINT IF EXISTS kyc_records_verification_status_check;
    ALTER TABLE kyc_records ADD CONSTRAINT kyc_records_verification_status_check 
        CHECK (verification_status IN ('pending', 'under_review', 'verified', 'rejected', 'sandbox_simulated'));
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- 4. Safely update payments CHECK constraint to include DEMO_SUCCESS
DO $$
BEGIN
    ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_status_check;
    ALTER TABLE payments ADD CONSTRAINT payments_status_check 
        CHECK (status IN ('SUCCESS', 'DEMO_SUCCESS', 'PENDING', 'FAILED'));
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;
