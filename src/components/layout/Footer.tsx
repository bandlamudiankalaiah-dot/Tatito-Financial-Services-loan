import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[var(--line)] bg-[var(--card)] py-8 px-4 text-center text-[var(--mut)] text-[13px] transition-colors">
      <div className="max-w-[1100px] mx-auto space-y-3">
        <div>
          <strong className="text-[var(--ink)] text-sm">Tatito Financial Services</strong>
          <span className="mx-2">·</span>
          <span>M/s. Tatito Projects</span>
        </div>

        <div>
          Trunk Road, Near RTC Complex, Kadapa, Andhra Pradesh - 516001 · +91 8562 245678 · support@tatitofinance.com
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-[var(--lt)]">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/bills" className="hover:underline">Services &amp; Bills</Link>
          <Link to="/loans" className="hover:underline">Loans</Link>
          <Link to="/sip-calculator" className="hover:underline">SIP Calculator</Link>
          <Link to="/mutual-funds" className="hover:underline">Mutual Funds</Link>
          <Link to="/stocks" className="hover:underline">Trading &amp; Demat</Link>
          <Link to="/dashboard" className="hover:underline">Customer Portal</Link>
          <Link to="/admin" className="hover:underline">Admin</Link>
        </div>

        <div className="max-w-2xl mx-auto text-[12px] text-[var(--mut)] leading-relaxed pt-1">
          Demo &amp; prototype financial platform. Recharges, bill payments, market quotes, mutual fund NAVs, and loan approvals shown operate in simulated sandbox mode and depend on partner NBFC, SEBI broker, and regulatory approvals.
        </div>
      </div>
    </footer>
  );
};
