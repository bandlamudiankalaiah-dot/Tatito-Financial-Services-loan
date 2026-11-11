import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MutualFundItem, SipMandate } from '../types';
import { 
  TrendingUp, Calendar, CheckCircle2, ShieldAlert, 
  ArrowRight, Plus, Calculator, Sliders, AlertCircle, Trash2 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend 
} from 'recharts';

export const MutualFundsPage: React.FC = () => {
  const { user } = useAuth();
  const [funds, setFunds] = useState<MutualFundItem[]>([]);
  const [sips, setSips] = useState<SipMandate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // SIP Calculator State
  const [calcMode, setCalcMode] = useState<'sip' | 'lumpsum'>('sip');
  const [monthlyInvestment, setMonthlyInvestment] = useState<number>(5000);
  const [expectedReturnRate, setExpectedReturnRate] = useState<number>(13.5);
  const [tenureYears, setTenureYears] = useState<number>(10);

  // Mandate Modal State
  const [mandateModalOpen, setMandateModalOpen] = useState<boolean>(false);
  const [selectedFundForSip, setSelectedFundForSip] = useState<MutualFundItem | null>(null);
  const [mandateAmount, setMandateAmount] = useState<number>(2000);
  const [debitDay, setDebitDay] = useState<number>(10);
  const [mandateLoading, setMandateLoading] = useState<boolean>(false);
  const [mandateSuccess, setMandateSuccess] = useState<string>('');

  const loadData = async () => {
    try {
      const [fundsData, sipsData] = await Promise.all([
        api.getMutualFunds(),
        api.getSips(),
      ]);
      if (Array.isArray(fundsData)) setFunds(fundsData);
      if (Array.isArray(sipsData)) setSips(sipsData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredFunds = funds.filter(f => {
    if (selectedCategory === 'all') return true;
    return f.category === selectedCategory;
  });

  // SIP Compound Interest Calculation: FV = P * [ (1 + i)^n - 1 ] * (1 + i) / i
  const sipCalculation = useMemo(() => {
    const r = (expectedReturnRate / 100) / 12;
    const n = tenureYears * 12;
    const P = monthlyInvestment;

    const yearlyData = [];
    let currentInvested = 0;

    for (let yr = 1; yr <= tenureYears; yr++) {
      const months = yr * 12;
      let fv = 0;
      if (calcMode === 'sip') {
        currentInvested = P * months;
        fv = Math.round(P * ((Math.pow(1 + r, months) - 1) / r) * (1 + r));
      } else {
        currentInvested = P; // lump sum
        fv = Math.round(P * Math.pow(1 + (expectedReturnRate / 100), yr));
      }
      yearlyData.push({
        year: `Yr ${yr}`,
        invested: currentInvested,
        valuation: fv,
        wealthGain: Math.max(0, fv - currentInvested),
      });
    }

    const finalValuation = yearlyData[yearlyData.length - 1]?.valuation || 0;
    const finalInvested = yearlyData[yearlyData.length - 1]?.invested || 0;

    return {
      totalInvested: finalInvested,
      estimatedReturns: finalValuation - finalInvested,
      totalValue: finalValuation,
      chartData: yearlyData,
    };
  }, [calcMode, monthlyInvestment, expectedReturnRate, tenureYears]);

  const handleStartSip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFundForSip) return;
    setMandateLoading(true);
    setMandateSuccess('');

    try {
      await api.createSip({
        fund_id: selectedFundForSip.id,
        fund_code: selectedFundForSip.fund_code,
        fund_name: selectedFundForSip.fund_name,
        monthly_amount: Number(mandateAmount),
        debit_day: Number(debitDay),
      });

      setMandateSuccess(`SIP mandate of ₹${Number(mandateAmount).toLocaleString('en-IN')}/mo authorized for ${selectedFundForSip.fund_name}.`);
      await loadData();
      setTimeout(() => {
        setMandateModalOpen(false);
        setMandateSuccess('');
      }, 1800);
    } catch (err: any) {
      console.error(err);
    } finally {
      setMandateLoading(false);
    }
  };

  const handleCancelSip = async (sipId: number) => {
    try {
      await api.cancelSip(sipId);
      setMandateSuccess(`SIP mandate #${sipId} has been cancelled.`);
      await loadData();
      setTimeout(() => setMandateSuccess(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const formatINR = (val: number) => '₹' + Math.round(val).toLocaleString('en-IN');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="text-xs font-semibold text-teal-600 uppercase tracking-wider mb-1">Direct Wealth Architecture</div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Mutual Funds &amp; SIP Wealth Accumulator
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Explore zero-commission direct-plan mutual funds, analyze risk-adjusted compound returns, and configure automated monthly SIP mandates.
          </p>
        </div>

        {/* Category Filter Pills (Button tabs allowed by frontend-design skill) */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
          {['all', 'Index', 'Equity Large Cap', 'Flexi Cap', 'Mid Cap', 'Gold / Multi Asset'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${selectedCategory === cat ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              {cat === 'all' ? 'All Funds' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* 1. INTERACTIVE SIP & COMPOUND WEALTH CALCULATOR */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-8 shadow-sm">
        
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Compound Wealth Projection Simulator</h2>
            <p className="text-xs text-slate-500">Calculate long-term financial outcomes of disciplined systematic investing.</p>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-medium self-start sm:self-auto">
            <button
              type="button"
              onClick={() => { setCalcMode('sip'); setMonthlyInvestment(5000); }}
              className={`px-3 py-1 rounded-md transition-colors ${calcMode === 'sip' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600'}`}
            >
              Monthly SIP
            </button>
            <button
              type="button"
              onClick={() => { setCalcMode('lumpsum'); setMonthlyInvestment(100000); }}
              className={`px-3 py-1 rounded-md transition-colors ${calcMode === 'lumpsum' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600'}`}
            >
              One-Time Lump Sum
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Sliders (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-slate-700 uppercase tracking-wider">
                  {calcMode === 'sip' ? 'Monthly Investment' : 'Initial Investment'}
                </label>
                <span className="font-bold font-tabular text-sm text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                  {formatINR(monthlyInvestment)}
                </span>
              </div>
              <input
                type="range"
                min={calcMode === 'sip' ? 500 : 10000}
                max={calcMode === 'sip' ? 100000 : 2000000}
                step={calcMode === 'sip' ? 500 : 10000}
                value={monthlyInvestment}
                onChange={e => setMonthlyInvestment(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
              <div className="flex justify-between text-[11px] font-tabular text-slate-400">
                <span>{calcMode === 'sip' ? '₹500/mo' : '₹10,000'}</span>
                <span>{calcMode === 'sip' ? '₹50,000/mo' : '₹10 Lakhs'}</span>
                <span>{calcMode === 'sip' ? '₹1,00,000/mo' : '₹20 Lakhs'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-slate-700 uppercase tracking-wider">Expected Annual Return</label>
                <span className="font-bold font-tabular text-sm text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                  {expectedReturnRate}% p.a.
                </span>
              </div>
              <input
                type="range"
                min="6"
                max="24"
                step="0.5"
                value={expectedReturnRate}
                onChange={e => setExpectedReturnRate(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
              <div className="flex justify-between text-[11px] font-tabular text-slate-400">
                <span>6% (Conservative)</span>
                <span>12% (Nifty Index)</span>
                <span>15% (Aggressive)</span>
                <span>24%</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-slate-700 uppercase tracking-wider">Time Horizon</label>
                <span className="font-bold font-tabular text-sm text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                  {tenureYears} Years
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={tenureYears}
                onChange={e => setTenureYears(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
              <div className="flex justify-between text-[11px] font-tabular text-slate-400">
                <span>1 Year</span>
                <span>10 Years</span>
                <span>20 Years</span>
                <span>30 Years</span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 block font-medium">Invested Amount</span>
                <span className="font-bold font-tabular text-slate-900">{formatINR(sipCalculation.totalInvested)}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 block font-medium">Est. Wealth Gain</span>
                <span className="font-bold font-tabular text-emerald-600">+{formatINR(sipCalculation.estimatedReturns)}</span>
              </div>
              <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl">
                <span className="text-[10px] text-teal-700 block font-medium">Total Maturity Value</span>
                <span className="font-extrabold font-tabular text-teal-900">{formatINR(sipCalculation.totalValue)}</span>
              </div>
            </div>

          </div>

          {/* Visual Compound Growth Chart (6 cols) */}
          <div className="lg:col-span-6 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sipCalculation.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="year" fontSize={10} stroke="#94A3B8" />
                <YAxis fontSize={10} stroke="#94A3B8" tickFormatter={v => `₹${Math.round(v / 100000)}L`} />
                <Tooltip 
                  formatter={(val: any) => [formatINR(Number(val)), 'Amount']}
                  contentStyle={{ borderRadius: '8px', fontSize: '11px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="valuation" 
                  stroke="#0D9488" 
                  fill="#CCFBF1" 
                  name="Maturity Valuation" 
                />
                <Area 
                  type="monotone" 
                  dataKey="invested" 
                  stroke="#1E3A8A" 
                  fill="#DBEAFE" 
                  name="Total Invested" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

        </div>

      </div>

      {/* 2. DIRECT MUTUAL FUNDS CATALOG */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900">Curated Direct Mutual Fund Schemes</h2>
          <span className="text-xs text-slate-400 font-tabular">{filteredFunds.length} Direct Schemes</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFunds.map((fund) => (
            <div 
              key={fund.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm hover:border-slate-300 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{fund.fund_name}</h3>
                    <span className="text-[10px] text-slate-400 font-medium">{fund.fund_house} · {fund.category}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    {fund.risk_level} Risk
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 bg-slate-50 rounded-xl text-center text-xs font-tabular">
                  <div>
                    <span className="text-[10px] text-slate-400 block">1Y CAGR</span>
                    <span className="font-bold text-emerald-600">+{fund.cagr_1y}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">3Y CAGR</span>
                    <span className="font-bold text-emerald-600">+{fund.cagr_3y}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">5Y CAGR</span>
                    <span className="font-bold text-emerald-600">+{fund.cagr_5y}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 font-tabular pt-1">
                  <div>NAV: <strong className="text-slate-900">₹{fund.nav.toFixed(2)}</strong></div>
                  <div>Expense: <strong className="text-slate-900">{fund.expense_ratio}%</strong></div>
                  <div>Min SIP: <strong className="text-slate-900">{formatINR(fund.min_sip_amount)}</strong></div>
                  <div>AUM: <strong className="text-slate-900">₹{fund.aum_cr.toLocaleString('en-IN')} Cr</strong></div>
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFundForSip(fund);
                    setMandateAmount(fund.min_sip_amount);
                    setMandateModalOpen(true);
                  }}
                  className="w-full py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Start SIP Mandate</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* 3. ACTIVE SIP MANDATES TRACKER */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Automated Monthly SIP Mandates</h2>
            <p className="text-xs text-slate-500">Track scheduled auto-debit dates and registered bank mandates.</p>
          </div>
          <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md">
            {sips.length} Active Mandates
          </span>
        </div>

        {sips.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No active SIP mandates registered. Start an automated monthly SIP in any fund above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Mandate Ref</th>
                  <th className="py-2.5 px-3">Fund Name</th>
                  <th className="py-2.5 px-3 text-right">Monthly Debit</th>
                  <th className="py-2.5 px-3">Debit Day</th>
                  <th className="py-2.5 px-3">Next Execution</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-tabular text-slate-700">
                {sips.map((sip) => (
                  <tr key={sip.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 font-mono text-[11px] font-semibold text-slate-900">{sip.mandate_ref}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900">{sip.fund_name}</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">{formatINR(sip.monthly_amount)}</td>
                    <td className="py-3 px-3">{sip.debit_day}th of month</td>
                    <td className="py-3 px-3 text-teal-700 font-medium">{sip.next_debit_date}</td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded capitalize">
                        {sip.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleCancelSip(sip.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        title="Cancel Mandate"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SIP Mandate Authorization Modal */}
      {mandateModalOpen && selectedFundForSip && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Configure Monthly SIP Mandate</h3>
              <button 
                onClick={() => setMandateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-semibold"
              >
                ✕
              </button>
            </div>

            {mandateSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs">
                {mandateSuccess}
              </div>
            )}

            <form onSubmit={handleStartSip} className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Selected Fund</span>
                <div className="font-bold text-slate-900">{selectedFundForSip.fund_name}</div>
                <div className="text-[10px] text-slate-500">Min Investment: ₹{selectedFundForSip.min_sip_amount}</div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Monthly SIP Amount (₹)</label>
                <input
                  type="number"
                  min={selectedFundForSip.min_sip_amount}
                  step="500"
                  required
                  value={mandateAmount}
                  onChange={e => setMandateAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none font-bold font-tabular"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Monthly Auto-Debit Day</label>
                <select
                  value={debitDay}
                  onChange={e => setDebitDay(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white font-tabular"
                >
                  <option value="5">5th of every month</option>
                  <option value="10">10th of every month</option>
                  <option value="15">15th of every month</option>
                  <option value="20">20th of every month</option>
                  <option value="25">25th of every month</option>
                </select>
              </div>

              <p className="text-[10px] text-slate-400">
                e-NACH Mandate: By proceeding, you authorize simulated automated monthly debits from your linked primary bank account.
              </p>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMandateModalOpen(false)}
                  className="flex-1 py-2 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={mandateLoading}
                  className="flex-1 py-2 font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                >
                  {mandateLoading ? 'Authorizing...' : 'Authorize Mandate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
