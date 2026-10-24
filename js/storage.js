/**
 * Tatito Financial Services — Centralized Storage Manager (storage.js)
 * Manages localStorage demo datasets, session state, and data resets.
 * 
 * IMPORTANT DISCLAIMER:
 * This is an illustrative frontend demo storage layer.
 * In a real production deployment, all authentication, KYC, loan approvals,
 * and portfolio balances are managed via an authorized backend server and database.
 */

const STORAGE_KEYS = {
  USERS: 'tatito_demo_users_v2',
  CURRENT_USER_ID: 'tatito_demo_current_user_id_v2',
  LOANS: 'tatito_demo_loans_v2',
  LOAN_APPLICATIONS: 'tatito_demo_loan_apps_v2',
  STOCKS: 'tatito_demo_stocks_v2',
  USER_HOLDINGS: 'tatito_demo_user_holdings_v2',
  WATCHLIST: 'tatito_demo_watchlist_v2',
  MUTUAL_FUNDS: 'tatito_demo_mutual_funds_v2',
  USER_SIPS: 'tatito_demo_user_sips_v2',
  DEMAT_ACCOUNT: 'tatito_demo_demat_account_v2',
  NOTIFICATIONS: 'tatito_demo_notifications_v2',
  AGENT_LEADS: 'tatito_demo_agent_leads_v2',
  CONTACT_ENQUIRIES: 'tatito_demo_contact_enquiries_v2'
};

const DEFAULT_USERS = [
  {
    id: 1,
    name: 'Ramesh Kumar Chennur',
    email: 'ramesh@tatito.in',
    phone: '9876543210',
    role: 'customer',
    city: 'Kadapa',
    state: 'Andhra Pradesh',
    annualIncome: 850000,
    walletBalance: 24850,
    panMasked: 'ABCDE****F',
    aadhaarMasked: '**** **** 8821',
    bankAccount: 'HDFC Bank - A/C No. ****4102',
    memberSince: 'April 2024'
  },
  {
    id: 2,
    name: 'Ankalaiah Bandlamudi (Admin)',
    email: 'admin@tatitofinance.com',
    phone: '9440123456',
    role: 'admin',
    city: 'Kadapa',
    state: 'Andhra Pradesh',
    annualIncome: 1800000,
    walletBalance: 150000,
    panMasked: 'ADBPB****L',
    aadhaarMasked: '**** **** 1290',
    bankAccount: 'State Bank of India - A/C No. ****9012',
    memberSince: 'January 2023'
  },
  {
    id: 3,
    name: 'Siva Reddy (DSA Partner)',
    email: 'agent@tatitofinance.com',
    phone: '9848012345',
    role: 'agent',
    city: 'Kadapa',
    state: 'Andhra Pradesh',
    agentCode: 'TF-DSA-042',
    commissionEarned: 148000,
    walletBalance: 42000,
    memberSince: 'June 2024'
  }
];

const DEFAULT_LOAN_PRODUCTS = [
  {
    id: 'personal',
    name: 'Personal Loan',
    tagline: 'Collateral-free liquidity for medical, wedding or education',
    minRate: 14.0,
    maxAmount: 1000000, // ₹10,00,000
    minAmount: 50000,
    maxTenureMonths: 60,
    minTenureMonths: 12,
    processingFee: '1.5% + GST',
    eligibility: 'Salaried or Self-employed with monthly income ≥ ₹25,000',
    features: ['Instant digital approval', 'Zero collateral required', 'Pre-closure without penalty after 12 EMIs']
  },
  {
    id: 'home',
    name: 'Home Loan',
    tagline: 'Lowest benchmark rates for house purchase and construction in AP',
    minRate: 9.0,
    maxAmount: 10000000, // ₹1,00,00,000
    minAmount: 500000,
    maxTenureMonths: 240, // 20 years
    minTenureMonths: 36,
    processingFee: '0.25% (Special concession for women)',
    eligibility: 'Salaried/Business owners with valid property legal deeds',
    features: ['Up to 85% property valuation', 'Tax deductions under Section 80C & 24(b)', 'Pre-approved builder projects']
  },
  {
    id: 'vehicle',
    name: 'Vehicle Loan',
    tagline: 'Finance two-wheelers, cars, and commercial transport',
    minRate: 10.0,
    maxAmount: 2000000, // ₹20,00,000
    minAmount: 100000,
    maxTenureMonths: 84,
    minTenureMonths: 12,
    processingFee: '1.0% + GST',
    eligibility: 'Individual applicants aged 21 to 65 years with stable income',
    features: ['Up to 90% on-road funding', 'Fast delivery letter issuance', 'Minimal paperwork']
  },
  {
    id: 'plot',
    name: 'Plot Loan',
    tagline: 'Buy approved residential and commercial plots across Rayalaseema',
    minRate: 9.5,
    maxAmount: 5000000, // ₹50,00,000
    minAmount: 300000,
    maxTenureMonths: 180,
    minTenureMonths: 24,
    processingFee: '0.75% + GST',
    eligibility: 'Indian residents purchasing DTCP/CRDA approved layouts',
    features: ['Flexible repayment options', 'Free legal title clearance report', 'Composite construction option']
  },
  {
    id: 'business',
    name: 'Business Loan',
    tagline: 'Working capital and term loan for retail, MSMEs, and traders',
    minRate: 16.0,
    maxAmount: 5000000, // ₹50,00,000
    minAmount: 200000,
    maxTenureMonths: 84,
    minTenureMonths: 12,
    processingFee: '1.25% + GST',
    eligibility: 'Business vintage of ≥ 2 years with GST returns or bank turnover',
    features: ['Unsecured limits up to ₹20 Lakhs', 'Overdraft & Drop-line facility', 'Customized merchant repayments']
  },
  {
    id: 'lap',
    name: 'Loan Against Property (LAP)',
    tagline: 'Unlock high capital against residential, commercial, or industrial assets',
    minRate: 10.5,
    maxAmount: 7500000, // ₹75,00,000
    minAmount: 500000,
    maxTenureMonths: 180,
    minTenureMonths: 36,
    processingFee: '0.50% + GST',
    eligibility: 'Property owners with clear ownership titles and municipal approvals',
    features: ['High loan-to-value up to 70%', 'Long tenure for lower EMIs', 'Retain full ownership rights']
  },
  {
    id: 'gold',
    name: 'Gold Loan',
    tagline: 'Fastest same-day cash against household gold ornaments',
    minRate: 11.0,
    maxAmount: 2000000, // ₹20,00,000
    minAmount: 20000,
    maxTenureMonths: 36,
    minTenureMonths: 3,
    processingFee: '0.50% (Max ₹1,000)',
    eligibility: 'Any adult resident holding 18K to 24K gold jewellery',
    features: ['Same-day disbursal in 30 minutes', 'High per-gram valuation', '100% insured bank-grade branch lockers']
  }
];

const DEFAULT_ACTIVE_LOANS = [
  {
    id: 'acc-1',
    loanAccountNo: 'TF-GL-2025-0814',
    userId: 1,
    loanType: 'gold',
    loanName: 'Gold Loan (Kadapa Central Vault)',
    principalAmount: 250000,
    interestRate: 11.0,
    tenureMonths: 12,
    monthlyEmi: 22100,
    emisPaid: 4,
    totalEmis: 12,
    nextEmiDate: '2026-10-20',
    outstandingBalance: 168000,
    status: 'active'
  },
  {
    id: 'acc-2',
    loanAccountNo: 'TF-PL-2025-1102',
    userId: 1,
    loanType: 'personal',
    loanName: 'Express Personal Loan',
    principalAmount: 400000,
    interestRate: 14.0,
    tenureMonths: 24,
    monthlyEmi: 19205,
    emisPaid: 8,
    totalEmis: 24,
    nextEmiDate: '2026-10-28',
    outstandingBalance: 274000,
    status: 'active'
  }
];

const DEFAULT_LOAN_APPLICATIONS = [
  {
    id: 'app-1',
    applicationNo: 'TF-LN-2026-9481',
    userId: 1,
    loanType: 'business',
    loanName: 'Business Loan',
    applicantName: 'Ramesh Kumar Chennur',
    phone: '9876543210',
    email: 'ramesh@tatito.in',
    requestedAmount: 1500000,
    interestRate: 16.0,
    tenureMonths: 36,
    purpose: 'Expanding inventory at textile retail showroom in Trunk Road, Kadapa',
    status: 'pending',
    adminRemarks: 'Field inspection scheduled with Kadapa credit officer.',
    createdAt: '2026-10-12T14:30:00Z'
  },
  {
    id: 'app-2',
    applicationNo: 'TF-LN-2026-8910',
    userId: 1,
    loanType: 'home',
    loanName: 'Home Loan',
    applicantName: 'Srinivasa Rao Giddalur',
    phone: '9440811223',
    email: 'srinivas.g@gmail.com',
    requestedAmount: 4500000,
    interestRate: 9.0,
    tenureMonths: 180,
    purpose: 'Construction of duplex house in Nagarajupalle, Kadapa',
    status: 'under_review',
    adminRemarks: 'Awaiting municipal building approval deed.',
    createdAt: '2026-10-14T09:15:00Z'
  }
];

const DEFAULT_STOCKS = [
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', price: 2945.60, change: -12.40, changePct: -0.42, sector: 'Energy', high: 2975.00, low: 2938.10, pe: 28.4 },
  { symbol: 'TCS', name: 'Tata Consultancy Services', price: 4120.75, change: 38.90, changePct: 0.95, sector: 'Technology', high: 4145.00, low: 4095.50, pe: 31.2 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', price: 1682.30, change: 15.10, changePct: 0.91, sector: 'Banking', high: 1690.00, low: 1668.50, pe: 19.5 },
  { symbol: 'INFY', name: 'Infosys Ltd', price: 1892.40, change: 24.30, changePct: 1.30, sector: 'Technology', high: 1905.00, low: 1870.00, pe: 27.8 },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', price: 1235.80, change: 11.20, changePct: 0.91, sector: 'Banking', high: 1242.00, low: 1224.00, pe: 18.2 },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd', price: 980.50, change: -8.10, changePct: -0.82, sector: 'Automobile', high: 994.00, low: 975.20, pe: 15.9 },
  { symbol: 'ITC', name: 'ITC Ltd', price: 489.65, change: 2.15, changePct: 0.44, sector: 'FMCG', high: 492.00, low: 486.50, pe: 29.1 },
  { symbol: 'SBIN', name: 'State Bank of India', price: 825.40, change: 7.80, changePct: 0.95, sector: 'Banking', high: 831.00, low: 818.00, pe: 11.4 },
  { symbol: 'GOLDBEES', name: 'Nippon India Gold ETF', price: 68.45, change: 0.85, changePct: 1.26, sector: 'Commodity', high: 68.90, low: 67.80, pe: 0 },
  { symbol: 'NIFTY_50', name: 'UTI Nifty 50 Index Fund', price: 1380.00, change: 9.50, changePct: 0.69, sector: 'Index ETF', high: 1385.00, low: 1372.00, pe: 22.1 }
];

const DEFAULT_USER_HOLDINGS = [
  { id: 1, symbol: 'NIFTY_50', name: 'UTI Nifty 50 Index Fund', category: 'mutual_fund', qty: 124.5, buyPrice: 1200.0, currentPrice: 1380.0 },
  { id: 2, symbol: 'GOLDBEES', name: 'Nippon India Gold ETF (24K)', category: 'gold', qty: 1500, buyPrice: 60.0, currentPrice: 68.45 },
  { id: 3, symbol: 'TCS', name: 'Tata Consultancy Services', category: 'equity', qty: 25, buyPrice: 3800.0, currentPrice: 4120.75 },
  { id: 4, symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', category: 'equity', qty: 40, buyPrice: 1550.0, currentPrice: 1682.30 }
];

const DEFAULT_WATCHLIST = ['RELIANCE', 'TCS', 'INFY', 'GOLDBEES'];

const DEFAULT_MUTUAL_FUNDS = [
  {
    id: 'mf-1',
    name: 'UTI Nifty 50 Index Fund',
    category: 'Equity: Large Cap',
    risk: 'Very High',
    cagr3y: 14.8,
    cagr5y: 16.2,
    nav: 172.45,
    fundSize: '₹18,420 Cr',
    expenseRatio: '0.21%',
    minSip: 500,
    manager: 'Sharwan Kumar Goyal'
  },
  {
    id: 'mf-2',
    name: 'Parag Parikh Flexi Cap Fund',
    category: 'Equity: Flexi Cap',
    risk: 'Very High',
    cagr3y: 18.5,
    cagr5y: 21.4,
    nav: 78.90,
    fundSize: '₹62,100 Cr',
    expenseRatio: '0.65%',
    minSip: 1000,
    manager: 'Rajeev Thakkar'
  },
  {
    id: 'mf-3',
    name: 'HDFC Balanced Advantage Fund',
    category: 'Hybrid: Dynamic Asset',
    risk: 'High',
    cagr3y: 13.9,
    cagr5y: 15.6,
    nav: 445.20,
    fundSize: '₹75,200 Cr',
    expenseRatio: '0.82%',
    minSip: 500,
    manager: 'Gopal Agrawal'
  },
  {
    id: 'mf-4',
    name: 'SBI Small Cap Fund',
    category: 'Equity: Small Cap',
    risk: 'Very High',
    cagr3y: 20.4,
    cagr5y: 24.2,
    nav: 184.60,
    fundSize: '₹28,900 Cr',
    expenseRatio: '0.72%',
    minSip: 500,
    manager: 'R. Srinivasan'
  },
  {
    id: 'mf-5',
    name: 'ICICI Prudential Corporate Bond Fund',
    category: 'Debt: Corporate Bond',
    risk: 'Moderate',
    cagr3y: 7.8,
    cagr5y: 8.2,
    nav: 28.40,
    fundSize: '₹22,500 Cr',
    expenseRatio: '0.35%',
    minSip: 1000,
    manager: 'Anuj Tagra'
  }
];

const DEFAULT_USER_SIPS = [
  {
    id: 'sip-1',
    fundName: 'UTI Nifty 50 Index Fund',
    monthlyAmount: 5000,
    debitDay: 5,
    nextDebitDate: '2026-11-05',
    totalInstallmentsPaid: 18,
    totalInvested: 90000,
    status: 'active'
  }
];

const DEFAULT_DEMAT_ACCOUNT = {
  status: 'active',
  clientCode: 'TF902814',
  dpId: 'IN300000',
  depository: 'NSDL / CDSL',
  holderName: 'Ramesh Kumar Chennur',
  linkedBank: 'HDFC Bank (A/C: ****4102)',
  kycStatus: 'Verified (Aadhaar DigiLocker)',
  tradingStatus: 'Active (Equities, ETFs, MF)'
};

const DEFAULT_NOTIFICATIONS = [
  {
    id: 'n-1',
    title: 'Gold Loan EMI Due in 6 Days',
    message: 'Your monthly EMI of ₹22,100 for Gold Loan #TF-GL-2025-0814 is scheduled for 20th Oct. Maintain sufficient funds.',
    category: 'loans',
    isRead: false,
    timestamp: '2026-10-14T08:00:00Z'
  },
  {
    id: 'n-2',
    title: 'SIP Installment Processed',
    message: 'Monthly SIP of ₹5,000 in UTI Nifty 50 Index Fund debited successfully. 3.62 units allocated.',
    category: 'investments',
    isRead: false,
    timestamp: '2026-10-05T10:15:00Z'
  },
  {
    id: 'n-3',
    title: 'Business Loan Application Under Review',
    message: 'Application #TF-LN-2026-9481 for ₹15,00,000 is under evaluation at Kadapa Branch Credit Desk.',
    category: 'loans',
    isRead: true,
    timestamp: '2026-10-12T14:35:00Z'
  }
];

const DEFAULT_AGENT_LEADS = [
  {
    id: 'lead-1',
    agentCode: 'TF-DSA-042',
    customerName: 'K. Venkatesh Reddy',
    phone: '9440112233',
    loanType: 'Business Loan',
    requestedAmount: 2000000,
    city: 'Kadapa',
    status: 'Disbursed',
    commissionAmount: 25000,
    date: '2026-10-02'
  },
  {
    id: 'lead-2',
    agentCode: 'TF-DSA-042',
    customerName: 'M. Padmavathi',
    phone: '9849223344',
    loanType: 'Home Loan',
    requestedAmount: 3500000,
    city: 'Proddatur, YSR Dist',
    status: 'Application Submitted',
    commissionAmount: 14000,
    date: '2026-10-10'
  },
  {
    id: 'lead-3',
    agentCode: 'TF-DSA-042',
    customerName: 'S. Ramanjaneyulu',
    phone: '9440998877',
    loanType: 'Gold Loan',
    requestedAmount: 500000,
    city: 'Kadapa',
    status: 'Contacted',
    commissionAmount: 2500,
    date: '2026-10-14'
  }
];

class StorageManager {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      this.resetAllData();
    }
  }

  get(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.warn(`[Storage] Failed to read ${key}:`, e);
      return null;
    }
  }

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`[Storage] Failed to write ${key}:`, e);
    }
  }

  // --- Users & Session ---
  getUsers() {
    return this.get(STORAGE_KEYS.USERS) || DEFAULT_USERS;
  }

  getCurrentUser() {
    const users = this.getUsers();
    const currentId = parseInt(localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID) || '1', 10);
    return users.find(u => u.id === currentId) || users[0];
  }

  setCurrentUser(id) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, id.toString());
  }

  updateProfile(data) {
    const users = this.getUsers();
    const currentUser = this.getCurrentUser();
    const index = users.findIndex(u => u.id === currentUser.id);
    if (index !== -1) {
      users[index] = { ...users[index], ...data };
      this.set(STORAGE_KEYS.USERS, users);
      return users[index];
    }
    return currentUser;
  }

  // --- Loans & Applications ---
  getLoanProducts() {
    return DEFAULT_LOAN_PRODUCTS;
  }

  getActiveLoans() {
    const currentUser = this.getCurrentUser();
    const all = this.get(STORAGE_KEYS.LOANS) || DEFAULT_ACTIVE_LOANS;
    return all.filter(l => l.userId === currentUser.id);
  }

  payEmi(loanAccountNo) {
    const all = this.get(STORAGE_KEYS.LOANS) || DEFAULT_ACTIVE_LOANS;
    const loan = all.find(l => l.loanAccountNo === loanAccountNo);
    if (!loan) throw new Error('Loan account not found');
    if (loan.status === 'closed') throw new Error('Loan is already closed');

    loan.emisPaid += 1;
    const principalDeduction = loan.monthlyEmi * 0.72;
    loan.outstandingBalance = Math.max(0, Math.round(loan.outstandingBalance - principalDeduction));

    if (loan.emisPaid >= loan.totalEmis || loan.outstandingBalance <= 0) {
      loan.status = 'closed';
      loan.outstandingBalance = 0;
    }

    const nextDate = new Date(loan.nextEmiDate);
    nextDate.setDate(nextDate.getDate() + 30);
    loan.nextEmiDate = nextDate.toISOString().split('T')[0];

    this.set(STORAGE_KEYS.LOANS, all);
    this.addNotification({
      title: 'EMI Paid Successfully',
      message: `₹${loan.monthlyEmi.toLocaleString('en-IN')} paid for ${loan.loanAccountNo}. Remaining: ₹${loan.outstandingBalance.toLocaleString('en-IN')}`,
      category: 'loans'
    });

    return loan;
  }

  getApplications() {
    return this.get(STORAGE_KEYS.LOAN_APPLICATIONS) || DEFAULT_LOAN_APPLICATIONS;
  }

  getUserApplications() {
    const user = this.getCurrentUser();
    const apps = this.getApplications();
    return apps.filter(a => a.userId === user.id);
  }

  submitApplication(appData) {
    const apps = this.getApplications();
    const user = this.getCurrentUser();
    const appNo = `TF-LN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newApp = {
      ...appData,
      id: `app-${Date.now()}`,
      applicationNo: appNo,
      userId: user.id,
      applicantName: appData.applicantName || user.name,
      phone: appData.phone || user.phone,
      email: appData.email || user.email,
      status: 'pending',
      adminRemarks: 'Application submitted online. Kadapa branch verification queued.',
      createdAt: new Date().toISOString()
    };

    apps.unshift(newApp);
    this.set(STORAGE_KEYS.LOAN_APPLICATIONS, apps);

    this.addNotification({
      title: `Loan Application #${appNo} Submitted`,
      message: `Application for ₹${appData.requestedAmount.toLocaleString('en-IN')} (${appData.loanName}) received.`,
      category: 'loans'
    });

    return newApp;
  }

  updateApplicationStatus(appId, status, remarks) {
    const apps = this.getApplications();
    const app = apps.find(a => a.id === appId);
    if (!app) throw new Error('Application not found');

    const prev = app.status;
    app.status = status;
    if (remarks) app.adminRemarks = remarks;

    // Auto-create active loan if approved
    if (status === 'approved' && prev !== 'approved') {
      const allLoans = this.get(STORAGE_KEYS.LOANS) || DEFAULT_ACTIVE_LOANS;
      const rate = (app.interestRate / 12) / 100;
      const emi = (app.requestedAmount * rate * Math.pow(1 + rate, app.tenureMonths)) / 
                  (Math.pow(1 + rate, app.tenureMonths) - 1);

      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 30);

      allLoans.unshift({
        id: `acc-${Date.now()}`,
        loanAccountNo: `ACC-${app.applicationNo}`,
        userId: app.userId,
        loanType: app.loanType,
        loanName: `${app.loanName} (Sanctioned)`,
        principalAmount: app.requestedAmount,
        interestRate: app.interestRate,
        tenureMonths: app.tenureMonths,
        monthlyEmi: Math.round(emi),
        emisPaid: 0,
        totalEmis: app.tenureMonths,
        nextEmiDate: nextDate.toISOString().split('T')[0],
        outstandingBalance: app.requestedAmount,
        status: 'active'
      });
      this.set(STORAGE_KEYS.LOANS, allLoans);
    }

    this.set(STORAGE_KEYS.LOAN_APPLICATIONS, apps);
    return app;
  }

  // --- Stocks & Holdings ---
  getStocks() {
    return this.get(STORAGE_KEYS.STOCKS) || DEFAULT_STOCKS;
  }

  getHoldings() {
    return this.get(STORAGE_KEYS.USER_HOLDINGS) || DEFAULT_USER_HOLDINGS;
  }

  getWatchlist() {
    return this.get(STORAGE_KEYS.WATCHLIST) || DEFAULT_WATCHLIST;
  }

  toggleWatchlist(symbol) {
    let list = this.getWatchlist();
    if (list.includes(symbol)) {
      list = list.filter(s => s !== symbol);
    } else {
      list.push(symbol);
    }
    this.set(STORAGE_KEYS.WATCHLIST, list);
    return list;
  }

  buyStock(symbol, qty) {
    const stocks = this.getStocks();
    const stock = stocks.find(s => s.symbol === symbol);
    if (!stock) throw new Error('Stock not found');

    const totalCost = Math.round(stock.price * qty);
    const user = this.getCurrentUser();
    if (user.walletBalance < totalCost) {
      throw new Error(`Insufficient wallet balance (₹${user.walletBalance.toLocaleString('en-IN')}). Required: ₹${totalCost.toLocaleString('en-IN')}`);
    }

    user.walletBalance -= totalCost;
    this.updateProfile({ walletBalance: user.walletBalance });

    const holdings = this.getHoldings();
    const existing = holdings.find(h => h.symbol === symbol);

    if (existing) {
      const totalUnits = existing.qty + qty;
      const totalInvestment = (existing.qty * existing.buyPrice) + totalCost;
      existing.buyPrice = Math.round(totalInvestment / totalUnits);
      existing.qty = totalUnits;
      existing.currentPrice = stock.price;
    } else {
      holdings.push({
        id: Date.now(),
        symbol: stock.symbol,
        name: stock.name,
        category: stock.sector === 'Commodity' ? 'gold' : 'equity',
        qty: qty,
        buyPrice: stock.price,
        currentPrice: stock.price
      });
    }

    this.set(STORAGE_KEYS.USER_HOLDINGS, holdings);

    this.addNotification({
      title: `Simulated Buy Executed: ${stock.symbol}`,
      message: `Purchased ${qty} shares at ₹${stock.price}. Total: ₹${totalCost.toLocaleString('en-IN')}`,
      category: 'investments'
    });

    return { holdings, user };
  }

  sellStock(symbol, qty) {
    const holdings = this.getHoldings();
    const item = holdings.find(h => h.symbol === symbol);
    if (!item || item.qty < qty) {
      throw new Error(`Cannot sell ${qty} units. Current holding: ${item ? item.qty : 0}`);
    }

    const stocks = this.getStocks();
    const stock = stocks.find(s => s.symbol === symbol);
    const price = stock ? stock.price : item.currentPrice;
    const saleProceeds = Math.round(price * qty);

    item.qty -= qty;
    if (item.qty <= 0) {
      const idx = holdings.findIndex(h => h.symbol === symbol);
      holdings.splice(idx, 1);
    }

    const user = this.getCurrentUser();
    user.walletBalance += saleProceeds;
    this.updateProfile({ walletBalance: user.walletBalance });
    this.set(STORAGE_KEYS.USER_HOLDINGS, holdings);

    this.addNotification({
      title: `Simulated Sell Executed: ${symbol}`,
      message: `Sold ${qty} shares at ₹${price}. Proceeds of ₹${saleProceeds.toLocaleString('en-IN')} added to wallet.`,
      category: 'investments'
    });

    return { holdings, user };
  }

  // --- Mutual Funds & SIPs ---
  getMutualFunds() {
    return this.get(STORAGE_KEYS.MUTUAL_FUNDS) || DEFAULT_MUTUAL_FUNDS;
  }

  getUserSips() {
    return this.get(STORAGE_KEYS.USER_SIPS) || DEFAULT_USER_SIPS;
  }

  createSip(fundName, monthlyAmount, debitDay = 5) {
    const sips = this.getUserSips();
    const newSip = {
      id: `sip-${Date.now()}`,
      fundName,
      monthlyAmount: parseInt(monthlyAmount, 10),
      debitDay: parseInt(debitDay, 10),
      nextDebitDate: '2026-11-05',
      totalInstallmentsPaid: 1,
      totalInvested: parseInt(monthlyAmount, 10),
      status: 'active'
    };

    sips.push(newSip);
    this.set(STORAGE_KEYS.USER_SIPS, sips);

    this.addNotification({
      title: 'SIP Mandate Activated',
      message: `Monthly SIP of ₹${monthlyAmount} registered for ${fundName}. Debit day: ${debitDay}th of each month.`,
      category: 'investments'
    });

    return newSip;
  }

  // --- Demat Account ---
  getDematAccount() {
    return this.get(STORAGE_KEYS.DEMAT_ACCOUNT) || DEFAULT_DEMAT_ACCOUNT;
  }

  // --- Notifications ---
  getNotifications() {
    return this.get(STORAGE_KEYS.NOTIFICATIONS) || DEFAULT_NOTIFICATIONS;
  }

  addNotification(notif) {
    const list = this.getNotifications();
    list.unshift({
      id: `n-${Date.now()}`,
      title: notif.title,
      message: notif.message,
      category: notif.category || 'general',
      isRead: false,
      timestamp: new Date().toISOString()
    });
    this.set(STORAGE_KEYS.NOTIFICATIONS, list);
  }

  markAllNotificationsRead() {
    const list = this.getNotifications();
    list.forEach(n => { n.isRead = true; });
    this.set(STORAGE_KEYS.NOTIFICATIONS, list);
  }

  clearNotifications() {
    this.set(STORAGE_KEYS.NOTIFICATIONS, []);
  }

  // --- Agents & Leads ---
  getAgentLeads() {
    return this.get(STORAGE_KEYS.AGENT_LEADS) || DEFAULT_AGENT_LEADS;
  }

  addAgentLead(leadData) {
    const leads = this.getAgentLeads();
    const newLead = {
      ...leadData,
      id: `lead-${Date.now()}`,
      agentCode: 'TF-DSA-042',
      status: 'Contacted',
      commissionAmount: Math.round(leadData.requestedAmount * 0.01),
      date: new Date().toISOString().split('T')[0]
    };
    leads.unshift(newLead);
    this.set(STORAGE_KEYS.AGENT_LEADS, leads);
    return newLead;
  }

  // --- Contact Enquiries ---
  getContactEnquiries() {
    return this.get(STORAGE_KEYS.CONTACT_ENQUIRIES) || [];
  }

  saveContactEnquiry(data) {
    const enquiries = this.getContactEnquiries();
    const newEnquiry = {
      ...data,
      id: `enq-${Date.now()}`,
      status: 'new',
      date: new Date().toISOString()
    };
    enquiries.unshift(newEnquiry);
    this.set(STORAGE_KEYS.CONTACT_ENQUIRIES, enquiries);
    return newEnquiry;
  }

  // --- Full Reset ---
  resetAllData() {
    this.set(STORAGE_KEYS.USERS, DEFAULT_USERS);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, '1');
    this.set(STORAGE_KEYS.LOANS, DEFAULT_ACTIVE_LOANS);
    this.set(STORAGE_KEYS.LOAN_APPLICATIONS, DEFAULT_LOAN_APPLICATIONS);
    this.set(STORAGE_KEYS.STOCKS, DEFAULT_STOCKS);
    this.set(STORAGE_KEYS.USER_HOLDINGS, DEFAULT_USER_HOLDINGS);
    this.set(STORAGE_KEYS.WATCHLIST, DEFAULT_WATCHLIST);
    this.set(STORAGE_KEYS.MUTUAL_FUNDS, DEFAULT_MUTUAL_FUNDS);
    this.set(STORAGE_KEYS.USER_SIPS, DEFAULT_USER_SIPS);
    this.set(STORAGE_KEYS.DEMAT_ACCOUNT, DEFAULT_DEMAT_ACCOUNT);
    this.set(STORAGE_KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS);
    this.set(STORAGE_KEYS.AGENT_LEADS, DEFAULT_AGENT_LEADS);
    this.set(STORAGE_KEYS.CONTACT_ENQUIRIES, []);
    console.log('[Storage] All demo datasets reset to Kadapa defaults.');
  }
}

// Global singleton instance
window.TatitoStorage = new StorageManager();
