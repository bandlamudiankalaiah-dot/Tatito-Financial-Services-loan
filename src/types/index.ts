export type UserRole = 'user' | 'admin';

export interface User {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  role: UserRole;
  walletBalance: number;
  avatarUrl?: string;
  createdAt: string;
}

export type BillCategory = 
  | 'mobile'
  | 'dth'
  | 'fastag'
  | 'electricity'
  | 'water'
  | 'gas'
  | 'broadband'
  | 'credit_card'
  | 'loan_emi';

export interface BillOperator {
  id: string;
  name: string;
  category: BillCategory;
  iconName: string;
  identifierLabel: string;
  placeholder: string;
  popularPlans?: {
    name: string;
    price: number;
    validity: string;
    details: string;
  }[];
  circles?: string[];
}

export interface FetchedBill {
  customerName: string;
  accountIdentifier: string;
  operator: string;
  category: BillCategory;
  billNumber: string;
  billDate: string;
  dueDate: string;
  amountDue: number;
  convenienceFee: number;
  operatorReference: string;
  status: 'PENDING' | 'PAID';
  circle?: string;
  billPeriod?: string;
  meterNumber?: string;
}

export type PaymentMode = 'wallet' | 'upi' | 'netbanking' | 'card';

export interface Transaction {
  id: string;
  referenceId: string;
  bbpsRefNo: string;
  userId: number;
  category: BillCategory;
  operator: string;
  accountIdentifier: string;
  customerName: string;
  amount: number;
  paymentMode: PaymentMode;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  metaInfo?: Record<string, any>;
  createdAt: string;
}

export type LoanType = 'personal' | 'business' | 'gold' | 'home' | 'vehicle';

export interface LoanProductSpec {
  type: LoanType;
  title: string;
  minRate: number; // e.g. 14 for 14% p.a.
  maxAmount: number; // e.g. 1000000
  maxTenureMonths: number;
  description: string;
  processingFee: string;
  features: string[];
}

export type LoanApplicationStatus = 'submitted' | 'under_review' | 'approved' | 'rejected' | 'disbursed';

export interface LoanApplication {
  id: string;
  applicationNo: string;
  userId: number;
  loanType: LoanType;
  applicantName: string;
  phone: string;
  email: string;
  panCard: string;
  aadhaarLast4: string;
  monthlyIncome: number;
  requestedAmount: number;
  interestRate: number;
  tenureMonths: number;
  purpose: string;
  status: LoanApplicationStatus;
  adminRemarks?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface LoanAccount {
  id: string;
  loanAccountNo: string;
  userId: number;
  loanType: LoanType;
  principalAmount: number;
  interestRate: number;
  tenureMonths: number;
  monthlyEmi: number;
  emisPaid: number;
  totalEmis: number;
  nextEmiDate: string;
  outstandingBalance: number;
  status: 'active' | 'closed';
  createdAt: string;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  category: string;
  summary: string;
  content: string;
  author: string;
  readTime: string;
  coverImage: string;
  publishedAt: string;
}

export interface NotificationItem {
  id: string;
  userId: number;
  title: string;
  message: string;
  type: 'info' | 'alert' | 'success' | 'reminder';
  isRead: boolean;
  createdAt: string;
}
