import { Router } from 'express';
import type { Response } from 'express';
import { dbRepository, logAudit } from '../../database/db.ts';
import { requireAuth, requireRole, type AuthenticatedRequest } from '../middleware/auth.ts';

const router = Router();

// GET /api/agents/dashboard
router.get('/dashboard', requireAuth, requireRole('agent', 'admin'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const agentProfile = await dbRepository.agents.getByUserId(req.user!.userId);
    const leads = await dbRepository.agents.getLeads(req.user!.userId, req.user!.role);
    const commissions = await dbRepository.agents.getCommissions(req.user!.role === 'admin' || req.user!.role === 'super_admin' ? undefined : req.user!.userId);

    return res.json({
      agent: agentProfile || {
        agent_code: 'TF-DSA-042',
        agency_name: 'Rayalaseema Financial Associates',
        operating_region: 'Kadapa, Proddatur & Pulivendula',
        commission_rate_pct: 1.0,
        status: 'active'
      },
      total_leads: leads.length,
      disbursed_leads: leads.filter((l: any) => l.status === 'Disbursed').length,
      in_review_leads: leads.filter((l: any) => l.status === 'In Review').length,
      total_commission_earned: commissions.total_earned,
      pending_commission_pipeline: commissions.pending_pipeline,
      leads
    });
  } catch (err: any) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: 'Service Unavailable', detail: err.message });
    }
    return res.status(500).json({ error: 'Internal Error', detail: err.message });
  }
});

// GET /api/agents/leads
router.get('/leads', requireAuth, requireRole('agent', 'admin'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const leads = await dbRepository.agents.getLeads(req.user!.userId, req.user!.role);
    return res.json(leads);
  } catch (err: any) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: 'Service Unavailable', detail: err.message });
    }
    return res.status(500).json({ error: 'Internal Error', detail: err.message });
  }
});

// POST /api/agents/leads
router.post('/leads', requireAuth, requireRole('agent', 'admin'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { applicant_name, phone, email, loan_product, requested_amount, location, notes } = req.body;

    if (!applicant_name || !phone || !loan_product || !requested_amount) {
      return res.status(400).json({ error: 'Validation Error', detail: 'Missing required lead details' });
    }

    const amt = parseFloat(requested_amount);
    if (isNaN(amt) || amt <= 0) {
      return res.status(400).json({ error: 'Validation Error', detail: 'Valid positive loan amount required' });
    }

    let commissionRate = 1.0;
    if (loan_product.includes('Home')) commissionRate = 0.40;
    else if (loan_product.includes('Personal')) commissionRate = 1.25;
    else if (loan_product.includes('Gold')) commissionRate = 0.50;
    else if (loan_product.includes('Business')) commissionRate = 1.00;

    const commissionAmount = Math.round(amt * (commissionRate / 100));
    const agentProfile = await dbRepository.agents.getByUserId(req.user!.userId);
    const agentCode = agentProfile?.agent_code || 'TF-DSA-042';

    const newLead = await dbRepository.agents.createLead({
      agent_id: req.user!.userId,
      agent_code: agentCode,
      applicant_name: applicant_name.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : null,
      loan_product,
      requested_amount: amt,
      location: location || 'Kadapa',
      commission_rate_pct: commissionRate,
      commission_amount: commissionAmount,
      status: 'Contacted',
      notes
    });

    logAudit(req.user!.userId, 'SUBMIT_AGENT_LEAD', 'agent_leads', String(newLead.id), { applicant: newLead.applicant_name, amount: amt });

    return res.status(201).json({
      status: 'CREATED',
      lead: newLead,
      message: 'Borrower lead recorded and dispatched to Kadapa branch underwriting'
    });
  } catch (err: any) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: 'Service Unavailable', detail: err.message });
    }
    return res.status(500).json({ error: 'Internal Error', detail: err.message });
  }
});

// GET /api/agents/commissions
router.get('/commissions', requireAuth, requireRole('agent', 'admin'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const agentProfile = await dbRepository.agents.getByUserId(req.user!.userId);
    const agentCode = agentProfile?.agent_code || 'TF-DSA-042';
    const commissionData = await dbRepository.agents.getCommissions(req.user!.role === 'admin' ? undefined : req.user!.userId);

    return res.json({
      agent_code: agentCode,
      total_earned: commissionData.total_earned,
      pending_pipeline: commissionData.pending_pipeline,
      commission_slabs: [
        { product: 'Home Loans', rate: '0.40% - 0.50%', terms: 'Disbursement UTR confirmation' },
        { product: 'Business Loans', rate: '1.00% - 1.25%', terms: 'Highest tier payout' },
        { product: 'Personal Loans', rate: '1.25% - 1.50%', terms: 'Fastest 48h turnaround' },
        { product: 'Gold Loans', rate: '0.50% Flat', terms: 'Same-day counter cash settlement' }
      ]
    });
  } catch (err: any) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: 'Service Unavailable', detail: err.message });
    }
    return res.status(500).json({ error: 'Internal Error', detail: err.message });
  }
});

export default router;
