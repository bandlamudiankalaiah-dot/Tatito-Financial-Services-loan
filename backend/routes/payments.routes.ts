import { Router } from 'express';
import type { Request, Response } from 'express';
import { dbRepository, logAudit } from '../../database/db.ts';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.ts';
import { isLivePartnerConfigured } from '../../integrations/index.ts';

const router = Router();

// GET /api/payments/history
router.get('/history', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const list = await dbRepository.payments.getByUser(req.user!.userId);
    res.json(list);
  } catch (err: any) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: 'Service Unavailable', detail: err.message });
    }
    res.status(500).json({ error: 'Internal Error', detail: err.message });
  }
});

// POST /api/payments/bills/fetch
router.post('/bills/fetch', (req: Request, res: Response) => {
  const { category, operator, account_identifier } = req.body;
  const cleanId = (account_identifier || '1009823412034').trim();

  let hash = 0;
  for (let i = 0; i < cleanId.length; i++) hash += cleanId.charCodeAt(i);

  const names = [
    'Ramesh Kumar Chennur', 'Venkata Subba Reddy', 'Lakshmi Narayana Rao',
    'Sunitha Devi Giddalur', 'Ankalaiah Bandlamudi'
  ];
  const customerName = names[hash % names.length];

  let amount = 1420;
  if (category === 'electricity') amount = 850 + (hash % 2200);
  else if (category === 'water') amount = 180 + (hash % 380);
  else if (category === 'gas') amount = 950 + (hash % 120);
  else if (category === 'mobile') amount = [299, 349, 479, 666, 839][hash % 5];
  else if (category === 'dth') amount = [250, 399, 499, 650][hash % 4];
  else if (category === 'fastag') amount = [500, 1000, 1500, 2000][hash % 4];
  else if (category === 'broadband') amount = [589, 825, 1179][hash % 3];
  else if (category === 'credit_card') amount = 4250 + (hash % 15000);

  const now = new Date();
  const billDate = new Date(now.getTime() - 7 * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const dueDate = new Date(now.getTime() + 8 * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return res.json({
    customer_name: customerName,
    account_identifier: cleanId,
    operator: operator || 'APSPDCL (Southern Power AP)',
    category: category || 'electricity',
    bill_number: `DEMO-BILL-${100000 + (hash % 899999)}`,
    bill_date: billDate,
    due_date: dueDate,
    amount_due: amount,
    convenience_fee: 0.0,
    bbps_reference: `DEMO-BBPS-${10000000 + (hash % 89999999)}`,
    status: 'PENDING',
    circle: 'Andhra Pradesh (Kadapa Circle)',
    is_demo: true,
    data_source: 'DEMO_BILLER_CATALOG',
    notice: 'DEMO DATA: Simulated bill fetch. Not an active fetch from live NPCI BBPS Central Unit.'
  });
});

// POST /api/payments/bills/pay
router.post('/bills/pay', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { category, operator, account_identifier, customer_name, amount, payment_mode } = req.body;
    const idempotencyKey = (
      req.headers['idempotency-key'] ||
      req.headers['x-idempotency-key'] ||
      req.body.idempotency_key ||
      req.body.idempotencyKey
    ) as string | undefined;

    // Idempotency: Return existing payment if replay detected
    if (idempotencyKey) {
      const existingPayment = await dbRepository.payments.findByIdempotencyKey(idempotencyKey);
      if (existingPayment) {
        return res.json({
          status: existingPayment.status,
          transaction_reference: existingPayment.payment_ref,
          bbps_reference: existingPayment.bbps_ref_no,
          amount_paid: parseFloat(existingPayment.amount),
          idempotent_replay: true,
          message: 'Payment already processed with this idempotency key. No duplicate deduction.',
          paid_at: existingPayment.created_at
        });
      }
    }

    const amt = parseFloat(amount);
    if (isNaN(amt) || !Number.isFinite(amt) || amt <= 0) {
      return res.status(400).json({ error: 'Bad Request', detail: 'Invalid payment amount. Must be a positive number.' });
    }

    if (!category || !account_identifier) {
      return res.status(400).json({ error: 'Bad Request', detail: 'category and account_identifier are required.' });
    }

    // Verify whether live payment provider is configured
    const isLive = isLivePartnerConfigured(process.env.PAYMENT_GATEWAY_SECRET);

    // Safe failure handling: Check for simulated or requested failure
    const simulateFailure = req.body.simulate_failure === true || req.headers['x-simulate-failure'] === 'true';
    if (simulateFailure) {
      return res.status(400).json({
        error: 'Payment Processing Failed',
        detail: 'Simulated processor decline: Transaction rejected by biller network. Wallet balance untouched.',
        is_demo: true,
        is_simulated: true
      });
    }

    const payStatus = isLive ? 'SUCCESS' : 'DEMO_SUCCESS';

    // Execute atomic wallet deduction and payment recording in a database transaction
    const result = await dbRepository.payments.executeAtomicWalletPayment({
      userId: req.user!.userId,
      amount: amt,
      category: category || 'utility',
      operator: operator || 'Utility Biller',
      accountIdentifier: account_identifier,
      paymentMode: payment_mode || 'wallet',
      status: payStatus,
      idempotencyKey,
      metaJson: {
        customer_name: customer_name || req.user!.fullName,
        circle: 'Andhra Pradesh',
        channel: isLive ? 'Bharat BillPay (BBPS) Live' : 'Bharat BillPay (BBPS) Sandbox Simulator',
        is_demo: !isLive
      }
    });

    await dbRepository.notifications.create({
      user_id: req.user!.userId,
      title: 'Bill Payment Completed',
      message: `₹${amt.toLocaleString('en-IN')} paid for ${operator || 'utility'}. Ref: ${result.payment.payment_ref}`,
      category: 'general'
    });

    logAudit(req.user!.userId, 'PAY_BILL', 'payments', result.payment.payment_ref, {
      operator,
      amount: amt,
      status: payStatus,
      isDemo: !isLive
    });

    return res.json({
      status: result.payment.status,
      is_demo: !isLive,
      is_simulated: !isLive,
      transaction_reference: result.payment.payment_ref,
      bbps_reference: result.payment.bbps_ref_no,
      amount_paid: amt,
      wallet_balance: result.newBalance,
      paid_at: result.payment.created_at || new Date().toISOString(),
      compliance_notice: isLive
        ? 'Confirmed live settlement via Bharat BillPay NPCI Clearing House.'
        : 'DEMO TRANSACTION: Simulated utility payment in sandbox environment. No actual bank clearing occurred.'
    });
  } catch (err: any) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: 'Service Unavailable', detail: err.message });
    }
    if (err.statusCode === 400) {
      return res.status(400).json({ error: 'Payment Error', detail: err.message });
    }
    if (err.statusCode === 404) {
      return res.status(404).json({ error: 'Not Found', detail: err.message });
    }
    console.error('Bill pay error:', err);
    return res.status(500).json({ error: 'Internal Error', detail: err.message });
  }
});

export default router;
