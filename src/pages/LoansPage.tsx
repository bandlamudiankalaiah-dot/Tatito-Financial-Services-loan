import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, ArrowRight, Calculator, FileCheck, 
  HelpCircle, ShieldAlert, Award, Clock, Sparkles 
} from 'lucide-react';

export const LoansPage: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'unsecured' | 'secured'>('all');

  const products = [
    {
      id: 1,
      code: 'PL_UNSECURED',
      name: 'Personal Loan',
      category: 'unsecured',
      rate: '11.5% - 16.0% p.a.',
      minAmt: 25000,
      maxAmt: 1000000,
      minTenure: 12,
      maxTenure: 60,
      processingFee: '1.5% + GST',
      eligibility: 'Salaried or Self-employed with min monthly income ₹25,000. CIBIL score ≥ 700.',
      documents: ['PAN Card', 'Aadhaar Card', 'Last 3 Months Salary Slips', '6 Months Bank Statement'],
      desc: 'Immediate unsecured credit for medical exigencies, education, wedding expenses or debt consolidation without pledging any security.',
      badge: 'Rapid 24h Approval'
    },
    {
      id: 2,
      code: 'BL_GROWTH',
      name: 'Business Loan (MSME)',
      category: 'unsecured',
      rate: '14.0% - 18.0% p.a.',
      minAmt: 100000,
      maxAmt: 5000000,
      minTenure: 12,
      maxTenure: 84,
      processingFee: '2.0% + GST',
      eligibility: 'MSMEs with at least 2 years in continuous commercial operations in Andhra Pradesh. Annual turnover ≥ ₹30 Lakhs.',
      documents: ['GST Returns (12 Months)', 'ITR with Computation (2 Years)', 'Business Registration / Udyam', 'Bank Statements (1 Year)'],
      desc: 'Working capital and machinery acquisition financing designed for merchants, textile traders, and manufacturing units across Kadapa district.',
      badge: 'MSME Growth Special'
    },
    {
      id: 3,
      code: 'GL_EXPRESS',
      name: 'Hallmark Gold Loan Express',
      category: 'secured',
      rate: '9.5% - 12.0% p.a.',
      minAmt: 10000,
      maxAmt: 2000000,
      minTenure: 3,
      maxTenure: 36,
      processingFee: '₹500 flat appraisal',
      eligibility: 'Resident Indian aged 18+ pledging hallmark 22K or 24K gold jewelry at approved Kadapa valuation desk.',
      documents: ['PAN Card', 'Aadhaar Card', 'Jewelry Pledged at Branch'],
      desc: 'Instant liquidity against gold ornaments with transparent net weight appraisal and immediate counter disbursement.',
      badge: 'Instant Same-Day Payout'
    },
    {
      id: 4,
      code: 'HL_PRIME',
      name: 'Home Loan Prime',
      category: 'secured',
      rate: '8.85% - 10.5% p.a.',
      minAmt: 500000,
      maxAmt: 10000000,
      minTenure: 60,
      maxTenure: 240,
      processingFee: '0.50% (Max ₹10,000)',
      eligibility: 'Borrowers aged 21-65 with stable regular income. Property must possess clear title and municipal plan sanction.',
      documents: ['Sale Deed / Title Deeds', 'Municipal Plan Approval', 'Income Proofs (Form 16 / ITR)', 'Property Tax Receipts'],
      desc: 'Long-term low-rate housing finance for purchase of apartments, gated community villas or self-construction of independent residential homes.',
      badge: 'Lowest Interest Rate'
    },
    {
      id: 5,
      code: 'VL_AUTO',
      name: 'Vehicle & Auto Loan',
      category: 'secured',
      rate: '9.75% - 11.5% p.a.',
      minAmt: 50000,
      maxAmt: 2000000,
      minTenure: 12,
      maxTenure: 84,
      processingFee: '1.0% of loan amount',
      eligibility: 'Salaried or business individuals with monthly income ≥ ₹20,000. Up to 90% on-road financing available.',
      documents: ['Proforma Invoice from Dealer', 'Driver License', 'Income Proof', 'Bank Statement (6 Months)'],
      desc: 'Flexible auto credit for personal passenger cars, commercial 4-wheelers, and electric two-wheelers with fast dealer sanction.',
      badge: 'Up to 90% On-Road'
    },
    {
      id: 6,
      code: 'PLT_OPEN',
      name: 'Plot & Site Purchase Loan',
      category: 'secured',
      rate: '9.90% - 11.25% p.a.',
      minAmt: 200000,
      maxAmt: 5000000,
      minTenure: 36,
      maxTenure: 180,
      processingFee: '1.0% + legal search',
      eligibility: 'Applicant purchasing residential plot with approved layout (DTCP / APCRDA / Kadapa Municipal layout).',
      documents: ['Layout Sanction Order', 'Mother Deed & Encumbrance Certificate', 'Seller Title Documents', 'KYC & Income Proof'],
      desc: 'Financing for acquiring approved layout plots in burgeoning residential zones of Kadapa, Pulivendula, Proddatur and Rayachoty.',
      badge: 'DTCP Approved Layouts'
    },
    {
      id: 7,
      code: 'LAP_SECURED',
      name: 'Loan Against Property (LAP)',
      category: 'secured',
      rate: '10.25% - 12.5% p.a.',
      minAmt: 500000,
      maxAmt: 15000000,
      minTenure: 36,
      maxTenure: 180,
      processingFee: '1.0% of sanctioned amount',
      eligibility: 'Freehold residential or commercial property owner. LTV ratio up to 65% of certified independent valuation.',
      documents: ['Complete Title Chain (30 Years)', 'Latest Municipal Tax Receipt', 'Valuation Report', 'Financial Statements (3 Years)'],
      desc: 'Substantial multi-crore capital liquidity against mortgaged residential, commercial, or industrial premises for major capital expansion.',
      badge: 'High Sanction Limit'
    }
  ];

  const filteredProducts = products.filter(p => {
    if (filter === 'all') return true;
    return p.category === filter;
  });

  const formatINR = (val: number) => '₹' + Number(val).toLocaleString('en-IN');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <div className="text-xs font-semibold text-teal-600 uppercase tracking-wider mb-1">Financing Suite</div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Comprehensive Loan Catalog (7 Products)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Choose from tailored unsecured retail credit, MSME working capital, or asset-backed secured loans with clear benchmark rates.
          </p>
        </div>

        {/* Filter Segmented Control (Allowed interactive buttons under frontend-design skill) */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start md:self-auto">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${filter === 'all' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            All Loans (7)
          </button>
          <button
            type="button"
            onClick={() => setFilter('unsecured')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${filter === 'unsecured' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Unsecured (2)
          </button>
          <button
            type="button"
            onClick={() => setFilter('secured')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${filter === 'secured' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Secured / Collateral (5)
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProducts.map((prod) => (
          <div 
            key={prod.id}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="p-6 space-y-4">
              
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{prod.name}</h3>
                  <span className="text-[11px] text-slate-400 capitalize">{prod.category} credit facility</span>
                </div>
                <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md shrink-0">
                  {prod.badge}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {prod.desc}
              </p>

              {/* Financial Specs */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl text-xs border border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Interest Rate</span>
                  <span className="font-bold font-tabular text-slate-900">{prod.rate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Sanction Range</span>
                  <span className="font-bold font-tabular text-slate-900">{formatINR(prod.minAmt)} - {formatINR(prod.maxAmt)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Tenure Horizon</span>
                  <span className="font-semibold font-tabular text-slate-700">{prod.minTenure} - {prod.maxTenure} Months</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Processing Fee</span>
                  <span className="font-semibold text-slate-700">{prod.processingFee}</span>
                </div>
              </div>

              {/* Eligibility & Documents */}
              <div className="space-y-2 text-xs pt-1">
                <div className="text-[11px] font-semibold text-slate-900">Key Eligibility Criteria:</div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  {prod.eligibility}
                </p>
                
                <div className="text-[11px] font-semibold text-slate-900 pt-1">Essential Documents:</div>
                <ul className="text-[11px] text-slate-500 space-y-1">
                  {prod.documents.map((doc, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-teal-600 shrink-0" />
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
              <Link
                to={`/emi-calculator?amount=${prod.minAmt * 2}&tenure=${prod.minTenure * 2}`}
                className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 rounded-lg transition-colors flex items-center gap-1.5"
                title="Calculate EMI for this loan"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Calc EMI</span>
              </Link>
              <Link
                to={`/loan-application?product=${prod.code}&productId=${prod.id}`}
                className="flex-1 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-1.5"
              >
                <span>Apply for {prod.name.split(' ')[0]}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
