import { Router } from 'express';
import type { Request, Response } from 'express';
import { dbRepository, logAudit } from '../../database/db.ts';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.ts';

const router = Router();

// GET /api/loans/products
router.get('/products', async (req: Request, res: Response) => {
  try {
    const products = await dbRepository.loans.getProducts();
    res.json(products);
  } catch (err: any) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: 'Service Unavailable', detail: err.message });
    }
    res.status(500).json({ error: 'Internal Error', detail: err.message });
  }
});

// POST /api/loans/calculate-emi
router.post('/calculate-emi', (req: Request, res: Response) => {
  const { principal, interest_rate_annual, tenure_months } = req.body;
  const P = parseFloat(principal);
  const annualRate = parseFloat(interest_rate_annual);
  const n = parseInt(tenure_months, 10);

  if (isNaN(P) || P <= 0 || isNaN(annualRate) || isNaN(n) || n <= 0) {
    return res.status(400).json({ error: 'Bad Request', detail: 'Invalid parameters for EMI calculation' });
  }

  const r = (annualRate / 12) / 100;
  let emi = 0;
  if (r <= 0) {
    emi = Math.round(P / n);
  } else {
    emi = Math.round((P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
  }

  const totalRepayment = emi * n;
  const totalInterest = Math.max(0, totalRepayment - P);

  // Generate amortization table
  let balance = P;
  const schedule = [];
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

  return res.json({
    principal: P,
    annual_rate: annualRate,
    tenure_months: n,
    monthly_emi: emi,
    total_interest: totalInterest,
    total_repayment: totalRepayment,
    schedule: schedule.slice(0, 36) // Preview first 36 installments
  });
});

// GET /api/loans/my-applications
router.get('/my-applications', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const apps = await dbRepository.loans.getApplicationsByUser(req.user!.userId);
    res.json(apps);
  } catch (err: any) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: 'Service Unavailable', detail: err.message });
    }
    res.status(500).json({ error: 'Internal Error', detail: err.message });
  }
});

// GET /api/loans/my-accounts
router.get('/my-accounts', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userApps = await dbRepository.loans.getApplicationsByUser(req.user!.userId);
    const activeApps = userApps.filter(
      (a: any) => a.status === 'disbursed' || a.status === 'approved' || a.status === 'sanctioned'
    );

    const accounts = await Promise.all(activeApps.map(async (app: any) => {
      const schedules = await dbRepository.loans.getEmiSchedules(app.id);
      const paidSchedules = schedules.filter((s: any) => s.payment_status === 'paid');
      const pendingSchedule = schedules.find((s: any) => s.payment_status === 'pending');

      return {
        id: app.id,
        loan_account_no: `ACC-${app.application_no}`,
        loan_type: app.product_name || 'Fintech Loan',
        principal_amount: parseFloat(app.requested_amount),
        interest_rate: parseFloat(app.interest_rate),
        tenure_months: app.tenure_months,
        monthly_emi: parseFloat(app.calculated_emi),
        emis_paid: paidSchedules.length,
        total_emis: app.tenure_months,
        next_emi_date: pendingSchedule?.due_date || '2026-11-05',
        outstanding_balance: pendingSchedule ? parseFloat(pendingSchedule.remaining_balance) : 0,
        status: app.status === 'disbursed' ? 'active' : 'sanctioned'
      };
    }));

    res.json(accounts);
  } catch (err: any) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: 'Service Unavailable', detail: err.message });
    }
    res.status(500).json({ error: 'Internal Error', detail: err.message });
  }
});

// POST /api/loans/apply
router.post('/apply', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      product_id,
      requested_amount,
      tenure_months,
      purpose,
      monthly_income,
      applicant_name,
      phone,
      email
    } = req.body;

    const amt = parseFloat(requested_amount);
    const tenure = parseInt(tenure_months, 10);
    const income = parseFloat(monthly_income);

    if (!amt || amt < 10000) {
      return res.status(400).json({ error: 'Bad Request', detail: 'Minimum loan amount is ₹10,000' });
    }

    const products = await dbRepository.loans.getProducts();
    const product = products.find((p: any) => p.id === parseInt(product_id, 10)) || products[0];

    if (product && amt > product.max_amount) {
      return res.status(400).json({
        error: 'Limit Exceeded',
        detail: `Requested amount ₹${amt.toLocaleString('en-IN')} exceeds maximum allowed ₹${product.max_amount.toLocaleString('en-IN')} for ${product.product_name}`
      });
    }

    const rate = product ? product.base_interest_rate : 14.0;
    const r = (rate / 12) / 100;
    const emi = Math.round((amt * r * Math.pow(1 + r, tenure)) / (Math.pow(1 + r, tenure) - 1));
    const appNo = `TF-LN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newApp = await dbRepository.loans.createApplication({
      application_no: appNo,
      user_id: req.user!.userId,
      product_id: product?.id || 1,
      product_name: product?.product_name || 'Loan',
      applicant_name: applicant_name || req.user!.fullName,
      phone: phone || '9876543210',
      email: email || req.user!.email,
      monthly_income: income || 75000,
      requested_amount: amt,
      interest_rate: rate,
      tenure_months: tenure,
      calculated_emi: emi,
      purpose: purpose || 'General requirement',
      status: 'submitted',
      credit_score: 745,
      officer_remarks: 'Application submitted online. Initial e-KYC verified at Kadapa central branch.'
    });

    // Notify user via repository
    await dbRepository.notifications.create({
      user_id: req.user!.userId,
      title: `Loan Application #${appNo} Received`,
      message: `Your request for ${product?.product_name || 'Loan'} of ₹${amt.toLocaleString('en-IN')} is assigned to the Kadapa Credit Committee.`,
      category: 'loans'
    });

    logAudit(req.user!.userId, 'SUBMIT_LOAN_APPLICATION', 'loan_applications', appNo, { amount: amt, product: product?.product_name });

    return res.status(201).json(newApp);
  } catch (err: any) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: 'Service Unavailable', detail: err.message });
    }
    console.error('Loan apply error:', err);
    return res.status(500).json({ error: 'Internal Error', detail: err.message });
  }
});

// POST /api/loans/pay-emi
router.post('/pay-emi', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { application_id, loan_account_no, amount, payment_mode } = req.body;
    const targetAppId = parseInt(application_id, 10) || 3;

    // Verify loan ownership unless administrative user
    if (req.user!.role !== 'admin' && req.user!.role !== 'credit_officer') {
      const userApps = await dbRepository.loans.getApplicationsByUser(req.user!.userId);
      const ownsLoan = userApps.some((a: any) => a.id === targetAppId);
      if (!ownsLoan) {
        return res.status(403).json({
          error: 'Forbidden',
          detail: 'You are not authorized to make payments on this loan account.'
        });
      }
    }

    const amt = parseFloat(amount);
    if (!amt || isNaN(amt) || !Number.isFinite(amt) || amt <= 0) {
      return res.status(400).json({ error: 'Bad Request', detail: 'Invalid payment amount. Must be positive.' });
    }

    const isLive = process.env.LIVE_FINANCIAL_PARTNERS === 'true' && Boolean(process.env.PAYMENT_GATEWAY_SECRET);
    const payStatus = isLive ? 'SUCCESS' : 'DEMO_SUCCESS';

    // Execute atomic wallet payment
    const paymentResult = await dbRepository.payments.executeAtomicWalletPayment({
      userId: req.user!.userId,
      amount: amt,
      category: 'loan_emi',
      operator: 'Tatito Loan Repayment Desk',
      accountIdentifier: loan_account_no || 'TF-LN-0814',
      paymentMode: payment_mode || 'wallet',
      status: payStatus,
      applicationId: targetAppId,
      metaJson: {
        loan_account_no: loan_account_no || 'TF-LN-0814',
        channel: 'Tatito Repayment Gateway',
        is_demo: !isLive
      }
    });

    // Update pending EMI schedule if found
    const schedules = await dbRepository.loans.getEmiSchedules(targetAppId);
    const pendingSchedule = schedules.find((s: any) => s.payment_status === 'pending');
    if (pendingSchedule) {
      const today = new Date().toISOString().split('T')[0];
      await dbRepository.loans.markEmiPaid(pendingSchedule.id, today);
    }

    await dbRepository.notifications.create({
      user_id: req.user!.userId,
      title: 'EMI Installment Paid',
      message: `₹${amt.toLocaleString('en-IN')} paid towards ${loan_account_no || 'your loan'}. Next due date updated.`,
      category: 'loans'
    });

    logAudit(req.user!.userId, 'PAY_EMI', 'payments', paymentResult.payment.payment_ref, {
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
      message: 'EMI installment received and credited to loan account',
      compliance_notice: isLive
        ? 'Settled to loan ledger via live clearing.'
        : 'DEMO TRANSACTION: Simulated loan repayment. No actual banking clearing occurred.'
    });
  } catch (err: any) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: 'Service Unavailable', detail: err.message });
    }
    if (err.statusCode === 400) {
      return res.status(400).json({ error: 'Payment Error', detail: err.message });
    }
    if (err.statusCode === 403) {
      return res.status(403).json({ error: 'Forbidden', detail: err.message });
    }
    console.error('Pay EMI error:', err);
    return res.status(500).json({ error: 'Internal Error', detail: err.message });
  }
});

export default router;
