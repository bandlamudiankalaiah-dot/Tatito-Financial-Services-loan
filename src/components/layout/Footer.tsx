import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MapPin, Phone, Mail, Award, Lock, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-b from-[#F5EFE0] via-[#EEF7F1] to-[#F3ECDA] text-[#284B3C] border-t border-[#E0D2A8] pt-16 pb-12 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#E0D2A8]">
          
          {/* Column 1: Brand & Headquarters */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0D4A36] to-[#176B4F] text-[#F9E29C] font-extrabold flex items-center justify-center text-sm shadow-sm border border-[#D4AF37]/60">
                TF
              </div>
              <div>
                <span className="text-base font-extrabold tracking-tight text-[#0D3828] leading-none">TATITO</span>
                <span className="block text-[10px] font-bold text-[#8C6918] tracking-wider">FINANCIAL SERVICES</span>
              </div>
            </div>

            <p className="text-[#355A4A] text-xs leading-relaxed max-w-sm">
              M/s. Tatito Projects operates an integrated modern fintech architecture providing digital borrowing workflows, mutual fund exploration, SIP mandates, and simulated equity trading from our Kadapa Central Hub.
            </p>

            <div className="space-y-1.5 text-xs text-[#284B3C]">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#8C6918] shrink-0" />
                <span>Trunk Road, Near RTC Complex, Kadapa, Andhra Pradesh - 516001</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#0E6245] shrink-0" />
                <span>+91 8562 245678 / +91 94408 11223</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#8C6918] shrink-0" />
                <span>support@tatitofinance.com</span>
              </div>
            </div>
          </div>

          {/* Column 2: Borrow Products */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#0D3828] uppercase tracking-wider">Borrow &amp; Credit</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/loans" className="hover:text-[#0B3B2B] font-medium transition-colors">Personal Loan</Link></li>
              <li><Link to="/loans" className="hover:text-[#0B3B2B] font-medium transition-colors">Home Loan</Link></li>
              <li><Link to="/loans" className="hover:text-[#0B3B2B] font-medium transition-colors">Business Loan (MSME)</Link></li>
              <li><Link to="/loans" className="hover:text-[#0B3B2B] font-medium transition-colors">Vehicle Loan</Link></li>
              <li><Link to="/loans" className="hover:text-[#0B3B2B] font-medium transition-colors">Plot &amp; Construction Loan</Link></li>
              <li><Link to="/loans" className="hover:text-[#0B3B2B] font-medium transition-colors">Loan Against Property</Link></li>
              <li><Link to="/loans" className="hover:text-[#0B3B2B] font-medium transition-colors">Hallmark Gold Loan</Link></li>
            </ul>
          </div>

          {/* Column 3: Wealth & Trading */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#0D3828] uppercase tracking-wider">Invest &amp; Trade</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/investments" className="hover:text-[#0B3B2B] font-medium transition-colors">Wealth Overview</Link></li>
              <li><Link to="/stocks" className="hover:text-[#0B3B2B] font-medium transition-colors">Stock Market Dashboard</Link></li>
              <li><Link to="/mutual-funds" className="hover:text-[#0B3B2B] font-medium transition-colors">Direct Mutual Funds</Link></li>
              <li><Link to="/mutual-funds" className="hover:text-[#0B3B2B] font-medium transition-colors">SIP Auto-Debit Mandates</Link></li>
              <li><Link to="/demat" className="hover:text-[#0B3B2B] font-medium transition-colors">Demat Onboarding</Link></li>
              <li><Link to="/emi-calculator" className="hover:text-[#0B3B2B] font-medium transition-colors">Interactive EMI Calculator</Link></li>
            </ul>
          </div>

          {/* Column 4: Platform & Roles */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#0D3828] uppercase tracking-wider">Portals &amp; Access</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/dashboard" className="hover:text-[#0B3B2B] font-medium transition-colors">Customer Portal</Link></li>
              <li><Link to="/agents" className="hover:text-[#0B3B2B] font-medium transition-colors">Channel Agent / DSA Portal</Link></li>
              <li><Link to="/credit-officer" className="hover:text-[#0B3B2B] font-medium transition-colors">Credit Underwriter Screen</Link></li>
              <li><Link to="/admin" className="hover:text-[#0B3B2B] font-medium transition-colors">Branch Admin Console</Link></li>
              <li><Link to="/profile" className="hover:text-[#0B3B2B] font-medium transition-colors">Profile &amp; KYC Verification</Link></li>
              <li><Link to="/login" className="hover:text-[#0B3B2B] font-medium transition-colors">Mock OTP Sign In</Link></li>
            </ul>
          </div>

        </div>

        {/* Regulatory & Compliance Disclosures Section */}
        <div className="pt-8 pb-6 border-b border-[#E0D2A8] text-[11px] leading-relaxed text-[#466658] space-y-3">
          <div className="flex items-center gap-2 text-[#0D3828] font-bold text-xs">
            <ShieldCheck className="w-4 h-4 text-[#0E6245] shrink-0" />
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
        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[#466658]">
          <div className="font-medium">
            &copy; {new Date().getFullYear()} M/s. Tatito Projects. All rights reserved. Kadapa, Andhra Pradesh.
          </div>
          <div className="flex items-center gap-4 text-[#284B3C] font-medium">
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
