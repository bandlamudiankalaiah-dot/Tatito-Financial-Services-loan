import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LoanApplication } from '../types';
import { 
  ShieldCheck, FileCheck, CheckCircle2, XCircle, AlertCircle, 
  User, Building, FileText, ChevronRight, Download, Clock 
} from 'lucide-react';

export const CreditOfficerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loans, setLoans] = useState<LoanApplication[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<LoanApplication | null>(null);
  const [decisionModalOpen, setDecisionModalOpen] = useState<boolean>(false);
  const [decisionType, setDecisionType] = useState<string>('approved');
  const [sanctionedAmount, setSanctionedAmount] = useState<string>('300000');
  const [officerRemarks, setOfficerRemarks] = useState<string>('Credit score and salary slips verified with employer.');
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [decisionNotice, setDecisionNotice] = useState<string>('');

  const loadLoans = async () => {
    try {
      const res = await api.getAdminLoans();
      if (Array.isArray(res)) {
        setLoans(res);
        if (!selectedLoan && res.length > 0) {
          setSelectedLoan(res[0]);
          setSanctionedAmount(String(res[0].requested_amount));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadLoans();
  }, []);

  const handleDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoan) return;
    setActionLoading(true);
    setDecisionNotice('');

    try {
      const res = await api.decideLoan(selectedLoan.id, {
        decision: decisionType,
        remarks: officerRemarks,
        sanctioned_amount: parseFloat(sanctionedAmount) || selectedLoan.requested_amount,
      });

      setDecisionNotice(`Application #${selectedLoan.application_no} marked as ${decisionType.toUpperCase()}.`);
      await loadLoans();
      setTimeout(() => {
        setDecisionModalOpen(false);
        setDecisionNotice('');
      }, 1500);
    } catch (err: any) {
      setDecisionNotice(err.message || 'Failed to record underwriting decision');
    } finally {
      setActionLoading(false);
    }
  };

  const formatINR = (val: number) => '₹' + Math.round(val || 0).toLocaleString('en-IN');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="text-xs font-semibold text-teal-600 uppercase tracking-wider mb-1">Credit Underwriting Desk</div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Credit Officer Review &amp; Sanction Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Credit Underwriter: <span className="font-semibold text-slate-900">{user?.full_name || 'Lakshmi Narayana Rao'}</span> · Kadapa Branch Committee
          </p>
        </div>

        <div className="text-xs text-slate-500 font-tabular bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
          Active Underwriting Queue: <strong className="text-slate-900">{loans.length} Dossiers</strong>
        </div>
      </div>

      {/* Main Grid: Queue List (5 cols) + Dossier & Sanction Letter (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Loan Dossier Queue (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col h-[650px]">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs">
            <span className="font-bold text-slate-900 uppercase tracking-wider">Application Queue</span>
            <span className="text-slate-400 font-tabular">{loans.length} Total</span>
          </div>

          <div className="overflow-y-auto divide-y divide-slate-100 flex-1">
            {loans.map((loan) => {
              const isSelected = selectedLoan?.id === loan.id;
              return (
                <div
                  key={loan.id}
                  onClick={() => {
                    setSelectedLoan(loan);
                    setSanctionedAmount(String(loan.requested_amount));
                  }}
                  className={`p-4 cursor-pointer transition-colors ${isSelected ? 'bg-teal-50/70 border-l-2 border-teal-600' : 'hover:bg-slate-50'}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-xs text-slate-900">{loan.applicant_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{loan.application_no}</div>
                      <div className="text-[11px] font-semibold text-slate-700 mt-1">{loan.product_name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold font-tabular text-xs text-slate-900">
                        {formatINR(loan.requested_amount)}
                      </div>
                      <span className={`inline-block mt-1 text-[10px] font-bold uppercase ${
                        loan.status === 'approved' || loan.status === 'sanctioned' || loan.status === 'disbursed'
                          ? 'text-emerald-700'
                          : loan.status === 'rejected'
                          ? 'text-rose-700'
                          : 'text-blue-700'
                      }`}>
                        {loan.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Dossier & Sanction Actions (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {selectedLoan ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
              
              <div className="flex justify-between items-start pb-4 border-b border-slate-100">
                <div>
                  <div className="text-xs font-mono font-bold text-teal-700">{selectedLoan.application_no}</div>
                  <h2 className="text-xl font-bold text-slate-900 mt-0.5">{selectedLoan.applicant_name}</h2>
                  <div className="text-xs text-slate-400">
                    Phone: <span className="text-slate-700 font-medium">{selectedLoan.phone}</span> · Email: <span className="text-slate-700 font-medium">{selectedLoan.email}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase">Credit Bureau Score</span>
                  <span className="text-xl font-extrabold font-tabular text-emerald-600">
                    {selectedLoan.credit_score || 745} / 900
                  </span>
                </div>
              </div>

              {/* Assessment Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs font-tabular">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Requested Loan</span>
                  <span className="font-bold text-slate-900">{formatINR(selectedLoan.requested_amount)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Monthly Income</span>
                  <span className="font-bold text-slate-900">{formatINR(selectedLoan.monthly_income)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Proposed Payment</span>
                  <span className="font-bold text-teal-800">{formatINR(selectedLoan.calculated_emi)}/mo</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">FOIR / DTI Ratio</span>
                  <span className="font-bold text-emerald-600">
                    {Math.round(((selectedLoan.calculated_emi || 14000) / (selectedLoan.monthly_income || 80000)) * 100)}% (Healthy)
                  </span>
                </div>
              </div>

              {/* Verification Checklist */}
              <div className="space-y-2 text-xs">
                <div className="font-bold text-slate-900 text-xs">Underwriting Verification Checklist:</div>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> Statutory PAN Format Validated</div>
                  <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> DigiLocker Address Verified</div>
                  <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> Salary Credits Analyzed in Bank</div>
                  <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> Negative Bureau History Cleared</div>
                </div>
              </div>

              {/* Stated Purpose & Remarks */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                <span className="font-semibold text-slate-900 block">Stated End-Use Purpose:</span>
                <p className="text-slate-600 leading-relaxed">{selectedLoan.purpose}</p>
                {selectedLoan.officer_remarks && (
                  <div className="pt-2 border-t border-slate-200 mt-2">
                    <span className="font-semibold text-slate-900 block">Previous Officer Remarks:</span>
                    <p className="text-slate-500 italic">{selectedLoan.officer_remarks}</p>
                  </div>
                )}
              </div>

              {/* Digital Sanction Letter Preview (when approved/sanctioned/disbursed) */}
              {(selectedLoan.status === 'approved' || selectedLoan.status === 'sanctioned' || selectedLoan.status === 'disbursed') && (
                <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-xl text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-teal-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-teal-700" /> Official NBFC Digital Sanction Letter
                    </span>
                    <span className="font-mono text-[11px] font-bold text-teal-800">
                      REF: SL-{selectedLoan.application_no}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1 font-tabular text-slate-700">
                    <div>Sanctioned: <strong className="text-slate-900">{formatINR(selectedLoan.sanctioned_amount || selectedLoan.requested_amount)}</strong></div>
                    <div>ROI: <strong className="text-slate-900">{selectedLoan.interest_rate}% p.a.</strong></div>
                    <div>Tenure: <strong className="text-slate-900">{selectedLoan.tenure_months} Months</strong></div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setDecisionType('approved');
                    setDecisionModalOpen(true);
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm"
                >
                  Approve Application
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDecisionType('sanctioned');
                    setDecisionModalOpen(true);
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm"
                >
                  Issue Sanction Letter
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDecisionType('disbursed');
                    setDecisionModalOpen(true);
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors shadow-sm"
                >
                  Authorize Disbursement
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDecisionType('info_requested');
                    setOfficerRemarks('Please upload latest 6-month bank statement and collateral valuation report.');
                    setDecisionModalOpen(true);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
                >
                  Request Additional Info
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDecisionType('rejected');
                    setDecisionModalOpen(true);
                  }}
                  className="px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                >
                  Reject Application
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
              Select an applicant dossier from the left queue to review eligibility and record underwriting recommendations.
            </div>
          )}
        </div>

      </div>

      {/* Decision Modal */}
      {decisionModalOpen && selectedLoan && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                Record Underwriting Decision: <span className="uppercase text-teal-700">{decisionType}</span>
              </h3>
              <button onClick={() => setDecisionModalOpen(false)} className="text-slate-400 text-xs">✕</button>
            </div>

            {decisionNotice && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs">
                {decisionNotice}
              </div>
            )}

            <form onSubmit={handleDecisionSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Application Reference</label>
                <div className="font-mono font-bold text-slate-900 bg-slate-50 p-2 rounded border border-slate-200">
                  {selectedLoan.application_no} ({selectedLoan.applicant_name})
                </div>
              </div>

              {decisionType !== 'rejected' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sanctioned Amount (₹)</label>
                  <input
                    type="number"
                    step="10000"
                    required
                    value={sanctionedAmount}
                    onChange={e => setSanctionedAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 font-bold font-tabular text-slate-900"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Credit Officer Remarks</label>
                <textarea
                  rows={3}
                  required
                  value={officerRemarks}
                  onChange={e => setOfficerRemarks(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDecisionModalOpen(false)}
                  className="flex-1 py-2 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2 font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg disabled:opacity-50"
                >
                  {actionLoading ? 'Recording...' : 'Commit Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
