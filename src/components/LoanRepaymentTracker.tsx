import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  CreditCard, 
  CheckCircle2, 
  Calendar, 
  Percent, 
  Clock, 
  ArrowUpRight, 
  AlertCircle, 
  Wallet, 
  Building2,
  ShieldCheck,
  ChevronRight,
  Loader2,
  X
} from 'lucide-react';
import { LoanAccount, PaymentMode, Transaction, User } from '../types';
import { storageService } from '../services/storage';

interface LoanRepaymentTrackerProps {
  currentUser: User;
  onPaymentSuccess: (txn: Transaction) => void;
  onOpenWalletModal: () => void;
  onApplyForLoan: () => void;
}

export const LoanRepaymentTracker: React.FC<LoanRepaymentTrackerProps> = ({
  currentUser,
  onPaymentSuccess,
  onOpenWalletModal,
  onApplyForLoan
}) => {
  const [loanAccounts, setLoanAccounts] = useState<LoanAccount[]>(
    storageService.getUserLoanAccounts(currentUser.id)
  );
  const [selectedLoan, setSelectedLoan] = useState<LoanAccount | null>(null);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('wallet');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Refresh loan accounts when currentUser changes
  React.useEffect(() => {
    setLoanAccounts(storageService.getUserLoanAccounts(currentUser.id));
  }, [currentUser.id]);

  const handlePayEmi = () => {
    if (!selectedLoan) return;

    if (paymentMode === 'wallet' && currentUser.walletBalance < selectedLoan.monthlyEmi) {
      setErrorMessage(`Insufficient wallet balance. You have ₹${currentUser.walletBalance.toLocaleString('en-IN')}, required: ₹${selectedLoan.monthlyEmi.toLocaleString('en-IN')}`);
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);

    setTimeout(() => {
      try {
        const { account, transaction } = storageService.payLoanEmi(
          selectedLoan.loanAccountNo,
          selectedLoan.monthlyEmi,
          paymentMode
        );

        try {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 }
          });
        } catch (e) {}

        setIsProcessing(false);
        setSelectedLoan(null);
        setLoanAccounts(storageService.getUserLoanAccounts(currentUser.id));
        onPaymentSuccess(transaction);
      } catch (err: any) {
        setIsProcessing(false);
        setErrorMessage(err.message || 'Failed to process EMI repayment.');
      }
    }, 1100);
  };

  const activeLoans = loanAccounts.filter(l => l.status === 'active');
  const closedLoans = loanAccounts.filter(l => l.status === 'closed');

  return (
    <section id="loan-tracker-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Loan Repayment Tracker &amp; EMIs
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track and pay scheduled EMIs for Personal, Gold, Home, and Business loans with reducing balance schedule
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onApplyForLoan}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>+ Apply New Loan</span>
          </button>
        </div>
      </div>

      {/* Loans Grid */}
      {activeLoans.length === 0 && closedLoans.length === 0 ? (
        <div className="mt-8 bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Active Loans Found</h3>
          <p className="text-xs text-slate-500 mt-1">
            You currently have no active loan accounts with Tatito Financial Services.
          </p>
          <button
            onClick={onApplyForLoan}
            className="mt-5 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
          >
            Explore Loan Options (from 9% p.a.)
          </button>
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {/* Active Loans */}
          {activeLoans.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" /> Active Loan Accounts ({activeLoans.length})
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                {activeLoans.map((loan) => {
                  const progressPct = Math.round((loan.emisPaid / loan.totalEmis) * 100);
                  const daysToDue = Math.ceil(
                    (new Date(loan.nextEmiDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                  );

                  return (
                    <div
                      key={loan.id}
                      className="bg-white rounded-3xl border border-slate-200/90 hover:border-emerald-500/50 p-6 shadow-sm hover:shadow-md transition group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 font-extrabold flex items-center justify-center text-sm border border-emerald-100">
                            {loan.loanType.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                              {loan.loanType} Loan
                            </span>
                            <h4 className="text-base font-extrabold text-slate-900 font-mono">
                              {loan.loanAccountNo}
                            </h4>
                          </div>
                        </div>

                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200/60">
                          Active
                        </span>
                      </div>

                      {/* Repayment Progress */}
                      <div className="mt-5">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-slate-500 font-medium">Repayment Progress</span>
                          <span className="font-extrabold text-slate-900">
                            {loan.emisPaid} of {loan.totalEmis} EMIs Paid ({progressPct}%)
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Financial Metrics */}
                      <div className="mt-5 grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                        <div>
                          <div className="text-[10px] text-slate-500">Monthly EMI</div>
                          <div className="text-xs sm:text-sm font-extrabold text-emerald-700">
                            ₹{loan.monthlyEmi.toLocaleString('en-IN')}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500">Interest Rate</div>
                          <div className="text-xs sm:text-sm font-extrabold text-slate-900">
                            {loan.interestRate}% p.a.
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500">Outstanding</div>
                          <div className="text-xs sm:text-sm font-extrabold text-slate-900">
                            ₹{loan.outstandingBalance.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>

                      {/* Next EMI due info & Pay button */}
                      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Next EMI Date</div>
                          <div className="text-xs font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{new Date(loan.nextEmiDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            {daysToDue >= 0 && daysToDue <= 7 && (
                              <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded font-bold ml-1">
                                Due in {daysToDue}d
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedLoan(loan);
                            setErrorMessage(null);
                          }}
                          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Pay EMI</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Closed Loans */}
          {closedLoans.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-slate-200">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-slate-400" /> Fully Repaid Loans ({closedLoans.length})
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                {closedLoans.map((loan) => (
                  <div
                    key={loan.id}
                    className="bg-slate-50/80 rounded-2xl border border-slate-200 p-4 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-800">{loan.loanAccountNo}</div>
                      <div className="text-[11px] text-slate-500">
                        {loan.loanType.toUpperCase()} • Principal: ₹{loan.principalAmount.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-600 bg-slate-200 px-2.5 py-1 rounded-full">
                      Closed &amp; NOC Issued
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pay EMI Modal */}
      {selectedLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  EMI
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Pay Monthly Loan EMI</h3>
                  <p className="text-xs text-slate-500 font-mono">{selectedLoan.loanAccountNo}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLoan(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {/* EMI Summary Card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Loan Type:</span>
                  <span className="font-bold text-slate-900 capitalize">{selectedLoan.loanType} Loan</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Installment Number:</span>
                  <span className="font-bold text-slate-900">
                    {selectedLoan.emisPaid + 1} of {selectedLoan.totalEmis}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Current Outstanding:</span>
                  <span className="font-bold text-slate-900">
                    ₹{selectedLoan.outstandingBalance.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-extrabold">
                  <span className="text-slate-800">EMI Amount:</span>
                  <span className="text-emerald-700 text-base">
                    ₹{selectedLoan.monthlyEmi.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Payment Mode Selection */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">
                  Select Payment Channel
                </label>
                <div className="space-y-2">
                  <label
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                      paymentMode === 'wallet'
                        ? 'border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-600'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="emi_payment_mode"
                        checked={paymentMode === 'wallet'}
                        onChange={() => setPaymentMode('wallet')}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900">Tatito Pay Wallet</div>
                        <div className="text-[10px] text-slate-500">
                          Balance: ₹{currentUser.walletBalance.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                    {currentUser.walletBalance < selectedLoan.monthlyEmi && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          onOpenWalletModal();
                        }}
                        className="text-[10px] font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-2 py-1 rounded"
                      >
                        + Top Up
                      </button>
                    )}
                  </label>

                  <label
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                      paymentMode === 'upi'
                        ? 'border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-600'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="emi_payment_mode"
                        checked={paymentMode === 'upi'}
                        onChange={() => setPaymentMode('upi')}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900">UPI Gateway</div>
                        <div className="text-[10px] text-slate-500">Google Pay / PhonePe / BHIM</div>
                      </div>
                    </div>
                  </label>

                  <label
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                      paymentMode === 'netbanking'
                        ? 'border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-600'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="emi_payment_mode"
                        checked={paymentMode === 'netbanking'}
                        onChange={() => setPaymentMode('netbanking')}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900">NetBanking / Debit Card</div>
                        <div className="text-[10px] text-slate-500">SBI, HDFC, Union Bank &amp; others</div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                  {errorMessage}
                </div>
              )}

              <button
                type="button"
                onClick={handlePayEmi}
                disabled={isProcessing}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Processing EMI Clearence...</span>
                  </>
                ) : (
                  <span>Confirm EMI Payment of ₹{selectedLoan.monthlyEmi.toLocaleString('en-IN')}</span>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Instant reducing-balance amortization update</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
