import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Zap, 
  Smartphone, 
  Tv, 
  Car, 
  Droplets, 
  Flame, 
  Wifi, 
  CreditCard, 
  Search, 
  CheckCircle2, 
  Loader2, 
  ShieldCheck, 
  Tag, 
  Wallet, 
  QrCode, 
  Receipt, 
  AlertCircle,
  HelpCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { 
  BillCategory, 
  BillOperator, 
  FetchedBill, 
  PaymentMode, 
  Transaction, 
  User 
} from '../types';
import { BILL_OPERATORS } from '../services/mockData';
import { storageService } from '../services/storage';

interface BillPaymentSectionProps {
  currentUser: User;
  activeCategory: BillCategory;
  onSelectCategory: (category: BillCategory) => void;
  onPaymentSuccess: (txn: Transaction) => void;
  onOpenWalletModal: () => void;
}

export const BillPaymentSection: React.FC<BillPaymentSectionProps> = ({
  currentUser,
  activeCategory,
  onSelectCategory,
  onPaymentSuccess,
  onOpenWalletModal
}) => {
  const categoryOperators = BILL_OPERATORS.filter(o => o.category === activeCategory);
  
  const [selectedOperator, setSelectedOperator] = useState<BillOperator>(categoryOperators[0] || BILL_OPERATORS[0]);
  const [accountIdentifier, setAccountIdentifier] = useState('');
  const [selectedCircle, setSelectedCircle] = useState('Andhra Pradesh & Telangana');
  const [mobileType, setMobileType] = useState<'prepaid' | 'postpaid'>('prepaid');
  
  // Fetching state
  const [isFetching, setIsFetching] = useState(false);
  const [fetchedBill, setFetchedBill] = useState<FetchedBill | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Payment state
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('wallet');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Update selected operator when category changes
  useEffect(() => {
    const ops = BILL_OPERATORS.filter(o => o.category === activeCategory);
    if (ops.length > 0) {
      setSelectedOperator(ops[0]);
      setAccountIdentifier('');
      setFetchedBill(null);
      setFetchError(null);
      setCouponDiscount(0);
      setCouponMessage(null);
    }
  }, [activeCategory]);

  // Set default identifier suggestions for demo ease
  const fillSampleIdentifier = () => {
    if (activeCategory === 'electricity') setAccountIdentifier('1009823412034');
    else if (activeCategory === 'mobile') setAccountIdentifier('9876543210');
    else if (activeCategory === 'dth') setAccountIdentifier('1029384756');
    else if (activeCategory === 'fastag') setAccountIdentifier('AP04BQ1234');
    else if (activeCategory === 'water') setAccountIdentifier('KDP-WTR-4491');
    else if (activeCategory === 'gas') setAccountIdentifier('9876543210');
    else if (activeCategory === 'broadband') setAccountIdentifier('08562245678');
    else if (activeCategory === 'credit_card') setAccountIdentifier('4532789123458821');
  };

  const handleFetchBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountIdentifier.trim()) {
      setFetchError(`Please enter a valid ${selectedOperator.identifierLabel}`);
      return;
    }

    setFetchError(null);
    setIsFetching(true);
    setFetchedBill(null);

    setTimeout(() => {
      try {
        const bill = storageService.fetchBillSimulation(
          activeCategory,
          selectedOperator.name,
          accountIdentifier.trim()
        );
        setFetchedBill(bill);
        setIsFetching(false);
      } catch (err: any) {
        setFetchError(err.message || 'Unable to fetch bill from BBPS gateway. Please try again.');
        setIsFetching(false);
      }
    }, 900);
  };

  const handleApplyPlan = (plan: { name: string; price: number; validity: string; details: string }) => {
    if (!accountIdentifier.trim()) {
      setAccountIdentifier('9876543210');
    }
    const bill: FetchedBill = {
      customerName: currentUser.fullName,
      accountIdentifier: accountIdentifier || '9876543210',
      operator: selectedOperator.name,
      category: 'mobile',
      billNumber: `PLAN-${Math.floor(100000 + Math.random() * 900000)}`,
      billDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      dueDate: 'Immediate Recharge',
      amountDue: plan.price,
      convenienceFee: 0,
      operatorReference: `BBPS-MOB-${Math.floor(10000000 + Math.random() * 90000000)}`,
      status: 'PENDING',
      circle: selectedCircle,
      billPeriod: plan.validity
    };
    setFetchedBill(bill);
  };

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (!fetchedBill) {
      setCouponMessage('Please fetch a bill first to apply coupons.');
      return;
    }

    if (code === 'TATITO50') {
      const disc = Math.min(50, fetchedBill.amountDue);
      setCouponDiscount(disc);
      setCouponMessage(`🎉 Coupon TATITO50 applied! Flat ₹50 off.`);
    } else if (code === 'KADAPA100') {
      if (fetchedBill.amountDue >= 1000) {
        setCouponDiscount(100);
        setCouponMessage(`🎉 Coupon KADAPA100 applied! ₹100 discount on bill over ₹1,000.`);
      } else {
        setCouponDiscount(0);
        setCouponMessage(`⚠️ KADAPA100 is valid only on bills above ₹1,000.`);
      }
    } else {
      setCouponDiscount(0);
      setCouponMessage(`❌ Invalid coupon code. Try 'TATITO50' or 'KADAPA100'.`);
    }
  };

  const handlePayBill = () => {
    if (!fetchedBill) return;

    const finalAmount = Math.max(0, fetchedBill.amountDue - couponDiscount);
    if (paymentMode === 'wallet' && currentUser.walletBalance < finalAmount) {
      setPaymentError(`Insufficient wallet balance. You have ₹${currentUser.walletBalance.toLocaleString('en-IN')}, need ₹${finalAmount.toLocaleString('en-IN')}.`);
      return;
    }

    setPaymentError(null);
    setIsProcessingPayment(true);

    setTimeout(() => {
      try {
        const { transaction } = storageService.processBillPayment(
          fetchedBill,
          paymentMode,
          couponDiscount
        );

        // Fire confetti
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {
          // ignore if canvas not supported
        }

        setIsProcessingPayment(false);
        onPaymentSuccess(transaction);
        // Reset local form
        setFetchedBill(null);
        setAccountIdentifier('');
        setCouponDiscount(0);
        setCouponCode('');
        setCouponMessage(null);
      } catch (err: any) {
        setIsProcessingPayment(false);
        setPaymentError(err.message || 'Payment execution failed. Please verify funds.');
      }
    }, 1200);
  };

  const categoriesList: { id: BillCategory; name: string }[] = [
    { id: 'mobile', name: 'Mobile Recharge' },
    { id: 'electricity', name: 'Electricity' },
    { id: 'dth', name: 'DTH' },
    { id: 'fastag', name: 'FASTag' },
    { id: 'water', name: 'Water' },
    { id: 'gas', name: 'Gas' },
    { id: 'broadband', name: 'Broadband' },
    { id: 'credit_card', name: 'Credit Card' },
  ];

  return (
    <section id="recharges-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden">
        {/* Category Header Tabs */}
        <div className="bg-slate-900 px-4 sm:px-8 py-4 text-white">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-sm sm:text-base font-bold text-white">
                Live Bharat BillPay (BBPS) Payment Desk
              </h2>
            </div>
            <div className="text-xs text-slate-400 hidden sm:flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>NPCI Certified • 256-bit Encrypted</span>
            </div>
          </div>

          {/* Sub-tabs for switching categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-3 pb-1 no-scrollbar">
            {categoriesList.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Form & Operator selector */}
            <div className="lg:col-span-7 space-y-6">
              <form onSubmit={handleFetchBill} className="space-y-5">
                {/* Mobile: Prepaid vs Postpaid toggle */}
                {activeCategory === 'mobile' && (
                  <div className="flex items-center gap-3 p-1.5 bg-slate-100 rounded-xl w-fit">
                    <button
                      type="button"
                      onClick={() => setMobileType('prepaid')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        mobileType === 'prepaid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      Prepaid
                    </button>
                    <button
                      type="button"
                      onClick={() => setMobileType('postpaid')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        mobileType === 'postpaid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      Postpaid
                    </button>
                  </div>
                )}

                {/* Operator Select */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Select Service Provider / Biller
                  </label>
                  <div className="relative">
                    <select
                      value={selectedOperator.id}
                      onChange={(e) => {
                        const found = BILL_OPERATORS.find(o => o.id === e.target.value);
                        if (found) setSelectedOperator(found);
                        setFetchedBill(null);
                      }}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white font-semibold text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer"
                    >
                      {categoryOperators.map((op) => (
                        <option key={op.id} value={op.id}>
                          {op.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      ▼
                    </div>
                  </div>
                </div>

                {/* Optional Circle select for mobile/telco */}
                {selectedOperator.circles && selectedOperator.circles.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Telecom Circle
                    </label>
                    <select
                      value={selectedCircle}
                      onChange={(e) => setSelectedCircle(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      {selectedOperator.circles.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Identifier Input */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      {selectedOperator.identifierLabel}
                    </label>
                    <button
                      type="button"
                      onClick={fillSampleIdentifier}
                      className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer underline"
                    >
                      Auto-fill Kadapa sample
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={accountIdentifier}
                      onChange={(e) => {
                        setAccountIdentifier(e.target.value);
                        setFetchedBill(null);
                        setFetchError(null);
                      }}
                      placeholder={selectedOperator.placeholder}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 font-semibold text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  {fetchError && (
                    <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" /> {fetchError}
                    </p>
                  )}
                </div>

                {/* Action Button: Fetch Bill */}
                <button
                  type="submit"
                  disabled={isFetching || !accountIdentifier.trim()}
                  className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isFetching ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                      <span>Connecting to Bharat BillPay Gateway...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 text-emerald-400" />
                      <span>Fetch Bill &amp; Due Amount</span>
                    </>
                  )}
                </button>
              </form>

              {/* Popular Plans browser for Mobile Recharges */}
              {selectedOperator.popularPlans && (
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Popular {selectedOperator.name} Plans
                    </h3>
                    <span className="text-[11px] text-slate-400">Click to auto-select</span>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-2.5">
                    {selectedOperator.popularPlans.map((plan, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleApplyPlan(plan)}
                        className="p-3 rounded-xl border border-slate-200 hover:border-emerald-500/80 bg-slate-50/60 hover:bg-emerald-50/30 transition cursor-pointer group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-800">
                            {plan.name}
                          </span>
                          <span className="text-sm font-extrabold text-emerald-600">
                            ₹{plan.price}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium mt-1">
                          Validity: <span className="font-bold text-slate-700">{plan.validity}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{plan.details}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Fetched Bill Card & Payment Checkout */}
            <div className="lg:col-span-5">
              {fetchedBill ? (
                <div className="rounded-3xl bg-slate-50 border border-slate-200 p-6 shadow-sm space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                        BBPS
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900">Verified Bill Due</span>
                        <div className="text-[10px] text-emerald-600 font-medium">Biller Status: Active</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      Unpaid
                    </span>
                  </div>

                  {/* Customer & Bill details */}
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Consumer Name:</span>
                      <span className="font-bold text-slate-900">{fetchedBill.customerName}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Account / ID:</span>
                      <span className="font-mono font-bold text-slate-900">{fetchedBill.accountIdentifier}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Biller:</span>
                      <span className="font-semibold text-slate-800">{fetchedBill.operator}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Bill Number:</span>
                      <span className="font-mono text-slate-600">{fetchedBill.billNumber}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Due Date:</span>
                      <span className="font-bold text-rose-600">{fetchedBill.dueDate}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Convenience Fee:</span>
                      <span className="font-semibold text-emerald-600">FREE (₹0.00)</span>
                    </div>
                  </div>

                  {/* Coupon Code section */}
                  <div className="pt-2">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 block">
                      Have a Promo Code?
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="e.g. TATITO50 or KADAPA100"
                        className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono uppercase font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                    {couponMessage && (
                      <p className="text-[11px] mt-1 font-semibold text-emerald-700">
                        {couponMessage}
                      </p>
                    )}
                  </div>

                  {/* Payment Mode Selector */}
                  <div className="pt-2 border-t border-slate-200">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 block">
                      Choose Payment Method
                    </label>
                    <div className="space-y-2">
                      {/* Wallet */}
                      <label
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                          paymentMode === 'wallet'
                            ? 'border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-600'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="payment_mode"
                            checked={paymentMode === 'wallet'}
                            onChange={() => setPaymentMode('wallet')}
                            className="text-emerald-600 focus:ring-emerald-500"
                          />
                          <div>
                            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Tatito Pay Wallet</span>
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Available: ₹{currentUser.walletBalance.toLocaleString('en-IN')}
                            </div>
                          </div>
                        </div>
                        {currentUser.walletBalance < (fetchedBill.amountDue - couponDiscount) ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              onOpenWalletModal();
                            }}
                            className="text-[10px] font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-2 py-1 rounded-md"
                          >
                            + Top Up
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                            Instant
                          </span>
                        )}
                      </label>

                      {/* UPI */}
                      <label
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                          paymentMode === 'upi'
                            ? 'border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-600'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="payment_mode"
                            checked={paymentMode === 'upi'}
                            onChange={() => setPaymentMode('upi')}
                            className="text-emerald-600 focus:ring-emerald-500"
                          />
                          <div>
                            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              <QrCode className="w-3.5 h-3.5 text-blue-600" />
                              <span>UPI (GPay / PhonePe / Paytm / BHIM)</span>
                            </div>
                            <div className="text-[10px] text-slate-500">Instant UPI Direct Gateway</div>
                          </div>
                        </div>
                      </label>

                      {/* NetBanking / Cards */}
                      <label
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                          paymentMode === 'netbanking'
                            ? 'border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-600'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="payment_mode"
                            checked={paymentMode === 'netbanking'}
                            onChange={() => setPaymentMode('netbanking')}
                            className="text-emerald-600 focus:ring-emerald-500"
                          />
                          <div>
                            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              <CreditCard className="w-3.5 h-3.5 text-purple-600" />
                              <span>NetBanking / Debit / Credit Cards</span>
                            </div>
                            <div className="text-[10px] text-slate-500">All Indian Banks Supported</div>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Total Amount & Pay Button */}
                  <div className="pt-3 border-t border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Original Bill:</span>
                      <span>₹{fetchedBill.amountDue.toLocaleString('en-IN')}</span>
                    </div>
                    {couponDiscount > 0 && (
                      <div className="flex items-center justify-between text-xs text-emerald-700 font-bold">
                        <span>Discount Coupon:</span>
                        <span>-₹{couponDiscount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-base font-extrabold text-slate-900 pt-1 border-t border-dashed border-slate-200">
                      <span>Total Payable:</span>
                      <span className="text-emerald-700 text-lg">
                        ₹{Math.max(0, fetchedBill.amountDue - couponDiscount).toLocaleString('en-IN')}
                      </span>
                    </div>

                    {paymentError && (
                      <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                        {paymentError}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handlePayBill}
                      disabled={isProcessingPayment}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/25 transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isProcessingPayment ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>Authorizing via NPCI BBPS...</span>
                        </>
                      ) : (
                        <>
                          <span>Confirm &amp; Pay ₹{Math.max(0, fetchedBill.amountDue - couponDiscount).toLocaleString('en-IN')}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <p className="text-[10px] text-center text-slate-400">
                      Protected by Bharat BillPay 256-bit secure gateway protocol.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 p-8 text-center flex flex-col items-center justify-center min-h-[360px]">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 mb-3 shadow-xs">
                    <Receipt className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">No Bill Fetched Yet</h4>
                  <p className="text-xs text-slate-500 max-w-xs mt-1">
                    Enter your {selectedOperator.identifierLabel} on the left and click "Fetch Bill &amp; Due Amount" to retrieve verified live bill data.
                  </p>
                  <div className="mt-4 p-3 bg-white rounded-xl border border-slate-200 text-left max-w-xs w-full text-[11px] space-y-1.5">
                    <span className="font-bold text-slate-800 block">💡 Quick Tips for Kadapa Users:</span>
                    <p className="text-slate-600">• APSPDCL electricity bills use 13-digit SC number.</p>
                    <p className="text-slate-600">• Mobile recharge supports 5G unlimited packs.</p>
                    <p className="text-slate-600">• Instant receipt generated with BBPS Reference ID.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
