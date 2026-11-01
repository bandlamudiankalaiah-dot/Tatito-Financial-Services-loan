import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  TrendingUp,
  PieChart as PieIcon,
  Building2,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Wallet,
  Sparkles,
  BarChart3,
  CalendarCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';

export const InvestmentsPage: React.FC = () => {
  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const res = await api.getPortfolio();
        setPortfolio(res);
      } catch (err) {
        console.error('Failed to load portfolio', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, []);

  const assetData = [
    { name: 'Equity Stocks', value: portfolio?.equity_value || 84500, color: '#003366' },
    { name: 'Mutual Funds', value: portfolio?.mf_value || 52000, color: '#0284c7' },
    { name: 'SIP Mandates', value: portfolio?.sip_value || 18500, color: '#0d9488' },
    { name: 'Cash In Wallet', value: portfolio?.cash_balance || 45000, color: '#10b981' },
  ];

  const totalWealth = assetData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Tatito Wealth & Investment Hub
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Direct Equity Trading, Systematic Investment Plans (SIPs), Mutual Funds, and NSDL Demat Depository
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/stocks"
              className="px-4 py-2 bg-[#003366] hover:bg-[#002244] text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
            >
              Open Stock Terminal &rarr;
            </Link>
            <Link
              to="/mutual-funds"
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
            >
              Start Mutual Fund SIP &rarr;
            </Link>
          </div>
        </div>

        {/* Wealth Summary & Asset Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Portfolio Value</div>
              <div className="text-3xl font-bold font-mono tracking-tight text-slate-900 mt-2">
                ₹{totalWealth.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                <TrendingUp className="w-4 h-4" /> +14.8% Overall Growth (CAGR)
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 space-y-3 text-xs">
              {assetData.map((asset) => (
                <div key={asset.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: asset.color }} />
                    <span className="text-slate-600">{asset.name}</span>
                  </div>
                  <span className="font-mono font-medium text-slate-900">
                    ₹{asset.value.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col items-center justify-center">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 self-start">
              Asset Allocation Composition
            </h3>
            <div className="w-full h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assetData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {assetData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => `₹${Number(val).toLocaleString('en-IN')}`}
                    contentStyle={{ fontSize: '11px', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-[11px] text-slate-400 text-center mt-1">
              Balanced mix between equity appreciation and liquid capital
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-[#003366] text-white rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                <Sparkles className="w-3 h-3" /> Electronic Demat
              </div>
              <h3 className="text-lg font-bold mt-3 text-white">NSDL Demat Depository</h3>
              <p className="text-xs text-blue-200/80 mt-1 leading-relaxed">
                Seamless digital depository integration with DP ID IN300128. Trade equities and hold mutual fund units in dematerialized form.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
              <div className="text-xs font-mono text-teal-300">Status: Active & Linked</div>
              <Link
                to="/demat"
                className="px-3 py-1.5 bg-white text-slate-900 rounded-lg text-xs font-semibold hover:bg-slate-100 transition-colors"
              >
                View Demat &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* 4 Feature Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/stocks"
            className="group bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-[#003366]/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#003366] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Stock Market Terminal</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Real-time simulated ticker quotes, candlestick trends, interactive buy/sell order placement, and live watchlist management.
              </p>
            </div>
            <div className="mt-6 flex items-center text-xs font-semibold text-[#003366] group-hover:translate-x-1 transition-transform">
              Explore Equities <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>

          <Link
            to="/mutual-funds"
            className="group bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-teal-600/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <PieIcon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Direct Mutual Funds & SIPs</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Zero-commission direct schemes across Large Cap, Flexi Cap, Bluechip, and Liquid funds. Compound return calculator with auto-debit tracking.
              </p>
            </div>
            <div className="mt-6 flex items-center text-xs font-semibold text-teal-700 group-hover:translate-x-1 transition-transform">
              Explore Funds & SIPs <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>

          <Link
            to="/demat"
            className="group bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-600/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Electronic Demat Account</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                NSDL registered account credentials, statutory PAN verification check, settlement bank account details, and annual maintenance overview.
              </p>
            </div>
            <div className="mt-6 flex items-center text-xs font-semibold text-sky-700 group-hover:translate-x-1 transition-transform">
              Manage Demat <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>
        </div>

        {/* Regulatory Disclaimer */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 leading-relaxed">
            <span className="font-semibold uppercase tracking-wider block mb-0.5">
              Statutory Investment & Trading Disclosure
            </span>
            Mutual fund investments and equity trading are subject to market risks. Please read all scheme-related documents carefully before investing. Historical simulated past performance does not guarantee future financial returns. M/s. Tatito Projects operates this simulated demo terminal for educational and financial prototyping purposes.
          </div>
        </div>
      </div>
    </div>
  );
};
