import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AgentLead } from '../types';
import { 
  Users, UserCheck, Plus, CheckCircle2, TrendingUp, 
  Award, FileText, Phone, Mail, MapPin, AlertCircle 
} from 'lucide-react';

export const AgentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<AgentLead[]>([]);
  const [commissions, setCommissions] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  const [leadForm, setLeadForm] = useState({
    applicant_name: '',
    phone: '',
    email: '',
    loan_product: 'Business Loan',
    requested_amount: '500000',
    location: 'Kadapa',
    notes: 'Retail store inventory financing referral',
  });

  const loadAgentData = async () => {
    try {
      const [leadsData, commData] = await Promise.all([
        api.getAgentLeads(),
        api.getAgentCommissions(),
      ]);
      if (Array.isArray(leadsData)) setLeads(leadsData);
      setCommissions(commData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadAgentData();
  }, []);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg('');
    try {
      const res = await api.createAgentLead({
        ...leadForm,
        requested_amount: parseFloat(leadForm.requested_amount),
      });
      setSuccessMsg(`Lead for ${leadForm.applicant_name} registered successfully. Estimated commission: ₹${res.lead.commission_amount || '5,000'}.`);
      await loadAgentData();
      setTimeout(() => {
        setModalOpen(false);
        setSuccessMsg('');
        setLeadForm({
          applicant_name: '',
          phone: '',
          email: '',
          loan_product: 'Business Loan',
          requested_amount: '500000',
          location: 'Kadapa',
          notes: '',
        });
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Failed to submit lead');
    } finally {
      setSubmitting(false);
    }
  };

  const formatINR = (val: number) => '₹' + Math.round(val || 0).toLocaleString('en-IN');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="text-xs font-semibold text-teal-600 uppercase tracking-wider mb-1">Channel Partner Portal</div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Direct Selling Agent (DSA) Partner Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Partner Code: <span className="font-mono font-bold text-slate-900">TF-DSA-042</span> · Assigned Hub: Kadapa &amp; Rayalaseema
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4 text-teal-400" />
          <span>Register Borrower Lead</span>
        </button>
      </div>

      {/* Commission KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Leads Logged</span>
          <div className="text-2xl font-bold font-tabular text-slate-900">{leads.length} Applicants</div>
          <div className="text-xs text-teal-600 font-medium pt-1">Active Pipeline</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Referred Loan Volume</span>
          <div className="text-2xl font-bold font-tabular text-slate-900">
            {formatINR(commissions?.total_referred_volume || 3850000)}
          </div>
          <div className="text-xs text-slate-400 pt-1">Kadapa Regional Area</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Earned Commissions</span>
          <div className="text-2xl font-bold font-tabular text-teal-800">
            {formatINR(commissions?.total_commission_earned || 46250)}
          </div>
          <div className="text-xs text-emerald-600 font-medium pt-1">Slab: Tier-2 (1.25%)</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Conversion Ratio</span>
          <div className="text-2xl font-bold font-tabular text-slate-900">78.5%</div>
          <div className="text-xs text-slate-400 pt-1">Approved &amp; Disbursed</div>
        </div>
      </div>

      {/* Commission Tier Slabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-slate-900 uppercase tracking-wider">DSA Commission Slabs Schedule</span>
          <span className="text-teal-700 font-semibold">Prompt Monthly Payouts</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-tabular">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[10px]">Tier 1 (&lt; ₹15 Lakhs)</span>
            <span className="font-bold text-slate-900 text-sm">0.75% Payout</span>
          </div>
          <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl">
            <span className="text-teal-700 block text-[10px] font-semibold">Tier 2 (₹15L - ₹50L) [Active]</span>
            <span className="font-bold text-teal-900 text-sm">1.25% Payout</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[10px]">Tier 3 (₹50L - ₹1 Crore)</span>
            <span className="font-bold text-slate-900 text-sm">1.35% Payout</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[10px]">Super Partner (&gt; ₹1 Crore)</span>
            <span className="font-bold text-slate-900 text-sm">1.50% Payout</span>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Registered Borrower Pipeline</h2>
            <p className="text-xs text-slate-500">Track loan sanction progress and accrued commission on each referral.</p>
          </div>
          <span className="text-xs font-tabular text-slate-400">{leads.length} Total Leads</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-2.5 px-3">Applicant Name</th>
                <th className="py-2.5 px-3">Product</th>
                <th className="py-2.5 px-3 text-right">Requested Amount</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3 text-right">Commission Rate</th>
                <th className="py-2.5 px-3 text-right">Estimated Payout</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-tabular text-slate-700">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900">{lead.applicant_name}</div>
                    <div className="text-[10px] text-slate-400">{lead.phone} · {lead.email}</div>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-800">{lead.loan_product}</td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900">{formatINR(lead.requested_amount)}</td>
                  <td className="py-3 px-3">{lead.location}</td>
                  <td className="py-3 px-3 text-right">{lead.commission_rate_pct}%</td>
                  <td className="py-3 px-3 text-right font-bold text-teal-800">
                    {formatINR((lead.requested_amount * lead.commission_rate_pct) / 100)}
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded capitalize">
                      {lead.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal to Register Lead */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Register New Borrower Referral</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 text-xs">✕</button>
            </div>

            {successMsg && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleCreateLead} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Borrower Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Venkat Reddy"
                  value={leadForm.applicant_name}
                  onChange={e => setLeadForm({ ...leadForm, applicant_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile Phone</label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile"
                    value={leadForm.phone}
                    onChange={e => setLeadForm({ ...leadForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="borrower@example.com"
                    value={leadForm.email}
                    onChange={e => setLeadForm({ ...leadForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Loan Product</label>
                  <select
                    value={leadForm.loan_product}
                    onChange={e => setLeadForm({ ...leadForm, loan_product: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    <option>Business Loan</option>
                    <option>Personal Loan</option>
                    <option>Home Loan</option>
                    <option>Gold Loan</option>
                    <option>Loan Against Property</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Requested Amount (₹)</label>
                  <input
                    type="number"
                    required
                    step="25000"
                    value={leadForm.requested_amount}
                    onChange={e => setLeadForm({ ...leadForm, requested_amount: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 font-tabular font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Location / Town</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kadapa, Proddatur, Pulivendula"
                  value={leadForm.location}
                  onChange={e => setLeadForm({ ...leadForm, location: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg disabled:opacity-50"
                >
                  {submitting ? 'Registering...' : 'Submit Referral'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
