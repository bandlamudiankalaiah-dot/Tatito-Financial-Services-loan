import React from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Lock, 
  ExternalLink,
  Heart,
  ChevronRight
} from 'lucide-react';

interface FooterProps {
  onSelectTab: (tab: string) => void;
  onOpenAdmin: () => void;
  onOpenApiDocs: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectTab,
  onOpenAdmin,
  onOpenApiDocs
}) => {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
      {/* Upper Footer: Company Highlights */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-slate-950 font-black">
                TF
              </div>
              <div>
                <span className="text-lg font-black text-white tracking-tight">
                  TATITO FINANCIAL SERVICES
                </span>
                <div className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider">
                  Kadapa, Andhra Pradesh, India
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              Kadapa’s trusted fintech gateway for instant Bharat BillPay (BBPS) utility recharges, 
              electricity bills (APSPDCL/APEPDCL), and collateral-free personal &amp; gold loans with reducing balance transparency.
            </p>

            <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 text-xs space-y-2">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-slate-300 leading-snug">
                  Door No. 4/320, Trunk Road, Near 7-Roads Junction, Kadapa, YSR District, Andhra Pradesh - 516001
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-slate-300 font-mono">+91 8562 245678 / +91 94401 23456</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-slate-300">support@tatitofinance.com</span>
              </div>
            </div>
          </div>

          {/* Col 2: Services & Recharges */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              BBPS Services
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => onSelectTab('services')} className="hover:text-emerald-400 transition cursor-pointer">
                  Mobile Recharge (Jio/Airtel)
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('services')} className="hover:text-emerald-400 transition cursor-pointer">
                  APSPDCL Electricity Bill
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('services')} className="hover:text-emerald-400 transition cursor-pointer">
                  DTH &amp; FASTag Tolls
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('services')} className="hover:text-emerald-400 transition cursor-pointer">
                  Kadapa Municipal Water
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('services')} className="hover:text-emerald-400 transition cursor-pointer">
                  LPG Gas Booking
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('services')} className="hover:text-emerald-400 transition cursor-pointer">
                  Credit Card Payments
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Lending & Loans */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Loans &amp; EMIs
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => onSelectTab('loans')} className="hover:text-emerald-400 transition cursor-pointer">
                  Home Loan (From 9% p.a.)
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('loans')} className="hover:text-emerald-400 transition cursor-pointer">
                  Vehicle Loan (From 10% p.a.)
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('loans')} className="hover:text-emerald-400 transition cursor-pointer">
                  Gold Loan (From 11% p.a.)
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('loans')} className="hover:text-emerald-400 transition cursor-pointer">
                  Personal Loan (From 14% p.a.)
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('loans')} className="hover:text-emerald-400 transition cursor-pointer">
                  Business Loan (From 16% p.a.)
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('calculator')} className="hover:text-emerald-400 transition cursor-pointer">
                  EMI Calculator
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Compliance & Admin */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Governance &amp; Internal
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Operating in full compliance with Reserve Bank of India (RBI) Fair Practices Code for NBFCs and Bharat BillPay NPCI standards.
            </p>

            {/* Secure Admin Portal Link */}
            <div className="pt-2">
              <button
                type="button"
                onClick={onOpenAdmin}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 text-slate-200 text-xs font-bold flex items-center justify-between group transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Secure Admin Portal</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div>
              <button
                type="button"
                onClick={onOpenApiDocs}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <span>View FastAPI Backend Docs</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-slate-900/90 py-5 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            &copy; {new Date().getFullYear()} Tatito Financial Services, Kadapa, Andhra Pradesh. All rights reserved.
          </div>

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 256-bit SSL Protected
            </span>
            <span className="text-slate-600">•</span>
            <span>Privacy Policy</span>
            <span className="text-slate-600">•</span>
            <span>Terms of Service</span>
            <span className="text-slate-600">•</span>
            <span>Grievance Redressal</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
