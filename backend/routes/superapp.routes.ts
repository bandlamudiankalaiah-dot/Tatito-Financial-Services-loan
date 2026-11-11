import { Router } from 'express';
import type { Request, Response } from 'express';
import { dbRepository, relationalDB, logAudit } from '../../database/db.ts';
import { requireAuth, requireRole, type AuthenticatedRequest } from '../middleware/auth.ts';

const router = Router();

// In-memory / fallback state for Super-App 2.0 modules (persisted across session and seeded with realistic Kadapa & AP demo records)
interface SuperAppStore {
  linkedAccounts: any[];
  upiTransactions: any[];
  paymentRequests: any[];
  qrCodes: any[];
  rewards: {
    points: number;
    lifetimeCashback: number;
    referralCode: string;
    history: any[];
    campaigns: any[];
    vouchers: any[];
    referrals: any[];
  };
  mandates: any[];
  expenses: {
    monthlyIncome: number;
    items: any[];
    budgets: any[];
    savingsGoals: any[];
    groups: any[];
  };
  insuranceProducts: any[];
  insurancePolicies: any[];
  goldVault: {
    liveRatePerGram24K: number;
    gramsHeld: number;
    monthlySipAmount: number;
    transactions: any[];
  };
  travelRoutes: any[];
  travelBookings: any[];
  merchantProfile: any;
  merchantTransactions: any[];
  supportTickets: any[];
}

const superStore: SuperAppStore = {
  linkedAccounts: [
    {
      id: 'acc-1',
      bank_name: 'State Bank of India (Kadapa Main)',
      masked_account: '•••• •••• 4821',
      ifsc: 'SBIN0000830',
      upi_vpa: 'ramesh@tatitoupi',
      account_type: 'Savings Account',
      is_primary: true,
      balance_check_mode: 'SANDBOX_SIMULATED',
      simulated_bank_balance: 68450
    },
    {
      id: 'acc-2',
      bank_name: 'Union Bank of India (Trunk Road AP)',
      masked_account: '•••• •••• 9104',
      ifsc: 'UBIN0802411',
      upi_vpa: 'ramesh.ub@tatitoupi',
      account_type: 'Savings Account',
      is_primary: false,
      balance_check_mode: 'SANDBOX_SIMULATED',
      simulated_bank_balance: 32100
    }
  ],
  upiTransactions: [
    {
      id: 'upi-101',
      transaction_ref: 'UPI-DEMO-98412041',
      direction: 'send',
      counterparty_name: 'Sri Venkateswara Provision Store',
      counterparty_vpa: 'svstore.kdp@tatitoupi',
      amount: 640,
      payment_mode: 'UPI_QR_SANDBOX',
      status: 'DEMO_SUCCESS',
      refund_status: 'NONE',
      note: 'Monthly grocery supplies',
      is_simulated: true,
      created_at: '2026-11-09T14:20:00.000Z'
    },
    {
      id: 'upi-102',
      transaction_ref: 'UPI-DEMO-98411902',
      direction: 'receive',
      counterparty_name: 'Suresh Kumar Reddy',
      counterparty_vpa: 'suresh.reddy@tatitoupi',
      amount: 2500,
      payment_mode: 'UPI_P2P_SANDBOX',
      status: 'DEMO_SUCCESS',
      refund_status: 'NONE',
      note: 'Shared dinner & fuel split settlement',
      is_simulated: true,
      created_at: '2026-11-08T09:15:00.000Z'
    },
    {
      id: 'upi-103',
      transaction_ref: 'UPI-DEMO-98411588',
      direction: 'self_transfer',
      counterparty_name: 'Self Transfer (SBI ••4821 → UBI ••9104)',
      counterparty_vpa: 'ramesh.ub@tatitoupi',
      amount: 5000,
      payment_mode: 'UPI_SELF_SANDBOX',
      status: 'DEMO_SUCCESS',
      refund_status: 'NONE',
      note: 'Savings reserve transfer',
      is_simulated: true,
      created_at: '2026-11-05T17:40:00.000Z'
    }
  ],
  paymentRequests: [
    {
      id: 'req-1',
      payer_name: 'Kiran Naidu',
      payer_vpa: 'kiran.naidu@tatitoupi',
      amount: 1200,
      note: 'Tirupati bus ticket share',
      status: 'PENDING',
      created_at: '2026-11-10T11:00:00.000Z'
    }
  ],
  qrCodes: [
    {
      id: 'qr-static-customer',
      qr_type: 'customer_static',
      vpa: 'ramesh@tatitoupi',
      payee_name: 'Ramesh Kumar',
      amount: null,
      reference_code: 'QR-CUST-KDP-89104',
      payload_uri: 'upi://pay?pa=ramesh@tatitoupi&pn=Ramesh%20Kumar&cu=INR'
    }
  ],
  rewards: {
    points: 1450,
    lifetimeCashback: 540,
    referralCode: 'TATITO-KDP-2026',
    history: [
      { id: 'rw-1', type: 'cashback', title: 'APSPDCL Electricity Bill Cashback', points: 100, cashback: 50, status: 'CREDITED_DEMO', expiry: '2026-12-31', date: '2026-11-08' },
      { id: 'rw-2', type: 'points_earned', title: 'On-Time Personal Loan EMI Bonus', points: 350, cashback: 0, status: 'CREDITED_DEMO', expiry: '2027-03-31', date: '2026-11-04' },
      { id: 'rw-3', type: 'referral', title: 'Referral Bonus — Lakshmi Narayana Joined', points: 250, cashback: 100, status: 'CREDITED_DEMO', expiry: 'No Expiry', date: '2026-10-29' }
    ],
    campaigns: [
      {
        id: 'cmp-1',
        code: 'POWER50',
        title: 'Flat ₹50 Cashback on Electricity Bills',
        category: 'Bills & Utilities',
        rule: 'Min bill ₹800 on APSPDCL/TSSPDCL via Tatito Wallet or UPI Sandbox',
        max_cashback: 50,
        min_txn: 800,
        valid_until: '2026-12-31',
        terms: 'Applicable once per calendar month in sandbox mode. Subject to partner settlement.'
      },
      {
        id: 'cmp-2',
        code: 'SIPBOOST',
        title: '500 Reward Points on First Direct Mutual Fund SIP',
        category: 'Wealth & SIP',
        rule: 'Start a monthly SIP of ₹1,000+ in any Index or Flexi-Cap fund',
        max_cashback: 100,
        min_txn: 1000,
        valid_until: '2027-01-31',
        terms: 'Points redeemable at 10 points = ₹1 sandbox wallet credit.'
      },
      {
        id: 'cmp-3',
        code: 'GOLDEXPRESS',
        title: 'Zero Processing Fee Voucher on Hallmark Gold Loan',
        category: 'Loans',
        rule: 'Redeem 500 points for 100% processing fee waiver at Kadapa Branch',
        max_cashback: 1500,
        min_txn: 50000,
        valid_until: '2026-12-15',
        terms: 'Valid on physical gold verification at Trunk Road, Kadapa branch.'
      }
    ],
    vouchers: [
      { id: 'vch-1', brand: 'APSRTC Bus Pass Voucher', value: 150, points_cost: 600, code: 'TATITO-BUS-150', expiry: '2026-12-31' },
      { id: 'vch-2', brand: 'Tatito Loan Processing Fee Waiver', value: 500, points_cost: 1000, code: 'TATITO-LOAN-500', expiry: '2027-01-31' },
      { id: 'vch-3', brand: 'Instant Wallet Cashback ₹100', value: 100, points_cost: 800, code: 'WALLET-CASH-100', expiry: 'Immediate' }
    ],
    referrals: [
      { id: 'ref-1', name: 'Lakshmi Narayana Rao', mobile: '98480•••12', status: 'KYC Completed (Demo)', reward: '250 pts + ₹100', date: '2026-10-29' },
      { id: 'ref-2', name: 'Venkata Subbaiah', mobile: '94402•••89', status: 'Registered', reward: '250 pts pending first txn', date: '2026-11-06' }
    ]
  },
  mandates: [
    {
      id: 'mnd-1',
      mandate_ref: 'UMN-TATITO-882101',
      biller_or_payee: 'Tatito Personal Loan EMI (TLN-KDP-2026-001)',
      category: 'Loan EMI',
      amount: 22100,
      frequency: 'Monthly',
      next_trigger_date: '2026-11-20',
      status: 'ACTIVE',
      consent_verified: true
    },
    {
      id: 'mnd-2',
      mandate_ref: 'UMN-TATITO-882102',
      biller_or_payee: 'Nifty 50 Index Direct Plan — SIP',
      category: 'Mutual Fund SIP',
      amount: 5000,
      frequency: 'Monthly',
      next_trigger_date: '2026-11-15',
      status: 'ACTIVE',
      consent_verified: true
    },
    {
      id: 'mnd-3',
      mandate_ref: 'UMN-TATITO-882103',
      biller_or_payee: 'APSPDCL Southern Power Electricity',
      category: 'Utility Bill',
      amount: 1450,
      frequency: 'Monthly',
      next_trigger_date: '2026-11-18',
      status: 'ACTIVE',
      consent_verified: true
    },
    {
      id: 'mnd-4',
      mandate_ref: 'UMN-TATITO-882104',
      biller_or_payee: 'ACT Fibernet Broadband 150 Mbps',
      category: 'Subscription / Broadband',
      amount: 825,
      frequency: 'Monthly',
      next_trigger_date: '2026-11-25',
      status: 'PAUSED',
      consent_verified: true
    }
  ],
  expenses: {
    monthlyIncome: 85000,
    items: [
      { id: 'exp-1', title: 'Personal Loan Monthly EMI', category: 'Loan EMIs', amount: 22100, date: '2026-11-05', mode: 'Wallet Auto-Debit' },
      { id: 'exp-2', title: 'Nifty 50 & Flexi-Cap SIPs', category: 'Investments & SIP', amount: 10000, date: '2026-11-05', mode: 'UPI AutoPay' },
      { id: 'exp-3', title: 'Groceries & Household Provision', category: 'Food & Groceries', amount: 8400, date: '2026-11-07', mode: 'UPI Scan & Pay' },
      { id: 'exp-4', title: 'APSPDCL Electricity & Indane Gas', category: 'Utilities & Bills', amount: 2390, date: '2026-11-08', mode: 'BBPS Bill Desk' },
      { id: 'exp-5', title: 'Fuel & APSRTC Highway Transit', category: 'Travel & Fuel', amount: 4200, date: '2026-11-09', mode: 'FASTag & UPI' }
    ],
    budgets: [
      { category: 'Loan EMIs', limit: 25000, spent: 22100 },
      { category: 'Investments & SIP', limit: 15000, spent: 10000 },
      { category: 'Food & Groceries', limit: 12000, spent: 8400 },
      { category: 'Utilities & Bills', limit: 4500, spent: 2390 },
      { category: 'Travel & Fuel', limit: 6000, spent: 4200 }
    ],
    savingsGoals: [
      { id: 'goal-1', name: 'Family Emergency Reserve (6 Months)', target: 300000, current: 185000, deadline: '2027-06-30' },
      { id: 'goal-2', name: '24K Digital Gold Festival Accumulation', target: 100000, current: 42500, deadline: '2027-01-15' }
    ],
    groups: [
      {
        id: 'grp-1',
        name: 'Tirupati & Horsley Hills Weekend Trip',
        members: ['Ramesh Kumar', 'Suresh Reddy', 'Kiran Naidu', 'Anil Varma'],
        expenses: [
          {
            id: 'gexp-1',
            title: 'Tempo Traveller & Toll FASTag',
            total_amount: 4800,
            paid_by: 'Ramesh Kumar',
            split_type: 'EQUAL',
            per_person: 1200,
            status: 'OPEN',
            created_at: '2026-11-09'
          },
          {
            id: 'gexp-2',
            title: 'Hill Resort Dinner & Stay',
            total_amount: 6400,
            paid_by: 'Suresh Reddy',
            split_type: 'EQUAL',
            per_person: 1600,
            status: 'SETTLED',
            created_at: '2026-11-10'
          }
        ]
      }
    ]
  },
  insuranceProducts: [
    {
      id: 'ins-1',
      product_code: 'INS-HEALTH-CARE',
      category: 'Health insurance',
      plan_name: 'Tatito Family Floater Health Shield',
      partner_insurer: 'Star Health & Allied Insurance (Partner Sandbox)',
      sum_insured: 1000000,
      annual_premium: 9450,
      coverage_highlights: 'Cashless treatment at 140+ network hospitals across AP & Telangana · Zero room rent cap · Annual health checkup'
    },
    {
      id: 'ins-2',
      product_code: 'INS-LIFE-TERM',
      category: 'Life insurance',
      plan_name: 'Pure Term Life Protection Plan',
      partner_insurer: 'HDFC Life / LIC Partner Sandbox',
      sum_insured: 10000000,
      annual_premium: 11200,
      coverage_highlights: '₹1 Crore life cover till age 65 · Critical illness rider option · Tax benefit under Sec 80C'
    },
    {
      id: 'ins-3',
      product_code: 'INS-MOTOR-COMP',
      category: 'Motor insurance',
      plan_name: 'Zero-Dep Car & Two-Wheeler Cover',
      partner_insurer: 'ICICI Lombard General Insurance Sandbox',
      sum_insured: 650000,
      annual_premium: 4850,
      coverage_highlights: 'Instant policy issuance · Roadside assistance across NH-40 · Zero depreciation bumper-to-bumper'
    },
    {
      id: 'ins-4',
      product_code: 'INS-TRAVEL-SAFE',
      category: 'Travel insurance',
      plan_name: 'Domestic & International Trip Guard',
      partner_insurer: 'Bajaj Allianz General Sandbox',
      sum_insured: 500000,
      annual_premium: 499,
      coverage_highlights: 'Flight/train delay cover · Baggage loss protection · Emergency medical evacuation'
    },
    {
      id: 'ins-5',
      product_code: 'INS-ACCIDENT-PA',
      category: 'Personal accident',
      plan_name: '24x7 Personal Accident & Disability Cover',
      partner_insurer: 'New India Assurance Sandbox',
      sum_insured: 2500000,
      annual_premium: 1250,
      coverage_highlights: 'Accidental hospitalisation · Temporary total disability weekly payout · Worldwide coverage'
    }
  ],
  insurancePolicies: [
    {
      id: 'pol-1',
      policy_ref: 'POL-DEMO-KDP-7712',
      product_code: 'INS-HEALTH-CARE',
      plan_name: 'Tatito Family Floater Health Shield',
      insured_name: 'Ramesh Kumar & Family',
      sum_insured: 1000000,
      annual_premium: 9450,
      renewal_date: '2027-08-14',
      status: 'SANDBOX_ACTIVE'
    }
  ],
  goldVault: {
    liveRatePerGram24K: 7680,
    gramsHeld: 5.5338,
    monthlySipAmount: 2000,
    transactions: [
      {
        id: 'gld-1',
        reference_no: 'GOLD-DEMO-44019',
        tx_type: 'BUY',
        grams: 3.2552,
        rate_per_gram: 7680,
        total_amount: 25000,
        is_simulated: true,
        created_at: '2026-10-15T10:30:00.000Z'
      },
      {
        id: 'gld-2',
        reference_no: 'GOLD-DEMO-44108',
        tx_type: 'SIP',
        grams: 2.2786,
        rate_per_gram: 7680,
        total_amount: 17500,
        is_simulated: true,
        created_at: '2026-11-01T09:00:00.000Z'
      }
    ]
  },
  travelRoutes: [
    { id: 'trv-1', mode: 'Bus', operator: 'APSRTC Amaravati AC Sleeper', origin: 'Kadapa', destination: 'Hyderabad', departure: '21:30', fare: 890 },
    { id: 'trv-2', mode: 'Bus', operator: 'APSRTC Indra AC', origin: 'Kadapa', destination: 'Vijayawada', departure: '22:00', fare: 760 },
    { id: 'trv-3', mode: 'Train', operator: '12797 Venkatadri Express (3A)', origin: 'Kadapa (HX)', destination: 'Kacheguda (KCG)', departure: '20:10', fare: 940 },
    { id: 'trv-4', mode: 'Flight', operator: 'IndiGo 6E-7214', origin: 'Kadapa (CDP)', destination: 'Chennai (MAA)', departure: '11:45', fare: 2850 },
    { id: 'trv-5', mode: 'Flight', operator: 'IndiGo 6E-7192', origin: 'Kadapa (CDP)', destination: 'Bengaluru (BLR)', departure: '14:20', fare: 2690 },
    { id: 'trv-6', mode: 'Hotel', operator: 'Haritha Grand Executive Stay', origin: 'Tirupati / Kadapa', destination: '2 Nights Deluxe AC', departure: 'Check-in 12:00', fare: 3400 }
  ],
  travelBookings: [
    {
      id: 'tbk-1',
      pnr_reference: 'PNR-DEMO-88412',
      mode: 'Bus',
      operator_name: 'APSRTC Amaravati AC Sleeper',
      origin: 'Kadapa',
      destination: 'Hyderabad',
      travel_date: '2026-11-22',
      passengers: 2,
      fare_amount: 1780,
      status: 'CONFIRMED_DEMO',
      created_at: '2026-11-09T18:00:00.000Z'
    }
  ],
  merchantProfile: {
    merchant_id: 'MERCH-KDP-1001',
    business_name: 'Rayalaseema Agro & Retail Mart',
    category: 'Retail & Kirana Supermarket',
    merchant_vpa: 'rayalaseemamart@tatitoupi',
    gstin: '37AABCR9102F1Z8',
    settlement_bank: 'State Bank of India •••• 4821 (T+0 Instant Sandbox)',
    kyc_status: 'SANDBOX_VERIFIED',
    today_sales: 18450,
    month_sales: 342800,
    pending_settlement: 0
  },
  merchantTransactions: [
    { id: 'mtx-1', transaction_ref: 'MQR-990124', customer_name: 'Subba Reddy', customer_vpa: 'subba@upi', amount: 1450, settlement_status: 'SETTLED_SANDBOX', refund_requested: false, created_at: '2026-11-11T09:10:00.000Z' },
    { id: 'mtx-2', transaction_ref: 'MQR-990125', customer_name: 'Padmavathi Devi', customer_vpa: 'padma@upi', amount: 890, settlement_status: 'SETTLED_SANDBOX', refund_requested: false, created_at: '2026-11-11T10:25:00.000Z' },
    { id: 'mtx-3', transaction_ref: 'MQR-990126', customer_name: 'Harish Babu', customer_vpa: 'harish@upi', amount: 3200, settlement_status: 'SETTLED_SANDBOX', refund_requested: true, created_at: '2026-11-10T19:45:00.000Z' }
  ],
  supportTickets: [
    {
      id: 'tkt-1',
      ticket_no: 'TKT-KDP-5041',
      category: 'Payment Dispute',
      subject: 'BBPS Electricity bill receipt confirmation check',
      description: 'Paid APSPDCL bill of ₹1,420 via wallet; requesting duplicate PDF voucher.',
      transaction_ref: 'DEMO-BBPS-48291041',
      status: 'RESOLVED',
      resolution_note: 'Verified in sandbox ledger. Duplicate receipt attached to your account.',
      created_at: '2026-11-07T11:30:00.000Z'
    }
  ]
};

// 1. UPI & QR PAYMENTS ENDPOINTS
router.get('/upi/overview', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const user = await dbRepository.users.findById(req.user!.userId);
  return res.json({
    is_simulated: true,
    security_notice: 'SECURITY SAFEGUARD: Tatito never collects or stores your UPI PIN, banking password, or CVV. All UPI transfers in this environment execute via an isolated sandbox simulator.',
    wallet_balance: user?.wallet_balance ?? 24850,
    primary_vpa: `${(user?.full_name || 'ramesh').toLowerCase().replace(/[^a-z0-9]/g, '')}@tatitoupi`,
    linked_accounts: superStore.linkedAccounts,
    qr_codes: superStore.qrCodes,
    payment_requests: superStore.paymentRequests,
    transactions: superStore.upiTransactions
  });
});

router.post('/upi/send', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { recipient_name, recipient_vpa, amount, note, direction, payment_source } = req.body;
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      return res.status(400).json({ error: 'Invalid amount', detail: 'Transfer amount must be greater than ₹0.' });
    }
    if (!recipient_vpa && direction !== 'self_transfer') {
      return res.status(400).json({ error: 'Missing recipient', detail: 'Please provide a recipient UPI ID, mobile number, or account.' });
    }

    // Deduct from wallet if payment_source === 'wallet', else record simulated bank UPI debit
    let updatedBalance: number | undefined;
    if (payment_source === 'wallet') {
      const result = await dbRepository.payments.executeAtomicWalletPayment({
        userId: req.user!.userId,
        amount: amt,
        category: 'upi_transfer',
        operator: recipient_name || recipient_vpa || 'UPI Recipient',
        accountIdentifier: recipient_vpa || 'SELF-TRANSFER',
        paymentMode: 'upi_wallet_sandbox',
        status: 'DEMO_SUCCESS',
        metaJson: { note, is_demo: true }
      });
      updatedBalance = result.newBalance;
    } else {
      const user = await dbRepository.users.findById(req.user!.userId);
      updatedBalance = user?.wallet_balance ?? 24850;
    }

    const txRef = `UPI-DEMO-${Date.now().toString().slice(-8)}`;
    const newTx = {
      id: `upi-${Date.now()}`,
      transaction_ref: txRef,
      direction: direction || 'send',
      counterparty_name: recipient_name || (direction === 'self_transfer' ? 'Self Transfer (SBI ••4821 → UBI ••9104)' : recipient_vpa),
      counterparty_vpa: recipient_vpa || 'ramesh.ub@tatitoupi',
      amount: amt,
      payment_mode: payment_source === 'wallet' ? 'TATITO_WALLET_UPI' : 'UPI_BANK_SANDBOX',
      status: 'DEMO_SUCCESS',
      refund_status: 'NONE',
      note: note || 'UPI Sandbox Transfer',
      is_simulated: true,
      created_at: new Date().toISOString()
    };
    superStore.upiTransactions.unshift(newTx);

    // Reward 10 points per UPI transfer
    superStore.rewards.points += 10;

    await dbRepository.notifications.create({
      user_id: req.user!.userId,
      title: 'UPI Sandbox Transfer Completed',
      message: `₹${amt.toLocaleString('en-IN')} sent to ${newTx.counterparty_name} (${newTx.transaction_ref}).`,
      category: 'general'
    });

    logAudit(req.user!.userId, 'UPI_SEND_SANDBOX', 'payment_transactions', txRef, { amount: amt, recipient_vpa, isSimulated: true });

    return res.status(201).json({
      status: 'DEMO_SUCCESS',
      is_simulated: true,
      transaction: newTx,
      wallet_balance: updatedBalance,
      reward_points_earned: 10,
      disclaimer: 'SANDBOX TRANSACTION: Simulated UPI payment. No real NPCI bank clearing occurred.'
    });
  } catch (err: any) {
    return res.status(err.statusCode || 400).json({ error: 'Transfer Failed', detail: err.message });
  }
});

router.post('/upi/request', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { payer_name, payer_vpa, amount, note } = req.body;
  const amt = parseFloat(amount);
  if (!payer_vpa || isNaN(amt) || amt <= 0) {
    return res.status(400).json({ error: 'Invalid request', detail: 'Provide valid payer UPI ID/mobile and positive amount.' });
  }
  const reqItem = {
    id: `req-${Date.now()}`,
    payer_name: payer_name || payer_vpa,
    payer_vpa,
    amount: amt,
    note: note || 'Payment request via Tatito UPI',
    status: 'PENDING',
    is_simulated: true,
    created_at: new Date().toISOString()
  };
  superStore.paymentRequests.unshift(reqItem);
  return res.status(201).json({
    status: 'REQUEST_SENT_DEMO',
    is_simulated: true,
    request: reqItem
  });
});

router.post('/upi/qr/generate', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { amount, note, qr_type } = req.body;
  const amt = amount ? parseFloat(amount) : null;
  const vpa = 'ramesh@tatitoupi';
  const ref = `QR-DYN-${Date.now().toString().slice(-6)}`;
  const uri = `upi://pay?pa=${vpa}&pn=Ramesh%20Kumar${amt ? `&am=${amt}` : ''}&tr=${ref}&tn=${encodeURIComponent(note || 'Tatito QR')}&cu=INR`;
  const qr = {
    id: `qr-${Date.now()}`,
    qr_type: qr_type || (amt ? 'dynamic' : 'customer_static'),
    vpa,
    payee_name: req.user!.fullName || 'Ramesh Kumar',
    amount: amt,
    note: note || '',
    reference_code: ref,
    payload_uri: uri,
    is_simulated: true,
    created_at: new Date().toISOString()
  };
  superStore.qrCodes.unshift(qr);
  return res.status(201).json({ status: 'QR_GENERATED_DEMO', is_simulated: true, qr });
});

router.post('/upi/refund', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { transaction_ref, reason } = req.body;
  const tx = superStore.upiTransactions.find((t) => t.transaction_ref === transaction_ref);
  if (tx) {
    tx.refund_status = 'REFUND_INITIATED_DEMO';
  }
  const ticket = {
    id: `tkt-${Date.now()}`,
    ticket_no: `RFD-KDP-${Date.now().toString().slice(-4)}`,
    category: 'Refund Request',
    subject: `Refund requested for ${transaction_ref}`,
    description: reason || 'Customer initiated sandbox refund request.',
    transaction_ref,
    status: 'IN_PROGRESS',
    resolution_note: 'Queued for sandbox settlement reversal within 24 hours.',
    created_at: new Date().toISOString()
  };
  superStore.supportTickets.unshift(ticket);
  return res.json({
    status: 'REFUND_INITIATED_DEMO',
    is_simulated: true,
    transaction_ref,
    ticket
  });
});

// 2. REWARDS, CASHBACK & REFERRALS
router.get('/rewards', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  return res.json({
    is_simulated: true,
    ...superStore.rewards
  });
});

router.post('/rewards/redeem', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { voucher_id, points_cost, value, title } = req.body;
  const cost = Number(points_cost || 500);
  if (superStore.rewards.points < cost) {
    return res.status(400).json({ error: 'Insufficient Points', detail: `You need ${cost} points to redeem this reward.` });
  }
  superStore.rewards.points -= cost;
  const cashVal = Number(value || Math.round(cost / 10));
  superStore.rewards.lifetimeCashback += cashVal;

  const entry = {
    id: `rw-${Date.now()}`,
    type: 'points_redeemed',
    title: title || `Redeemed Voucher (${voucher_id || 'Cashback'})`,
    points: -cost,
    cashback: cashVal,
    status: 'REDEEMED_DEMO',
    expiry: 'Completed',
    date: new Date().toISOString().slice(0, 10)
  };
  superStore.rewards.history.unshift(entry);

  return res.json({
    status: 'REDEEMED_DEMO',
    is_simulated: true,
    points_balance: superStore.rewards.points,
    lifetime_cashback: superStore.rewards.lifetimeCashback,
    entry
  });
});

router.post('/rewards/campaigns', requireAuth, requireRole('admin', 'super_admin'), (req: AuthenticatedRequest, res: Response) => {
  const { code, title, category, rule, max_cashback, min_txn, valid_until } = req.body;
  if (!code || !title) {
    return res.status(400).json({ error: 'Missing campaign fields' });
  }
  const cmp = {
    id: `cmp-${Date.now()}`,
    code: String(code).toUpperCase(),
    title,
    category: category || 'General',
    rule: rule || 'Sandbox promotional offer',
    max_cashback: Number(max_cashback || 100),
    min_txn: Number(min_txn || 500),
    valid_until: valid_until || '2027-03-31',
    terms: 'Managed by Branch Admin in sandbox mode.'
  };
  superStore.rewards.campaigns.unshift(cmp);
  return res.status(201).json({ status: 'CAMPAIGN_CREATED', campaign: cmp });
});

// 3. UPI AUTOPAY & RECURRING MANDATES
router.get('/autopay', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  return res.json({
    is_simulated: true,
    disclaimer: 'SANDBOX MANDATES: Automatic debits require authorized NPCI e-Mandate / UPI AutoPay partner execution with explicit customer 2FA consent.',
    mandates: superStore.mandates
  });
});

router.post('/autopay', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { biller_or_payee, category, amount, frequency, next_trigger_date } = req.body;
  const amt = parseFloat(amount);
  if (!biller_or_payee || isNaN(amt) || amt <= 0) {
    return res.status(400).json({ error: 'Invalid mandate details' });
  }
  const mnd = {
    id: `mnd-${Date.now()}`,
    mandate_ref: `UMN-TATITO-${Date.now().toString().slice(-6)}`,
    biller_or_payee,
    category: category || 'Utility Bill',
    amount: amt,
    frequency: frequency || 'Monthly',
    next_trigger_date: next_trigger_date || '2026-12-05',
    status: 'ACTIVE',
    consent_verified: true
  };
  superStore.mandates.unshift(mnd);
  return res.status(201).json({ status: 'MANDATE_REGISTERED_DEMO', is_simulated: true, mandate: mnd });
});

router.patch('/autopay/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { status } = req.body;
  const found = superStore.mandates.find((m) => m.id === req.params.id);
  if (!found) {
    return res.status(404).json({ error: 'Mandate not found' });
  }
  found.status = status || (found.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE');
  return res.json({ status: 'MANDATE_UPDATED_DEMO', is_simulated: true, mandate: found });
});

// 4. EXPENSE TRACKER & SPLIT EXPENSES
router.get('/expenses', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  const totalSpent = superStore.expenses.items.reduce((acc, i) => acc + Number(i.amount || 0), 0);
  return res.json({
    is_simulated: true,
    bank_sync_notice: 'Manual & internal sandbox ledger entries only. External bank accounts are not auto-scraped without an active Account Aggregator (AA) consent.',
    monthly_income: superStore.expenses.monthlyIncome,
    total_spent: totalSpent,
    savings_surplus: Math.max(0, superStore.expenses.monthlyIncome - totalSpent),
    items: superStore.expenses.items,
    budgets: superStore.expenses.budgets,
    savings_goals: superStore.expenses.savingsGoals,
    groups: superStore.expenses.groups
  });
});

router.post('/expenses/add', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { title, category, amount, mode } = req.body;
  const amt = parseFloat(amount);
  if (!title || isNaN(amt) || amt <= 0) {
    return res.status(400).json({ error: 'Invalid expense entry' });
  }
  const cat = category || 'Food & Groceries';
  const item = {
    id: `exp-${Date.now()}`,
    title,
    category: cat,
    amount: amt,
    date: new Date().toISOString().slice(0, 10),
    mode: mode || 'Manual Entry'
  };
  superStore.expenses.items.unshift(item);
  const b = superStore.expenses.budgets.find((x) => x.category === cat);
  if (b) {
    b.spent += amt;
  } else {
    superStore.expenses.budgets.push({ category: cat, limit: Math.max(10000, amt * 2), spent: amt });
  }
  return res.status(201).json({ status: 'EXPENSE_LOGGED', item, budgets: superStore.expenses.budgets });
});

router.post('/expenses/groups', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { group_name, members, expense_title, total_amount, paid_by, split_type } = req.body;
  const amt = parseFloat(total_amount || '0');
  const memberList = Array.isArray(members)
    ? members
    : String(members || 'Ramesh Kumar, Friend 1')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

  const grp = {
    id: `grp-${Date.now()}`,
    name: group_name || 'Shared Group Expense',
    members: memberList.length ? memberList : ['Ramesh Kumar', 'Suresh Reddy'],
    expenses: amt > 0
      ? [
          {
            id: `gexp-${Date.now()}`,
            title: expense_title || 'Shared Bill',
            total_amount: amt,
            paid_by: paid_by || 'Ramesh Kumar',
            split_type: split_type || 'EQUAL',
            per_person: Math.round(amt / Math.max(1, memberList.length)),
            status: 'OPEN',
            created_at: new Date().toISOString().slice(0, 10)
          }
        ]
      : []
  };
  superStore.expenses.groups.unshift(grp);
  return res.status(201).json({ status: 'GROUP_CREATED', group: grp });
});

router.post('/expenses/settle', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { group_id, expense_id } = req.body;
  const grp = superStore.expenses.groups.find((g) => g.id === group_id);
  const exp = grp?.expenses.find((e: any) => e.id === expense_id);
  if (exp) {
    exp.status = 'SETTLED';
  }
  return res.json({ status: 'SPLIT_SETTLED_DEMO', group: grp });
});

// 5. CREDIT & FINANCIAL PROFILE
router.get('/credit-profile', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const apps = await dbRepository.loans.getApplicationsByUser(req.user!.userId);
  const accounts = apps.filter((a: any) => a.status === 'approved' || a.status === 'sanctioned' || a.status === 'disbursed');
  return res.json({
    is_simulated: true,
    is_live_verified: false,
    bureau_status: 'SANDBOX_SIMULATED',
    disclaimer: 'CREDIT PROFILE NOTICE: Tatito does not invent statutory CIBIL/Experian scores or guarantee loan approval. Live bureau pulls require licensed NBFC/bureau credentials and customer OTP consent.',
    indicative_band: '740 - 780 (Sandbox Illustrative Band)',
    repayment_track_record: '100% On-Time in Sandbox Ledger',
    monthly_verified_income: 85000,
    existing_monthly_obligations: 22100,
    foir_percentage: 26.0,
    max_additional_emi_capacity: 20400,
    active_loan_count: accounts.length,
    applications_count: apps.length,
    accounts,
    applications: apps
  });
});

// 6. INSURANCE MARKETPLACE
router.get('/insurance', (_req: Request, res: Response) => {
  return res.json({
    is_simulated: true,
    disclaimer: 'INSURANCE DISCLOSURE: Insurance plans displayed are illustrative sandbox listings. Actual solicitation and policy issuance require an IRDAI-licensed Corporate Agent / Broker integration.',
    products: superStore.insuranceProducts,
    my_policies: superStore.insurancePolicies
  });
});

router.post('/insurance/apply', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { product_code, insured_name, nominee_name } = req.body;
  const prod = superStore.insuranceProducts.find((p) => p.product_code === product_code) || superStore.insuranceProducts[0];
  const pol = {
    id: `pol-${Date.now()}`,
    policy_ref: `POL-DEMO-KDP-${Date.now().toString().slice(-4)}`,
    product_code: prod.product_code,
    plan_name: prod.plan_name,
    insured_name: insured_name || req.user!.fullName || 'Ramesh Kumar',
    nominee_name: nominee_name || 'Spouse / Family Nominee',
    sum_insured: prod.sum_insured,
    annual_premium: prod.annual_premium,
    renewal_date: '2027-11-11',
    status: 'SANDBOX_ISSUED',
    is_simulated: true
  };
  superStore.insurancePolicies.unshift(pol);
  return res.status(201).json({
    status: 'SANDBOX_POLICY_ISSUED',
    is_simulated: true,
    policy: pol,
    disclaimer: 'Simulated insurance proposal logged in sandbox mode. Not an active IRDAI insurance contract.'
  });
});

// 7. DIGITAL GOLD & SAVINGS VAULT
router.get('/gold', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  const val = Math.round(superStore.goldVault.gramsHeld * superStore.goldVault.liveRatePerGram24K);
  return res.json({
    is_simulated: true,
    disclaimer: 'DIGITAL GOLD DISCLOSURE: Gold prices, gram balances, and vault statements in this prototype are simulated for demonstration. We do not simulate actual physical bullion ownership without an authorized MMTC-PAMP / SafeGold partner integration.',
    live_rate_24k_per_gram: superStore.goldVault.liveRatePerGram24K,
    purity: '24K (99.9% Indicative Sandbox)',
    grams_held: Number(superStore.goldVault.gramsHeld.toFixed(4)),
    current_valuation: val,
    monthly_sip_amount: superStore.goldVault.monthlySipAmount,
    transactions: superStore.goldVault.transactions
  });
});

router.post('/gold/trade', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { tx_type, amount_inr } = req.body;
  const amt = parseFloat(amount_inr);
  if (isNaN(amt) || amt < 100) {
    return res.status(400).json({ error: 'Invalid amount', detail: 'Minimum simulated gold transaction is ₹100.' });
  }
  const rate = superStore.goldVault.liveRatePerGram24K;
  const grams = Number((amt / rate).toFixed(4));
  if (tx_type === 'SELL' && grams > superStore.goldVault.gramsHeld) {
    return res.status(400).json({ error: 'Insufficient Gold Balance', detail: 'Cannot sell more grams than held in sandbox vault.' });
  }
  if (tx_type === 'SELL') {
    superStore.goldVault.gramsHeld = Number((superStore.goldVault.gramsHeld - grams).toFixed(4));
  } else {
    superStore.goldVault.gramsHeld = Number((superStore.goldVault.gramsHeld + grams).toFixed(4));
  }
  const tx = {
    id: `gld-${Date.now()}`,
    reference_no: `GOLD-DEMO-${Date.now().toString().slice(-5)}`,
    tx_type: tx_type || 'BUY',
    grams,
    rate_per_gram: rate,
    total_amount: amt,
    is_simulated: true,
    created_at: new Date().toISOString()
  };
  superStore.goldVault.transactions.unshift(tx);
  return res.status(201).json({
    status: 'DEMO_GOLD_EXECUTED',
    is_simulated: true,
    grams_held: superStore.goldVault.gramsHeld,
    transaction: tx
  });
});

// 8. TRAVEL & TRANSIT DESK
router.get('/travel', (_req: Request, res: Response) => {
  return res.json({
    is_simulated: true,
    disclaimer: 'TRAVEL SANDBOX: Flight, Bus, Train, and Hotel inventories are simulated. Live PNR ticketing requires authorized OTA / IRCTC / APSRTC partner APIs.',
    routes: superStore.travelRoutes,
    bookings: superStore.travelBookings
  });
});

router.post('/travel/book', requireAuth, (req: AuthenticatedRequest, res: Response) => {
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
    travel_date: travel_date || '2026-11-28',
    passengers: pax,
    fare_amount: route.fare * pax,
    status: 'CONFIRMED_DEMO',
    is_simulated: true,
    created_at: new Date().toISOString()
  };
  superStore.travelBookings.unshift(booking);
  return res.status(201).json({ status: 'BOOKING_CONFIRMED_DEMO', is_simulated: true, booking });
});

router.patch('/travel/bookings/:id/cancel', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const b = superStore.travelBookings.find((x) => x.id === req.params.id);
  if (!b) return res.status(404).json({ error: 'Booking not found' });
  b.status = 'CANCELLED_REFUNDED_DEMO';
  return res.json({ status: 'CANCELLED_DEMO', is_simulated: true, booking: b });
});

// 9. MERCHANT SERVICES PORTAL
router.get('/merchants', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  return res.json({
    is_simulated: true,
    profile: superStore.merchantProfile,
    transactions: superStore.merchantTransactions
  });
});

router.post('/merchants/register', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { business_name, category, gstin, settlement_bank } = req.body;
  if (!business_name) {
    return res.status(400).json({ error: 'Business name is required' });
  }
  const cleanVpa = `${business_name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 16)}@tatitoupi`;
  superStore.merchantProfile = {
    ...superStore.merchantProfile,
    business_name,
    category: category || 'Retail & Services',
    merchant_vpa: cleanVpa,
    gstin: gstin || superStore.merchantProfile.gstin,
    settlement_bank: settlement_bank || superStore.merchantProfile.settlement_bank
  };
  return res.json({ status: 'MERCHANT_UPDATED_DEMO', is_simulated: true, profile: superStore.merchantProfile });
});

// 10. CUSTOMER SUPPORT & DISPUTE CENTER
router.get('/support', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  return res.json({
    is_simulated: true,
    tickets: superStore.supportTickets
  });
});

router.post('/support/tickets', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { category, subject, description, transaction_ref } = req.body;
  if (!subject || !description) {
    return res.status(400).json({ error: 'Please provide both subject and description.' });
  }
  const tkt = {
    id: `tkt-${Date.now()}`,
    ticket_no: `TKT-KDP-${Date.now().toString().slice(-4)}`,
    category: category || 'General Support',
    subject,
    description,
    transaction_ref: transaction_ref || null,
    status: 'OPEN',
    resolution_note: 'Assigned to Kadapa Branch Grievance Officer. Expected SLA: 24 hours.',
    created_at: new Date().toISOString()
  };
  superStore.supportTickets.unshift(tkt);
  return res.status(201).json({ status: 'TICKET_CREATED', ticket: tkt });
});

router.patch('/support/tickets/:id', requireAuth, requireRole('admin', 'super_admin'), (req: AuthenticatedRequest, res: Response) => {
  const { status, resolution_note } = req.body;
  const tkt = superStore.supportTickets.find((t) => t.id === req.params.id);
  if (!tkt) return res.status(404).json({ error: 'Ticket not found' });
  tkt.status = status || 'RESOLVED';
  if (resolution_note) tkt.resolution_note = resolution_note;
  return res.json({ status: 'TICKET_UPDATED', ticket: tkt });
});

// 11. UNIVERSAL SMART SEARCH
router.get('/search', (req: Request, res: Response) => {
  const q = String(req.query.q || '').trim().toLowerCase();
  if (!q) {
    return res.json({ query: '', results: [] });
  }
  const catalog = [
    { title: 'Send Money via UPI', category: 'Payments', link: '/payments?tab=upi' },
    { title: 'Scan & Pay QR Code', category: 'Payments', link: '/payments?tab=qr' },
    { title: 'Mobile Prepaid & Postpaid Recharge', category: 'Recharges & Bills', link: '/payments?tab=bills' },
    { title: 'APSPDCL Electricity & Utility Bills', category: 'Recharges & Bills', link: '/payments?tab=bills' },
    { title: 'Credit Card, Rent & Education Fee Payment', category: 'Recharges & Bills', link: '/payments?tab=bills' },
    { title: 'UPI AutoPay & Recurring Mandates', category: 'Payments', link: '/payments?tab=autopay' },
    { title: 'Tatito Rewards, Cashback & Referrals', category: 'Rewards', link: '/services?tab=rewards' },
    { title: 'Personal Expense Tracker & Split Bills', category: 'Personal Finance', link: '/services?tab=expenses' },
    { title: 'Credit Score & Financial Profile', category: 'Credit', link: '/services?tab=credit' },
    { title: 'Health, Life, Motor & Travel Insurance', category: 'Insurance', link: '/services?tab=insurance' },
    { title: '24K Digital Gold & Monthly Gold SIP', category: 'Wealth', link: '/services?tab=gold' },
    { title: 'Flights, APSRTC Buses, Trains & Hotels', category: 'Travel', link: '/services?tab=travel' },
    { title: 'Merchant QR & Settlement Dashboard', category: 'Merchant', link: '/services?tab=merchant' },
    { title: '24x7 Customer Support & Dispute Center', category: 'Support', link: '/services?tab=support' },
    ...relationalDB.loan_products.map((p: any) => ({ title: p.product_name, category: 'Loans', link: `/loan-application?product=${p.product_code}` })),
    ...relationalDB.mutual_funds.map((f: any) => ({ title: f.scheme_name || f.fund_name, category: 'Mutual Funds', link: '/mutual-funds' }))
  ];
  const results = catalog.filter(
    (item) => item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)
  );
  return res.json({ query: q, results: results.slice(0, 15) });
});

export default router;
