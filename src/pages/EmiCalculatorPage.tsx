import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calculator, Download, ArrowRight, CheckCircle2, 
  HelpCircle, RefreshCw, Sliders 
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend 
} from 'recharts';

export const EmiCalculatorPage: React.FC = () => {
  const [principal, setPrincipal] = useState<number>(1000000);
  const [interestRate, setInterestRate] = useState<number>(9.5);
  const [tenureMonths, setTenureMonths] = useState<number>(60);
  const [repaymentMode, setRepaymentMode] = useState<'reducing_emi' | 'interest_only'>('reducing_emi');
  const [activeTab, setActiveTab] = useState<'yearly' | 'monthly'>('yearly');

  // Exact Reducing Balance vs Interest-Only Calculation
  const calculation = useMemo(() => {
    const P = principal;
    const r = (interestRate / 12) / 100;
    const N = tenureMonths;

    let emi = 0;
    let totalRepayment = 0;
    let totalInterest = 0;
    let remaining = P;
    const monthlySchedule = [];
    const yearlyMap = new Map<number, { year: number; principalPaid: number; interestPaid: number; balance: number }>();

    if (repaymentMode === 'interest_only') {
      // Mode A: Interest-Only Unsecured Loan
      const monthlyInterest = Math.round(P * r);
      emi = monthlyInterest;
      totalInterest = monthlyInterest * N;
      totalRepayment = P + totalInterest;

      for (let month = 1; month <= N; month++) {
        const isLast = month === N;
        const principalComponent = isLast ? P : 0;
        const interestComponent = monthlyInterest;
        remaining = isLast ? 0 : P;

        monthlySchedule.push({
          month,
          emi: isLast ? monthlyInterest + P : monthlyInterest,
          principalComponent,
          interestComponent,
          balance: remaining,
        });

        const year = Math.ceil(month / 12);
        if (!yearlyMap.has(year)) {
          yearlyMap.set(year, { year, principalPaid: 0, interestPaid: 0, balance: remaining });
        }
        const yData = yearlyMap.get(year)!;
        yData.principalPaid += principalComponent;
        yData.interestPaid += interestComponent;
        yData.balance = remaining;
      }
    } else {
      // Mode B: Reducing Balance Amortized Loan
      if (r === 0) {
        emi = Math.round(P / N);
      } else {
        emi = Math.round((P * r * Math.pow(1 + r, N)) / (Math.pow(1 + r, N) - 1));
      }

      totalRepayment = emi * N;
      totalInterest = totalRepayment - P;

      for (let month = 1; month <= N; month++) {
        const interestComponent = Math.round(remaining * r);
        const principalComponent = Math.min(emi - interestComponent, remaining);
        remaining = Math.max(0, remaining - principalComponent);

        monthlySchedule.push({
          month,
          emi,
          principalComponent,
          interestComponent,
          balance: remaining,
        });

        const year = Math.ceil(month / 12);
        if (!yearlyMap.has(year)) {
          yearlyMap.set(year, { year, principalPaid: 0, interestPaid: 0, balance: remaining });
        }
        const yData = yearlyMap.get(year)!;
        yData.principalPaid += principalComponent;
        yData.interestPaid += interestComponent;
        yData.balance = remaining;
      }
    }

    const yearlySchedule = Array.from(yearlyMap.values());

    return {
      monthlyEmi: emi,
      totalInterest,
      totalRepayment,
      monthlySchedule,
      yearlySchedule,
    };
  }, [principal, interestRate, tenureMonths, repaymentMode]);

  const pieData = [
    { name: 'Principal Amount', value: principal, color: '#0D9488' },
    { name: 'Total Interest', value: Math.max(0, calculation.totalInterest), color: '#1E3A8A' },
  ];

  const exportCsv = () => {
    let csv = 'Month,EMI Amount,Principal Paid,Interest Paid,Remaining Balance\n';
    calculation.monthlySchedule.forEach((row) => {
      csv += `${row.month},${row.emi},${row.principalComponent},${row.interestComponent},${row.balance}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Tatito_EMI_Schedule_${principal}_${tenureMonths}M_${repaymentMode}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatINR = (val: number) => '₹' + Math.round(val).toLocaleString('en-IN');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-teal-600 uppercase tracking-wider mb-1">Financial Planning Tool</div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Interactive Loan &amp; EMI Calculator
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Compare Mode B (Reducing-Balance EMI) and Mode A (Interest-Only Bullet Principal) schedules.
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start">
          <button
            type="button"
            onClick={() => setRepaymentMode('reducing_emi')}
            className={`px-3.5 py-2 rounded-lg transition-colors ${
              repaymentMode === 'reducing_emi' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mode B: Reducing EMI
          </button>
          <button
            type="button"
            onClick={() => setRepaymentMode('interest_only')}
            className={`px-3.5 py-2 rounded-lg transition-colors ${
              repaymentMode === 'interest_only' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mode A: Interest-Only
          </button>
        </div>
      </div>

      {/* Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Inputs Column (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-8 shadow-sm">
          
          {/* Slider 1: Principal Amount */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Loan Amount
              </label>
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1">
                <span className="text-xs text-slate-400 font-semibold">₹</span>
                <input
                  type="number"
                  min="25000"
                  max="15000000"
                  step="25000"
                  value={principal}
                  onChange={(e) => setPrincipal(Math.max(10000, Number(e.target.value)))}
                  className="w-28 text-right font-bold text-sm font-tabular text-slate-900 bg-transparent focus:outline-none"
                />
              </div>
            </div>
            <input
              type="range"
              min="25000"
              max="15000000"
              step="25000"
              value={principal}
              onChange={(e) => setPrincipal(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
            />
            <div className="flex justify-between text-[11px] font-tabular text-slate-400">
              <span>₹25,000</span>
              <span>₹50 Lakhs</span>
              <span>₹1.5 Crores</span>
            </div>
          </div>

          {/* Slider 2: Annual Interest Rate */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Annual Interest Rate (% p.a.)
              </label>
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1">
                <input
                  type="number"
                  min="5"
                  max="30"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Math.max(0, Number(e.target.value)))}
                  className="w-16 text-right font-bold text-sm font-tabular text-slate-900 bg-transparent focus:outline-none"
                />
                <span className="text-xs text-slate-400 font-semibold">%</span>
              </div>
            </div>
            <input
              type="range"
              min="5"
              max="24"
              step="0.25"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
            />
            <div className="flex justify-between text-[11px] font-tabular text-slate-400">
              <span>5.0% (Subsidized)</span>
              <span>8.85% (Home)</span>
              <span>14.0% (Personal)</span>
              <span>24.0%</span>
            </div>
          </div>

          {/* Slider 3: Loan Tenure */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Loan Tenure
              </label>
              <div className="flex items-center gap-2">
                <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-xs font-bold font-tabular text-slate-900">
                  {tenureMonths} Months ({Math.round((tenureMonths / 12) * 10) / 10} Yrs)
                </div>
              </div>
            </div>
            <input
              type="range"
              min="6"
              max="240"
              step="6"
              value={tenureMonths}
              onChange={(e) => setTenureMonths(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
            />
            <div className="flex justify-between text-[11px] font-tabular text-slate-400">
              <span>6 Months</span>
              <span>5 Years (60M)</span>
              <span>10 Years (120M)</span>
              <span>20 Years (240M)</span>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <div className="text-[11px] font-semibold text-slate-400 uppercase">Popular Kadapa Benchmarks</div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => { setPrincipal(500000); setInterestRate(11.5); setTenureMonths(36); }}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Personal: ₹5L @ 11.5% (3Y)
              </button>
              <button
                type="button"
                onClick={() => { setPrincipal(3500000); setInterestRate(8.85); setTenureMonths(180); }}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Home: ₹35L @ 8.85% (15Y)
              </button>
              <button
                type="button"
                onClick={() => { setPrincipal(1500000); setInterestRate(14.0); setTenureMonths(48); }}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Business: ₹15L @ 14% (4Y)
              </button>
            </div>
          </div>

        </div>

        {/* Right Summary & Breakdown Card (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
          
          <div className="text-center pb-4 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Equated Monthly Installment</span>
            <div className="text-3xl sm:text-4xl font-extrabold font-tabular text-teal-700 mt-1">
              {formatINR(calculation.monthlyEmi)}
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">per month for {tenureMonths} installments</span>
          </div>

          {/* Metric Details */}
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-2 border-b border-slate-50">
              <span className="text-slate-500 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block"></span>
                Principal Loan Amount
              </span>
              <span className="font-bold font-tabular text-slate-900">{formatINR(principal)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-50">
              <span className="text-slate-500 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-900 inline-block"></span>
                Total Interest Payable
              </span>
              <span className="font-bold font-tabular text-slate-900">{formatINR(calculation.totalInterest)}</span>
            </div>
            <div className="flex justify-between items-center py-2 text-sm font-semibold text-slate-900">
              <span>Total Repayment Commitment</span>
              <span className="font-tabular text-teal-800">{formatINR(calculation.totalRepayment)}</span>
            </div>
          </div>

          {/* Visual Pie Chart */}
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [formatINR(Number(value)), 'Amount']}
                  contentStyle={{ borderRadius: '8px', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Apply CTA */}
          <Link
            to={`/loan-application?amount=${principal}&tenure=${tenureMonths}`}
            className="w-full py-3 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <span>Proceed to Digital Application</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

        </div>

      </div>

      {/* Amortization Schedule & Balance Reduction Curve */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
        
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Amortization &amp; Principal Balance Curve</h2>
            <p className="text-xs text-slate-500">Track balance reduction across the entire repayment horizon.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveTab('yearly')}
                className={`px-3 py-1 rounded-md transition-colors ${activeTab === 'yearly' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600'}`}
              >
                Yearly View
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('monthly')}
                className={`px-3 py-1 rounded-md transition-colors ${activeTab === 'monthly' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600'}`}
              >
                Monthly Schedule
              </button>
            </div>
            <button
              type="button"
              onClick={exportCsv}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Visual Balance Curve (AreaChart) */}
        <div className="h-60 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={calculation.yearlySchedule}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="year" tickFormatter={(val) => `Yr ${val}`} fontSize={11} stroke="#94A3B8" />
              <YAxis tickFormatter={(val) => `₹${Math.round(val / 1000)}k`} fontSize={11} stroke="#94A3B8" />
              <Tooltip 
                formatter={(val: any) => [formatINR(Number(val)), 'Balance']}
                labelFormatter={(label) => `Year ${label}`}
                contentStyle={{ borderRadius: '8px', fontSize: '11px' }}
              />
              <Area 
                type="monotone" 
                dataKey="balance" 
                stroke="#0D9488" 
                fill="#CCFBF1" 
                name="Remaining Balance" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Table Breakdown */}
        <div className="overflow-x-auto max-h-80 overflow-y-auto border border-slate-100 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 sticky top-0 border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-2.5 px-4">{activeTab === 'yearly' ? 'Year' : 'Month'}</th>
                <th className="py-2.5 px-4 text-right">Principal Paid</th>
                <th className="py-2.5 px-4 text-right">Interest Paid</th>
                <th className="py-2.5 px-4 text-right">Total Payment</th>
                <th className="py-2.5 px-4 text-right">Remaining Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-tabular text-slate-700">
              {activeTab === 'yearly'
                ? calculation.yearlySchedule.map((row) => (
                    <tr key={row.year} className="hover:bg-slate-50/60">
                      <td className="py-2 px-4 font-semibold text-slate-900">Year {row.year}</td>
                      <td className="py-2 px-4 text-right">{formatINR(row.principalPaid)}</td>
                      <td className="py-2 px-4 text-right text-rose-600">{formatINR(row.interestPaid)}</td>
                      <td className="py-2 px-4 text-right font-medium">{formatINR(row.principalPaid + row.interestPaid)}</td>
                      <td className="py-2 px-4 text-right font-semibold text-slate-900">{formatINR(row.balance)}</td>
                    </tr>
                  ))
                : calculation.monthlySchedule.map((row) => (
                    <tr key={row.month} className="hover:bg-slate-50/60">
                      <td className="py-2 px-4 font-semibold text-slate-900">Month {row.month}</td>
                      <td className="py-2 px-4 text-right">{formatINR(row.principalComponent)}</td>
                      <td className="py-2 px-4 text-right text-rose-600">{formatINR(row.interestComponent)}</td>
                      <td className="py-2 px-4 text-right font-medium">{formatINR(row.emi)}</td>
                      <td className="py-2 px-4 text-right font-semibold text-slate-900">{formatINR(row.balance)}</td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
