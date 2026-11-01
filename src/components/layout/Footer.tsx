import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MapPin, Phone, Mail, Award, Lock, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 pt-16 pb-12 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-900">
          
          {/* Column 1: Brand & Headquarters */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-500 text-slate-950 font-bold flex items-center justify-center text-sm shadow-sm">
                TF
              </div>
              <div>
                <span className="text-base font-extrabold tracking-tight text-white leading-none">TATITO</span>
                <span className="block text-[10px] font-semibold text-slate-400 tracking-wider">FINANCIAL SERVICES</span>
              </div>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              M/s. Tatito Projects operates an integrated modern fintech architecture providing digital borrowing workflows, mutual fund exploration, SIP mandates, and simulated equity trading from our Kadapa Central Hub.
            </p>

            <div className="space-y-1.5 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>Trunk Road, Near RTC Complex, Kadapa, Andhra Pradesh - 516001</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>+91 8562 245678 / +91 94408 11223</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>support@tatitofinance.com</span>
              </div>
            </div>
          </div>

          {/* Column 2: Borrow Products */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Borrow &amp; Credit</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/loans" className="hover:text-white transition-colors">Personal Loan</Link></li>
              <li><Link to="/loans" className="hover:text-white transition-colors">Home Loan</Link></li>
              <li><Link to="/loans" className="hover:text-white transition-colors">Business Loan (MSME)</Link></li>
              <li><Link to="/loans" className="hover:text-white transition-colors">Vehicle Loan</Link></li>
              <li><Link to="/loans" className="hover:text-white transition-colors">Plot &amp; Construction Loan</Link></li>
              <li><Link to="/loans" className="hover:text-white transition-colors">Loan Against Property</Link></li>
              <li><Link to="/loans" className="hover:text-white transition-colors">Hallmark Gold Loan</Link></li>
            </ul>
          </div>

          {/* Column 3: Wealth & Trading */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Invest &amp; Trade</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/investments" className="hover:text-white transition-colors">Wealth Overview</Link></li>
              <li><Link to="/stocks" className="hover:text-white transition-colors">Stock Market Dashboard</Link></li>
              <li><Link to="/mutual-funds" className="hover:text-white transition-colors">Direct Mutual Funds</Link></li>
              <li><Link to="/mutual-funds" className="hover:text-white transition-colors">SIP Auto-Debit Mandates</Link></li>
              <li><Link to="/demat" className="hover:text-white transition-colors">Demat Onboarding</Link></li>
              <li><Link to="/emi-calculator" className="hover:text-white transition-colors">Interactive EMI Calculator</Link></li>
            </ul>
          </div>

          {/* Column 4: Platform & Roles */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Portals &amp; Access</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Customer Portal</Link></li>
              <li><Link to="/agents" className="hover:text-white transition-colors">Channel Agent / DSA Portal</Link></li>
              <li><Link to="/credit-officer" className="hover:text-white transition-colors">Credit Underwriter Screen</Link></li>
              <li><Link to="/admin" className="hover:text-white transition-colors">Branch Admin Console</Link></li>
              <li><Link to="/profile" className="hover:text-white transition-colors">Profile &amp; KYC Verification</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Mock OTP Sign In</Link></li>
            </ul>
          </div>

        </div>

        {/* Regulatory & Compliance Disclosures Section */}
        <div className="pt-8 pb-6 border-b border-slate-900 text-[11px] leading-relaxed text-slate-500 space-y-3">
          <div className="flex items-center gap-2 text-slate-300 font-semibold text-xs">
            <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
            <span>Statutory Regulatory Notice &amp; Compliance Safeguards</span>
          </div>
          <p>
            <strong>Simulated Prototype Disclaimer:</strong> Tatito Financial Services is a technology architecture and financial services demonstration developed by M/s. Tatito Projects. All market quotes, stock trading orders, credit scores, mutual fund units, and BBPS utility bills presented in this environment operate as sandboxed demo data. Indicative benchmark interest rates (from 9.0% p.a.*) are for illustrative mathematical demonstration only.
          </p>
          <p>
            <strong>Lending &amp; Investment Partnerships:</strong> Tatito Financial Services operates with a compliance-first structure. Actual capital lending operates exclusively through appropriately authorized RBI-registered NBFCs or banking consortiums. Depository and trading services operate through authorized SEBI-registered brokers and depository participants (NSDL/CDSL). No live capital movement or unverified credit execution occurs without partner verification.
          </p>
        </div>

        {/* Bottom Row */}
        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} M/s. Tatito Projects. All rights reserved. Kadapa, Andhra Pradesh.
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Privacy Policy</span>
            <span>·</span>
            <span>Terms of Service</span>
            <span>·</span>
            <span>Fair Lending Practices</span>
            <span>·</span>
            <span>Grievance Redressal</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
