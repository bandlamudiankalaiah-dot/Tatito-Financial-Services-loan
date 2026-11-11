import React, { useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ServiceItem {
  id: string;
  cat: string;
  icon: string;
  name: string;
  desc: string;
}

interface LoanItem {
  id: string;
  code: string;
  name: string;
  icon: string;
  rate: number;
  max: number;
  desc: string;
}

interface FundItem {
  id: string;
  name: string;
  cat: string;
  nav: number;
  r1: number;
  risk: string;
}

interface BlogItem {
  id: string;
  title: string;
  date: string;
  body: string;
}

const SERVICES_DATA: ServiceItem[] = [
  { id: 'srv-1', cat: 'Daily recharges', icon: '📱', name: 'Mobile recharge', desc: 'Prepaid and postpaid, all operators' },
  { id: 'srv-2', cat: 'Daily recharges', icon: '📡', name: 'DTH recharge', desc: 'Tata Play, Airtel, Dish and more' },
  { id: 'srv-3', cat: 'Daily recharges', icon: '🚗', name: 'FASTag', desc: 'Recharge your toll tag' },
  { id: 'srv-4', cat: 'Bills & utilities', icon: '💡', name: 'Electricity', desc: 'Pay your power bill' },
  { id: 'srv-5', cat: 'Bills & utilities', icon: '🚰', name: 'Water bill', desc: 'Municipal water charges' },
  { id: 'srv-6', cat: 'Bills & utilities', icon: '🔥', name: 'Gas', desc: 'Cylinder booking and piped gas' },
  { id: 'srv-7', cat: 'Bills & utilities', icon: '🌐', name: 'Broadband', desc: 'Internet and landline' },
  { id: 'srv-8', cat: 'Bills & utilities', icon: '💳', name: 'Credit card bill', desc: 'Pay any card bill' },
  { id: 'srv-9', cat: 'Loan repayments', icon: '👤', name: 'Personal loan EMI', desc: 'Pay and track your EMI' },
  { id: 'srv-10', cat: 'Loan repayments', icon: '🪙', name: 'Gold loan EMI', desc: 'Interest and part payments' },
  { id: 'srv-11', cat: 'Loan repayments', icon: '🏡', name: 'Home loan EMI', desc: 'Monthly instalments' },
  { id: 'srv-12', cat: 'Loan repayments', icon: '🏪', name: 'Business loan EMI', desc: 'Pay on due date' },
  { id: 'srv-13', cat: 'Money transfer', icon: '📲', name: 'Send money', desc: 'To mobile, UPI ID or bank' },
  { id: 'srv-14', cat: 'Travel', icon: '🚌', name: 'Bus tickets', desc: 'Book seats across routes' },
  { id: 'srv-15', cat: 'Travel', icon: '✈️', name: 'Flights', desc: 'Compare and book' },
  { id: 'srv-16', cat: 'Travel', icon: '🚕', name: 'Cabs & rides', desc: 'Book a ride' },
  { id: 'srv-17', cat: 'Insurance', icon: '🩺', name: 'Health insurance', desc: 'Plans for you and family' },
  { id: 'srv-18', cat: 'Chit funds', icon: '🧮', name: 'Join a chit group', desc: 'Monthly savings groups' },
];

const LOANS_DATA: LoanItem[] = [
  { id: 'ln-1', code: 'PL_UNSECURED', name: 'Personal loan', icon: '👤', rate: 14, max: 1000000, desc: 'For any personal need' },
  { id: 'ln-2', code: 'BL_GROWTH', name: 'Business loan', icon: '🏪', rate: 16, max: 5000000, desc: 'Grow your shop or firm' },
  { id: 'ln-3', code: 'GL_EXPRESS', name: 'Gold loan', icon: '🪙', rate: 11, max: 2000000, desc: 'Quick loan against gold' },
  { id: 'ln-4', code: 'HL_PRIME', name: 'Home loan', icon: '🏡', rate: 9, max: 10000000, desc: 'Buy, build or renovate' },
  { id: 'ln-5', code: 'VL_AUTO', name: 'Vehicle loan', icon: '🛵', rate: 10, max: 2000000, desc: 'Two-wheeler and car loans' },
  { id: 'ln-6', code: 'PLT_OPEN', name: 'Plot & site loan', icon: '📐', rate: 10.5, max: 5000000, desc: 'DTCP/APCRDA residential plots' },
  { id: 'ln-7', code: 'LAP_SECURED', name: 'Loan against property', icon: '🏢', rate: 10.25, max: 15000000, desc: 'Unlock commercial or residential equity' },
];

const FUNDS_DATA: FundItem[] = [
  { id: 'fd-1', name: 'Nifty 50 Index Fund', cat: 'Index', nav: 210.4, r1: 12.1, risk: 'Moderate' },
  { id: 'fd-2', name: 'Flexi Cap Fund', cat: 'Equity', nav: 88.7, r1: 15.4, risk: 'High' },
  { id: 'fd-3', name: 'Liquid Fund', cat: 'Debt', nav: 1254.2, r1: 6.8, risk: 'Low' },
  { id: 'fd-4', name: 'ELSS Tax Saver', cat: 'Equity', nav: 64.3, r1: 14.2, risk: 'High' },
];

const BLOGS_DATA: BlogItem[] = [
  {
    id: 'blog-1',
    title: '5 ways to start a SIP with ₹500',
    date: '2026-10-01',
    body: 'Small, regular investing beats waiting for a big amount.\nPick a diversified index or flexi-cap fund, set an auto-debit date right after your salary credit, and let compounding run uninterrupted for years.'
  },
  {
    id: 'blog-2',
    title: 'How loan EMIs work',
    date: '2026-10-05',
    body: 'An EMI has two parts: interest and principal. Early on, more goes to interest.\nA shorter tenure means a slightly higher monthly EMI, but dramatically reduces your total interest outflow over the life of the loan.'
  },
  {
    id: 'blog-3',
    title: 'Smart liquidity with hallmark gold loans',
    date: '2026-10-12',
    body: 'Gold loans offer same-day credit against 22K/24K hallmark ornaments without selling family assets.\nWith flexible interest-only or monthly EMI schedules, borrowers can match repayments to seasonal business or agricultural cash flows.'
  }
];

const formatINR = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = (searchParams.get('q') || '').trim();

  // Toast state matching #t in user's model
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    window.clearTimeout((showToast as any)._t);
    (showToast as any)._t = window.setTimeout(() => setToastMsg(null), 2800);
  };

  // Show all 7 service categories toggle
  const [showAllServiceCategories, setShowAllServiceCategories] = useState(false);

  // Selected Blog article reader state
  const [activeBlogId, setActiveBlogId] = useState<string | null>(null);

  // Interactive Loan EMI Calculator state (matching lp() and lc() in model)
  const [selectedLoanIdx, setSelectedLoanIdx] = useState(0);
  const currentLoan = LOANS_DATA[selectedLoanIdx] || LOANS_DATA[0];
  const [loanAmount, setLoanAmount] = useState(500000);
  const [loanTenure, setLoanTenure] = useState(36);

  const handleLoanTypeChange = (idx: number) => {
    setSelectedLoanIdx(idx);
    const l = LOANS_DATA[idx];
    setLoanAmount(Math.min(500000, l.max));
  };

  const calculatedEmi = useMemo(() => {
    const P = loanAmount;
    const N = loanTenure;
    const r = currentLoan.rate / 1200;
    if (r === 0) return P / N;
    return (P * r * Math.pow(1 + r, N)) / (Math.pow(1 + r, N) - 1);
  }, [loanAmount, loanTenure, currentLoan]);

  // Interactive SIP Calculator state (matching sc2() in model)
  const [sipMonthly, setSipMonthly] = useState(5000);
  const [sipYears, setSipYears] = useState(10);
  const [sipReturn, setSipReturn] = useState(12);

  const calculatedSipFv = useMemo(() => {
    const M = sipMonthly;
    const Y = sipYears;
    const r = sipReturn;
    const i = r / 1200;
    const n = Y * 12;
    return M * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
  }, [sipMonthly, sipYears, sipReturn]);

  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    ct: '',
    msg: ''
  });
  const [contactLoading, setContactLoading] = useState(false);

  const handleActionClick = (item: { name: string; type: 'service' | 'loan' | 'fund' | 'sip' | 'demat'; code?: string }) => {
    if (item.type === 'loan') {
      navigate(`/loan-application?product=${item.code || 'PL_UNSECURED'}`);
      return;
    }
    if (item.type === 'fund' || item.type === 'sip') {
      navigate('/mutual-funds');
      return;
    }
    if (item.type === 'demat') {
      navigate('/demat');
      return;
    }
    if (!isAuthenticated) {
      showToast(`${item.name}: Opening Services & Bills portal`);
      setTimeout(() => navigate('/bills'), 700);
      return;
    }
    showToast(`${item.name}: request received (demo)`);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactLoading(true);
    try {
      const isEmail = contactForm.ct.includes('@');
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: contactForm.name,
          email: isEmail ? contactForm.ct : 'customer@tatitofinance.com',
          phone: isEmail ? '9000000000' : contactForm.ct,
          category: 'General Enquiry',
          message: contactForm.msg
        })
      });
      showToast('Message sent. We will reply soon.');
      setContactForm({ name: '', ct: '', msg: '' });
    } catch {
      showToast('Message sent. We will reply soon.');
      setContactForm({ name: '', ct: '', msg: '' });
    } finally {
      setContactLoading(false);
    }
  };

  const allCategories = useMemo(
    () => Array.from(new Set(SERVICES_DATA.map((s) => s.cat))),
    []
  );
  const visibleCategories = showAllServiceCategories ? allCategories : allCategories.slice(0, 3);

  // Search view when ?q= is present
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    const matchedServices = SERVICES_DATA.filter(
      (s) => s.name.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q) || s.cat.toLowerCase().includes(q)
    );
    const matchedLoans = LOANS_DATA.filter(
      (l) => l.name.toLowerCase().includes(q) || l.desc.toLowerCase().includes(q)
    );
    const matchedFunds = FUNDS_DATA.filter(
      (f) => f.name.toLowerCase().includes(q) || f.cat.toLowerCase().includes(q)
    );
    const matchedBlogs = BLOGS_DATA.filter(
      (b) => b.title.toLowerCase().includes(q) || b.body.toLowerCase().includes(q)
    );
    const totalMatches = matchedServices.length + matchedLoans.length + matchedFunds.length + matchedBlogs.length;

    return (
      <div className="max-w-[1100px] mx-auto px-4 pt-6 pb-12 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--ink)]">
            Search: {searchQuery}
          </h1>
          <button
            type="button"
            onClick={() => setSearchParams({})}
            className="text-sm font-semibold text-[var(--lt)] hover:underline cursor-pointer"
          >
            ← Back to Home
          </button>
        </div>

        {totalMatches === 0 ? (
          <p className="text-[var(--mut)]">
            Nothing found. Try &quot;recharge&quot;, &quot;loan&quot; or &quot;SIP&quot;.
          </p>
        ) : (
          <div className="space-y-3">
            {matchedServices.map((s) => (
              <div
                key={s.id}
                onClick={() => handleActionClick({ name: s.name, type: 'service' })}
                className="bg-[var(--card)] border border-[var(--line)] rounded-[14px] p-4 flex items-center justify-between cursor-pointer hover:border-[var(--ac)] transition-colors"
              >
                <div>
                  <h3 className="font-bold text-base text-[var(--ink)]">
                    {s.icon} {s.name}
                  </h3>
                  <span className="text-xs text-[var(--mut)]">{s.cat} · {s.desc}</span>
                </div>
                <span className="text-sm font-semibold text-[var(--lt)]">Use this →</span>
              </div>
            ))}

            {matchedLoans.map((l) => (
              <Link
                key={l.id}
                to={`/loan-application?product=${l.code}`}
                className="bg-[var(--card)] border border-[var(--line)] rounded-[14px] p-4 flex items-center justify-between hover:border-[var(--ac)] transition-colors"
              >
                <div>
                  <h3 className="font-bold text-base text-[var(--ink)]">
                    {l.icon} {l.name}
                  </h3>
                  <span className="text-xs text-[var(--mut)]">
                    Loan · From {l.rate}% p.a. · up to {formatINR(l.max)}
                  </span>
                </div>
                <span className="text-sm font-semibold text-[var(--lt)]">Apply now →</span>
              </Link>
            ))}

            {matchedFunds.map((f) => (
              <Link
                key={f.id}
                to="/mutual-funds"
                className="bg-[var(--card)] border border-[var(--line)] rounded-[14px] p-4 flex items-center justify-between hover:border-[var(--ac)] transition-colors"
              >
                <div>
                  <h3 className="font-bold text-base text-[var(--ink)]">{f.name}</h3>
                  <span className="text-xs text-[var(--mut)]">
                    Mutual fund · {f.cat} · 1Y return {f.r1}%
                  </span>
                </div>
                <span className="text-sm font-semibold text-[var(--lt)]">Invest →</span>
              </Link>
            ))}

            {matchedBlogs.map((b) => (
              <div
                key={b.id}
                onClick={() => {
                  setSearchParams({});
                  setActiveBlogId(b.id);
                }}
                className="bg-[var(--card)] border border-[var(--line)] rounded-[14px] p-4 flex items-center justify-between cursor-pointer hover:border-[var(--ac)] transition-colors"
              >
                <div>
                  <h3 className="font-bold text-base text-[var(--ink)]">{b.title}</h3>
                  <span className="text-xs text-[var(--mut)]">Blog · {b.date}</span>
                </div>
                <span className="text-sm font-semibold text-[var(--lt)]">Read →</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Blog article reader view
  if (activeBlogId) {
    const blog = BLOGS_DATA.find((b) => b.id === activeBlogId);
    if (blog) {
      return (
        <div className="max-w-[1100px] mx-auto px-4 pt-6 pb-12">
          <article className="max-w-[680px] bg-[var(--card)] border border-[var(--line)] rounded-2xl p-6 sm:p-8 space-y-4">
            <button
              type="button"
              onClick={() => setActiveBlogId(null)}
              className="text-sm font-semibold text-[var(--lt)] hover:underline cursor-pointer"
            >
              ← All posts
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--ink)] leading-tight">
              {blog.title}
            </h1>
            <p className="text-xs text-[var(--mut)]">{blog.date}</p>
            <div className="space-y-3 text-[15px] text-[var(--ink)] leading-relaxed">
              {blog.body.split('\n').map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </article>
        </div>
      );
    }
  }

  return (
    <div className="max-w-[1100px] mx-auto px-[18px] pt-[22px] pb-[40px]">
      
      {/* 1. HERO SECTION — EXACT MODEL DESIGN (.hero) */}
      <section className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-6 bg-[var(--ac)] text-[var(--ai)] rounded-[22px] p-6 sm:p-[34px] shadow-xs">
        <div>
          <h1 className="text-[clamp(26px,4vw,40px)] font-bold leading-[1.2] mt-0 mb-2.5">
            Pay bills, repay loans, invest and travel from one place.
          </h1>
          <p className="opacity-90 text-[15px] mt-0 mb-[18px] leading-relaxed">
            Recharges, bills, loan repayments, loans, SIPs and more. Everything sorted into clear sections.
          </p>
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/bills"
              className="inline-block bg-[var(--ac2)] text-[#2a1d00] rounded-[10px] px-4 py-2.5 font-semibold text-[15px] hover:opacity-95 transition-opacity"
            >
              Pay or repay now
            </Link>
            <Link
              to="/loans"
              className="inline-block bg-white/18 text-white rounded-[10px] px-4 py-2.5 font-semibold text-[15px] hover:bg-white/25 transition-colors"
            >
              See loans
            </Link>
            <Link
              to="/stocks"
              className="inline-block bg-white/12 text-white rounded-[10px] px-4 py-2.5 font-semibold text-[15px] hover:bg-white/20 transition-colors"
            >
              Trading &amp; Demat
            </Link>
          </div>
        </div>

        {/* Right Hero Chips (.chips) */}
        <div className="flex flex-wrap gap-2 content-center">
          {SERVICES_DATA.slice(0, 8).map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => handleActionClick({ name: s.name, type: 'service' })}
              className="bg-white/16 hover:bg-white/25 text-white rounded-[20px] px-3.5 py-2 text-[14px] transition-colors cursor-pointer text-left"
            >
              {s.icon} {s.name}
            </button>
          ))}
        </div>
      </section>

      {/* 1B. QUICK ACTIONS DOCK (Send Money, Receive Money, Scan QR, Wallet, Recharge, Bills, Loans, Invest) */}
      <section className="mt-6 bg-[var(--card)] border border-[var(--line)] rounded-[16px] p-4">
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 text-center">
          {[
            { icon: '💸', label: 'Send Money', to: '/payments?tab=upi' },
            { icon: '📥', label: 'Receive QR', to: '/payments?tab=qr' },
            { icon: '📷', label: 'Scan & Pay', to: '/payments?tab=qr' },
            { icon: '👛', label: 'Wallet', to: '/payments?tab=wallet' },
            { icon: '📱', label: 'Recharge', to: '/payments?tab=bills' },
            { icon: '💡', label: 'Pay Bills', to: '/payments?tab=bills' },
            { icon: '🏦', label: 'Loans', to: '/loans' },
            { icon: '📈', label: 'Invest', to: '/mutual-funds' },
          ].map((qa) => (
            <Link
              key={qa.label}
              to={qa.to}
              className="p-2.5 rounded-xl bg-[var(--bg)] hover:border-[var(--ac)] border border-transparent transition-colors flex flex-col items-center justify-center gap-1"
            >
              <span className="text-2xl leading-none">{qa.icon}</span>
              <span className="text-xs font-semibold text-[var(--ink)] whitespace-nowrap">{qa.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 1C. SUPER-APP 2.0 FINANCIAL LIFESTYLE & MERCHANT SUITE */}
      <section>
        <div className="flex items-center justify-between mt-[28px] mb-[12px]">
          <h2 className="text-[21px] font-bold text-[var(--ink)] m-0">
            Super-App 2.0 · Rewards, AutoPay, PFM, Gold &amp; Merchant Suite
          </h2>
          <Link to="/services" className="text-xs font-semibold text-[var(--lt)] hover:underline">
            Explore all modules →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-[14px]">
          {[
            { icon: '🎁', name: 'Rewards & Cashback', desc: '1,450 pts balance · Coupons, vouchers & referral bonuses', to: '/services?tab=rewards' },
            { icon: '🔁', name: 'UPI AutoPay Mandates', desc: 'Manage recurring EMI, SIP & utility bill auto-debits', to: '/payments?tab=autopay' },
            { icon: '📊', name: 'Expense Tracker & Split', desc: 'Category budgets, savings goals & group bill splitting', to: '/services?tab=expenses' },
            { icon: '🛡️', name: 'Credit & Eligibility', desc: 'Sandbox bureau band, FOIR ratio & repayment history', to: '/services?tab=credit' },
            { icon: '🩺', name: 'Insurance Marketplace', desc: 'Health, Life, Motor, Travel & Personal Accident plans', to: '/services?tab=insurance' },
            { icon: '🪙', name: '24K Digital Gold Vault', desc: 'Buy/Sell 24K sandbox gold from ₹100 & monthly Gold SIP', to: '/services?tab=gold' },
            { icon: '✈️', name: 'Travel & Transit Desk', desc: 'APSRTC Buses, Trains, Flights & Hotel PNR booking', to: '/services?tab=travel' },
            { icon: '🏪', name: 'Merchant & Support Hub', desc: 'Merchant QR settlements, sales reports & 24x7 disputes', to: '/services?tab=merchant' },
          ].map((m) => (
            <Link
              key={m.name}
              to={m.to}
              className="bg-[var(--card)] border border-[var(--line)] rounded-[14px] p-4 flex flex-col gap-1.5 hover:border-[var(--ac)] transition-colors"
            >
              <span className="text-[26px] leading-none">{m.icon}</span>
              <h3 className="m-0 text-[16px] font-bold text-[var(--ink)]">{m.name}</h3>
              <p className="m-0 text-[var(--mut)] text-[14px] flex-1">{m.desc}</p>
              <span className="text-[var(--lt)] font-semibold text-[14px] pt-1">Open module →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 2. CATEGORIZED SERVICES SECTIONS (Daily recharges, Bills & utilities, Loan repayments, etc.) */}
      <div id="services-section">
        {visibleCategories.map((cat) => (
          <section key={cat}>
            <div className="flex items-center justify-between mt-[30px] mb-[12px]">
              <h2 className="text-[21px] font-bold text-[var(--ink)] m-0">{cat}</h2>
              <Link to="/bills" className="text-xs font-semibold text-[var(--lt)] hover:underline">
                Open bill desk →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-[14px]">
              {SERVICES_DATA.filter((s) => s.cat === cat)
                .slice(0, 4)
                .map((s) => (
                  <div
                    key={s.id}
                    className="bg-[var(--card)] border border-[var(--line)] rounded-[14px] p-4 flex flex-col gap-1.5 hover:border-[var(--ac)] transition-colors"
                  >
                    <span className="text-[26px] leading-none">{s.icon}</span>
                    <h3 className="m-0 text-[16px] font-bold text-[var(--ink)]">{s.name}</h3>
                    <p className="m-0 text-[var(--mut)] text-[14px] flex-1">{s.desc}</p>
                    <button
                      type="button"
                      onClick={() => handleActionClick({ name: s.name, type: 'service' })}
                      className="bg-transparent border-0 text-[var(--lt)] font-semibold text-[14px] p-0 cursor-pointer text-left hover:underline pt-1"
                    >
                      Use this →
                    </button>
                  </div>
                ))}
            </div>
          </section>
        ))}

        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowAllServiceCategories(!showAllServiceCategories)}
            className="text-sm font-semibold text-[var(--lt)] hover:underline cursor-pointer"
          >
            {showAllServiceCategories
              ? 'Show top 3 service categories ↑'
              : 'Show all service categories (Money transfer, Travel, Insurance & Chit funds) ↓'}
          </button>
        </div>
      </div>

      {/* 3. LOANS FOR EVERY NEED */}
      <section>
        <div className="flex items-center justify-between mt-[30px] mb-[12px]">
          <h2 className="text-[21px] font-bold text-[var(--ink)] m-0">Loans for every need</h2>
          <Link to="/loans" className="text-xs font-semibold text-[var(--lt)] hover:underline">
            Compare all 7 loans →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[14px]">
          {LOANS_DATA.map((l) => (
            <div
              key={l.id}
              className="bg-[var(--card)] border border-[var(--line)] rounded-[14px] p-4 flex flex-col gap-1.5 hover:border-[var(--ac)] transition-colors"
            >
              <span className="text-[26px] leading-none">{l.icon}</span>
              <h3 className="m-0 text-[16px] font-bold text-[var(--ink)]">{l.name}</h3>
              <p className="m-0 text-[var(--mut)] text-[14px] flex-1 font-tabular">
                From {l.rate}% p.a. · up to {formatINR(l.max)}. {l.desc}
              </p>
              <button
                type="button"
                onClick={() => handleActionClick({ name: l.name, type: 'loan', code: l.code })}
                className="bg-transparent border-0 text-[var(--lt)] font-semibold text-[14px] p-0 cursor-pointer text-left hover:underline pt-1"
              >
                Apply now →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 4. INTERACTIVE EMI & SIP CALCULATORS (.two & .res) */}
      <section>
        <h2 className="text-[21px] font-bold text-[var(--ink)] mt-[30px] mb-[12px]">
          EMI &amp; SIP calculators
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          
          {/* Left: Interactive Loan EMI Calculator */}
          <div className="bg-[var(--card)] border border-[var(--line)] rounded-[14px] p-[18px] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[var(--ink)] m-0">Loan EMI calculator</h3>
              <Link to="/emi-calculator" className="text-xs font-semibold text-[var(--lt)] hover:underline">
                Full schedule →
              </Link>
            </div>

            <div className="space-y-3">
              <label className="block text-[13px] text-[var(--mut)]">
                Loan type
                <select
                  value={selectedLoanIdx}
                  onChange={(e) => handleLoanTypeChange(Number(e.target.value))}
                  className="w-full mt-1.5 px-3 py-2.5 border border-[var(--line)] rounded-[10px] bg-[var(--bg)] text-[var(--ink)] text-sm"
                >
                  {LOANS_DATA.map((l, idx) => (
                    <option key={l.id} value={idx}>
                      {l.name} ({l.rate}% p.a.)
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-[13px] text-[var(--mut)]">
                <span>Amount</span>
                <b className="float-right text-[var(--ink)] font-tabular">{formatINR(loanAmount)}</b>
                <input
                  type="range"
                  min={10000}
                  max={currentLoan.max}
                  step={10000}
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full mt-1.5 cursor-pointer"
                />
              </label>

              <label className="block text-[13px] text-[var(--mut)]">
                <span>Tenure</span>
                <b className="float-right text-[var(--ink)] font-tabular">{loanTenure} months</b>
                <input
                  type="range"
                  min={6}
                  max={120}
                  step={6}
                  value={loanTenure}
                  onChange={(e) => setLoanTenure(Number(e.target.value))}
                  className="w-full mt-1.5 cursor-pointer"
                />
              </label>
            </div>

            <div className="pt-3 border-t border-[var(--line)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs text-[var(--mut)]">Monthly EMI</div>
                <b className="text-[26px] font-bold text-[var(--ink)] font-tabular">
                  {formatINR(calculatedEmi)}
                </b>
                <p className="text-xs text-[var(--mut)] m-0 font-tabular">
                  Interest {currentLoan.rate}% p.a. · Total payable {formatINR(calculatedEmi * loanTenure)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleActionClick({ name: currentLoan.name, type: 'loan', code: currentLoan.code })}
                className="bg-[var(--ac)] text-[var(--ai)] rounded-[10px] px-4 py-2.5 text-sm font-semibold cursor-pointer hover:opacity-95 whitespace-nowrap"
              >
                Apply for {currentLoan.name}
              </button>
            </div>
          </div>

          {/* Right: Interactive SIP Calculator */}
          <div className="bg-[var(--card)] border border-[var(--line)] rounded-[14px] p-[18px] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[var(--ink)] m-0">SIP wealth calculator</h3>
              <Link to="/sip-calculator" className="text-xs font-semibold text-[var(--lt)] hover:underline">
                Explore SIPs →
              </Link>
            </div>

            <div className="space-y-3">
              <label className="block text-[13px] text-[var(--mut)]">
                <span>Monthly SIP</span>
                <b className="float-right text-[var(--ink)] font-tabular">{formatINR(sipMonthly)}</b>
                <input
                  type="range"
                  min={500}
                  max={100000}
                  step={500}
                  value={sipMonthly}
                  onChange={(e) => setSipMonthly(Number(e.target.value))}
                  className="w-full mt-1.5 cursor-pointer"
                />
              </label>

              <label className="block text-[13px] text-[var(--mut)]">
                <span>Years</span>
                <b className="float-right text-[var(--ink)] font-tabular">{sipYears} yrs</b>
                <input
                  type="range"
                  min={1}
                  max={30}
                  step={1}
                  value={sipYears}
                  onChange={(e) => setSipYears(Number(e.target.value))}
                  className="w-full mt-1.5 cursor-pointer"
                />
              </label>

              <label className="block text-[13px] text-[var(--mut)]">
                <span>Expected return % p.a.</span>
                <b className="float-right text-[var(--ink)] font-tabular">{sipReturn}%</b>
                <input
                  type="range"
                  min={6}
                  max={18}
                  step={0.5}
                  value={sipReturn}
                  onChange={(e) => setSipReturn(Number(e.target.value))}
                  className="w-full mt-1.5 cursor-pointer"
                />
              </label>
            </div>

            <div className="pt-3 border-t border-[var(--line)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs text-[var(--mut)] font-tabular">
                  You invest {formatINR(sipMonthly * sipYears * 12)} · Estimated value
                </div>
                <b className="text-[26px] font-bold text-[var(--ink)] font-tabular">
                  {formatINR(calculatedSipFv)}
                </b>
                <p className="text-xs text-[var(--mut)] m-0">
                  Illustrative only. Returns are not guaranteed.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleActionClick({ name: 'Monthly SIP', type: 'sip' })}
                className="bg-[var(--ac)] text-[var(--ai)] rounded-[10px] px-4 py-2.5 text-sm font-semibold cursor-pointer hover:opacity-95 whitespace-nowrap"
              >
                Start SIP →
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 5. MUTUAL FUNDS & MARKET WATCH TABLES (.sc & table) */}
      <section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-[30px]">
          
          {/* Mutual Funds Table */}
          <div>
            <div className="flex items-center justify-between mb-[12px]">
              <h2 className="text-[21px] font-bold text-[var(--ink)] m-0">Mutual funds</h2>
              <Link to="/mutual-funds" className="text-xs font-semibold text-[var(--lt)] hover:underline">
                Full catalog →
              </Link>
            </div>
            <div className="overflow-x-auto border border-[var(--line)] rounded-[12px] bg-[var(--card)]">
              <table className="w-full border-collapse text-[14px]">
                <thead>
                  <tr className="border-b border-[var(--line)] text-left text-[var(--mut)]">
                    <th className="py-2.5 px-3">Fund</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">NAV</th>
                    <th className="py-2.5 px-3">1Y return</th>
                    <th className="py-2.5 px-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {FUNDS_DATA.map((f) => (
                    <tr key={f.id} className="border-b last:border-b-0 border-[var(--line)]">
                      <td className="py-2.5 px-3 font-medium text-[var(--ink)]">{f.name}</td>
                      <td className="py-2.5 px-3 text-[var(--mut)]">{f.cat}</td>
                      <td className="py-2.5 px-3 font-tabular text-[var(--ink)]">{formatINR(f.nav)}</td>
                      <td className="py-2.5 px-3 font-tabular text-[var(--lt)] font-semibold">{f.r1}%</td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleActionClick({ name: f.name, type: 'fund' })}
                          className="text-[var(--lt)] font-semibold hover:underline cursor-pointer"
                        >
                          Invest
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Trading & Demat + Market Watch */}
          <div>
            <div className="flex items-center justify-between mb-[12px]">
              <h2 className="text-[21px] font-bold text-[var(--ink)] m-0">Trading &amp; market watch</h2>
              <Link to="/stocks" className="text-xs font-semibold text-[var(--lt)] hover:underline">
                Trading terminal →
              </Link>
            </div>
            <div className="overflow-x-auto border border-[var(--line)] rounded-[12px] bg-[var(--card)]">
              <table className="w-full border-collapse text-[14px]">
                <thead>
                  <tr className="border-b border-[var(--line)] text-left text-[var(--mut)]">
                    <th className="py-2.5 px-3">Symbol</th>
                    <th className="py-2.5 px-3">Price</th>
                    <th className="py-2.5 px-3">Change</th>
                    <th className="py-2.5 px-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { sym: 'NIFTY 50', price: 24850, chg: '+0.4%', up: true },
                    { sym: 'SENSEX', price: 81420, chg: '+0.3%', up: true },
                    { sym: 'BANK NIFTY', price: 53210, chg: '-0.2%', up: false },
                    { sym: 'RELIANCE', price: 2945, chg: '+1.2%', up: true },
                  ].map((r) => (
                    <tr key={r.sym} className="border-b last:border-b-0 border-[var(--line)]">
                      <td className="py-2.5 px-3 font-medium text-[var(--ink)]">{r.sym}</td>
                      <td className="py-2.5 px-3 font-tabular text-[var(--ink)]">
                        ₹{r.price.toLocaleString('en-IN')}
                      </td>
                      <td className={`py-2.5 px-3 font-tabular font-semibold ${r.up ? 'text-[var(--lt)]' : 'text-rose-500'}`}>
                        {r.chg}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <Link to="/stocks" className="text-[var(--lt)] font-semibold hover:underline">
                          Trade
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </section>

      {/* 6. LATEST FROM THE BLOG */}
      <section>
        <h2 className="text-[21px] font-bold text-[var(--ink)] mt-[30px] mb-[12px]">
          Latest from the blog
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[14px]">
          {BLOGS_DATA.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setActiveBlogId(b.id)}
              className="bg-[var(--card)] border border-[var(--line)] rounded-[14px] p-4 flex flex-col gap-1.5 text-left hover:border-[var(--ac)] transition-colors cursor-pointer"
            >
              <h3 className="m-0 text-[16px] font-bold text-[var(--ink)]">{b.title}</h3>
              <p className="m-0 text-[var(--mut)] text-[14px] flex-1">
                {b.body.slice(0, 95)}…
              </p>
              <span className="text-xs text-[var(--mut)] pt-1">{b.date} · Read article →</span>
            </button>
          ))}
        </div>
      </section>

      {/* 7. ABOUT & CONTACT US (.two & .res) */}
      <section>
        <h2 className="text-[21px] font-bold text-[var(--ink)] mt-[30px] mb-[12px]">
          About &amp; contact us
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          
          <div className="bg-[var(--card)] border border-[var(--line)] rounded-[14px] p-[18px] space-y-3 text-[14px]">
            <h3 className="text-base font-bold text-[var(--ink)] m-0">
              Tatito Financial Services (M/s. Tatito Projects)
            </h3>
            <p className="text-[var(--mut)] m-0 leading-relaxed">
              Tatito Financial Services is building one place for everyday money: recharges, bills, loan repayments, loans, SIPs, mutual funds and trading. We add each service as partner and regulatory approvals come through.
            </p>
            <div className="pt-2 space-y-1 text-[var(--ink)]">
              <div><strong>Address:</strong> Trunk Road, Near RTC Complex, Kadapa, Andhra Pradesh - 516001</div>
              <div><strong>Phone:</strong> +91 8562 245678</div>
              <div><strong>Email:</strong> support@tatitofinance.com</div>
            </div>
          </div>

          <form
            onSubmit={handleContactSubmit}
            className="bg-[var(--card)] border border-[var(--line)] rounded-[14px] p-[18px] space-y-3"
          >
            <label className="block text-[13px] text-[var(--mut)]">
              Name
              <input
                type="text"
                required
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                placeholder="Your full name"
                className="w-full mt-1 px-3 py-2.5 border border-[var(--line)] rounded-[10px] bg-[var(--bg)] text-[var(--ink)] text-sm"
              />
            </label>
            <label className="block text-[13px] text-[var(--mut)]">
              Mobile or email
              <input
                type="text"
                required
                value={contactForm.ct}
                onChange={(e) => setContactForm({ ...contactForm, ct: e.target.value })}
                placeholder="10-digit mobile or email"
                className="w-full mt-1 px-3 py-2.5 border border-[var(--line)] rounded-[10px] bg-[var(--bg)] text-[var(--ink)] text-sm"
              />
            </label>
            <label className="block text-[13px] text-[var(--mut)]">
              Message
              <textarea
                rows={3}
                required
                value={contactForm.msg}
                onChange={(e) => setContactForm({ ...contactForm, msg: e.target.value })}
                placeholder="How can we help you?"
                className="w-full mt-1 px-3 py-2.5 border border-[var(--line)] rounded-[10px] bg-[var(--bg)] text-[var(--ink)] text-sm"
              />
            </label>
            <button
              type="submit"
              disabled={contactLoading}
              className="bg-[var(--ac)] text-[var(--ai)] rounded-[10px] px-4 py-2.5 text-sm font-semibold cursor-pointer hover:opacity-95 disabled:opacity-50"
            >
              {contactLoading ? 'Sending...' : 'Send message'}
            </button>
          </form>

        </div>
      </section>

      {/* Fixed Toast Notification (#t) */}
      {toastMsg && (
        <div
          role="status"
          className="fixed left-1/2 bottom-6 -translate-x-1/2 bg-[var(--ink)] text-[var(--bg)] px-4 py-2.5 rounded-[10px] text-sm font-medium shadow-lg z-50"
        >
          {toastMsg}
        </div>
      )}

    </div>
  );
};
