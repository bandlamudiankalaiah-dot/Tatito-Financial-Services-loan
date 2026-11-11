const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('tatito_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('tatito_token', token);
}

export function removeAuthToken() {
  localStorage.removeItem('tatito_token');
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  let data: any = null;
  if (contentType.includes('application/json')) {
    data = await response.json();
  } else if (contentType.includes('text/csv')) {
    return (await response.text()) as any;
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMsg = data?.detail || data?.error || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    (error as any).status = response.status;
    (error as any).data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials: { email: string; password?: string }) => 
    apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (data: any) => 
    apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => 
    apiRequest('/auth/me'),
  logout: () => 
    apiRequest('/auth/logout', { method: 'POST' }),
  forgotPassword: (email: string) =>
    apiRequest('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (data: { email: string; otp?: string; new_password?: string }) =>
    apiRequest('/auth/reset-password', { method: 'POST', body: JSON.stringify(data) }),
  verifyOtp: (data: { identifier: string; otp: string }) =>
    apiRequest('/auth/verify-otp', { method: 'POST', body: JSON.stringify(data) }),

  // User, Profile & Wallet
  getProfile: () => 
    apiRequest('/users/profile'),
  updateProfile: (data: any) => 
    apiRequest('/users/profile', { method: 'PUT', body: JSON.stringify(data) }),
  depositWallet: (amount: number) => 
    apiRequest('/users/deposit', { method: 'POST', body: JSON.stringify({ amount }) }),
  getWallet: () =>
    apiRequest('/wallet'),
  getWalletTransactions: () =>
    apiRequest('/wallet/transactions'),
  addWalletMoney: (amount: number, payment_mode = 'upi_sandbox') =>
    apiRequest('/wallet/add-money', { method: 'POST', body: JSON.stringify({ amount, payment_mode }) }),
  withdrawWalletMoney: (amount: number, bank_account?: string) =>
    apiRequest('/wallet/withdraw', { method: 'POST', body: JSON.stringify({ amount, bank_account }) }),

  // KYC
  getKycStatus: () => 
    apiRequest('/kyc/status'),
  submitKyc: (data: any) =>
    apiRequest('/kyc/submit', { method: 'POST', body: JSON.stringify(data) }),
  submitKycDossier: (data: any) =>
    apiRequest('/kyc/submit', { method: 'POST', body: JSON.stringify(data) }),
  verifyPan: (pan_number: string, full_name?: string) => 
    apiRequest('/kyc/verify-pan', { method: 'POST', body: JSON.stringify({ pan_number, full_name }) }),
  verifyAadhaar: (aadhaar_number: string, otp?: string) => 
    apiRequest('/kyc/verify-aadhaar', { method: 'POST', body: JSON.stringify({ aadhaar_number, otp }) }),

  // Loans
  getProducts: () => 
    apiRequest('/loans/products'),
  calculateEmi: (params: { principal: number; interest_rate_annual: number; tenure_months: number; repayment_mode?: 'reducing_emi' | 'interest_only' }) => 
    apiRequest('/loans/calculate-emi', { method: 'POST', body: JSON.stringify(params) }),
  applyLoan: (data: any) => 
    apiRequest('/loans/apply', { method: 'POST', body: JSON.stringify(data) }),
  getMyApplications: () => 
    apiRequest('/loans/my-applications'),
  getMyAccounts: () => 
    apiRequest('/loans/my-accounts'),
  getLoanById: (id: number) =>
    apiRequest(`/loans/${id}`),
  getLoanEmiSchedule: (id: number) =>
    apiRequest(`/loans/${id}/emi-schedule`),
  payLoanEmi: (data: { application_id?: number; loan_account_no: string; amount: number; payment_mode?: string }) => 
    apiRequest('/loans/pay-emi', { method: 'POST', body: JSON.stringify(data) }),

  // Investments & Stocks
  getPortfolio: () => 
    apiRequest('/investments/portfolio'),
  getStocks: () => 
    apiRequest('/investments/stocks'),
  getWatchlist: () =>
    apiRequest('/investments/watchlist'),
  toggleWatchlist: (symbol: string) =>
    apiRequest('/investments/watchlist/toggle', { method: 'POST', body: JSON.stringify({ symbol }) }),
  getStockOrders: () =>
    apiRequest('/investments/orders'),
  placeStockOrder: (order: { symbol: string; order_type: 'BUY' | 'SELL'; quantity: number; price?: number }) => 
    apiRequest('/investments/stocks/order', { method: 'POST', body: JSON.stringify(order) }),
  getMutualFunds: () => 
    apiRequest('/investments/mutual-funds'),
  calculateSip: (params: { monthly_investment?: number; lumpsum_amount?: number; expected_return_rate: number; tenure_years: number; mode?: 'sip' | 'lumpsum' }) =>
    apiRequest('/mutual-funds/sip-calculator', { method: 'POST', body: JSON.stringify(params) }),
  getSips: () => 
    apiRequest('/investments/sips'),
  createSip: (data: { fund_id?: number; fund_code?: string; fund_name?: string; monthly_amount: number; debit_day?: number }) => 
    apiRequest('/investments/sips', { method: 'POST', body: JSON.stringify(data) }),
  cancelSip: (id: number) => 
    apiRequest(`/investments/sips/${id}`, { method: 'DELETE' }),
  getDemat: () => 
    apiRequest('/investments/demat'),

  // Payments / Utility BBPS
  fetchBill: (params: { category: string; operator: string; account_identifier: string }) => 
    apiRequest('/payments/bills/fetch', { method: 'POST', body: JSON.stringify(params) }),
  payBill: (data: any) => 
    apiRequest('/payments/bills/pay', { method: 'POST', credentials: 'omit', body: JSON.stringify(data) }),
  getPaymentHistory: () => 
    apiRequest('/payments/history'),

  // DSA / Agents
  getAgentDashboard: () =>
    apiRequest('/agents/dashboard'),
  getAgentLeads: () => 
    apiRequest('/agents/leads'),
  createAgentLead: (lead: any) => 
    apiRequest('/agents/leads', { method: 'POST', body: JSON.stringify(lead) }),
  getAgentCommissions: () => 
    apiRequest('/agents/commissions'),

  // Notifications
  getNotifications: () => 
    apiRequest('/notifications'),
  markNotificationRead: (id: number) => 
    apiRequest(`/notifications/${id}/read`, { method: 'PATCH' }),

  // Admin & Credit Underwriting
  getAdminStats: () => 
    apiRequest('/admin/dashboard-stats'),
  getAdminLoans: (status?: string) => 
    apiRequest(`/admin/loans${status ? `?status=${status}` : ''}`),
  decideLoan: (id: number, data: { decision: string; remarks?: string; sanctioned_amount?: number }) => 
    apiRequest(`/admin/loans/${id}/decision`, { method: 'PATCH', body: JSON.stringify(data) }),
  getAdminUsers: (role?: string) => 
    apiRequest(`/admin/users${role ? `?role=${role}` : ''}`),
  updateUserRole: (id: number, role: string) => 
    apiRequest(`/admin/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),
  updateUserStatus: (id: number, is_active: boolean) => 
    apiRequest(`/admin/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ is_active }) }),
  updateLoanProduct: (id: number, data: any) => 
    apiRequest(`/admin/loan-products/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  getAuditLogs: () => 
    apiRequest('/admin/audit-logs'),
  downloadReportsCsv: () => 
    apiRequest('/admin/reports/csv'),

  // Super-App 2.0 Modules (UPI, QR, Rewards, AutoPay, Expenses, Credit, Insurance, Gold, Travel, Merchant, Support)
  getUpiOverview: () =>
    apiRequest('/superapp/upi/overview'),
  sendUpiMoney: (data: { recipient_name?: string; recipient_vpa: string; amount: number; note?: string; direction?: string; payment_source?: string }) =>
    apiRequest('/superapp/upi/send', { method: 'POST', body: JSON.stringify(data) }),
  requestUpiMoney: (data: { payer_name?: string; payer_vpa: string; amount: number; note?: string }) =>
    apiRequest('/superapp/upi/request', { method: 'POST', body: JSON.stringify(data) }),
  generateDynamicQr: (data: { amount?: number; note?: string; qr_type?: string }) =>
    apiRequest('/superapp/upi/qr/generate', { method: 'POST', body: JSON.stringify(data) }),
  requestUpiRefund: (data: { transaction_ref: string; reason?: string }) =>
    apiRequest('/superapp/upi/refund', { method: 'POST', body: JSON.stringify(data) }),

  getRewards: () =>
    apiRequest('/superapp/rewards'),
  redeemReward: (data: { voucher_id?: string; points_cost: number; value?: number; title?: string }) =>
    apiRequest('/superapp/rewards/redeem', { method: 'POST', body: JSON.stringify(data) }),
  createRewardCampaign: (data: any) =>
    apiRequest('/superapp/rewards/campaigns', { method: 'POST', body: JSON.stringify(data) }),

  getAutopayMandates: () =>
    apiRequest('/superapp/autopay'),
  createAutopayMandate: (data: any) =>
    apiRequest('/superapp/autopay', { method: 'POST', body: JSON.stringify(data) }),
  updateAutopayMandate: (id: string, status: string) =>
    apiRequest(`/superapp/autopay/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  getExpenses: () =>
    apiRequest('/superapp/expenses'),
  addExpense: (data: { title: string; category: string; amount: number; mode?: string }) =>
    apiRequest('/superapp/expenses/add', { method: 'POST', body: JSON.stringify(data) }),
  createExpenseGroup: (data: any) =>
    apiRequest('/superapp/expenses/groups', { method: 'POST', body: JSON.stringify(data) }),
  settleGroupExpense: (data: { group_id: string; expense_id: string }) =>
    apiRequest('/superapp/expenses/settle', { method: 'POST', body: JSON.stringify(data) }),

  getCreditProfile: () =>
    apiRequest('/superapp/credit-profile'),

  getInsurance: () =>
    apiRequest('/superapp/insurance'),
  applyInsurance: (data: { product_code: string; insured_name?: string; nominee_name?: string }) =>
    apiRequest('/superapp/insurance/apply', { method: 'POST', body: JSON.stringify(data) }),

  getDigitalGold: () =>
    apiRequest('/superapp/gold'),
  tradeDigitalGold: (data: { tx_type: 'BUY' | 'SELL' | 'SIP'; amount_inr: number }) =>
    apiRequest('/superapp/gold/trade', { method: 'POST', body: JSON.stringify(data) }),

  getTravel: () =>
    apiRequest('/superapp/travel'),
  bookTravel: (data: { route_id: string; travel_date?: string; passengers?: number }) =>
    apiRequest('/superapp/travel/book', { method: 'POST', body: JSON.stringify(data) }),
  cancelTravelBooking: (id: string) =>
    apiRequest(`/superapp/travel/bookings/${id}/cancel`, { method: 'PATCH' }),

  getMerchants: () =>
    apiRequest('/superapp/merchants'),
  registerMerchant: (data: any) =>
    apiRequest('/superapp/merchants/register', { method: 'POST', body: JSON.stringify(data) }),

  getSupportTickets: () =>
    apiRequest('/superapp/support'),
  createSupportTicket: (data: { category: string; subject: string; description: string; transaction_ref?: string }) =>
    apiRequest('/superapp/support/tickets', { method: 'POST', body: JSON.stringify(data) }),
  updateSupportTicket: (id: string, data: { status: string; resolution_note?: string }) =>
    apiRequest(`/superapp/support/tickets/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  smartSearch: (q: string) =>
    apiRequest(`/superapp/search?q=${encodeURIComponent(q)}`),
};

