import React from 'react';
import { 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  Sparkles, 
  Award, 
  CheckCircle2, 
  Building2, 
  Percent,
  Clock
} from 'lucide-react';

interface HeroSectionProps {
  onSelectAction: (tab: string) => void;
  onOpenQuickRecharge: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSelectAction,
  onOpenQuickRecharge
}) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-950 text-white pt-10 pb-16 lg:pt-16 lg:pb-24">
      {/* Background glowing gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headline and CTAs */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Rayalaseema's Premier Digital Financial Hub</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Tatito Financial Services{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                Kadapa
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
              Pay electricity (APSPDCL), water, gas &amp; mobile bills instantly via Bharat BillPay (BBPS). 
              Unlock transparent loans starting from <strong className="text-emerald-400">9% p.a.</strong> with instant eligibility check and same-day Kadapa branch disbursal.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOpenQuickRecharge}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>Pay Recharges &amp; Bills</span>
              </button>

              <button
                onClick={() => onSelectAction('loans')}
                className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-sm backdrop-blur-md flex items-center gap-2 transition cursor-pointer"
              >
                <span>Apply for Loan</span>
                <ArrowRight className="w-4 h-4 text-emerald-400" />
              </button>

              <button
                onClick={() => onSelectAction('calculator')}
                className="px-4 py-3.5 rounded-xl text-slate-300 hover:text-white text-sm font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Percent className="w-4 h-4 text-emerald-400" />
                <span>EMI Calculator</span>
              </button>
            </div>

            {/* Trust chips */}
            <div className="pt-4 flex flex-wrap items-center gap-4 text-xs text-slate-400 border-t border-slate-800">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>BBPS Certified</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                <span>RBI Regulated NBFC Ties</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-cyan-400" />
                <span>Kadapa Trunk Road Hub</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Highlight Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl bg-slate-800/80 border border-slate-700/80 p-6 sm:p-7 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                    TF
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Kadapa Central Rates</h3>
                    <p className="text-xs text-slate-400">Live Lending Benchmarks (2026)</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <Clock className="w-3 h-3" /> Updated Today
                </span>
              </div>

              {/* Rate Cards Preview */}
              <div className="mt-4 space-y-2.5">
                {[
                  { name: 'Home Loan', rate: '9.0% p.a.', max: '₹1,00,00,000', tag: 'Lowest Rate' },
                  { name: 'Vehicle Loan', rate: '10.0% p.a.', max: '₹20,00,000', tag: '90% Funding' },
                  { name: 'Gold Loan (AP Special)', rate: '11.0% p.a.', max: '₹20,00,000', tag: 'Same Day' },
                  { name: 'Personal Loan', rate: '14.0% p.a.', max: '₹10,00,000', tag: 'No Collateral' },
                  { name: 'Business Loan', rate: '16.0% p.a.', max: '₹50,00,000', tag: 'MSME Capital' },
                ].map((item, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50 hover:border-emerald-500/40 transition group cursor-pointer"
                    onClick={() => onSelectAction('loans')}
                  >
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-slate-400">Limit: {item.max}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-extrabold text-emerald-400">{item.rate}</div>
                      <span className="text-[9px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                        {item.tag}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Trust Stat */}
              <div className="mt-5 pt-4 border-t border-slate-700/80 grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-base font-extrabold text-white">₹150+ Cr</div>
                  <div className="text-[10px] text-slate-400">Loans Disbursed</div>
                </div>
                <div>
                  <div className="text-base font-extrabold text-emerald-400">99.98%</div>
                  <div className="text-[10px] text-slate-400">BBPS Success</div>
                </div>
                <div>
                  <div className="text-base font-extrabold text-teal-300">50,000+</div>
                  <div className="text-[10px] text-slate-400">Happy Users</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
