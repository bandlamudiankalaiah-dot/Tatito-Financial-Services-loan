import 'dotenv/config';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

// PostgreSQL configuration detection (filter out dummy/placeholder values like 'base' or '123')
function isValidPgHost(host?: string): boolean {
  if (!host) return false;
  const h = host.trim().toLowerCase();
  const invalidPlaceholders = new Set(['', '123', 'undefined', 'null', 'base', 'host', 'localhost', 'example', 'your_host']);
  return !invalidPlaceholders.has(h);
}

function isValidDatabaseUrl(url?: string): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  if (!trimmed.startsWith('postgres://') && !trimmed.startsWith('postgresql://')) return false;
  try {
    const parsed = new URL(trimmed);
    return isValidPgHost(parsed.hostname);
  } catch {
    return false;
  }
}

// Sanitize invalid placeholder env vars so node-postgres (pg) does not read bogus defaults (e.g. 'base')
if (!isValidPgHost(process.env.PGHOST)) {
  delete process.env.PGHOST;
}
if (!isValidPgHost(process.env.SQL_HOST)) {
  delete process.env.SQL_HOST;
}
if (!isValidDatabaseUrl(process.env.DATABASE_URL)) {
  delete process.env.DATABASE_URL;
}

const isPostgresConfigured = Boolean(
  isValidDatabaseUrl(process.env.DATABASE_URL) ||
  isValidPgHost(process.env.PGHOST) ||
  isValidPgHost(process.env.SQL_HOST)
);

let pool: Pool | null = null;
let postgresConnected = false;

if (isPostgresConfigured) {
  try {
    pool = new Pool({
      connectionString: isValidDatabaseUrl(process.env.DATABASE_URL) ? process.env.DATABASE_URL : undefined,
      host: isValidPgHost(process.env.PGHOST) ? process.env.PGHOST : (isValidPgHost(process.env.SQL_HOST) ? process.env.SQL_HOST : undefined),
      port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432,
      user: process.env.PGUSER || process.env.SQL_USER || 'postgres',
      password: process.env.PGPASSWORD || process.env.SQL_PASSWORD || 'postgres',
      database: process.env.PGDATABASE || process.env.SQL_DB_NAME || 'tatito_finance',
      max: 10,
      min: 1,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 3000,
    });

    pool.on('error', (err) => {
      console.warn('[PostgreSQL Pool Notice]', err.message);
      postgresConnected = false;
    });
  } catch (err) {
    console.warn('[PostgreSQL Init Notice] Falling back to file/memory storage:', err);
    pool = null;
  }
}

// In-Memory / File Persistent Relational Store (Fallback & Local Prototyping)
const FALLBACK_DB_PATH = path.resolve(process.cwd(), 'tatito_relational_db.json');

export interface RelationalDBState {
  users: any[];
  user_profiles: any[];
  kyc_records: any[];
  loan_products: any[];
  loan_applications: any[];
  loan_documents: any[];
  collateral_details: any[];
  guarantors: any[];
  loan_sanctions: any[];
  disbursements: any[];
  emi_schedules: any[];
  payments: any[];
  demat_applications: any[];
  investment_portfolios: any[];
  watchlists: any[];
  stock_orders: any[];
  mutual_funds: any[];
  mutual_fund_orders: any[];
  sips: any[];
  notifications: any[];
  agents: any[];
  agent_leads: any[];
  audit_logs: any[];
  wallet_transactions?: any[];
}

function getInitialRelationalDB(): RelationalDBState {
  return {
    users: [
      {
        id: 1,
        full_name: 'Ramesh Kumar Chennur',
        email: 'ramesh@tatito.in',
        phone: '9876543210',
        password_hash: '$2b$10$F9I0PKMdgXOuN0sFMywdROEPSHtHtKqF7p2N/vC8/LPDK03VHgQGG', // Password@123
        role: 'customer',
        wallet_balance: 24850.00,
        is_active: true,
        is_verified: true,
        created_at: new Date('2025-04-12T10:00:00Z').toISOString()
      },
      {
        id: 2,
        full_name: 'Ankalaiah Bandlamudi',
        email: 'admin@tatitofinance.com',
        phone: '9440123456',
        password_hash: '$2b$10$F9I0PKMdgXOuN0sFMywdROEPSHtHtKqF7p2N/vC8/LPDK03VHgQGG', // Password@123
        role: 'admin',
        wallet_balance: 150000.00,
        is_active: true,
        is_verified: true,
        created_at: new Date('2024-01-01T09:00:00Z').toISOString()
      },
      {
        id: 3,
        full_name: 'Siva Reddy',
        email: 'agent@tatito.in',
        phone: '9440552233',
        password_hash: '$2b$10$F9I0PKMdgXOuN0sFMywdROEPSHtHtKqF7p2N/vC8/LPDK03VHgQGG', // Password@123
        role: 'agent',
        wallet_balance: 45000.00,
        is_active: true,
        is_verified: true,
        created_at: new Date('2025-02-15T09:00:00Z').toISOString()
      },
      {
        id: 4,
        full_name: 'Lakshmi Narayana Rao',
        email: 'credit@tatito.in',
        phone: '9440811223',
        password_hash: '$2b$10$F9I0PKMdgXOuN0sFMywdROEPSHtHtKqF7p2N/vC8/LPDK03VHgQGG', // Password@123
        role: 'credit_officer',
        wallet_balance: 80000.00,
        is_active: true,
        is_verified: true,
        created_at: new Date('2024-06-01T09:00:00Z').toISOString()
      },
      {
        id: 5,
        full_name: 'M/s. Tatito Projects — Super Admin',
        email: 'superadmin@tatitofinance.com',
        phone: '9440999999',
        password_hash: '$2b$10$F9I0PKMdgXOuN0sFMywdROEPSHtHtKqF7p2N/vC8/LPDK03VHgQGG', // Password@123
        role: 'super_admin',
        wallet_balance: 500000.00,
        is_active: true,
        is_verified: true,
        created_at: new Date('2024-01-01T08:00:00Z').toISOString()
      }
    ],
    user_profiles: [
      {
        user_id: 1,
        dob: '1988-06-15',
        gender: 'Male',
        pan_number: 'ABCDE1234F',
        aadhaar_last4: '8821',
        address_line1: 'Door 4/218, Trunk Road',
        city: 'Kadapa',
        state: 'Andhra Pradesh',
        pincode: '516001',
        annual_income: 850000.00,
        bank_account_no: '•••• 4821',
        bank_ifsc: 'SBIN0000840',
        bank_name: 'State Bank of India (Kadapa Main)'
      }
    ],
    kyc_records: [
      {
        id: 1,
        user_id: 1,
        document_type: 'pan',
        document_number_masked: 'ABCDE****F',
        verification_status: 'sandbox_simulated',
        verification_provider: 'DigiLocker / NSDL KRA Sandbox',
        verified_at: new Date().toISOString(),
        remarks: 'Simulated via Income Tax NSDL KRA Sandbox [Demo]'
      },
      {
        id: 2,
        user_id: 1,
        document_type: 'aadhaar',
        document_number_masked: 'XXXX-XXXX-8821',
        verification_status: 'sandbox_simulated',
        verification_provider: 'UIDAI OTP Sandbox',
        verified_at: new Date().toISOString(),
        remarks: 'Simulated via UIDAI OTP Sandbox [Demo]'
      }
    ],
    loan_products: [
      { id: 1, product_code: 'PL_UNSECURED', product_name: 'Personal Loan', min_amount: 25000, max_amount: 1000000, base_interest_rate: 14.0, min_tenure_months: 12, max_tenure_months: 60, is_secured: false, description: 'Quick credit for emergency, wedding or travel' },
      { id: 2, product_code: 'BL_GROWTH', product_name: 'Business Loan', min_amount: 100000, max_amount: 5000000, base_interest_rate: 16.0, min_tenure_months: 12, max_tenure_months: 84, is_secured: false, description: 'Working capital and inventory expansion for Kadapa MSMEs' },
      { id: 3, product_code: 'GL_EXPRESS', product_name: 'Gold Loan', min_amount: 10000, max_amount: 2000000, base_interest_rate: 11.0, min_tenure_months: 3, max_tenure_months: 36, is_secured: true, description: 'Immediate disbursement against hallmark gold' },
      { id: 4, product_code: 'HL_PRIME', product_name: 'Home Loan', min_amount: 500000, max_amount: 10000000, base_interest_rate: 9.0, min_tenure_months: 60, max_tenure_months: 240, is_secured: true, description: 'Financing for purchasing apartments or villas' },
      { id: 5, product_code: 'VL_AUTO', product_name: 'Vehicle Loan', min_amount: 50000, max_amount: 2000000, base_interest_rate: 10.0, min_tenure_months: 12, max_tenure_months: 84, is_secured: true, description: 'Finance up to 90% on-road cost' },
      { id: 6, product_code: 'PLT_OPEN', product_name: 'Plot Loan', min_amount: 200000, max_amount: 5000000, base_interest_rate: 9.75, min_tenure_months: 36, max_tenure_months: 180, is_secured: true, description: 'DTCP/APCRDA approved plot purchase' },
      { id: 7, product_code: 'LAP_SECURED', product_name: 'Loan Against Property', min_amount: 500000, max_amount: 15000000, base_interest_rate: 10.5, min_tenure_months: 36, max_tenure_months: 180, is_secured: true, description: 'Unlock real estate value' }
    ],
    loan_applications: [
      {
        id: 1,
        application_no: 'TF-LN-2026-9481',
        user_id: 1,
        product_id: 2,
        product_name: 'Business Loan',
        applicant_name: 'Ramesh Kumar Chennur',
        phone: '9876543210',
        email: 'ramesh@tatito.in',
        monthly_income: 85000,
        requested_amount: 1500000,
        interest_rate: 16.0,
        tenure_months: 36,
        calculated_emi: 52758,
        purpose: 'Expanding inventory at textile retail showroom in Trunk Road, Kadapa',
        status: 'under_review',
        credit_score: 754,
        officer_remarks: 'Physical store verification scheduled with field officer.',
        sanctioned_amount: 1500000,
        created_at: '2026-10-12T14:30:00Z'
      },
      {
        id: 2,
        application_no: 'TF-LN-2026-8910',
        user_id: 1,
        product_id: 4,
        product_name: 'Home Loan',
        applicant_name: 'Srinivasa Rao Giddalur',
        phone: '9440811223',
        email: 'srinivas.g@gmail.com',
        monthly_income: 120000,
        requested_amount: 4500000,
        interest_rate: 9.0,
        tenure_months: 180,
        calculated_emi: 45643,
        purpose: 'Construction of duplex house in Nagarajupalle, Kadapa',
        status: 'submitted',
        credit_score: 720,
        officer_remarks: 'Awaiting municipal approved plan deed.',
        created_at: '2026-10-14T09:15:00Z'
      },
      {
        id: 3,
        application_no: 'TF-LN-2025-0814',
        user_id: 1,
        product_id: 3,
        product_name: 'Gold Loan',
        applicant_name: 'Ramesh Kumar Chennur',
        phone: '9876543210',
        email: 'ramesh@tatito.in',
        monthly_income: 85000,
        requested_amount: 250000,
        interest_rate: 11.0,
        tenure_months: 12,
        calculated_emi: 22100,
        purpose: 'Seasonal store inventory',
        status: 'disbursed',
        credit_score: 760,
        officer_remarks: 'Disbursed via Kadapa gold desk.',
        sanctioned_amount: 250000,
        created_at: '2025-06-15T10:00:00Z'
      }
    ],
    loan_documents: [],
    collateral_details: [],
    guarantors: [],
    loan_sanctions: [],
    disbursements: [],
    emi_schedules: [
      { id: 1, application_id: 3, installment_number: 1, due_date: '2026-07-20', emi_amount: 22100, principal_component: 19808, interest_component: 2292, remaining_balance: 230192, payment_status: 'paid', paid_date: '2026-07-19' },
      { id: 2, application_id: 3, installment_number: 2, due_date: '2026-08-20', emi_amount: 22100, principal_component: 19990, interest_component: 2110, remaining_balance: 210202, payment_status: 'paid', paid_date: '2026-08-18' },
      { id: 3, application_id: 3, installment_number: 3, due_date: '2026-09-20', emi_amount: 22100, principal_component: 20173, interest_component: 1927, remaining_balance: 190029, payment_status: 'paid', paid_date: '2026-09-20' },
      { id: 4, application_id: 3, installment_number: 4, due_date: '2026-10-20', emi_amount: 22100, principal_component: 20358, interest_component: 1742, remaining_balance: 169671, payment_status: 'pending', paid_date: null }
    ],
    payments: [
      {
        id: 1,
        payment_ref: 'TT-TXN-20261010-4102',
        bbps_ref_no: 'BBPS9081245102',
        user_id: 1,
        payment_category: 'electricity',
        operator_name: 'APSPDCL (Southern Power AP)',
        account_identifier: '1009823412034',
        amount: 1420.00,
        payment_mode: 'wallet',
        status: 'SUCCESS',
        created_at: '2026-10-10T16:20:00Z'
      }
    ],
    demat_applications: [
      {
        id: 1,
        user_id: 1,
        client_code: 'TT-KDP-89104',
        dp_id: 'IN300128-10049281',
        depository: 'NSDL',
        linked_bank_account: '•••• 4821',
        linked_bank_ifsc: 'SBIN0000840',
        status: 'active',
        created_at: '2025-05-10T10:00:00Z'
      }
    ],
    investment_portfolios: [
      { id: 1, user_id: 1, asset_symbol: 'RELIANCE', asset_name: 'Reliance Industries Ltd', category: 'equity', quantity: 25, avg_buy_price: 2850, current_price: 2945.60, invested_amount: 71250, current_valuation: 73640 },
      { id: 2, user_id: 1, asset_symbol: 'TCS', asset_name: 'Tata Consultancy Services Ltd', category: 'equity', quantity: 15, avg_buy_price: 3950, current_price: 4120.75, invested_amount: 59250, current_valuation: 61811.25 },
      { id: 3, user_id: 1, asset_symbol: 'UTI_NIFTY50', asset_name: 'UTI Nifty 50 Index Fund Direct', category: 'mutual_fund', quantity: 124.5, avg_buy_price: 1200, current_price: 1380, invested_amount: 149400, current_valuation: 171810 },
      { id: 4, user_id: 1, asset_symbol: 'GOLDBEES', asset_name: 'Nippon India Gold ETF (24K)', category: 'gold_etf', quantity: 1500, avg_buy_price: 60, current_price: 68.45, invested_amount: 90000, current_valuation: 102675 },
      { id: 5, user_id: 1, asset_symbol: 'GOI_718_2033', asset_name: '7.18% GS 2033 Sovereign Bond', category: 'sovereign_bond', quantity: 500, avg_buy_price: 100, current_price: 101.40, invested_amount: 50000, current_valuation: 50700 }
    ],
    watchlists: [
      { id: 1, user_id: 1, symbol: 'RELIANCE', added_at: new Date().toISOString() },
      { id: 2, user_id: 1, symbol: 'TCS', added_at: new Date().toISOString() },
      { id: 3, user_id: 1, symbol: 'GOLDBEES', added_at: new Date().toISOString() }
    ],
    stock_orders: [
      {
        id: 1,
        order_ref: 'NSE-SIM-20261011',
        user_id: 1,
        symbol: 'RELIANCE',
        order_type: 'BUY',
        quantity: 25,
        executed_price: 2850.00,
        total_order_value: 71250.00,
        status: 'EXECUTED',
        is_simulated: true,
        created_at: '2026-10-11T10:15:00Z'
      },
      {
        id: 2,
        order_ref: 'NSE-SIM-20261012',
        user_id: 1,
        symbol: 'TCS',
        order_type: 'BUY',
        quantity: 15,
        executed_price: 3950.00,
        total_order_value: 59250.00,
        status: 'EXECUTED',
        is_simulated: true,
        created_at: '2026-10-12T11:30:00Z'
      }
    ],
    mutual_funds: [
      { id: 1, fund_code: 'UTI_NIFTY50', fund_name: 'UTI Nifty 50 Index Fund Direct-Growth', fund_house: 'UTI Mutual Fund', category: 'Large Cap Index', risk_level: 'Very High', cagr_1y: 19.4, cagr_3y: 16.8, cagr_5y: 14.5, current_nav: 1380.00, nav: 1380.00, min_sip_amount: 500, fund_size_cr: 18500, aum_cr: 18500, expense_ratio_pct: 0.20, expense_ratio: 0.20, fund_manager: 'Sharwan Kumar Goyal' },
      { id: 2, fund_code: 'PARAG_PARIKH', fund_name: 'Parag Parikh Flexi Cap Fund Direct-Growth', fund_house: 'PPFAS Mutual Fund', category: 'Flexi Cap', risk_level: 'High', cagr_1y: 24.1, cagr_3y: 21.4, cagr_5y: 19.8, current_nav: 82.40, nav: 82.40, min_sip_amount: 1000, fund_size_cr: 68000, aum_cr: 68000, expense_ratio_pct: 0.65, expense_ratio: 0.65, fund_manager: 'Rajeev Thakkar' },
      { id: 3, fund_code: 'NIPPON_SMALL', fund_name: 'Nippon India Small Cap Fund Direct-Growth', fund_house: 'Nippon India Mutual Fund', category: 'Small Cap', risk_level: 'Very High', cagr_1y: 31.2, cagr_3y: 28.6, cagr_5y: 24.2, current_nav: 164.20, nav: 164.20, min_sip_amount: 500, fund_size_cr: 49000, aum_cr: 49000, expense_ratio_pct: 0.70, expense_ratio: 0.70, fund_manager: 'Samir Rachh' },
      { id: 4, fund_code: 'ICICI_PRU_BAL', fund_name: 'ICICI Prudential Balanced Advantage Direct-Growth', fund_house: 'ICICI Prudential AMC', category: 'Dynamic Asset Hybrid', risk_level: 'Moderate', cagr_1y: 15.6, cagr_3y: 14.2, cagr_5y: 13.1, current_nav: 71.80, nav: 71.80, min_sip_amount: 500, fund_size_cr: 58000, aum_cr: 58000, expense_ratio_pct: 0.85, expense_ratio: 0.85, fund_manager: 'Sankaran Naren' },
      { id: 5, fund_code: 'MIRA_TAX_SAVER', fund_name: 'Mirae Asset ELSS Tax Saver Direct-Growth', fund_house: 'Mirae Asset Investment Managers', category: 'ELSS (Section 80C)', risk_level: 'Very High', cagr_1y: 21.5, cagr_3y: 18.9, cagr_5y: 17.2, current_nav: 44.60, nav: 44.60, min_sip_amount: 500, fund_size_cr: 24000, aum_cr: 24000, expense_ratio_pct: 0.58, expense_ratio: 0.58, fund_manager: 'Neelesh Surana' }
    ],
    mutual_fund_orders: [],
    sips: [
      { id: 1, mandate_ref: 'SIP-MANDATE-2026-01', user_id: 1, fund_id: 1, monthly_amount: 2000, debit_day: 10, next_debit_date: '2026-11-10', status: 'active' },
      { id: 2, mandate_ref: 'SIP-MANDATE-2026-02', user_id: 1, fund_id: 2, monthly_amount: 3000, debit_day: 5, next_debit_date: '2026-11-05', status: 'active' }
    ],
    notifications: [
      { id: 1, user_id: 1, title: 'Gold Loan EMI Due in 6 Days', message: 'Your monthly EMI of ₹22,100 for Gold Loan #TF-LN-2025-0814 is due on next Monday.', category: 'reminder', is_read: false, created_at: '2026-10-14T08:00:00Z' },
      { id: 2, user_id: 1, title: 'SIP Auto-Debit Mandate Authorized', message: 'e-Mandate for ₹2,000 in UTI Nifty 50 Index Fund scheduled for 10th of every month.', category: 'investments', is_read: true, created_at: '2026-10-10T12:00:00Z' },
      { id: 3, user_id: 1, title: 'Business Loan In Review', message: 'Application #TF-LN-2026-9481 is assigned to Credit Officer Lakshmi Narayana Rao.', category: 'loans', is_read: true, created_at: '2026-10-12T16:00:00Z' }
    ],
    agents: [
      {
        id: 1,
        user_id: 3,
        agent_code: 'TF-DSA-042',
        agency_name: 'Rayalaseema Financial Associates',
        operating_region: 'Kadapa, Proddatur & Pulivendula',
        commission_rate_pct: 1.00,
        total_leads_count: 14,
        total_disbursed_volume: 6500000.00,
        commission_earned: 64500.00,
        status: 'active'
      }
    ],
    agent_leads: [
      {
        id: 1,
        agent_id: 3,
        agent_code: 'TF-DSA-042',
        applicant_name: 'Venkata Ramana Reddy',
        phone: '9440112233',
        email: 'ramana.v@gmail.com',
        loan_product: 'Business Loan',
        requested_amount: 1500000.00,
        location: 'Kadapa City',
        commission_rate_pct: 1.00,
        commission_amount: 15000.00,
        status: 'In Review',
        notes: 'Kadapa MSME textile store owner expansion',
        created_at: '2026-10-15'
      },
      {
        id: 2,
        agent_id: 3,
        agent_code: 'TF-DSA-042',
        applicant_name: 'Kavitha Anjaneyulu',
        phone: '9848099881',
        email: 'kavitha.a@gmail.com',
        loan_product: 'Home Loan',
        requested_amount: 3500000.00,
        location: 'Proddatur',
        commission_rate_pct: 0.40,
        commission_amount: 14000.00,
        status: 'Disbursed',
        notes: 'Villa purchase in Proddatur RTC Colony',
        created_at: '2026-10-10'
      },
      {
        id: 3,
        agent_id: 3,
        agent_code: 'TF-DSA-042',
        applicant_name: 'Chandrasekhar Raju',
        phone: '9440776655',
        email: 'raju.c@yahoo.com',
        loan_product: 'Personal Loan',
        requested_amount: 400000.00,
        location: 'Pulivendula',
        commission_rate_pct: 1.25,
        commission_amount: 5000.00,
        status: 'Contacted',
        notes: 'Medical emergency enquiry in Pulivendula',
        created_at: '2026-10-18'
      }
    ],
    audit_logs: [
      {
        id: 1,
        actor_id: 2,
        action_type: 'SYSTEM_BOOT',
        entity_name: 'system',
        entity_id: 'kadapa-hub',
        details: { event: 'Node.js Express relational engine started' },
        created_at: new Date().toISOString()
      }
    ],
    wallet_transactions: [
      {
        id: 1,
        user_id: 1,
        transaction_type: 'credit',
        amount: 26270.00,
        balance_after: 26270.00,
        description: 'Initial Wallet Credit via UPI Sandbox (ramesh@okaxis)',
        reference_id: 'WAL-INIT-20261001',
        created_at: '2026-10-01T10:00:00Z'
      },
      {
        id: 2,
        user_id: 1,
        transaction_type: 'debit',
        amount: 1420.00,
        balance_after: 24850.00,
        description: 'BBPS Utility Bill Payment - APSPDCL (Southern Power AP)',
        reference_id: 'TT-TXN-20261010-4102',
        created_at: '2026-10-10T16:20:00Z'
      }
    ]
  };
}

export function loadRelationalDB(): RelationalDBState {
  const init = getInitialRelationalDB();
  try {
    if (fs.existsSync(FALLBACK_DB_PATH)) {
      const data = fs.readFileSync(FALLBACK_DB_PATH, 'utf8');
      const parsed = JSON.parse(data);
      if (!parsed.agent_leads) {
        parsed.agent_leads = init.agent_leads;
      }
      if (!parsed.wallet_transactions) {
        parsed.wallet_transactions = init.wallet_transactions;
      }
      if (parsed.users) {
        const seedSuper = init.users.find(u => u.email === 'superadmin@tatitofinance.com');
        const existingSuper = parsed.users.find((u: any) => u.email === 'superadmin@tatitofinance.com');
        if (!existingSuper && seedSuper) {
          const maxId = parsed.users.reduce((max: number, u: any) => Math.max(max, u.id || 0), 0);
          parsed.users.push({ ...seedSuper, id: Math.max(5, maxId + 1) });
          saveRelationalDB(parsed);
        } else if (existingSuper) {
          existingSuper.role = 'super_admin';
          existingSuper.is_active = true;
          const colliding = parsed.users.filter((u: any) => u.id === existingSuper.id);
          if (colliding.length > 1) {
            const maxId = parsed.users.reduce((max: number, u: any) => Math.max(max, u.id || 0), 0);
            existingSuper.id = maxId + 1;
            saveRelationalDB(parsed);
          }
        }
      }
      if (parsed.mutual_funds) {
        parsed.mutual_funds = parsed.mutual_funds.map((f: any) => {
          const seedFund = init.mutual_funds.find(sf => sf.id === f.id);
          return { ...seedFund, ...f, nav: f.nav ?? f.current_nav, aum_cr: f.aum_cr ?? f.fund_size_cr, expense_ratio: f.expense_ratio ?? f.expense_ratio_pct, cagr_1y: f.cagr_1y ?? seedFund?.cagr_1y ?? 18.0, fund_house: f.fund_house ?? seedFund?.fund_house ?? 'Direct AMC' };
        });
      }
      return parsed;
    }
  } catch (e) {
    console.error('Error loading fallback relational DB:', e);
  }
  saveRelationalDB(init);
  return init;
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function isDemoMode(): boolean {
  return process.env.DATA_STORE_MODE === 'demo';
}

export function saveRelationalDB(state: RelationalDBState) {
  // Never save to JSON in production or when demo mode is not explicitly enabled
  if (isProduction() || process.env.DATA_STORE_MODE !== 'demo') {
    return;
  }
  try {
    fs.writeFileSync(FALLBACK_DB_PATH, JSON.stringify(state, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving fallback relational DB:', e);
  }
}

export const relationalDB = loadRelationalDB();

// Fail-safe and mode checkers
export class DatabaseUnavailableError extends Error {
  statusCode: number;
  constructor(message = 'PostgreSQL database is currently unavailable in production mode. Data mutations are disabled.') {
    super(message);
    this.name = 'DatabaseUnavailableError';
    this.statusCode = 503;
  }
}

export function checkDatabaseAccess() {
  if (isProduction()) {
    if (!postgresConnected && !(process.env.VERCEL === '1' && process.env.DATA_STORE_MODE === 'demo')) {
      throw new DatabaseUnavailableError('PostgreSQL database is required in production mode and is currently unavailable.');
    }
  } else if (!postgresConnected && process.env.DATA_STORE_MODE !== 'demo') {
    if (process.env.NODE_ENV !== 'test') {
      console.warn('[Data Store] Operating on in-memory storage without explicit DATA_STORE_MODE=demo');
    }
  }
}

// Track PostgreSQL status
export function isPostgresConnected(): boolean {
  return postgresConnected;
}

// Set connection state manually (useful for tests)
export function setPostgresConnectedForTesting(status: boolean) {
  postgresConnected = status;
}

// Node-compatible sequential migration runner
export async function runMigrations(pgPool: Pool): Promise<string[]> {
  const client = await pgPool.connect();
  try {
    // 1. Ensure schema_migrations table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        version VARCHAR(100) UNIQUE NOT NULL,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const appliedRes = await client.query('SELECT version FROM schema_migrations');
    const appliedSet = new Set(appliedRes.rows.map((r: any) => r.version));
    const migrationsDir = path.resolve(process.cwd(), 'database/migrations');
    const appliedThisRun: string[] = [];

    if (fs.existsSync(migrationsDir)) {
      const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
      for (const file of files) {
        if (!appliedSet.has(file)) {
          console.log(`[PostgreSQL Migration] Applying migration: ${file}...`);
          const filePath = path.join(migrationsDir, file);
          let rawSql = fs.readFileSync(filePath, 'utf8');

          // Safely resolve any \\i directives into the included SQL content for Node.js pg compatibility
          const lines = rawSql.split('\n');
          const resolvedLines: string[] = [];
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('\\i ')) {
              const relPath = trimmed.slice(3).trim();
              const incPath = path.resolve(process.cwd(), relPath);
              if (fs.existsSync(incPath)) {
                resolvedLines.push(fs.readFileSync(incPath, 'utf8'));
              } else {
                console.warn(`[Migration Warning] Include path not found: ${relPath}`);
              }
            } else {
              resolvedLines.push(line);
            }
          }
          const finalSql = resolvedLines.join('\n');

          await client.query('BEGIN');
          try {
            await client.query(finalSql);
            await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [file]);
            await client.query('COMMIT');
            appliedThisRun.push(file);
            console.log(`[PostgreSQL Migration] Successfully applied: ${file}`);
          } catch (migErr: any) {
            await client.query('ROLLBACK');
            console.error(`[PostgreSQL Migration] Error in ${file}:`, migErr.message);
            throw migErr;
          }
        }
      }
    }
    return appliedThisRun;
  } finally {
    client.release();
  }
}

// Startup connection verification and schema initialization
export async function initPostgres(): Promise<boolean> {
  if (!pool) {
    postgresConnected = false;
    return false;
  }
  try {
    const testResult = await pool.query('SELECT NOW() as server_time');
    postgresConnected = true;
    console.log('[PostgreSQL] Connected successfully at:', testResult.rows[0]?.server_time);

    // Run all unapplied sequential migrations
    await runMigrations(pool);
    return true;
  } catch (err: any) {
    postgresConnected = false;
    if (isProduction()) {
      console.error('[PostgreSQL Connection Error in Production]:', err.message);
    } else {
      console.warn('[PostgreSQL Connection Notice] Operating on fallback store:', err.message);
    }
    return false;
  }
}

// Global parameterized query executor
export async function dbQuery(text: string, params: any[] = []): Promise<{ rows: any[]; rowCount: number }> {
  checkDatabaseAccess();
  if (pool && postgresConnected) {
    try {
      const res = await pool.query(text, params);
      return { rows: res.rows, rowCount: res.rowCount || 0 };
    } catch (e: any) {
      console.warn('PostgreSQL query execution error:', e.message);
      throw e;
    }
  }
  return { rows: [], rowCount: 0 };
}

// Unified Repository Layer for persistent operations
export const dbRepository = {
  users: {
    async findByEmail(email: string) {
      checkDatabaseAccess();
      const cleanEmail = email.toLowerCase().trim();
      if (postgresConnected) {
        const res = await dbQuery('SELECT * FROM users WHERE LOWER(email) = $1 LIMIT 1', [cleanEmail]);
        if (res.rows.length > 0) return res.rows[0];
        return null;
      }
      return relationalDB.users.find(u => u.email.toLowerCase() === cleanEmail) || null;
    },
    async findById(id: number) {
      checkDatabaseAccess();
      if (postgresConnected) {
        const res = await dbQuery('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);
        if (res.rows.length > 0) return res.rows[0];
        return null;
      }
      return relationalDB.users.find(u => u.id === id) || null;
    },
    async getAll(roleFilter?: string) {
      checkDatabaseAccess();
      if (postgresConnected) {
        let query = 'SELECT id, full_name, email, phone, role, wallet_balance, is_active, is_verified, created_at FROM users';
        const params: any[] = [];
        if (roleFilter) {
          query += ' WHERE role = $1';
          params.push(roleFilter);
        }
        query += ' ORDER BY id ASC';
        const res = await dbQuery(query, params);
        return res.rows;
      }
      let list = relationalDB.users;
      if (roleFilter) list = list.filter(u => u.role === roleFilter);
      return list.map(({ password_hash: _, ...safe }) => safe);
    },
    async create(user: { full_name: string; email: string; phone: string; password_hash: string; role: string; wallet_balance?: number }) {
      checkDatabaseAccess();
      if (postgresConnected) {
        const res = await dbQuery(
          `INSERT INTO users (full_name, email, phone, password_hash, role, wallet_balance, is_active, is_verified)
           VALUES ($1, $2, $3, $4, $5, $6, true, true)
           RETURNING *;`,
          [user.full_name, user.email, user.phone, user.password_hash, user.role, user.wallet_balance || 25000]
        );
        if (res.rows.length > 0) {
          const inserted = res.rows[0];
          relationalDB.users.push(inserted);
          saveRelationalDB(relationalDB);
          return inserted;
        }
      }
      const newId = relationalDB.users.length > 0 ? Math.max(...relationalDB.users.map(u => u.id)) + 1 : 1;
      const newUser = {
        id: newId,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        password_hash: user.password_hash,
        role: user.role,
        wallet_balance: user.wallet_balance || 25000.00,
        is_active: true,
        is_verified: true,
        created_at: new Date().toISOString()
      };
      relationalDB.users.push(newUser);
      saveRelationalDB(relationalDB);
      return newUser;
    },
    async updateWallet(userId: number, newBalance: number) {
      checkDatabaseAccess();
      if (postgresConnected) {
        await dbQuery('UPDATE users SET wallet_balance = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [newBalance, userId]);
      }
      const u = relationalDB.users.find(item => item.id === userId);
      if (u) {
        u.wallet_balance = newBalance;
        saveRelationalDB(relationalDB);
      }
    },
    async updateRole(userId: number, newRole: string) {
      checkDatabaseAccess();
      if (postgresConnected) {
        await dbQuery('UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [newRole, userId]);
      }
      const u = relationalDB.users.find(item => item.id === userId);
      if (u) {
        u.role = newRole;
        saveRelationalDB(relationalDB);
      }
    },
    async updateStatus(userId: number, isActive: boolean) {
      checkDatabaseAccess();
      if (postgresConnected) {
        await dbQuery('UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [isActive, userId]);
      }
      const u = relationalDB.users.find(item => item.id === userId);
      if (u) {
        u.is_active = isActive;
        saveRelationalDB(relationalDB);
      }
    },
    async updatePassword(userId: number, newPasswordHash: string) {
      checkDatabaseAccess();
      if (postgresConnected) {
        await dbQuery('UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [newPasswordHash, userId]);
      }
      const u = relationalDB.users.find(item => item.id === userId);
      if (u) {
        u.password_hash = newPasswordHash;
        saveRelationalDB(relationalDB);
      }
    },
    async updateProfileInfo(userId: number, data: { full_name?: string; phone?: string }) {
      checkDatabaseAccess();
      if (postgresConnected) {
        await dbQuery(
          `UPDATE users SET
             full_name = COALESCE($1, full_name),
             phone = COALESCE($2, phone),
             updated_at = CURRENT_TIMESTAMP
           WHERE id = $3`,
          [data.full_name || null, data.phone || null, userId]
        );
      }
      const u = relationalDB.users.find(item => item.id === userId);
      if (u) {
        if (data.full_name) u.full_name = data.full_name;
        if (data.phone) u.phone = data.phone;
        saveRelationalDB(relationalDB);
      }
      return u || null;
    }
  },

  wallet: {
    async getTransactions(userId: number) {
      checkDatabaseAccess();
      if (postgresConnected) {
        const res = await dbQuery('SELECT * FROM wallet_transactions WHERE user_id = $1 ORDER BY id DESC', [userId]);
        return res.rows;
      }
      relationalDB.wallet_transactions = relationalDB.wallet_transactions || [];
      return relationalDB.wallet_transactions.filter(t => t.user_id === userId);
    },
    async recordTransaction(data: { user_id: number; transaction_type: 'credit' | 'debit'; amount: number; balance_after: number; description: string; reference_id: string }) {
      checkDatabaseAccess();
      if (postgresConnected) {
        const res = await dbQuery(
          `INSERT INTO wallet_transactions (user_id, transaction_type, amount, balance_after, description, reference_id)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING *;`,
          [data.user_id, data.transaction_type, data.amount, data.balance_after, data.description, data.reference_id]
        );
        if (res.rows.length > 0) return res.rows[0];
      }
      relationalDB.wallet_transactions = relationalDB.wallet_transactions || [];
      const newTxn = {
        id: relationalDB.wallet_transactions.length > 0 ? Math.max(...relationalDB.wallet_transactions.map(t => t.id || 0)) + 1 : 1,
        ...data,
        created_at: new Date().toISOString()
      };
      relationalDB.wallet_transactions.unshift(newTxn);
      saveRelationalDB(relationalDB);
      return newTxn;
    }
  },

  profiles: {
    async getByUserId(userId: number) {
      checkDatabaseAccess();
      if (postgresConnected) {
        const res = await dbQuery('SELECT * FROM user_profiles WHERE user_id = $1 LIMIT 1', [userId]);
        if (res.rows.length > 0) return res.rows[0];
        return null;
      }
      return relationalDB.user_profiles.find(p => p.user_id === userId) || null;
    },
    async upsert(userId: number, data: any) {
      checkDatabaseAccess();
      if (postgresConnected) {
        const res = await dbQuery(
          `INSERT INTO user_profiles (
             user_id, dob, gender, pan_number, aadhaar_last4, address_line1,
             city, state, pincode, annual_income, occupation_type,
             bank_account_no, bank_ifsc, bank_name
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
           ON CONFLICT (user_id) DO UPDATE SET
             dob = COALESCE($2, user_profiles.dob),
             gender = COALESCE($3, user_profiles.gender),
             pan_number = COALESCE($4, user_profiles.pan_number),
             aadhaar_last4 = COALESCE($5, user_profiles.aadhaar_last4),
             address_line1 = COALESCE($6, user_profiles.address_line1),
             city = COALESCE($7, user_profiles.city),
             state = COALESCE($8, user_profiles.state),
             pincode = COALESCE($9, user_profiles.pincode),
             annual_income = COALESCE($10, user_profiles.annual_income),
             occupation_type = COALESCE($11, user_profiles.occupation_type),
             bank_account_no = COALESCE($12, user_profiles.bank_account_no),
             bank_ifsc = COALESCE($13, user_profiles.bank_ifsc),
             bank_name = COALESCE($14, user_profiles.bank_name),
             updated_at = CURRENT_TIMESTAMP
           RETURNING *;`,
          [
            userId,
            data.dob || null,
            data.gender || null,
            data.pan_number || null,
            data.aadhaar_last4 || null,
            data.address_line1 || null,
            data.city || null,
            data.state || null,
            data.pincode || null,
            data.annual_income !== undefined ? data.annual_income : null,
            data.occupation_type || null,
            data.bank_account_no || null,
            data.bank_ifsc || null,
            data.bank_name || null
          ]
        );
        if (res.rows.length > 0) {
          return res.rows[0];
        }
      }
      let profile = relationalDB.user_profiles.find(p => p.user_id === userId);
      const cleanData = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));
      if (!profile) {
        profile = { user_id: userId, ...cleanData };
        relationalDB.user_profiles.push(profile);
      } else {
        Object.assign(profile, cleanData);
      }
      saveRelationalDB(relationalDB);
      return profile;
    }
  },

  kyc: {
    async getByUserId(userId: number) {
      checkDatabaseAccess();
      if (postgresConnected) {
        const res = await dbQuery('SELECT * FROM kyc_records WHERE user_id = $1 ORDER BY id DESC', [userId]);
        return res.rows;
      }
      return relationalDB.kyc_records.filter(k => k.user_id === userId);
    },
    async upsertRecord(userId: number, docType: string, maskedNum: string, provider: string, remarks: string, verificationStatus: string = 'sandbox_simulated') {
      checkDatabaseAccess();
      if (postgresConnected) {
        const res = await dbQuery(
          `INSERT INTO kyc_records (user_id, document_type, document_number_masked, verification_status, verification_provider, remarks)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING *;`,
          [userId, docType, maskedNum, verificationStatus, provider, remarks]
        );
        if (res.rows.length > 0) return res.rows[0];
      }
      const existingIdx = relationalDB.kyc_records.findIndex(k => k.user_id === userId && k.document_type === docType);
      const record = {
        id: existingIdx !== -1 ? relationalDB.kyc_records[existingIdx].id : relationalDB.kyc_records.length + 1,
        user_id: userId,
        document_type: docType,
        document_number_masked: maskedNum,
        verification_status: verificationStatus,
        verification_provider: provider,
        verified_at: new Date().toISOString(),
        remarks
      };
      if (existingIdx !== -1) relationalDB.kyc_records[existingIdx] = record;
      else relationalDB.kyc_records.push(record);
      saveRelationalDB(relationalDB);
      return record;
    }
  },

  loans: {
    async getProducts() {
      checkDatabaseAccess();
      if (postgresConnected) {
        const res = await dbQuery('SELECT * FROM loan_products WHERE is_active = true ORDER BY id ASC');
        if (res.rows.length > 0) return res.rows;
      }
      return relationalDB.loan_products;
    },
    async getProductById(id: number) {
      checkDatabaseAccess();
      if (postgresConnected) {
        const res = await dbQuery('SELECT * FROM loan_products WHERE id = $1 LIMIT 1', [id]);
        if (res.rows.length > 0) return res.rows[0];
      }
      return relationalDB.loan_products.find(p => p.id === id) || null;
    },
    async updateProduct(id: number, data: { base_interest_rate?: number; min_amount?: number; max_amount?: number }) {
      checkDatabaseAccess();
      if (postgresConnected) {
        await dbQuery(
          `UPDATE loan_products SET 
             base_interest_rate = COALESCE($1, base_interest_rate),
             min_amount = COALESCE($2, min_amount),
             max_amount = COALESCE($3, max_amount),
             updated_at = CURRENT_TIMESTAMP
           WHERE id = $4`,
          [data.base_interest_rate, data.min_amount, data.max_amount, id]
        );
      }
      const prod = relationalDB.loan_products.find(p => p.id === id);
      if (prod) {
        if (data.base_interest_rate !== undefined) prod.base_interest_rate = data.base_interest_rate;
        if (data.min_amount !== undefined) prod.min_amount = data.min_amount;
        if (data.max_amount !== undefined) prod.max_amount = data.max_amount;
        saveRelationalDB(relationalDB);
        return prod;
      }
      return null;
    },
    async getAllApplications(statusFilter?: string) {
      checkDatabaseAccess();
      if (postgresConnected) {
        let query = 'SELECT * FROM loan_applications';
        const params: any[] = [];
        if (statusFilter && statusFilter !== 'all') {
          query += ' WHERE status = $1';
          params.push(statusFilter);
        }
        query += ' ORDER BY id DESC';
        const res = await dbQuery(query, params);
        return res.rows;
      }
      let list = relationalDB.loan_applications;
      if (statusFilter && statusFilter !== 'all') {
        list = list.filter(a => a.status === statusFilter);
      }
      return list;
    },
    async getApplicationsByUser(userId: number) {
      checkDatabaseAccess();
      if (postgresConnected) {
        const res = await dbQuery('SELECT * FROM loan_applications WHERE user_id = $1 ORDER BY id DESC', [userId]);
        return res.rows;
      }
      return relationalDB.loan_applications.filter(a => a.user_id === userId);
    },
    async getApplicationById(id: number) {
      checkDatabaseAccess();
      if (postgresConnected) {
        const res = await dbQuery('SELECT * FROM loan_applications WHERE id = $1 LIMIT 1', [id]);
        if (res.rows.length > 0) return res.rows[0];
      }
      return relationalDB.loan_applications.find(a => a.id === id) || null;
    },
    async createApplication(appData: any) {
      checkDatabaseAccess();
      if (postgresConnected) {
        const res = await dbQuery(
          `INSERT INTO loan_applications (
            application_no, user_id, product_id, applicant_name, phone, email,
            monthly_income, requested_amount, interest_rate, tenure_months,
            calculated_emi, purpose, status, officer_remarks, credit_score
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
          RETURNING *;`,
          [
            appData.application_no, appData.user_id, appData.product_id, appData.applicant_name,
            appData.phone, appData.email, appData.monthly_income, appData.requested_amount,
            appData.interest_rate, appData.tenure_months, appData.calculated_emi,
            appData.purpose, appData.status || 'submitted', appData.officer_remarks || null,
            appData.credit_score || 745
          ]
        );
        if (res.rows.length > 0) {
          const inserted = res.rows[0];
          relationalDB.loan_applications.unshift(inserted);
          saveRelationalDB(relationalDB);
          return inserted;
        }
      }
      const newId = relationalDB.loan_applications.length > 0 
        ? Math.max(...relationalDB.loan_applications.map(a => a.id || 0)) + 1 
        : 1;
      const appWithId = { id: newId, ...appData };
      relationalDB.loan_applications.unshift(appWithId);
      saveRelationalDB(relationalDB);
      return appWithId;
    },
    async updateApplicationDecision(id: number, decision: string, remarks?: string, sanctionedAmount?: number, calculatedEmi?: number) {
      checkDatabaseAccess();
      if (postgresConnected) {
        const res = await dbQuery(
          `UPDATE loan_applications SET
             status = $1,
             officer_remarks = COALESCE($2, officer_remarks),
             sanctioned_amount = COALESCE($3, sanctioned_amount),
             calculated_emi = COALESCE($4, calculated_emi),
             sanctioned_at = CASE WHEN $1 IN ('approved', 'sanctioned') THEN CURRENT_TIMESTAMP ELSE sanctioned_at END,
             updated_at = CURRENT_TIMESTAMP
           WHERE id = $5
           RETURNING *;`,
          [decision, remarks || null, sanctionedAmount || null, calculatedEmi || null, id]
        );
        if (res.rows.length > 0) return res.rows[0];
      }
      const app = relationalDB.loan_applications.find(a => a.id === id);
      if (app) {
        app.status = decision;
        if (remarks) app.officer_remarks = remarks;
        if (sanctionedAmount) app.sanctioned_amount = sanctionedAmount;
        if (calculatedEmi) app.calculated_emi = calculatedEmi;
        if (decision === 'approved' || decision === 'sanctioned') {
          app.sanctioned_at = new Date().toISOString();
        }
        saveRelationalDB(relationalDB);
      }
      return app || null;
    },
    async getEmiSchedules(applicationId?: number) {
      checkDatabaseAccess();
      if (postgresConnected) {
        let query = 'SELECT * FROM emi_schedules';
        const params: any[] = [];
        if (applicationId) {
          query += ' WHERE application_id = $1';
          params.push(applicationId);
        }
        query += ' ORDER BY installment_number ASC';
        const res = await dbQuery(query, params);
        return res.rows;
      }
      if (applicationId) {
        return relationalDB.emi_schedules.filter(s => s.application_id === applicationId);
      }
      return relationalDB.emi_schedules;
    },
    async createEmiSchedules(schedules: any[]) {
      checkDatabaseAccess();
      if (postgresConnected) {
        for (const s of schedules) {
          await dbQuery(
            `INSERT INTO emi_schedules (application_id, installment_number, due_date, emi_amount, principal_component, interest_component, remaining_balance, payment_status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')`,
            [s.application_id, s.installment_number, s.due_date, s.emi_amount, s.principal_component, s.interest_component, s.remaining_balance]
          );
        }
      }
      for (const s of schedules) {
        relationalDB.emi_schedules.push(s);
      }
      saveRelationalDB(relationalDB);
    },
    async markEmiPaid(scheduleId: number, paidDate: string) {
      checkDatabaseAccess();
      if (postgresConnected) {
        await dbQuery('UPDATE emi_schedules SET payment_status = $1, paid_date = $2 WHERE id = $3', ['paid', paidDate, scheduleId]);
      }
      const s = relationalDB.emi_schedules.find(item => item.id === scheduleId);
      if (s) {
        s.payment_status = 'paid';
        s.paid_date = paidDate;
        saveRelationalDB(relationalDB);
      }
    }
  },

  payments: {
    async getByUser(userId: number) {
      checkDatabaseAccess();
      if (postgresConnected) {
        const res = await dbQuery('SELECT * FROM payments WHERE user_id = $1 ORDER BY id DESC', [userId]);
        return res.rows;
      }
      return relationalDB.payments.filter(p => p.user_id === userId);
    },
    async findByIdempotencyKey(key: string) {
      checkDatabaseAccess();
      if (!key) return null;
      if (postgresConnected) {
        const res = await dbQuery('SELECT * FROM payments WHERE idempotency_key = $1 LIMIT 1', [key]);
        return res.rows[0] || null;
      }
      return relationalDB.payments.find(p => p.idempotency_key === key) || null;
    },
    async create(data: any) {
      checkDatabaseAccess();
      if (postgresConnected) {
        const res = await dbQuery(
          `INSERT INTO payments (payment_ref, bbps_ref_no, user_id, application_id, payment_category, operator_name, account_identifier, amount, payment_mode, status, idempotency_key, meta_json)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           RETURNING *;`,
          [
            data.payment_ref, data.bbps_ref_no || null, data.user_id, data.application_id || null,
            data.payment_category, data.operator_name, data.account_identifier, data.amount,
            data.payment_mode || 'wallet', data.status || 'SUCCESS', data.idempotency_key || null, JSON.stringify(data.meta_json || {})
          ]
        );
        if (res.rows.length > 0) {
          return res.rows[0];
        }
      }
      const newPay = {
        id: relationalDB.payments.length > 0 ? Math.max(...relationalDB.payments.map(p => p.id || 0)) + 1 : 1,
        ...data,
        created_at: new Date().toISOString()
      };
      relationalDB.payments.unshift(newPay);
      saveRelationalDB(relationalDB);
      return newPay;
    },
    async executeAtomicWalletPayment(params: {
      userId: number;
      amount: number;
      category: string;
      operator: string;
      accountIdentifier: string;
      paymentMode: string;
      status: string;
      idempotencyKey?: string;
      metaJson?: any;
      applicationId?: number;
    }) {
      checkDatabaseAccess();
      if (postgresConnected && pool) {
        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          let balanceAfter = 0;
          if (params.paymentMode === 'wallet') {
            const userRes = await client.query('SELECT id, wallet_balance, is_active FROM users WHERE id = $1 FOR UPDATE', [params.userId]);
            if (userRes.rows.length === 0) {
              const err: any = new Error('User account not found');
              err.statusCode = 404;
              throw err;
            }
            if (!userRes.rows[0].is_active) {
              const err: any = new Error('User account is deactivated');
              err.statusCode = 403;
              throw err;
            }
            const currentBalance = parseFloat(userRes.rows[0].wallet_balance);
            if (currentBalance < params.amount) {
              const err: any = new Error(`Insufficient wallet balance (₹${currentBalance}) for payment of ₹${params.amount}`);
              err.statusCode = 400;
              throw err;
            }
            balanceAfter = currentBalance - params.amount;
            await client.query('UPDATE users SET wallet_balance = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [balanceAfter, params.userId]);

            await client.query(
              `INSERT INTO wallet_transactions (user_id, transaction_type, amount, balance_after, description, reference_id)
               VALUES ($1, 'debit', $2, $3, $4, $5);`,
              [params.userId, params.amount, balanceAfter, `Payment for ${params.operator}`, params.idempotencyKey || `TXN-${Date.now()}`]
            );
          } else {
            const userRes = await client.query('SELECT wallet_balance FROM users WHERE id = $1', [params.userId]);
            balanceAfter = userRes.rows.length > 0 ? parseFloat(userRes.rows[0].wallet_balance) : 0;
          }

          const txnRef = `TT-TXN-${Date.now().toString().slice(-8)}`;
          const bbpsRef = `BBPS${Math.floor(1000000000 + Math.random() * 9000000000)}`;

          const payRes = await client.query(
            `INSERT INTO payments (payment_ref, bbps_ref_no, user_id, application_id, payment_category, operator_name, account_identifier, amount, payment_mode, status, idempotency_key, meta_json)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
             RETURNING *;`,
            [
              txnRef, bbpsRef, params.userId, params.applicationId || null,
              params.category, params.operator, params.accountIdentifier, params.amount,
              params.paymentMode, params.status, params.idempotencyKey || null, JSON.stringify(params.metaJson || {})
            ]
          );

          await client.query('COMMIT');
          return {
            payment: payRes.rows[0],
            newBalance: balanceAfter
          };
        } catch (e) {
          await client.query('ROLLBACK');
          throw e;
        } finally {
          client.release();
        }
      }

      // Explicit Demo Mode / Fallback In-Memory Storage
      const user = relationalDB.users.find(u => u.id === params.userId);
      if (!user) {
        const err: any = new Error('User not found');
        err.statusCode = 404;
        throw err;
      }
      if (!user.is_active) {
        const err: any = new Error('User account is deactivated');
        err.statusCode = 403;
        throw err;
      }

      const currentBalance = parseFloat(user.wallet_balance || 0);
      let balanceAfter = currentBalance;
      const txnRef = `TT-TXN-${Date.now().toString().slice(-8)}`;
      const bbpsRef = `BBPS${Math.floor(1000000000 + Math.random() * 9000000000)}`;

      if (params.paymentMode === 'wallet') {
        if (currentBalance < params.amount) {
          const err: any = new Error(`Insufficient wallet balance (₹${currentBalance}) for payment of ₹${params.amount}`);
          err.statusCode = 400;
          throw err;
        }
        balanceAfter = currentBalance - params.amount;
        user.wallet_balance = balanceAfter;

        relationalDB.wallet_transactions = relationalDB.wallet_transactions || [];
        const walletTxId = relationalDB.wallet_transactions.length > 0
          ? Math.max(...relationalDB.wallet_transactions.map(t => t.id || 0)) + 1
          : 1;
        relationalDB.wallet_transactions.unshift({
          id: walletTxId,
          user_id: params.userId,
          transaction_type: 'debit',
          amount: params.amount,
          balance_after: balanceAfter,
          description: `Payment for ${params.operator}`,
          reference_id: params.idempotencyKey || txnRef,
          created_at: new Date().toISOString()
        });
      }

      const newPay = {
        id: relationalDB.payments.length > 0 ? Math.max(...relationalDB.payments.map(p => p.id || 0)) + 1 : 1,
        payment_ref: txnRef,
        bbps_ref_no: bbpsRef,
        user_id: params.userId,
        application_id: params.applicationId || null,
        payment_category: params.category,
        operator_name: params.operator,
        account_identifier: params.accountIdentifier,
        amount: params.amount,
        payment_mode: params.paymentMode,
        status: params.status,
        idempotency_key: params.idempotencyKey || null,
        meta_json: params.metaJson || {},
        created_at: new Date().toISOString()
      };

      relationalDB.payments.unshift(newPay);
      saveRelationalDB(relationalDB);

      return {
        payment: newPay,
        newBalance: balanceAfter
      };
    }
  },

  investments: {
    async getPortfolioByUser(userId: number) {
      checkDatabaseAccess();
      if (postgresConnected) {
        const res = await dbQuery('SELECT * FROM investment_portfolios WHERE user_id = $1 ORDER BY id ASC', [userId]);
        return res.rows;
      }
      return relationalDB.investment_portfolios.filter(p => p.user_id === userId);
    },
    async upsertHolding(userId: number, symbol: string, name: string, category: string, qty: number, totalCost: number, currentPrice: number) {
      checkDatabaseAccess();
      if (postgresConnected) {
        const existing = await dbQuery('SELECT * FROM investment_portfolios WHERE user_id = $1 AND asset_symbol = $2 LIMIT 1', [userId, symbol]);
        if (existing.rows.length > 0) {
          const row = existing.rows[0];
          const newQty = Number(row.quantity) + qty;
          const newInvested = Number(row.invested_amount) + totalCost;
          const avgPrice = parseFloat((newInvested / newQty).toFixed(2));
          const valuation = Math.round(newQty * currentPrice);
          await dbQuery(
            `UPDATE investment_portfolios SET quantity = $1, invested_amount = $2, avg_buy_price = $3, current_price = $4, current_valuation = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6`,
            [newQty, newInvested, avgPrice, currentPrice, valuation, row.id]
          );
        } else {
          await dbQuery(
            `INSERT INTO investment_portfolios (user_id, asset_symbol, asset_name, category, quantity, avg_buy_price, current_price, invested_amount, current_valuation)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [userId, symbol, name, category, qty, currentPrice, currentPrice, totalCost, totalCost]
          );
        }
      }
      const existingInRel = relationalDB.investment_portfolios.find(p => p.user_id === userId && p.asset_symbol === symbol);
      if (existingInRel) {
        const newQty = existingInRel.quantity + qty;
        const newInvested = existingInRel.invested_amount + totalCost;
        existingInRel.quantity = newQty;
        existingInRel.invested_amount = newInvested;
        existingInRel.avg_buy_price = parseFloat((newInvested / newQty).toFixed(2));
        existingInRel.current_price = currentPrice;
        existingInRel.current_valuation = Math.round(newQty * currentPrice);
      } else {
        relationalDB.investment_portfolios.push({
          id: relationalDB.investment_portfolios.length + 1,
          user_id: userId,
          asset_symbol: symbol,
          asset_name: name,
          category,
          quantity: qty,
          avg_buy_price: currentPrice,
          current_price: currentPrice,
          invested_amount: totalCost,
          current_valuation: totalCost,
          created_at: new Date().toISOString()
        });
      }
      saveRelationalDB(relationalDB);
    },
    async getWatchlist(userId: number): Promise<string[]> {
      checkDatabaseAccess();
      if (postgresConnected) {
        const res = await dbQuery('SELECT symbol FROM watchlists WHERE user_id = $1 ORDER BY id ASC', [userId]);
        return res.rows.map(r => r.symbol);
      }
      return relationalDB.watchlists.filter(w => w.user_id === userId).map(w => w.symbol);
    },
    async toggleWatchlist(userId: number, symbol: string): Promise<{ watched: boolean; symbol: string }> {
      checkDatabaseAccess();
      const upper = symbol.toUpperCase().trim();
      if (postgresConnected) {
        const check = await dbQuery('SELECT id FROM watchlists WHERE user_id = $1 AND symbol = $2', [userId, upper]);
        if (check.rows.length > 0) {
          await dbQuery('DELETE FROM watchlists WHERE user_id = $1 AND symbol = $2', [userId, upper]);
          return { watched: false, symbol: upper };
        } else {
          await dbQuery('INSERT INTO watchlists (user_id, symbol) VALUES ($1, $2)', [userId, upper]);
          return { watched: true, symbol: upper };
        }
      }
      const idx = relationalDB.watchlists.findIndex(w => w.user_id === userId && w.symbol === upper);
      if (idx !== -1) {
        relationalDB.watchlists.splice(idx, 1);
        saveRelationalDB(relationalDB);
        return { watched: false, symbol: upper };
      } else {
        relationalDB.watchlists.push({
          id: relationalDB.watchlists.length + 1,
          user_id: userId,
          symbol: upper,
          added_at: new Date().toISOString()
        });
        saveRelationalDB(relationalDB);
        return { watched: true, symbol: upper };
      }
    },
    async getStockOrders(userId: number) {
      checkDatabaseAccess();
      if (postgresConnected) {
        const res = await dbQuery('SELECT * FROM stock_orders WHERE user_id = $1 ORDER BY id DESC', [userId]);
        return res.rows;
      }
      return (relationalDB.stock_orders || []).filter(o => o.user_id === userId);
    },
    async createStockOrder(data: any) {
      checkDatabaseAccess();
      if (postgresConnected) {
        const res = await dbQuery(
          `INSERT INTO stock_orders (order_ref, user_id, symbol, order_type, quantity, executed_price, total_order_value, status, is_simulated)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
           RETURNING *;`,
          [data.order_ref, data.user_id, data.symbol, data.order_type, data.quantity, data.executed_price, data.total_order_value, data.status || 'EXECUTED']
        );
        if (res.rows.length > 0) return res.rows[0];
      }
      const orderWithId = {
        id: relationalDB.stock_orders.length > 0 ? Math.max(...relationalDB.stock_orders.map(o => o.id || 0)) + 1 : 1,
        ...data
      };
      relationalDB.stock_orders.unshift(orderWithId);
      saveRelationalDB(relationalDB);
      return orderWithId;
    },
    async getMutualFunds() {
      checkDatabaseAccess();
      let rows = relationalDB.mutual_funds;
      if (postgresConnected) {
        const res = await dbQuery('SELECT * FROM mutual_funds ORDER BY id ASC');
        if (res.rows.length > 0) rows = res.rows;
      }
      return rows.map((f: any) => ({
        ...f,
        nav: Number(f.nav ?? f.current_nav ?? 100),
        current_nav: Number(f.current_nav ?? f.nav ?? 100),
        aum_cr: Number(f.aum_cr ?? f.fund_size_cr ?? 10000),
        fund_size_cr: Number(f.fund_size_cr ?? f.aum_cr ?? 10000),
        expense_ratio: Number(f.expense_ratio ?? f.expense_ratio_pct ?? 0.5),
        expense_ratio_pct: Number(f.expense_ratio_pct ?? f.expense_ratio ?? 0.5),
        cagr_1y: Number(f.cagr_1y ?? (Number(f.cagr_3y || 15) + 2.2).toFixed(1)),
        fund_house: f.fund_house || 'Direct Plan AMC'
      }));
    },
    async getFundById(id: number) {
      const funds = await this.getMutualFunds();
      return funds.find((f: any) => f.id === id) || null;
    },
    async getSips(userId: number) {
      checkDatabaseAccess();
      if (postgresConnected) {
        const res = await dbQuery(
          `SELECT s.*, m.fund_name, m.category as fund_category
           FROM sips s
           JOIN mutual_funds m ON s.fund_id = m.id
           WHERE s.user_id = $1 AND s.status != 'cancelled'
           ORDER BY s.id DESC`,
          [userId]
        );
        return res.rows;
      }
      return relationalDB.sips
        .filter(s => s.user_id === userId && s.status !== 'cancelled')
        .map(s => {
          const fund = relationalDB.mutual_funds.find(f => f.id === s.fund_id);
          return {
            ...s,
            fund_name: fund?.fund_name || 'Direct Growth Fund',
            fund_category: fund?.category || 'Equity'
          };
        });
    },
    async createSip(data: any) {
      checkDatabaseAccess();
      if (postgresConnected) {
        const res = await dbQuery(
          `INSERT INTO sips (mandate_ref, user_id, fund_id, monthly_amount, debit_day, next_debit_date, status)
           VALUES ($1, $2, $3, $4, $5, $6, 'active')
           RETURNING *;`,
          [data.mandate_ref, data.user_id, data.fund_id, data.monthly_amount, data.debit_day, data.next_debit_date]
        );
        if (res.rows.length > 0) {
          const inserted = res.rows[0];
          relationalDB.sips.unshift(inserted);
          saveRelationalDB(relationalDB);
          return inserted;
        }
      }
      const newId = (relationalDB.sips && relationalDB.sips.length > 0)
        ? Math.max(...relationalDB.sips.map((s: any) => s.id || 0)) + 1
        : 1;
      const sipWithId = { id: newId, status: 'active', ...data };
      relationalDB.sips.unshift(sipWithId);
      saveRelationalDB(relationalDB);
      return sipWithId;
    },
    async deleteSip(sipId: number, userId: number) {
      checkDatabaseAccess();
      if (postgresConnected) {
        await dbQuery('UPDATE sips SET status = $1 WHERE id = $2 AND user_id = $3', ['cancelled', sipId, userId]);
      }
      const s = relationalDB.sips.find(item => item.id === sipId && item.user_id === userId);
      if (s) {
        s.status = 'cancelled';
        saveRelationalDB(relationalDB);
      }
    },
    async getDemat(userId: number) {
      checkDatabaseAccess();
      if (postgresConnected) {
        const res = await dbQuery('SELECT * FROM demat_applications WHERE user_id = $1 LIMIT 1', [userId]);
        if (res.rows.length > 0) return res.rows[0];
      }
      return relationalDB.demat_applications.find(d => d.user_id === userId) || null;
    },
    async createDemat(data: any) {
      checkDatabaseAccess();
      if (postgresConnected) {
        const res = await dbQuery(
          `INSERT INTO demat_applications (user_id, client_code, dp_id, depository, linked_bank_account, linked_bank_ifsc, status)
           VALUES ($1, $2, $3, $4, $5, $6, 'active')
           ON CONFLICT (user_id) DO UPDATE SET status = 'active'
           RETURNING *;`,
          [data.user_id, data.client_code, data.dp_id, data.depository, data.linked_bank_account, data.linked_bank_ifsc]
        );
        if (res.rows.length > 0) return res.rows[0];
      }
      const existing = relationalDB.demat_applications.find(d => d.user_id === data.user_id);
      if (existing) {
        existing.status = 'active';
        saveRelationalDB(relationalDB);
        return existing;
      }
      relationalDB.demat_applications.push(data);
      saveRelationalDB(relationalDB);
      return data;
    }
  },

  admin: {
    async getDashboardStats() {
      checkDatabaseAccess();
      if (postgresConnected) {
        const usersRes = await dbQuery("SELECT COUNT(*) as count FROM users WHERE role = 'customer'");
        const appsRes = await dbQuery('SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status IN (\'submitted\', \'under_review\')) as pending, COUNT(*) FILTER (WHERE status IN (\'approved\', \'sanctioned\', \'disbursed\')) as approved, COUNT(*) FILTER (WHERE status = \'rejected\') as rejected, COALESCE(SUM(CASE WHEN status = \'disbursed\' THEN COALESCE(sanctioned_amount, requested_amount) ELSE 0 END), 0) as disbursed_volume FROM loan_applications');
        const aumRes = await dbQuery('SELECT COALESCE(SUM(current_valuation), 0) as aum FROM investment_portfolios');

        return {
          total_users: parseInt(usersRes.rows[0]?.count || '0', 10),
          total_applications: parseInt(appsRes.rows[0]?.total || '0', 10),
          pending_underwriting: parseInt(appsRes.rows[0]?.pending || '0', 10),
          approved_loans: parseInt(appsRes.rows[0]?.approved || '0', 10),
          rejected_loans: parseInt(appsRes.rows[0]?.rejected || '0', 10),
          total_disbursed_volume: parseFloat(appsRes.rows[0]?.disbursed_volume || '0'),
          total_wealth_aum: parseFloat(aumRes.rows[0]?.aum || '0'),
          branch_name: 'Kadapa Central Hub, Andhra Pradesh'
        };
      }

      const totalUsers = relationalDB.users.filter(u => u.role === 'customer').length;
      const totalApps = relationalDB.loan_applications.length;
      const pendingApps = relationalDB.loan_applications.filter(a => a.status === 'submitted' || a.status === 'under_review').length;
      const approvedApps = relationalDB.loan_applications.filter(a => a.status === 'approved' || a.status === 'sanctioned' || a.status === 'disbursed').length;
      const rejectedApps = relationalDB.loan_applications.filter(a => a.status === 'rejected').length;
      const totalDisbursed = relationalDB.loan_applications
        .filter(a => a.status === 'disbursed')
        .reduce((sum, a) => sum + (a.sanctioned_amount || a.requested_amount), 0);
      const totalAum = relationalDB.investment_portfolios.reduce((sum, h) => sum + h.current_valuation, 0);

      return {
        total_users: totalUsers,
        total_applications: totalApps,
        pending_underwriting: pendingApps,
        approved_loans: approvedApps,
        rejected_loans: rejectedApps,
        total_disbursed_volume: totalDisbursed,
        total_wealth_aum: totalAum,
        branch_name: 'Kadapa Central Hub, Andhra Pradesh'
      };
    },
    async getAuditLogs(limit = 50) {
      checkDatabaseAccess();
      if (postgresConnected) {
        const res = await dbQuery('SELECT * FROM audit_logs ORDER BY id DESC LIMIT $1', [limit]);
        return res.rows;
      }
      return relationalDB.audit_logs.slice(0, limit);
    }
  },

  agents: {
    async getByUserId(userId: number) {
      checkDatabaseAccess();
      if (postgresConnected) {
        const res = await dbQuery('SELECT * FROM agents WHERE user_id = $1 LIMIT 1', [userId]);
        if (res.rows.length > 0) return res.rows[0];
      }
      return relationalDB.agents.find(a => a.user_id === userId) || null;
    },
    async getAll() {
      checkDatabaseAccess();
      if (postgresConnected) {
        const res = await dbQuery('SELECT * FROM agents ORDER BY id ASC');
        return res.rows;
      }
      return relationalDB.agents;
    },
    async getLeads(agentId?: number, role?: string) {
      checkDatabaseAccess();
      const isAdminRole = role === 'admin' || role === 'super_admin';
      if (postgresConnected) {
        let query = 'SELECT * FROM agent_leads';
        const params: any[] = [];
        if (!isAdminRole && agentId) {
          query += ' WHERE agent_id = $1';
          params.push(agentId);
        }
        query += ' ORDER BY id DESC';
        const res = await dbQuery(query, params);
        return res.rows;
      }
      const list = relationalDB.agent_leads || [];
      if (isAdminRole) return list;
      return list.filter(l => l.agent_id === agentId);
    },
    async createLead(leadData: any) {
      checkDatabaseAccess();
      if (postgresConnected) {
        const res = await dbQuery(
          `INSERT INTO agent_leads (
            agent_id, agent_code, applicant_name, phone, email, loan_product,
            requested_amount, location, commission_rate_pct, commission_amount, status, notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          RETURNING *;`,
          [
            leadData.agent_id, leadData.agent_code, leadData.applicant_name,
            leadData.phone, leadData.email, leadData.loan_product,
            leadData.requested_amount, leadData.location || 'Kadapa',
            leadData.commission_rate_pct, leadData.commission_amount,
            leadData.status || 'Contacted', leadData.notes || null
          ]
        );
        await dbQuery(
          'UPDATE agents SET total_leads_count = total_leads_count + 1 WHERE user_id = $1',
          [leadData.agent_id]
        );
        if (res.rows.length > 0) {
          const inserted = res.rows[0];
          relationalDB.agent_leads = relationalDB.agent_leads || [];
          relationalDB.agent_leads.unshift(inserted);
          saveRelationalDB(relationalDB);
          return inserted;
        }
      }
      relationalDB.agent_leads = relationalDB.agent_leads || [];
      const newId = relationalDB.agent_leads.length > 0
        ? Math.max(...relationalDB.agent_leads.map(l => l.id || 0)) + 1
        : 1;
      const newLead = { id: newId, ...leadData, created_at: new Date().toISOString().split('T')[0] };
      relationalDB.agent_leads.unshift(newLead);
      const agent = relationalDB.agents.find(a => a.user_id === leadData.agent_id);
      if (agent) agent.total_leads_count += 1;
      saveRelationalDB(relationalDB);
      return newLead;
    },
    async getCommissions(agentId?: number) {
      checkDatabaseAccess();
      if (postgresConnected) {
        const res = await dbQuery(
          `SELECT 
             COALESCE(SUM(CASE WHEN status = 'Disbursed' THEN commission_amount ELSE 0 END), 0) as total_earned,
             COALESCE(SUM(CASE WHEN status != 'Disbursed' THEN commission_amount ELSE 0 END), 0) as pending_pipeline
           FROM agent_leads
           ${agentId ? 'WHERE agent_id = $1' : ''}`,
          agentId ? [agentId] : []
        );
        const earned = parseFloat(res.rows[0]?.total_earned || '0');
        const pending = parseFloat(res.rows[0]?.pending_pipeline || '0');
        return { total_earned: earned, pending_pipeline: pending };
      }
      const list = relationalDB.agent_leads || [];
      const agentList = agentId ? list.filter(l => l.agent_id === agentId) : list;
      const totalEarned = agentList
        .filter(l => l.status === 'Disbursed')
        .reduce((sum, l) => sum + parseFloat(l.commission_amount || 0), 0);
      const pendingCommission = agentList
        .filter(l => l.status !== 'Disbursed')
        .reduce((sum, l) => sum + parseFloat(l.commission_amount || 0), 0);
      return { total_earned: totalEarned, pending_pipeline: pendingCommission };
    }
  },

  notifications: {
    async getByUser(userId: number) {
      checkDatabaseAccess();
      if (postgresConnected) {
        const res = await dbQuery('SELECT * FROM notifications WHERE user_id = $1 ORDER BY id DESC', [userId]);
        return res.rows;
      }
      return relationalDB.notifications.filter(n => n.user_id === userId);
    },
    async create(data: { user_id: number; title: string; message: string; category?: string }) {
      checkDatabaseAccess();
      if (postgresConnected) {
        const res = await dbQuery(
          `INSERT INTO notifications (user_id, title, message, category, is_read)
           VALUES ($1, $2, $3, $4, false)
           RETURNING *;`,
          [data.user_id, data.title, data.message, data.category || 'general']
        );
        if (res.rows.length > 0) {
          const inserted = res.rows[0];
          relationalDB.notifications.unshift(inserted);
          saveRelationalDB(relationalDB);
          return inserted;
        }
      }
      const newNotif = {
        id: relationalDB.notifications.length + 1,
        user_id: data.user_id,
        title: data.title,
        message: data.message,
        category: data.category || 'general',
        is_read: false,
        created_at: new Date().toISOString()
      };
      relationalDB.notifications.unshift(newNotif);
      saveRelationalDB(relationalDB);
      return newNotif;
    },
    async markAllRead(userId: number) {
      checkDatabaseAccess();
      if (postgresConnected) {
        await dbQuery('UPDATE notifications SET is_read = true WHERE user_id = $1', [userId]);
      }
      relationalDB.notifications.forEach(n => {
        if (n.user_id === userId) n.is_read = true;
      });
      saveRelationalDB(relationalDB);
    },
    async markRead(id: number, userId: number) {
      checkDatabaseAccess();
      if (postgresConnected) {
        await dbQuery('UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2', [id, userId]);
      }
      const notif = relationalDB.notifications.find(n => n.id === id && n.user_id === userId);
      if (notif) notif.is_read = true;
      saveRelationalDB(relationalDB);
      return notif;
    }
  }
};

export function logAudit(actorId: number | null, actionType: string, entityName: string, entityId: string | null, details: any = {}) {
  const audit = {
    id: relationalDB.audit_logs.length + 1,
    actor_id: actorId,
    action_type: actionType,
    entity_name: entityName,
    entity_id: entityId,
    details,
    created_at: new Date().toISOString()
  };
  relationalDB.audit_logs.unshift(audit);
  saveRelationalDB(relationalDB);

  if (postgresConnected) {
    dbQuery(
      `INSERT INTO audit_logs (actor_id, action_type, entity_name, entity_id, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [actorId, actionType, entityName, entityId, JSON.stringify(details)]
    ).catch(e => console.warn('Postgres audit log error:', e.message));
  }

  return audit;
}
