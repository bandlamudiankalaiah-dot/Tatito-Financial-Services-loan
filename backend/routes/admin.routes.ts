import { Router, Response } from 'express';
import { dbRepository, logAudit } from '../../database/db.ts';
import { requireAuth, requireRole, AuthenticatedRequest } from '../middleware/auth.ts';

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

export default router;
