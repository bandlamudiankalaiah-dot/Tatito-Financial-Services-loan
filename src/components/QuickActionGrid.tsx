import React from 'react';
import { 
  Smartphone, 
  Tv, 
  Car, 
  Zap, 
  Droplets, 
  Flame, 
  Wifi, 
  CreditCard, 
  BadgePercent, 
  Coins
} from 'lucide-react';
import { BillCategory } from '../types';

interface QuickActionGridProps {
  onSelectCategory: (category: BillCategory) => void;
  activeCategory: BillCategory;
}

export const QuickActionGrid: React.FC<QuickActionGridProps> = ({
  onSelectCategory,
  activeCategory
}) => {
  const actions = [
    {
      category: 'mobile' as BillCategory,
      title: 'Mobile Recharge',
      subtitle: 'Jio, Airtel, Vi, BSNL',
      icon: Smartphone,
      color: 'bg-blue-500/10 text-blue-600 border-blue-200',
      badge: 'Cashback'
    },
    {
      category: 'electricity' as BillCategory,
      title: 'Electricity Bill',
      subtitle: 'APSPDCL, APEPDCL, TSSPDCL',
      icon: Zap,
      color: 'bg-amber-500/10 text-amber-600 border-amber-200',
      badge: 'AP Power'
    },
    {
      category: 'dth' as BillCategory,
      title: 'DTH Recharge',
      subtitle: 'Tata Play, Airtel, Sun Direct',
      icon: Tv,
      color: 'bg-purple-500/10 text-purple-600 border-purple-200',
      badge: 'Instant'
    },
    {
      category: 'fastag' as BillCategory,
      title: 'FASTag Recharge',
      subtitle: 'ICICI, SBI, HDFC Tolls',
      icon: Car,
      color: 'bg-rose-500/10 text-rose-600 border-rose-200',
      badge: 'Toll Pay'
    },
    {
      category: 'water' as BillCategory,
      title: 'Water Bill',
      subtitle: 'Kadapa Municipal Corp (KMC)',
      icon: Droplets,
      color: 'bg-cyan-500/10 text-cyan-600 border-cyan-200',
      badge: 'Kadapa'
    },
    {
      category: 'gas' as BillCategory,
      title: 'Gas Cylinder / Piped',
      subtitle: 'Indane, Bharat Gas, HPCL',
      icon: Flame,
      color: 'bg-orange-500/10 text-orange-600 border-orange-200',
      badge: 'LPG Booking'
    },
    {
      category: 'broadband' as BillCategory,
      title: 'Broadband / Fiber',
      subtitle: 'Airtel Xstream, JioFiber, ACT',
      icon: Wifi,
      color: 'bg-indigo-500/10 text-indigo-600 border-indigo-200',
      badge: 'High Speed'
    },
    {
      category: 'credit_card' as BillCategory,
      title: 'Credit Card Bill',
      subtitle: 'HDFC, SBI, ICICI, Axis',
      icon: CreditCard,
      color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
      badge: 'Zero Fee'
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-2">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Bharat BillPay (BBPS) &amp; Recharges
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Instant operator verification with official NPCI receipt generation
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
              ⚡ 0% Convenience Fee
            </span>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
              BBPS Verified
            </span>
          </div>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4 mt-6">
          {actions.map((act) => {
            const Icon = act.icon;
            const isSelected = activeCategory === act.category;

            return (
              <button
                key={act.category}
                onClick={() => onSelectCategory(act.category)}
                className={`p-3 sm:p-4 rounded-2xl flex flex-col items-center text-center transition-all cursor-pointer relative group ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-600 -translate-y-1'
                    : 'bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 text-slate-800 hover:-translate-y-0.5'
                }`}
              >
                {/* Badge */}
                {act.badge && (
                  <span
                    className={`absolute -top-2 right-2 text-[9px] font-extrabold px-1.5 py-0.2 rounded-md ${
                      isSelected
                        ? 'bg-white text-emerald-800 shadow-xs'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {act.badge}
                  </span>
                )}

                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center mb-2.5 transition-transform group-hover:scale-110 ${
                    isSelected ? 'bg-white/20 text-white' : act.color
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <span
                  className={`text-xs font-bold leading-tight ${
                    isSelected ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {act.title}
                </span>

                <span
                  className={`text-[10px] mt-1 line-clamp-1 ${
                    isSelected ? 'text-emerald-100' : 'text-slate-400'
                  }`}
                >
                  {act.subtitle}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
