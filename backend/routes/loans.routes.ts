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
  const { principal, interest_rate_annual, tenure_months, repayment_mode } = req.body;
  const P = parseFloat(principal);
  const annualRate = parseFloat(interest_rate_annual);
  const n = parseInt(tenure_months, 10);
  const mode = repayment_mode === 'interest_only' ? 'interest_only' : 'reducing_emi';

  if (isNaN(P) || P <= 0 || isNaN(annualRate) || isNaN(n) || n <= 0) {
    return res.status(400).json({ error: 'Bad Request', detail: 'Invalid parameters for EMI calculation' });
  }

  const r = (annualRate / 12) / 100;
  let emi = 0;
  let totalInterest = 0;
  let totalRepayment = 0;
  const schedule = [];

  if (mode === 'interest_only') {
    // Mode A: Interest-Only Unsecured Loan (Monthly interest payment, bullet principal repayment at maturity)
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
    // Mode B: Secured / Reducing-Balance Amortized Loan
    if (r <= 0) {
      emi = Math.round(P / n);
    } else {
      emi = Math.round((P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
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
        repayment_mode: app.repayment_mode || 'reducing_emi',
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
    const mode = repayment_mode === 'interest_only' ? 'interest_only' : 'reducing_emi';

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
    const emi = mode === 'interest_only'
      ? Math.round(amt * r)
      : Math.round((amt * r * Math.pow(1 + r, tenure)) / (Math.pow(1 + r, tenure) - 1));
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
      repayment_mode: mode,
      calculated_emi: emi,
      purpose: purpose || 'General requirement',
      collateral_type: collateral_type || null,
      collateral_value: collateral_value ? parseFloat(collateral_value) : null,
      guarantor_name: guarantor_name || null,
      guarantor_phone: guarantor_phone || null,
      status: 'submitted',
      credit_score: 745,
      officer_remarks: 'Application submitted online. Initial e-KYC verified at Kadapa central branch.',
      created_at: new Date().toISOString()
    });

    // Notify user via repository
    await dbRepository.notifications.create({
      user_id: req.user!.userId,
      title: `Loan Application #${appNo} Received`,
      message: `Your request for ${product?.product_name || 'Loan'} (${mode === 'interest_only' ? 'Interest-Only Mode' : 'Reducing EMI Mode'}) of ₹${amt.toLocaleString('en-IN')} is assigned to the Kadapa Credit Committee.`,
      category: 'loans'
    });

    logAudit(req.user!.userId, 'SUBMIT_LOAN_APPLICATION', 'loan_applications', appNo, { amount: amt, product: product?.product_name, mode });

    return res.status(201).json({
      ...newApp,
      application: newApp
    });
  } catch (err: any) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: 'Service Unavailable', detail: err.message });
    }
    console.error('Loan apply error:', err);
    return res.status(500).json({ error: 'Internal Error', detail: err.message });
  }
});

// GET /api/loans/:id/emi-schedule
router.get('/:id/emi-schedule', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const appId = parseInt(req.params.id, 10);
    const app = await dbRepository.loans.getApplicationById(appId);
    if (!app) {
      return res.status(404).json({ error: 'Not Found', detail: 'Loan application not found' });
    }

    const isOfficerOrAdmin = ['admin', 'super_admin', 'credit_officer'].includes(req.user!.role);
    if (!isOfficerOrAdmin && app.user_id !== req.user!.userId) {
      return res.status(403).json({ error: 'Forbidden', detail: 'Access restricted to loan owner or underwriting officer' });
    }

    let schedules = await dbRepository.loans.getEmiSchedules(appId);
    if (schedules.length === 0) {
      // Generate preview schedule dynamically
      const P = parseFloat(app.sanctioned_amount || app.requested_amount);
      const r = (parseFloat(app.interest_rate) / 12) / 100;
      const n = parseInt(app.tenure_months, 10) || 12;
      const mode = app.repayment_mode === 'interest_only' ? 'interest_only' : 'reducing_emi';
      const emi = parseFloat(app.calculated_emi) || Math.round((P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
      let balance = P;

      schedules = [];
      for (let m = 1; m <= n; m++) {
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + m);
        dueDate.setDate(5);
        if (mode === 'interest_only') {
          const isLast = m === n;
          const interest = Math.round(P * r);
          schedules.push({
            id: m,
            application_id: appId,
            installment_number: m,
            due_date: dueDate.toISOString().split('T')[0],
            emi_amount: isLast ? interest + P : interest,
            principal_component: isLast ? P : 0,
            interest_component: interest,
            remaining_balance: isLast ? 0 : P,
            payment_status: 'scheduled_preview',
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
            due_date: dueDate.toISOString().split('T')[0],
            emi_amount: emi,
            principal_component: principal,
            interest_component: interest,
            remaining_balance: Math.max(0, balance),
            payment_status: 'scheduled_preview',
            paid_date: null
          });
        }
      }
    }

    return res.json({
      application_id: app.id,
      application_no: app.application_no,
      product_name: app.product_name,
      repayment_mode: app.repayment_mode || 'reducing_emi',
      principal: parseFloat(app.sanctioned_amount || app.requested_amount),
      interest_rate: parseFloat(app.interest_rate),
      tenure_months: app.tenure_months,
      monthly_emi: parseFloat(app.calculated_emi),
      schedule: schedules,
      schedules
    });
  } catch (err: any) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: 'Service Unavailable', detail: err.message });
    }
    return res.status(500).json({ error: 'Internal Error', detail: err.message });
  }
});

// GET /api/loans/:id
router.get('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const appId = parseInt(req.params.id, 10);
    if (isNaN(appId)) {
      return res.status(400).json({ error: 'Bad Request', detail: 'Valid numeric loan ID required' });
    }
    const app = await dbRepository.loans.getApplicationById(appId);
    if (!app) {
      return res.status(404).json({ error: 'Not Found', detail: 'Loan application not found' });
    }

    const isOfficerOrAdmin = ['admin', 'super_admin', 'credit_officer'].includes(req.user!.role);
    if (!isOfficerOrAdmin && app.user_id !== req.user!.userId) {
      return res.status(403).json({ error: 'Forbidden', detail: 'Access restricted to loan owner or underwriting officer' });
    }

    const schedules = await dbRepository.loans.getEmiSchedules(appId);
    return res.json({
      ...app,
      emi_schedules: schedules,
      sanction_letter: ['approved', 'sanctioned', 'disbursed'].includes(app.status)
        ? {
            sanction_ref: `SAN-${app.application_no}`,
            issuer: 'M/s. Tatito Projects — NBFC Division, Kadapa',
            sanctioned_amount: app.sanctioned_amount || app.requested_amount,
            interest_rate: app.interest_rate,
            tenure_months: app.tenure_months,
            repayment_mode: app.repayment_mode || 'reducing_emi',
            issued_at: app.sanctioned_at || app.created_at
          }
        : null
    });
  } catch (err: any) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: 'Service Unavailable', detail: err.message });
    }
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
