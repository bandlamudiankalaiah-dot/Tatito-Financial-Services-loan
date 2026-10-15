import { User, LoanProductSpec, BillOperator, LoanAccount, LoanApplication, Transaction, BlogPost, NotificationItem } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 1,
    fullName: "Ramesh Kumar Chennur",
    email: "ramesh@tatito.in",
    phone: "9876543210",
    city: "Kadapa",
    state: "Andhra Pradesh",
    role: "user",
    walletBalance: 24850.0,
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    createdAt: "2025-04-12T10:00:00Z"
  },
  {
    id: 2,
    fullName: "Ankalaiah Bandlamudi (Admin)",
    email: "admin@tatitofinance.com",
    phone: "9440123456",
    city: "Kadapa",
    state: "Andhra Pradesh",
    role: "admin",
    walletBalance: 150000.0,
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
    createdAt: "2024-01-01T09:00:00Z"
  }
];

export const LOAN_PRODUCTS: LoanProductSpec[] = [
  {
    type: 'personal',
    title: 'Personal Loan',
    minRate: 14.0,
    maxAmount: 1000000, // ₹10,00,000
    maxTenureMonths: 60,
    description: 'Instant unsecured funds for medical emergencies, home renovation, or weddings with minimal KYC.',
    processingFee: '1.5% + GST',
    features: [
      'From 14% p.a. reducing rate',
      'Up to ₹10,00,000 credit limit',
      'Zero collateral or guarantor required',
      'Disbursal within 24 hours of approval'
    ]
  },
  {
    type: 'business',
    title: 'Business Loan',
    minRate: 16.0,
    maxAmount: 5000000, // ₹50,00,000
    maxTenureMonths: 84,
    description: 'Working capital and term loans tailored for MSMEs, merchants, and retail traders across Kadapa & Rayalaseema.',
    processingFee: '1.25% + GST',
    features: [
      'From 16% p.a. reducing rate',
      'Borrow up to ₹50,00,000',
      'Flexible tenure from 12 to 84 months',
      'Collateral-free options up to ₹20 Lakhs'
    ]
  },
  {
    type: 'gold',
    title: 'Gold Loan',
    minRate: 11.0,
    maxAmount: 2000000, // ₹20,00,000
    maxTenureMonths: 36,
    description: 'Unlock highest per-gram value against household gold ornaments. Stored in bank-grade high-security branch vaults.',
    processingFee: '0.50% (Max ₹1,000)',
    features: [
      'From 11% p.a. lowest interest',
      'Up to ₹20,00,000 immediate liquidity',
      'Instant appraisal & cash in 30 minutes',
      '100% insured secure branch lockers'
    ]
  },
  {
    type: 'home',
    title: 'Home Loan',
    minRate: 9.0,
    maxAmount: 10000000, // ₹1,00,00,000
    maxTenureMonths: 240, // 20 years
    description: 'Competitive interest rates for buying apartments, constructing houses, or purchasing residential plots in AP.',
    processingFee: '0.25% (Concessional for Women)',
    features: [
      'From 9% p.a. lowest benchmark rate',
      'Up to ₹1,00,00,000 loan amount',
      'Long tenure up to 20 years for easy EMIs',
      'Tax deduction benefits under 80C & 24(b)'
    ]
  },
  {
    type: 'vehicle',
    title: 'Vehicle Loan',
    minRate: 10.0,
    maxAmount: 2000000, // ₹20,00,000
    maxTenureMonths: 84,
    description: 'Finance new or pre-owned two-wheelers, passenger cars, or commercial autos with up to 90% on-road funding.',
    processingFee: '1.0% + GST',
    features: [
      'From 10% p.a. attractive rates',
      'Up to ₹20,00,000 financing',
      'Up to 90% on-road price covered',
      'Quick dealership delivery clearances'
    ]
  }
];

export const BILL_OPERATORS: BillOperator[] = [
  // Mobile
  {
    id: 'jio-prepaid',
    name: 'Jio Prepaid',
    category: 'mobile',
    iconName: 'Smartphone',
    identifierLabel: 'Mobile Number',
    placeholder: 'Enter 10-digit mobile number',
    circles: ['Andhra Pradesh & Telangana', 'Karnataka', 'Tamil Nadu', 'Delhi NCR', 'Maharashtra'],
    popularPlans: [
      { name: 'Truly Unlimited 1.5GB/Day', price: 299, validity: '28 Days', details: '1.5GB/day + 100 SMS/day + Unlimited Calls + JioCinema' },
      { name: 'Super Hero 2GB/Day', price: 349, validity: '28 Days', details: '2GB/day high-speed data + Unlimited 5G' },
      { name: 'Quarterly Value', price: 666, validity: '70 Days', details: '1.5GB/day + 100 SMS/day + Unlimited Calls' },
      { name: 'Annual Freedom', price: 2999, validity: '365 Days', details: '2.5GB/day + Unlimited Calls + 1 Year Hotstar Mobile' }
    ]
  },
  {
    id: 'airtel-prepaid',
    name: 'Airtel Prepaid',
    category: 'mobile',
    iconName: 'Smartphone',
    identifierLabel: 'Mobile Number',
    placeholder: 'Enter 10-digit Airtel number',
    circles: ['Andhra Pradesh & Telangana', 'Karnataka', 'Tamil Nadu', 'Mumbai'],
    popularPlans: [
      { name: 'Smart Recharge', price: 199, validity: '28 Days', details: '2GB Total + Unlimited Local & STD Calls' },
      { name: 'Daily 1.5GB Pack', price: 319, validity: '1 Month', details: '1.5GB/day + Apollo 24/7 + Free Wynk' },
      { name: 'Cricket Special 3GB/Day', price: 499, validity: '28 Days', details: '3GB/day + Unlimited 5G + Disney+ Hotstar' }
    ]
  },
  {
    id: 'vi-prepaid',
    name: 'Vodafone Idea (Vi)',
    category: 'mobile',
    iconName: 'Smartphone',
    identifierLabel: 'Mobile Number',
    placeholder: 'Enter 10-digit Vi number',
    circles: ['Andhra Pradesh & Telangana', 'Karnataka', 'Rest of India'],
    popularPlans: [
      { name: 'Hero Unlimited', price: 349, validity: '28 Days', details: '1.5GB/day + Binge All Night (12AM to 6AM free data)' },
      { name: 'Weekend Data Rollover', price: 479, validity: '56 Days', details: '1.5GB/day + Rollover of unused weekday data' }
    ]
  },
  {
    id: 'bsnl-prepaid',
    name: 'BSNL Prepaid',
    category: 'mobile',
    iconName: 'Smartphone',
    identifierLabel: 'Mobile Number',
    placeholder: 'Enter 10-digit BSNL number',
    circles: ['Andhra Pradesh', 'Telangana', 'Pan-India'],
    popularPlans: [
      { name: 'Voice Special', price: 107, validity: '35 Days', details: '200 Mins Voice + 3GB Data' },
      { name: 'Super Value 2GB/Day', price: 298, validity: '52 Days', details: '2GB/day + Unlimited Calls + EROS Now' }
    ]
  },
  // DTH
  {
    id: 'tata-play',
    name: 'Tata Play (Tata Sky)',
    category: 'dth',
    iconName: 'Tv',
    identifierLabel: 'Subscriber ID / Registered Mobile',
    placeholder: 'Enter 10-digit Subscriber ID (e.g. 1029384756)'
  },
  {
    id: 'airtel-digital-tv',
    name: 'Airtel Digital TV',
    category: 'dth',
    iconName: 'Tv',
    identifierLabel: 'Customer ID',
    placeholder: 'Enter 10-digit Customer ID (e.g. 3001234567)'
  },
  {
    id: 'sun-direct',
    name: 'Sun Direct',
    category: 'dth',
    iconName: 'Tv',
    identifierLabel: 'Smart Card Number',
    placeholder: 'Enter 11-digit Smart Card Number'
  },
  {
    id: 'dish-tv',
    name: 'Dish TV',
    category: 'dth',
    iconName: 'Tv',
    identifierLabel: 'Viewing Card (VC) Number',
    placeholder: 'Enter 11-digit VC number'
  },
  // FASTag
  {
    id: 'icici-fastag',
    name: 'ICICI Bank FASTag',
    category: 'fastag',
    iconName: 'Car',
    identifierLabel: 'Vehicle Registration Number',
    placeholder: 'e.g. AP04BQ1234'
  },
  {
    id: 'sbi-fastag',
    name: 'State Bank of India (SBI) FASTag',
    category: 'fastag',
    iconName: 'Car',
    identifierLabel: 'Vehicle Registration Number',
    placeholder: 'e.g. AP04CK5678'
  },
  {
    id: 'hdfc-fastag',
    name: 'HDFC Bank FASTag',
    category: 'fastag',
    iconName: 'Car',
    identifierLabel: 'Vehicle Registration Number',
    placeholder: 'e.g. TS09FA9999'
  },
  // Electricity
  {
    id: 'apspdcl',
    name: 'APSPDCL (Southern Power AP - Kadapa, Tirupati, Nellore)',
    category: 'electricity',
    iconName: 'Zap',
    identifierLabel: '13-digit Consumer Number (SC No.)',
    placeholder: 'e.g. 1009823412034'
  },
  {
    id: 'apepdcl',
    name: 'APEPDCL (Eastern Power AP - Visakhapatnam, Rajahmundry)',
    category: 'electricity',
    iconName: 'Zap',
    identifierLabel: 'Consumer Service Number',
    placeholder: 'e.g. 21008765432'
  },
  {
    id: 'tsspdcl',
    name: 'TSSPDCL (Southern Power Telangana)',
    category: 'electricity',
    iconName: 'Zap',
    identifierLabel: 'Unique Service Number (USC)',
    placeholder: 'e.g. 101234567'
  },
  {
    id: 'bescom',
    name: 'BESCOM (Bangalore Electricity)',
    category: 'electricity',
    iconName: 'Zap',
    identifierLabel: '10-digit Account ID',
    placeholder: 'e.g. 5432109876'
  },
  // Water
  {
    id: 'kmc-water',
    name: 'Kadapa Municipal Corporation (KMC) Water Board',
    category: 'water',
    iconName: 'Droplets',
    identifierLabel: 'Assessment / Tap Connection No.',
    placeholder: 'e.g. KDP-WTR-4491'
  },
  {
    id: 'hmwssb-water',
    name: 'HMWSSB (Hyderabad Water Supply & Sewerage)',
    category: 'water',
    iconName: 'Droplets',
    identifierLabel: 'CAN Number (9-digits)',
    placeholder: 'e.g. 612345678'
  },
  // Gas
  {
    id: 'indane-gas',
    name: 'Indane Gas (LPG Cylinder Booking)',
    category: 'gas',
    iconName: 'Flame',
    identifierLabel: 'Registered Contact / Consumer ID (16 Digits)',
    placeholder: 'Enter registered mobile or 16-digit LPG ID'
  },
  {
    id: 'bharat-gas',
    name: 'Bharat Gas (BPCL)',
    category: 'gas',
    iconName: 'Flame',
    identifierLabel: 'LPG ID or Phone Number',
    placeholder: 'Enter 17-digit LPG ID or mobile number'
  },
  {
    id: 'hp-gas',
    name: 'HP Gas (HPCL)',
    category: 'gas',
    iconName: 'Flame',
    identifierLabel: 'Consumer Number & Distributor Code',
    placeholder: 'e.g. 849204'
  },
  {
    id: 'bhagyanagar-gas',
    name: 'Bhagyanagar Gas Limited (Piped Natural Gas)',
    category: 'gas',
    iconName: 'Flame',
    identifierLabel: 'Business Partner / BP Number',
    placeholder: 'e.g. 200084921'
  },
  // Broadband
  {
    id: 'airtel-broadband',
    name: 'Airtel Xstream Fiber',
    category: 'broadband',
    iconName: 'Wifi',
    identifierLabel: 'Fixedline Number / DSL ID',
    placeholder: 'e.g. 08562245678 (with STD code)'
  },
  {
    id: 'jio-fiber',
    name: 'JioFiber Broadband',
    category: 'broadband',
    iconName: 'Wifi',
    identifierLabel: 'JioFiber Fixed Voice / Service ID',
    placeholder: 'e.g. 08562301020'
  },
  {
    id: 'act-fibernet',
    name: 'ACT Fibernet (Atria Convergence)',
    category: 'broadband',
    iconName: 'Wifi',
    identifierLabel: 'Account Number or User ID',
    placeholder: 'e.g. 102948203'
  },
  // Credit Card
  {
    id: 'hdfc-cc',
    name: 'HDFC Bank Credit Card',
    category: 'credit_card',
    iconName: 'CreditCard',
    identifierLabel: 'Card Number (Last 4 Digits or Full 16)',
    placeholder: 'Enter 16-digit card number'
  },
  {
    id: 'sbi-card',
    name: 'SBI Credit Card',
    category: 'credit_card',
    iconName: 'CreditCard',
    identifierLabel: 'Card Number',
    placeholder: 'Enter 16-digit card number'
  },
  {
    id: 'icici-cc',
    name: 'ICICI Bank Credit Card',
    category: 'credit_card',
    iconName: 'CreditCard',
    identifierLabel: 'Card Number',
    placeholder: 'Enter 16-digit card number'
  }
];

export const INITIAL_LOAN_ACCOUNTS: LoanAccount[] = [
  {
    id: 'acc-1',
    loanAccountNo: 'TF-GL-2025-0814',
    userId: 1,
    loanType: 'gold',
    principalAmount: 250000,
    interestRate: 11.0,
    tenureMonths: 12,
    monthlyEmi: 22100,
    emisPaid: 4,
    totalEmis: 12,
    nextEmiDate: '2026-10-20',
    outstandingBalance: 168000,
    status: 'active',
    createdAt: '2025-06-15T10:00:00Z'
  },
  {
    id: 'acc-2',
    loanAccountNo: 'TF-PL-2025-1102',
    userId: 1,
    loanType: 'personal',
    principalAmount: 400000,
    interestRate: 14.0,
    tenureMonths: 24,
    monthlyEmi: 19205,
    emisPaid: 8,
    totalEmis: 24,
    nextEmiDate: '2026-10-28',
    outstandingBalance: 274000,
    status: 'active',
    createdAt: '2025-02-10T11:00:00Z'
  }
];

export const INITIAL_APPLICATIONS: LoanApplication[] = [
  {
    id: 'app-1',
    applicationNo: 'TF-LN-2026-9481',
    userId: 1,
    loanType: 'business',
    applicantName: 'Ramesh Kumar Chennur',
    phone: '9876543210',
    email: 'ramesh@tatito.in',
    panCard: 'ABCDE1234F',
    aadhaarLast4: '8821',
    monthlyIncome: 85000,
    requestedAmount: 1500000,
    interestRate: 16.0,
    tenureMonths: 36,
    purpose: 'Expanding inventory and modern display counters at Trunk Road, Kadapa textile store.',
    status: 'under_review',
    adminRemarks: 'Field verification initiated with Kadapa branch officer.',
    createdAt: '2026-10-12T14:30:00Z'
  },
  {
    id: 'app-2',
    applicationNo: 'TF-LN-2026-8910',
    userId: 1,
    loanType: 'home',
    applicantName: 'Srinivasa Rao Giddalur',
    phone: '9440811223',
    email: 'srinivas.g@gmail.com',
    panCard: 'BGHYK9821L',
    aadhaarLast4: '4190',
    monthlyIncome: 120000,
    requestedAmount: 4500000,
    interestRate: 9.0,
    tenureMonths: 180,
    purpose: 'Construction of duplex house in Nagarajupalle, Kadapa.',
    status: 'submitted',
    adminRemarks: 'Awaiting property deed and structural plan verification.',
    createdAt: '2026-10-14T09:15:00Z'
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'txn-1',
    referenceId: 'TT-TXN-20261010-4102',
    bbpsRefNo: 'BBPS9081245102',
    userId: 1,
    category: 'electricity',
    operator: 'APSPDCL (Southern Power AP)',
    accountIdentifier: '1009823412034',
    customerName: 'Ramesh Kumar Chennur',
    amount: 1420.0,
    paymentMode: 'wallet',
    status: 'SUCCESS',
    metaInfo: { circle: 'Kadapa Rural', billPeriod: 'September 2026', unitsConsumed: 184 },
    createdAt: '2026-10-10T16:20:00Z'
  },
  {
    id: 'txn-2',
    referenceId: 'TT-TXN-20261005-7821',
    bbpsRefNo: 'BBPS8192731045',
    userId: 1,
    category: 'mobile',
    operator: 'Jio Prepaid',
    accountIdentifier: '9876543210',
    customerName: 'Ramesh Kumar',
    amount: 349.0,
    paymentMode: 'upi',
    status: 'SUCCESS',
    metaInfo: { plan: '2GB/Day + Unlimited Calls (28 Days)', utr: '628819201948' },
    createdAt: '2026-10-05T11:45:00Z'
  },
  {
    id: 'txn-3',
    referenceId: 'TT-TXN-20260920-1194',
    bbpsRefNo: 'BBPS7492019482',
    userId: 1,
    category: 'loan_emi',
    operator: 'Tatito Gold Loan EMI',
    accountIdentifier: 'TF-GL-2025-0814',
    customerName: 'Ramesh Kumar Chennur',
    amount: 22100.0,
    paymentMode: 'wallet',
    status: 'SUCCESS',
    metaInfo: { installmentNo: '4 of 12', nextDueDate: '2026-10-20' },
    createdAt: '2026-09-20T10:15:00Z'
  }
];

export const INITIAL_BLOGS: BlogPost[] = [
  {
    id: 1,
    title: "How Loan EMIs Work: Reducing Balance vs Flat Interest Rate",
    slug: "how-loan-emis-work-reducing-balance-vs-flat-rate",
    category: "Loans & EMI",
    summary: "Before applying for any loan in India, understand why a 14% reducing balance rate is drastically cheaper than a 10% flat interest loan.",
    content: `When you borrow money from any bank or financial institution in India, interest can be calculated in two fundamentally different ways:

### 1. Flat Interest Rate (The Expensive Illusion)
In a flat interest system, the interest is calculated on the entire original principal amount for the full tenure, regardless of how much principal you have already paid off through previous EMIs.
For example, on a ₹5,00,000 loan for 3 years at 10% flat, you pay interest on ₹5,00,000 every single year, resulting in total interest of ₹1,50,000. The effective interest rate actually exceeds 18%!

### 2. Reducing Balance Rate (The Transparent Standard at Tatito)
In a reducing balance method, interest is calculated solely on the outstanding principal balance each month. As each EMI reduces your loan balance, the interest component decreases and the principal repayment component accelerates.
At Tatito Financial Services, all personal loans (from 14% p.a.), gold loans (from 11% p.a.), and home loans (from 9% p.a.) use the standard RBI-approved reducing balance formula.

### Summary Checklist Before Signing
- Always ask for the 'Annualized Percentage Rate' (APR).
- Check foreclosure and part-prepayment charges (Tatito offers zero foreclosure penalty on select gold loans).
- Use our interactive EMI calculator on this portal to inspect your month-by-month amortisation schedule.`,
    author: "Naveen Reddy, Chief Credit Officer",
    readTime: "5 min read",
    coverImage: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80",
    publishedAt: "2026-10-02T10:00:00Z"
  },
  {
    id: 2,
    title: "5 Smart Ways to Start a Systematic Investment Plan (SIP) with Just ₹500",
    slug: "5-ways-to-start-a-sip-with-500",
    category: "Wealth & Savings",
    summary: "You don't need lakhs of rupees to invest in Indian capital markets. Here is how compounding ₹500 monthly builds substantial wealth over 15 years.",
    content: `Many people in Kadapa and Rayalaseema believe investing is reserved only for high net-worth individuals. In reality, modern mutual fund SIPs allow disciplined wealth accumulation starting at just ₹500 a month.

### 1. The Power of Rupee Cost Averaging
When markets dip, your ₹500 buys more mutual fund units. When markets surge, your accumulated units grow in value. You never have to time the stock market or worry about daily volatility.

### 2. The Eighth Wonder: Compounding
Investing ₹500 per month at an expected return of 12% p.a.:
- In 5 Years: Invested ₹30,000 → Value ≈ ₹41,200
- In 10 Years: Invested ₹60,000 → Value ≈ ₹1,16,000
- In 15 Years: Invested ₹90,000 → Value ≈ ₹2,52,000

### 3. Step-Up SIP (10% Annual Increase)
Increase your SIP amount by ₹100 or 10% whenever you receive an annual bonus or salary hike to supercharge your final corpus by almost 80%.

### 4. Direct Plans over Regular Plans
Direct mutual fund schemes save 0.5% to 1.5% in distributor commissions each year, compounding into substantial savings over decades.

### 5. Automate on Salary Day
Set your SIP auto-debit on the 5th of each month, right after salary or agricultural sale proceeds hit your bank account.`,
    author: "Priyanka S., Senior Wealth Advisor",
    readTime: "4 min read",
    coverImage: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=800&q=80",
    publishedAt: "2026-09-28T14:00:00Z"
  },
  {
    id: 3,
    title: "Why Gold Loans in Andhra Pradesh Offer the Lowest Interest & Fastest Liquidity",
    slug: "gold-loans-in-andhra-pradesh-liquidity-guide",
    category: "Gold Loan",
    summary: "How Kadapa businesses and agricultural households leverage household gold ornaments for low 11% p.a. capital with same-day cash disbursal.",
    content: `Gold jewellery has historically been one of India's most cherished assets. In Andhra Pradesh, gold loans serve as the backbone of emergency and seasonal working capital.

### Why Choose a Gold Loan over an Unsecured Personal Loan?
1. **Lower Interest Rates**: Unsecured loans start at 14%–20%, while secured gold loans at Tatito Financial Services start from just 11% p.a.
2. **High Loan-To-Value (LTV)**: Up to 75% of current market gold value based on certified 22K/24K purity appraisal.
3. **No Heavy Income Verification**: Since physical gold is deposited in bank-grade high-security vaults, CIBIL score requirements are more flexible.
4. **Flexible Repayments**: Choose between regular monthly EMIs or bullet repayment (interest monthly, principal at end of tenure).
5. **Full Insurance & Safe Vaulting**: Your ornaments are 100% insured against fire, theft, and damage in Kadapa branch vaults.`,
    author: "S. Ramanjaneyulu, Branch Head Kadapa",
    readTime: "6 min read",
    coverImage: "https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=800&q=80",
    publishedAt: "2026-09-18T09:30:00Z"
  },
  {
    id: 4,
    title: "CIBIL Score Decoded: How Utility Bill Payments Help Build a 750+ Credit Score",
    slug: "cibil-score-utility-bill-payments-credit-guide",
    category: "Credit & CIBIL",
    summary: "Timely electricity, broadband, and credit card payments via BBPS create a transparent digital repayment record that unlocks top-tier loan rates.",
    content: `A credit score ranging between 300 and 900 acts as your financial passport in India. A score above 750 qualifies you for instant pre-approved loans with the lowest interest margins.

### How Utility Payments Impact Credit
With modern account aggregators and Bharat BillPay (BBPS) integration, regular and timely payments for APSPDCL power, Airtel broadband, and post-paid connections demonstrate fiscal discipline.

### Golden Rules to Maintain 750+ CIBIL
- Pay 100% of Credit Card Total Due, not just the minimum amount.
- Maintain credit utilisation below 30% of your sanctioned limit.
- Never delay your monthly loan EMIs even by a single day; set auto-debit reminders on Tatito Pay.`,
    author: "K. Sumalatha, Credit Underwriter",
    readTime: "4 min read",
    coverImage: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80",
    publishedAt: "2026-09-10T11:00:00Z"
  },
  {
    id: 5,
    title: "Home Loan Tax Benefits: Maximizing Deductions under Section 80C & Section 24(b)",
    slug: "home-loan-tax-benefits-80c-24b",
    category: "Home Loan",
    summary: "Learn how buying a residential property in Andhra Pradesh allows up to ₹3.5 Lakhs in annual income tax deductions for salaried and self-employed borrowers.",
    content: `Home loans from Tatito Financial Services (from 9% p.a. up to ₹1,00,00,000) not only help you build your dream home in Kadapa or Tirupati, but also offer tax relief under the Income Tax Act.

### 1. Section 24(b) - Interest Deduction
You can claim a deduction of up to ₹2,00,000 per financial year against the interest paid on a loan for a self-occupied property.

### 2. Section 80C - Principal Repayment
The principal component of your home loan EMI is eligible for deduction up to ₹1,50,000 within the overall 80C ceiling, along with stamp duty and registration fees.

### Joint Home Loan Advantage
If you take a home loan jointly with your spouse, both co-borrowers can claim separate deductions, doubling total household tax exemptions to up to ₹7,00,000 per annum!`,
    author: "V. Rajesh, Chartered Accountant & Tax Consultant",
    readTime: "7 min read",
    coverImage: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80",
    publishedAt: "2026-08-25T16:00:00Z"
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    userId: 1,
    title: 'Gold Loan EMI Due in 6 Days',
    message: 'Your monthly EMI of ₹22,100 for Gold Loan #TF-GL-2025-0814 is due on 20th Oct. Keep sufficient balance in Tatito Wallet.',
    type: 'reminder',
    isRead: false,
    createdAt: '2026-10-14T08:00:00Z'
  },
  {
    id: 'notif-2',
    userId: 1,
    title: 'APSPDCL Bill Payment Confirmed',
    message: 'Electricity bill payment of ₹1,420 was settled via BBPS. Ref: BBPS9081245102',
    type: 'success',
    isRead: false,
    createdAt: '2026-10-10T16:20:00Z'
  },
  {
    id: 'notif-3',
    userId: 1,
    title: 'Business Loan Under Review',
    message: 'Application #TF-LN-2026-9481 for ₹15,00,000 is under review at Kadapa Branch Credit Desk.',
    type: 'info',
    isRead: true,
    createdAt: '2026-10-12T14:35:00Z'
  }
];
