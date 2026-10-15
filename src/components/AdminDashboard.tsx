import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Coins, 
  FileCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Filter, 
  AlertCircle,
  Building2,
  Receipt,
  ArrowRight
} from 'lucide-react';
import { LoanApplication, Transaction, User } from '../types';
import { storageService } from '../services/storage';

interface AdminDashboardProps {
  currentUser: User;
  onSwitchToUser: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  onSwitchToUser
}) => {
  const [applications, setApplications] = useState<LoanApplication[]>(
    storageService.getAllApplications()
  );
  const [transactions, setTransactions] = useState<Transaction[]>(
    storageService.getAllTransactions()
  );

  const [activeTab, setActiveTab] = useState<'applications' | 'transactions'>('applications');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedApp, setSelectedApp] = useState<LoanApplication | null>(null);
  const [remarksInput, setRemarksInput] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Stats calculation
  const totalUsers = storageService.getAllUsers().length;
  const pendingApps = applications.filter(a => a.status === 'submitted' || a.status === 'under_review').length;
  const approvedApps = applications.filter(a => a.status === 'approved' || a.status === 'disbursed').length;
  const totalVolume = transactions.reduce((acc, t) => acc + t.amount, 0);

  const handleUpdateStatus = (appId: string, newStatus: LoanApplication['status']) => {
    try {
      const updated = storageService.updateApplicationStatus(
        appId,
        newStatus,
        remarksInput.trim() || `Processed by Kadapa Branch Officer (${currentUser.fullName})`
      );
      setApplications(storageService.getAllApplications());
      setSelectedApp(null);
      setRemarksInput('');
      setFeedbackMsg(`Application #${updated.applicationNo} marked as ${newStatus.toUpperCase()}`);
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Error updating status');
    }
  };

  const filteredApps = applications.filter(app => {
    if (statusFilter === 'all') return true;
    return app.status === statusFilter;
  });

  return (
    <section id="admin-portal" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg border border-emerald-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Kadapa Central Operations Desk
                </h2>
                <span className="text-[10px] font-extrabold bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full">
                  ADMIN CONSOLE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Officer: <strong className="text-white">{currentUser.fullName}</strong> • Kadapa Regional Hub (Rayalaseema)
              </p>
            </div>
          </div>

          <button
            onClick={onSwitchToUser}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <span>Switch to Customer View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* KPI Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Pending Reviews</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400 mt-2">{pendingApps}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Awaiting credit sanction</div>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Approved Loans</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400 mt-2">{approvedApps}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Sanctioned &amp; Active</div>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Total Transactions</span>
              <Receipt className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-2xl font-black text-white mt-2">{transactions.length}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">BBPS &amp; EMI Logs</div>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Processed Volume</span>
              <Coins className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-cyan-300 mt-2">
              ₹{totalVolume.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Kadapa Clearing Hub</div>
          </div>
        </div>
      </div>

      {feedbackMsg && (
        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="mt-8 flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
              activeTab === 'applications'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Loan Applications Desk ({applications.length})
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
              activeTab === 'transactions'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All BBPS Transaction Logs ({transactions.length})
          </button>
        </div>

        {activeTab === 'applications' && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 hidden sm:inline">Filter:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        )}
      </div>

      {/* Tab 1: Loan Applications */}
      {activeTab === 'applications' && (
        <div className="mt-6 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase font-extrabold border-b border-slate-200 text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Application #</th>
                    <th className="py-3 px-4">Applicant &amp; Phone</th>
                    <th className="py-3 px-4">Loan Type</th>
                    <th className="py-3 px-4">Amount &amp; Tenure</th>
                    <th className="py-3 px-4">Income / Mo</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredApps.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {app.applicationNo}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{app.applicantName}</div>
                        <div className="text-[10px] text-slate-400">{app.phone} • PAN: {app.panCard}</div>
                      </td>
                      <td className="py-3.5 px-4 capitalize font-bold text-slate-700">
                        {app.loanType} ({app.interestRate}% p.a.)
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-emerald-700">
                          ₹{app.requestedAmount.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-slate-400">{app.tenureMonths} Months</div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        ₹{app.monthlyIncome.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            app.status === 'approved' || app.status === 'disbursed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : app.status === 'under_review'
                              ? 'bg-amber-100 text-amber-800'
                              : app.status === 'rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {app.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedApp(app);
                            setRemarksInput(app.adminRemarks || '');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] transition cursor-pointer"
                        >
                          Review &amp; Decide
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Transactions Log */}
      {activeTab === 'transactions' && (
        <div className="mt-6 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase font-extrabold border-b border-slate-200 text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Txn Ref / BBPS Ref</th>
                  <th className="py-3 px-4">Consumer / Identifier</th>
                  <th className="py-3 px-4">Service Operator</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Payment Channel</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {transactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900">{txn.referenceId}</div>
                      <div className="text-[10px] text-emerald-600 font-mono">{txn.bbpsRefNo}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{txn.customerName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{txn.accountIdentifier}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {txn.operator}
                    </td>
                    <td className="py-3 px-4 uppercase text-[10px] font-bold text-slate-500">
                      {txn.category}
                    </td>
                    <td className="py-3 px-4 font-extrabold text-slate-900">
                      ₹{txn.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 capitalize text-slate-700">
                      {txn.paymentMode}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {new Date(txn.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {txn.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Credit Review Desk: {selectedApp.applicationNo}
                </h3>
                <p className="text-xs text-slate-500">Applicant: {selectedApp.applicantName}</p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-500">Loan Type:</span>
                  <div className="font-bold text-slate-900 capitalize">{selectedApp.loanType} Loan</div>
                </div>
                <div>
                  <span className="text-slate-500">Requested Amount:</span>
                  <div className="font-extrabold text-emerald-700">
                    ₹{selectedApp.requestedAmount.toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Interest Rate:</span>
                  <div className="font-bold text-slate-800">{selectedApp.interestRate}% p.a.</div>
                </div>
                <div>
                  <span className="text-slate-500">Tenure:</span>
                  <div className="font-bold text-slate-800">{selectedApp.tenureMonths} Months</div>
                </div>
                <div>
                  <span className="text-slate-500">PAN &amp; Aadhaar:</span>
                  <div className="font-mono text-slate-800">{selectedApp.panCard} / *{selectedApp.aadhaarLast4}</div>
                </div>
                <div>
                  <span className="text-slate-500">Monthly Income:</span>
                  <div className="font-bold text-slate-800">₹{selectedApp.monthlyIncome.toLocaleString('en-IN')}</div>
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-bold block mb-1">Stated Purpose:</span>
                <p className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-700">
                  {selectedApp.purpose}
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Credit Officer Decision Remarks
                </label>
                <textarea
                  value={remarksInput}
                  onChange={(e) => setRemarksInput(e.target.value)}
                  placeholder="e.g. CIBIL score verified at 785. Physical inventory inspected in Trunk Road, Kadapa. Approved."
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedApp.id, 'approved')}
                  className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Approve Loan
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedApp.id, 'under_review')}
                  className="py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5" /> Under Review
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedApp.id, 'rejected')}
                  className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" /> Reject Loan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
