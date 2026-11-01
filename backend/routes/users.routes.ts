import { Router } from 'express';
import type { Response } from 'express';
import { dbRepository, logAudit } from '../../database/db.ts';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.ts';

const router = Router();

// GET /api/users/profile
router.get('/profile', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await dbRepository.users.findById(req.user!.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const profile = (await dbRepository.profiles.getByUserId(user.id)) || {};
    const kyc = await dbRepository.kyc.getByUserId(user.id);
    const demat = await dbRepository.investments.getDemat(user.id);

    const { password_hash: _, ...safeUser } = user;
    return res.json({
      ...safeUser,
      profile,
      kyc_records: kyc,
      demat_account: demat
    });
  } catch (err: any) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: 'Service Unavailable', detail: err.message });
    }
    return res.status(500).json({ error: 'Internal Error', detail: err.message });
  }
});

// PUT /api/users/profile
router.put('/profile', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await dbRepository.users.findById(req.user!.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { full_name, phone, city, state, annual_income, occupation_type } = req.body;

    const updatedProfile = await dbRepository.profiles.upsert(user.id, {
      city: city ? city.trim() : undefined,
      state: state ? state.trim() : undefined,
      annual_income: annual_income !== undefined ? parseFloat(annual_income) : undefined,
      occupation_type
    });

    logAudit(user.id, 'UPDATE_PROFILE', 'user_profiles', String(user.id), { updatedFields: req.body });

    const { password_hash: _, ...safeUser } = user;
    return res.json({ ...safeUser, profile: updatedProfile });
  } catch (err: any) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: 'Service Unavailable', detail: err.message });
    }
    return res.status(500).json({ error: 'Internal Error', detail: err.message });
  }
});

// POST /api/users/deposit (Simulated wallet top-up)
router.post('/deposit', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await dbRepository.users.findById(req.user!.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const amt = parseFloat(req.body.amount);
    if (!amt || amt <= 0) {
      return res.status(400).json({ error: 'Bad Request', detail: 'Valid positive amount required' });
    }

    const currentBalance = parseFloat(user.wallet_balance || 0);
    const newBalance = currentBalance + amt;
    await dbRepository.users.updateWallet(user.id, newBalance);

    const paymentRef = `DEP-${Date.now()}`;
    await dbRepository.payments.create({
      payment_ref: paymentRef,
      user_id: user.id,
      payment_category: 'wallet_deposit',
      operator_name: 'IMPS Bank Transfer Sandbox',
      account_identifier: user.phone,
      amount: amt,
      payment_mode: 'netbanking',
      status: 'SUCCESS'
    });

    await dbRepository.notifications.create({
      user_id: user.id,
      title: 'Wallet Funded',
      message: `₹${amt.toLocaleString('en-IN')} deposited into wallet. Reference: ${paymentRef}`,
      category: 'investments'
    });

    logAudit(user.id, 'WALLET_DEPOSIT', 'payments', paymentRef, { amount: amt });

    return res.json({
      wallet_balance: newBalance,
      reference: paymentRef,
      message: 'Deposit simulated successfully'
    });
  } catch (err: any) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: 'Service Unavailable', detail: err.message });
    }
    return res.status(500).json({ error: 'Internal Error', detail: err.message });
  }
});

export default router;
