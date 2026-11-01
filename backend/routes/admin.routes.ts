import { Router } from 'express';
import type { Response } from 'express';
import { dbRepository, logAudit } from '../../database/db.ts';
import { requireAuth, requireRole, type AuthenticatedRequest } from '../middleware/auth.ts';

const router = Router();

// GET /api/admin/dashboard-stats
router.get('/dashboard-stats', requireAuth, requireRole('admin', 'credit_officer'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = await dbRepository.admin.getDashboardStats();
    return res.json(stats);
  } catch (err: any) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: 'Service Unavailable', detail: err.message });
    }
    return res.status(500).json({ error: 'Internal Error', detail: err.message });
  }
});

// GET /api/admin/loans (Queue of applications)
router.get('/loans', requireAuth, requireRole('admin', 'credit_officer'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const statusFilter = (req.query.status as string || 'all').toLowerCase();
    const list = await dbRepository.loans.getAllApplications(statusFilter);
    res.json(list);
  } catch (err: any) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: 'Service Unavailable', detail: err.message });
    }
    res.status(500).json({ error: 'Internal Error', detail: err.message });
  }
});

// PATCH /api/admin/loans/:id/decision
router.patch('/loans/:id/decision', requireAuth, requireRole('admin', 'credit_officer'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const appId = parseInt(req.params.id, 10);
    const { decision, remarks, sanctioned_amount } = req.body;

    const app = await dbRepository.loans.getApplicationById(appId);
    if (!app) return res.status(404).json({ error: 'Loan application not found' });

    const validDecisions = ['under_review', 'approved', 'sanctioned', 'disbursed', 'rejected'];
    if (!validDecisions.includes(decision)) {
      return res.status(400).json({ error: 'Invalid Decision', detail: `Must be one of: [${validDecisions.join(', ')}]` });
    }

    const prevStatus = app.status;
    let finalAmount = app.requested_amount;
    let calculatedEmi = app.calculated_emi;

    if (decision === 'approved' || decision === 'sanctioned') {
      finalAmount = parseFloat(sanctioned_amount) || parseFloat(app.requested_amount);
      const interestRate = parseFloat(app.interest_rate);
      const tenureMonths = parseInt(app.tenure_months, 10);
      const r = (interestRate / 12) / 100;
      calculatedEmi = Math.round((finalAmount * r * Math.pow(1 + r, tenureMonths)) / (Math.pow(1 + r, tenureMonths) - 1));

      // Generate repayment schedules if not existing
      const existingSched = await dbRepository.loans.getEmiSchedules(app.id);
      if (existingSched.length === 0) {
        const schedules = [];
        let balance = finalAmount;
        for (let m = 1; m <= tenureMonths; m++) {
          const interest = Math.round(balance * r);
          let principal = calculatedEmi - interest;
          if (m === tenureMonths || balance - principal < 0) {
            principal = balance;
            balance = 0;
          } else {
            balance -= principal;
          }

          const dueDate = new Date();
          dueDate.setMonth(dueDate.getMonth() + m);
          dueDate.setDate(5); // 5th of each month

          schedules.push({
            application_id: app.id,
            installment_number: m,
            due_date: dueDate.toISOString().split('T')[0],
            emi_amount: calculatedEmi,
            principal_component: principal,
            interest_component: interest,
            remaining_balance: Math.max(0, balance)
          });

          if (balance <= 0) break;
        }
        await dbRepository.loans.createEmiSchedules(schedules);
      }
    }

    const updatedApp = await dbRepository.loans.updateApplicationDecision(
      appId,
      decision,
      remarks,
      finalAmount,
      calculatedEmi
    );

    if (decision === 'disbursed') {
      // Credit to user's wallet
      const borrower = await dbRepository.users.findById(app.user_id);
      if (borrower) {
        const currentBalance = parseFloat(borrower.wallet_balance || 0);
        const addAmount = parseFloat(sanctioned_amount) || parseFloat(app.sanctioned_amount || app.requested_amount);
        await dbRepository.users.updateWallet(borrower.id, currentBalance + addAmount);
      }
    }

    // Notify borrower
    await dbRepository.notifications.create({
      user_id: app.user_id,
      title: `Loan #${app.application_no} Updated: ${decision.toUpperCase()}`,
      message: remarks || `Credit Committee has updated your application to ${decision.toUpperCase()}.`,
      category: 'loans'
    });

    logAudit(req.user!.userId, 'LOAN_DECISION', 'loan_applications', app.application_no, {
      prevStatus,
      decision,
      officer: req.user!.fullName
    });

    return res.json({
      status: 'UPDATED',
      application: updatedApp,
      message: `Application #${app.application_no} marked as ${decision.toUpperCase()}`
    });
  } catch (err: any) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: 'Service Unavailable', detail: err.message });
    }
    console.error('Loan decision error:', err);
    return res.status(500).json({ error: 'Internal Error', detail: err.message });
  }
});

// GET /api/admin/audit-logs
router.get('/audit-logs', requireAuth, requireRole('admin'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const logs = await dbRepository.admin.getAuditLogs(50);
    res.json(logs);
  } catch (err: any) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: 'Service Unavailable', detail: err.message });
    }
    res.status(500).json({ error: 'Internal Error', detail: err.message });
  }
});

// GET /api/admin/reports/csv
router.get('/reports/csv', requireAuth, requireRole('admin', 'credit_officer'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const apps = await dbRepository.loans.getAllApplications();
    let csv = 'Application No,Applicant Name,Phone,Email,Product,Requested Amount,Interest Rate,Tenure Months,EMI,Status,Created At\n';

    apps.forEach((a: any) => {
      csv += `"${a.application_no}","${a.applicant_name}","${a.phone}","${a.email}","${a.product_name || 'Loan'}",${a.requested_amount},${a.interest_rate},${a.tenure_months},${a.calculated_emi},"${a.status}","${a.created_at}"\n`;
    });

    res.header('Content-Type', 'text/csv');
    res.attachment(`Tatito_Loans_Report_${new Date().toISOString().split('T')[0]}.csv`);
    return res.send(csv);
  } catch (err: any) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: 'Service Unavailable', detail: err.message });
    }
    res.status(500).json({ error: 'Internal Error', detail: err.message });
  }
});

// GET /api/admin/users (List users)
router.get('/users', requireAuth, requireRole('admin'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const roleFilter = req.query.role as string;
    const users = await dbRepository.users.getAll(roleFilter);
    return res.json(users);
  } catch (err: any) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: 'Service Unavailable', detail: err.message });
    }
    res.status(500).json({ error: 'Internal Error', detail: err.message });
  }
});

// PATCH /api/admin/users/:id/role
router.patch('/users/:id/role', requireAuth, requireRole('admin'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { role } = req.body;
    const allowed = ['customer', 'agent', 'credit_officer', 'admin'];
    if (!allowed.includes(role)) {
      return res.status(400).json({ error: 'Invalid Role', detail: `Allowed: [${allowed.join(', ')}]` });
    }
    await dbRepository.users.updateRole(userId, role);
    logAudit(req.user!.userId, 'UPDATE_USER_ROLE', 'users', String(userId), { newRole: role });
    return res.json({ message: 'User role updated successfully', userId, role });
  } catch (err: any) {
    res.status(500).json({ error: 'Internal Error', detail: err.message });
  }
});

// PATCH /api/admin/users/:id/status
router.patch('/users/:id/status', requireAuth, requireRole('admin'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { is_active } = req.body;
    await dbRepository.users.updateStatus(userId, Boolean(is_active));
    logAudit(req.user!.userId, 'UPDATE_USER_STATUS', 'users', String(userId), { is_active });
    return res.json({ message: 'User status updated', userId, is_active: Boolean(is_active) });
  } catch (err: any) {
    res.status(500).json({ error: 'Internal Error', detail: err.message });
  }
});

// PATCH /api/admin/loan-products/:id (Configure demo rates)
router.patch('/loan-products/:id', requireAuth, requireRole('admin'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const prodId = parseInt(req.params.id, 10);
    const { base_interest_rate, min_amount, max_amount } = req.body;
    const updated = await dbRepository.loans.updateProduct(prodId, {
      base_interest_rate: base_interest_rate !== undefined ? parseFloat(base_interest_rate) : undefined,
      min_amount: min_amount !== undefined ? parseFloat(min_amount) : undefined,
      max_amount: max_amount !== undefined ? parseFloat(max_amount) : undefined
    });
    if (!updated) return res.status(404).json({ error: 'Loan product not found' });
    logAudit(req.user!.userId, 'UPDATE_LOAN_PRODUCT', 'loan_products', String(prodId), req.body);
    return res.json({ message: 'Loan product updated', product: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'Internal Error', detail: err.message });
  }
});

export default router;
