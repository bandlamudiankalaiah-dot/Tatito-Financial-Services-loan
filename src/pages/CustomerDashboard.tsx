import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  LoanApplication, PortfolioSummary, StockHolding, 
  NotificationItem, DematAccount 
} from '../types';
import { 
  Wallet, TrendingUp, CreditCard, Clock, CheckCircle2, 
  ArrowUpRight, ArrowRight, ShieldCheck, AlertCircle, Plus, 
  FileText, Landmark, RefreshCw 
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip 
} from 'recharts';

export const CustomerDashboard: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [activeLoans, setActiveLoans] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [demat, setDemat] = useState<DematAccount | null>(null);
  const [payingEmiId, setPayingEmiId] = useState<number | null>(null);
  const [emiNotice, setEmiNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadDashboardData = async () => {
    try {
      const [apps, accounts, port, notifs, dematData] = await Promise.all([
        api.getMyApplications(),
        api.getMyAccounts(),
        api.getPortfolio(),
        api.getNotifications(),
        api.getDemat(),
      ]);
      if (Array.isArray(apps)) setApplications(apps);
      if (Array.isArray(accounts)) setActiveLoans(accounts);
      setPortfolio(port);
      if (Array.isArray(notifs)) setNotifications(notifs.slice(0, 5));
      setDemat(dematData);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handlePayEmi = async (loan: any) => {
    setPayingEmiId(loan.id);
    setEmiNotice(null);
    try {
      const res = await api.payLoanEmi({
        application_id: loan.id,
        loan_account_no: loan.loan_account_no,
        amount: loan.monthly_emi || 22100,
        payment_mode: 'wallet',
      });
      setEmiNotice({
        type: 'success',
        text: `Paid ₹${(loan.monthly_emi || 22100).toLocaleString('en-IN')} toward ${loan.loan_account_no}. Status: ${res.status}.`
      });
      await loadDashboardData();
      await refreshUser();
    } catch (err: any) {
      setEmiNotice({
        type: 'error',
        text: err.message || 'Payment failed. Please verify wallet balance.'
      });
    } finally {
      setPayingEmiId(null);
    }
  };

  const allocationData = [
    { name: 'Equities', value: portfolio?.allocation?.equity || 135451, color: '#0D9488' },
    { name: 'Mutual Funds', value: portfolio?.allocation?.mutual_fund || 171810, color: '#1E3A8A' },
    { name: 'Gold ETF', value: portfolio?.allocation?.gold_etf || 102675, color: '#D97706' },
    { name: 'Bonds', value: portfolio?.allocation?.sovereign_bond || 50700, color: '#475569' },
  ];

  const totalNetWorth = (user?.wallet_balance || 24850) + (portfolio?.current_valuation || 460636);
  const formatINR = (val: number) => '₹' + Math.round(val).toLocaleString('en-IN');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="text-xs font-semibold text-teal-600 uppercase tracking-wider mb-1">Customer Overview</div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome, {user?.full_name || 'Ramesh Kumar'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Kadapa Central Branch · Demat Client Code: <span className="font-mono font-semibold text-slate-700">{demat?.client_code || 'TT-KDP-89104'}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/loan-application"
            className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Apply New Loan</span>
          </Link>
          <Link
            to="/stocks"
            className="px-4 py-2 text-xs font-bold text-teal-900 bg-teal-100 hover:bg-teal-200 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <TrendingUp className="w-4 h-4 text-teal-700" />
            <span>Trade Equities</span>
          </Link>
        </div>
      </div>

      {emiNotice && (
        <div className={`p-4 rounded-xl text-xs flex items-center gap-2 ${emiNotice.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
          {emiNotice.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />}
          <span>{emiNotice.text}</span>
        </div>
      )}

      {/* 4 Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Total Net Worth */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Financial Worth</span>
          <div className="text-2xl font-bold font-tabular text-slate-900">
            {formatINR(totalNetWorth)}
          </div>
          <div className="text-xs text-teal-600 font-medium pt-1">
            Wallet + Investment Portfolio
          </div>
        </div>

        {/* Card 2: Wallet Balance */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Trading Wallet Cash</span>
          <div className="text-2xl font-bold font-tabular text-teal-800">
            {formatINR(user?.wallet_balance || 24850)}
          </div>
          <div className="text-xs text-slate-400 pt-1">
            Available for EMIs &amp; Equities
          </div>
        </div>

        {/* Card 3: Wealth Portfolio */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Invested Capital</span>
          <div className="text-2xl font-bold font-tabular text-slate-900">
            {formatINR(portfolio?.current_valuation || 460636)}
          </div>
          <div className="text-xs text-emerald-600 font-medium flex items-center gap-0.5 pt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+{portfolio?.returns_percentage || 9.7}% Unrealized Gain</span>
          </div>
        </div>

        {/* Card 4: Active Borrowings */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Loan Accounts</span>
          <div className="text-2xl font-bold font-tabular text-slate-900">
            {activeLoans.length} Loans
          </div>
          <div className="text-xs text-slate-400 pt-1">
            Next EMI Due: ₹22,100
          </div>
        </div>

      </div>

      {/* Main Grid: Left Active Loans & Repayments (7 Cols) + Right Wealth Allocation (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Active Loans & Status Tracker (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Active Loans & EMI Repayments */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Active Loan Repayment Tracker</h2>
                <p className="text-xs text-slate-500">Pay monthly EMIs directly using your authenticated wallet balance.</p>
              </div>
              <Link to="/loans" className="text-xs font-bold text-teal-700 hover:underline">
                Explore More Loans →
              </Link>
            </div>

            <div className="space-y-4">
              {activeLoans.map((loan) => (
                <div 
                  key={loan.id}
                  className="p-5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{loan.product_name}</span>
                      <span className="font-mono text-[11px] text-slate-400">{loan.loan_account_no}</span>
                    </div>
                    <div className="text-slate-500">
                      Sanctioned: <strong className="text-slate-900 font-tabular">{formatINR(loan.sanctioned_amount)}</strong> @ {loan.interest_rate}% p.a.
                    </div>
                    <div className="text-slate-500">
                      Next Due: <strong className="text-slate-900 font-tabular">{loan.next_due_date || '2026-11-20'}</strong> · Tenure: {loan.tenure_months}M
                    </div>
                  </div>

                  <div className="text-right w-full sm:w-auto flex sm:flex-col justify-between items-end gap-2">
                    <div className="text-base font-bold font-tabular text-slate-900">
                      {formatINR(loan.monthly_emi || 22100)}<span className="text-xs text-slate-400 font-normal">/mo</span>
                    </div>
                    <button
                      type="button"
                      disabled={payingEmiId === loan.id}
                      onClick={() => handlePayEmi(loan)}
                      className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                    >
                      {payingEmiId === loan.id ? 'Processing...' : 'Pay EMI Now'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submitted Applications Workflow Tracker */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Application Pipeline Status</h2>
                <p className="text-xs text-slate-500">Real-time status updates through credit review and sanction.</p>
              </div>
              <span className="text-xs font-tabular text-slate-400">{applications.length} Submitted</span>
            </div>

            <div className="space-y-3">
              {applications.slice(0, 5).map((app) => (
                <div 
                  key={app.id || app.application_no}
                  className="p-4 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{app.application_no}</span>
                      <span className="text-slate-400">·</span>
                      <span className="font-semibold text-slate-700">{app.product_name || 'Personal Loan'}</span>
                    </div>
                    <div className="text-slate-500 font-tabular">
                      Requested: <strong>{formatINR(app.requested_amount)}</strong> for {app.tenure_months}M
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                      app.status === 'approved' || app.status === 'sanctioned' || app.status === 'disbursed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : app.status === 'rejected'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {app.status.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(app.created_at).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Portfolio Allocation & Notifications (5 cols) */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Asset Allocation Chart Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold text-slate-900">Multi-Asset Allocation</h2>
              <Link to="/investments" className="text-xs font-semibold text-teal-700 hover:underline">
                Manage Portfolio →
              </Link>
            </div>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val: any) => [formatINR(Number(val)), 'Valuation']}
                    contentStyle={{ borderRadius: '8px', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs border-t border-slate-100 pt-4">
              {allocationData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <div>
                    <span className="text-[10px] text-slate-400 block">{item.name}</span>
                    <span className="font-bold font-tabular text-slate-900">{formatINR(item.value)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Notifications */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-sm">Recent Alerts &amp; Activity</h3>
              <Link to="/notifications" className="text-xs font-semibold text-teal-700 hover:underline">
                View All
              </Link>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {notifications.map((n) => (
                <div key={n.id} className="py-2.5 space-y-1">
                  <div className="font-semibold text-slate-900">{n.title}</div>
                  <div className="text-slate-500 text-[11px] leading-relaxed">{n.message}</div>
                  <div className="text-[10px] text-slate-400 font-tabular">
                    {new Date(n.created_at).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
