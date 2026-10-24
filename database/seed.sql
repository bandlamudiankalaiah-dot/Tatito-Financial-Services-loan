-- ============================================================================
-- TATITO FINANCIAL SERVICES — SEED DATA
-- Default users: Customer (Ramesh), Admin (Ankalaiah), Agent (Siva Reddy), Credit Officer (Lakshmi)
-- Default passwords hashed with bcrypt (Cost factor 10)
-- Password for all seed users: Password@123
-- ============================================================================

-- 1. SEED USERS
-- Password hash below corresponds to 'Password@123'
INSERT INTO users (id, full_name, email, phone, password_hash, role, wallet_balance, is_verified) VALUES
(1, 'Ramesh Kumar Chennur', 'ramesh@tatito.in', '9876543210', '$2b$10$F9I0PKMdgXOuN0sFMywdROEPSHtHtKqF7p2N/vC8/LPDK03VHgQGG', 'customer', 24850.00, true),
(2, 'Ankalaiah Bandlamudi', 'admin@tatitofinance.com', '9440123456', '$2b$10$F9I0PKMdgXOuN0sFMywdROEPSHtHtKqF7p2N/vC8/LPDK03VHgQGG', 'admin', 150000.00, true),
(3, 'Siva Reddy', 'agent@tatito.in', '9440552233', '$2b$10$F9I0PKMdgXOuN0sFMywdROEPSHtHtKqF7p2N/vC8/LPDK03VHgQGG', 'agent', 45000.00, true),
(4, 'Lakshmi Narayana Rao', 'credit@tatito.in', '9440811223', '$2b$10$F9I0PKMdgXOuN0sFMywdROEPSHtHtKqF7p2N/vC8/LPDK03VHgQGG', 'credit_officer', 80000.00, true)
ON CONFLICT (id) DO NOTHING;

ALTER SEQUENCE users_id_seq RESTART WITH 5;

-- 2. SEED USER PROFILES
INSERT INTO user_profiles (user_id, dob, gender, pan_number, aadhaar_last4, address_line1, city, state, pincode, annual_income, bank_account_no, bank_ifsc, bank_name) VALUES
(1, '1988-06-15', 'Male', 'ABCDE1234F', '8821', 'Door 4/218, Trunk Road', 'Kadapa', 'Andhra Pradesh', '516001', 850000.00, '4821', 'SBIN0000840', 'State Bank of India (Kadapa Main)'),
(2, '1980-04-10', 'Male', 'BKLPY9821M', '1102', 'Nagarajupalle Main Road', 'Kadapa', 'Andhra Pradesh', '516002', 1800000.00, '9910', 'HDFC0000182', 'HDFC Bank Kadapa Branch'),
(3, '1985-09-22', 'Male', 'CNMOP4521K', '4410', 'Rayalaseema Complex, Bypass', 'Kadapa', 'Andhra Pradesh', '516004', 650000.00, '3321', 'ICIC0000921', 'ICICI Bank Kadapa'),
(4, '1982-11-05', 'Male', 'DFRTY7712Q', '6620', 'Seven Roads Circle', 'Kadapa', 'Andhra Pradesh', '516001', 1200000.00, '5512', 'ANDB0000214', 'Union Bank of India Kadapa')
ON CONFLICT (user_id) DO NOTHING;

-- 3. SEED KYC RECORDS
INSERT INTO kyc_records (user_id, document_type, document_number_masked, verification_status, remarks) VALUES
(1, 'pan', 'ABCDE****F', 'sandbox_simulated', 'Simulated via Income Tax NSDL KRA Sandbox [Demo]'),
(1, 'aadhaar', 'XXXX-XXXX-8821', 'sandbox_simulated', 'Simulated via UIDAI OTP Sandbox [Demo]'),
(3, 'pan', 'CNMOP****K', 'sandbox_simulated', 'Agent PAN seeded in sandbox mode [Demo]')
ON CONFLICT DO NOTHING;

-- 4. SEED LOAN PRODUCTS (7 Core Fintech Loan Categories)
INSERT INTO loan_products (id, product_code, product_name, min_amount, max_amount, base_interest_rate, min_tenure_months, max_tenure_months, processing_fee_pct, is_secured, description) VALUES
(1, 'PL_UNSECURED', 'Personal Loan', 25000.00, 1000000.00, 14.00, 12, 60, 1.50, false, 'Quick instant funds for medical emergencies, wedding expenses, education or travel.'),
(2, 'BL_GROWTH', 'Business Loan', 100000.00, 5000000.00, 16.00, 12, 84, 1.25, false, 'Collateral-free working capital and inventory credit for MSMEs and retailers in Kadapa.'),
(3, 'GL_EXPRESS', 'Gold Loan (Express Counter)', 10000.00, 2000000.00, 11.00, 3, 36, 0.50, true, 'Immediate cash disbursement against 22K/24K hallmark jewelry with same-day locker custody.'),
(4, 'HL_PRIME', 'Home Loan', 500000.00, 10000000.00, 9.00, 60, 240, 0.50, true, 'Lowest interest financing for purchasing apartments, independent houses or villas.'),
(5, 'VL_AUTO', 'Vehicle Loan', 50000.00, 2000000.00, 10.00, 12, 84, 1.00, true, 'Finance up to 90% on-road cost for new 2-wheelers, commercial vehicles, and passenger cars.'),
(6, 'PLT_OPEN', 'Plot & Land Loan', 200000.00, 5000000.00, 9.75, 36, 180, 0.75, true, 'Loans for purchasing DTCP/APCRDA approved residential and commercial layout plots.'),
(7, 'LAP_SECURED', 'Loan Against Property (LAP)', 500000.00, 15000000.00, 10.50, 36, 180, 0.75, true, 'Unlock liquidity from residential or commercial real estate without selling property.')
ON CONFLICT (id) DO NOTHING;

ALTER SEQUENCE loan_products_id_seq RESTART WITH 8;

-- 5. SEED LOAN APPLICATIONS
INSERT INTO loan_applications (id, application_no, user_id, product_id, applicant_name, phone, email, monthly_income, requested_amount, interest_rate, tenure_months, calculated_emi, purpose, status, officer_remarks, sanctioned_amount) VALUES
(1, 'TF-LN-2026-9481', 1, 2, 'Ramesh Kumar Chennur', '9876543210', 'ramesh@tatito.in', 85000.00, 1500000.00, 16.00, 36, 52758.00, 'Expanding inventory at textile retail showroom in Trunk Road, Kadapa', 'under_review', 'Physical store verification scheduled with field officer.', 1500000.00),
(2, 'TF-LN-2026-8910', 1, 4, 'Srinivasa Rao Giddalur', '9440811223', 'srinivas.g@gmail.com', 120000.00, 4500000.00, 9.00, 180, 45643.00, 'Construction of duplex house in Nagarajupalle, Kadapa', 'submitted', 'Awaiting municipal approved plan deed.', NULL),
(3, 'TF-LN-2025-0814', 1, 3, 'Ramesh Kumar Chennur', '9876543210', 'ramesh@tatito.in', 85000.00, 250000.00, 11.00, 12, 22100.00, 'Short-term store seasonal stock purchase', 'disbursed', 'Sanctioned and disbursed via Kadapa gold desk.', 250000.00)
ON CONFLICT (id) DO NOTHING;

ALTER SEQUENCE loan_applications_id_seq RESTART WITH 4;

-- 6. SEED EMI SCHEDULE (For active Gold Loan #3)
INSERT INTO emi_schedules (application_id, installment_number, due_date, emi_amount, principal_component, interest_component, remaining_balance, payment_status, paid_date) VALUES
(3, 1, '2026-07-20', 22100.00, 19808.00, 2292.00, 230192.00, 'paid', '2026-07-19'),
(3, 2, '2026-08-20', 22100.00, 19990.00, 2110.00, 210202.00, 'paid', '2026-08-18'),
(3, 3, '2026-09-20', 22100.00, 20173.00, 1927.00, 190029.00, 'paid', '2026-09-20'),
(3, 4, '2026-10-20', 22100.00, 20358.00, 1742.00, 169671.00, 'pending', NULL)
ON CONFLICT DO NOTHING;

-- 7. SEED DEMAT ACCOUNTS
INSERT INTO demat_applications (user_id, client_code, dp_id, depository, linked_bank_account, linked_bank_ifsc, status) VALUES
(1, 'TT-KDP-89104', 'IN300128-10049281', 'NSDL', '•••• 4821', 'SBIN0000840', 'active')
ON CONFLICT (user_id) DO NOTHING;

-- 8. SEED MUTUAL FUNDS
INSERT INTO mutual_funds (id, fund_code, fund_name, category, risk_level, cagr_3y, cagr_5y, current_nav, min_sip_amount, fund_size_cr, expense_ratio_pct, fund_manager) VALUES
(1, 'UTI_NIFTY50', 'UTI Nifty 50 Index Fund Direct-Growth', 'Large Cap Index', 'Very High', 16.80, 14.50, 1380.00, 500.00, 18500.00, 0.20, 'Sharwan Kumar Goyal'),
(2, 'PARAG_PARIKH', 'Parag Parikh Flexi Cap Fund Direct-Growth', 'Flexi Cap', 'High', 21.40, 19.80, 82.40, 1000.00, 68000.00, 0.65, 'Rajeev Thakkar'),
(3, 'NIPPON_SMALL', 'Nippon India Small Cap Fund Direct-Growth', 'Small Cap', 'Very High', 28.60, 24.20, 164.20, 500.00, 49000.00, 0.70, 'Samir Rachh'),
(4, 'ICICI_PRU_BAL', 'ICICI Prudential Balanced Advantage Direct-Growth', 'Dynamic Asset Hybrid', 'Moderate', 14.20, 13.10, 71.80, 500.00, 58000.00, 0.85, 'Sankaran Naren'),
(5, 'MIRA_TAX_SAVER', 'Mirae Asset ELSS Tax Saver Direct-Growth', 'ELSS (Section 80C)', 'Very High', 18.90, 17.20, 44.60, 500.00, 24000.00, 0.58, 'Neelesh Surana')
ON CONFLICT (id) DO NOTHING;

ALTER SEQUENCE mutual_funds_id_seq RESTART WITH 6;

-- 9. SEED ACTIVE SIPS
INSERT INTO sips (mandate_ref, user_id, fund_id, monthly_amount, debit_day, next_debit_date, status) VALUES
('SIP-MANDATE-2026-01', 1, 1, 2000.00, 10, '2026-11-10', 'active'),
('SIP-MANDATE-2026-02', 1, 2, 3000.00, 5, '2026-11-05', 'active')
ON CONFLICT DO NOTHING;

-- 10. SEED PORTFOLIO HOLDINGS
INSERT INTO investment_portfolios (user_id, asset_symbol, asset_name, category, quantity, avg_buy_price, current_price, invested_amount, current_valuation) VALUES
(1, 'RELIANCE', 'Reliance Industries Ltd', 'equity', 25, 2850.00, 2945.60, 71250.00, 73640.00),
(1, 'TCS', 'Tata Consultancy Services Ltd', 'equity', 15, 3950.00, 4120.75, 59250.00, 61811.25),
(1, 'UTI_NIFTY50', 'UTI Nifty 50 Index Fund Direct', 'mutual_fund', 124.50, 1200.00, 1380.00, 149400.00, 171810.00),
(1, 'GOLDBEES', 'Nippon India Gold ETF (24K Digital)', 'gold_etf', 1500, 60.00, 68.45, 90000.00, 102675.00),
(1, 'GOI_718_2033', '7.18% GS 2033 Sovereign Bond', 'sovereign_bond', 500, 100.00, 101.40, 50000.00, 50700.00)
ON CONFLICT DO NOTHING;

-- 11. SEED WATCHLIST
INSERT INTO watchlists (user_id, symbol) VALUES
(1, 'RELIANCE'),
(1, 'TCS'),
(1, 'INFY'),
(1, 'HDFCBANK'),
(1, 'GOLDBEES')
ON CONFLICT DO NOTHING;

-- 12. SEED AGENTS
INSERT INTO agents (user_id, agent_code, agency_name, operating_region, commission_rate_pct, total_leads_count, total_disbursed_volume, commission_earned) VALUES
(3, 'TF-DSA-042', 'Rayalaseema Financial Associates', 'Kadapa, Proddatur & Pulivendula', 1.00, 14, 6500000.00, 64500.00)
ON CONFLICT (user_id) DO NOTHING;

-- 13. SEED NOTIFICATIONS
INSERT INTO notifications (user_id, title, message, category, is_read) VALUES
(1, 'Gold Loan EMI Due in 6 Days', 'Your monthly EMI of ₹22,100 for Gold Loan #TF-LN-2025-0814 is due on next Monday.', 'reminder', false),
(1, 'SIP Auto-Debit Mandate Authorized', 'e-Mandate for ₹2,000 in UTI Nifty 50 Index Fund scheduled for 10th of every month.', 'investments', true),
(1, 'Business Loan In Review', 'Application #TF-LN-2026-9481 is assigned to Credit Officer Lakshmi Narayana Rao.', 'loans', true)
ON CONFLICT DO NOTHING;

-- 14. SEED AUDIT LOGS
INSERT INTO audit_logs (actor_id, action_type, entity_name, entity_id, details) VALUES
(2, 'SYSTEM_BOOT', 'system', 'kadapa-hub', '{"event": "Initial system startup with PostgreSQL DDL verification", "branch": "Kadapa Central"}'),
(1, 'LOGIN_SUCCESS', 'user', '1', '{"email": "ramesh@tatito.in", "ip": "127.0.0.1"}')
ON CONFLICT DO NOTHING;

-- 15. SEED AGENT LEADS
INSERT INTO agent_leads (id, agent_id, agent_code, applicant_name, phone, email, loan_product, requested_amount, location, commission_rate_pct, commission_amount, status) VALUES
(1, 3, 'TF-DSA-042', 'Venkata Ramana Reddy', '9440112233', 'ramana.v@gmail.com', 'Business Loan', 1500000.00, 'Kadapa City', 1.00, 15000.00, 'In Review'),
(2, 3, 'TF-DSA-042', 'Kavitha Anjaneyulu', '9848099881', 'kavitha.a@gmail.com', 'Home Loan', 3500000.00, 'Proddatur', 0.40, 14000.00, 'Disbursed'),
(3, 3, 'TF-DSA-042', 'Chandrasekhar Raju', '9440776655', 'raju.c@yahoo.com', 'Personal Loan', 400000.00, 'Pulivendula', 1.25, 5000.00, 'Contacted')
ON CONFLICT (id) DO NOTHING;

ALTER SEQUENCE agent_leads_id_seq RESTART WITH 4;

