import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { WalletTransaction } from '../types';
import {
  Wallet, PlusCircle, ArrowDownLeft, ArrowUpRight, Zap, Smartphone, Tv,
  Wifi, ShieldCheck, CheckCircle2, AlertCircle, Receipt, Building2, RefreshCw
} from 'lucide-react';

const BBPS_CATEGORIES = [
  { id: 'electricity', label: 'Electricity Bill', icon: Zap, defaultOperator: 'APSPDCL (Southern Power AP)', placeholder: '13-digit Service No (e.g. 1009823412034)' },
  { id: 'mobile', label: 'Mobile Recharge', icon: Smartphone, defaultOperator: 'Jio / Airtel / BSNL AP', placeholder: '10-digit Mobile Number' },
  { id: 'dth', label: 'DTH Television', icon: Tv, defaultOperator: 'Tata Play / Sun Direct', placeholder: 'Subscriber ID (e.g. 1094829102)' },
  { id: 'broadband', label: 'Fiber Broadband', icon: Wifi, defaultOperator: 'ACT Fibernet / JioFiber', placeholder: 'Account Number' },
];

export const WalletPage: React.FC = () => {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const [balance, setBalance] = useState<number>(user?.wallet_balance || 24850);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Money & Withdraw state
  const [activeAction, setActiveAction] = useState<'add' | 'withdraw'>('add');
  const [amountInput, setAmountInput] = useState<string>('5000');
  const [paymentMode, setPaymentMode] = useState<string>('upi_sandbox');
  const [bankAccount, setBankAccount] = useState<string>('State Bank of India (Kadapa) •••• 4821');
  const [walletBusy, setWalletBusy] = useState(false);
  const [walletNotice, setWalletNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // BBPS Bill Pay state
  const [billCategory, setBillCategory] = useState<string>('electricity');
  const [operator, setOperator] = useState<string>('APSPDCL (Southern Power AP)');
  const [consumerNo, setConsumerNo] = useState<string>('1009823412034');
  const [fetchedBill, setFetchedBill] = useState<any | null>(null);
  const [billBusy, setBillBusy] = useState(false);
  const [billReceipt, setBillReceipt] = useState<any | null>(null);
  const [billError, setBillError] = useState<string | null>(null);

  const loadWalletData = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [walletData, payHistory] = await Promise.all([
        api.getWallet(),
        api.getPaymentHistory()
      ]);
      setBalance(walletData.wallet_balance ?? user?.wallet_balance ?? 0);
      setTransactions(walletData.transactions || []);
      setPayments(payHistory || []);
    } catch (err) {
      console.error('Failed to load wallet data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWalletData();
  }, [isAuthenticated]);

  const handleCategorySelect = (catId: string) => {
    setBillCategory(catId);
    const found = BBPS_CATEGORIES.find(c => c.id === catId);
    if (found) setOperator(found.defaultOperator);
    setFetchedBill(null);
    setBillReceipt(null);
    setBillError(null);
  };

  const handleWalletSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWalletNotice(null);
    const val = parseFloat(amountInput);
    if (!val || val <= 0) {
      setWalletNotice({ type: 'error', text: 'Please enter a valid positive amount.' });
      return;
    }
    setWalletBusy(true);
    try {
      if (activeAction === 'add') {
        const res = await api.addWalletMoney(val, paymentMode);
        setBalance(res.wallet_balance);
        setWalletNotice({ type: 'success', text: `${res.message} · Ref: ${res.reference}` });
      } else {
        const res = await api.withdrawWalletMoney(val, bankAccount);
        setBalance(res.wallet_balance);
        setWalletNotice({ type: 'success', text: `${res.message} · Ref: ${res.reference}` });
      }
      await refreshUser();
      await loadWalletData();
    } catch (err: any) {
      setWalletNotice({ type: 'error', text: err.message || 'Transaction failed' });
    } finally {
      setWalletBusy(false);
    }
  };

  const handleFetchBill = async (e: React.FormEvent) => {
    e.preventDefault();
    setBillError(null);
    setBillReceipt(null);
    if (!consumerNo || consumerNo.trim().length < 5) {
      setBillError('Please enter a valid consumer / subscriber account identifier (minimum 5 characters).');
      return;
    }
    setBillBusy(true);
    try {
      const res = await api.fetchBill({
        category: billCategory,
        operator,
        account_identifier: consumerNo.trim()
      });
      setFetchedBill(res);
    } catch (err: any) {
      setBillError(err.message || 'Could not fetch bill details.');
    } finally {
      setBillBusy(false);
    }
  };

  const handlePayFetchedBill = async () => {
    if (!fetchedBill) return;
    setBillBusy(true);
    setBillError(null);
    try {
      const res = await api.payBill({
        category: billCategory,
        operator,
        account_identifier: consumerNo.trim(),
        amount: fetchedBill.bill_amount,
        payment_mode: 'wallet',
        idempotency_key: `BBPS-UI-${Date.now()}`
      });
      setBillReceipt(res);
      setFetchedBill(null);
      await refreshUser();
      await loadWalletData();
    } catch (err: any) {
      setBillError(err.message || 'Bill payment failed.');
    } finally {
      setBillBusy(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-teal-400 flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 mb-2">Tatito Wallet &amp; BBPS Hub</h1>
          <p className="text-sm text-slate-600 mb-6">
            Sign in to manage your Tatito Escrow Wallet, add funds via simulated UPI/NetBanking, withdraw to your bank account, or pay utility bills.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm transition-colors"
          >
            Sign In to Access Wallet
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Top Banner */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-teal-400 mb-1">
              M/s. Tatito Projects · Payment Gateway &amp; BBPS Sandbox
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Escrow Wallet &amp; Utility Bill Desk
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Atomic PostgreSQL ledger transactions with idempotency protection. Clearly labeled sandbox gateway for deposits, IMPS withdrawals, and Bharat BillPay simulations.
            </p>
          </div>

          <div className="bg-slate-800/90 border border-slate-700 rounded-xl px-6 py-4 min-w-[260px]">
            <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">Available Escrow Balance</div>
            <div className="text-3xl font-extrabold text-white font-tabular mt-1">
              ₹{Number(balance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-teal-400 mt-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Linked: {user?.profile?.bank_name || 'SBI Kadapa Main'}</span>
            </div>
          </div>
        </div>

        {/* Main 2-Column Grid: Left = Add/Withdraw Money, Right = BBPS Utility Bills */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: Wallet Top-Up & Bank Withdrawal (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Wallet Funds Transfer</h2>
                  <p className="text-xs text-slate-500">Instant simulated top-up or IMPS withdrawal</p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => { setActiveAction('add'); setWalletNotice(null); }}
                    className={`px-3 py-1.5 rounded-md transition-colors ${activeAction === 'add' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    + Add Money
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveAction('withdraw'); setWalletNotice(null); }}
                    className={`px-3 py-1.5 rounded-md transition-colors ${activeAction === 'withdraw' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    Withdraw
                  </button>
                </div>
              </div>

              {walletNotice && (
                <div className={`mb-4 p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                  walletNotice.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  {walletNotice.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <span>{walletNotice.text}</span>
                </div>
              )}

              <form onSubmit={handleWalletSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {activeAction === 'add' ? 'Top-Up Amount (₹)' : 'Withdrawal Amount (₹)'}
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="500000"
                    step="1"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-bold font-tabular text-base focus:outline-none focus:ring-2 focus:ring-slate-900"
                    required
                  />
                  <div className="flex gap-2 mt-2">
                    {[1000, 5000, 10000, 25000].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setAmountInput(String(preset))}
                        className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-tabular transition-colors"
                      >
                        +₹{preset.toLocaleString('en-IN')}
                      </button>
                    ))}
                  </div>
                </div>

                {activeAction === 'add' ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Payment Gateway Channel (Sandbox)
                    </label>
                    <select
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                    >
                      <option value="upi_sandbox">UPI Sandbox (PhonePe / GPay / Paytm Test VPA)</option>
                      <option value="netbanking">NetBanking Sandbox (SBI / HDFC / ICICI)</option>
                      <option value="rupay_debit">RuPay Debit Card (Zero MDR Sandbox)</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Settlement Bank Account
                    </label>
                    <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-700">
                      <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
                      <input
                        type="text"
                        value={bankAccount}
                        onChange={(e) => setBankAccount(e.target.value)}
                        className="w-full bg-transparent focus:outline-none font-medium text-slate-800"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={walletBusy}
                  className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {walletBusy ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Processing Sandbox Ledger...</span>
                    </>
                  ) : activeAction === 'add' ? (
                    <>
                      <PlusCircle className="w-4 h-4 text-teal-400" />
                      <span>Add ₹{Number(amountInput || 0).toLocaleString('en-IN')} to Wallet [Demo]</span>
                    </>
                  ) : (
                    <>
                      <ArrowUpRight className="w-4 h-4 text-amber-400" />
                      <span>Withdraw ₹{Number(amountInput || 0).toLocaleString('en-IN')} to Bank [Demo]</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-500">
              All wallet deposits and withdrawals operate in simulated sandbox mode and update your persistent account ledger for loan EMIs, stock trades, and utility bills.
            </div>
          </div>

          {/* Right Column: BBPS Utility Bill Payment Desk (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4 mb-5">
              <div>
                <h2 className="text-base font-bold text-slate-900">Bharat BillPay (BBPS) Utility Desk</h2>
                <p className="text-xs text-slate-500">Fetch simulated biller dues and settle atomically from your Tatito Wallet</p>
              </div>
              <span className="text-xs font-semibold text-amber-700">
                SANDBOX BILLER SIMULATION
              </span>
            </div>

            {/* Category Selector Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
              {BBPS_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const active = billCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(cat.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                      active
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-teal-400' : 'text-slate-500'}`} />
                    <span className="text-xs font-semibold truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {billError && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{billError}</span>
              </div>
            )}

            <form onSubmit={handleFetchBill} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
              <div className="sm:col-span-5">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Biller / Operator</label>
                <input
                  type="text"
                  value={operator}
                  onChange={(e) => setOperator(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  required
                />
              </div>
              <div className="sm:col-span-5">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Consumer / Service Account No.</label>
                <input
                  type="text"
                  value={consumerNo}
                  onChange={(e) => setConsumerNo(e.target.value)}
                  placeholder={BBPS_CATEGORIES.find(c => c.id === billCategory)?.placeholder}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold font-tabular text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={billBusy}
                  className="w-full py-2.5 px-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl transition-colors"
                >
                  {billBusy ? '...' : 'Fetch Bill'}
                </button>
              </div>
            </form>

            {/* Fetched Bill Preview Card */}
            {fetchedBill && (
              <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-xs text-slate-500">Customer Name (Demo Biller Response)</div>
                    <div className="text-sm font-bold text-slate-900">{fetchedBill.customer_name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500">Bill Due Amount</div>
                    <div className="text-xl font-extrabold text-slate-900 font-tabular">
                      ₹{Number(fetchedBill.bill_amount).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200/80 gap-2">
                  <span>Biller Ref: <strong className="font-tabular text-slate-700">{fetchedBill.bbps_biller_id}</strong></span>
                  <span>Due Date: <strong className="font-tabular text-slate-700">{fetchedBill.due_date}</strong></span>
                </div>
                <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
                  {fetchedBill.disclaimer}
                </div>
                <button
                  type="button"
                  onClick={handlePayFetchedBill}
                  disabled={billBusy}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors"
                >
                  {billBusy ? 'Executing Atomic Settlement...' : `Confirm & Pay ₹${Number(fetchedBill.bill_amount).toLocaleString('en-IN')} from Wallet`}
                </button>
              </div>
            )}

            {/* Payment Receipt Card */}
            {billReceipt && (
              <div className="mt-5 p-4 rounded-xl bg-emerald-50/90 border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                    <Receipt className="w-4 h-4 text-emerald-600" />
                    <span>{billReceipt.status} · Utility Bill Receipt</span>
                  </div>
                  <span className="text-xs font-bold font-tabular text-emerald-800">
                    ₹{Number(billReceipt.receipt?.amount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-emerald-800 pt-1">
                  <div>Txn Ref: <strong className="font-tabular">{billReceipt.receipt?.transaction_ref}</strong></div>
                  <div>BBPS Ref: <strong className="font-tabular">{billReceipt.receipt?.bbps_ref}</strong></div>
                  <div>Wallet After: <strong className="font-tabular">₹{Number(billReceipt.wallet_balance).toLocaleString('en-IN')}</strong></div>
                </div>
                <div className="text-[11px] text-emerald-700 pt-1">
                  {billReceipt.compliance_notice}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Ledger History Table */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Wallet &amp; Bill Payment Ledger</h2>
              <p className="text-xs text-slate-500">Complete audit trail of credits, debits, loan EMI settlements, and utility bill payments</p>
            </div>
            <span className="text-xs text-slate-500 font-tabular">
              {transactions.length + payments.length} recorded entries
            </span>
          </div>

          {loading ? (
            <div className="py-8 text-center text-sm text-slate-500">Loading wallet ledger...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-3">Reference</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Description / Biller</th>
                    <th className="py-3 px-3 text-right">Amount</th>
                    <th className="py-3 px-3 text-right">Balance After</th>
                    <th className="py-3 px-3 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {transactions.map((txn) => (
                    <tr key={`w-${txn.id}`} className="hover:bg-slate-50/80">
                      <td className="py-3 px-3 font-semibold font-tabular text-slate-900">{txn.reference_id}</td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 font-semibold ${
                          txn.transaction_type === 'credit' ? 'text-emerald-700' : 'text-rose-700'
                        }`}>
                          {txn.transaction_type === 'credit' ? (
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          )}
                          {txn.transaction_type.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-700">{txn.description}</td>
                      <td className={`py-3 px-3 text-right font-bold font-tabular ${
                        txn.transaction_type === 'credit' ? 'text-emerald-700' : 'text-slate-900'
                      }`}>
                        {txn.transaction_type === 'credit' ? '+' : '-'}₹{Number(txn.amount).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 text-right font-tabular text-slate-700">
                        ₹{Number(txn.balance_after).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-500 font-tabular">
                        {new Date(txn.created_at).toLocaleDateString('en-IN')}
                      </td>
                    </tr>
                  ))}
                  {payments.map((p) => (
                    <tr key={`p-${p.id}`} className="hover:bg-slate-50/80">
                      <td className="py-3 px-3 font-semibold font-tabular text-slate-900">{p.payment_ref}</td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-teal-700">{p.status}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-700">
                        {p.operator_name} · <span className="text-slate-500 font-tabular">{p.account_identifier}</span>
                      </td>
                      <td className="py-3 px-3 text-right font-bold font-tabular text-slate-900">
                        ₹{Number(p.amount).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 text-right font-tabular text-slate-500">
                        {p.payment_mode?.toUpperCase()}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-500 font-tabular">
                        {new Date(p.created_at).toLocaleDateString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
