process.env.DATA_STORE_MODE=process.env.DATA_STORE_MODE||'demo';process.env.JWT_SECRET=process.env.JWT_SECRET||'tatito_vercel_production_jwt_secret_key_kadapa_ap_2026_finance_sec';

// server.ts
import express from "express";
import cors from "cors";
import path2 from "path";
import fs2 from "fs";

// database/db.ts
import { Pool } from "pg";
import fs from "fs";
import path from "path";
function isValidPgHost(host) {
  if (!host) return false;
  const h = host.trim().toLowerCase();
  const invalidPlaceholders = /* @__PURE__ */ new Set(["", "123", "undefined", "null", "base", "host", "localhost", "example", "your_host"]);
  return !invalidPlaceholders.has(h);
}
function isValidDatabaseUrl(url) {
  if (!url) return false;
  const trimmed = url.trim();
  if (!trimmed.startsWith("postgres://") && !trimmed.startsWith("postgresql://")) return false;
  try {
    const parsed = new URL(trimmed);
    return isValidPgHost(parsed.hostname);
  } catch {
    return false;
  }
}
var isPostgresConfigured = Boolean(
  isValidDatabaseUrl(process.env.DATABASE_URL) || isValidPgHost(process.env.PGHOST) || isValidPgHost(process.env.SQL_HOST)
);
var pool = null;
var postgresConnected = false;
if (isPostgresConfigured) {
  try {
    pool = new Pool({
      connectionString: isValidDatabaseUrl(process.env.DATABASE_URL) ? process.env.DATABASE_URL : void 0,
      host: isValidPgHost(process.env.PGHOST) ? process.env.PGHOST : isValidPgHost(process.env.SQL_HOST) ? process.env.SQL_HOST : void 0,
      port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432,
      user: process.env.PGUSER || process.env.SQL_USER || "postgres",
      password: process.env.PGPASSWORD || process.env.SQL_PASSWORD || "postgres",
      database: process.env.PGDATABASE || process.env.SQL_DB_NAME || "tatito_finance",
      max: 10,
      connectionTimeoutMillis: 3e3
    });
    pool.on("error", (err) => {
      console.warn("[PostgreSQL Pool Notice]", err.message);
      postgresConnected = false;
    });
  } catch (err) {
    console.warn("[PostgreSQL Init Notice] Falling back to file/memory storage:", err);
    pool = null;
  }
}
var FALLBACK_DB_PATH = path.resolve(process.cwd(), "tatito_relational_db.json");
function getInitialRelationalDB() {
  return {
    users: [
      {
        id: 1,
        full_name: "Ramesh Kumar Chennur",
        email: "ramesh@tatito.in",
        phone: "9876543210",
        password_hash: "$2b$10$F9I0PKMdgXOuN0sFMywdROEPSHtHtKqF7p2N/vC8/LPDK03VHgQGG",
        // Password@123
        role: "customer",
        wallet_balance: 24850,
        is_active: true,
        is_verified: true,
        created_at: (/* @__PURE__ */ new Date("2025-04-12T10:00:00Z")).toISOString()
      },
      {
        id: 2,
        full_name: "Ankalaiah Bandlamudi",
        email: "admin@tatitofinance.com",
        phone: "9440123456",
        password_hash: "$2b$10$F9I0PKMdgXOuN0sFMywdROEPSHtHtKqF7p2N/vC8/LPDK03VHgQGG",
        // Password@123
        role: "admin",
        wallet_balance: 15e4,
        is_active: true,
        is_verified: true,
        created_at: (/* @__PURE__ */ new Date("2024-01-01T09:00:00Z")).toISOString()
      },
      {
        id: 3,
        full_name: "Siva Reddy",
        email: "agent@tatito.in",
        phone: "9440552233",
        password_hash: "$2b$10$F9I0PKMdgXOuN0sFMywdROEPSHtHtKqF7p2N/vC8/LPDK03VHgQGG",
        // Password@123
        role: "agent",
        wallet_balance: 45e3,
        is_active: true,
        is_verified: true,
        created_at: (/* @__PURE__ */ new Date("2025-02-15T09:00:00Z")).toISOString()
      },
      {
        id: 4,
        full_name: "Lakshmi Narayana Rao",
        email: "credit@tatito.in",
        phone: "9440811223",
        password_hash: "$2b$10$F9I0PKMdgXOuN0sFMywdROEPSHtHtKqF7p2N/vC8/LPDK03VHgQGG",
        // Password@123
        role: "credit_officer",
        wallet_balance: 8e4,
        is_active: true,
        is_verified: true,
        created_at: (/* @__PURE__ */ new Date("2024-06-01T09:00:00Z")).toISOString()
      },
      {
        id: 5,
        full_name: "M/s. Tatito Projects \u2014 Super Admin",
        email: "superadmin@tatitofinance.com",
        phone: "9440999999",
        password_hash: "$2b$10$F9I0PKMdgXOuN0sFMywdROEPSHtHtKqF7p2N/vC8/LPDK03VHgQGG",
        // Password@123
        role: "super_admin",
        wallet_balance: 5e5,
        is_active: true,
        is_verified: true,
        created_at: (/* @__PURE__ */ new Date("2024-01-01T08:00:00Z")).toISOString()
      }
    ],
    user_profiles: [
      {
        user_id: 1,
        dob: "1988-06-15",
        gender: "Male",
        pan_number: "ABCDE1234F",
        aadhaar_last4: "8821",
        address_line1: "Door 4/218, Trunk Road",
        city: "Kadapa",
        state: "Andhra Pradesh",
        pincode: "516001",
        annual_income: 85e4,
        bank_account_no: "\u2022\u2022\u2022\u2022 4821",
        bank_ifsc: "SBIN0000840",
        bank_name: "State Bank of India (Kadapa Main)"
      }
    ],
    kyc_records: [
      {
        id: 1,
        user_id: 1,
        document_type: "pan",
        document_number_masked: "ABCDE****F",
        verification_status: "sandbox_simulated",
        verification_provider: "DigiLocker / NSDL KRA Sandbox",
        verified_at: (/* @__PURE__ */ new Date()).toISOString(),
        remarks: "Simulated via Income Tax NSDL KRA Sandbox [Demo]"
      },
      {
        id: 2,
        user_id: 1,
        document_type: "aadhaar",
        document_number_masked: "XXXX-XXXX-8821",
        verification_status: "sandbox_simulated",
        verification_provider: "UIDAI OTP Sandbox",
        verified_at: (/* @__PURE__ */ new Date()).toISOString(),
        remarks: "Simulated via UIDAI OTP Sandbox [Demo]"
      }
    ],
    loan_products: [
      { id: 1, product_code: "PL_UNSECURED", product_name: "Personal Loan", min_amount: 25e3, max_amount: 1e6, base_interest_rate: 14, min_tenure_months: 12, max_tenure_months: 60, is_secured: false, description: "Quick credit for emergency, wedding or travel" },
      { id: 2, product_code: "BL_GROWTH", product_name: "Business Loan", min_amount: 1e5, max_amount: 5e6, base_interest_rate: 16, min_tenure_months: 12, max_tenure_months: 84, is_secured: false, description: "Working capital and inventory expansion for Kadapa MSMEs" },
      { id: 3, product_code: "GL_EXPRESS", product_name: "Gold Loan", min_amount: 1e4, max_amount: 2e6, base_interest_rate: 11, min_tenure_months: 3, max_tenure_months: 36, is_secured: true, description: "Immediate disbursement against hallmark gold" },
      { id: 4, product_code: "HL_PRIME", product_name: "Home Loan", min_amount: 5e5, max_amount: 1e7, base_interest_rate: 9, min_tenure_months: 60, max_tenure_months: 240, is_secured: true, description: "Financing for purchasing apartments or villas" },
      { id: 5, product_code: "VL_AUTO", product_name: "Vehicle Loan", min_amount: 5e4, max_amount: 2e6, base_interest_rate: 10, min_tenure_months: 12, max_tenure_months: 84, is_secured: true, description: "Finance up to 90% on-road cost" },
      { id: 6, product_code: "PLT_OPEN", product_name: "Plot Loan", min_amount: 2e5, max_amount: 5e6, base_interest_rate: 9.75, min_tenure_months: 36, max_tenure_months: 180, is_secured: true, description: "DTCP/APCRDA approved plot purchase" },
      { id: 7, product_code: "LAP_SECURED", product_name: "Loan Against Property", min_amount: 5e5, max_amount: 15e6, base_interest_rate: 10.5, min_tenure_months: 36, max_tenure_months: 180, is_secured: true, description: "Unlock real estate value" }
    ],
    loan_applications: [
      {
        id: 1,
        application_no: "TF-LN-2026-9481",
        user_id: 1,
        product_id: 2,
        product_name: "Business Loan",
        applicant_name: "Ramesh Kumar Chennur",
        phone: "9876543210",
        email: "ramesh@tatito.in",
        monthly_income: 85e3,
        requested_amount: 15e5,
        interest_rate: 16,
        tenure_months: 36,
        calculated_emi: 52758,
        purpose: "Expanding inventory at textile retail showroom in Trunk Road, Kadapa",
        status: "under_review",
        credit_score: 754,
        officer_remarks: "Physical store verification scheduled with field officer.",
        sanctioned_amount: 15e5,
        created_at: "2026-10-12T14:30:00Z"
      },
      {
        id: 2,
        application_no: "TF-LN-2026-8910",
        user_id: 1,
        product_id: 4,
        product_name: "Home Loan",
        applicant_name: "Srinivasa Rao Giddalur",
        phone: "9440811223",
        email: "srinivas.g@gmail.com",
        monthly_income: 12e4,
        requested_amount: 45e5,
        interest_rate: 9,
        tenure_months: 180,
        calculated_emi: 45643,
        purpose: "Construction of duplex house in Nagarajupalle, Kadapa",
        status: "submitted",
        credit_score: 720,
        officer_remarks: "Awaiting municipal approved plan deed.",
        created_at: "2026-10-14T09:15:00Z"
      },
      {
        id: 3,
        application_no: "TF-LN-2025-0814",
        user_id: 1,
        product_id: 3,
        product_name: "Gold Loan",
        applicant_name: "Ramesh Kumar Chennur",
        phone: "9876543210",
        email: "ramesh@tatito.in",
        monthly_income: 85e3,
        requested_amount: 25e4,
        interest_rate: 11,
        tenure_months: 12,
        calculated_emi: 22100,
        purpose: "Seasonal store inventory",
        status: "disbursed",
        credit_score: 760,
        officer_remarks: "Disbursed via Kadapa gold desk.",
        sanctioned_amount: 25e4,
        created_at: "2025-06-15T10:00:00Z"
      }
    ],
    loan_documents: [],
    collateral_details: [],
    guarantors: [],
    loan_sanctions: [],
    disbursements: [],
    emi_schedules: [
      { id: 1, application_id: 3, installment_number: 1, due_date: "2026-07-20", emi_amount: 22100, principal_component: 19808, interest_component: 2292, remaining_balance: 230192, payment_status: "paid", paid_date: "2026-07-19" },
      { id: 2, application_id: 3, installment_number: 2, due_date: "2026-08-20", emi_amount: 22100, principal_component: 19990, interest_component: 2110, remaining_balance: 210202, payment_status: "paid", paid_date: "2026-08-18" },
      { id: 3, application_id: 3, installment_number: 3, due_date: "2026-09-20", emi_amount: 22100, principal_component: 20173, interest_component: 1927, remaining_balance: 190029, payment_status: "paid", paid_date: "2026-09-20" },
      { id: 4, application_id: 3, installment_number: 4, due_date: "2026-10-20", emi_amount: 22100, principal_component: 20358, interest_component: 1742, remaining_balance: 169671, payment_status: "pending", paid_date: null }
    ],
    payments: [
      {
        id: 1,
        payment_ref: "TT-TXN-20261010-4102",
        bbps_ref_no: "BBPS9081245102",
        user_id: 1,
        payment_category: "electricity",
        operator_name: "APSPDCL (Southern Power AP)",
        account_identifier: "1009823412034",
        amount: 1420,
        payment_mode: "wallet",
        status: "SUCCESS",
        created_at: "2026-10-10T16:20:00Z"
      }
    ],
    demat_applications: [
      {
        id: 1,
        user_id: 1,
        client_code: "TT-KDP-89104",
        dp_id: "IN300128-10049281",
        depository: "NSDL",
        linked_bank_account: "\u2022\u2022\u2022\u2022 4821",
        linked_bank_ifsc: "SBIN0000840",
        status: "active",
        created_at: "2025-05-10T10:00:00Z"
      }
    ],
    investment_portfolios: [
      { id: 1, user_id: 1, asset_symbol: "RELIANCE", asset_name: "Reliance Industries Ltd", category: "equity", quantity: 25, avg_buy_price: 2850, current_price: 2945.6, invested_amount: 71250, current_valuation: 73640 },
      { id: 2, user_id: 1, asset_symbol: "TCS", asset_name: "Tata Consultancy Services Ltd", category: "equity", quantity: 15, avg_buy_price: 3950, current_price: 4120.75, invested_amount: 59250, current_valuation: 61811.25 },
      { id: 3, user_id: 1, asset_symbol: "UTI_NIFTY50", asset_name: "UTI Nifty 50 Index Fund Direct", category: "mutual_fund", quantity: 124.5, avg_buy_price: 1200, current_price: 1380, invested_amount: 149400, current_valuation: 171810 },
      { id: 4, user_id: 1, asset_symbol: "GOLDBEES", asset_name: "Nippon India Gold ETF (24K)", category: "gold_etf", quantity: 1500, avg_buy_price: 60, current_price: 68.45, invested_amount: 9e4, current_valuation: 102675 },
      { id: 5, user_id: 1, asset_symbol: "GOI_718_2033", asset_name: "7.18% GS 2033 Sovereign Bond", category: "sovereign_bond", quantity: 500, avg_buy_price: 100, current_price: 101.4, invested_amount: 5e4, current_valuation: 50700 }
    ],
    watchlists: [
      { id: 1, user_id: 1, symbol: "RELIANCE", added_at: (/* @__PURE__ */ new Date()).toISOString() },
      { id: 2, user_id: 1, symbol: "TCS", added_at: (/* @__PURE__ */ new Date()).toISOString() },
      { id: 3, user_id: 1, symbol: "GOLDBEES", added_at: (/* @__PURE__ */ new Date()).toISOString() }
    ],
    stock_orders: [
      {
        id: 1,
        order_ref: "NSE-SIM-20261011",
        user_id: 1,
        symbol: "RELIANCE",
        order_type: "BUY",
        quantity: 25,
        executed_price: 2850,
        total_order_value: 71250,
        status: "EXECUTED",
        is_simulated: true,
        created_at: "2026-10-11T10:15:00Z"
      },
      {
        id: 2,
        order_ref: "NSE-SIM-20261012",
        user_id: 1,
        symbol: "TCS",
        order_type: "BUY",
        quantity: 15,
        executed_price: 3950,
        total_order_value: 59250,
        status: "EXECUTED",
        is_simulated: true,
        created_at: "2026-10-12T11:30:00Z"
      }
    ],
    mutual_funds: [
      { id: 1, fund_code: "UTI_NIFTY50", fund_name: "UTI Nifty 50 Index Fund Direct-Growth", fund_house: "UTI Mutual Fund", category: "Large Cap Index", risk_level: "Very High", cagr_1y: 19.4, cagr_3y: 16.8, cagr_5y: 14.5, current_nav: 1380, nav: 1380, min_sip_amount: 500, fund_size_cr: 18500, aum_cr: 18500, expense_ratio_pct: 0.2, expense_ratio: 0.2, fund_manager: "Sharwan Kumar Goyal" },
      { id: 2, fund_code: "PARAG_PARIKH", fund_name: "Parag Parikh Flexi Cap Fund Direct-Growth", fund_house: "PPFAS Mutual Fund", category: "Flexi Cap", risk_level: "High", cagr_1y: 24.1, cagr_3y: 21.4, cagr_5y: 19.8, current_nav: 82.4, nav: 82.4, min_sip_amount: 1e3, fund_size_cr: 68e3, aum_cr: 68e3, expense_ratio_pct: 0.65, expense_ratio: 0.65, fund_manager: "Rajeev Thakkar" },
      { id: 3, fund_code: "NIPPON_SMALL", fund_name: "Nippon India Small Cap Fund Direct-Growth", fund_house: "Nippon India Mutual Fund", category: "Small Cap", risk_level: "Very High", cagr_1y: 31.2, cagr_3y: 28.6, cagr_5y: 24.2, current_nav: 164.2, nav: 164.2, min_sip_amount: 500, fund_size_cr: 49e3, aum_cr: 49e3, expense_ratio_pct: 0.7, expense_ratio: 0.7, fund_manager: "Samir Rachh" },
      { id: 4, fund_code: "ICICI_PRU_BAL", fund_name: "ICICI Prudential Balanced Advantage Direct-Growth", fund_house: "ICICI Prudential AMC", category: "Dynamic Asset Hybrid", risk_level: "Moderate", cagr_1y: 15.6, cagr_3y: 14.2, cagr_5y: 13.1, current_nav: 71.8, nav: 71.8, min_sip_amount: 500, fund_size_cr: 58e3, aum_cr: 58e3, expense_ratio_pct: 0.85, expense_ratio: 0.85, fund_manager: "Sankaran Naren" },
      { id: 5, fund_code: "MIRA_TAX_SAVER", fund_name: "Mirae Asset ELSS Tax Saver Direct-Growth", fund_house: "Mirae Asset Investment Managers", category: "ELSS (Section 80C)", risk_level: "Very High", cagr_1y: 21.5, cagr_3y: 18.9, cagr_5y: 17.2, current_nav: 44.6, nav: 44.6, min_sip_amount: 500, fund_size_cr: 24e3, aum_cr: 24e3, expense_ratio_pct: 0.58, expense_ratio: 0.58, fund_manager: "Neelesh Surana" }
    ],
    mutual_fund_orders: [],
    sips: [
      { id: 1, mandate_ref: "SIP-MANDATE-2026-01", user_id: 1, fund_id: 1, monthly_amount: 2e3, debit_day: 10, next_debit_date: "2026-11-10", status: "active" },
      { id: 2, mandate_ref: "SIP-MANDATE-2026-02", user_id: 1, fund_id: 2, monthly_amount: 3e3, debit_day: 5, next_debit_date: "2026-11-05", status: "active" }
    ],
    notifications: [
      { id: 1, user_id: 1, title: "Gold Loan EMI Due in 6 Days", message: "Your monthly EMI of \u20B922,100 for Gold Loan #TF-LN-2025-0814 is due on next Monday.", category: "reminder", is_read: false, created_at: "2026-10-14T08:00:00Z" },
      { id: 2, user_id: 1, title: "SIP Auto-Debit Mandate Authorized", message: "e-Mandate for \u20B92,000 in UTI Nifty 50 Index Fund scheduled for 10th of every month.", category: "investments", is_read: true, created_at: "2026-10-10T12:00:00Z" },
      { id: 3, user_id: 1, title: "Business Loan In Review", message: "Application #TF-LN-2026-9481 is assigned to Credit Officer Lakshmi Narayana Rao.", category: "loans", is_read: true, created_at: "2026-10-12T16:00:00Z" }
    ],
    agents: [
      {
        id: 1,
        user_id: 3,
        agent_code: "TF-DSA-042",
        agency_name: "Rayalaseema Financial Associates",
        operating_region: "Kadapa, Proddatur & Pulivendula",
        commission_rate_pct: 1,
        total_leads_count: 14,
        total_disbursed_volume: 65e5,
        commission_earned: 64500,
        status: "active"
      }
    ],
    agent_leads: [
      {
        id: 1,
        agent_id: 3,
        agent_code: "TF-DSA-042",
        applicant_name: "Venkata Ramana Reddy",
        phone: "9440112233",
        email: "ramana.v@gmail.com",
        loan_product: "Business Loan",
        requested_amount: 15e5,
        location: "Kadapa City",
        commission_rate_pct: 1,
        commission_amount: 15e3,
        status: "In Review",
        notes: "Kadapa MSME textile store owner expansion",
        created_at: "2026-10-15"
      },
      {
        id: 2,
        agent_id: 3,
        agent_code: "TF-DSA-042",
        applicant_name: "Kavitha Anjaneyulu",
        phone: "9848099881",
        email: "kavitha.a@gmail.com",
        loan_product: "Home Loan",
        requested_amount: 35e5,
        location: "Proddatur",
        commission_rate_pct: 0.4,
        commission_amount: 14e3,
        status: "Disbursed",
        notes: "Villa purchase in Proddatur RTC Colony",
        created_at: "2026-10-10"
      },
      {
        id: 3,
        agent_id: 3,
        agent_code: "TF-DSA-042",
        applicant_name: "Chandrasekhar Raju",
        phone: "9440776655",
        email: "raju.c@yahoo.com",
        loan_product: "Personal Loan",
        requested_amount: 4e5,
        location: "Pulivendula",
        commission_rate_pct: 1.25,
        commission_amount: 5e3,
        status: "Contacted",
        notes: "Medical emergency enquiry in Pulivendula",
        created_at: "2026-10-18"
      }
    ],
    audit_logs: [
      {
        id: 1,
        actor_id: 2,
        action_type: "SYSTEM_BOOT",
        entity_name: "system",
        entity_id: "kadapa-hub",
        details: { event: "Node.js Express relational engine started" },
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      }
    ],
    wallet_transactions: [
      {
        id: 1,
        user_id: 1,
        transaction_type: "credit",
        amount: 26270,
        balance_after: 26270,
        description: "Initial Wallet Credit via UPI Sandbox (ramesh@okaxis)",
        reference_id: "WAL-INIT-20261001",
        created_at: "2026-10-01T10:00:00Z"
      },
      {
        id: 2,
        user_id: 1,
        transaction_type: "debit",
        amount: 1420,
        balance_after: 24850,
        description: "BBPS Utility Bill Payment - APSPDCL (Southern Power AP)",
        reference_id: "TT-TXN-20261010-4102",
        created_at: "2026-10-10T16:20:00Z"
      }
    ]
  };
}
function loadRelationalDB() {
  const init = getInitialRelationalDB();
  try {
    if (fs.existsSync(FALLBACK_DB_PATH)) {
      const data = fs.readFileSync(FALLBACK_DB_PATH, "utf8");
      const parsed = JSON.parse(data);
      if (!parsed.agent_leads) {
        parsed.agent_leads = init.agent_leads;
      }
      if (!parsed.wallet_transactions) {
        parsed.wallet_transactions = init.wallet_transactions;
      }
      if (parsed.users) {
        const seedSuper = init.users.find((u) => u.email === "superadmin@tatitofinance.com");
        const existingSuper = parsed.users.find((u) => u.email === "superadmin@tatitofinance.com");
        if (!existingSuper && seedSuper) {
          const maxId = parsed.users.reduce((max, u) => Math.max(max, u.id || 0), 0);
          parsed.users.push({ ...seedSuper, id: Math.max(5, maxId + 1) });
          saveRelationalDB(parsed);
        } else if (existingSuper) {
          existingSuper.role = "super_admin";
          existingSuper.is_active = true;
          const colliding = parsed.users.filter((u) => u.id === existingSuper.id);
          if (colliding.length > 1) {
            const maxId = parsed.users.reduce((max, u) => Math.max(max, u.id || 0), 0);
            existingSuper.id = maxId + 1;
            saveRelationalDB(parsed);
          }
        }
      }
      if (parsed.mutual_funds) {
        parsed.mutual_funds = parsed.mutual_funds.map((f) => {
          const seedFund = init.mutual_funds.find((sf) => sf.id === f.id);
          return { ...seedFund, ...f, nav: f.nav ?? f.current_nav, aum_cr: f.aum_cr ?? f.fund_size_cr, expense_ratio: f.expense_ratio ?? f.expense_ratio_pct, cagr_1y: f.cagr_1y ?? seedFund?.cagr_1y ?? 18, fund_house: f.fund_house ?? seedFund?.fund_house ?? "Direct AMC" };
        });
      }
      return parsed;
    }
  } catch (e) {
    console.error("Error loading fallback relational DB:", e);
  }
  saveRelationalDB(init);
  return init;
}
function isProduction() {
  return process.env.NODE_ENV === "production";
}
function saveRelationalDB(state) {
  if (isProduction() || process.env.DATA_STORE_MODE !== "demo") {
    return;
  }
  try {
    fs.writeFileSync(FALLBACK_DB_PATH, JSON.stringify(state, null, 2), "utf8");
  } catch (e) {
    console.error("Error saving fallback relational DB:", e);
  }
}
var relationalDB = loadRelationalDB();
var DatabaseUnavailableError = class extends Error {
  constructor(message = "PostgreSQL database is currently unavailable in production mode. Data mutations are disabled.") {
    super(message);
    this.name = "DatabaseUnavailableError";
    this.statusCode = 503;
  }
};
function checkDatabaseAccess() {
  if (isProduction()) {
    if (!postgresConnected && !(process.env.VERCEL === "1" && process.env.DATA_STORE_MODE === "demo")) {
      throw new DatabaseUnavailableError("PostgreSQL database is required in production mode and is currently unavailable.");
    }
  } else if (!postgresConnected && process.env.DATA_STORE_MODE !== "demo") {
    if (process.env.NODE_ENV !== "test") {
      console.warn("[Data Store] Operating on in-memory storage without explicit DATA_STORE_MODE=demo");
    }
  }
}
function isPostgresConnected() {
  return postgresConnected;
}
async function runMigrations(pgPool) {
  const client = await pgPool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        version VARCHAR(100) UNIQUE NOT NULL,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    const appliedRes = await client.query("SELECT version FROM schema_migrations");
    const appliedSet = new Set(appliedRes.rows.map((r) => r.version));
    const migrationsDir = path.resolve(process.cwd(), "database/migrations");
    const appliedThisRun = [];
    if (fs.existsSync(migrationsDir)) {
      const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith(".sql")).sort();
      for (const file of files) {
        if (!appliedSet.has(file)) {
          console.log(`[PostgreSQL Migration] Applying migration: ${file}...`);
          const filePath = path.join(migrationsDir, file);
          let rawSql = fs.readFileSync(filePath, "utf8");
          const lines = rawSql.split("\n");
          const resolvedLines = [];
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith("\\i ")) {
              const relPath = trimmed.slice(3).trim();
              const incPath = path.resolve(process.cwd(), relPath);
              if (fs.existsSync(incPath)) {
                resolvedLines.push(fs.readFileSync(incPath, "utf8"));
              } else {
                console.warn(`[Migration Warning] Include path not found: ${relPath}`);
              }
            } else {
              resolvedLines.push(line);
            }
          }
          const finalSql = resolvedLines.join("\n");
          await client.query("BEGIN");
          try {
            await client.query(finalSql);
            await client.query("INSERT INTO schema_migrations (version) VALUES ($1)", [file]);
            await client.query("COMMIT");
            appliedThisRun.push(file);
            console.log(`[PostgreSQL Migration] Successfully applied: ${file}`);
          } catch (migErr) {
            await client.query("ROLLBACK");
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
async function initPostgres() {
  if (!pool) {
    postgresConnected = false;
    return false;
  }
  try {
    const testResult = await pool.query("SELECT NOW() as server_time");
    postgresConnected = true;
    console.log("[PostgreSQL] Connected successfully at:", testResult.rows[0]?.server_time);
    await runMigrations(pool);
    return true;
  } catch (err) {
    postgresConnected = false;
    if (isProduction()) {
      console.error("[PostgreSQL Connection Error in Production]:", err.message);
    } else {
      console.warn("[PostgreSQL Connection Notice] Operating on fallback store:", err.message);
    }
    return false;
  }
}
async function dbQuery(text, params = []) {
  checkDatabaseAccess();
  if (pool && postgresConnected) {
    try {
      const res = await pool.query(text, params);
      return { rows: res.rows, rowCount: res.rowCount || 0 };
    } catch (e) {
      console.warn("PostgreSQL query execution error:", e.message);
      throw e;
    }
  }
  return { rows: [], rowCount: 0 };
}
var dbRepository = {
  users: {
    async findByEmail(email) {
      checkDatabaseAccess();
      const cleanEmail = email.toLowerCase().trim();
      if (postgresConnected) {
        const res = await dbQuery("SELECT * FROM users WHERE LOWER(email) = $1 LIMIT 1", [cleanEmail]);
        if (res.rows.length > 0) return res.rows[0];
        return null;
      }
      return relationalDB.users.find((u) => u.email.toLowerCase() === cleanEmail) || null;
    },
    async findById(id) {
      checkDatabaseAccess();
      if (postgresConnected) {
        const res = await dbQuery("SELECT * FROM users WHERE id = $1 LIMIT 1", [id]);
        if (res.rows.length > 0) return res.rows[0];
        return null;
      }
      return relationalDB.users.find((u) => u.id === id) || null;
    },
    async getAll(roleFilter) {
      checkDatabaseAccess();
      if (postgresConnected) {
        let query = "SELECT id, full_name, email, phone, role, wallet_balance, is_active, is_verified, created_at FROM users";
        const params = [];
        if (roleFilter) {
          query += " WHERE role = $1";
          params.push(roleFilter);
        }
        query += " ORDER BY id ASC";
        const res = await dbQuery(query, params);
        return res.rows;
      }
      let list = relationalDB.users;
      if (roleFilter) list = list.filter((u) => u.role === roleFilter);
      return list.map(({ password_hash: _, ...safe }) => safe);
    },
    async create(user) {
      checkDatabaseAccess();
      if (postgresConnected) {
        const res = await dbQuery(
          `INSERT INTO users (full_name, email, phone, password_hash, role, wallet_balance, is_active, is_verified)
           VALUES ($1, $2, $3, $4, $5, $6, true, true)
           RETURNING *;`,
          [user.full_name, user.email, user.phone, user.password_hash, user.role, user.wallet_balance || 25e3]
        );
        if (res.rows.length > 0) {
          const inserted = res.rows[0];
          relationalDB.users.push(inserted);
          saveRelationalDB(relationalDB);
          return inserted;
        }
      }
      const newId = relationalDB.users.length > 0 ? Math.max(...relationalDB.users.map((u) => u.id)) + 1 : 1;
      const newUser = {
        id: newId,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        password_hash: user.password_hash,
        role: user.role,
        wallet_balance: user.wallet_balance || 25e3,
        is_active: true,
        is_verified: true,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      relationalDB.users.push(newUser);
      saveRelationalDB(relationalDB);
      return newUser;
    },
    async updateWallet(userId, newBalance) {
      checkDatabaseAccess();
      if (postgresConnected) {
        await dbQuery("UPDATE users SET wallet_balance = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [newBalance, userId]);
      }
      const u = relationalDB.users.find((item) => item.id === userId);
      if (u) {
        u.wallet_balance = newBalance;
        saveRelationalDB(relationalDB);
      }
    },
    async updateRole(userId, newRole) {
      checkDatabaseAccess();
      if (postgresConnected) {
        await dbQuery("UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [newRole, userId]);
      }
      const u = relationalDB.users.find((item) => item.id === userId);
      if (u) {
        u.role = newRole;
        saveRelationalDB(relationalDB);
      }
    },
    async updateStatus(userId, isActive) {
      checkDatabaseAccess();
      if (postgresConnected) {
        await dbQuery("UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [isActive, userId]);
      }
      const u = relationalDB.users.find((item) => item.id === userId);
      if (u) {
        u.is_active = isActive;
        saveRelationalDB(relationalDB);
      }
    },
    async updatePassword(userId, newPasswordHash) {
      checkDatabaseAccess();
      if (postgresConnected) {
        await dbQuery("UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [newPasswordHash, userId]);
      }
      const u = relationalDB.users.find((item) => item.id === userId);
      if (u) {
        u.password_hash = newPasswordHash;
        saveRelationalDB(relationalDB);
      }
    }
  },
  wallet: {
    async getTransactions(userId) {
      checkDatabaseAccess();
      if (postgresConnected) {
        const res = await dbQuery("SELECT * FROM wallet_transactions WHERE user_id = $1 ORDER BY id DESC", [userId]);
        return res.rows;
      }
      relationalDB.wallet_transactions = relationalDB.wallet_transactions || [];
      return relationalDB.wallet_transactions.filter((t) => t.user_id === userId);
    },
    async recordTransaction(data) {
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
        id: relationalDB.wallet_transactions.length > 0 ? Math.max(...relationalDB.wallet_transactions.map((t) => t.id || 0)) + 1 : 1,
        ...data,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      relationalDB.wallet_transactions.unshift(newTxn);
      saveRelationalDB(relationalDB);
      return newTxn;
    }
  },
  profiles: {
    async getByUserId(userId) {
      checkDatabaseAccess();
      if (postgresConnected) {
        const res = await dbQuery("SELECT * FROM user_profiles WHERE user_id = $1 LIMIT 1", [userId]);
        if (res.rows.length > 0) return res.rows[0];
        return null;
      }
      return relationalDB.user_profiles.find((p) => p.user_id === userId) || null;
    },
    async upsert(userId, data) {
      checkDatabaseAccess();
      if (postgresConnected) {
        const res = await dbQuery(
          `INSERT INTO user_profiles (user_id, city, state, annual_income, occupation_type)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (user_id) DO UPDATE SET
             city = COALESCE($2, user_profiles.city),
             state = COALESCE($3, user_profiles.state),
             annual_income = COALESCE($4, user_profiles.annual_income),
             occupation_type = COALESCE($5, user_profiles.occupation_type),
             updated_at = CURRENT_TIMESTAMP
           RETURNING *;`,
          [userId, data.city, data.state, data.annual_income, data.occupation_type]
        );
        if (res.rows.length > 0) {
          return res.rows[0];
        }
      }
      let profile = relationalDB.user_profiles.find((p) => p.user_id === userId);
      if (!profile) {
        profile = { user_id: userId, ...data };
        relationalDB.user_profiles.push(profile);
      } else {
        Object.assign(profile, data);
      }
      saveRelationalDB(relationalDB);
      return profile;
    }
  },
  kyc: {
    async getByUserId(userId) {
      checkDatabaseAccess();
      if (postgresConnected) {
        const res = await dbQuery("SELECT * FROM kyc_records WHERE user_id = $1 ORDER BY id DESC", [userId]);
        return res.rows;
      }
      return relationalDB.kyc_records.filter((k) => k.user_id === userId);
    },
    async upsertRecord(userId, docType, maskedNum, provider, remarks, verificationStatus = "sandbox_simulated") {
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
      const existingIdx = relationalDB.kyc_records.findIndex((k) => k.user_id === userId && k.document_type === docType);
      const record = {
        id: existingIdx !== -1 ? relationalDB.kyc_records[existingIdx].id : relationalDB.kyc_records.length + 1,
        user_id: userId,
        document_type: docType,
        document_number_masked: maskedNum,
        verification_status: verificationStatus,
        verification_provider: provider,
        verified_at: (/* @__PURE__ */ new Date()).toISOString(),
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
        const res = await dbQuery("SELECT * FROM loan_products WHERE is_active = true ORDER BY id ASC");
        if (res.rows.length > 0) return res.rows;
      }
      return relationalDB.loan_products;
    },
    async getProductById(id) {
      checkDatabaseAccess();
      if (postgresConnected) {
        const res = await dbQuery("SELECT * FROM loan_products WHERE id = $1 LIMIT 1", [id]);
        if (res.rows.length > 0) return res.rows[0];
      }
      return relationalDB.loan_products.find((p) => p.id === id) || null;
    },
    async updateProduct(id, data) {
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
      const prod = relationalDB.loan_products.find((p) => p.id === id);
      if (prod) {
        if (data.base_interest_rate !== void 0) prod.base_interest_rate = data.base_interest_rate;
        if (data.min_amount !== void 0) prod.min_amount = data.min_amount;
        if (data.max_amount !== void 0) prod.max_amount = data.max_amount;
        saveRelationalDB(relationalDB);
        return prod;
      }
      return null;
    },
    async getAllApplications(statusFilter) {
      checkDatabaseAccess();
      if (postgresConnected) {
        let query = "SELECT * FROM loan_applications";
        const params = [];
        if (statusFilter && statusFilter !== "all") {
          query += " WHERE status = $1";
          params.push(statusFilter);
        }
        query += " ORDER BY id DESC";
        const res = await dbQuery(query, params);
        return res.rows;
      }
      let list = relationalDB.loan_applications;
      if (statusFilter && statusFilter !== "all") {
        list = list.filter((a) => a.status === statusFilter);
      }
      return list;
    },
    async getApplicationsByUser(userId) {
      checkDatabaseAccess();
      if (postgresConnected) {
        const res = await dbQuery("SELECT * FROM loan_applications WHERE user_id = $1 ORDER BY id DESC", [userId]);
        return res.rows;
      }
      return relationalDB.loan_applications.filter((a) => a.user_id === userId);
    },
    async getApplicationById(id) {
      checkDatabaseAccess();
      if (postgresConnected) {
        const res = await dbQuery("SELECT * FROM loan_applications WHERE id = $1 LIMIT 1", [id]);
        if (res.rows.length > 0) return res.rows[0];
      }
      return relationalDB.loan_applications.find((a) => a.id === id) || null;
    },
    async createApplication(appData) {
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
            appData.application_no,
            appData.user_id,
            appData.product_id,
            appData.applicant_name,
            appData.phone,
            appData.email,
            appData.monthly_income,
            appData.requested_amount,
            appData.interest_rate,
            appData.tenure_months,
            appData.calculated_emi,
            appData.purpose,
            appData.status || "submitted",
            appData.officer_remarks || null,
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
      const newId = relationalDB.loan_applications.length > 0 ? Math.max(...relationalDB.loan_applications.map((a) => a.id || 0)) + 1 : 1;
      const appWithId = { id: newId, ...appData };
      relationalDB.loan_applications.unshift(appWithId);
      saveRelationalDB(relationalDB);
      return appWithId;
    },
    async updateApplicationDecision(id, decision, remarks, sanctionedAmount, calculatedEmi) {
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
      const app2 = relationalDB.loan_applications.find((a) => a.id === id);
      if (app2) {
        app2.status = decision;
        if (remarks) app2.officer_remarks = remarks;
        if (sanctionedAmount) app2.sanctioned_amount = sanctionedAmount;
        if (calculatedEmi) app2.calculated_emi = calculatedEmi;
        if (decision === "approved" || decision === "sanctioned") {
          app2.sanctioned_at = (/* @__PURE__ */ new Date()).toISOString();
        }
        saveRelationalDB(relationalDB);
      }
      return app2 || null;
    },
    async getEmiSchedules(applicationId) {
      checkDatabaseAccess();
      if (postgresConnected) {
        let query = "SELECT * FROM emi_schedules";
        const params = [];
        if (applicationId) {
          query += " WHERE application_id = $1";
          params.push(applicationId);
        }
        query += " ORDER BY installment_number ASC";
        const res = await dbQuery(query, params);
        return res.rows;
      }
      if (applicationId) {
        return relationalDB.emi_schedules.filter((s) => s.application_id === applicationId);
      }
      return relationalDB.emi_schedules;
    },
    async createEmiSchedules(schedules) {
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
    async markEmiPaid(scheduleId, paidDate) {
      checkDatabaseAccess();
      if (postgresConnected) {
        await dbQuery("UPDATE emi_schedules SET payment_status = $1, paid_date = $2 WHERE id = $3", ["paid", paidDate, scheduleId]);
      }
      const s = relationalDB.emi_schedules.find((item) => item.id === scheduleId);
      if (s) {
        s.payment_status = "paid";
        s.paid_date = paidDate;
        saveRelationalDB(relationalDB);
      }
    }
  },
  payments: {
    async getByUser(userId) {
      checkDatabaseAccess();
      if (postgresConnected) {
        const res = await dbQuery("SELECT * FROM payments WHERE user_id = $1 ORDER BY id DESC", [userId]);
        return res.rows;
      }
      return relationalDB.payments.filter((p) => p.user_id === userId);
    },
    async findByIdempotencyKey(key) {
      checkDatabaseAccess();
      if (!key) return null;
      if (postgresConnected) {
        const res = await dbQuery("SELECT * FROM payments WHERE idempotency_key = $1 LIMIT 1", [key]);
        return res.rows[0] || null;
      }
      return relationalDB.payments.find((p) => p.idempotency_key === key) || null;
    },
    async create(data) {
      checkDatabaseAccess();
      if (postgresConnected) {
        const res = await dbQuery(
          `INSERT INTO payments (payment_ref, bbps_ref_no, user_id, application_id, payment_category, operator_name, account_identifier, amount, payment_mode, status, idempotency_key, meta_json)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           RETURNING *;`,
          [
            data.payment_ref,
            data.bbps_ref_no || null,
            data.user_id,
            data.application_id || null,
            data.payment_category,
            data.operator_name,
            data.account_identifier,
            data.amount,
            data.payment_mode || "wallet",
            data.status || "SUCCESS",
            data.idempotency_key || null,
            JSON.stringify(data.meta_json || {})
          ]
        );
        if (res.rows.length > 0) {
          return res.rows[0];
        }
      }
      const newPay = {
        id: relationalDB.payments.length > 0 ? Math.max(...relationalDB.payments.map((p) => p.id || 0)) + 1 : 1,
        ...data,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      relationalDB.payments.unshift(newPay);
      saveRelationalDB(relationalDB);
      return newPay;
    },
    async executeAtomicWalletPayment(params) {
      checkDatabaseAccess();
      if (postgresConnected && pool) {
        const client = await pool.connect();
        try {
          await client.query("BEGIN");
          let balanceAfter2 = 0;
          if (params.paymentMode === "wallet") {
            const userRes = await client.query("SELECT id, wallet_balance, is_active FROM users WHERE id = $1 FOR UPDATE", [params.userId]);
            if (userRes.rows.length === 0) {
              const err = new Error("User account not found");
              err.statusCode = 404;
              throw err;
            }
            if (!userRes.rows[0].is_active) {
              const err = new Error("User account is deactivated");
              err.statusCode = 403;
              throw err;
            }
            const currentBalance2 = parseFloat(userRes.rows[0].wallet_balance);
            if (currentBalance2 < params.amount) {
              const err = new Error(`Insufficient wallet balance (\u20B9${currentBalance2}) for payment of \u20B9${params.amount}`);
              err.statusCode = 400;
              throw err;
            }
            balanceAfter2 = currentBalance2 - params.amount;
            await client.query("UPDATE users SET wallet_balance = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [balanceAfter2, params.userId]);
            await client.query(
              `INSERT INTO wallet_transactions (user_id, transaction_type, amount, balance_after, description, reference_id)
               VALUES ($1, 'debit', $2, $3, $4, $5);`,
              [params.userId, params.amount, balanceAfter2, `Payment for ${params.operator}`, params.idempotencyKey || `TXN-${Date.now()}`]
            );
          } else {
            const userRes = await client.query("SELECT wallet_balance FROM users WHERE id = $1", [params.userId]);
            balanceAfter2 = userRes.rows.length > 0 ? parseFloat(userRes.rows[0].wallet_balance) : 0;
          }
          const txnRef2 = `TT-TXN-${Date.now().toString().slice(-8)}`;
          const bbpsRef2 = `BBPS${Math.floor(1e9 + Math.random() * 9e9)}`;
          const payRes = await client.query(
            `INSERT INTO payments (payment_ref, bbps_ref_no, user_id, application_id, payment_category, operator_name, account_identifier, amount, payment_mode, status, idempotency_key, meta_json)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
             RETURNING *;`,
            [
              txnRef2,
              bbpsRef2,
              params.userId,
              params.applicationId || null,
              params.category,
              params.operator,
              params.accountIdentifier,
              params.amount,
              params.paymentMode,
              params.status,
              params.idempotencyKey || null,
              JSON.stringify(params.metaJson || {})
            ]
          );
          await client.query("COMMIT");
          return {
            payment: payRes.rows[0],
            newBalance: balanceAfter2
          };
        } catch (e) {
          await client.query("ROLLBACK");
          throw e;
        } finally {
          client.release();
        }
      }
      const user = relationalDB.users.find((u) => u.id === params.userId);
      if (!user) {
        const err = new Error("User not found");
        err.statusCode = 404;
        throw err;
      }
      if (!user.is_active) {
        const err = new Error("User account is deactivated");
        err.statusCode = 403;
        throw err;
      }
      const currentBalance = parseFloat(user.wallet_balance || 0);
      let balanceAfter = currentBalance;
      if (params.paymentMode === "wallet") {
        if (currentBalance < params.amount) {
          const err = new Error(`Insufficient wallet balance (\u20B9${currentBalance}) for payment of \u20B9${params.amount}`);
          err.statusCode = 400;
          throw err;
        }
        balanceAfter = currentBalance - params.amount;
        user.wallet_balance = balanceAfter;
      }
      const txnRef = `TT-TXN-${Date.now().toString().slice(-8)}`;
      const bbpsRef = `BBPS${Math.floor(1e9 + Math.random() * 9e9)}`;
      const newPay = {
        id: relationalDB.payments.length > 0 ? Math.max(...relationalDB.payments.map((p) => p.id || 0)) + 1 : 1,
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
        created_at: (/* @__PURE__ */ new Date()).toISOString()
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
    async getPortfolioByUser(userId) {
      checkDatabaseAccess();
      if (postgresConnected) {
        const res = await dbQuery("SELECT * FROM investment_portfolios WHERE user_id = $1 ORDER BY id ASC", [userId]);
        return res.rows;
      }
      return relationalDB.investment_portfolios.filter((p) => p.user_id === userId);
    },
    async upsertHolding(userId, symbol, name, category, qty, totalCost, currentPrice) {
      checkDatabaseAccess();
      if (postgresConnected) {
        const existing = await dbQuery("SELECT * FROM investment_portfolios WHERE user_id = $1 AND asset_symbol = $2 LIMIT 1", [userId, symbol]);
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
      const existingInRel = relationalDB.investment_portfolios.find((p) => p.user_id === userId && p.asset_symbol === symbol);
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
          created_at: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
      saveRelationalDB(relationalDB);
    },
    async getWatchlist(userId) {
      checkDatabaseAccess();
      if (postgresConnected) {
        const res = await dbQuery("SELECT symbol FROM watchlists WHERE user_id = $1 ORDER BY id ASC", [userId]);
        return res.rows.map((r) => r.symbol);
      }
      return relationalDB.watchlists.filter((w) => w.user_id === userId).map((w) => w.symbol);
    },
    async toggleWatchlist(userId, symbol) {
      checkDatabaseAccess();
      const upper = symbol.toUpperCase().trim();
      if (postgresConnected) {
        const check = await dbQuery("SELECT id FROM watchlists WHERE user_id = $1 AND symbol = $2", [userId, upper]);
        if (check.rows.length > 0) {
          await dbQuery("DELETE FROM watchlists WHERE user_id = $1 AND symbol = $2", [userId, upper]);
          return { watched: false, symbol: upper };
        } else {
          await dbQuery("INSERT INTO watchlists (user_id, symbol) VALUES ($1, $2)", [userId, upper]);
          return { watched: true, symbol: upper };
        }
      }
      const idx = relationalDB.watchlists.findIndex((w) => w.user_id === userId && w.symbol === upper);
      if (idx !== -1) {
        relationalDB.watchlists.splice(idx, 1);
        saveRelationalDB(relationalDB);
        return { watched: false, symbol: upper };
      } else {
        relationalDB.watchlists.push({
          id: relationalDB.watchlists.length + 1,
          user_id: userId,
          symbol: upper,
          added_at: (/* @__PURE__ */ new Date()).toISOString()
        });
        saveRelationalDB(relationalDB);
        return { watched: true, symbol: upper };
      }
    },
    async getStockOrders(userId) {
      checkDatabaseAccess();
      if (postgresConnected) {
        const res = await dbQuery("SELECT * FROM stock_orders WHERE user_id = $1 ORDER BY id DESC", [userId]);
        return res.rows;
      }
      return (relationalDB.stock_orders || []).filter((o) => o.user_id === userId);
    },
    async createStockOrder(data) {
      checkDatabaseAccess();
      if (postgresConnected) {
        const res = await dbQuery(
          `INSERT INTO stock_orders (order_ref, user_id, symbol, order_type, quantity, executed_price, total_order_value, status, is_simulated)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
           RETURNING *;`,
          [data.order_ref, data.user_id, data.symbol, data.order_type, data.quantity, data.executed_price, data.total_order_value, data.status || "EXECUTED"]
        );
        if (res.rows.length > 0) return res.rows[0];
      }
      const orderWithId = {
        id: relationalDB.stock_orders.length > 0 ? Math.max(...relationalDB.stock_orders.map((o) => o.id || 0)) + 1 : 1,
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
        const res = await dbQuery("SELECT * FROM mutual_funds ORDER BY id ASC");
        if (res.rows.length > 0) rows = res.rows;
      }
      return rows.map((f) => ({
        ...f,
        nav: Number(f.nav ?? f.current_nav ?? 100),
        current_nav: Number(f.current_nav ?? f.nav ?? 100),
        aum_cr: Number(f.aum_cr ?? f.fund_size_cr ?? 1e4),
        fund_size_cr: Number(f.fund_size_cr ?? f.aum_cr ?? 1e4),
        expense_ratio: Number(f.expense_ratio ?? f.expense_ratio_pct ?? 0.5),
        expense_ratio_pct: Number(f.expense_ratio_pct ?? f.expense_ratio ?? 0.5),
        cagr_1y: Number(f.cagr_1y ?? (Number(f.cagr_3y || 15) + 2.2).toFixed(1)),
        fund_house: f.fund_house || "Direct Plan AMC"
      }));
    },
    async getFundById(id) {
      const funds = await this.getMutualFunds();
      return funds.find((f) => f.id === id) || null;
    },
    async getSips(userId) {
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
      return relationalDB.sips.filter((s) => s.user_id === userId && s.status !== "cancelled").map((s) => {
        const fund = relationalDB.mutual_funds.find((f) => f.id === s.fund_id);
        return {
          ...s,
          fund_name: fund?.fund_name || "Direct Growth Fund",
          fund_category: fund?.category || "Equity"
        };
      });
    },
    async createSip(data) {
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
      const newId = relationalDB.sips && relationalDB.sips.length > 0 ? Math.max(...relationalDB.sips.map((s) => s.id || 0)) + 1 : 1;
      const sipWithId = { id: newId, status: "active", ...data };
      relationalDB.sips.unshift(sipWithId);
      saveRelationalDB(relationalDB);
      return sipWithId;
    },
    async deleteSip(sipId, userId) {
      checkDatabaseAccess();
      if (postgresConnected) {
        await dbQuery("UPDATE sips SET status = $1 WHERE id = $2 AND user_id = $3", ["cancelled", sipId, userId]);
      }
      const s = relationalDB.sips.find((item) => item.id === sipId && item.user_id === userId);
      if (s) {
        s.status = "cancelled";
        saveRelationalDB(relationalDB);
      }
    },
    async getDemat(userId) {
      checkDatabaseAccess();
      if (postgresConnected) {
        const res = await dbQuery("SELECT * FROM demat_applications WHERE user_id = $1 LIMIT 1", [userId]);
        if (res.rows.length > 0) return res.rows[0];
      }
      return relationalDB.demat_applications.find((d) => d.user_id === userId) || null;
    },
    async createDemat(data) {
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
      const existing = relationalDB.demat_applications.find((d) => d.user_id === data.user_id);
      if (existing) {
        existing.status = "active";
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
        const appsRes = await dbQuery("SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status IN ('submitted', 'under_review')) as pending, COUNT(*) FILTER (WHERE status IN ('approved', 'sanctioned', 'disbursed')) as approved, COUNT(*) FILTER (WHERE status = 'rejected') as rejected, COALESCE(SUM(CASE WHEN status = 'disbursed' THEN COALESCE(sanctioned_amount, requested_amount) ELSE 0 END), 0) as disbursed_volume FROM loan_applications");
        const aumRes = await dbQuery("SELECT COALESCE(SUM(current_valuation), 0) as aum FROM investment_portfolios");
        return {
          total_users: parseInt(usersRes.rows[0]?.count || "0", 10),
          total_applications: parseInt(appsRes.rows[0]?.total || "0", 10),
          pending_underwriting: parseInt(appsRes.rows[0]?.pending || "0", 10),
          approved_loans: parseInt(appsRes.rows[0]?.approved || "0", 10),
          rejected_loans: parseInt(appsRes.rows[0]?.rejected || "0", 10),
          total_disbursed_volume: parseFloat(appsRes.rows[0]?.disbursed_volume || "0"),
          total_wealth_aum: parseFloat(aumRes.rows[0]?.aum || "0"),
          branch_name: "Kadapa Central Hub, Andhra Pradesh"
        };
      }
      const totalUsers = relationalDB.users.filter((u) => u.role === "customer").length;
      const totalApps = relationalDB.loan_applications.length;
      const pendingApps = relationalDB.loan_applications.filter((a) => a.status === "submitted" || a.status === "under_review").length;
      const approvedApps = relationalDB.loan_applications.filter((a) => a.status === "approved" || a.status === "sanctioned" || a.status === "disbursed").length;
      const rejectedApps = relationalDB.loan_applications.filter((a) => a.status === "rejected").length;
      const totalDisbursed = relationalDB.loan_applications.filter((a) => a.status === "disbursed").reduce((sum, a) => sum + (a.sanctioned_amount || a.requested_amount), 0);
      const totalAum = relationalDB.investment_portfolios.reduce((sum, h) => sum + h.current_valuation, 0);
      return {
        total_users: totalUsers,
        total_applications: totalApps,
        pending_underwriting: pendingApps,
        approved_loans: approvedApps,
        rejected_loans: rejectedApps,
        total_disbursed_volume: totalDisbursed,
        total_wealth_aum: totalAum,
        branch_name: "Kadapa Central Hub, Andhra Pradesh"
      };
    },
    async getAuditLogs(limit = 50) {
      checkDatabaseAccess();
      if (postgresConnected) {
        const res = await dbQuery("SELECT * FROM audit_logs ORDER BY id DESC LIMIT $1", [limit]);
        return res.rows;
      }
      return relationalDB.audit_logs.slice(0, limit);
    }
  },
  agents: {
    async getByUserId(userId) {
      checkDatabaseAccess();
      if (postgresConnected) {
        const res = await dbQuery("SELECT * FROM agents WHERE user_id = $1 LIMIT 1", [userId]);
        if (res.rows.length > 0) return res.rows[0];
      }
      return relationalDB.agents.find((a) => a.user_id === userId) || null;
    },
    async getAll() {
      checkDatabaseAccess();
      if (postgresConnected) {
        const res = await dbQuery("SELECT * FROM agents ORDER BY id ASC");
        return res.rows;
      }
      return relationalDB.agents;
    },
    async getLeads(agentId, role) {
      checkDatabaseAccess();
      if (postgresConnected) {
        let query = "SELECT * FROM agent_leads";
        const params = [];
        if (role !== "admin" && agentId) {
          query += " WHERE agent_id = $1";
          params.push(agentId);
        }
        query += " ORDER BY id DESC";
        const res = await dbQuery(query, params);
        return res.rows;
      }
      const list = relationalDB.agent_leads || [];
      if (role === "admin") return list;
      return list.filter((l) => l.agent_id === agentId);
    },
    async createLead(leadData) {
      checkDatabaseAccess();
      if (postgresConnected) {
        const res = await dbQuery(
          `INSERT INTO agent_leads (
            agent_id, agent_code, applicant_name, phone, email, loan_product,
            requested_amount, location, commission_rate_pct, commission_amount, status, notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          RETURNING *;`,
          [
            leadData.agent_id,
            leadData.agent_code,
            leadData.applicant_name,
            leadData.phone,
            leadData.email,
            leadData.loan_product,
            leadData.requested_amount,
            leadData.location || "Kadapa",
            leadData.commission_rate_pct,
            leadData.commission_amount,
            leadData.status || "Contacted",
            leadData.notes || null
          ]
        );
        await dbQuery(
          "UPDATE agents SET total_leads_count = total_leads_count + 1 WHERE user_id = $1",
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
      const newId = relationalDB.agent_leads.length > 0 ? Math.max(...relationalDB.agent_leads.map((l) => l.id || 0)) + 1 : 1;
      const newLead = { id: newId, ...leadData, created_at: (/* @__PURE__ */ new Date()).toISOString().split("T")[0] };
      relationalDB.agent_leads.unshift(newLead);
      const agent = relationalDB.agents.find((a) => a.user_id === leadData.agent_id);
      if (agent) agent.total_leads_count += 1;
      saveRelationalDB(relationalDB);
      return newLead;
    },
    async getCommissions(agentId) {
      checkDatabaseAccess();
      if (postgresConnected) {
        const res = await dbQuery(
          `SELECT 
             COALESCE(SUM(CASE WHEN status = 'Disbursed' THEN commission_amount ELSE 0 END), 0) as total_earned,
             COALESCE(SUM(CASE WHEN status != 'Disbursed' THEN commission_amount ELSE 0 END), 0) as pending_pipeline
           FROM agent_leads
           ${agentId ? "WHERE agent_id = $1" : ""}`,
          agentId ? [agentId] : []
        );
        const earned = parseFloat(res.rows[0]?.total_earned || "0");
        const pending = parseFloat(res.rows[0]?.pending_pipeline || "0");
        return { total_earned: earned, pending_pipeline: pending };
      }
      const list = relationalDB.agent_leads || [];
      const agentList = agentId ? list.filter((l) => l.agent_id === agentId) : list;
      const totalEarned = agentList.filter((l) => l.status === "Disbursed").reduce((sum, l) => sum + parseFloat(l.commission_amount || 0), 0);
      const pendingCommission = agentList.filter((l) => l.status !== "Disbursed").reduce((sum, l) => sum + parseFloat(l.commission_amount || 0), 0);
      return { total_earned: totalEarned, pending_pipeline: pendingCommission };
    }
  },
  notifications: {
    async getByUser(userId) {
      checkDatabaseAccess();
      if (postgresConnected) {
        const res = await dbQuery("SELECT * FROM notifications WHERE user_id = $1 ORDER BY id DESC", [userId]);
        return res.rows;
      }
      return relationalDB.notifications.filter((n) => n.user_id === userId);
    },
    async create(data) {
      checkDatabaseAccess();
      if (postgresConnected) {
        const res = await dbQuery(
          `INSERT INTO notifications (user_id, title, message, category, is_read)
           VALUES ($1, $2, $3, $4, false)
           RETURNING *;`,
          [data.user_id, data.title, data.message, data.category || "general"]
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
        category: data.category || "general",
        is_read: false,
        created_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      relationalDB.notifications.unshift(newNotif);
      saveRelationalDB(relationalDB);
      return newNotif;
    },
    async markAllRead(userId) {
      checkDatabaseAccess();
      if (postgresConnected) {
        await dbQuery("UPDATE notifications SET is_read = true WHERE user_id = $1", [userId]);
      }
      relationalDB.notifications.forEach((n) => {
        if (n.user_id === userId) n.is_read = true;
      });
      saveRelationalDB(relationalDB);
    },
    async markRead(id, userId) {
      checkDatabaseAccess();
      if (postgresConnected) {
        await dbQuery("UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2", [id, userId]);
      }
      const notif = relationalDB.notifications.find((n) => n.id === id && n.user_id === userId);
      if (notif) notif.is_read = true;
      saveRelationalDB(relationalDB);
      return notif;
    }
  }
};
function logAudit(actorId, actionType, entityName, entityId, details = {}) {
  const audit = {
    id: relationalDB.audit_logs.length + 1,
    actor_id: actorId,
    action_type: actionType,
    entity_name: entityName,
    entity_id: entityId,
    details,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  relationalDB.audit_logs.unshift(audit);
  saveRelationalDB(relationalDB);
  if (postgresConnected) {
    dbQuery(
      `INSERT INTO audit_logs (actor_id, action_type, entity_name, entity_id, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [actorId, actionType, entityName, entityId, JSON.stringify(details)]
    ).catch((e) => console.warn("Postgres audit log error:", e.message));
  }
  return audit;
}

// backend/routes/auth.routes.ts
import { Router } from "express";

// backend/middleware/auth.ts
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
var DEFAULT_DEV_SECRET = "tatito-kadapa-dev-secret-key-only-2026";
function getJwtSecret() {
  const isProd2 = process.env.NODE_ENV === "production";
  const secret = process.env.JWT_SECRET;
  if (isProd2) {
    if (!secret || secret === DEFAULT_DEV_SECRET || secret.length < 32) {
      throw new Error(
        "FATAL SECURITY VIOLATION: Production environment requires a strong, environment-configured JWT_SECRET of at least 32 characters."
      );
    }
    return secret;
  }
  return secret || DEFAULT_DEV_SECRET;
}
var JWT_EXPIRES_IN = "7d";
function generateToken(user) {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    fullName: user.full_name
  };
  return jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN });
}
async function hashPassword(plainText) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainText, salt);
}
async function verifyPassword(plainText, hash) {
  if (!hash || !hash.startsWith("$2a$") && !hash.startsWith("$2b$")) {
    return false;
  }
  return bcrypt.compare(plainText, hash);
}
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Unauthorized",
      detail: "Missing or malformed Authorization header. Expected Bearer <token>"
    });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    const user = await dbRepository.users.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized", detail: "User account not found" });
    }
    if (!user.is_active) {
      return res.status(403).json({ error: "Forbidden", detail: "User account is deactivated or suspended" });
    }
    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.full_name
    };
    next();
  } catch (err) {
    return res.status(401).json({
      error: "Unauthorized",
      detail: "Invalid or expired session token. Please re-authenticate."
    });
  }
}
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized", detail: "Authentication required" });
    }
    const effectiveAllowed = allowedRoles.includes("admin") && !allowedRoles.includes("super_admin") ? [...allowedRoles, "super_admin"] : allowedRoles;
    if (!effectiveAllowed.includes(req.user.role)) {
      return res.status(403).json({
        error: "Forbidden",
        detail: `Access restricted. Your active role '${req.user.role}' lacks permissions for this endpoint. Required: [${effectiveAllowed.join(", ")}]`
      });
    }
    next();
  };
}

// backend/middleware/rateLimiter.ts
var loginAttempts = /* @__PURE__ */ new Map();
var MAX_ATTEMPTS = 15;
var WINDOW_MS = 15 * 60 * 1e3;
function authRateLimiter(req, res, next) {
  if (process.env.NODE_ENV === "test") {
    return next();
  }
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const email = (req.body && req.body.email ? String(req.body.email) : "").trim().toLowerCase();
  const key = `${ip}_${email}`;
  const now = Date.now();
  const record = loginAttempts.get(key);
  if (record) {
    if (now - record.firstAttempt > WINDOW_MS) {
      loginAttempts.set(key, { count: 1, firstAttempt: now });
      return next();
    }
    if (record.count >= MAX_ATTEMPTS) {
      return res.status(429).json({
        error: "Too Many Requests",
        detail: "Exceeded maximum login attempts. Please wait 15 minutes before trying again."
      });
    }
    record.count++;
  } else {
    loginAttempts.set(key, { count: 1, firstAttempt: now });
  }
  next();
}
function resetAuthRateLimit(req) {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const email = (req.body && req.body.email ? String(req.body.email) : "").trim().toLowerCase();
  const key = `${ip}_${email}`;
  loginAttempts.delete(key);
}

// backend/routes/auth.routes.ts
var router = Router();
router.post("/register", authRateLimiter, async (req, res) => {
  try {
    const { full_name, email, phone, password, role, city, state, annual_income } = req.body;
    if (!full_name || !email || !phone || !password) {
      return res.status(400).json({ error: "Validation Error", detail: "full_name, email, phone, and password are required" });
    }
    if (role && (role === "admin" || role === "super_admin" || role === "credit_officer")) {
      return res.status(403).json({
        error: "Forbidden",
        detail: "Administrative and Credit Officer roles cannot be self-assigned via public registration. Contact the system administrator."
      });
    }
    const cleanEmail = email.toLowerCase().trim();
    const existing = await dbRepository.users.findByEmail(cleanEmail);
    if (existing) {
      return res.status(409).json({ error: "Conflict", detail: "An account with this email already exists" });
    }
    const hashedPassword = await hashPassword(password);
    const newUser = await dbRepository.users.create({
      full_name: full_name.trim(),
      email: cleanEmail,
      phone: phone.trim(),
      password_hash: hashedPassword,
      role: "customer",
      wallet_balance: 25e3
    });
    await dbRepository.profiles.upsert(newUser.id, {
      city: city || "Kadapa",
      state: state || "Andhra Pradesh",
      annual_income: parseFloat(annual_income) || 75e4,
      occupation_type: "Salaried"
    });
    await dbRepository.notifications.create({
      user_id: newUser.id,
      title: "Welcome to Tatito Financial Services!",
      message: "Your account has been registered. You can explore borrowing, investing in mutual funds, and trading.",
      category: "general"
    });
    logAudit(newUser.id, "REGISTER", "users", String(newUser.id), { email: cleanEmail, role: newUser.role });
    const token = generateToken(newUser);
    const { password_hash: _, ...safeUser } = newUser;
    return res.status(201).json({
      access_token: token,
      token_type: "bearer",
      user: safeUser
    });
  } catch (err) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: "Service Unavailable", detail: err.message });
    }
    console.error("Register error:", err);
    return res.status(500).json({ error: "Internal Error", detail: err.message });
  }
});
router.post("/login", authRateLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Bad Request", detail: "Email and password are required" });
    }
    const cleanEmail = email.toLowerCase().trim();
    const user = await dbRepository.users.findByEmail(cleanEmail);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized", detail: "Invalid email or password" });
    }
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: "Unauthorized", detail: "Invalid email or password" });
    }
    if (!user.is_active) {
      return res.status(403).json({ error: "Forbidden", detail: "Account has been deactivated. Contact branch." });
    }
    resetAuthRateLimit(req);
    const token = generateToken(user);
    const { password_hash: _, ...safeUser } = user;
    logAudit(user.id, "LOGIN", "users", String(user.id), { ip: req.ip });
    return res.json({
      access_token: token,
      token_type: "bearer",
      user: safeUser
    });
  } catch (err) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: "Service Unavailable", detail: err.message });
    }
    console.error("Login error:", err);
    return res.status(500).json({ error: "Internal Error", detail: err.message });
  }
});
router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await dbRepository.users.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: "Not Found", detail: "User profile not found" });
    const { password_hash: _, ...safeUser } = user;
    const profile = await dbRepository.profiles.getByUserId(user.id) || {};
    return res.json({ ...safeUser, profile });
  } catch (err) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: "Service Unavailable", detail: err.message });
    }
    return res.status(500).json({ error: "Internal Error", detail: err.message });
  }
});
router.post("/logout", (req, res) => {
  res.json({ message: "Logged out successfully" });
});
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Bad Request", detail: "Email address is required" });
    }
    const cleanEmail = String(email).toLowerCase().trim();
    const user = await dbRepository.users.findByEmail(cleanEmail);
    const refId = `PWD-RESET-${Date.now()}`;
    if (user) {
      logAudit(user.id, "FORGOT_PASSWORD_REQUEST", "users", String(user.id), { referenceId: refId });
    }
    return res.json({
      status: "OTP_DISPATCHED_SANDBOX",
      is_sandbox: true,
      sandbox_otp_hint: "849201",
      referenceId: refId,
      message: "If the email exists, a simulated password reset OTP (849201 in Test Sandbox) has been dispatched."
    });
  } catch (err) {
    return res.status(500).json({ error: "Internal Error", detail: err.message });
  }
});
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, new_password } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Bad Request", detail: "Email is required" });
    }
    if (new_password) {
      if (!otp || otp !== "849201" && otp !== "123456") {
        return res.status(400).json({
          error: "Invalid OTP",
          detail: "Invalid or expired sandbox reset OTP. Use 849201 for sandbox verification."
        });
      }
      if (String(new_password).length < 8) {
        return res.status(400).json({
          error: "Validation Error",
          detail: "New password must be at least 8 characters long."
        });
      }
      const user = await dbRepository.users.findByEmail(String(email).toLowerCase().trim());
      if (!user) {
        return res.status(404).json({ error: "Not Found", detail: "Account not found for this email" });
      }
      const hashed = await hashPassword(String(new_password));
      await dbRepository.users.updatePassword(user.id, hashed);
      logAudit(user.id, "RESET_PASSWORD_SUCCESS", "users", String(user.id), { mode: "sandbox_otp" });
      return res.json({
        status: "PASSWORD_UPDATED",
        message: "Password has been reset successfully. You may now sign in with your new credentials.",
        referenceId: `PWD-RESET-${Date.now()}`
      });
    }
    return res.json({
      message: "If the email exists, a simulated password reset OTP has been dispatched.",
      sandbox_otp_hint: "849201",
      referenceId: `PWD-RESET-${Date.now()}`
    });
  } catch (err) {
    return res.status(500).json({ error: "Internal Error", detail: err.message });
  }
});
router.post("/verify-otp", (req, res) => {
  const { identifier, otp } = req.body;
  if (!otp || String(otp).length < 4) {
    return res.status(400).json({ error: "Bad Request", detail: "Valid 6-digit OTP is required" });
  }
  const isValidTestOtp = otp === "123456" || otp === "849201";
  if (!isValidTestOtp) {
    return res.status(400).json({
      error: "OTP Verification Failed",
      detail: "Invalid test OTP code. Use 123456 or 849201 in Development Sandbox."
    });
  }
  return res.json({
    status: "SANDBOX_OTP_VERIFIED",
    is_sandbox: true,
    is_simulated: true,
    verified: true,
    identifier: identifier || "sandbox-user",
    disclaimer: "DEVELOPMENT SANDBOX OTP: For testing only. Not connected to live telecom SMS gateway."
  });
});
var auth_routes_default = router;

// backend/routes/users.routes.ts
import { Router as Router2 } from "express";
var router2 = Router2();
router2.get("/profile", requireAuth, async (req, res) => {
  try {
    const user = await dbRepository.users.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    const profile = await dbRepository.profiles.getByUserId(user.id) || {};
    const kyc = await dbRepository.kyc.getByUserId(user.id);
    const demat = await dbRepository.investments.getDemat(user.id);
    const { password_hash: _, ...safeUser } = user;
    return res.json({
      ...safeUser,
      profile,
      kyc_records: kyc,
      demat_account: demat
    });
  } catch (err) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: "Service Unavailable", detail: err.message });
    }
    return res.status(500).json({ error: "Internal Error", detail: err.message });
  }
});
router2.put("/profile", requireAuth, async (req, res) => {
  try {
    const user = await dbRepository.users.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    const { full_name, phone, city, state, annual_income, occupation_type } = req.body;
    const updatedProfile = await dbRepository.profiles.upsert(user.id, {
      city: city ? city.trim() : void 0,
      state: state ? state.trim() : void 0,
      annual_income: annual_income !== void 0 ? parseFloat(annual_income) : void 0,
      occupation_type
    });
    logAudit(user.id, "UPDATE_PROFILE", "user_profiles", String(user.id), { updatedFields: req.body });
    const { password_hash: _, ...safeUser } = user;
    return res.json({ ...safeUser, profile: updatedProfile });
  } catch (err) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: "Service Unavailable", detail: err.message });
    }
    return res.status(500).json({ error: "Internal Error", detail: err.message });
  }
});
router2.post("/deposit", requireAuth, async (req, res) => {
  try {
    const user = await dbRepository.users.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    const amt = parseFloat(req.body.amount);
    if (!amt || amt <= 0) {
      return res.status(400).json({ error: "Bad Request", detail: "Valid positive amount required" });
    }
    const currentBalance = parseFloat(user.wallet_balance || 0);
    const newBalance = currentBalance + amt;
    await dbRepository.users.updateWallet(user.id, newBalance);
    const paymentRef = `DEP-${Date.now()}`;
    await dbRepository.payments.create({
      payment_ref: paymentRef,
      user_id: user.id,
      payment_category: "wallet_deposit",
      operator_name: "IMPS Bank Transfer Sandbox",
      account_identifier: user.phone,
      amount: amt,
      payment_mode: "netbanking",
      status: "SUCCESS"
    });
    await dbRepository.notifications.create({
      user_id: user.id,
      title: "Wallet Funded",
      message: `\u20B9${amt.toLocaleString("en-IN")} deposited into wallet. Reference: ${paymentRef}`,
      category: "investments"
    });
    logAudit(user.id, "WALLET_DEPOSIT", "payments", paymentRef, { amount: amt });
    return res.json({
      wallet_balance: newBalance,
      reference: paymentRef,
      message: "Deposit simulated successfully"
    });
  } catch (err) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: "Service Unavailable", detail: err.message });
    }
    return res.status(500).json({ error: "Internal Error", detail: err.message });
  }
});
router2.get("/wallet", requireAuth, async (req, res) => {
  try {
    const user = await dbRepository.users.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    const transactions = await dbRepository.wallet.getTransactions(user.id);
    const payments = await dbRepository.payments.getByUser(user.id);
    return res.json({
      user_id: user.id,
      wallet_balance: parseFloat(user.wallet_balance || 0),
      currency: "INR",
      is_sandbox: true,
      transactions,
      recent_payments: payments.slice(0, 10),
      compliance_notice: "SANDBOX WALLET LEDGER: Simulated NBFC internal escrow & payment gateway."
    });
  } catch (err) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: "Service Unavailable", detail: err.message });
    }
    return res.status(500).json({ error: "Internal Error", detail: err.message });
  }
});
router2.get("/wallet/transactions", requireAuth, async (req, res) => {
  try {
    const transactions = await dbRepository.wallet.getTransactions(req.user.userId);
    return res.json(transactions);
  } catch (err) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: "Service Unavailable", detail: err.message });
    }
    return res.status(500).json({ error: "Internal Error", detail: err.message });
  }
});
router2.post("/wallet/add-money", requireAuth, async (req, res) => {
  try {
    const user = await dbRepository.users.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    const amt = parseFloat(req.body.amount);
    const mode = req.body.payment_mode || "upi_sandbox";
    if (!amt || isNaN(amt) || amt <= 0 || amt > 5e5) {
      return res.status(400).json({ error: "Bad Request", detail: "Valid deposit amount between \u20B91 and \u20B95,00,000 is required" });
    }
    const currentBalance = parseFloat(user.wallet_balance || 0);
    const newBalance = currentBalance + amt;
    await dbRepository.users.updateWallet(user.id, newBalance);
    const refId = `WAL-CR-${Date.now()}`;
    const txn = await dbRepository.wallet.recordTransaction({
      user_id: user.id,
      transaction_type: "credit",
      amount: amt,
      balance_after: newBalance,
      description: `Wallet Top-Up via ${String(mode).toUpperCase()} [SANDBOX]`,
      reference_id: refId
    });
    await dbRepository.payments.create({
      payment_ref: refId,
      user_id: user.id,
      payment_category: "wallet_deposit",
      operator_name: `Tatito ${String(mode).toUpperCase()} Gateway Sandbox`,
      account_identifier: user.phone,
      amount: amt,
      payment_mode: mode,
      status: "DEMO_SUCCESS"
    });
    logAudit(user.id, "WALLET_ADD_MONEY", "wallet_transactions", refId, { amount: amt, mode });
    return res.status(201).json({
      status: "DEMO_SUCCESS",
      is_simulated: true,
      wallet_balance: newBalance,
      reference: refId,
      transaction: txn,
      message: `\u20B9${amt.toLocaleString("en-IN")} credited to your Tatito Wallet [Sandbox Simulation]`
    });
  } catch (err) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: "Service Unavailable", detail: err.message });
    }
    return res.status(500).json({ error: "Internal Error", detail: err.message });
  }
});
router2.post("/wallet/withdraw", requireAuth, async (req, res) => {
  try {
    const user = await dbRepository.users.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    const amt = parseFloat(req.body.amount);
    const bankAccount = req.body.bank_account || "SBI Kadapa \u2022\u2022\u2022\u2022 4821";
    if (!amt || isNaN(amt) || amt <= 0) {
      return res.status(400).json({ error: "Bad Request", detail: "Valid positive withdrawal amount required" });
    }
    const currentBalance = parseFloat(user.wallet_balance || 0);
    if (currentBalance < amt) {
      return res.status(400).json({
        error: "Insufficient Balance",
        detail: `Insufficient wallet balance (\u20B9${currentBalance.toLocaleString("en-IN")}) for withdrawal of \u20B9${amt.toLocaleString("en-IN")}`
      });
    }
    const newBalance = currentBalance - amt;
    await dbRepository.users.updateWallet(user.id, newBalance);
    const refId = `WAL-DR-${Date.now()}`;
    const txn = await dbRepository.wallet.recordTransaction({
      user_id: user.id,
      transaction_type: "debit",
      amount: amt,
      balance_after: newBalance,
      description: `IMPS Settlement to ${bankAccount} [SANDBOX]`,
      reference_id: refId
    });
    logAudit(user.id, "WALLET_WITHDRAW", "wallet_transactions", refId, { amount: amt, bankAccount });
    return res.json({
      status: "DEMO_SUCCESS",
      is_simulated: true,
      wallet_balance: newBalance,
      reference: refId,
      transaction: txn,
      message: `\u20B9${amt.toLocaleString("en-IN")} initiated to ${bankAccount} via simulated IMPS`
    });
  } catch (err) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: "Service Unavailable", detail: err.message });
    }
    return res.status(500).json({ error: "Internal Error", detail: err.message });
  }
});
var users_routes_default = router2;

// backend/routes/kyc.routes.ts
import { Router as Router3 } from "express";

// integrations/index.ts
function isLivePartnerConfigured(key) {
  if (process.env.LIVE_FINANCIAL_PARTNERS !== "true") return false;
  if (!key || key === "123" || key.startsWith("MOCK") || key.length < 16) return false;
  return true;
}
var KycAdapter = class {
  async verifyDocument(req) {
    const isLive = isLivePartnerConfigured(process.env.KYC_PROVIDER_API_KEY);
    const cleanDoc = (req.documentNumber || "").trim().toUpperCase();
    if (req.documentType === "pan") {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(cleanDoc)) {
        return {
          isVerified: false,
          isFormatValid: false,
          status: "INVALID_FORMAT",
          environment: isLive ? "LIVE" : "SANDBOX",
          provider: isLive ? "NSDL KRA Production Gateway" : "DigiLocker / KRA Sandbox Simulator [DEMO]",
          referenceId: `KYC-ERR-${Date.now()}`,
          maskedId: cleanDoc.slice(0, 2) + "****",
          details: { error: "Invalid 10-character alphanumeric PAN format (e.g. ABCDE1234F)" },
          isLive,
          isMock: !isLive,
          complianceNote: "Validation failed: Document does not match statutory Income Tax PAN structure."
        };
      }
    } else if (req.documentType === "aadhaar") {
      const cleanAadhaar = cleanDoc.replace(/[\s-]/g, "");
      if (!/^\d{12}$/.test(cleanAadhaar)) {
        return {
          isVerified: false,
          isFormatValid: false,
          status: "INVALID_FORMAT",
          environment: isLive ? "LIVE" : "SANDBOX",
          provider: isLive ? "UIDAI Production Gateway" : "UIDAI OTP Sandbox Simulator [DEMO]",
          referenceId: `KYC-ERR-${Date.now()}`,
          maskedId: "XXXX-XXXX-" + cleanAadhaar.slice(-4),
          details: { error: "Invalid 12-digit Aadhaar number format" },
          isLive,
          isMock: !isLive,
          complianceNote: "Validation failed: Aadhaar must be 12 numeric digits."
        };
      }
    }
    const masked = req.documentType === "pan" ? `${cleanDoc.slice(0, 2)}****${cleanDoc.slice(-1)}` : `XXXX-XXXX-${cleanDoc.slice(-4)}`;
    if (!isLive) {
      return {
        isVerified: false,
        // Sandbox simulation cannot be presented as genuine verified identity
        isFormatValid: true,
        status: "SANDBOX_SIMULATED",
        environment: "SANDBOX",
        provider: "DigiLocker / KRA Sandbox Simulator [DEMO]",
        referenceId: `KYC-REF-${Date.now()}`,
        maskedId: masked,
        details: {
          nameMatch: true,
          source: "Income Tax Department (ITD) / UIDAI Sandbox Format Validator",
          verifiedName: req.fullName,
          statutoryVerification: false
        },
        isLive: false,
        isMock: true,
        complianceNote: "Simulated e-KYC response in Sandbox prototype environment. Not an authorized biometric or statutory verification."
      };
    }
    const providerUrl = process.env.KYC_PROVIDER_ENDPOINT_URL || "https://api.digitallocker.gov.in/public/oauth2/1/xml/kyc";
    const apiKey = process.env.KYC_PROVIDER_API_KEY;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4e3);
      const response = await fetch(providerUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "X-Provider-Client": "Tatito-Financial-Services-Kadapa"
        },
        body: JSON.stringify({
          document_type: req.documentType,
          document_number: cleanDoc,
          full_name: req.fullName,
          dob: req.dob,
          otp: req.otp
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        return {
          isVerified: false,
          isFormatValid: true,
          status: "UNAVAILABLE",
          environment: "LIVE",
          provider: "NSDL KRA / DigiLocker Live Gateway",
          referenceId: `KYC-ERR-${Date.now()}`,
          maskedId: masked,
          details: { error: `Live provider returned HTTP ${response.status}` },
          isLive: true,
          isMock: false,
          complianceNote: `Live KYC provider authentication failed with status ${response.status}. Document could not be verified.`
        };
      }
      const providerData = await response.json();
      if (providerData && (providerData.verified === true || providerData.status === "SUCCESS")) {
        return {
          isVerified: true,
          isFormatValid: true,
          status: "VERIFIED",
          environment: "LIVE",
          provider: "NSDL KRA / DigiLocker Live Gateway",
          referenceId: providerData.transaction_id || `KYC-LIVE-${Date.now()}`,
          maskedId: masked,
          details: providerData,
          isLive: true,
          isMock: false,
          complianceNote: "Genuine identity verification confirmed by authenticated live provider response."
        };
      } else {
        return {
          isVerified: false,
          isFormatValid: true,
          status: "UNAVAILABLE",
          environment: "LIVE",
          provider: "NSDL KRA / DigiLocker Live Gateway",
          referenceId: `KYC-REJ-${Date.now()}`,
          maskedId: masked,
          details: providerData || { error: "Document record not confirmed by issuer" },
          isLive: true,
          isMock: false,
          complianceNote: "Live provider could not verify document details with central repository."
        };
      }
    } catch (err) {
      return {
        isVerified: false,
        isFormatValid: true,
        status: "UNAVAILABLE",
        environment: "LIVE",
        provider: "NSDL KRA / DigiLocker Live Gateway",
        referenceId: `KYC-UNAVAIL-${Date.now()}`,
        maskedId: masked,
        details: { error: err.message || "Provider connection timeout" },
        isLive: true,
        isMock: false,
        complianceNote: "Live KYC provider endpoint unavailable or timed out. Verification cannot be confirmed."
      };
    }
  }
};
var CreditBureauAdapter = class {
  async pullCreditScore(pan, phone) {
    const isLive = isLivePartnerConfigured(process.env.CREDIT_BUREAU_MEMBER_ID);
    let hash = 0;
    for (let i = 0; i < pan.length; i++) hash += pan.charCodeAt(i);
    const score = 720 + hash % 60;
    return {
      score,
      ratingCategory: score >= 750 ? "Excellent" : "Good",
      activeAccounts: 3,
      enquiriesLast6Months: 1,
      reportReference: `CIBIL-REPORT-${Date.now()}`,
      environment: isLive ? "LIVE" : "SANDBOX",
      isLive,
      isMock: !isLive,
      isSimulated: !isLive,
      complianceNotice: isLive ? "Live credit bureau enquiry record retrieved from bureau node." : "DEMO BENCHMARK: Simulated credit score for demonstration. Not pulled from TransUnion CIBIL or Experian."
    };
  }
};
var ESignAdapter = class {
  async initiateAadhaarSign(req) {
    const isLive = isLivePartnerConfigured(process.env.ESIGN_PROVIDER_SECRET);
    return {
      signingUrl: isLive ? `https://esign.digitallocker.gov.in/sign/${req.applicationNo}` : `https://esign-sandbox.tatito.in/sign/${req.applicationNo}`,
      transactionId: `ESIGN-${Date.now()}`,
      environment: isLive ? "LIVE" : "SANDBOX",
      isLive,
      isMock: !isLive,
      complianceNote: isLive ? "Live Aadhaar e-Sign initiated via licensed ESP." : "DEMO SANDBOX: Simulated Aadhaar e-Sign sandbox URL. No legally binding digital contract executed."
    };
  }
};
var MandateAdapter = class {
  async registerMandate(req) {
    const isLive = isLivePartnerConfigured(process.env.MANDATE_API_KEY);
    return {
      umrn: `TATITO${Math.floor(1e9 + Math.random() * 9e9)}`,
      mandateStatus: isLive ? "ACTIVE_REGISTERED" : "MOCK_SANDBOX_ACTIVE",
      environment: isLive ? "LIVE" : "SANDBOX",
      isLive,
      isMock: !isLive,
      complianceNote: isLive ? "Live NPCI e-NACH mandate registered with sponsor bank." : "DEMO SANDBOX: Simulated NPCI e-NACH auto-debit mandate. No actual bank account debit authorization."
    };
  }
};
var PaymentGatewayAdapter = class {
  async createPaymentOrder(intent) {
    const isLive = isLivePartnerConfigured(process.env.PAYMENT_GATEWAY_SECRET);
    return {
      orderId: `ORDER_${Date.now()}`,
      amount: intent.amount,
      environment: isLive ? "LIVE" : "SANDBOX",
      isLive,
      isMock: !isLive,
      complianceNote: isLive ? "Live payment gateway order created." : "DEMO SANDBOX: Simulated payment intent. No actual banking clearing or card charge."
    };
  }
};
var LendingPartnerAdapter = class {
  async submitForUnderwriting(appData) {
    const isLive = isLivePartnerConfigured(process.env.CO_LENDING_PARTNER_API_KEY);
    return {
      partnerName: "Rayalaseema Credit Consortium / State Bank Partner",
      sanctionStatus: "approved",
      approvedAmount: appData.requestedAmount || 5e5,
      recommendedRate: appData.interestRate || 14,
      environment: isLive ? "LIVE" : "SANDBOX",
      isLive,
      isMock: !isLive,
      complianceNote: isLive ? "Underwriting submitted to live lending partner consortium." : "DEMO SANDBOX: Indicative co-lending assessment for demonstration. Subject to physical verification."
    };
  }
};
var DepositoryParticipantAdapter = class {
  async verifyDematStatus(clientCode) {
    const isLive = isLivePartnerConfigured(process.env.NSDL_DP_GATEWAY_KEY);
    return {
      dpId: "IN300128-10049281",
      depository: "NSDL",
      isActive: true,
      environment: isLive ? "LIVE" : "SANDBOX",
      isLive,
      isMock: !isLive,
      complianceNote: isLive ? "Live NSDL Depository participant response." : "DEMO SANDBOX: Simulated Depository Participant account. Tatito is not a SEBI-registered broker."
    };
  }
};
function buildTimeframes(basePrice, isPositive) {
  const dir = isPositive ? 1 : -1;
  const gen = (count, stepVolatility, startFactor, prefix) => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      const progress = i / Math.max(1, count - 1);
      const wave = Math.sin(i * 0.9) * stepVolatility;
      const val = basePrice * (startFactor + (1 - startFactor) * progress) + wave * dir;
      arr.push({
        label: `${prefix}${i + 1}`,
        price: Number(Math.max(10, val).toFixed(2))
      });
    }
    arr[arr.length - 1].price = basePrice;
    return arr;
  };
  return {
    "1D": [
      { label: "09:15", price: Number((basePrice * (1 - dir * 8e-3)).toFixed(2)) },
      { label: "10:30", price: Number((basePrice * (1 - dir * 5e-3)).toFixed(2)) },
      { label: "11:45", price: Number((basePrice * (1 - dir * 2e-3)).toFixed(2)) },
      { label: "13:00", price: Number((basePrice * (1 + dir * 1e-3)).toFixed(2)) },
      { label: "14:15", price: Number((basePrice * (1 - dir * 1e-3)).toFixed(2)) },
      { label: "15:30", price: basePrice }
    ],
    "1W": gen(7, basePrice * 8e-3, isPositive ? 0.97 : 1.03, "D"),
    "1M": gen(10, basePrice * 0.015, isPositive ? 0.94 : 1.05, "W"),
    "3M": gen(12, basePrice * 0.025, isPositive ? 0.89 : 1.08, "W"),
    "1Y": gen(12, basePrice * 0.04, isPositive ? 0.78 : 0.92, "M"),
    "5Y": gen(10, basePrice * 0.06, 0.48, "Y")
  };
}
var MarketDataAdapter = class _MarketDataAdapter {
  static {
    this.MOCK_QUOTES = [
      {
        symbol: "RELIANCE",
        name: "Reliance Industries Ltd",
        price: 2945.6,
        change: -12.4,
        changePct: -0.42,
        change_percent: -0.42,
        high: 2975,
        low: 2938.1,
        high_52w: 3217.9,
        low_52w: 2220.3,
        market_cap_cr: 1993450,
        pe_ratio: 28.4,
        sector: "Energy & Conglomerate",
        sparkline: [2962, 2958.4, 2951.2, 2955, 2949.8, 2945.6],
        timeframes: buildTimeframes(2945.6, false),
        isSimulated: true,
        isLive: false,
        environment: "SANDBOX"
      },
      {
        symbol: "TCS",
        name: "Tata Consultancy Services",
        price: 4120.75,
        change: 38.9,
        changePct: 0.95,
        change_percent: 0.95,
        high: 4145,
        low: 4095.5,
        high_52w: 4592.25,
        low_52w: 3311,
        market_cap_cr: 1491200,
        pe_ratio: 31.2,
        sector: "Information Technology",
        sparkline: [4082, 4090.5, 4098, 4105.2, 4114.6, 4120.75],
        timeframes: buildTimeframes(4120.75, true),
        isSimulated: true,
        isLive: false,
        environment: "SANDBOX"
      },
      {
        symbol: "HDFCBANK",
        name: "HDFC Bank Ltd",
        price: 1682.3,
        change: 15.1,
        changePct: 0.91,
        change_percent: 0.91,
        high: 1690,
        low: 1668.5,
        high_52w: 1794,
        low_52w: 1363.55,
        market_cap_cr: 1281500,
        pe_ratio: 19.8,
        sector: "Banking & Financials",
        sparkline: [1667.2, 1670, 1674.5, 1672.8, 1679.1, 1682.3],
        timeframes: buildTimeframes(1682.3, true),
        isSimulated: true,
        isLive: false,
        environment: "SANDBOX"
      },
      {
        symbol: "INFY",
        name: "Infosys Ltd",
        price: 1892.4,
        change: 24.3,
        changePct: 1.3,
        change_percent: 1.3,
        high: 1905,
        low: 1870,
        high_52w: 1975,
        low_52w: 1358.35,
        market_cap_cr: 785400,
        pe_ratio: 29.1,
        sector: "Information Technology",
        sparkline: [1868.1, 1874, 1879.2, 1883.5, 1888, 1892.4],
        timeframes: buildTimeframes(1892.4, true),
        isSimulated: true,
        isLive: false,
        environment: "SANDBOX"
      },
      {
        symbol: "ICICIBANK",
        name: "ICICI Bank Ltd",
        price: 1235.8,
        change: 11.2,
        changePct: 0.91,
        change_percent: 0.91,
        high: 1242,
        low: 1224,
        high_52w: 1311.6,
        low_52w: 970.15,
        market_cap_cr: 869200,
        pe_ratio: 18.6,
        sector: "Banking & Financials",
        sparkline: [1224.6, 1226.4, 1229, 1231.5, 1233.2, 1235.8],
        timeframes: buildTimeframes(1235.8, true),
        isSimulated: true,
        isLive: false,
        environment: "SANDBOX"
      },
      {
        symbol: "TATAMOTORS",
        name: "Tata Motors Ltd",
        price: 980.5,
        change: -8.1,
        changePct: -0.82,
        change_percent: -0.82,
        high: 994,
        low: 975.2,
        high_52w: 1179,
        low_52w: 696.2,
        market_cap_cr: 360800,
        pe_ratio: 11.4,
        sector: "Automotive & EV",
        sparkline: [988.6, 986.2, 985, 983.4, 981.9, 980.5],
        timeframes: buildTimeframes(980.5, false),
        isSimulated: true,
        isLive: false,
        environment: "SANDBOX"
      },
      {
        symbol: "ITC",
        name: "ITC Ltd",
        price: 489.65,
        change: 2.15,
        changePct: 0.44,
        change_percent: 0.44,
        high: 492,
        low: 486.5,
        high_52w: 528.5,
        low_52w: 399.35,
        market_cap_cr: 612400,
        pe_ratio: 29.6,
        sector: "FMCG & Consumer",
        sparkline: [487.5, 488, 487.8, 488.6, 489.1, 489.65],
        timeframes: buildTimeframes(489.65, true),
        isSimulated: true,
        isLive: false,
        environment: "SANDBOX"
      },
      {
        symbol: "SBIN",
        name: "State Bank of India",
        price: 825.4,
        change: 7.8,
        changePct: 0.95,
        change_percent: 0.95,
        high: 831,
        low: 818,
        high_52w: 912,
        low_52w: 555.15,
        market_cap_cr: 736800,
        pe_ratio: 10.9,
        sector: "Public Sector Banking",
        sparkline: [817.6, 819.2, 821, 822.5, 824.1, 825.4],
        timeframes: buildTimeframes(825.4, true),
        isSimulated: true,
        isLive: false,
        environment: "SANDBOX"
      },
      {
        symbol: "GOLDBEES",
        name: "Nippon India Gold ETF (24K)",
        price: 68.45,
        change: 0.85,
        changePct: 1.26,
        change_percent: 1.26,
        high: 68.9,
        low: 67.8,
        high_52w: 71.2,
        low_52w: 51.4,
        market_cap_cr: 14200,
        pe_ratio: 0,
        sector: "Precious Metals ETF",
        sparkline: [67.6, 67.8, 68, 68.1, 68.3, 68.45],
        timeframes: buildTimeframes(68.45, true),
        isSimulated: true,
        isLive: false,
        environment: "SANDBOX"
      },
      {
        symbol: "NIFTY_50",
        name: "UTI Nifty 50 Index ETF",
        price: 1380,
        change: 9.5,
        changePct: 0.69,
        change_percent: 0.69,
        high: 1385,
        low: 1372,
        high_52w: 1420,
        low_52w: 1090,
        market_cap_cr: 48500,
        pe_ratio: 22.8,
        sector: "Broad Market Index",
        sparkline: [1370.5, 1372, 1375.4, 1377.2, 1378.8, 1380],
        timeframes: buildTimeframes(1380, true),
        isSimulated: true,
        isLive: false,
        environment: "SANDBOX"
      }
    ];
  }
  async getQuotes() {
    return _MarketDataAdapter.MOCK_QUOTES;
  }
  async getQuote(symbol) {
    const q = _MarketDataAdapter.MOCK_QUOTES.find((item) => item.symbol.toUpperCase() === symbol.toUpperCase());
    return q || null;
  }
};
var MutualFundPlatformAdapter = class {
  async placeOrder(fundCode, amount, mode) {
    const isLive = isLivePartnerConfigured(process.env.BSE_STAR_MF_PASSWORD);
    return {
      orderRef: `BSE-MF-${Date.now()}`,
      status: isLive ? "SUBMITTED_TO_RTA" : "MOCK_SANDBOX_SUBMITTED",
      environment: isLive ? "LIVE" : "SANDBOX",
      isLive,
      isMock: !isLive,
      complianceNote: isLive ? "Order submitted to BSE StAR MF RTA engine." : "DEMO SANDBOX: Simulated Mutual Fund order for demonstration. No real units allotted."
    };
  }
};
var kycAdapter = new KycAdapter();
var creditBureauAdapter = new CreditBureauAdapter();
var eSignAdapter = new ESignAdapter();
var mandateAdapter = new MandateAdapter();
var paymentGatewayAdapter = new PaymentGatewayAdapter();
var lendingPartnerAdapter = new LendingPartnerAdapter();
var depositoryAdapter = new DepositoryParticipantAdapter();
var marketDataAdapter = new MarketDataAdapter();
var mutualFundAdapter = new MutualFundPlatformAdapter();

// backend/routes/kyc.routes.ts
var router3 = Router3();
router3.get("/status", requireAuth, async (req, res) => {
  try {
    const records = await dbRepository.kyc.getByUserId(req.user.userId);
    const profile = await dbRepository.profiles.getByUserId(req.user.userId) || {};
    const isPanVerified = records.some((r) => r.document_type === "pan" && r.verification_status === "verified");
    const isAadhaarVerified = records.some((r) => r.document_type === "aadhaar" && r.verification_status === "verified");
    const hasPanRecord = records.some((r) => r.document_type === "pan");
    const hasAadhaarRecord = records.some((r) => r.document_type === "aadhaar");
    const hasSandboxRecords = records.some((r) => r.verification_status === "sandbox_simulated");
    const kycStages = [
      { stage: 1, code: "personal_details", name: "Basic Personal Details", label: "Basic Personal Details", completed: Boolean(profile.dob || profile.city), status: profile.dob || profile.city ? "completed" : "pending" },
      { stage: 2, code: "pan_verification", name: "PAN e-KYC Verification", label: "PAN e-KYC Verification", completed: Boolean(isPanVerified || hasPanRecord), status: isPanVerified ? "verified_live" : hasPanRecord ? "sandbox_simulated" : "pending" },
      { stage: 3, code: "aadhaar_verification", name: "Aadhaar XML / OTP Verification", label: "Aadhaar XML / OTP Verification", completed: Boolean(isAadhaarVerified || hasAadhaarRecord), status: isAadhaarVerified ? "verified_live" : hasAadhaarRecord ? "sandbox_simulated" : "pending" },
      { stage: 4, code: "address_details", name: "Residential Address Proof", label: "Residential Address Proof", completed: Boolean(profile.city && profile.state), status: profile.city && profile.state ? "completed" : "pending" },
      { stage: 5, code: "bank_account", name: "Bank Account & IFSC Penny-Drop", label: "Bank Account & IFSC Penny-Drop", completed: Boolean(profile.bank_account_no), status: profile.bank_account_no ? "completed" : "pending" },
      { stage: 6, code: "income_occupation", name: "Income & Occupation Assessment", label: "Income & Occupation Assessment", completed: Boolean(profile.annual_income), status: profile.annual_income ? "completed" : "pending" },
      { stage: 7, code: "selfie_documents", name: "Selfie Liveness & Document Attestation", label: "Selfie Liveness & Document Attestation", completed: Boolean(hasPanRecord && hasAadhaarRecord), status: hasPanRecord && hasAadhaarRecord ? "sandbox_simulated" : "pending" }
    ];
    return res.json({
      user_id: req.user.userId,
      is_fully_compliant: isPanVerified && isAadhaarVerified,
      pan_verified: isPanVerified,
      aadhaar_verified: isAadhaarVerified,
      has_sandbox_records: hasSandboxRecords,
      compliance_status: isPanVerified && isAadhaarVerified ? "COMPLIANT_LIVE" : hasSandboxRecords ? "SANDBOX_UNVERIFIED" : "PENDING",
      kyc_stages: kycStages,
      records
    });
  } catch (err) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: "Service Unavailable", detail: err.message });
    }
    return res.status(500).json({ error: "Internal Error", detail: err.message });
  }
});
router3.post("/submit", requireAuth, async (req, res) => {
  try {
    const {
      pan_number,
      aadhaar_number,
      dob,
      gender,
      address_line1,
      city,
      state,
      pincode,
      bank_account_no,
      bank_ifsc,
      bank_name,
      annual_income,
      occupation_type
    } = req.body;
    const updatedProfile = await dbRepository.profiles.upsert(req.user.userId, {
      dob: dob || "1990-01-01",
      gender: gender || "Male",
      pan_number: pan_number ? String(pan_number).toUpperCase().trim() : void 0,
      aadhaar_last4: aadhaar_number ? String(aadhaar_number).replace(/\D/g, "").slice(-4) : void 0,
      address_line1: address_line1 || "Trunk Road, Kadapa",
      city: city || "Kadapa",
      state: state || "Andhra Pradesh",
      pincode: pincode || "516001",
      bank_account_no: bank_account_no ? `\u2022\u2022\u2022\u2022 ${String(bank_account_no).slice(-4)}` : "\u2022\u2022\u2022\u2022 4821",
      bank_ifsc: bank_ifsc ? String(bank_ifsc).toUpperCase().trim() : "SBIN0000840",
      bank_name: bank_name || "State Bank of India",
      annual_income: annual_income ? parseFloat(annual_income) : 75e4,
      occupation_type: occupation_type || "Salaried"
    });
    const submittedRecords = [];
    if (pan_number && String(pan_number).length === 10) {
      const panRes = await kycAdapter.verifyDocument({
        documentType: "pan",
        documentNumber: String(pan_number),
        fullName: req.user.fullName,
        dob
      });
      if (panRes.isFormatValid) {
        const status = panRes.isLive && panRes.isVerified ? "verified" : "sandbox_simulated";
        const rec = await dbRepository.kyc.upsertRecord(
          req.user.userId,
          "pan",
          panRes.maskedId,
          panRes.provider,
          panRes.complianceNote,
          status
        );
        submittedRecords.push(rec);
      }
    }
    if (aadhaar_number && String(aadhaar_number).replace(/\D/g, "").length === 12) {
      const aadhaarRes = await kycAdapter.verifyDocument({
        documentType: "aadhaar",
        documentNumber: String(aadhaar_number),
        fullName: req.user.fullName
      });
      if (aadhaarRes.isFormatValid) {
        const status = aadhaarRes.isLive && aadhaarRes.isVerified ? "verified" : "sandbox_simulated";
        const rec = await dbRepository.kyc.upsertRecord(
          req.user.userId,
          "aadhaar",
          aadhaarRes.maskedId,
          aadhaarRes.provider,
          aadhaarRes.complianceNote,
          status
        );
        submittedRecords.push(rec);
      }
    }
    logAudit(req.user.userId, "KYC_FULL_SUBMIT", "kyc_records", String(req.user.userId), {
      stagesCompleted: 7,
      environment: "SANDBOX_SIMULATED"
    });
    return res.status(201).json({
      status: "SANDBOX_SIMULATED",
      is_live_verified: false,
      stages_completed: 7,
      profile: updatedProfile,
      records: submittedRecords,
      message: "7-stage KYC dossier recorded in sandbox mode. Live regulator verification requires configured NSDL/UIDAI production keys."
    });
  } catch (err) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: "Service Unavailable", detail: err.message });
    }
    return res.status(500).json({ error: "Internal Error", detail: err.message });
  }
});
router3.post("/verify-pan", requireAuth, async (req, res) => {
  try {
    const { pan_number, full_name, dob } = req.body;
    if (!pan_number || pan_number.length !== 10) {
      return res.status(400).json({ error: "Bad Request", detail: "Valid 10-character alphanumeric PAN required" });
    }
    const result = await kycAdapter.verifyDocument({
      documentType: "pan",
      documentNumber: pan_number,
      fullName: full_name || req.user.fullName,
      dob
    });
    if (!result.isFormatValid) {
      return res.status(400).json({
        error: "KYC Verification Failed",
        detail: result.complianceNote || "Invalid PAN document format"
      });
    }
    const verificationStatus = result.isLive && result.isVerified ? "verified" : "sandbox_simulated";
    const record = await dbRepository.kyc.upsertRecord(
      req.user.userId,
      "pan",
      result.maskedId,
      result.provider,
      result.complianceNote,
      verificationStatus
    );
    logAudit(req.user.userId, "KYC_VERIFY_PAN", "kyc_records", String(record.id), {
      panMasked: result.maskedId,
      status: verificationStatus,
      isLive: result.isLive
    });
    return res.json({
      status: result.status,
      is_live_verified: result.isLive && result.isVerified,
      is_mock: result.isMock,
      masked: result.maskedId,
      provider: result.provider,
      environment: result.environment,
      compliance_note: result.complianceNote
    });
  } catch (err) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: "Service Unavailable", detail: err.message });
    }
    return res.status(500).json({ error: "Internal Error", detail: err.message });
  }
});
router3.post(["/verify-aadhaar-otp", "/verify-aadhaar"], requireAuth, async (req, res) => {
  try {
    const { aadhaar_number, otp } = req.body;
    if (!aadhaar_number || aadhaar_number.length < 12) {
      return res.status(400).json({ error: "Bad Request", detail: "Valid 12-digit Aadhaar number required" });
    }
    const result = await kycAdapter.verifyDocument({
      documentType: "aadhaar",
      documentNumber: aadhaar_number,
      fullName: req.user.fullName,
      otp: otp || "123456"
    });
    if (!result.isFormatValid) {
      return res.status(400).json({
        error: "KYC Verification Failed",
        detail: result.complianceNote || "Invalid Aadhaar format"
      });
    }
    const verificationStatus = result.isLive && result.isVerified ? "verified" : "sandbox_simulated";
    const record = await dbRepository.kyc.upsertRecord(
      req.user.userId,
      "aadhaar",
      result.maskedId,
      result.provider,
      result.complianceNote,
      verificationStatus
    );
    logAudit(req.user.userId, "KYC_VERIFY_AADHAAR", "kyc_records", String(record.id), {
      masked: result.maskedId,
      status: verificationStatus,
      isLive: result.isLive
    });
    return res.json({
      status: result.status,
      is_live_verified: result.isLive && result.isVerified,
      is_mock: result.isMock,
      masked: result.maskedId,
      provider: result.provider,
      environment: result.environment,
      compliance_note: result.complianceNote
    });
  } catch (err) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: "Service Unavailable", detail: err.message });
    }
    return res.status(500).json({ error: "Internal Error", detail: err.message });
  }
});
var kyc_routes_default = router3;

// backend/routes/loans.routes.ts
import { Router as Router4 } from "express";
var router4 = Router4();
router4.get("/products", async (req, res) => {
  try {
    const products = await dbRepository.loans.getProducts();
    res.json(products);
  } catch (err) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: "Service Unavailable", detail: err.message });
    }
    res.status(500).json({ error: "Internal Error", detail: err.message });
  }
});
router4.post("/calculate-emi", (req, res) => {
  const { principal, interest_rate_annual, tenure_months, repayment_mode } = req.body;
  const P = parseFloat(principal);
  const annualRate = parseFloat(interest_rate_annual);
  const n = parseInt(tenure_months, 10);
  const mode = repayment_mode === "interest_only" ? "interest_only" : "reducing_emi";
  if (isNaN(P) || P <= 0 || isNaN(annualRate) || isNaN(n) || n <= 0) {
    return res.status(400).json({ error: "Bad Request", detail: "Invalid parameters for EMI calculation" });
  }
  const r = annualRate / 12 / 100;
  let emi = 0;
  let totalInterest = 0;
  let totalRepayment = 0;
  const schedule = [];
  if (mode === "interest_only") {
    const monthlyInterest = Math.round(P * r);
    emi = monthlyInterest;
    totalInterest = monthlyInterest * n;
    totalRepayment = P + totalInterest;
    for (let m = 1; m <= n; m++) {
      const isLast = m === n;
      schedule.push({
        month: m,
        emi: isLast ? monthlyInterest + P : monthlyInterest,
        principal: isLast ? P : 0,
        interest: monthlyInterest,
        balance: isLast ? 0 : P
      });
    }
  } else {
    if (r <= 0) {
      emi = Math.round(P / n);
    } else {
      emi = Math.round(P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1));
    }
    totalRepayment = emi * n;
    totalInterest = Math.max(0, totalRepayment - P);
    let balance = P;
    for (let m = 1; m <= n; m++) {
      const interest = Math.round(balance * r);
      let principalComponent = emi - interest;
      if (m === n || balance - principalComponent < 0) {
        principalComponent = balance;
        balance = 0;
      } else {
        balance -= principalComponent;
      }
      schedule.push({
        month: m,
        emi,
        principal: principalComponent,
        interest,
        balance: Math.max(0, balance)
      });
      if (balance <= 0) break;
    }
  }
  return res.json({
    principal: P,
    annual_rate: annualRate,
    tenure_months: n,
    repayment_mode: mode,
    monthly_emi: emi,
    total_interest: totalInterest,
    total_repayment: totalRepayment,
    schedule: schedule.slice(0, 36)
    // Preview first 36 installments
  });
});
router4.get("/my-applications", requireAuth, async (req, res) => {
  try {
    const apps = await dbRepository.loans.getApplicationsByUser(req.user.userId);
    res.json(apps);
  } catch (err) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: "Service Unavailable", detail: err.message });
    }
    res.status(500).json({ error: "Internal Error", detail: err.message });
  }
});
router4.get("/my-accounts", requireAuth, async (req, res) => {
  try {
    const userApps = await dbRepository.loans.getApplicationsByUser(req.user.userId);
    const activeApps = userApps.filter(
      (a) => a.status === "disbursed" || a.status === "approved" || a.status === "sanctioned"
    );
    const accounts = await Promise.all(activeApps.map(async (app2) => {
      const schedules = await dbRepository.loans.getEmiSchedules(app2.id);
      const paidSchedules = schedules.filter((s) => s.payment_status === "paid");
      const pendingSchedule = schedules.find((s) => s.payment_status === "pending");
      return {
        id: app2.id,
        loan_account_no: `ACC-${app2.application_no}`,
        loan_type: app2.product_name || "Fintech Loan",
        repayment_mode: app2.repayment_mode || "reducing_emi",
        principal_amount: parseFloat(app2.requested_amount),
        interest_rate: parseFloat(app2.interest_rate),
        tenure_months: app2.tenure_months,
        monthly_emi: parseFloat(app2.calculated_emi),
        emis_paid: paidSchedules.length,
        total_emis: app2.tenure_months,
        next_emi_date: pendingSchedule?.due_date || "2026-11-05",
        outstanding_balance: pendingSchedule ? parseFloat(pendingSchedule.remaining_balance) : 0,
        status: app2.status === "disbursed" ? "active" : "sanctioned"
      };
    }));
    res.json(accounts);
  } catch (err) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: "Service Unavailable", detail: err.message });
    }
    res.status(500).json({ error: "Internal Error", detail: err.message });
  }
});
router4.post("/apply", requireAuth, async (req, res) => {
  try {
    const {
      product_id,
      requested_amount,
      tenure_months,
      repayment_mode,
      purpose,
      monthly_income,
      applicant_name,
      phone,
      email,
      collateral_type,
      collateral_value,
      guarantor_name,
      guarantor_phone
    } = req.body;
    const amt = parseFloat(requested_amount);
    const tenure = parseInt(tenure_months, 10) || 12;
    const income = parseFloat(monthly_income);
    const mode = repayment_mode === "interest_only" ? "interest_only" : "reducing_emi";
    if (!amt || amt < 1e4) {
      return res.status(400).json({ error: "Bad Request", detail: "Minimum loan amount is \u20B910,000" });
    }
    const products = await dbRepository.loans.getProducts();
    const product = products.find((p) => p.id === parseInt(product_id, 10)) || products[0];
    if (product && amt > product.max_amount) {
      return res.status(400).json({
        error: "Limit Exceeded",
        detail: `Requested amount \u20B9${amt.toLocaleString("en-IN")} exceeds maximum allowed \u20B9${product.max_amount.toLocaleString("en-IN")} for ${product.product_name}`
      });
    }
    const rate = product ? product.base_interest_rate : 14;
    const r = rate / 12 / 100;
    const emi = mode === "interest_only" ? Math.round(amt * r) : Math.round(amt * r * Math.pow(1 + r, tenure) / (Math.pow(1 + r, tenure) - 1));
    const appNo = `TF-LN-${(/* @__PURE__ */ new Date()).getFullYear()}-${Math.floor(1e3 + Math.random() * 9e3)}`;
    const newApp = await dbRepository.loans.createApplication({
      application_no: appNo,
      user_id: req.user.userId,
      product_id: product?.id || 1,
      product_name: product?.product_name || "Loan",
      applicant_name: applicant_name || req.user.fullName,
      phone: phone || "9876543210",
      email: email || req.user.email,
      monthly_income: income || 75e3,
      requested_amount: amt,
      interest_rate: rate,
      tenure_months: tenure,
      repayment_mode: mode,
      calculated_emi: emi,
      purpose: purpose || "General requirement",
      collateral_type: collateral_type || null,
      collateral_value: collateral_value ? parseFloat(collateral_value) : null,
      guarantor_name: guarantor_name || null,
      guarantor_phone: guarantor_phone || null,
      status: "submitted",
      credit_score: 745,
      officer_remarks: "Application submitted online. Initial e-KYC verified at Kadapa central branch.",
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    });
    await dbRepository.notifications.create({
      user_id: req.user.userId,
      title: `Loan Application #${appNo} Received`,
      message: `Your request for ${product?.product_name || "Loan"} (${mode === "interest_only" ? "Interest-Only Mode" : "Reducing EMI Mode"}) of \u20B9${amt.toLocaleString("en-IN")} is assigned to the Kadapa Credit Committee.`,
      category: "loans"
    });
    logAudit(req.user.userId, "SUBMIT_LOAN_APPLICATION", "loan_applications", appNo, { amount: amt, product: product?.product_name, mode });
    return res.status(201).json({
      ...newApp,
      application: newApp
    });
  } catch (err) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: "Service Unavailable", detail: err.message });
    }
    console.error("Loan apply error:", err);
    return res.status(500).json({ error: "Internal Error", detail: err.message });
  }
});
router4.get("/:id/emi-schedule", requireAuth, async (req, res) => {
  try {
    const appId = parseInt(req.params.id, 10);
    const app2 = await dbRepository.loans.getApplicationById(appId);
    if (!app2) {
      return res.status(404).json({ error: "Not Found", detail: "Loan application not found" });
    }
    const isOfficerOrAdmin = ["admin", "super_admin", "credit_officer"].includes(req.user.role);
    if (!isOfficerOrAdmin && app2.user_id !== req.user.userId) {
      return res.status(403).json({ error: "Forbidden", detail: "Access restricted to loan owner or underwriting officer" });
    }
    let schedules = await dbRepository.loans.getEmiSchedules(appId);
    if (schedules.length === 0) {
      const P = parseFloat(app2.sanctioned_amount || app2.requested_amount);
      const r = parseFloat(app2.interest_rate) / 12 / 100;
      const n = parseInt(app2.tenure_months, 10) || 12;
      const mode = app2.repayment_mode === "interest_only" ? "interest_only" : "reducing_emi";
      const emi = parseFloat(app2.calculated_emi) || Math.round(P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1));
      let balance = P;
      schedules = [];
      for (let m = 1; m <= n; m++) {
        const dueDate = /* @__PURE__ */ new Date();
        dueDate.setMonth(dueDate.getMonth() + m);
        dueDate.setDate(5);
        if (mode === "interest_only") {
          const isLast = m === n;
          const interest = Math.round(P * r);
          schedules.push({
            id: m,
            application_id: appId,
            installment_number: m,
            due_date: dueDate.toISOString().split("T")[0],
            emi_amount: isLast ? interest + P : interest,
            principal_component: isLast ? P : 0,
            interest_component: interest,
            remaining_balance: isLast ? 0 : P,
            payment_status: "scheduled_preview",
            paid_date: null
          });
        } else {
          const interest = Math.round(balance * r);
          let principal = emi - interest;
          if (m === n || balance - principal < 0) {
            principal = balance;
            balance = 0;
          } else {
            balance -= principal;
          }
          schedules.push({
            id: m,
            application_id: appId,
            installment_number: m,
            due_date: dueDate.toISOString().split("T")[0],
            emi_amount: emi,
            principal_component: principal,
            interest_component: interest,
            remaining_balance: Math.max(0, balance),
            payment_status: "scheduled_preview",
            paid_date: null
          });
        }
      }
    }
    return res.json({
      application_id: app2.id,
      application_no: app2.application_no,
      product_name: app2.product_name,
      repayment_mode: app2.repayment_mode || "reducing_emi",
      principal: parseFloat(app2.sanctioned_amount || app2.requested_amount),
      interest_rate: parseFloat(app2.interest_rate),
      tenure_months: app2.tenure_months,
      monthly_emi: parseFloat(app2.calculated_emi),
      schedule: schedules,
      schedules
    });
  } catch (err) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: "Service Unavailable", detail: err.message });
    }
    return res.status(500).json({ error: "Internal Error", detail: err.message });
  }
});
router4.get("/:id", requireAuth, async (req, res) => {
  try {
    const appId = parseInt(req.params.id, 10);
    if (isNaN(appId)) {
      return res.status(400).json({ error: "Bad Request", detail: "Valid numeric loan ID required" });
    }
    const app2 = await dbRepository.loans.getApplicationById(appId);
    if (!app2) {
      return res.status(404).json({ error: "Not Found", detail: "Loan application not found" });
    }
    const isOfficerOrAdmin = ["admin", "super_admin", "credit_officer"].includes(req.user.role);
    if (!isOfficerOrAdmin && app2.user_id !== req.user.userId) {
      return res.status(403).json({ error: "Forbidden", detail: "Access restricted to loan owner or underwriting officer" });
    }
    const schedules = await dbRepository.loans.getEmiSchedules(appId);
    return res.json({
      ...app2,
      emi_schedules: schedules,
      sanction_letter: ["approved", "sanctioned", "disbursed"].includes(app2.status) ? {
        sanction_ref: `SAN-${app2.application_no}`,
        issuer: "M/s. Tatito Projects \u2014 NBFC Division, Kadapa",
        sanctioned_amount: app2.sanctioned_amount || app2.requested_amount,
        interest_rate: app2.interest_rate,
        tenure_months: app2.tenure_months,
        repayment_mode: app2.repayment_mode || "reducing_emi",
        issued_at: app2.sanctioned_at || app2.created_at
      } : null
    });
  } catch (err) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: "Service Unavailable", detail: err.message });
    }
    return res.status(500).json({ error: "Internal Error", detail: err.message });
  }
});
router4.post("/pay-emi", requireAuth, async (req, res) => {
  try {
    const { application_id, loan_account_no, amount, payment_mode } = req.body;
    const targetAppId = parseInt(application_id, 10) || 3;
    if (req.user.role !== "admin" && req.user.role !== "credit_officer") {
      const userApps = await dbRepository.loans.getApplicationsByUser(req.user.userId);
      const ownsLoan = userApps.some((a) => a.id === targetAppId);
      if (!ownsLoan) {
        return res.status(403).json({
          error: "Forbidden",
          detail: "You are not authorized to make payments on this loan account."
        });
      }
    }
    const amt = parseFloat(amount);
    if (!amt || isNaN(amt) || !Number.isFinite(amt) || amt <= 0) {
      return res.status(400).json({ error: "Bad Request", detail: "Invalid payment amount. Must be positive." });
    }
    const isLive = process.env.LIVE_FINANCIAL_PARTNERS === "true" && Boolean(process.env.PAYMENT_GATEWAY_SECRET);
    const payStatus = isLive ? "SUCCESS" : "DEMO_SUCCESS";
    const paymentResult = await dbRepository.payments.executeAtomicWalletPayment({
      userId: req.user.userId,
      amount: amt,
      category: "loan_emi",
      operator: "Tatito Loan Repayment Desk",
      accountIdentifier: loan_account_no || "TF-LN-0814",
      paymentMode: payment_mode || "wallet",
      status: payStatus,
      applicationId: targetAppId,
      metaJson: {
        loan_account_no: loan_account_no || "TF-LN-0814",
        channel: "Tatito Repayment Gateway",
        is_demo: !isLive
      }
    });
    const schedules = await dbRepository.loans.getEmiSchedules(targetAppId);
    const pendingSchedule = schedules.find((s) => s.payment_status === "pending");
    if (pendingSchedule) {
      const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      await dbRepository.loans.markEmiPaid(pendingSchedule.id, today);
    }
    await dbRepository.notifications.create({
      user_id: req.user.userId,
      title: "EMI Installment Paid",
      message: `\u20B9${amt.toLocaleString("en-IN")} paid towards ${loan_account_no || "your loan"}. Next due date updated.`,
      category: "loans"
    });
    logAudit(req.user.userId, "PAY_EMI", "payments", paymentResult.payment.payment_ref, {
      amount: amt,
      account: loan_account_no,
      status: payStatus
    });
    return res.json({
      status: paymentResult.payment.status,
      is_demo: !isLive,
      is_simulated: !isLive,
      reference: paymentResult.payment.payment_ref,
      amount_paid: amt,
      wallet_balance: paymentResult.newBalance,
      message: "EMI installment received and credited to loan account",
      compliance_notice: isLive ? "Settled to loan ledger via live clearing." : "DEMO TRANSACTION: Simulated loan repayment. No actual banking clearing occurred."
    });
  } catch (err) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: "Service Unavailable", detail: err.message });
    }
    if (err.statusCode === 400) {
      return res.status(400).json({ error: "Payment Error", detail: err.message });
    }
    if (err.statusCode === 403) {
      return res.status(403).json({ error: "Forbidden", detail: err.message });
    }
    console.error("Pay EMI error:", err);
    return res.status(500).json({ error: "Internal Error", detail: err.message });
  }
});
var loans_routes_default = router4;

// backend/routes/payments.routes.ts
import { Router as Router5 } from "express";
var router5 = Router5();
router5.get("/history", requireAuth, async (req, res) => {
  try {
    const list = await dbRepository.payments.getByUser(req.user.userId);
    res.json(list);
  } catch (err) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: "Service Unavailable", detail: err.message });
    }
    res.status(500).json({ error: "Internal Error", detail: err.message });
  }
});
router5.post("/bills/fetch", (req, res) => {
  const { category, operator, account_identifier } = req.body;
  const cleanId = (account_identifier || "1009823412034").trim();
  let hash = 0;
  for (let i = 0; i < cleanId.length; i++) hash += cleanId.charCodeAt(i);
  const names = [
    "Ramesh Kumar Chennur",
    "Venkata Subba Reddy",
    "Lakshmi Narayana Rao",
    "Sunitha Devi Giddalur",
    "Ankalaiah Bandlamudi"
  ];
  const customerName = names[hash % names.length];
  let amount = 1420;
  if (category === "electricity") amount = 850 + hash % 2200;
  else if (category === "water") amount = 180 + hash % 380;
  else if (category === "gas") amount = 950 + hash % 120;
  else if (category === "mobile" || category === "mobile_prepaid") amount = [299, 349, 479, 666, 839][hash % 5];
  else if (category === "mobile_postpaid") amount = 599 + hash % 800;
  else if (category === "dth") amount = [250, 399, 499, 650][hash % 4];
  else if (category === "fastag") amount = [500, 1e3, 1500, 2e3][hash % 4];
  else if (category === "broadband") amount = [589, 825, 1179][hash % 3];
  else if (category === "credit_card") amount = 4250 + hash % 15e3;
  else if (category === "insurance_premium") amount = 4850 + hash % 6500;
  else if (category === "rent") amount = 8500 + hash % 9e3;
  else if (category === "education_fees") amount = 12500 + hash % 15e3;
  else if (category === "municipal_tax") amount = 1850 + hash % 2400;
  const now = /* @__PURE__ */ new Date();
  const billDate = new Date(now.getTime() - 7 * 864e5).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const dueDate = new Date(now.getTime() + 8 * 864e5).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const bbpsRef = `DEMO-BBPS-${1e7 + hash % 89999999}`;
  const noticeText = "DEMO DATA: Simulated bill fetch. Not an active fetch from live NPCI BBPS Central Unit.";
  return res.json({
    customer_name: customerName,
    account_identifier: cleanId,
    operator: operator || "APSPDCL (Southern Power AP)",
    category: category || "electricity",
    bill_number: `DEMO-BILL-${1e5 + hash % 899999}`,
    bill_date: billDate,
    due_date: dueDate,
    amount_due: amount,
    bill_amount: amount,
    convenience_fee: 0,
    bbps_reference: bbpsRef,
    bbps_biller_id: bbpsRef,
    status: "PENDING",
    circle: "Andhra Pradesh (Kadapa Circle)",
    is_demo: true,
    data_source: "DEMO_BILLER_CATALOG",
    notice: noticeText,
    disclaimer: noticeText
  });
});
router5.post("/bills/pay", requireAuth, async (req, res) => {
  try {
    const { category, operator, account_identifier, customer_name, amount, payment_mode } = req.body;
    const idempotencyKey = req.headers["idempotency-key"] || req.headers["x-idempotency-key"] || req.body.idempotency_key || req.body.idempotencyKey;
    if (idempotencyKey) {
      const existingPayment = await dbRepository.payments.findByIdempotencyKey(idempotencyKey);
      if (existingPayment) {
        return res.json({
          status: existingPayment.status,
          transaction_reference: existingPayment.payment_ref,
          bbps_reference: existingPayment.bbps_ref_no,
          amount_paid: parseFloat(existingPayment.amount),
          idempotent_replay: true,
          message: "Payment already processed with this idempotency key. No duplicate deduction.",
          paid_at: existingPayment.created_at
        });
      }
    }
    const amt = parseFloat(amount);
    if (isNaN(amt) || !Number.isFinite(amt) || amt <= 0) {
      return res.status(400).json({ error: "Bad Request", detail: "Invalid payment amount. Must be a positive number." });
    }
    if (!category || !account_identifier) {
      return res.status(400).json({ error: "Bad Request", detail: "category and account_identifier are required." });
    }
    const isLive = isLivePartnerConfigured(process.env.PAYMENT_GATEWAY_SECRET);
    const simulateFailure = req.body.simulate_failure === true || req.headers["x-simulate-failure"] === "true";
    if (simulateFailure) {
      return res.status(400).json({
        error: "Payment Processing Failed",
        detail: "Simulated processor decline: Transaction rejected by biller network. Wallet balance untouched.",
        is_demo: true,
        is_simulated: true
      });
    }
    const payStatus = isLive ? "SUCCESS" : "DEMO_SUCCESS";
    const result = await dbRepository.payments.executeAtomicWalletPayment({
      userId: req.user.userId,
      amount: amt,
      category: category || "utility",
      operator: operator || "Utility Biller",
      accountIdentifier: account_identifier,
      paymentMode: payment_mode || "wallet",
      status: payStatus,
      idempotencyKey,
      metaJson: {
        customer_name: customer_name || req.user.fullName,
        circle: "Andhra Pradesh",
        channel: isLive ? "Bharat BillPay (BBPS) Live" : "Bharat BillPay (BBPS) Sandbox Simulator",
        is_demo: !isLive
      }
    });
    await dbRepository.notifications.create({
      user_id: req.user.userId,
      title: "Bill Payment Completed",
      message: `\u20B9${amt.toLocaleString("en-IN")} paid for ${operator || "utility"}. Ref: ${result.payment.payment_ref}`,
      category: "general"
    });
    logAudit(req.user.userId, "PAY_BILL", "payments", result.payment.payment_ref, {
      operator,
      amount: amt,
      status: payStatus,
      isDemo: !isLive
    });
    return res.json({
      status: result.payment.status,
      is_demo: !isLive,
      is_simulated: !isLive,
      transaction_reference: result.payment.payment_ref,
      bbps_reference: result.payment.bbps_ref_no,
      amount_paid: amt,
      wallet_balance: result.newBalance,
      paid_at: result.payment.created_at || (/* @__PURE__ */ new Date()).toISOString(),
      compliance_notice: isLive ? "Confirmed live settlement via Bharat BillPay NPCI Clearing House." : "DEMO TRANSACTION: Simulated utility payment in sandbox environment. No actual bank clearing occurred."
    });
  } catch (err) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: "Service Unavailable", detail: err.message });
    }
    if (err.statusCode === 400) {
      return res.status(400).json({ error: "Payment Error", detail: err.message });
    }
    if (err.statusCode === 404) {
      return res.status(404).json({ error: "Not Found", detail: err.message });
    }
    console.error("Bill pay error:", err);
    return res.status(500).json({ error: "Internal Error", detail: err.message });
  }
});
var payments_routes_default = router5;

// backend/routes/investments.routes.ts
import { Router as Router6 } from "express";
var router6 = Router6();
router6.get("/stocks", async (req, res) => {
  const quotes = await marketDataAdapter.getQuotes();
  res.json(quotes);
});
router6.get("/watchlist", requireAuth, async (req, res) => {
  try {
    const userWatch = await dbRepository.investments.getWatchlist(req.user.userId);
    res.json(userWatch);
  } catch (err) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: "Service Unavailable", detail: err.message });
    }
    res.status(500).json({ error: "Internal Error", detail: err.message });
  }
});
router6.post("/watchlist/toggle", requireAuth, async (req, res) => {
  try {
    const { symbol } = req.body;
    if (!symbol) return res.status(400).json({ error: "Symbol required" });
    const result = await dbRepository.investments.toggleWatchlist(req.user.userId, symbol);
    return res.json({
      symbol: result.symbol,
      watched: result.watched,
      message: result.watched ? "Added to watchlist" : "Removed from watchlist"
    });
  } catch (err) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: "Service Unavailable", detail: err.message });
    }
    return res.status(500).json({ error: "Internal Error", detail: err.message });
  }
});
router6.post("/stocks/order", requireAuth, async (req, res) => {
  try {
    const { symbol, order_type, quantity } = req.body;
    const user = await dbRepository.users.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ error: "Bad Request", detail: "Positive quantity required" });
    }
    const quote = await marketDataAdapter.getQuote(symbol);
    if (!quote) return res.status(404).json({ error: "Stock quote not found" });
    const totalValue = Math.round(qty * quote.price);
    const type = (order_type || "BUY").toUpperCase();
    const currentBalance = parseFloat(user.wallet_balance || 0);
    if (type === "BUY") {
      if (currentBalance < totalValue) {
        return res.status(400).json({
          error: "Insufficient Balance",
          detail: `Required \u20B9${totalValue.toLocaleString("en-IN")}, available in wallet \u20B9${currentBalance.toLocaleString("en-IN")}`
        });
      }
      await dbRepository.users.updateWallet(user.id, currentBalance - totalValue);
      await dbRepository.investments.upsertHolding(user.id, quote.symbol, quote.name, "equity", qty, totalValue, quote.price);
    } else if (type === "SELL") {
      const holdings = await dbRepository.investments.getPortfolioByUser(user.id);
      const existing = holdings.find((p) => p.asset_symbol === quote.symbol);
      const currentQty = existing ? Number(existing.quantity) : 0;
      if (!existing || currentQty < qty) {
        return res.status(400).json({
          error: "Insufficient Holdings",
          detail: `You own ${currentQty} shares of ${quote.symbol}`
        });
      }
      await dbRepository.users.updateWallet(user.id, currentBalance + totalValue);
      await dbRepository.investments.upsertHolding(user.id, quote.symbol, quote.name, "equity", -qty, -totalValue, quote.price);
    }
    const orderRef = `ORD-${Date.now()}`;
    await dbRepository.investments.createStockOrder({
      order_ref: orderRef,
      user_id: user.id,
      symbol: quote.symbol,
      order_type: type,
      quantity: qty,
      executed_price: quote.price,
      total_order_value: totalValue,
      status: "EXECUTED"
    });
    await dbRepository.notifications.create({
      user_id: user.id,
      title: `Order Executed: ${type} ${qty} ${quote.symbol}`,
      message: `Filled at \u20B9${quote.price} (Total: \u20B9${totalValue.toLocaleString("en-IN")}). Ref: ${orderRef}`,
      category: "investments"
    });
    logAudit(user.id, "STOCK_ORDER", "stock_orders", orderRef, { symbol: quote.symbol, type, qty, totalValue });
    const updatedWallet = type === "BUY" ? currentBalance - totalValue : currentBalance + totalValue;
    return res.json({
      status: "EXECUTED",
      order_reference: orderRef,
      symbol: quote.symbol,
      order_type: type,
      quantity: qty,
      executed_price: quote.price,
      total_value: totalValue,
      wallet_balance: updatedWallet,
      is_simulated: true,
      execution_mode: "SANDBOX_PROTOTYPE",
      message: "Trade executed successfully on simulated exchange [DEMO SANDBOX]"
    });
  } catch (err) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: "Service Unavailable", detail: err.message });
    }
    console.error("Stock order error:", err);
    return res.status(500).json({ error: "Internal Error", detail: err.message });
  }
});
router6.get("/mutual-funds", async (req, res) => {
  try {
    const category = (req.query.category || "all").toLowerCase();
    let funds = await dbRepository.investments.getMutualFunds();
    if (category !== "all") {
      funds = funds.filter((f) => f.category.toLowerCase().includes(category));
    }
    res.json(funds);
  } catch (err) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: "Service Unavailable", detail: err.message });
    }
    res.status(500).json({ error: "Internal Error", detail: err.message });
  }
});
router6.get("/sips", requireAuth, async (req, res) => {
  try {
    const userSips = await dbRepository.investments.getSips(req.user.userId);
    res.json(userSips);
  } catch (err) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: "Service Unavailable", detail: err.message });
    }
    res.status(500).json({ error: "Internal Error", detail: err.message });
  }
});
router6.post("/sips", requireAuth, async (req, res) => {
  try {
    const { fund_id, monthly_amount, debit_day } = req.body;
    const amt = parseFloat(monthly_amount);
    if (!amt || amt < 500) {
      return res.status(400).json({ error: "Bad Request", detail: "Minimum SIP amount is \u20B9500" });
    }
    const fund = await dbRepository.investments.getFundById(parseInt(fund_id, 10)) || (await dbRepository.investments.getMutualFunds())[0];
    const mandateRef = `SIP-MANDATE-${Date.now()}`;
    const nextDate = /* @__PURE__ */ new Date();
    nextDate.setMonth(nextDate.getMonth() + 1);
    nextDate.setDate(parseInt(debit_day, 10) || 10);
    const newSip = await dbRepository.investments.createSip({
      mandate_ref: mandateRef,
      user_id: req.user.userId,
      fund_id: fund?.id || 1,
      monthly_amount: amt,
      debit_day: parseInt(debit_day, 10) || 10,
      next_debit_date: nextDate.toISOString().split("T")[0]
    });
    await dbRepository.notifications.create({
      user_id: req.user.userId,
      title: "SIP Mandate Authorized",
      message: `\u20B9${amt.toLocaleString("en-IN")}/mo in ${fund?.fund_name || "Mutual Fund"}. Auto-debit on ${newSip.debit_day}th of every month.`,
      category: "investments"
    });
    logAudit(req.user.userId, "REGISTER_SIP", "sips", mandateRef, { fund: fund?.fund_name, amount: amt });
    return res.status(201).json({
      ...newSip,
      fund_name: fund?.fund_name,
      is_simulated: true,
      compliance_note: "Simulated e-NACH mandate sandbox demo [No real bank auto-debit]",
      message: "SIP Mandate successfully authorized in sandbox environment"
    });
  } catch (err) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: "Service Unavailable", detail: err.message });
    }
    console.error("SIP registration error:", err);
    return res.status(500).json({ error: "Internal Error", detail: err.message });
  }
});
router6.delete("/sips/:id", requireAuth, async (req, res) => {
  try {
    const sipId = parseInt(req.params.id, 10);
    await dbRepository.investments.deleteSip(sipId, req.user.userId);
    return res.json({ message: "SIP mandate paused/cancelled successfully" });
  } catch (err) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: "Service Unavailable", detail: err.message });
    }
    return res.status(500).json({ error: "Internal Error", detail: err.message });
  }
});
router6.get("/portfolio", requireAuth, async (req, res) => {
  try {
    const holdings = await dbRepository.investments.getPortfolioByUser(req.user.userId);
    const totalInvested = holdings.reduce((sum, h) => sum + parseFloat(h.invested_amount || 0), 0);
    const currentValuation = holdings.reduce((sum, h) => sum + parseFloat(h.current_valuation || 0), 0);
    const totalReturns = currentValuation - totalInvested;
    const returnsPct = totalInvested > 0 ? parseFloat((totalReturns / totalInvested * 100).toFixed(2)) : 0;
    const allocation = { equity: 0, mutual_fund: 0, gold_etf: 0, sovereign_bond: 0 };
    holdings.forEach((h) => {
      const cat = h.category || "equity";
      allocation[cat] = (allocation[cat] || 0) + parseFloat(h.current_valuation || 0);
    });
    return res.json({
      total_invested: totalInvested,
      current_valuation: currentValuation,
      total_returns: totalReturns,
      returns_percentage: returnsPct,
      holdings,
      allocation,
      is_simulated: true,
      note: "Portfolio values reflect simulated prototype holdings"
    });
  } catch (err) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: "Service Unavailable", detail: err.message });
    }
    return res.status(500).json({ error: "Internal Error", detail: err.message });
  }
});
router6.get("/demat", requireAuth, async (req, res) => {
  try {
    let demat = await dbRepository.investments.getDemat(req.user.userId);
    if (!demat) {
      demat = {
        client_code: "TT-KDP-89104",
        dp_id: "IN300128-10049281",
        depository: "NSDL",
        status: "active"
      };
    }
    res.json({
      ...demat,
      is_simulated: true,
      compliance_note: "Simulated Depository Participant sandbox demo. Not a registered broker depository."
    });
  } catch (err) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: "Service Unavailable", detail: err.message });
    }
    return res.status(500).json({ error: "Internal Error", detail: err.message });
  }
});
router6.get(["/orders", "/stocks/orders"], requireAuth, async (req, res) => {
  try {
    const orders = await dbRepository.investments.getStockOrders(req.user.userId);
    return res.json(orders);
  } catch (err) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: "Service Unavailable", detail: err.message });
    }
    return res.status(500).json({ error: "Internal Error", detail: err.message });
  }
});
router6.post(["/mutual-funds/sip-calculator", "/sip-calculator"], (req, res) => {
  const { monthly_investment, expected_return_rate, tenure_years, mode, lumpsum_amount } = req.body;
  const isLumpsum = mode === "lumpsum";
  const P = parseFloat(isLumpsum ? lumpsum_amount || monthly_investment : monthly_investment);
  const annualRate = parseFloat(expected_return_rate) || 15;
  const years = parseInt(tenure_years, 10) || 10;
  if (isNaN(P) || P <= 0 || years <= 0) {
    return res.status(400).json({ error: "Bad Request", detail: "Valid positive investment amount and tenure years required" });
  }
  let totalInvested = 0;
  let totalValue = 0;
  const yearlyBreakdown = [];
  if (isLumpsum) {
    totalInvested = P;
    const r = annualRate / 100;
    totalValue = Math.round(P * Math.pow(1 + r, years));
    for (let y = 1; y <= years; y++) {
      const val = Math.round(P * Math.pow(1 + r, y));
      yearlyBreakdown.push({
        year: y,
        invested: P,
        wealth: val,
        gain: val - P
      });
    }
  } else {
    const n = years * 12;
    const i = annualRate / 12 / 100;
    totalInvested = P * n;
    totalValue = i > 0 ? Math.round(P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i)) : totalInvested;
    for (let y = 1; y <= years; y++) {
      const months = y * 12;
      const inv = P * months;
      const val = i > 0 ? Math.round(P * ((Math.pow(1 + i, months) - 1) / i) * (1 + i)) : inv;
      yearlyBreakdown.push({
        year: y,
        invested: inv,
        wealth: val,
        gain: val - inv
      });
    }
  }
  return res.json({
    mode: isLumpsum ? "lumpsum" : "sip",
    monthly_investment: isLumpsum ? 0 : P,
    lumpsum_amount: isLumpsum ? P : 0,
    expected_return_rate: annualRate,
    tenure_years: years,
    total_invested: totalInvested,
    estimated_returns: Math.max(0, totalValue - totalInvested),
    total_value: totalValue,
    yearly_breakdown: yearlyBreakdown
  });
});
var investments_routes_default = router6;

// backend/routes/admin.routes.ts
import { Router as Router7 } from "express";
var router7 = Router7();
router7.get(["/dashboard-stats", "/dashboard"], requireAuth, requireRole("admin", "credit_officer"), async (req, res) => {
  try {
    const stats = await dbRepository.admin.getDashboardStats();
    return res.json(stats);
  } catch (err) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: "Service Unavailable", detail: err.message });
    }
    return res.status(500).json({ error: "Internal Error", detail: err.message });
  }
});
router7.get(["/loans", "/loan-applications"], requireAuth, requireRole("admin", "credit_officer"), async (req, res) => {
  try {
    const statusFilter = (req.query.status || "all").toLowerCase();
    const list = await dbRepository.loans.getAllApplications(statusFilter);
    res.json(list);
  } catch (err) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: "Service Unavailable", detail: err.message });
    }
    res.status(500).json({ error: "Internal Error", detail: err.message });
  }
});
router7.patch(["/loans/:id/decision", "/loans/:id/status"], requireAuth, requireRole("admin", "credit_officer"), async (req, res) => {
  try {
    const appId = parseInt(req.params.id, 10);
    const decision = req.body.decision || req.body.status;
    const { remarks, sanctioned_amount } = req.body;
    const app2 = await dbRepository.loans.getApplicationById(appId);
    if (!app2) return res.status(404).json({ error: "Loan application not found" });
    const validDecisions = ["under_review", "approved", "sanctioned", "disbursed", "rejected", "info_requested"];
    if (!validDecisions.includes(decision)) {
      return res.status(400).json({ error: "Invalid Decision", detail: `Must be one of: [${validDecisions.join(", ")}]` });
    }
    const prevStatus = app2.status;
    let finalAmount = app2.requested_amount;
    let calculatedEmi = app2.calculated_emi;
    if (decision === "approved" || decision === "sanctioned") {
      finalAmount = parseFloat(sanctioned_amount) || parseFloat(app2.requested_amount);
      const interestRate = parseFloat(app2.interest_rate);
      const tenureMonths = parseInt(app2.tenure_months, 10);
      const r = interestRate / 12 / 100;
      calculatedEmi = Math.round(finalAmount * r * Math.pow(1 + r, tenureMonths) / (Math.pow(1 + r, tenureMonths) - 1));
      const existingSched = await dbRepository.loans.getEmiSchedules(app2.id);
      if (existingSched.length === 0) {
        const schedules = [];
        let balance = finalAmount;
        for (let m = 1; m <= tenureMonths; m++) {
          const interest = Math.round(balance * r);
          let principal = calculatedEmi - interest;
          if (m === tenureMonths || balance - principal < 0) {
            principal = balance;
            balance = 0;
          } else {
            balance -= principal;
          }
          const dueDate = /* @__PURE__ */ new Date();
          dueDate.setMonth(dueDate.getMonth() + m);
          dueDate.setDate(5);
          schedules.push({
            application_id: app2.id,
            installment_number: m,
            due_date: dueDate.toISOString().split("T")[0],
            emi_amount: calculatedEmi,
            principal_component: principal,
            interest_component: interest,
            remaining_balance: Math.max(0, balance)
          });
          if (balance <= 0) break;
        }
        await dbRepository.loans.createEmiSchedules(schedules);
      }
    }
    const updatedApp = await dbRepository.loans.updateApplicationDecision(
      appId,
      decision,
      remarks,
      finalAmount,
      calculatedEmi
    );
    if (decision === "disbursed") {
      const borrower = await dbRepository.users.findById(app2.user_id);
      if (borrower) {
        const currentBalance = parseFloat(borrower.wallet_balance || 0);
        const addAmount = parseFloat(sanctioned_amount) || parseFloat(app2.sanctioned_amount || app2.requested_amount);
        await dbRepository.users.updateWallet(borrower.id, currentBalance + addAmount);
      }
    }
    await dbRepository.notifications.create({
      user_id: app2.user_id,
      title: `Loan #${app2.application_no} Updated: ${decision.toUpperCase()}`,
      message: remarks || `Credit Committee has updated your application to ${decision.toUpperCase()}.`,
      category: "loans"
    });
    logAudit(req.user.userId, "LOAN_DECISION", "loan_applications", app2.application_no, {
      prevStatus,
      decision,
      officer: req.user.fullName
    });
    return res.json({
      status: "UPDATED",
      application: updatedApp,
      message: `Application #${app2.application_no} marked as ${decision.toUpperCase()}`
    });
  } catch (err) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: "Service Unavailable", detail: err.message });
    }
    console.error("Loan decision error:", err);
    return res.status(500).json({ error: "Internal Error", detail: err.message });
  }
});
router7.get("/audit-logs", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const logs = await dbRepository.admin.getAuditLogs(50);
    res.json(logs);
  } catch (err) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: "Service Unavailable", detail: err.message });
    }
    res.status(500).json({ error: "Internal Error", detail: err.message });
  }
});
router7.get("/reports/csv", requireAuth, requireRole("admin", "credit_officer"), async (req, res) => {
  try {
    const apps = await dbRepository.loans.getAllApplications();
    let csv = "Application No,Applicant Name,Phone,Email,Product,Requested Amount,Interest Rate,Tenure Months,EMI,Status,Created At\n";
    apps.forEach((a) => {
      csv += `"${a.application_no}","${a.applicant_name}","${a.phone}","${a.email}","${a.product_name || "Loan"}",${a.requested_amount},${a.interest_rate},${a.tenure_months},${a.calculated_emi},"${a.status}","${a.created_at}"
`;
    });
    res.header("Content-Type", "text/csv");
    res.attachment(`Tatito_Loans_Report_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv`);
    return res.send(csv);
  } catch (err) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: "Service Unavailable", detail: err.message });
    }
    res.status(500).json({ error: "Internal Error", detail: err.message });
  }
});
router7.get("/users", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const roleFilter = req.query.role;
    const users = await dbRepository.users.getAll(roleFilter);
    return res.json(users);
  } catch (err) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: "Service Unavailable", detail: err.message });
    }
    res.status(500).json({ error: "Internal Error", detail: err.message });
  }
});
router7.patch("/users/:id/role", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { role } = req.body;
    const allowed = ["customer", "agent", "credit_officer", "admin"];
    if (!allowed.includes(role)) {
      return res.status(400).json({ error: "Invalid Role", detail: `Allowed: [${allowed.join(", ")}]` });
    }
    await dbRepository.users.updateRole(userId, role);
    logAudit(req.user.userId, "UPDATE_USER_ROLE", "users", String(userId), { newRole: role });
    return res.json({ message: "User role updated successfully", userId, role });
  } catch (err) {
    res.status(500).json({ error: "Internal Error", detail: err.message });
  }
});
router7.patch("/users/:id/status", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { is_active } = req.body;
    await dbRepository.users.updateStatus(userId, Boolean(is_active));
    logAudit(req.user.userId, "UPDATE_USER_STATUS", "users", String(userId), { is_active });
    return res.json({ message: "User status updated", userId, is_active: Boolean(is_active) });
  } catch (err) {
    res.status(500).json({ error: "Internal Error", detail: err.message });
  }
});
router7.patch("/loan-products/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const prodId = parseInt(req.params.id, 10);
    const { base_interest_rate, min_amount, max_amount } = req.body;
    const updated = await dbRepository.loans.updateProduct(prodId, {
      base_interest_rate: base_interest_rate !== void 0 ? parseFloat(base_interest_rate) : void 0,
      min_amount: min_amount !== void 0 ? parseFloat(min_amount) : void 0,
      max_amount: max_amount !== void 0 ? parseFloat(max_amount) : void 0
    });
    if (!updated) return res.status(404).json({ error: "Loan product not found" });
    logAudit(req.user.userId, "UPDATE_LOAN_PRODUCT", "loan_products", String(prodId), req.body);
    return res.json({ message: "Loan product updated", product: updated });
  } catch (err) {
    res.status(500).json({ error: "Internal Error", detail: err.message });
  }
});
var admin_routes_default = router7;

// backend/routes/agents.routes.ts
import { Router as Router8 } from "express";
var router8 = Router8();
router8.get("/dashboard", requireAuth, requireRole("agent", "admin"), async (req, res) => {
  try {
    const agentProfile = await dbRepository.agents.getByUserId(req.user.userId);
    const leads = await dbRepository.agents.getLeads(req.user.userId, req.user.role);
    const commissions = await dbRepository.agents.getCommissions(req.user.role === "admin" || req.user.role === "super_admin" ? void 0 : req.user.userId);
    return res.json({
      agent: agentProfile || {
        agent_code: "TF-DSA-042",
        agency_name: "Rayalaseema Financial Associates",
        operating_region: "Kadapa, Proddatur & Pulivendula",
        commission_rate_pct: 1,
        status: "active"
      },
      total_leads: leads.length,
      disbursed_leads: leads.filter((l) => l.status === "Disbursed").length,
      in_review_leads: leads.filter((l) => l.status === "In Review").length,
      total_commission_earned: commissions.total_earned,
      pending_commission_pipeline: commissions.pending_pipeline,
      leads
    });
  } catch (err) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: "Service Unavailable", detail: err.message });
    }
    return res.status(500).json({ error: "Internal Error", detail: err.message });
  }
});
router8.get("/leads", requireAuth, requireRole("agent", "admin"), async (req, res) => {
  try {
    const leads = await dbRepository.agents.getLeads(req.user.userId, req.user.role);
    return res.json(leads);
  } catch (err) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: "Service Unavailable", detail: err.message });
    }
    return res.status(500).json({ error: "Internal Error", detail: err.message });
  }
});
router8.post("/leads", requireAuth, requireRole("agent", "admin"), async (req, res) => {
  try {
    const { applicant_name, phone, email, loan_product, requested_amount, location, notes } = req.body;
    if (!applicant_name || !phone || !loan_product || !requested_amount) {
      return res.status(400).json({ error: "Validation Error", detail: "Missing required lead details" });
    }
    const amt = parseFloat(requested_amount);
    if (isNaN(amt) || amt <= 0) {
      return res.status(400).json({ error: "Validation Error", detail: "Valid positive loan amount required" });
    }
    let commissionRate = 1;
    if (loan_product.includes("Home")) commissionRate = 0.4;
    else if (loan_product.includes("Personal")) commissionRate = 1.25;
    else if (loan_product.includes("Gold")) commissionRate = 0.5;
    else if (loan_product.includes("Business")) commissionRate = 1;
    const commissionAmount = Math.round(amt * (commissionRate / 100));
    const agentProfile = await dbRepository.agents.getByUserId(req.user.userId);
    const agentCode = agentProfile?.agent_code || "TF-DSA-042";
    const newLead = await dbRepository.agents.createLead({
      agent_id: req.user.userId,
      agent_code: agentCode,
      applicant_name: applicant_name.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : null,
      loan_product,
      requested_amount: amt,
      location: location || "Kadapa",
      commission_rate_pct: commissionRate,
      commission_amount: commissionAmount,
      status: "Contacted",
      notes
    });
    logAudit(req.user.userId, "SUBMIT_AGENT_LEAD", "agent_leads", String(newLead.id), { applicant: newLead.applicant_name, amount: amt });
    return res.status(201).json({
      status: "CREATED",
      lead: newLead,
      message: "Borrower lead recorded and dispatched to Kadapa branch underwriting"
    });
  } catch (err) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: "Service Unavailable", detail: err.message });
    }
    return res.status(500).json({ error: "Internal Error", detail: err.message });
  }
});
router8.get("/commissions", requireAuth, requireRole("agent", "admin"), async (req, res) => {
  try {
    const agentProfile = await dbRepository.agents.getByUserId(req.user.userId);
    const agentCode = agentProfile?.agent_code || "TF-DSA-042";
    const commissionData = await dbRepository.agents.getCommissions(req.user.role === "admin" ? void 0 : req.user.userId);
    return res.json({
      agent_code: agentCode,
      total_earned: commissionData.total_earned,
      pending_pipeline: commissionData.pending_pipeline,
      commission_slabs: [
        { product: "Home Loans", rate: "0.40% - 0.50%", terms: "Disbursement UTR confirmation" },
        { product: "Business Loans", rate: "1.00% - 1.25%", terms: "Highest tier payout" },
        { product: "Personal Loans", rate: "1.25% - 1.50%", terms: "Fastest 48h turnaround" },
        { product: "Gold Loans", rate: "0.50% Flat", terms: "Same-day counter cash settlement" }
      ]
    });
  } catch (err) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: "Service Unavailable", detail: err.message });
    }
    return res.status(500).json({ error: "Internal Error", detail: err.message });
  }
});
var agents_routes_default = router8;

// backend/routes/notifications.routes.ts
import { Router as Router9 } from "express";
var router9 = Router9();
router9.get("/", requireAuth, async (req, res) => {
  try {
    const list = await dbRepository.notifications.getByUser(req.user.userId);
    res.json(list);
  } catch (err) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: "Service Unavailable", detail: err.message });
    }
    res.status(500).json({ error: "Internal Error", detail: err.message });
  }
});
router9.post("/mark-all-read", requireAuth, async (req, res) => {
  try {
    await dbRepository.notifications.markAllRead(req.user.userId);
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (err) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: "Service Unavailable", detail: err.message });
    }
    res.status(500).json({ error: "Internal Error", detail: err.message });
  }
});
router9.patch("/:id/read", requireAuth, async (req, res) => {
  try {
    const notifId = parseInt(req.params.id, 10);
    const updated = await dbRepository.notifications.markRead(notifId, req.user.userId);
    res.json({ success: true, message: "Notification marked as read", notification: updated });
  } catch (err) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: "Service Unavailable", detail: err.message });
    }
    res.status(500).json({ error: "Internal Error", detail: err.message });
  }
});
var notifications_routes_default = router9;

// backend/routes/superapp.routes.ts
import { Router as Router10 } from "express";
var router10 = Router10();
var superStore = {
  linkedAccounts: [
    {
      id: "acc-1",
      bank_name: "State Bank of India (Kadapa Main)",
      masked_account: "\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 4821",
      ifsc: "SBIN0000830",
      upi_vpa: "ramesh@tatitoupi",
      account_type: "Savings Account",
      is_primary: true,
      balance_check_mode: "SANDBOX_SIMULATED",
      simulated_bank_balance: 68450
    },
    {
      id: "acc-2",
      bank_name: "Union Bank of India (Trunk Road AP)",
      masked_account: "\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 9104",
      ifsc: "UBIN0802411",
      upi_vpa: "ramesh.ub@tatitoupi",
      account_type: "Savings Account",
      is_primary: false,
      balance_check_mode: "SANDBOX_SIMULATED",
      simulated_bank_balance: 32100
    }
  ],
  upiTransactions: [
    {
      id: "upi-101",
      transaction_ref: "UPI-DEMO-98412041",
      direction: "send",
      counterparty_name: "Sri Venkateswara Provision Store",
      counterparty_vpa: "svstore.kdp@tatitoupi",
      amount: 640,
      payment_mode: "UPI_QR_SANDBOX",
      status: "DEMO_SUCCESS",
      refund_status: "NONE",
      note: "Monthly grocery supplies",
      is_simulated: true,
      created_at: "2026-11-09T14:20:00.000Z"
    },
    {
      id: "upi-102",
      transaction_ref: "UPI-DEMO-98411902",
      direction: "receive",
      counterparty_name: "Suresh Kumar Reddy",
      counterparty_vpa: "suresh.reddy@tatitoupi",
      amount: 2500,
      payment_mode: "UPI_P2P_SANDBOX",
      status: "DEMO_SUCCESS",
      refund_status: "NONE",
      note: "Shared dinner & fuel split settlement",
      is_simulated: true,
      created_at: "2026-11-08T09:15:00.000Z"
    },
    {
      id: "upi-103",
      transaction_ref: "UPI-DEMO-98411588",
      direction: "self_transfer",
      counterparty_name: "Self Transfer (SBI \u2022\u20224821 \u2192 UBI \u2022\u20229104)",
      counterparty_vpa: "ramesh.ub@tatitoupi",
      amount: 5e3,
      payment_mode: "UPI_SELF_SANDBOX",
      status: "DEMO_SUCCESS",
      refund_status: "NONE",
      note: "Savings reserve transfer",
      is_simulated: true,
      created_at: "2026-11-05T17:40:00.000Z"
    }
  ],
  paymentRequests: [
    {
      id: "req-1",
      payer_name: "Kiran Naidu",
      payer_vpa: "kiran.naidu@tatitoupi",
      amount: 1200,
      note: "Tirupati bus ticket share",
      status: "PENDING",
      created_at: "2026-11-10T11:00:00.000Z"
    }
  ],
  qrCodes: [
    {
      id: "qr-static-customer",
      qr_type: "customer_static",
      vpa: "ramesh@tatitoupi",
      payee_name: "Ramesh Kumar",
      amount: null,
      reference_code: "QR-CUST-KDP-89104",
      payload_uri: "upi://pay?pa=ramesh@tatitoupi&pn=Ramesh%20Kumar&cu=INR"
    }
  ],
  rewards: {
    points: 1450,
    lifetimeCashback: 540,
    referralCode: "TATITO-KDP-2026",
    history: [
      { id: "rw-1", type: "cashback", title: "APSPDCL Electricity Bill Cashback", points: 100, cashback: 50, status: "CREDITED_DEMO", expiry: "2026-12-31", date: "2026-11-08" },
      { id: "rw-2", type: "points_earned", title: "On-Time Personal Loan EMI Bonus", points: 350, cashback: 0, status: "CREDITED_DEMO", expiry: "2027-03-31", date: "2026-11-04" },
      { id: "rw-3", type: "referral", title: "Referral Bonus \u2014 Lakshmi Narayana Joined", points: 250, cashback: 100, status: "CREDITED_DEMO", expiry: "No Expiry", date: "2026-10-29" }
    ],
    campaigns: [
      {
        id: "cmp-1",
        code: "POWER50",
        title: "Flat \u20B950 Cashback on Electricity Bills",
        category: "Bills & Utilities",
        rule: "Min bill \u20B9800 on APSPDCL/TSSPDCL via Tatito Wallet or UPI Sandbox",
        max_cashback: 50,
        min_txn: 800,
        valid_until: "2026-12-31",
        terms: "Applicable once per calendar month in sandbox mode. Subject to partner settlement."
      },
      {
        id: "cmp-2",
        code: "SIPBOOST",
        title: "500 Reward Points on First Direct Mutual Fund SIP",
        category: "Wealth & SIP",
        rule: "Start a monthly SIP of \u20B91,000+ in any Index or Flexi-Cap fund",
        max_cashback: 100,
        min_txn: 1e3,
        valid_until: "2027-01-31",
        terms: "Points redeemable at 10 points = \u20B91 sandbox wallet credit."
      },
      {
        id: "cmp-3",
        code: "GOLDEXPRESS",
        title: "Zero Processing Fee Voucher on Hallmark Gold Loan",
        category: "Loans",
        rule: "Redeem 500 points for 100% processing fee waiver at Kadapa Branch",
        max_cashback: 1500,
        min_txn: 5e4,
        valid_until: "2026-12-15",
        terms: "Valid on physical gold verification at Trunk Road, Kadapa branch."
      }
    ],
    vouchers: [
      { id: "vch-1", brand: "APSRTC Bus Pass Voucher", value: 150, points_cost: 600, code: "TATITO-BUS-150", expiry: "2026-12-31" },
      { id: "vch-2", brand: "Tatito Loan Processing Fee Waiver", value: 500, points_cost: 1e3, code: "TATITO-LOAN-500", expiry: "2027-01-31" },
      { id: "vch-3", brand: "Instant Wallet Cashback \u20B9100", value: 100, points_cost: 800, code: "WALLET-CASH-100", expiry: "Immediate" }
    ],
    referrals: [
      { id: "ref-1", name: "Lakshmi Narayana Rao", mobile: "98480\u2022\u2022\u202212", status: "KYC Completed (Demo)", reward: "250 pts + \u20B9100", date: "2026-10-29" },
      { id: "ref-2", name: "Venkata Subbaiah", mobile: "94402\u2022\u2022\u202289", status: "Registered", reward: "250 pts pending first txn", date: "2026-11-06" }
    ]
  },
  mandates: [
    {
      id: "mnd-1",
      mandate_ref: "UMN-TATITO-882101",
      biller_or_payee: "Tatito Personal Loan EMI (TLN-KDP-2026-001)",
      category: "Loan EMI",
      amount: 22100,
      frequency: "Monthly",
      next_trigger_date: "2026-11-20",
      status: "ACTIVE",
      consent_verified: true
    },
    {
      id: "mnd-2",
      mandate_ref: "UMN-TATITO-882102",
      biller_or_payee: "Nifty 50 Index Direct Plan \u2014 SIP",
      category: "Mutual Fund SIP",
      amount: 5e3,
      frequency: "Monthly",
      next_trigger_date: "2026-11-15",
      status: "ACTIVE",
      consent_verified: true
    },
    {
      id: "mnd-3",
      mandate_ref: "UMN-TATITO-882103",
      biller_or_payee: "APSPDCL Southern Power Electricity",
      category: "Utility Bill",
      amount: 1450,
      frequency: "Monthly",
      next_trigger_date: "2026-11-18",
      status: "ACTIVE",
      consent_verified: true
    },
    {
      id: "mnd-4",
      mandate_ref: "UMN-TATITO-882104",
      biller_or_payee: "ACT Fibernet Broadband 150 Mbps",
      category: "Subscription / Broadband",
      amount: 825,
      frequency: "Monthly",
      next_trigger_date: "2026-11-25",
      status: "PAUSED",
      consent_verified: true
    }
  ],
  expenses: {
    monthlyIncome: 85e3,
    items: [
      { id: "exp-1", title: "Personal Loan Monthly EMI", category: "Loan EMIs", amount: 22100, date: "2026-11-05", mode: "Wallet Auto-Debit" },
      { id: "exp-2", title: "Nifty 50 & Flexi-Cap SIPs", category: "Investments & SIP", amount: 1e4, date: "2026-11-05", mode: "UPI AutoPay" },
      { id: "exp-3", title: "Groceries & Household Provision", category: "Food & Groceries", amount: 8400, date: "2026-11-07", mode: "UPI Scan & Pay" },
      { id: "exp-4", title: "APSPDCL Electricity & Indane Gas", category: "Utilities & Bills", amount: 2390, date: "2026-11-08", mode: "BBPS Bill Desk" },
      { id: "exp-5", title: "Fuel & APSRTC Highway Transit", category: "Travel & Fuel", amount: 4200, date: "2026-11-09", mode: "FASTag & UPI" }
    ],
    budgets: [
      { category: "Loan EMIs", limit: 25e3, spent: 22100 },
      { category: "Investments & SIP", limit: 15e3, spent: 1e4 },
      { category: "Food & Groceries", limit: 12e3, spent: 8400 },
      { category: "Utilities & Bills", limit: 4500, spent: 2390 },
      { category: "Travel & Fuel", limit: 6e3, spent: 4200 }
    ],
    savingsGoals: [
      { id: "goal-1", name: "Family Emergency Reserve (6 Months)", target: 3e5, current: 185e3, deadline: "2027-06-30" },
      { id: "goal-2", name: "24K Digital Gold Festival Accumulation", target: 1e5, current: 42500, deadline: "2027-01-15" }
    ],
    groups: [
      {
        id: "grp-1",
        name: "Tirupati & Horsley Hills Weekend Trip",
        members: ["Ramesh Kumar", "Suresh Reddy", "Kiran Naidu", "Anil Varma"],
        expenses: [
          {
            id: "gexp-1",
            title: "Tempo Traveller & Toll FASTag",
            total_amount: 4800,
            paid_by: "Ramesh Kumar",
            split_type: "EQUAL",
            per_person: 1200,
            status: "OPEN",
            created_at: "2026-11-09"
          },
          {
            id: "gexp-2",
            title: "Hill Resort Dinner & Stay",
            total_amount: 6400,
            paid_by: "Suresh Reddy",
            split_type: "EQUAL",
            per_person: 1600,
            status: "SETTLED",
            created_at: "2026-11-10"
          }
        ]
      }
    ]
  },
  insuranceProducts: [
    {
      id: "ins-1",
      product_code: "INS-HEALTH-CARE",
      category: "Health insurance",
      plan_name: "Tatito Family Floater Health Shield",
      partner_insurer: "Star Health & Allied Insurance (Partner Sandbox)",
      sum_insured: 1e6,
      annual_premium: 9450,
      coverage_highlights: "Cashless treatment at 140+ network hospitals across AP & Telangana \xB7 Zero room rent cap \xB7 Annual health checkup"
    },
    {
      id: "ins-2",
      product_code: "INS-LIFE-TERM",
      category: "Life insurance",
      plan_name: "Pure Term Life Protection Plan",
      partner_insurer: "HDFC Life / LIC Partner Sandbox",
      sum_insured: 1e7,
      annual_premium: 11200,
      coverage_highlights: "\u20B91 Crore life cover till age 65 \xB7 Critical illness rider option \xB7 Tax benefit under Sec 80C"
    },
    {
      id: "ins-3",
      product_code: "INS-MOTOR-COMP",
      category: "Motor insurance",
      plan_name: "Zero-Dep Car & Two-Wheeler Cover",
      partner_insurer: "ICICI Lombard General Insurance Sandbox",
      sum_insured: 65e4,
      annual_premium: 4850,
      coverage_highlights: "Instant policy issuance \xB7 Roadside assistance across NH-40 \xB7 Zero depreciation bumper-to-bumper"
    },
    {
      id: "ins-4",
      product_code: "INS-TRAVEL-SAFE",
      category: "Travel insurance",
      plan_name: "Domestic & International Trip Guard",
      partner_insurer: "Bajaj Allianz General Sandbox",
      sum_insured: 5e5,
      annual_premium: 499,
      coverage_highlights: "Flight/train delay cover \xB7 Baggage loss protection \xB7 Emergency medical evacuation"
    },
    {
      id: "ins-5",
      product_code: "INS-ACCIDENT-PA",
      category: "Personal accident",
      plan_name: "24x7 Personal Accident & Disability Cover",
      partner_insurer: "New India Assurance Sandbox",
      sum_insured: 25e5,
      annual_premium: 1250,
      coverage_highlights: "Accidental hospitalisation \xB7 Temporary total disability weekly payout \xB7 Worldwide coverage"
    }
  ],
  insurancePolicies: [
    {
      id: "pol-1",
      policy_ref: "POL-DEMO-KDP-7712",
      product_code: "INS-HEALTH-CARE",
      plan_name: "Tatito Family Floater Health Shield",
      insured_name: "Ramesh Kumar & Family",
      sum_insured: 1e6,
      annual_premium: 9450,
      renewal_date: "2027-08-14",
      status: "SANDBOX_ACTIVE"
    }
  ],
  goldVault: {
    liveRatePerGram24K: 7680,
    gramsHeld: 5.5338,
    monthlySipAmount: 2e3,
    transactions: [
      {
        id: "gld-1",
        reference_no: "GOLD-DEMO-44019",
        tx_type: "BUY",
        grams: 3.2552,
        rate_per_gram: 7680,
        total_amount: 25e3,
        is_simulated: true,
        created_at: "2026-10-15T10:30:00.000Z"
      },
      {
        id: "gld-2",
        reference_no: "GOLD-DEMO-44108",
        tx_type: "SIP",
        grams: 2.2786,
        rate_per_gram: 7680,
        total_amount: 17500,
        is_simulated: true,
        created_at: "2026-11-01T09:00:00.000Z"
      }
    ]
  },
  travelRoutes: [
    { id: "trv-1", mode: "Bus", operator: "APSRTC Amaravati AC Sleeper", origin: "Kadapa", destination: "Hyderabad", departure: "21:30", fare: 890 },
    { id: "trv-2", mode: "Bus", operator: "APSRTC Indra AC", origin: "Kadapa", destination: "Vijayawada", departure: "22:00", fare: 760 },
    { id: "trv-3", mode: "Train", operator: "12797 Venkatadri Express (3A)", origin: "Kadapa (HX)", destination: "Kacheguda (KCG)", departure: "20:10", fare: 940 },
    { id: "trv-4", mode: "Flight", operator: "IndiGo 6E-7214", origin: "Kadapa (CDP)", destination: "Chennai (MAA)", departure: "11:45", fare: 2850 },
    { id: "trv-5", mode: "Flight", operator: "IndiGo 6E-7192", origin: "Kadapa (CDP)", destination: "Bengaluru (BLR)", departure: "14:20", fare: 2690 },
    { id: "trv-6", mode: "Hotel", operator: "Haritha Grand Executive Stay", origin: "Tirupati / Kadapa", destination: "2 Nights Deluxe AC", departure: "Check-in 12:00", fare: 3400 }
  ],
  travelBookings: [
    {
      id: "tbk-1",
      pnr_reference: "PNR-DEMO-88412",
      mode: "Bus",
      operator_name: "APSRTC Amaravati AC Sleeper",
      origin: "Kadapa",
      destination: "Hyderabad",
      travel_date: "2026-11-22",
      passengers: 2,
      fare_amount: 1780,
      status: "CONFIRMED_DEMO",
      created_at: "2026-11-09T18:00:00.000Z"
    }
  ],
  merchantProfile: {
    merchant_id: "MERCH-KDP-1001",
    business_name: "Rayalaseema Agro & Retail Mart",
    category: "Retail & Kirana Supermarket",
    merchant_vpa: "rayalaseemamart@tatitoupi",
    gstin: "37AABCR9102F1Z8",
    settlement_bank: "State Bank of India \u2022\u2022\u2022\u2022 4821 (T+0 Instant Sandbox)",
    kyc_status: "SANDBOX_VERIFIED",
    today_sales: 18450,
    month_sales: 342800,
    pending_settlement: 0
  },
  merchantTransactions: [
    { id: "mtx-1", transaction_ref: "MQR-990124", customer_name: "Subba Reddy", customer_vpa: "subba@upi", amount: 1450, settlement_status: "SETTLED_SANDBOX", refund_requested: false, created_at: "2026-11-11T09:10:00.000Z" },
    { id: "mtx-2", transaction_ref: "MQR-990125", customer_name: "Padmavathi Devi", customer_vpa: "padma@upi", amount: 890, settlement_status: "SETTLED_SANDBOX", refund_requested: false, created_at: "2026-11-11T10:25:00.000Z" },
    { id: "mtx-3", transaction_ref: "MQR-990126", customer_name: "Harish Babu", customer_vpa: "harish@upi", amount: 3200, settlement_status: "SETTLED_SANDBOX", refund_requested: true, created_at: "2026-11-10T19:45:00.000Z" }
  ],
  supportTickets: [
    {
      id: "tkt-1",
      ticket_no: "TKT-KDP-5041",
      category: "Payment Dispute",
      subject: "BBPS Electricity bill receipt confirmation check",
      description: "Paid APSPDCL bill of \u20B91,420 via wallet; requesting duplicate PDF voucher.",
      transaction_ref: "DEMO-BBPS-48291041",
      status: "RESOLVED",
      resolution_note: "Verified in sandbox ledger. Duplicate receipt attached to your account.",
      created_at: "2026-11-07T11:30:00.000Z"
    }
  ]
};
router10.get("/upi/overview", requireAuth, async (req, res) => {
  const user = await dbRepository.users.findById(req.user.userId);
  return res.json({
    is_simulated: true,
    security_notice: "SECURITY SAFEGUARD: Tatito never collects or stores your UPI PIN, banking password, or CVV. All UPI transfers in this environment execute via an isolated sandbox simulator.",
    wallet_balance: user?.wallet_balance ?? 24850,
    primary_vpa: `${(user?.full_name || "ramesh").toLowerCase().replace(/[^a-z0-9]/g, "")}@tatitoupi`,
    linked_accounts: superStore.linkedAccounts,
    qr_codes: superStore.qrCodes,
    payment_requests: superStore.paymentRequests,
    transactions: superStore.upiTransactions
  });
});
router10.post("/upi/send", requireAuth, async (req, res) => {
  try {
    const { recipient_name, recipient_vpa, amount, note, direction, payment_source } = req.body;
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      return res.status(400).json({ error: "Invalid amount", detail: "Transfer amount must be greater than \u20B90." });
    }
    if (!recipient_vpa && direction !== "self_transfer") {
      return res.status(400).json({ error: "Missing recipient", detail: "Please provide a recipient UPI ID, mobile number, or account." });
    }
    let updatedBalance;
    if (payment_source === "wallet") {
      const result = await dbRepository.payments.executeAtomicWalletPayment({
        userId: req.user.userId,
        amount: amt,
        category: "upi_transfer",
        operator: recipient_name || recipient_vpa || "UPI Recipient",
        accountIdentifier: recipient_vpa || "SELF-TRANSFER",
        paymentMode: "upi_wallet_sandbox",
        status: "DEMO_SUCCESS",
        metaJson: { note, is_demo: true }
      });
      updatedBalance = result.newBalance;
    } else {
      const user = await dbRepository.users.findById(req.user.userId);
      updatedBalance = user?.wallet_balance ?? 24850;
    }
    const txRef = `UPI-DEMO-${Date.now().toString().slice(-8)}`;
    const newTx = {
      id: `upi-${Date.now()}`,
      transaction_ref: txRef,
      direction: direction || "send",
      counterparty_name: recipient_name || (direction === "self_transfer" ? "Self Transfer (SBI \u2022\u20224821 \u2192 UBI \u2022\u20229104)" : recipient_vpa),
      counterparty_vpa: recipient_vpa || "ramesh.ub@tatitoupi",
      amount: amt,
      payment_mode: payment_source === "wallet" ? "TATITO_WALLET_UPI" : "UPI_BANK_SANDBOX",
      status: "DEMO_SUCCESS",
      refund_status: "NONE",
      note: note || "UPI Sandbox Transfer",
      is_simulated: true,
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    superStore.upiTransactions.unshift(newTx);
    superStore.rewards.points += 10;
    await dbRepository.notifications.create({
      user_id: req.user.userId,
      title: "UPI Sandbox Transfer Completed",
      message: `\u20B9${amt.toLocaleString("en-IN")} sent to ${newTx.counterparty_name} (${newTx.transaction_ref}).`,
      category: "general"
    });
    logAudit(req.user.userId, "UPI_SEND_SANDBOX", "payment_transactions", txRef, { amount: amt, recipient_vpa, isSimulated: true });
    return res.status(201).json({
      status: "DEMO_SUCCESS",
      is_simulated: true,
      transaction: newTx,
      wallet_balance: updatedBalance,
      reward_points_earned: 10,
      disclaimer: "SANDBOX TRANSACTION: Simulated UPI payment. No real NPCI bank clearing occurred."
    });
  } catch (err) {
    return res.status(err.statusCode || 400).json({ error: "Transfer Failed", detail: err.message });
  }
});
router10.post("/upi/request", requireAuth, (req, res) => {
  const { payer_name, payer_vpa, amount, note } = req.body;
  const amt = parseFloat(amount);
  if (!payer_vpa || isNaN(amt) || amt <= 0) {
    return res.status(400).json({ error: "Invalid request", detail: "Provide valid payer UPI ID/mobile and positive amount." });
  }
  const reqItem = {
    id: `req-${Date.now()}`,
    payer_name: payer_name || payer_vpa,
    payer_vpa,
    amount: amt,
    note: note || "Payment request via Tatito UPI",
    status: "PENDING",
    is_simulated: true,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  superStore.paymentRequests.unshift(reqItem);
  return res.status(201).json({
    status: "REQUEST_SENT_DEMO",
    is_simulated: true,
    request: reqItem
  });
});
router10.post("/upi/qr/generate", requireAuth, (req, res) => {
  const { amount, note, qr_type } = req.body;
  const amt = amount ? parseFloat(amount) : null;
  const vpa = "ramesh@tatitoupi";
  const ref = `QR-DYN-${Date.now().toString().slice(-6)}`;
  const uri = `upi://pay?pa=${vpa}&pn=Ramesh%20Kumar${amt ? `&am=${amt}` : ""}&tr=${ref}&tn=${encodeURIComponent(note || "Tatito QR")}&cu=INR`;
  const qr = {
    id: `qr-${Date.now()}`,
    qr_type: qr_type || (amt ? "dynamic" : "customer_static"),
    vpa,
    payee_name: req.user.fullName || "Ramesh Kumar",
    amount: amt,
    note: note || "",
    reference_code: ref,
    payload_uri: uri,
    is_simulated: true,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  superStore.qrCodes.unshift(qr);
  return res.status(201).json({ status: "QR_GENERATED_DEMO", is_simulated: true, qr });
});
router10.post("/upi/refund", requireAuth, (req, res) => {
  const { transaction_ref, reason } = req.body;
  const tx = superStore.upiTransactions.find((t) => t.transaction_ref === transaction_ref);
  if (tx) {
    tx.refund_status = "REFUND_INITIATED_DEMO";
  }
  const ticket = {
    id: `tkt-${Date.now()}`,
    ticket_no: `RFD-KDP-${Date.now().toString().slice(-4)}`,
    category: "Refund Request",
    subject: `Refund requested for ${transaction_ref}`,
    description: reason || "Customer initiated sandbox refund request.",
    transaction_ref,
    status: "IN_PROGRESS",
    resolution_note: "Queued for sandbox settlement reversal within 24 hours.",
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  superStore.supportTickets.unshift(ticket);
  return res.json({
    status: "REFUND_INITIATED_DEMO",
    is_simulated: true,
    transaction_ref,
    ticket
  });
});
router10.get("/rewards", requireAuth, (_req, res) => {
  return res.json({
    is_simulated: true,
    ...superStore.rewards
  });
});
router10.post("/rewards/redeem", requireAuth, async (req, res) => {
  const { voucher_id, points_cost, value, title } = req.body;
  const cost = Number(points_cost || 500);
  if (superStore.rewards.points < cost) {
    return res.status(400).json({ error: "Insufficient Points", detail: `You need ${cost} points to redeem this reward.` });
  }
  superStore.rewards.points -= cost;
  const cashVal = Number(value || Math.round(cost / 10));
  superStore.rewards.lifetimeCashback += cashVal;
  const entry = {
    id: `rw-${Date.now()}`,
    type: "points_redeemed",
    title: title || `Redeemed Voucher (${voucher_id || "Cashback"})`,
    points: -cost,
    cashback: cashVal,
    status: "REDEEMED_DEMO",
    expiry: "Completed",
    date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
  };
  superStore.rewards.history.unshift(entry);
  return res.json({
    status: "REDEEMED_DEMO",
    is_simulated: true,
    points_balance: superStore.rewards.points,
    lifetime_cashback: superStore.rewards.lifetimeCashback,
    entry
  });
});
router10.post("/rewards/campaigns", requireAuth, requireRole("admin", "super_admin"), (req, res) => {
  const { code, title, category, rule, max_cashback, min_txn, valid_until } = req.body;
  if (!code || !title) {
    return res.status(400).json({ error: "Missing campaign fields" });
  }
  const cmp = {
    id: `cmp-${Date.now()}`,
    code: String(code).toUpperCase(),
    title,
    category: category || "General",
    rule: rule || "Sandbox promotional offer",
    max_cashback: Number(max_cashback || 100),
    min_txn: Number(min_txn || 500),
    valid_until: valid_until || "2027-03-31",
    terms: "Managed by Branch Admin in sandbox mode."
  };
  superStore.rewards.campaigns.unshift(cmp);
  return res.status(201).json({ status: "CAMPAIGN_CREATED", campaign: cmp });
});
router10.get("/autopay", requireAuth, (_req, res) => {
  return res.json({
    is_simulated: true,
    disclaimer: "SANDBOX MANDATES: Automatic debits require authorized NPCI e-Mandate / UPI AutoPay partner execution with explicit customer 2FA consent.",
    mandates: superStore.mandates
  });
});
router10.post("/autopay", requireAuth, (req, res) => {
  const { biller_or_payee, category, amount, frequency, next_trigger_date } = req.body;
  const amt = parseFloat(amount);
  if (!biller_or_payee || isNaN(amt) || amt <= 0) {
    return res.status(400).json({ error: "Invalid mandate details" });
  }
  const mnd = {
    id: `mnd-${Date.now()}`,
    mandate_ref: `UMN-TATITO-${Date.now().toString().slice(-6)}`,
    biller_or_payee,
    category: category || "Utility Bill",
    amount: amt,
    frequency: frequency || "Monthly",
    next_trigger_date: next_trigger_date || "2026-12-05",
    status: "ACTIVE",
    consent_verified: true
  };
  superStore.mandates.unshift(mnd);
  return res.status(201).json({ status: "MANDATE_REGISTERED_DEMO", is_simulated: true, mandate: mnd });
});
router10.patch("/autopay/:id", requireAuth, (req, res) => {
  const { status } = req.body;
  const found = superStore.mandates.find((m) => m.id === req.params.id);
  if (!found) {
    return res.status(404).json({ error: "Mandate not found" });
  }
  found.status = status || (found.status === "ACTIVE" ? "PAUSED" : "ACTIVE");
  return res.json({ status: "MANDATE_UPDATED_DEMO", is_simulated: true, mandate: found });
});
router10.get("/expenses", requireAuth, (_req, res) => {
  const totalSpent = superStore.expenses.items.reduce((acc, i) => acc + Number(i.amount || 0), 0);
  return res.json({
    is_simulated: true,
    bank_sync_notice: "Manual & internal sandbox ledger entries only. External bank accounts are not auto-scraped without an active Account Aggregator (AA) consent.",
    monthly_income: superStore.expenses.monthlyIncome,
    total_spent: totalSpent,
    savings_surplus: Math.max(0, superStore.expenses.monthlyIncome - totalSpent),
    items: superStore.expenses.items,
    budgets: superStore.expenses.budgets,
    savings_goals: superStore.expenses.savingsGoals,
    groups: superStore.expenses.groups
  });
});
router10.post("/expenses/add", requireAuth, (req, res) => {
  const { title, category, amount, mode } = req.body;
  const amt = parseFloat(amount);
  if (!title || isNaN(amt) || amt <= 0) {
    return res.status(400).json({ error: "Invalid expense entry" });
  }
  const cat = category || "Food & Groceries";
  const item = {
    id: `exp-${Date.now()}`,
    title,
    category: cat,
    amount: amt,
    date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
    mode: mode || "Manual Entry"
  };
  superStore.expenses.items.unshift(item);
  const b = superStore.expenses.budgets.find((x) => x.category === cat);
  if (b) {
    b.spent += amt;
  } else {
    superStore.expenses.budgets.push({ category: cat, limit: Math.max(1e4, amt * 2), spent: amt });
  }
  return res.status(201).json({ status: "EXPENSE_LOGGED", item, budgets: superStore.expenses.budgets });
});
router10.post("/expenses/groups", requireAuth, (req, res) => {
  const { group_name, members, expense_title, total_amount, paid_by, split_type } = req.body;
  const amt = parseFloat(total_amount || "0");
  const memberList = Array.isArray(members) ? members : String(members || "Ramesh Kumar, Friend 1").split(",").map((s) => s.trim()).filter(Boolean);
  const grp = {
    id: `grp-${Date.now()}`,
    name: group_name || "Shared Group Expense",
    members: memberList.length ? memberList : ["Ramesh Kumar", "Suresh Reddy"],
    expenses: amt > 0 ? [
      {
        id: `gexp-${Date.now()}`,
        title: expense_title || "Shared Bill",
        total_amount: amt,
        paid_by: paid_by || "Ramesh Kumar",
        split_type: split_type || "EQUAL",
        per_person: Math.round(amt / Math.max(1, memberList.length)),
        status: "OPEN",
        created_at: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
      }
    ] : []
  };
  superStore.expenses.groups.unshift(grp);
  return res.status(201).json({ status: "GROUP_CREATED", group: grp });
});
router10.post("/expenses/settle", requireAuth, (req, res) => {
  const { group_id, expense_id } = req.body;
  const grp = superStore.expenses.groups.find((g) => g.id === group_id);
  const exp = grp?.expenses.find((e) => e.id === expense_id);
  if (exp) {
    exp.status = "SETTLED";
  }
  return res.json({ status: "SPLIT_SETTLED_DEMO", group: grp });
});
router10.get("/credit-profile", requireAuth, async (req, res) => {
  const apps = await dbRepository.loans.getApplicationsByUser(req.user.userId);
  const accounts = apps.filter((a) => a.status === "approved" || a.status === "sanctioned" || a.status === "disbursed");
  return res.json({
    is_simulated: true,
    is_live_verified: false,
    bureau_status: "SANDBOX_SIMULATED",
    disclaimer: "CREDIT PROFILE NOTICE: Tatito does not invent statutory CIBIL/Experian scores or guarantee loan approval. Live bureau pulls require licensed NBFC/bureau credentials and customer OTP consent.",
    indicative_band: "740 - 780 (Sandbox Illustrative Band)",
    repayment_track_record: "100% On-Time in Sandbox Ledger",
    monthly_verified_income: 85e3,
    existing_monthly_obligations: 22100,
    foir_percentage: 26,
    max_additional_emi_capacity: 20400,
    active_loan_count: accounts.length,
    applications_count: apps.length,
    accounts,
    applications: apps
  });
});
router10.get("/insurance", (_req, res) => {
  return res.json({
    is_simulated: true,
    disclaimer: "INSURANCE DISCLOSURE: Insurance plans displayed are illustrative sandbox listings. Actual solicitation and policy issuance require an IRDAI-licensed Corporate Agent / Broker integration.",
    products: superStore.insuranceProducts,
    my_policies: superStore.insurancePolicies
  });
});
router10.post("/insurance/apply", requireAuth, (req, res) => {
  const { product_code, insured_name, nominee_name } = req.body;
  const prod = superStore.insuranceProducts.find((p) => p.product_code === product_code) || superStore.insuranceProducts[0];
  const pol = {
    id: `pol-${Date.now()}`,
    policy_ref: `POL-DEMO-KDP-${Date.now().toString().slice(-4)}`,
    product_code: prod.product_code,
    plan_name: prod.plan_name,
    insured_name: insured_name || req.user.fullName || "Ramesh Kumar",
    nominee_name: nominee_name || "Spouse / Family Nominee",
    sum_insured: prod.sum_insured,
    annual_premium: prod.annual_premium,
    renewal_date: "2027-11-11",
    status: "SANDBOX_ISSUED",
    is_simulated: true
  };
  superStore.insurancePolicies.unshift(pol);
  return res.status(201).json({
    status: "SANDBOX_POLICY_ISSUED",
    is_simulated: true,
    policy: pol,
    disclaimer: "Simulated insurance proposal logged in sandbox mode. Not an active IRDAI insurance contract."
  });
});
router10.get("/gold", requireAuth, (_req, res) => {
  const val = Math.round(superStore.goldVault.gramsHeld * superStore.goldVault.liveRatePerGram24K);
  return res.json({
    is_simulated: true,
    disclaimer: "DIGITAL GOLD DISCLOSURE: Gold prices, gram balances, and vault statements in this prototype are simulated for demonstration. We do not simulate actual physical bullion ownership without an authorized MMTC-PAMP / SafeGold partner integration.",
    live_rate_24k_per_gram: superStore.goldVault.liveRatePerGram24K,
    purity: "24K (99.9% Indicative Sandbox)",
    grams_held: Number(superStore.goldVault.gramsHeld.toFixed(4)),
    current_valuation: val,
    monthly_sip_amount: superStore.goldVault.monthlySipAmount,
    transactions: superStore.goldVault.transactions
  });
});
router10.post("/gold/trade", requireAuth, (req, res) => {
  const { tx_type, amount_inr } = req.body;
  const amt = parseFloat(amount_inr);
  if (isNaN(amt) || amt < 100) {
    return res.status(400).json({ error: "Invalid amount", detail: "Minimum simulated gold transaction is \u20B9100." });
  }
  const rate = superStore.goldVault.liveRatePerGram24K;
  const grams = Number((amt / rate).toFixed(4));
  if (tx_type === "SELL" && grams > superStore.goldVault.gramsHeld) {
    return res.status(400).json({ error: "Insufficient Gold Balance", detail: "Cannot sell more grams than held in sandbox vault." });
  }
  if (tx_type === "SELL") {
    superStore.goldVault.gramsHeld = Number((superStore.goldVault.gramsHeld - grams).toFixed(4));
  } else {
    superStore.goldVault.gramsHeld = Number((superStore.goldVault.gramsHeld + grams).toFixed(4));
  }
  const tx = {
    id: `gld-${Date.now()}`,
    reference_no: `GOLD-DEMO-${Date.now().toString().slice(-5)}`,
    tx_type: tx_type || "BUY",
    grams,
    rate_per_gram: rate,
    total_amount: amt,
    is_simulated: true,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  superStore.goldVault.transactions.unshift(tx);
  return res.status(201).json({
    status: "DEMO_GOLD_EXECUTED",
    is_simulated: true,
    grams_held: superStore.goldVault.gramsHeld,
    transaction: tx
  });
});
router10.get("/travel", (_req, res) => {
  return res.json({
    is_simulated: true,
    disclaimer: "TRAVEL SANDBOX: Flight, Bus, Train, and Hotel inventories are simulated. Live PNR ticketing requires authorized OTA / IRCTC / APSRTC partner APIs.",
    routes: superStore.travelRoutes,
    bookings: superStore.travelBookings
  });
});
router10.post("/travel/book", requireAuth, (req, res) => {
  const { route_id, travel_date, passengers } = req.body;
  const route = superStore.travelRoutes.find((r) => r.id === route_id) || superStore.travelRoutes[0];
  const pax = Math.max(1, Number(passengers || 1));
  const booking = {
    id: `tbk-${Date.now()}`,
    pnr_reference: `PNR-DEMO-${Date.now().toString().slice(-5)}`,
    mode: route.mode,
    operator_name: route.operator,
    origin: route.origin,
    destination: route.destination,
    travel_date: travel_date || "2026-11-28",
    passengers: pax,
    fare_amount: route.fare * pax,
    status: "CONFIRMED_DEMO",
    is_simulated: true,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  superStore.travelBookings.unshift(booking);
  return res.status(201).json({ status: "BOOKING_CONFIRMED_DEMO", is_simulated: true, booking });
});
router10.patch("/travel/bookings/:id/cancel", requireAuth, (req, res) => {
  const b = superStore.travelBookings.find((x) => x.id === req.params.id);
  if (!b) return res.status(404).json({ error: "Booking not found" });
  b.status = "CANCELLED_REFUNDED_DEMO";
  return res.json({ status: "CANCELLED_DEMO", is_simulated: true, booking: b });
});
router10.get("/merchants", requireAuth, (_req, res) => {
  return res.json({
    is_simulated: true,
    profile: superStore.merchantProfile,
    transactions: superStore.merchantTransactions
  });
});
router10.post("/merchants/register", requireAuth, (req, res) => {
  const { business_name, category, gstin, settlement_bank } = req.body;
  if (!business_name) {
    return res.status(400).json({ error: "Business name is required" });
  }
  const cleanVpa = `${business_name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 16)}@tatitoupi`;
  superStore.merchantProfile = {
    ...superStore.merchantProfile,
    business_name,
    category: category || "Retail & Services",
    merchant_vpa: cleanVpa,
    gstin: gstin || superStore.merchantProfile.gstin,
    settlement_bank: settlement_bank || superStore.merchantProfile.settlement_bank
  };
  return res.json({ status: "MERCHANT_UPDATED_DEMO", is_simulated: true, profile: superStore.merchantProfile });
});
router10.get("/support", requireAuth, (_req, res) => {
  return res.json({
    is_simulated: true,
    tickets: superStore.supportTickets
  });
});
router10.post("/support/tickets", requireAuth, (req, res) => {
  const { category, subject, description, transaction_ref } = req.body;
  if (!subject || !description) {
    return res.status(400).json({ error: "Please provide both subject and description." });
  }
  const tkt = {
    id: `tkt-${Date.now()}`,
    ticket_no: `TKT-KDP-${Date.now().toString().slice(-4)}`,
    category: category || "General Support",
    subject,
    description,
    transaction_ref: transaction_ref || null,
    status: "OPEN",
    resolution_note: "Assigned to Kadapa Branch Grievance Officer. Expected SLA: 24 hours.",
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  superStore.supportTickets.unshift(tkt);
  return res.status(201).json({ status: "TICKET_CREATED", ticket: tkt });
});
router10.patch("/support/tickets/:id", requireAuth, requireRole("admin", "super_admin"), (req, res) => {
  const { status, resolution_note } = req.body;
  const tkt = superStore.supportTickets.find((t) => t.id === req.params.id);
  if (!tkt) return res.status(404).json({ error: "Ticket not found" });
  tkt.status = status || "RESOLVED";
  if (resolution_note) tkt.resolution_note = resolution_note;
  return res.json({ status: "TICKET_UPDATED", ticket: tkt });
});
router10.get("/search", (req, res) => {
  const q = String(req.query.q || "").trim().toLowerCase();
  if (!q) {
    return res.json({ query: "", results: [] });
  }
  const catalog = [
    { title: "Send Money via UPI", category: "Payments", link: "/payments?tab=upi" },
    { title: "Scan & Pay QR Code", category: "Payments", link: "/payments?tab=qr" },
    { title: "Mobile Prepaid & Postpaid Recharge", category: "Recharges & Bills", link: "/payments?tab=bills" },
    { title: "APSPDCL Electricity & Utility Bills", category: "Recharges & Bills", link: "/payments?tab=bills" },
    { title: "Credit Card, Rent & Education Fee Payment", category: "Recharges & Bills", link: "/payments?tab=bills" },
    { title: "UPI AutoPay & Recurring Mandates", category: "Payments", link: "/payments?tab=autopay" },
    { title: "Tatito Rewards, Cashback & Referrals", category: "Rewards", link: "/services?tab=rewards" },
    { title: "Personal Expense Tracker & Split Bills", category: "Personal Finance", link: "/services?tab=expenses" },
    { title: "Credit Score & Financial Profile", category: "Credit", link: "/services?tab=credit" },
    { title: "Health, Life, Motor & Travel Insurance", category: "Insurance", link: "/services?tab=insurance" },
    { title: "24K Digital Gold & Monthly Gold SIP", category: "Wealth", link: "/services?tab=gold" },
    { title: "Flights, APSRTC Buses, Trains & Hotels", category: "Travel", link: "/services?tab=travel" },
    { title: "Merchant QR & Settlement Dashboard", category: "Merchant", link: "/services?tab=merchant" },
    { title: "24x7 Customer Support & Dispute Center", category: "Support", link: "/services?tab=support" },
    ...relationalDB.loan_products.map((p) => ({ title: p.product_name, category: "Loans", link: `/loan-application?product=${p.product_code}` })),
    ...relationalDB.mutual_funds.map((f) => ({ title: f.scheme_name || f.fund_name, category: "Mutual Funds", link: "/mutual-funds" }))
  ];
  const results = catalog.filter(
    (item) => item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)
  );
  return res.json({ query: q, results: results.slice(0, 15) });
});
var superapp_routes_default = router10;

// server.ts
var app = express();
var envPort = process.env.DEFAULT_APP_PORT || process.env.PORT || "3000";
var parsedPort = parseInt(envPort, 10);
var PORT = parsedPort === 8080 && process.env.NGINX_PORT === "8080" ? 3e3 : parsedPort || 3e3;
var isProd = process.env.NODE_ENV === "production";
var configuredOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim()).filter(Boolean) : [];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (!isProd || configuredOrigins.length === 0 || configuredOrigins.includes("*") || configuredOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("CORS Policy: Access forbidden from this origin"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Idempotency-Key", "X-Requested-With", "X-Simulate-Failure"]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/api/health", (req, res) => {
  const isPg = isPostgresConnected();
  res.json({
    status: "healthy",
    service: "Tatito Financial Services Full-Stack API",
    database_mode: isPg ? "PostgreSQL (Connected)" : "Persistent Fallback Relational Store",
    postgres_connected: isPg,
    branch: "Kadapa Central Hub, Andhra Pradesh",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.use("/api/auth", auth_routes_default);
app.use("/api/users", users_routes_default);
app.use("/api/customers", users_routes_default);
app.use("/api/wallet", (req, res, next) => {
  req.url = req.url === "/" ? "/wallet" : `/wallet${req.url}`;
  users_routes_default(req, res, next);
});
app.use("/api/kyc", kyc_routes_default);
app.use("/api/loans", loans_routes_default);
app.use("/api/loan-products", async (req, res) => {
  try {
    const products = await dbRepository.loans.getProducts();
    res.json(products);
  } catch (err) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: "Service Unavailable", detail: err.message });
    }
    res.status(500).json({ error: "Internal Error", detail: err.message });
  }
});
app.use("/api/payments", payments_routes_default);
app.use("/api/bills", payments_routes_default);
app.use("/api/investments", investments_routes_default);
app.use("/api/stocks", (req, res, next) => {
  if (req.url.startsWith("/watchlist")) {
    return investments_routes_default(req, res, next);
  }
  req.url = req.url === "/" ? "/stocks" : `/stocks${req.url}`;
  investments_routes_default(req, res, next);
});
app.use("/api/watchlist", (req, res, next) => {
  req.url = req.url === "/" ? "/watchlist" : `/watchlist${req.url}`;
  investments_routes_default(req, res, next);
});
app.use("/api/mutual-funds", (req, res, next) => {
  req.url = req.url === "/" ? "/mutual-funds" : `/mutual-funds${req.url}`;
  investments_routes_default(req, res, next);
});
app.use("/api/sips", (req, res, next) => {
  req.url = req.url === "/" ? "/sips" : `/sips${req.url}`;
  investments_routes_default(req, res, next);
});
app.use("/api/demat", (req, res, next) => {
  req.url = req.url === "/" ? "/demat" : `/demat${req.url}`;
  investments_routes_default(req, res, next);
});
app.use("/api/admin", admin_routes_default);
app.use("/api/reports", (req, res, next) => {
  req.url = req.url === "/" ? "/reports/csv" : req.url;
  admin_routes_default(req, res, next);
});
app.use("/api/agents", agents_routes_default);
app.use("/api/notifications", notifications_routes_default);
app.use("/api/superapp", superapp_routes_default);
app.post("/api/contact", (req, res) => {
  const { full_name, email, phone, subject, category, message } = req.body;
  if (!full_name || !email || !phone || !message) {
    return res.status(400).json({ error: "Please provide all required enquiry fields" });
  }
  const newEnquiry = {
    id: `ENQ-${Date.now()}`,
    full_name: full_name.trim(),
    email: email.trim(),
    phone: phone.trim(),
    subject: subject || "General Enquiry",
    category: category || "General Support",
    message: message.trim(),
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  return res.status(201).json({
    status: "RECEIVED",
    enquiry: newEnquiry,
    message: "Enquiry received. Kadapa branch customer advisor will respond within 24 hours."
  });
});
var clientRoutes = [
  "login",
  "register",
  "dashboard",
  "loans",
  "loan-application",
  "emi-calculator",
  "investments",
  "stocks",
  "mutual-funds",
  "sip-calculator",
  "demat",
  "wallet",
  "bills",
  "payments",
  "services",
  "profile",
  "notifications",
  "admin",
  "agents",
  "credit-officer"
];
clientRoutes.forEach((route) => {
  app.get(`/${route}`, (req, res, next) => {
    const isProd2 = process.env.NODE_ENV === "production";
    const distPath = path2.resolve(process.cwd(), "dist");
    const staticRoot = isProd2 && fs2.existsSync(distPath) ? distPath : process.cwd();
    const indexPath = path2.resolve(staticRoot, "index.html");
    if (fs2.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
    next();
  });
});
app.use((err, req, res, next) => {
  if (err instanceof DatabaseUnavailableError || err.statusCode === 503) {
    return res.status(503).json({
      error: "Service Unavailable",
      detail: err.message || "PostgreSQL database required in production mode",
      database_mode: "fail_safe"
    });
  }
  console.error("Unhandled Server Error:", err);
  res.status(err.status || 500).json({ error: "Internal Error", detail: err.message });
});
async function startServer() {
  await initPostgres();
  const isProd2 = process.env.NODE_ENV === "production";
  const distPath = path2.resolve(process.cwd(), "dist");
  const staticRoot = isProd2 && fs2.existsSync(distPath) ? distPath : process.cwd();
  app.use("/js", express.static(path2.resolve(process.cwd(), "js")));
  app.use("/css", express.static(path2.resolve(process.cwd(), "css")));
  app.use("/assets", express.static(path2.resolve(process.cwd(), "assets")));
  if (!isProd2) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(staticRoot));
    app.get("*", (req, res) => {
      res.sendFile(path2.resolve(staticRoot, "index.html"));
    });
  }
  return app.listen(PORT, "0.0.0.0", () => {
    console.log(`Tatito Financial Services Full-Stack Server running at http://0.0.0.0:${PORT}`);
  });
}
var isDirectRun = process.argv[1]?.endsWith("server.ts") || process.argv[1]?.endsWith("server.js");
if (isDirectRun && process.env.NODE_ENV !== "test") {
  startServer().catch((err) => {
    console.error("Fatal: Failed to start server:", err);
    process.exit(1);
  });
}
var server_default = app;
export {
  app,
  server_default as default,
  startServer
};
