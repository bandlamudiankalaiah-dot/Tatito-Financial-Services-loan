-- 004_superapp_schema.sql
-- Tatito Financial Services 2.0 — PhonePe-Inspired Super-App Entities

CREATE TABLE IF NOT EXISTS payment_methods (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  method_type VARCHAR(40) NOT NULL, -- 'bank_account', 'upi_vpa', 'rupay_card'
  provider_name VARCHAR(120) NOT NULL,
  masked_identifier VARCHAR(120) NOT NULL,
  upi_vpa VARCHAR(120),
  is_primary BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payment_transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  transaction_ref VARCHAR(64) UNIQUE NOT NULL,
  direction VARCHAR(20) NOT NULL, -- 'send', 'receive', 'self_transfer', 'qr_pay'
  counterparty_name VARCHAR(120) NOT NULL,
  counterparty_vpa VARCHAR(120) NOT NULL,
  amount NUMERIC(14, 2) NOT NULL,
  payment_mode VARCHAR(40) DEFAULT 'UPI_SANDBOX',
  status VARCHAR(32) DEFAULT 'DEMO_SUCCESS',
  note TEXT,
  refund_status VARCHAR(32) DEFAULT 'NONE',
  is_simulated BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payment_requests (
  id SERIAL PRIMARY KEY,
  requester_user_id INTEGER NOT NULL,
  payer_vpa VARCHAR(120) NOT NULL,
  payer_name VARCHAR(120) NOT NULL,
  amount NUMERIC(14, 2) NOT NULL,
  note TEXT,
  status VARCHAR(32) DEFAULT 'PENDING',
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS qr_codes (
  id SERIAL PRIMARY KEY,
  owner_user_id INTEGER NOT NULL,
  qr_type VARCHAR(32) NOT NULL, -- 'customer_static', 'merchant_static', 'dynamic'
  vpa VARCHAR(120) NOT NULL,
  amount NUMERIC(14, 2),
  reference_code VARCHAR(64) UNIQUE NOT NULL,
  payload_uri TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS merchant_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  business_name VARCHAR(160) NOT NULL,
  category VARCHAR(80) NOT NULL,
  merchant_vpa VARCHAR(120) UNIQUE NOT NULL,
  gstin VARCHAR(32),
  settlement_bank VARCHAR(160),
  kyc_status VARCHAR(32) DEFAULT 'SANDBOX_VERIFIED',
  daily_limit NUMERIC(14, 2) DEFAULT 500000,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS merchant_transactions (
  id SERIAL PRIMARY KEY,
  merchant_id INTEGER NOT NULL,
  transaction_ref VARCHAR(64) UNIQUE NOT NULL,
  customer_name VARCHAR(120) NOT NULL,
  customer_vpa VARCHAR(120) NOT NULL,
  amount NUMERIC(14, 2) NOT NULL,
  settlement_status VARCHAR(32) DEFAULT 'SETTLED_SANDBOX',
  refund_requested BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rewards_accounts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL,
  points_balance INTEGER DEFAULT 1250,
  lifetime_cashback NUMERIC(14, 2) DEFAULT 485.00,
  referral_code VARCHAR(40) UNIQUE NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rewards_transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  reward_type VARCHAR(40) NOT NULL, -- 'points_earned', 'points_redeemed', 'cashback', 'voucher'
  points_delta INTEGER DEFAULT 0,
  cashback_amount NUMERIC(14, 2) DEFAULT 0,
  title VARCHAR(160) NOT NULL,
  expiry_date VARCHAR(40),
  status VARCHAR(32) DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cashback_campaigns (
  id SERIAL PRIMARY KEY,
  campaign_code VARCHAR(40) UNIQUE NOT NULL,
  title VARCHAR(160) NOT NULL,
  category VARCHAR(60) NOT NULL,
  reward_rule TEXT NOT NULL,
  max_cashback NUMERIC(10, 2) NOT NULL,
  min_transaction NUMERIC(10, 2) NOT NULL,
  valid_until VARCHAR(40) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS referral_transactions (
  id SERIAL PRIMARY KEY,
  referrer_user_id INTEGER NOT NULL,
  referred_name VARCHAR(120) NOT NULL,
  referred_mobile VARCHAR(24) NOT NULL,
  reward_points INTEGER DEFAULT 250,
  status VARCHAR(32) DEFAULT 'CREDITED_DEMO',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recurring_mandates (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  mandate_ref VARCHAR(64) UNIQUE NOT NULL,
  biller_or_payee VARCHAR(160) NOT NULL,
  category VARCHAR(60) NOT NULL, -- 'loan_emi', 'sip', 'utility_bill', 'subscription'
  amount NUMERIC(14, 2) NOT NULL,
  frequency VARCHAR(32) DEFAULT 'MONTHLY',
  next_Trigger_date VARCHAR(40) NOT NULL,
  status VARCHAR(32) DEFAULT 'ACTIVE', -- 'ACTIVE', 'PAUSED', 'CANCELLED'
  consent_verified BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS budgets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  category VARCHAR(60) NOT NULL,
  monthly_limit NUMERIC(14, 2) NOT NULL,
  spent_amount NUMERIC(14, 2) DEFAULT 0,
  month_year VARCHAR(16) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS savings_goals (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  goal_name VARCHAR(120) NOT NULL,
  target_amount NUMERIC(14, 2) NOT NULL,
  current_amount NUMERIC(14, 2) DEFAULT 0,
  target_date VARCHAR(40) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS expense_groups (
  id SERIAL PRIMARY KEY,
  creator_user_id INTEGER NOT NULL,
  group_name VARCHAR(120) NOT NULL,
  members_json TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS group_expenses (
  id SERIAL PRIMARY KEY,
  group_id INTEGER NOT NULL,
  title VARCHAR(160) NOT NULL,
  total_amount NUMERIC(14, 2) NOT NULL,
  paid_by VARCHAR(120) NOT NULL,
  split_type VARCHAR(32) DEFAULT 'EQUAL', -- 'EQUAL', 'CUSTOM'
  splits_json TEXT NOT NULL,
  status VARCHAR(32) DEFAULT 'OPEN', -- 'OPEN', 'SETTLED'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS insurance_products (
  id SERIAL PRIMARY KEY,
  product_code VARCHAR(40) UNIQUE NOT NULL,
  category VARCHAR(60) NOT NULL, -- 'Health', 'Life', 'Motor', 'Travel', 'Accident'
  plan_name VARCHAR(160) NOT NULL,
  partner_insurer VARCHAR(120) NOT NULL,
  sum_insured NUMERIC(14, 2) NOT NULL,
  annual_premium NUMERIC(10, 2) NOT NULL,
  coverage_highlights TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS insurance_applications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  product_code VARCHAR(40) NOT NULL,
  insured_name VARCHAR(120) NOT NULL,
  nominee_name VARCHAR(120) NOT NULL,
  premium_amount NUMERIC(10, 2) NOT NULL,
  status VARCHAR(32) DEFAULT 'SANDBOX_ISSUED',
  policy_ref VARCHAR(64) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gold_transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  tx_type VARCHAR(16) NOT NULL, -- 'BUY', 'SELL', 'SIP'
  grams NUMERIC(10, 4) NOT NULL,
  rate_per_gram NUMERIC(10, 2) NOT NULL,
  total_amount NUMERIC(14, 2) NOT NULL,
  reference_no VARCHAR(64) UNIQUE NOT NULL,
  is_simulated BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS travel_bookings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  mode VARCHAR(32) NOT NULL, -- 'Flight', 'Bus', 'Train', 'Hotel'
  operator_name VARCHAR(120) NOT NULL,
  origin VARCHAR(80) NOT NULL,
  destination VARCHAR(80) NOT NULL,
  travel_date VARCHAR(40) NOT NULL,
  passengers INTEGER DEFAULT 1,
  fare_amount NUMERIC(12, 2) NOT NULL,
  pnr_reference VARCHAR(40) UNIQUE NOT NULL,
  status VARCHAR(32) DEFAULT 'CONFIRMED_DEMO',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS support_tickets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  ticket_no VARCHAR(40) UNIQUE NOT NULL,
  category VARCHAR(60) NOT NULL, -- 'Payment Dispute', 'Loan Support', 'Refund Request', 'KYC / Document'
  subject VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  transaction_ref VARCHAR(64),
  status VARCHAR(32) DEFAULT 'OPEN', -- 'OPEN', 'IN_PROGRESS', 'RESOLVED'
  resolution_note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
