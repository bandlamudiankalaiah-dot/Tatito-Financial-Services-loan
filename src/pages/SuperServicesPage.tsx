import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Gift, PieChart as PieIcon, Shield, HeartPulse, Coins, Plane, Store,
  HelpCircle, CheckCircle2, AlertCircle, Users, Plus, Award
} from 'lucide-react';

const formatINR = (n: number) => '₹' + Math.round(Number(n || 0)).toLocaleString('en-IN');

export const SuperServicesPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'rewards';

  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Module States
  const [rewards, setRewards] = useState<any>(null);
  const [expenses, setExpenses] = useState<any>(null);
  const [creditProfile, setCreditProfile] = useState<any>(null);
  const [insurance, setInsurance] = useState<any>(null);
  const [gold, setGold] = useState<any>(null);
  const [travel, setTravel] = useState<any>(null);
  const [merchant, setMerchant] = useState<any>(null);
  const [support, setSupport] = useState<any>(null);

  // Forms
  const [expTitle, setExpTitle] = useState('');
  const [expCat, setExpCat] = useState('Food & Groceries');
  const [expAmt, setExpAmt] = useState('850');

  const [grpName, setGrpName] = useState('');
  const [grpMembers, setGrpMembers] = useState('Ramesh Kumar, Suresh Reddy, Kiran Naidu');
  const [grpExpTitle, setGrpExpTitle] = useState('Shared Dinner & Cab');
  const [grpExpAmt, setGrpExpAmt] = useState('2400');

  const [goldTxType, setGoldTxType] = useState<'BUY' | 'SELL'>('BUY');
  const [goldAmtInr, setGoldAmtInr] = useState('2000');

  const [travelRouteId, setTravelRouteId] = useState('trv-1');
  const [travelDate, setTravelDate] = useState('2026-11-28');
  const [travelPax, setTravelPax] = useState('1');

  const [merchBusinessName, setMerchBusinessName] = useState('Rayalaseema Agro & Retail Mart');
  const [merchCat, setMerchCat] = useState('Retail & Kirana Supermarket');
  const [merchGstin, setMerchGstin] = useState('37AABCR9102F1Z8');

  const [ticketCat, setTicketCat] = useState('Payment Dispute');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketRef, setTicketRef] = useState('');

  const loadData = async () => {
    try {
      const [insData, trvData] = await Promise.all([
        api.getInsurance(),
        api.getTravel()
      ]);
      setInsurance(insData);
      setTravel(trvData);

      if (isAuthenticated) {
        const [rw, exp, cred, gld, mch, sup] = await Promise.all([
          api.getRewards(),
          api.getExpenses(),
          api.getCreditProfile(),
          api.getDigitalGold(),
          api.getMerchants(),
          api.getSupportTickets()
        ]);
        setRewards(rw);
        setExpenses(exp);
        setCreditProfile(cred);
        setGold(gld);
        setMerchant(mch);
        setSupport(sup);
      }
    } catch (err) {
      console.error('Error loading SuperServicesPage:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAuthenticated]);

  const switchTab = (tab: string) => {
    setSearchParams({ tab });
    setNotice(null);
  };

  const handleRedeemVoucher = async (v: any) => {
    try {
      const res = await api.redeemReward({
        voucher_id: v.id,
        points_cost: v.points_cost,
        value: v.value,
        title: `Redeemed: ${v.brand}`
      });
      setNotice({ type: 'success', text: `Redeemed ${v.brand}! Remaining balance: ${res.points_balance} pts.` });
      await loadData();
    } catch (err: any) {
      setNotice({ type: 'error', text: err.message });
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle) return;
    try {
      await api.addExpense({
        title: expTitle,
        category: expCat,
        amount: parseFloat(expAmt) || 500,
        mode: 'Manual Entry'
      });
      setExpTitle('');
      setNotice({ type: 'success', text: 'Expense logged and category budget updated.' });
      await loadData();
    } catch (err: any) {
      setNotice({ type: 'error', text: err.message });
    }
  };

  const handleCreateGroupSplit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grpName) return;
    try {
      await api.createExpenseGroup({
        group_name: grpName,
        members: grpMembers,
        expense_title: grpExpTitle,
        total_amount: parseFloat(grpExpAmt) || 1200,
        paid_by: user?.full_name || 'Ramesh Kumar',
        split_type: 'EQUAL'
      });
      setGrpName('');
      setNotice({ type: 'success', text: 'Shared expense group created with equal per-person split.' });
      await loadData();
    } catch (err: any) {
      setNotice({ type: 'error', text: err.message });
    }
  };

  const handleSettleSplit = async (groupId: string, expenseId: string) => {
    try {
      await api.settleGroupExpense({ group_id: groupId, expense_id: expenseId });
      setNotice({ type: 'success', text: 'Group split marked as SETTLED.' });
      await loadData();
    } catch (err: any) {
      setNotice({ type: 'error', text: err.message });
    }
  };

  const handleApplyInsurance = async (productCode: string, planName: string) => {
    if (!isAuthenticated) {
      setNotice({ type: 'error', text: 'Please log in to submit an insurance proposal.' });
      return;
    }
    try {
      const res = await api.applyInsurance({
        product_code: productCode,
        insured_name: user?.full_name || 'Ramesh Kumar'
      });
      setNotice({ type: 'success', text: `Sandbox Proposal Issued for ${planName} (${res.policy.policy_ref}).` });
      await loadData();
    } catch (err: any) {
      setNotice({ type: 'error', text: err.message });
    }
  };

  const handleGoldTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.tradeDigitalGold({
        tx_type: goldTxType,
        amount_inr: parseFloat(goldAmtInr) || 1000
      });
      setNotice({
        type: 'success',
        text: `${goldTxType} order executed (${res.transaction.grams}g @ ₹${res.transaction.rate_per_gram}/g). Ref: ${res.transaction.reference_no}`
      });
      await loadData();
    } catch (err: any) {
      setNotice({ type: 'error', text: err.message });
    }
  };

  const handleBookTravel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setNotice({ type: 'error', text: 'Please log in to book tickets.' });
      return;
    }
    try {
      const res = await api.bookTravel({
        route_id: travelRouteId,
        travel_date: travelDate,
        passengers: parseInt(travelPax, 10) || 1
      });
      setNotice({ type: 'success', text: `Ticket booked! PNR: ${res.booking.pnr_reference} (${res.booking.operator_name}).` });
      await loadData();
    } catch (err: any) {
      setNotice({ type: 'error', text: err.message });
    }
  };

  const handleCancelBooking = async (id: string) => {
    try {
      await api.cancelTravelBooking(id);
      setNotice({ type: 'success', text: 'Booking cancelled and sandbox refund initiated.' });
      await loadData();
    } catch (err: any) {
      setNotice({ type: 'error', text: err.message });
    }
  };

  const handleUpdateMerchant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.registerMerchant({
        business_name: merchBusinessName,
        category: merchCat,
        gstin: merchGstin
      });
      setNotice({ type: 'success', text: 'Merchant profile & QR configuration updated.' });
      await loadData();
    } catch (err: any) {
      setNotice({ type: 'error', text: err.message });
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketDesc) return;
    try {
      const res = await api.createSupportTicket({
        category: ticketCat,
        subject: ticketSubject,
        description: ticketDesc,
        transaction_ref: ticketRef
      });
      setTicketSubject('');
      setTicketDesc('');
      setTicketRef('');
      setNotice({ type: 'success', text: `Support ticket ${res.ticket.ticket_no} created.` });
      await loadData();
    } catch (err: any) {
      setNotice({ type: 'error', text: err.message });
    }
  };

  const tabs = [
    { id: 'rewards', label: 'Rewards & Referrals', icon: Gift },
    { id: 'expenses', label: 'Expenses & Split Bills', icon: PieIcon },
    { id: 'credit', label: 'Credit Profile', icon: Shield },
    { id: 'insurance', label: 'Insurance (5)', icon: HeartPulse },
    { id: 'gold', label: '24K Digital Gold', icon: Coins },
    { id: 'travel', label: 'Travel & Transit', icon: Plane },
    { id: 'merchant', label: 'Merchant Portal', icon: Store },
    { id: 'support', label: 'Help & Disputes', icon: HelpCircle },
  ];

  return (
    <div className="max-w-[1100px] mx-auto px-[18px] pt-[22px] pb-[72px] space-y-6">
      
      {/* Header Banner */}
      <div className="bg-[var(--ac)] text-[var(--ai)] rounded-[22px] p-6 sm:p-7 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="text-xs font-bold text-[var(--ac2)] uppercase tracking-wider mb-1">
            TATITO SUPER-APP 2.0 · FINANCIAL LIFESTYLE &amp; MERCHANT SUITE
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold m-0">
            Rewards, PFM, Insurance, Gold, Travel &amp; Merchant Hub
          </h1>
          <p className="text-xs sm:text-sm text-white/85 mt-1 m-0">
            All lifestyle, insurance, bullion, and travel modules operate with transparent sandbox disclosures.
          </p>
        </div>

        <Link
          to="/payments"
          className="bg-[var(--ac2)] text-[#2a1d00] px-4 py-2.5 rounded-[10px] font-semibold text-xs sm:text-sm whitespace-nowrap"
        >
          Go to UPI &amp; Bills Hub →
        </Link>
      </div>

      {/* Module Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          const on = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => switchTab(t.id)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] text-xs sm:text-sm font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                on
                  ? 'bg-[var(--ac)] text-[var(--ai)]'
                  : 'bg-[var(--card)] text-[var(--ink)] border border-[var(--line)] hover:border-[var(--ac)]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {notice && (
        <div
          className={`p-3.5 rounded-xl border text-xs sm:text-sm flex items-center justify-between gap-2 ${
            notice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {notice.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{notice.text}</span>
          </div>
          <button type="button" onClick={() => setNotice(null)} className="text-xs underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* 1. REWARDS, CASHBACK & REFERRALS */}
      {activeTab === 'rewards' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[var(--card)] border border-[var(--line)] rounded-[14px] p-5">
              <div className="text-xs text-[var(--mut)]">Available Reward Points</div>
              <div className="text-2xl font-extrabold font-tabular text-[var(--ink)] mt-1">
                {rewards?.points ?? 1450} pts
              </div>
              <div className="text-xs text-[var(--lt)] font-semibold mt-1">10 Points = ₹1 Sandbox Value</div>
            </div>
            <div className="bg-[var(--card)] border border-[var(--line)] rounded-[14px] p-5">
              <div className="text-xs text-[var(--mut)]">Lifetime Cashback Earned</div>
              <div className="text-2xl font-extrabold font-tabular text-[var(--ink)] mt-1">
                {formatINR(rewards?.lifetimeCashback ?? 540)}
              </div>
              <div className="text-xs text-[var(--mut)] mt-1">Credited across utility &amp; EMI payments</div>
            </div>
            <div className="bg-[var(--card)] border border-[var(--line)] rounded-[14px] p-5">
              <div className="text-xs text-[var(--mut)]">Your Referral Code</div>
              <div className="text-xl font-extrabold font-mono text-[var(--lt)] mt-1">
                {rewards?.referralCode || 'TATITO-KDP-2026'}
              </div>
              <div className="text-xs text-[var(--mut)] mt-1">Earn 250 pts per verified friend</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-[var(--card)] border border-[var(--line)] rounded-[16px] p-5 space-y-3">
              <h2 className="text-base font-bold text-[var(--ink)] m-0">Redeem Points for Vouchers &amp; Cashback</h2>
              {(rewards?.vouchers || []).map((v: any) => (
                <div
                  key={v.id}
                  className="p-3.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="font-bold text-sm text-[var(--ink)]">{v.brand}</div>
                    <div className="text-xs text-[var(--mut)]">
                      Value: {formatINR(v.value)} · Cost: <strong>{v.points_cost} pts</strong> · Expiry: {v.expiry}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRedeemVoucher(v)}
                    className="px-3 py-1.5 rounded-lg bg-[var(--ac)] text-[var(--ai)] text-xs font-semibold cursor-pointer whitespace-nowrap"
                  >
                    Redeem
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-[var(--card)] border border-[var(--line)] rounded-[16px] p-5 space-y-3">
              <h2 className="text-base font-bold text-[var(--ink)] m-0">Active Promotional Campaigns</h2>
              {(rewards?.campaigns || []).map((c: any) => (
                <div key={c.id} className="p-3.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[var(--ink)]">{c.title}</span>
                    <span className="font-mono text-xs font-bold text-[var(--lt)]">{c.code}</span>
                  </div>
                  <p className="text-xs text-[var(--mut)] m-0">{c.rule}</p>
                  <div className="text-[11px] text-[var(--mut)]">
                    Valid till {c.valid_until} · {c.terms}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. EXPENSE TRACKER & SPLIT EXPENSES */}
      {activeTab === 'expenses' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[var(--card)] border border-[var(--line)] rounded-[14px] p-5">
              <div className="text-xs text-[var(--mut)]">Monthly Verified Income</div>
              <div className="text-2xl font-extrabold font-tabular text-[var(--ink)] mt-1">
                {formatINR(expenses?.monthly_income ?? 85000)}
              </div>
            </div>
            <div className="bg-[var(--card)] border border-[var(--line)] rounded-[14px] p-5">
              <div className="text-xs text-[var(--mut)]">Monthly Tracked Expenses</div>
              <div className="text-2xl font-extrabold font-tabular text-[var(--ink)] mt-1">
                {formatINR(expenses?.total_spent ?? 47090)}
              </div>
            </div>
            <div className="bg-[var(--card)] border border-[var(--line)] rounded-[14px] p-5">
              <div className="text-xs text-[var(--mut)]">Net Monthly Savings Surplus</div>
              <div className="text-2xl font-extrabold font-tabular text-[var(--lt)] mt-1">
                {formatINR(expenses?.savings_surplus ?? 37910)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Personal Expense Logger & Budgets */}
            <div className="lg:col-span-6 bg-[var(--card)] border border-[var(--line)] rounded-[16px] p-5 space-y-4">
              <h2 className="text-base font-bold text-[var(--ink)] m-0">Category Budgets &amp; Manual Expense Logger</h2>
              <div className="space-y-2.5">
                {(expenses?.budgets || []).map((b: any) => {
                  const pct = Math.min(100, Math.round((b.spent / b.limit) * 100));
                  return (
                    <div key={b.category} className="space-y-1 text-xs">
                      <div className="flex justify-between font-medium text-[var(--ink)]">
                        <span>{b.category}</span>
                        <span className="font-tabular">
                          {formatINR(b.spent)} / {formatINR(b.limit)} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[var(--bg)] overflow-hidden">
                        <div className="h-full bg-[var(--ac)]" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={handleAddExpense} className="pt-3 border-t border-[var(--line)] space-y-3">
                <div className="text-xs font-bold text-[var(--ink)]">Log New Manual Expense</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Expense description"
                    value={expTitle}
                    onChange={(e) => setExpTitle(e.target.value)}
                    className="px-3 py-2 rounded-[10px] border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] text-xs"
                  />
                  <select
                    value={expCat}
                    onChange={(e) => setExpCat(e.target.value)}
                    className="px-3 py-2 rounded-[10px] border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] text-xs"
                  >
                    <option>Food &amp; Groceries</option>
                    <option>Utilities &amp; Bills</option>
                    <option>Travel &amp; Fuel</option>
                    <option>Loan EMIs</option>
                    <option>Investments &amp; SIP</option>
                  </select>
                  <input
                    type="number"
                    min="10"
                    required
                    placeholder="Amount ₹"
                    value={expAmt}
                    onChange={(e) => setExpAmt(e.target.value)}
                    className="px-3 py-2 rounded-[10px] border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] text-xs font-tabular"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 px-4 rounded-[10px] bg-[var(--ac)] text-[var(--ai)] font-semibold text-xs cursor-pointer"
                >
                  + Add Expense to Tracker
                </button>
              </form>
            </div>

            {/* Split Expenses with Friends / Group */}
            <div className="lg:col-span-6 bg-[var(--card)] border border-[var(--line)] rounded-[16px] p-5 space-y-4">
              <h2 className="text-base font-bold text-[var(--ink)] m-0">Split Expenses (Group Bills)</h2>
              <div className="space-y-3">
                {(expenses?.groups || []).map((g: any) => (
                  <div key={g.id} className="p-3.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] space-y-2">
                    <div className="font-bold text-sm text-[var(--ink)]">{g.name}</div>
                    <div className="text-xs text-[var(--mut)]">
                      Members ({g.members?.length}): {(g.members || []).join(', ')}
                    </div>
                    {(g.expenses || []).map((ge: any) => (
                      <div
                        key={ge.id}
                        className="p-2.5 rounded-lg bg-[var(--card)] border border-[var(--line)] flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-semibold text-[var(--ink)]">{ge.title}</div>
                          <div className="text-[var(--mut)] font-tabular">
                            Total {formatINR(ge.total_amount)} · Paid by {ge.paid_by} · Each owes <strong>{formatINR(ge.per_person)}</strong>
                          </div>
                        </div>
                        {ge.status === 'OPEN' ? (
                          <button
                            type="button"
                            onClick={() => handleSettleSplit(g.id, ge.id)}
                            className="px-2.5 py-1 rounded bg-[var(--ac)] text-[var(--ai)] text-[11px] font-semibold cursor-pointer"
                          >
                            Mark Settled
                          </button>
                        ) : (
                          <span className="text-[11px] font-bold text-[var(--lt)]">SETTLED</span>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <form onSubmit={handleCreateGroupSplit} className="pt-3 border-t border-[var(--line)] space-y-2.5">
                <div className="text-xs font-bold text-[var(--ink)]">Create New Group &amp; Split Bill Equally</div>
                <input
                  type="text"
                  required
                  placeholder="Group Name (e.g. Office Lunch or Flatmates)"
                  value={grpName}
                  onChange={(e) => setGrpName(e.target.value)}
                  className="w-full px-3 py-2 rounded-[10px] border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] text-xs"
                />
                <input
                  type="text"
                  required
                  placeholder="Comma-separated member names"
                  value={grpMembers}
                  onChange={(e) => setGrpMembers(e.target.value)}
                  className="w-full px-3 py-2 rounded-[10px] border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] text-xs"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Expense Title"
                    value={grpExpTitle}
                    onChange={(e) => setGrpExpTitle(e.target.value)}
                    className="px-3 py-2 rounded-[10px] border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] text-xs"
                  />
                  <input
                    type="number"
                    min="10"
                    required
                    placeholder="Total Amount ₹"
                    value={grpExpAmt}
                    onChange={(e) => setGrpExpAmt(e.target.value)}
                    className="px-3 py-2 rounded-[10px] border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] text-xs font-tabular"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 px-4 rounded-[10px] bg-[var(--ac)] text-[var(--ai)] font-semibold text-xs cursor-pointer"
                >
                  Create Group &amp; Split Bill
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 3. CREDIT & FINANCIAL PROFILE */}
      {activeTab === 'credit' && (
        <div className="bg-[var(--card)] border border-[var(--line)] rounded-[16px] p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] pb-4">
            <div>
              <h2 className="text-lg font-bold text-[var(--ink)] m-0">Credit &amp; Financial Eligibility Profile</h2>
              <p className="text-xs text-[var(--mut)] m-0">
                Bureau Status: <strong>{creditProfile?.bureau_status || 'SANDBOX_SIMULATED'}</strong>
              </p>
            </div>
            <Link to="/emi-calculator" className="text-xs font-semibold text-[var(--lt)] hover:underline">
              Open EMI Calculator →
            </Link>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-xs text-[var(--mut)]">
            {creditProfile?.disclaimer ||
              'Tatito does not invent live statutory credit scores or promise loan approval. Bureau pulls require licensed NBFC credentials and explicit customer consent.'}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--line)]">
              <div className="text-xs text-[var(--mut)]">Illustrative Sandbox Band</div>
              <div className="text-lg font-extrabold text-[var(--lt)] mt-1">
                {creditProfile?.indicative_band || '740 - 780 (Sandbox)'}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--line)]">
              <div className="text-xs text-[var(--mut)]">Debt-to-Income (FOIR)</div>
              <div className="text-lg font-extrabold font-tabular text-[var(--ink)] mt-1">
                {creditProfile?.foir_percentage ?? 26}%
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--line)]">
              <div className="text-xs text-[var(--mut)]">Additional Monthly EMI Capacity</div>
              <div className="text-lg font-extrabold font-tabular text-[var(--ink)] mt-1">
                {formatINR(creditProfile?.max_additional_emi_capacity ?? 20400)}/mo
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--line)]">
              <div className="text-xs text-[var(--mut)]">Repayment Track Record</div>
              <div className="text-lg font-extrabold text-[var(--lt)] mt-1">100% On-Time</div>
            </div>
          </div>
        </div>
      )}

      {/* 4. INSURANCE MARKETPLACE */}
      {activeTab === 'insurance' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-[var(--card)] border border-[var(--line)] text-xs text-[var(--mut)]">
            {insurance?.disclaimer ||
              'Insurance plans shown are sandbox illustrations. Actual policy issuance requires an IRDAI-authorized partner.'}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(insurance?.products || []).map((p: any) => (
              <div
                key={p.id}
                className="bg-[var(--card)] border border-[var(--line)] rounded-[16px] p-5 flex flex-col justify-between gap-3"
              >
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-[var(--lt)]">{p.category} · {p.partner_insurer}</div>
                  <h3 className="text-base font-bold text-[var(--ink)] m-0">{p.plan_name}</h3>
                  <p className="text-xs text-[var(--mut)] m-0 leading-relaxed">{p.coverage_highlights}</p>
                </div>
                <div className="pt-3 border-t border-[var(--line)] flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-[var(--mut)]">Cover: </span>
                    <strong className="font-tabular text-[var(--ink)]">{formatINR(p.sum_insured)}</strong>
                    <span className="mx-1.5">·</span>
                    <span className="text-[var(--mut)]">Premium: </span>
                    <strong className="font-tabular text-[var(--lt)]">{formatINR(p.annual_premium)}/yr</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleApplyInsurance(p.product_code, p.plan_name)}
                    className="px-3.5 py-1.5 rounded-[10px] bg-[var(--ac)] text-[var(--ai)] text-xs font-semibold cursor-pointer"
                  >
                    Get Sandbox Quote
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. DIGITAL GOLD & SAVINGS VAULT */}
      {activeTab === 'gold' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-6 bg-[var(--card)] border border-[var(--line)] rounded-[16px] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-[var(--lt)] uppercase">24K 99.9% Purity Sandbox Vault</div>
                <h2 className="text-lg font-bold text-[var(--ink)] m-0">Digital Gold &amp; Monthly Savings</h2>
              </div>
              <div className="text-right">
                <div className="text-xs text-[var(--mut)]">Indicative 24K Rate</div>
                <div className="text-lg font-extrabold font-tabular text-[var(--ink)]">
                  {formatINR(gold?.live_rate_24k_per_gram ?? 7680)}/g
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] flex justify-between items-center">
              <div>
                <div className="text-xs text-[var(--mut)]">Sandbox Vault Holding</div>
                <div className="text-xl font-extrabold font-tabular text-[var(--ink)]">
                  {gold?.grams_held ?? 5.5338} grams
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-[var(--mut)]">Indicative Value</div>
                <div className="text-xl font-extrabold font-tabular text-[var(--lt)]">
                  {formatINR(gold?.current_valuation ?? 42500)}
                </div>
              </div>
            </div>

            <form onSubmit={handleGoldTrade} className="space-y-3">
              <div className="flex gap-1 bg-[var(--bg)] p-1 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setGoldTxType('BUY')}
                  className={`flex-1 py-1.5 rounded-md cursor-pointer ${goldTxType === 'BUY' ? 'bg-[var(--ac)] text-[var(--ai)]' : 'text-[var(--mut)]'}`}
                >
                  Buy 24K Gold (Sandbox)
                </button>
                <button
                  type="button"
                  onClick={() => setGoldTxType('SELL')}
                  className={`flex-1 py-1.5 rounded-md cursor-pointer ${goldTxType === 'SELL' ? 'bg-[var(--ac)] text-[var(--ai)]' : 'text-[var(--mut)]'}`}
                >
                  Sell Gold (Sandbox)
                </button>
              </div>
              <label className="block text-xs text-[var(--mut)]">
                Amount in Rupees (₹)
                <input
                  type="number"
                  min="100"
                  required
                  value={goldAmtInr}
                  onChange={(e) => setGoldAmtInr(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-[10px] border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] text-base font-bold font-tabular"
                />
              </label>
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-[10px] bg-[var(--ac2)] text-[#2a1d00] font-semibold text-sm cursor-pointer"
              >
                {goldTxType === 'BUY' ? `Buy ₹${goldAmtInr} of Digital Gold [Demo]` : `Sell ₹${goldAmtInr} of Digital Gold [Demo]`}
              </button>
            </form>

            <div className="text-[11px] text-[var(--mut)] leading-relaxed">
              {gold?.disclaimer ||
                'Disclosure: Digital Gold transactions in this prototype are simulated. No actual physical gold ownership is created without an authorized bullion partner.'}
            </div>
          </div>

          <div className="lg:col-span-6 bg-[var(--card)] border border-[var(--line)] rounded-[16px] p-5 space-y-3">
            <h3 className="text-base font-bold text-[var(--ink)] m-0">Gold Holding Statement (Sandbox)</h3>
            {(gold?.transactions || []).map((t: any) => (
              <div
                key={t.id}
                className="p-3.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-[var(--ink)]">
                    {t.tx_type} · {t.grams}g @ {formatINR(t.rate_per_gram)}/g
                  </div>
                  <div className="text-[var(--mut)] font-mono">{t.reference_no}</div>
                </div>
                <div className="text-right font-bold font-tabular text-[var(--ink)]">
                  {formatINR(t.total_amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. TRAVEL & TRANSIT DESK */}
      {activeTab === 'travel' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7 bg-[var(--card)] border border-[var(--line)] rounded-[16px] p-5 space-y-4">
            <h2 className="text-lg font-bold text-[var(--ink)] m-0">
              Book Flights, APSRTC Buses, Trains &amp; Hotels (Sandbox)
            </h2>
            <form onSubmit={handleBookTravel} className="space-y-3">
              <label className="block text-xs text-[var(--mut)]">
                Select Route / Service
                <select
                  value={travelRouteId}
                  onChange={(e) => setTravelRouteId(e.target.value)}
                  className="w-full mt-1 px-3 py-2.5 rounded-[10px] border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] text-sm"
                >
                  {(travel?.routes || []).map((r: any) => (
                    <option key={r.id} value={r.id}>
                      [{r.mode}] {r.origin} → {r.destination} · {r.operator} ({formatINR(r.fare)})
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs text-[var(--mut)]">
                  Travel / Check-in Date
                  <input
                    type="date"
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-[10px] border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] text-sm"
                  />
                </label>
                <label className="block text-xs text-[var(--mut)]">
                  Passengers / Rooms
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={travelPax}
                    onChange={(e) => setTravelPax(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-[10px] border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] text-sm font-tabular"
                  />
                </label>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-[10px] bg-[var(--ac)] text-[var(--ai)] font-semibold text-sm cursor-pointer"
              >
                Book Ticket &amp; Generate Sandbox PNR
              </button>
            </form>
          </div>

          <div className="lg:col-span-5 bg-[var(--card)] border border-[var(--line)] rounded-[16px] p-5 space-y-3">
            <h3 className="text-base font-bold text-[var(--ink)] m-0">My Travel Bookings</h3>
            {(travel?.bookings || []).map((b: any) => (
              <div key={b.id} className="p-3.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-[var(--lt)]">{b.pnr_reference}</span>
                  <span className="font-bold text-[var(--ink)]">{b.status}</span>
                </div>
                <div className="font-semibold text-[var(--ink)]">
                  [{b.mode}] {b.origin} → {b.destination} ({b.operator_name})
                </div>
                <div className="flex justify-between items-center text-[var(--mut)]">
                  <span>Date: {b.travel_date} · {b.passengers} Pax · {formatINR(b.fare_amount)}</span>
                  {b.status === 'CONFIRMED_DEMO' && (
                    <button
                      type="button"
                      onClick={() => handleCancelBooking(b.id)}
                      className="text-rose-500 font-semibold hover:underline cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. MERCHANT SERVICES PORTAL */}
      {activeTab === 'merchant' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-5 bg-[var(--card)] border border-[var(--line)] rounded-[16px] p-5 space-y-4">
            <h2 className="text-lg font-bold text-[var(--ink)] m-0">Merchant Profile &amp; QR Registration</h2>
            <div className="p-3.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-xs space-y-1">
              <div className="font-bold text-sm text-[var(--ink)]">{merchant?.profile?.business_name || merchBusinessName}</div>
              <div className="font-mono text-[var(--lt)]">Merchant VPA: {merchant?.profile?.merchant_vpa || 'rayalaseemamart@tatitoupi'}</div>
              <div className="text-[var(--mut)]">Settlement: {merchant?.profile?.settlement_bank || 'SBI •••• 4821 (T+0 Sandbox)'}</div>
            </div>

            <form onSubmit={handleUpdateMerchant} className="space-y-3">
              <label className="block text-xs text-[var(--mut)]">
                Business / Shop Name
                <input
                  type="text"
                  required
                  value={merchBusinessName}
                  onChange={(e) => setMerchBusinessName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-[10px] border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] text-sm"
                />
              </label>
              <label className="block text-xs text-[var(--mut)]">
                Business Category
                <input
                  type="text"
                  value={merchCat}
                  onChange={(e) => setMerchCat(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-[10px] border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] text-sm"
                />
              </label>
              <label className="block text-xs text-[var(--mut)]">
                GSTIN (Optional)
                <input
                  type="text"
                  value={merchGstin}
                  onChange={(e) => setMerchGstin(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-[10px] border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] text-sm font-mono"
                />
              </label>
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-[10px] bg-[var(--ac)] text-[var(--ai)] font-semibold text-xs cursor-pointer"
              >
                Save Merchant Profile &amp; QR
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 bg-[var(--card)] border border-[var(--line)] rounded-[16px] p-5 space-y-4">
            <h2 className="text-lg font-bold text-[var(--ink)] m-0">Merchant Sales &amp; Settlement Summary</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-[var(--bg)] border border-[var(--line)]">
                <div className="text-xs text-[var(--mut)]">Today&apos;s QR Collections</div>
                <div className="text-xl font-extrabold font-tabular text-[var(--ink)]">
                  {formatINR(merchant?.profile?.today_sales ?? 18450)}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-[var(--bg)] border border-[var(--line)]">
                <div className="text-xs text-[var(--mut)]">Monthly QR Volume</div>
                <div className="text-xl font-extrabold font-tabular text-[var(--lt)]">
                  {formatINR(merchant?.profile?.month_sales ?? 342800)}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {(merchant?.transactions || []).map((m: any) => (
                <div
                  key={m.id}
                  className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--line)] flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-[var(--ink)]">{m.customer_name} ({m.customer_vpa})</div>
                    <div className="font-mono text-[var(--mut)]">{m.transaction_ref} · {m.settlement_status}</div>
                  </div>
                  <div className="text-right font-bold font-tabular text-[var(--ink)]">
                    {formatINR(m.amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 8. CUSTOMER SUPPORT & DISPUTE CENTER */}
      {activeTab === 'support' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-6 bg-[var(--card)] border border-[var(--line)] rounded-[16px] p-5 space-y-4">
            <h2 className="text-lg font-bold text-[var(--ink)] m-0">Raise Support Ticket or Payment Dispute</h2>
            <form onSubmit={handleCreateTicket} className="space-y-3">
              <label className="block text-xs text-[var(--mut)]">
                Issue Category
                <select
                  value={ticketCat}
                  onChange={(e) => setTicketCat(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-[10px] border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] text-sm"
                >
                  <option>Payment Dispute</option>
                  <option>Refund Request</option>
                  <option>Loan Application Support</option>
                  <option>KYC &amp; Document Help</option>
                </select>
              </label>
              <label className="block text-xs text-[var(--mut)]">
                Transaction / Application Reference (Optional)
                <input
                  type="text"
                  placeholder="e.g. UPI-DEMO-98412041"
                  value={ticketRef}
                  onChange={(e) => setTicketRef(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-[10px] border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] text-sm font-mono"
                />
              </label>
              <label className="block text-xs text-[var(--mut)]">
                Subject
                <input
                  type="text"
                  required
                  placeholder="Brief summary of your issue"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-[10px] border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] text-sm"
                />
              </label>
              <label className="block text-xs text-[var(--mut)]">
                Description
                <textarea
                  rows={3}
                  required
                  placeholder="Provide details so our Kadapa support desk can assist..."
                  value={ticketDesc}
                  onChange={(e) => setTicketDesc(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-[10px] border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] text-sm"
                />
              </label>
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-[10px] bg-[var(--ac)] text-[var(--ai)] font-semibold text-sm cursor-pointer"
              >
                Submit Support Ticket
              </button>
            </form>
          </div>

          <div className="lg:col-span-6 bg-[var(--card)] border border-[var(--line)] rounded-[16px] p-5 space-y-3">
            <h2 className="text-lg font-bold text-[var(--ink)] m-0">My Support Tickets &amp; Disputes</h2>
            {(support?.tickets || []).map((t: any) => (
              <div key={t.id} className="p-3.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-[var(--lt)]">{t.ticket_no} · {t.category}</span>
                  <span className="font-bold text-[var(--ink)]">{t.status}</span>
                </div>
                <div className="font-semibold text-[var(--ink)]">{t.subject}</div>
                <p className="text-[var(--mut)] m-0">{t.description}</p>
                {t.resolution_note && (
                  <div className="text-[11px] text-[var(--lt)] pt-1">
                    Resolution: {t.resolution_note}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
