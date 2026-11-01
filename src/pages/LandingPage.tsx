import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, ShieldCheck, TrendingUp, Landmark, Calculator, 
  CheckCircle2, ChevronDown, ChevronUp, FileText, Users, Clock, 
  Lock, Award, Building, Sparkles, AlertCircle, PhoneCall
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [contactForm, setContactForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    category: 'Loan Enquiry',
    message: ''
  });
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);

  const loanCards = [
    {
      code: 'PL_UNSECURED',
      name: 'Personal Loan',
      rate: 'From 11.5% p.a.',
      maxAmt: 'Up to ₹10 Lakhs',
      tenure: '12 - 60 Months',
      badge: 'Quick Approval',
      desc: 'Immediate cash assistance for medical emergencies, home renovation, or education with minimal documentation.'
    },
    {
      code: 'BL_GROWTH',
      name: 'Business Loan (MSME)',
      rate: 'From 14.0% p.a.',
      maxAmt: 'Up to ₹50 Lakhs',
      tenure: '12 - 84 Months',
      badge: 'Kadapa MSME Special',
      desc: 'Working capital and machinery financing tailored for retailers, distributors, and manufacturing units.'
    },
    {
      code: 'HL_PRIME',
      name: 'Home Loan',
      rate: 'From 8.85% p.a.',
      maxAmt: 'Up to ₹1 Crore',
      tenure: 'Up to 240 Months',
      badge: 'Lowest Rate',
      desc: 'Affordable financing for residential flat purchases, independent villas, or duplex construction in Rayalaseema.'
    },
    {
      code: 'GL_EXPRESS',
      name: 'Gold Loan Express',
      rate: 'From 9.50% p.a.',
      maxAmt: 'Up to ₹20 Lakhs',
      tenure: '3 - 36 Months',
      badge: 'Same-Day Cash',
      desc: 'Immediate liquidity against hallmark 22K/24K gold jewelry at transparent per-gram valuation rates.'
    },
    {
      code: 'VL_AUTO',
      name: 'Vehicle Loan',
      rate: 'From 9.75% p.a.',
      maxAmt: 'Up to ₹20 Lakhs',
      tenure: '12 - 84 Months',
      badge: 'Up to 90% On-Road',
      desc: 'Financing for new 2-wheelers, private cars, and commercial transport vehicles with rapid digital processing.'
    },
    {
      code: 'PLT_OPEN',
      name: 'Plot & Site Loan',
      rate: 'From 9.90% p.a.',
      maxAmt: 'Up to ₹50 Lakhs',
      tenure: '36 - 180 Months',
      badge: 'DTCP/APCRDA Approved',
      desc: 'Acquire residential plots in Kadapa municipal limits with verified title documentation and flexible tenures.'
    },
    {
      code: 'LAP_SECURED',
      name: 'Loan Against Property',
      rate: 'From 10.25% p.a.',
      maxAmt: 'Up to ₹1.5 Crores',
      tenure: '36 - 180 Months',
      badge: 'High Value',
      desc: 'Unlock the equity of your residential or commercial freehold property for major capital deployment.'
    }
  ];

  const faqs = [
    {
      q: 'What is Tatito Financial Services and who operates it?',
      a: 'Tatito Financial Services is an integrated digital fintech platform developed and managed by M/s. Tatito Projects, based in Kadapa, Andhra Pradesh. We provide digital workflows for loan applications, EMI calculators, mutual fund discovery, and simulated stock trading.'
    },
    {
      q: 'How does the loan application workflow function?',
      a: 'Borrowers select a loan product, fill our digital 5-step application, and submit verifiable identity details. The dossier is queued for credit officer underwriting. Once verified, sanction letters are generated and repayment EMI schedules are initialized in the borrower dashboard.'
    },
    {
      q: 'Are market trades and portfolio holdings in this prototype real money?',
      a: 'No. All stock orders, market quotes, mutual fund SIPs, and wallet balances in this prototype operate in an explicit demo/sandbox mode with simulated data. Actual live trading and demat custody require authorized broker partner integration.'
    },
    {
      q: 'Can channel partners or Direct Selling Agents (DSA) submit customer leads?',
      a: 'Yes. DSAs have an exclusive partner portal to register borrower leads, monitor credit underwriting progress, and track tiered commission earnings (0.40% to 1.50%).'
    },
    {
      q: 'Where is Tatito Financial Services located?',
      a: 'Our central operations and customer advisory hub is located at Trunk Road, Near RTC Complex, Kadapa, Andhra Pradesh - 516001.'
    }
  ];

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm)
      });
      if (res.ok) {
        setContactSubmitted(true);
      }
    } catch {
      setContactSubmitted(true);
    } finally {
      setContactLoading(false);
    }
  };

  return (
    <div className="space-y-20 pb-16">
      
      {/* 1. HERO SECTION (1440px baseline with single visual anchor) */}
      <section className="relative overflow-hidden bg-slate-900 text-white pt-12 pb-20 lg:pt-16 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Unboxed Metadata Kicker (Anti-slop compliant) */}
              <div className="flex items-center gap-2 text-xs font-semibold text-teal-400">
                <span>Kadapa Regional Hub</span>
                <span aria-hidden="true">·</span>
                <span>M/s. Tatito Projects</span>
                <span aria-hidden="true">·</span>
                <span>All-in-One Fintech</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight" style={{ textWrap: 'balance' }}>
                Borrow, Invest &amp; Build Wealth in One Integrated Platform
              </h1>

              {/* Sub-headline */}
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
                Access low-rate retail loans, calculate exact amortized EMIs, explore curated direct mutual funds, and test equity trading from a unified, modern financial dashboard.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/loans"
                  className="px-6 py-3 text-sm font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-xl transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap shrink-0"
                >
                  <span>Explore Loans</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/emi-calculator"
                  className="px-6 py-3 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors whitespace-nowrap shrink-0"
                >
                  Calculate EMI
                </Link>
                <Link
                  to="/investments"
                  className="px-6 py-3 text-sm font-semibold text-slate-300 hover:text-white transition-colors whitespace-nowrap shrink-0"
                >
                  Wealth &amp; SIPs →
                </Link>
              </div>

              {/* Proof / Feature Metric Row */}
              <div className="pt-6 border-t border-slate-800 grid grid-cols-3 gap-6 text-left">
                <div>
                  <div className="text-xl sm:text-2xl font-bold font-tabular text-white">8.85%</div>
                  <div className="text-xs text-slate-400 mt-0.5">Indicative Rates From</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold font-tabular text-white">7 Loans</div>
                  <div className="text-xs text-slate-400 mt-0.5">Tailored Products</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold font-tabular text-white">₹1.5 Cr</div>
                  <div className="text-xs text-slate-400 mt-0.5">Max Sanction Limit</div>
                </div>
              </div>

            </div>

            {/* Right Media Hero Anchor */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 aspect-[4/3] lg:aspect-auto lg:h-[460px]">
                <img
                  src="/src/assets/images/tatito_hero_fintech_1793528358403.jpg"
                  alt="Tatito Financial Services Corporate Advisory Hub"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-800 text-white text-xs">
                  <div className="font-semibold text-sm">Tatito Advisory &amp; Operations Center</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">Trunk Road, Kadapa · Digital Underwriting Hub</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. THE THREE PILLARS: BORROW, INVEST, TRADE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-2">Our Core Pillars</div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Complete Financial Empowerment
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Whether securing credit for your family or expanding your enterprise, Tatito integrates all pillars under one roof.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Pillar 1: Borrow */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <div className="h-48 overflow-hidden bg-slate-100 relative">
              <img
                src="/src/assets/images/tatito_borrow_loans_1793528359326.jpg"
                alt="Borrow and MSME Lending"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur text-white px-2.5 py-1 rounded text-xs font-bold">
                01. BORROW
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900">Custom Retail &amp; MSME Loans</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tailored loan products with competitive interest rates, transparent fee structures, and immediate digital eligibility assessment.
                </p>
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> Personal, Home &amp; Gold Loans</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> Business MSME Capital up to ₹50L</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> Digital Amortization Schedules</li>
              </ul>
              <Link
                to="/loans"
                className="inline-flex items-center justify-between w-full px-4 py-2 text-xs font-semibold text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
              >
                <span>View Loan Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Pillar 2: Invest */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <div className="h-48 overflow-hidden bg-slate-100 relative">
              <img
                src="/src/assets/images/tatito_invest_wealth_1793528359645.jpg"
                alt="Wealth and Mutual Funds"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur text-white px-2.5 py-1 rounded text-xs font-bold">
                02. INVEST
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900">Mutual Funds &amp; SIP Wealth</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Systematic Investment Plans (SIP) starting from ₹500/mo in top index funds, large caps, and gold ETFs with compound growth projections.
                </p>
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> Curated direct-plan mutual funds</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> Automated monthly SIP mandates</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> Multi-asset allocation tracker</li>
              </ul>
              <Link
                to="/mutual-funds"
                className="inline-flex items-center justify-between w-full px-4 py-2 text-xs font-semibold text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
              >
                <span>Explore Mutual Funds</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Pillar 3: Trade */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <div className="h-48 overflow-hidden bg-slate-900 relative p-6 flex flex-col justify-between">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-teal-400">03. TRADE</span>
                <span className="text-slate-400 font-mono">NSE / BSE DEMO</span>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold font-tabular text-white tracking-tight">₹24,850.00</div>
                <div className="text-xs text-teal-400 font-medium">Simulated Trading Wallet Balance</div>
              </div>
              <div className="text-[10px] text-slate-400">Candlestick Charts &amp; Watchlist Engine</div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900">Stock Trading Simulator</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Practice trading blue-chip equities including Reliance, TCS, and HDFC with simulated order matching, watchlists, and live charts.
                </p>
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> Real-time simulated price feeds</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> Demat account onboarding flow</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> Instant simulated Buy/Sell execution</li>
              </ul>
              <Link
                to="/stocks"
                className="inline-flex items-center justify-between w-full px-4 py-2 text-xs font-semibold text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
              >
                <span>Launch Trading Terminal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 3. 7 LOAN PRODUCTS CATALOG PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-1">Financing Catalog</div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Transparent Loan Options for Every Life Stage
            </h2>
          </div>
          <Link
            to="/loans"
            className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
          >
            <span>Compare all 7 products in detail</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loanCards.slice(0, 6).map((loan) => (
            <div 
              key={loan.code}
              className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between hover:border-slate-300 transition-colors shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-900 text-base">{loan.name}</h3>
                  <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                    {loan.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{loan.desc}</p>
                <div className="pt-2 grid grid-cols-2 gap-2 text-xs border-t border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Interest Benchmark</span>
                    <span className="font-bold font-tabular text-slate-900">{loan.rate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Max Amount</span>
                    <span className="font-bold font-tabular text-slate-900">{loan.maxAmt}</span>
                  </div>
                </div>
              </div>
              <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">{loan.tenure}</span>
                <Link
                  to={`/loan-application?product=${loan.code}`}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Apply Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. HOW IT WORKS: 4 TRANSPARENT STEPS */}
      <section className="bg-slate-100 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <div className="text-xs font-bold text-teal-700 uppercase tracking-wider mb-2">Simplicity &amp; Speed</div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Four Steps to Credit Disbursement
            </h2>
            <p className="text-xs text-slate-500 mt-2">
              From online dossier submission to Kadapa underwriting and loan approval.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-teal-400 font-bold flex items-center justify-center text-xs mb-4">
                01
              </div>
              <h3 className="font-bold text-sm text-slate-900 mb-1">Select Product &amp; Calculate</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Use our reducing-balance EMI calculator to establish comfortable monthly commitments.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-teal-400 font-bold flex items-center justify-center text-xs mb-4">
                02
              </div>
              <h3 className="font-bold text-sm text-slate-900 mb-1">Digital Dossier Submission</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Provide employment, monthly income, and proof of address in our guided 5-step wizard.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-teal-400 font-bold flex items-center justify-center text-xs mb-4">
                03
              </div>
              <h3 className="font-bold text-sm text-slate-900 mb-1">Credit Underwriting</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Assigned credit officers review income stability and determine sanction parameters.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-teal-400 font-bold flex items-center justify-center text-xs mb-4">
                04
              </div>
              <h3 className="font-bold text-sm text-slate-900 mb-1">Sanction &amp; Repayment</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Receive the formal sanction letter and monitor monthly EMIs right from your dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE FAQ ACCORDION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-1">Answers &amp; Clarifications</div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div 
              key={idx}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full text-left px-5 py-4 flex justify-between items-center text-sm font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
              >
                <span>{faq.q}</span>
                {activeFaq === idx ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
              {activeFaq === idx && (
                <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 6. CONTACT & BRANCH ADVISORY INQUIRIES */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <div className="space-y-4">
              <div className="text-xs font-bold text-teal-600 uppercase tracking-wider">Branch Advisory</div>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                Connect with our Kadapa Team
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Have questions about loan eligibility, MSME collateral requirements, or mutual fund mandates? Our financial consultants provide personalized advice.
              </p>
              <div className="space-y-2 text-xs text-slate-700 pt-2">
                <div className="font-semibold text-slate-900">M/s. Tatito Projects</div>
                <div>📍 Trunk Road, Near RTC Complex, Kadapa, AP - 516001</div>
                <div>📞 +91 8562 245678 (Mon - Sat, 9:30 AM - 6:30 PM)</div>
                <div>✉️ support@tatitofinance.com</div>
              </div>
            </div>

            <div>
              {contactSubmitted ? (
                <div className="bg-teal-50 border border-teal-200 rounded-xl p-6 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-teal-600 mx-auto" />
                  <div className="font-bold text-slate-900 text-sm">Enquiry Registered</div>
                  <p className="text-xs text-slate-600">
                    A Kadapa branch customer advisor will review your request and get back within 24 hours.
                  </p>
                  <button
                    onClick={() => setContactSubmitted(false)}
                    className="text-xs font-semibold text-teal-700 hover:underline pt-2 inline-block"
                  >
                    Submit another enquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Reddy"
                      value={contactForm.full_name}
                      onChange={e => setContactForm({ ...contactForm, full_name: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Mobile</label>
                      <input
                        type="tel"
                        required
                        placeholder="10-digit phone"
                        value={contactForm.phone}
                        onChange={e => setContactForm({ ...contactForm, phone: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Category</label>
                      <select
                        value={contactForm.category}
                        onChange={e => setContactForm({ ...contactForm, category: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                      >
                        <option>Loan Enquiry</option>
                        <option>Mutual Fund / SIP</option>
                        <option>Demat Account</option>
                        <option>Agent / DSA Partnership</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      required
                      placeholder="your.email@example.com"
                      value={contactForm.email}
                      onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Message</label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Describe your loan or investment requirement..."
                      value={contactForm.message}
                      onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={contactLoading}
                    className="w-full py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                  >
                    {contactLoading ? 'Submitting...' : 'Send Enquiry'}
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};
