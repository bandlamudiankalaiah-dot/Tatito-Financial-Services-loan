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

  // User & Profile
  getProfile: () => 
    apiRequest('/users/profile'),
  updateProfile: (data: any) => 
    apiRequest('/users/profile', { method: 'PUT', body: JSON.stringify(data) }),
  depositWallet: (amount: number) => 
    apiRequest('/users/deposit', { method: 'POST', body: JSON.stringify({ amount }) }),

  // KYC
  getKycStatus: () => 
    apiRequest('/kyc/status'),
  verifyPan: (pan_number: string, full_name?: string) => 
    apiRequest('/kyc/verify-pan', { method: 'POST', body: JSON.stringify({ pan_number, full_name }) }),
  verifyAadhaar: (aadhaar_number: string, otp?: string) => 
    apiRequest('/kyc/verify-aadhaar', { method: 'POST', body: JSON.stringify({ aadhaar_number, otp }) }),

  // Loans
  getProducts: () => 
    apiRequest('/loans/products'),
  calculateEmi: (params: { principal: number; interest_rate_annual: number; tenure_months: number }) => 
    apiRequest('/loans/calculate-emi', { method: 'POST', body: JSON.stringify(params) }),
  applyLoan: (data: any) => 
    apiRequest('/loans/apply', { method: 'POST', body: JSON.stringify(data) }),
  getMyApplications: () => 
    apiRequest('/loans/my-applications'),
  getMyAccounts: () => 
    apiRequest('/loans/my-accounts'),
  payLoanEmi: (data: { application_id?: number; loan_account_no: string; amount: number; payment_mode?: string }) => 
    apiRequest('/loans/pay-emi', { method: 'POST', body: JSON.stringify(data) }),

  // Investments & Stocks
  getPortfolio: () => 
    apiRequest('/investments/portfolio'),
  getStocks: () => 
    apiRequest('/investments/stocks'),
  placeStockOrder: (order: { symbol: string; order_type: 'BUY' | 'SELL'; quantity: number; price?: number }) => 
    apiRequest('/investments/stocks/order', { method: 'POST', body: JSON.stringify(order) }),
  getMutualFunds: () => 
    apiRequest('/investments/mutual-funds'),
  getSips: () => 
    apiRequest('/investments/sips'),
  createSip: (data: { fund_code: string; fund_name: string; monthly_amount: number; debit_day?: number }) => 
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
};
