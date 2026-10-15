import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  Percent, 
  Calendar, 
  Coins, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  PieChart
} from 'lucide-react';
import { LoanType } from '../types';

interface LoanCalculatorProps {
  onApplyWithParameters: (loanType: LoanType, amount: number, tenure: number) => void;
}

export const LoanCalculator: React.FC<LoanCalculatorProps> = ({
  onApplyWithParameters
}) => {
  const [amount, setAmount] = useState<number>(500000); // ₹5,00,000
  const [interestRate, setInterestRate] = useState<number>(11.0); // 11% p.a.
  const [tenureMonths, setTenureMonths] = useState<number>(36); // 36 months
  const [selectedLoanType, setSelectedLoanType] = useState<LoanType>('gold');

  // Calculate reducing balance EMI
  const { monthlyEmi, totalInterest, totalPayment, principalRatio, interestRatio } = useMemo(() => {
    const monthlyRate = (interestRate / 12) / 100;
    let emi = 0;
    if (monthlyRate === 0) {
      emi = amount / tenureMonths;
    } else {
      emi = (amount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / 
            (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    }

    const roundedEmi = Math.round(emi);
    const totPay = Math.round(roundedEmi * tenureMonths);
    const totInt = Math.max(0, totPay - amount);

    const princRatio = Math.round((amount / totPay) * 100);
    const intRatio = 100 - princRatio;

    return {
      monthlyEmi: roundedEmi,
      totalInterest: totInt,
      totalPayment: totPay,
      principalRatio: princRatio,
      interestRatio: intRatio
    };
  }, [amount, interestRate, tenureMonths]);

  // Presets matching the prompt's exact constraints:
  // Personal (from 14% up to 10L)
  // Business (from 16% up to 50L)
  // Gold (from 11% up to 20L)
  // Home (from 9% up to 1Cr)
  // Vehicle (from 10% up to 20L)
  const applyPreset = (type: LoanType) => {
    setSelectedLoanType(type);
    if (type === 'home') {
      setAmount(4500000);
      setInterestRate(9.0);
      setTenureMonths(180);
    } else if (type === 'gold') {
      setAmount(300000);
      setInterestRate(11.0);
      setTenureMonths(12);
    } else if (type === 'personal') {
      setAmount(400000);
      setInterestRate(14.0);
      setTenureMonths(36);
    } else if (type === 'business') {
      setAmount(1500000);
      setInterestRate(16.0);
      setTenureMonths(48);
    } else if (type === 'vehicle') {
      setAmount(800000);
      setInterestRate(10.0);
      setTenureMonths(60);
    }
  };

  return (
    <section id="loan-calculator-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Calculator className="w-4 h-4" /> RBI Reducing Balance Formula
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
              Interactive Loan EMI Calculator
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Accurately estimate monthly instalments, total interest outgo, and tenure
            </p>
          </div>

          {/* Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-400 mr-1 hidden sm:inline">Quick Presets:</span>
            {[
              { type: 'home' as LoanType, label: 'Home 9%' },
              { type: 'vehicle' as LoanType, label: 'Vehicle 10%' },
              { type: 'gold' as LoanType, label: 'Gold 11%' },
              { type: 'personal' as LoanType, label: 'Personal 14%' },
              { type: 'business' as LoanType, label: 'Business 16%' },
            ].map((p) => (
              <button
                key={p.type}
                type="button"
                onClick={() => applyPreset(p.type)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  selectedLoanType === p.type
                    ? 'bg-emerald-500 text-slate-950 font-extrabold'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sliders and Result */}
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Sliders */}
            <div className="lg:col-span-7 space-y-6">
              {/* Slider 1: Loan Amount */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Loan Amount
                  </label>
                  <div className="text-base sm:text-lg font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100">
                    ₹{amount.toLocaleString('en-IN')}
                  </div>
                </div>
                <input
                  type="range"
                  min="50000"
                  max="10000000"
                  step="25000"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>₹50,000</span>
                  <span>₹50 Lakhs</span>
                  <span>₹1.00 Crore</span>
                </div>
              </div>

              {/* Slider 2: Interest Rate */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Interest Rate (Annual p.a.)
                  </label>
                  <div className="text-base sm:text-lg font-extrabold text-slate-900 bg-slate-100 px-3 py-1 rounded-xl border border-slate-200">
                    {interestRate.toFixed(1)}% p.a.
                  </div>
                </div>
                <input
                  type="range"
                  min="8.5"
                  max="24.0"
                  step="0.25"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>8.5% (Subsidized)</span>
                  <span>14.0% (Personal)</span>
                  <span>24.0% (Upper Limit)</span>
                </div>
              </div>

              {/* Slider 3: Tenure Months */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Loan Tenure (Duration)
                  </label>
                  <div className="text-base sm:text-lg font-extrabold text-slate-900 bg-slate-100 px-3 py-1 rounded-xl border border-slate-200">
                    {tenureMonths} Months ({ (tenureMonths / 12).toFixed(1) } Years)
                  </div>
                </div>
                <input
                  type="range"
                  min="6"
                  max="240"
                  step="6"
                  value={tenureMonths}
                  onChange={(e) => setTenureMonths(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>6 Months</span>
                  <span>5 Years (60 Mo)</span>
                  <span>20 Years (240 Mo)</span>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Result Card */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl bg-slate-900 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10 space-y-6">
                  {/* Monthly EMI Large Badge */}
                  <div>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
                      Estimated Monthly EMI
                    </span>
                    <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200 mt-1">
                      ₹{monthlyEmi.toLocaleString('en-IN')}
                    </div>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">
                      per month for {tenureMonths} instalments
                    </span>
                  </div>

                  {/* Visual Split Bar */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1.5 font-semibold">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                        Principal ({principalRatio}%)
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                        Interest ({interestRatio}%)
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
                      <div 
                        className="h-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${principalRatio}%` }}
                      />
                      <div 
                        className="h-full bg-amber-400 transition-all duration-300"
                        style={{ width: `${interestRatio}%` }}
                      />
                    </div>
                  </div>

                  {/* Summary Breakdown */}
                  <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Principal Amount:</span>
                      <span className="font-bold text-white">₹{amount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Total Interest Payable:</span>
                      <span className="font-bold text-amber-400">₹{totalInterest.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-sm font-extrabold pt-2 border-t border-slate-800">
                      <span className="text-slate-300">Total Outgo:</span>
                      <span className="text-emerald-400">₹{totalPayment.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Action CTA */}
                  <button
                    type="button"
                    onClick={() => onApplyWithParameters(selectedLoanType, amount, tenureMonths)}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Apply for this Loan</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
