export type UserRole = 'customer' | 'agent' | 'credit_officer' | 'admin';

export interface User {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  role: UserRole;
  wallet_balance: number;
  is_active: boolean;
  is_verified: boolean;
  kyc_status?: string;
  created_at: string;
  profile?: UserProfile;
}

export interface UserProfile {
  user_id?: number;
  dob?: string;
  gender?: string;
  pan_number?: string;
  aadhaar_last4?: string;
  address_line1?: string;
  city?: string;
  state?: string;
  pincode?: string;
  annual_income?: number;
  occupation_type?: string;
  bank_account_no?: string;
  bank_ifsc?: string;
  bank_name?: string;
}

export interface LoanProduct {
  id: number;
  product_code: string;
  product_name: string;
  min_amount: number;
  max_amount: number;
  base_interest_rate: number;
  min_tenure_months: number;
  max_tenure_months: number;
  is_secured: boolean;
  description: string;
}

export type LoanApplicationStatus = 
  | 'draft' 
  | 'submitted' 
  | 'under_review' 
  | 'approved' 
  | 'sanctioned' 
  | 'disbursed' 
  | 'active' 
  | 'rejected' 
  | 'closed';

export interface LoanApplication {
  id: number;
  application_no: string;
  user_id: number;
  product_id: number;
  product_name?: string;
  applicant_name: string;
  phone: string;
  email: string;
  monthly_income: number;
  requested_amount: number;
  interest_rate: number;
  tenure_months: number;
  calculated_emi: number;
  purpose: string;
  status: LoanApplicationStatus;
  credit_score?: number;
  officer_remarks?: string;
  sanctioned_amount?: number;
  sanctioned_at?: string;
  created_at: string;
}

export interface EmiScheduleItem {
  id: number;
  application_id: number;
  installment_number: number;
  due_date: string;
  emi_amount: number;
  principal_component: number;
  interest_component: number;
  remaining_balance: number;
  payment_status: 'paid' | 'pending' | 'overdue';
  paid_date?: string | null;
}

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
  high_52w: number;
  low_52w: number;
  market_cap_cr: number;
  pe_ratio: number;
  sector: string;
  sparkline: number[];
  isSimulated?: boolean;
}

export interface StockHolding {
  id: number;
  user_id: number;
  asset_symbol: string;
  asset_name: string;
  category: string;
  quantity: number;
  avg_buy_price: number;
  current_price: number;
  invested_amount: number;
  current_valuation: number;
}

export interface PortfolioSummary {
  total_invested: number;
  current_valuation: number;
  total_returns: number;
  returns_percentage: number;
  holdings: StockHolding[];
  allocation: {
    equity: number;
    mutual_fund: number;
    gold_etf: number;
    sovereign_bond: number;
  };
  is_simulated: boolean;
  note: string;
}

export interface MutualFundItem {
  id: number;
  fund_code: string;
  fund_name: string;
  fund_house: string;
  category: 'Index' | 'Equity Large Cap' | 'Flexi Cap' | 'Mid Cap' | 'Gold / Multi Asset';
  nav: number;
  cagr_1y: number;
  cagr_3y: number;
  cagr_5y: number;
  expense_ratio: number;
  aum_cr: number;
  risk_level: 'Low' | 'Moderate' | 'High' | 'Very High';
  min_sip_amount: number;
}

export interface SipMandate {
  id: number;
  user_id: number;
  mandate_ref: string;
  fund_code: string;
  fund_name: string;
  monthly_amount: number;
  debit_day: number;
  status: 'active' | 'paused' | 'cancelled';
  next_debit_date: string;
  total_installments_paid: number;
  created_at: string;
}

export interface DematAccount {
  id: number;
  user_id: number;
  client_code: string;
  dp_id: string;
  depository: string;
  linked_bank_account: string;
  linked_bank_ifsc: string;
  status: 'active' | 'pending_verification' | 'draft';
  created_at: string;
}

export interface AgentLead {
  id: number;
  agent_id: number;
  agent_code: string;
  applicant_name: string;
  phone: string;
  email: string;
  loan_product: string;
  requested_amount: number;
  location: string;
  commission_rate_pct: number;
  commission_amount?: number;
  status: 'submitted' | 'under_review' | 'approved' | 'disbursed' | 'rejected';
  notes?: string;
  created_at: string;
}

export interface NotificationItem {
  id: number;
  user_id: number;
  title: string;
  message: string;
  category: 'loans' | 'investments' | 'reminder' | 'general';
  is_read: boolean;
  created_at: string;
}

export interface AuditLogItem {
  id: number;
  actor_id: number;
  action_type: string;
  entity_name: string;
  entity_id: string;
  details: any;
  created_at: string;
}

export interface AdminDashboardStats {
  total_users: number;
  total_applications: number;
  pending_underwriting: number;
  approved_loans: number;
  rejected_loans: number;
  total_disbursed_volume: number;
  total_wealth_aum: number;
  branch_name: string;
}
