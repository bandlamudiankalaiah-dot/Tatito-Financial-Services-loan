import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AdminDashboardStats, LoanApplication, AuditLogItem } from '../types';
import { 
  Building, Users, FileText, Download, CheckCircle2, 
  XCircle, Sliders, ShieldAlert, Clock, RefreshCw, AlertCircle 
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loans, setLoans] = useState<LoanApplication[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'loans' | 'users' | 'products' | 'audit'>('loans');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [notice, setNotice] = useState<string>('');

  const loadAdminData = async () => {
    try {
      const [statsData, loansData, usersData, logsData, prodsData] = await Promise.all([
        api.getAdminStats(),
        api.getAdminLoans(statusFilter === 'all' ? undefined : statusFilter),
        api.getAdminUsers(),
        api.getAuditLogs(),
        api.getProducts(),
      ]);
      setStats(statsData);
      if (Array.isArray(loansData)) setLoans(loansData);
      if (Array.isArray(usersData)) setUsersList(usersData);
      if (Array.isArray(logsData)) setAuditLogs(logsData);
      if (Array.isArray(prodsData)) setProducts(prodsData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [statusFilter]);

  const handleUpdateProductRate = async (prodId: number, newRate: number) => {
    try {
      await api.updateLoanProduct(prodId, { base_interest_rate: newRate });
      setNotice(`Updated interest rate to ${newRate}% p.a. for product #${prodId}.`);
      await loadAdminData();
      setTimeout(() => setNotice(''), 2500);
    } catch (err: any) {
      setNotice(err.message || 'Failed to update product rate');
    }
  };

  const handleToggleUserStatus = async (userId: number, currentStatus: boolean) => {
    try {
      await api.updateUserStatus(userId, !currentStatus);
      setNotice(`User status updated to ${!currentStatus ? 'Active' : 'Suspended'}.`);
      await loadAdminData();
      setTimeout(() => setNotice(''), 2500);
    } catch (err: any) {
      setNotice(err.message || 'Failed to update user status');
    }
  };

  const handleQuickLoanDecision = async (loan: LoanApplication, decision: string) => {
    try {
      await api.decideLoan(loan.id, {
        decision,
        remarks: `Executive decision (${decision.toUpperCase()}) recorded by ${user?.full_name || 'Branch Admin'}.`,
        sanctioned_amount: loan.requested_amount,
      });
      setNotice(`Application ${loan.application_no} updated to ${decision.toUpperCase()}.`);
      await loadAdminData();
      setTimeout(() => setNotice(''), 3000);
    } catch (err: any) {
      setNotice(err.message || 'Failed to update loan status');
    }
  };

  const handleDownloadCsv = async () => {
    try {
      const csv = await api.downloadReportsCsv();
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Tatito_Loans_Report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
    }
  };

  const formatINR = (val: number) => '₹' + Math.round(val || 0).toLocaleString('en-IN');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="text-xs font-semibold text-teal-600 uppercase tracking-wider mb-1">
            {user?.role === 'super_admin' ? 'Super Admin Executive Console' : 'Executive Control Center'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {user?.role === 'super_admin' ? 'Enterprise Super Admin & Branch Console' : 'Branch Administrator Console'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Officer: <span className="font-semibold text-slate-900">{user?.full_name || 'Ankalaiah Bandlamudi'}</span> ({user?.role?.replace('_', ' ').toUpperCase()}) · Branch: {stats?.branch_name || 'Kadapa Central Hub, Andhra Pradesh'}
          </p>
        </div>

        <button
          onClick={handleDownloadCsv}
          className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export All Loans (CSV)</span>
        </button>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Registered Accounts</span>
          <div className="text-2xl font-bold font-tabular text-slate-900">{stats?.total_users || 8} Users</div>
          <div className="text-xs text-slate-400 pt-1">Customers, Agents &amp; Officers</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Application Dossiers</span>
          <div className="text-2xl font-bold font-tabular text-slate-900">{stats?.total_applications || 12} Total</div>
          <div className="text-xs text-teal-600 font-medium pt-1">{stats?.pending_underwriting || 7} Pending Review</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Disbursed Loan Volume</span>
          <div className="text-2xl font-bold font-tabular text-slate-900">{formatINR(stats?.total_disbursed_volume || 250000)}</div>
          <div className="text-xs text-slate-400 pt-1">Kadapa Retail Portfolio</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Wealth AUM</span>
          <div className="text-2xl font-bold font-tabular text-teal-800">{formatINR(stats?.total_wealth_aum || 460636)}</div>
          <div className="text-xs text-emerald-600 font-medium pt-1">Equities, SIPs &amp; Gold ETFs</div>
        </div>
      </div>

      {/* Navigation Tabs (Buttons allowed under frontend-design skill) */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start">
        <button
          onClick={() => setActiveTab('loans')}
          className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${activeTab === 'loans' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Loan Applications Queue ({loans.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${activeTab === 'users' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'}`}
        >
          User &amp; Role Management ({usersList.length})
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${activeTab === 'products' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Demo Interest Rates ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${activeTab === 'audit' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Security Audit Trail ({auditLogs.length})
        </button>
      </div>

      {/* TAB 1: LOAN APPLICATIONS QUEUE */}
      {activeTab === 'loans' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Application Underwriting Queue</h2>
              <p className="text-xs text-slate-500">Filter, inspect, and enforce credit committee approvals across all products.</p>
            </div>
            
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-medium"
            >
              <option value="all">All Application Statuses</option>
              <option value="submitted">Submitted (New)</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="sanctioned">Sanctioned</option>
              <option value="disbursed">Disbursed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">App Reference</th>
                  <th className="py-2.5 px-3">Applicant Name</th>
                  <th className="py-2.5 px-3">Product &amp; Mode</th>
                  <th className="py-2.5 px-3 text-right">Requested</th>
                  <th className="py-2.5 px-3">Tenure</th>
                  <th className="py-2.5 px-3">Score</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Underwriting Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-tabular text-slate-700">
                {loans.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">{app.application_no}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900">{app.applicant_name}</td>
                    <td className="py-3 px-3">
                      <div>{app.product_name || 'Personal Loan'}</div>
                      <div className="text-[10px] text-slate-400">
                        {(app as any).repayment_mode === 'interest_only' ? 'Mode A: Interest-Only' : 'Mode B: Amortized EMI'}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">{formatINR(app.requested_amount)}</td>
                    <td className="py-3 px-3">{app.tenure_months}M</td>
                    <td className="py-3 px-3 font-bold text-emerald-600">{app.credit_score || 745}</td>
                    <td className="py-3 px-3">
                      <span className={`font-bold uppercase tracking-wider text-[11px] ${
                        app.status === 'approved' || app.status === 'sanctioned' || app.status === 'disbursed'
                          ? 'text-emerald-700'
                          : app.status === 'rejected'
                          ? 'text-rose-700'
                          : 'text-blue-700'
                      }`}>
                        {app.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        {app.status !== 'approved' && app.status !== 'sanctioned' && app.status !== 'disbursed' && (
                          <button
                            type="button"
                            onClick={() => handleQuickLoanDecision(app, 'approved')}
                            className="px-2 py-1 text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors"
                          >
                            Approve
                          </button>
                        )}
                        {app.status === 'approved' && (
                          <button
                            type="button"
                            onClick={() => handleQuickLoanDecision(app, 'sanctioned')}
                            className="px-2 py-1 text-[10px] font-bold text-white bg-teal-700 hover:bg-teal-800 rounded transition-colors"
                          >
                            Sanction
                          </button>
                        )}
                        {(app.status === 'approved' || app.status === 'sanctioned') && (
                          <button
                            type="button"
                            onClick={() => handleQuickLoanDecision(app, 'disbursed')}
                            className="px-2 py-1 text-[10px] font-bold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors"
                          >
                            Disburse
                          </button>
                        )}
                        {app.status !== 'rejected' && app.status !== 'disbursed' && (
                          <button
                            type="button"
                            onClick={() => handleQuickLoanDecision(app, 'rejected')}
                            className="px-2 py-1 text-[10px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded transition-colors"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: USER & ROLE MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-slate-900">User &amp; Role Management</h2>
            <p className="text-xs text-slate-500">Monitor active accounts, enforce RBAC roles, and manage account statuses.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3">Full Name</th>
                  <th className="py-2.5 px-3">Email Address</th>
                  <th className="py-2.5 px-3">Phone</th>
                  <th className="py-2.5 px-3">Active Role</th>
                  <th className="py-2.5 px-3">Account Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-tabular text-slate-700">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 font-mono text-slate-400">#{u.id}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">{u.full_name}</td>
                    <td className="py-3 px-3 text-slate-600">{u.email}</td>
                    <td className="py-3 px-3 font-mono">{u.phone}</td>
                    <td className="py-3 px-3 font-semibold capitalize text-teal-800">{u.role.replace('_', ' ')}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${u.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                        {u.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleToggleUserStatus(u.id, u.is_active)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                      >
                        {u.is_active ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DEMO RATE CONFIGURATION */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Demo Loan Product &amp; Rate Configuration</h2>
            <p className="text-xs text-slate-500">Configure benchmark interest rates and borrowing caps for Kadapa branches.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((p) => (
              <div key={p.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900 text-sm">{p.product_name}</span>
                  <span className="font-mono text-[10px] text-slate-400">{p.product_code}</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="font-semibold text-slate-700">Base Rate (% p.a.):</label>
                  <input
                    type="number"
                    step="0.25"
                    defaultValue={p.base_interest_rate}
                    onBlur={(e) => handleUpdateProductRate(p.id, parseFloat(e.target.value))}
                    className="w-20 px-2 py-1 border border-slate-300 rounded font-bold font-tabular text-slate-900 bg-white"
                  />
                  <span className="text-[11px] text-slate-400">(Click outside to save)</span>
                </div>
                <div className="text-[11px] text-slate-500 font-tabular">
                  Sanction Limit: {formatINR(p.min_amount)} to {formatINR(p.max_amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Immutable Security Audit Trail</h2>
            <p className="text-xs text-slate-500">Records all critical financial operations, loan decisions, logins, and registrations.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Action Type</th>
                  <th className="py-2.5 px-3">Entity</th>
                  <th className="py-2.5 px-3">Reference ID</th>
                  <th className="py-2.5 px-3">Actor ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-tabular text-slate-700">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">
                      {new Date(log.created_at).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{log.action_type}</td>
                    <td className="py-2.5 px-3 text-slate-600 font-mono">{log.entity_name}</td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-teal-800">{log.entity_id}</td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono">User #{log.actor_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
