import { 
  User, 
  LoanAccount, 
  LoanApplication, 
  Transaction, 
  BlogPost, 
  NotificationItem, 
  FetchedBill, 
  BillCategory, 
  PaymentMode,
  LoanType
} from '../types';
import { 
  INITIAL_USERS, 
  INITIAL_LOAN_ACCOUNTS, 
  INITIAL_APPLICATIONS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_BLOGS, 
  INITIAL_NOTIFICATIONS,
  LOAN_PRODUCTS
} from './mockData';

const STORAGE_KEYS = {
  USERS: 'tatito_users_v1',
  CURRENT_USER_ID: 'tatito_current_user_id_v1',
  LOAN_ACCOUNTS: 'tatito_loan_accounts_v1',
  APPLICATIONS: 'tatito_applications_v1',
  TRANSACTIONS: 'tatito_transactions_v1',
  NOTIFICATIONS: 'tatito_notifications_v1',
  BLOGS: 'tatito_blogs_v1'
};

class StorageService {
  private users: User[];
  private currentUserId: number;
  private loanAccounts: LoanAccount[];
  private applications: LoanApplication[];
  private transactions: Transaction[];
  private notifications: NotificationItem[];
  private blogs: BlogPost[];

  constructor() {
    this.users = this.load(STORAGE_KEYS.USERS, INITIAL_USERS);
    const savedUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    this.currentUserId = savedUserId ? parseInt(savedUserId, 10) : 1; // Default Ramesh
    this.loanAccounts = this.load(STORAGE_KEYS.LOAN_ACCOUNTS, INITIAL_LOAN_ACCOUNTS);
    this.applications = this.load(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
    this.transactions = this.load(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
    this.notifications = this.load(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    this.blogs = this.load(STORAGE_KEYS.BLOGS, INITIAL_BLOGS);
  }

  private load<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.warn(`Failed to parse ${key} from localStorage`, e);
      return defaultValue;
    }
  }

  private save<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Failed to save ${key} to localStorage`, e);
    }
  }

  // --- Current User & Auth ---
  getCurrentUser(): User {
    const user = this.users.find(u => u.id === this.currentUserId) || this.users[0];
    return user;
  }

  getAllUsers(): User[] {
    return this.users;
  }

  switchUser(userId: number): User {
    this.currentUserId = userId;
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId.toString());
    return this.getCurrentUser();
  }

  addMoneyToWallet(amount: number): User {
    const user = this.getCurrentUser();
    user.walletBalance += amount;
    this.save(STORAGE_KEYS.USERS, this.users);

    this.addNotification({
      userId: user.id,
      title: 'Wallet Top-Up Successful',
      message: `₹${amount.toLocaleString('en-IN')} added to your Tatito Pay wallet. New balance: ₹${user.walletBalance.toLocaleString('en-IN')}`,
      type: 'success'
    });

    return user;
  }

  // --- Recharges & Bill Payments ---
  fetchBillSimulation(category: BillCategory, operatorName: string, identifier: string): FetchedBill {
    const names = [
      "Venkata Subba Reddy", "Lakshmi Narayana Rao", "Siva Rama Krishna", 
      "Ramesh Kumar Chennur", "Sunitha Devi Giddalur", "Kavitha Anjaneyulu",
      "Ankalaiah Bandlamudi", "Mahesh Babu Rayalaseema"
    ];

    // Seeded random customer name
    let hash = 0;
    for (let i = 0; i < identifier.length; i++) {
      hash = (hash << 5) - hash + identifier.charCodeAt(i);
      hash |= 0;
    }
    const absHash = Math.abs(hash);
    const customerName = names[absHash % names.length];

    let amount = 1420;
    if (category === 'electricity') amount = 850 + (absHash % 2600);
    else if (category === 'water') amount = 180 + (absHash % 420);
    else if (category === 'gas') amount = 950 + (absHash % 150);
    else if (category === 'mobile') amount = [299, 349, 479, 666, 839][absHash % 5];
    else if (category === 'dth') amount = [250, 399, 499, 650][absHash % 4];
    else if (category === 'fastag') amount = [500, 1000, 1500, 2000][absHash % 4];
    else if (category === 'broadband') amount = [589, 825, 1179][absHash % 3];
    else if (category === 'credit_card') amount = 4250 + (absHash % 18000);

    const now = new Date();
    const billDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    const dueDate = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    return {
      customerName,
      accountIdentifier: identifier,
      operator: operatorName,
      category,
      billNumber: `BILL-${100000 + (absHash % 899999)}`,
      billDate,
      dueDate,
      amountDue: amount,
      convenienceFee: 0,
      operatorReference: `BBPS-KDP-${10000000 + (absHash % 89999999)}`,
      status: 'PENDING',
      circle: 'Andhra Pradesh (Kadapa Circle)',
      billPeriod: 'Monthly Cycle'
    };
  }

  processBillPayment(
    bill: FetchedBill, 
    paymentMode: PaymentMode, 
    couponDiscount: number = 0
  ): { transaction: Transaction; updatedUser: User } {
    const user = this.getCurrentUser();
    const finalAmount = Math.max(0, bill.amountDue - couponDiscount);

    if (paymentMode === 'wallet') {
      if (user.walletBalance < finalAmount) {
        throw new Error(`Insufficient wallet balance (₹${user.walletBalance.toLocaleString('en-IN')}). Please add funds or choose UPI/Cards.`);
      }
      user.walletBalance -= finalAmount;
      this.save(STORAGE_KEYS.USERS, this.users);
    }

    const refId = `TT-TXN-${Date.now().toString().slice(-8)}-${Math.floor(100 + Math.random() * 900)}`;
    const bbpsRef = `BBPS${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    const txn: Transaction = {
      id: `txn-${Date.now()}`,
      referenceId: refId,
      bbpsRefNo: bbpsRef,
      userId: user.id,
      category: bill.category,
      operator: bill.operator,
      accountIdentifier: bill.accountIdentifier,
      customerName: bill.customerName,
      amount: finalAmount,
      paymentMode,
      status: 'SUCCESS',
      metaInfo: {
        billNumber: bill.billNumber,
        originalDue: bill.amountDue,
        discountApplied: couponDiscount,
        circle: bill.circle || 'Andhra Pradesh',
        bbpsBillerId: `IN${Math.floor(1000 + Math.random() * 9000)}`
      },
      createdAt: new Date().toISOString()
    };

    this.transactions.unshift(txn);
    this.save(STORAGE_KEYS.TRANSACTIONS, this.transactions);

    this.addNotification({
      userId: user.id,
      title: 'Bill Payment Successful',
      message: `₹${finalAmount.toLocaleString('en-IN')} paid for ${bill.operator} (${bill.accountIdentifier}). BBPS Ref: ${bbpsRef}`,
      type: 'success'
    });

    return { transaction: txn, updatedUser: user };
  }

  // --- Loan Applications ---
  submitLoanApplication(appData: Omit<LoanApplication, 'id' | 'applicationNo' | 'userId' | 'createdAt' | 'status'>): LoanApplication {
    const user = this.getCurrentUser();
    const appNo = `TF-LN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const spec = LOAN_PRODUCTS.find(p => p.type === appData.loanType);
    if (spec && appData.requestedAmount > spec.maxAmount) {
      throw new Error(`Requested amount ₹${appData.requestedAmount.toLocaleString('en-IN')} exceeds maximum limit of ₹${spec.maxAmount.toLocaleString('en-IN')} for ${spec.title}`);
    }

    const newApp: LoanApplication = {
      ...appData,
      id: `app-${Date.now()}`,
      applicationNo: appNo,
      userId: user.id,
      status: 'submitted',
      adminRemarks: 'Application received. Kadapa regional credit desk will review documents within 24 hours.',
      createdAt: new Date().toISOString()
    };

    this.applications.unshift(newApp);
    this.save(STORAGE_KEYS.APPLICATIONS, this.applications);

    this.addNotification({
      userId: user.id,
      title: 'Loan Application Submitted',
      message: `Your ${spec?.title || 'Loan'} application #${appNo} for ₹${appData.requestedAmount.toLocaleString('en-IN')} has been submitted.`,
      type: 'info'
    });

    return newApp;
  }

  updateApplicationStatus(appId: string, status: LoanApplication['status'], remarks?: string): LoanApplication {
    const app = this.applications.find(a => a.id === appId);
    if (!app) throw new Error('Application not found');

    const previousStatus = app.status;
    app.status = status;
    if (remarks) app.adminRemarks = remarks;
    app.updatedAt = new Date().toISOString();

    // If approved or disbursed, auto-create a loan account
    if ((status === 'approved' || status === 'disbursed') && previousStatus !== 'approved' && previousStatus !== 'disbursed') {
      const monthlyRate = (app.interestRate / 12) / 100;
      const emi = (app.requestedAmount * monthlyRate * Math.pow(1 + monthlyRate, app.tenureMonths)) / 
                  (Math.pow(1 + monthlyRate, app.tenureMonths) - 1);

      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 30);

      const newAccount: LoanAccount = {
        id: `acc-${Date.now()}`,
        loanAccountNo: `ACC-${app.applicationNo}`,
        userId: app.userId,
        loanType: app.loanType,
        principalAmount: app.requestedAmount,
        interestRate: app.interestRate,
        tenureMonths: app.tenureMonths,
        monthlyEmi: Math.round(emi),
        emisPaid: 0,
        totalEmis: app.tenureMonths,
        nextEmiDate: nextDate.toISOString().split('T')[0],
        outstandingBalance: app.requestedAmount,
        status: 'active',
        createdAt: new Date().toISOString()
      };

      this.loanAccounts.unshift(newAccount);
      this.save(STORAGE_KEYS.LOAN_ACCOUNTS, this.loanAccounts);
    }

    this.save(STORAGE_KEYS.APPLICATIONS, this.applications);

    this.addNotification({
      userId: app.userId,
      title: `Loan Application ${status.toUpperCase()}`,
      message: `Your ${app.loanType} loan #${app.applicationNo} status changed to ${status}. ${remarks || ''}`,
      type: status === 'approved' || status === 'disbursed' ? 'success' : 'alert'
    });

    return app;
  }

  // --- Loan EMI Repayments ---
  payLoanEmi(loanAccountNo: string, emiAmount: number, paymentMode: PaymentMode): { account: LoanAccount; transaction: Transaction } {
    const user = this.getCurrentUser();
    const loan = this.loanAccounts.find(l => l.loanAccountNo === loanAccountNo && l.userId === user.id);
    if (!loan) throw new Error('Loan account not found');

    if (loan.status === 'closed') {
      throw new Error('This loan is already fully repaid.');
    }

    if (paymentMode === 'wallet') {
      if (user.walletBalance < emiAmount) {
        throw new Error(`Insufficient wallet balance. You have ₹${user.walletBalance.toLocaleString('en-IN')}, required: ₹${emiAmount.toLocaleString('en-IN')}`);
      }
      user.walletBalance -= emiAmount;
      this.save(STORAGE_KEYS.USERS, this.users);
    }

    loan.emisPaid += 1;
    // Approximate reducing balance principal amortization
    const principalPortion = emiAmount * 0.72;
    loan.outstandingBalance = Math.max(0, Math.round(loan.outstandingBalance - principalPortion));

    if (loan.emisPaid >= loan.totalEmis || loan.outstandingBalance <= 0) {
      loan.status = 'closed';
      loan.outstandingBalance = 0;
    }

    // Advance next EMI date by 30 days
    const nextDate = new Date(loan.nextEmiDate);
    nextDate.setDate(nextDate.getDate() + 30);
    loan.nextEmiDate = nextDate.toISOString().split('T')[0];

    this.save(STORAGE_KEYS.LOAN_ACCOUNTS, this.loanAccounts);

    const refId = `TT-EMI-${Date.now().toString().slice(-8)}-${Math.floor(100 + Math.random() * 900)}`;
    const txn: Transaction = {
      id: `txn-${Date.now()}`,
      referenceId: refId,
      bbpsRefNo: `BBPS-LN-${Math.floor(1000000 + Math.random() * 9000000)}`,
      userId: user.id,
      category: 'loan_emi',
      operator: `Tatito ${loan.loanType.charAt(0).toUpperCase() + loan.loanType.slice(1)} Loan EMI`,
      accountIdentifier: loan.loanAccountNo,
      customerName: user.fullName,
      amount: emiAmount,
      paymentMode,
      status: 'SUCCESS',
      metaInfo: {
        installmentNo: `${loan.emisPaid} of ${loan.totalEmis}`,
        remainingBalance: loan.outstandingBalance,
        nextDueDate: loan.nextEmiDate
      },
      createdAt: new Date().toISOString()
    };

    this.transactions.unshift(txn);
    this.save(STORAGE_KEYS.TRANSACTIONS, this.transactions);

    this.addNotification({
      userId: user.id,
      title: 'EMI Repayment Successful',
      message: `EMI of ₹${emiAmount.toLocaleString('en-IN')} for ${loan.loanAccountNo} recorded. Remaining balance: ₹${loan.outstandingBalance.toLocaleString('en-IN')}`,
      type: 'success'
    });

    return { account: loan, transaction: txn };
  }

  // --- Getters ---
  getUserLoanAccounts(userId: number): LoanAccount[] {
    return this.loanAccounts.filter(l => l.userId === userId);
  }

  getUserApplications(userId: number): LoanApplication[] {
    return this.applications.filter(a => a.userId === userId);
  }

  getAllApplications(): LoanApplication[] {
    return this.applications;
  }

  getUserTransactions(userId: number): Transaction[] {
    return this.transactions.filter(t => t.userId === userId);
  }

  getAllTransactions(): Transaction[] {
    return this.transactions;
  }

  getUserNotifications(userId: number): NotificationItem[] {
    return this.notifications.filter(n => n.userId === userId);
  }

  markNotificationAsRead(id: string): void {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) {
      notif.isRead = true;
      this.save(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    }
  }

  markAllNotificationsAsRead(userId: number): void {
    this.notifications.forEach(n => {
      if (n.userId === userId) n.isRead = true;
    });
    this.save(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
  }

  addNotification(item: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'>): void {
    const notif: NotificationItem = {
      ...item,
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    this.notifications.unshift(notif);
    this.save(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
  }

  getBlogs(): BlogPost[] {
    return this.blogs;
  }
}

export const storageService = new StorageService();
