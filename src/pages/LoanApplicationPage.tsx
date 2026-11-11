import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { LoanProduct } from '../types';
import { 
  CheckCircle2, ArrowRight, ArrowLeft, ShieldCheck, 
  Upload, FileText, AlertCircle, Building, User, CreditCard 
} from 'lucide-react';

export const LoanApplicationPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [products, setProducts] = useState<LoanProduct[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedApplication, setSubmittedApplication] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Form State
  const [formData, setFormData] = useState({
    product_id: searchParams.get('productId') || '1',
    applicant_name: user?.full_name || '',
    dob: user?.profile?.dob || '1990-01-15',
    phone: user?.phone || '',
    email: user?.email || '',
    employment_type: 'Salaried',
    monthly_income: '85000',
    employer_name: 'Rayalaseema Textiles & Logistics Pvt Ltd',
    requested_amount: searchParams.get('amount') || '500000',
    tenure_months: searchParams.get('tenure') || '36',
    repayment_mode: (searchParams.get('mode') === 'interest_only' ? 'interest_only' : 'reducing_emi') as 'reducing_emi' | 'interest_only',
    purpose: 'Business expansion and inventory acquisition in Kadapa',
    address_line1: user?.profile?.address_line1 || 'Trunk Road, Door 4/218',
    city: user?.profile?.city || 'Kadapa',
    state: user?.profile?.state || 'Andhra Pradesh',
    pincode: user?.profile?.pincode || '516001',
    has_collateral: false,
    collateral_type: 'Residential Freehold Property',
    collateral_valuation: '2500000',
    guarantor_name: 'Srinivasa Reddy C',
    guarantor_phone: '9440551122',
    guarantor_relationship: 'Brother',
    pan_uploaded: true,
    aadhaar_uploaded: true,
    salary_slips_uploaded: true,
    bank_statements_uploaded: true,
  });

  useEffect(() => {
    api.getProducts().then(res => {
      if (Array.isArray(res)) {
        setProducts(res);
        const codeParam = searchParams.get('product');
        if (codeParam) {
          const match = res.find(p => p.product_code === codeParam);
          if (match) {
            setFormData(prev => ({ ...prev, product_id: String(match.id) }));
          }
        }
      }
    }).catch(err => console.error(err));
  }, [searchParams]);

  const selectedProduct = products.find(p => String(p.id) === String(formData.product_id)) || products[0];

  // Live EMI calculation supporting both Mode A (interest_only) and Mode B (reducing_emi)
  const calculatedEmi = React.useMemo(() => {
    const P = parseFloat(formData.requested_amount) || 0;
    const rate = selectedProduct ? selectedProduct.base_interest_rate : 12;
    const r = (rate / 12) / 100;
    const N = parseInt(formData.tenure_months, 10) || 12;
    if (P <= 0 || N <= 0) return 0;
    if (formData.repayment_mode === 'interest_only') {
      return Math.round(P * r);
    }
    return Math.round((P * r * Math.pow(1 + r, N)) / (Math.pow(1 + r, N) - 1));
  }, [formData.requested_amount, formData.tenure_months, formData.repayment_mode, selectedProduct]);

  const handleNext = () => {
    setErrorMsg('');
    if (currentStep === 1) {
      if (!formData.applicant_name || !formData.phone || !formData.email) {
        setErrorMsg('Please enter applicant name, phone, and email.');
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.monthly_income || parseFloat(formData.monthly_income) <= 0) {
        setErrorMsg('Please enter a valid monthly income.');
        return;
      }
    } else if (currentStep === 3) {
      const amt = parseFloat(formData.requested_amount);
      if (!amt || amt < 10000) {
        setErrorMsg('Minimum loan amount is ₹10,000.');
        return;
      }
      if (selectedProduct && amt > selectedProduct.max_amount) {
        setErrorMsg(`Requested amount cannot exceed ₹${selectedProduct.max_amount.toLocaleString('en-IN')} for ${selectedProduct.product_name}.`);
        return;
      }
    }
    setCurrentStep(prev => Math.min(prev + 1, 5));
  };

  const handlePrev = () => {
    setErrorMsg('');
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login?redirect=/loan-application');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await api.applyLoan({
        product_id: parseInt(formData.product_id, 10),
        requested_amount: parseFloat(formData.requested_amount),
        tenure_months: parseInt(formData.tenure_months, 10),
        repayment_mode: formData.repayment_mode,
        purpose: formData.purpose,
        monthly_income: parseFloat(formData.monthly_income),
        applicant_name: formData.applicant_name,
        phone: formData.phone,
        email: formData.email,
        employment_type: formData.employment_type,
        address: `${formData.address_line1}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
        collateral_type: formData.has_collateral ? formData.collateral_type : null,
        collateral_value: formData.has_collateral ? parseFloat(formData.collateral_valuation) : null,
        guarantor_name: formData.guarantor_name,
        guarantor_phone: formData.guarantor_phone,
      });

      setSubmittedApplication(res.application || res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit loan application. Please verify details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatINR = (val: number) => '₹' + Math.round(val).toLocaleString('en-IN');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title */}
      <div>
        <div className="text-xs font-semibold text-teal-600 uppercase tracking-wider mb-1">Guided Lending Dossier</div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Digital Loan Application Wizard
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Complete the 5-step application to submit your dossier to the Kadapa Credit Committee.
        </p>
      </div>

      {submittedApplication ? (
        /* Success State */
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-teal-50 text-teal-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Application Submitted Successfully</h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Your application has been assigned tracking number <strong className="text-slate-900 font-mono">{submittedApplication.application_no}</strong> and routed to our credit underwriting desk.
            </p>
          </div>

          {/* Dossier Summary Box */}
          <div className="max-w-md mx-auto bg-slate-50 rounded-xl border border-slate-200 p-5 text-left text-xs space-y-2.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Applicant:</span>
              <span className="font-bold text-slate-900">{submittedApplication.applicant_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Requested Amount:</span>
              <span className="font-bold font-tabular text-slate-900">{formatINR(submittedApplication.requested_amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Benchmark Interest:</span>
              <span className="font-bold font-tabular text-slate-900">{submittedApplication.interest_rate}% p.a.</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tenure:</span>
              <span className="font-bold font-tabular text-slate-900">{submittedApplication.tenure_months} Months</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 font-semibold">
              <span className="text-slate-700">Estimated Monthly EMI:</span>
              <span className="text-teal-700 font-tabular">{formatINR(submittedApplication.calculated_emi)}/mo</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Initial Status:</span>
              <span className="uppercase text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                {submittedApplication.status}
              </span>
            </div>
          </div>

          {/* Action Links */}
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link
              to="/dashboard"
              className="px-6 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-sm"
            >
              Track in Customer Dashboard
            </Link>
            <button
              onClick={() => {
                setSubmittedApplication(null);
                setCurrentStep(1);
              }}
              className="px-5 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Submit Another Application
            </button>
          </div>
        </div>
      ) : (
        /* Wizard Card */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          
          {/* Step Progress Bar */}
          <div className="border-b border-slate-200 bg-slate-50/50 p-4 sm:px-8">
            <div className="flex justify-between items-center text-xs">
              {[
                { step: 1, label: 'Applicant' },
                { step: 2, label: 'Income & Job' },
                { step: 3, label: 'Loan Specs' },
                { step: 4, label: 'Collateral' },
                { step: 5, label: 'Review & Send' }
              ].map((s) => (
                <div key={s.step} className="flex items-center gap-1.5">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${currentStep >= s.step ? 'bg-slate-900 text-teal-400' : 'bg-slate-200 text-slate-500'}`}>
                    {s.step}
                  </div>
                  <span className={`hidden sm:inline ${currentStep === s.step ? 'font-bold text-slate-900' : 'text-slate-500'}`}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {errorMsg && (
            <div className="mx-6 sm:mx-8 mt-6 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            
            {/* STEP 1: Applicant Details */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                  Step 1: Personal &amp; Identity Information
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Full Legal Name (as per PAN)</label>
                    <input
                      type="text"
                      required
                      value={formData.applicant_name}
                      onChange={e => setFormData({ ...formData, applicant_name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      required
                      value={formData.dob}
                      onChange={e => setFormData({ ...formData, dob: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">10-Digit Mobile Phone</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Residential Street Address</label>
                    <input
                      type="text"
                      required
                      value={formData.address_line1}
                      onChange={e => setFormData({ ...formData, address_line1: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={e => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Employment & Income */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                  Step 2: Employment &amp; Income Stability
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Employment Type</label>
                    <select
                      value={formData.employment_type}
                      onChange={e => setFormData({ ...formData, employment_type: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
                    >
                      <option>Salaried (Private / Corporate)</option>
                      <option>Salaried (Government / PSU)</option>
                      <option>Self-Employed Professional (Doctor / CA / Lawyer)</option>
                      <option>Self-Employed Business / MSME Owner</option>
                      <option>Agricultural / Farmer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Net Monthly Take-Home (₹)</label>
                    <input
                      type="number"
                      required
                      min="10000"
                      value={formData.monthly_income}
                      onChange={e => setFormData({ ...formData, monthly_income: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none font-tabular"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Employer / Enterprise Name</label>
                    <input
                      type="text"
                      required
                      value={formData.employer_name}
                      onChange={e => setFormData({ ...formData, employer_name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Loan Product & Amount Selection */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                  Step 3: Loan Requirements &amp; Product Selection
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Select Loan Facility</label>
                    <select
                      value={formData.product_id}
                      onChange={e => setFormData({ ...formData, product_id: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white font-semibold"
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.product_name} ({p.base_interest_rate}% p.a.)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Requested Amount (₹)</label>
                    <input
                      type="number"
                      required
                      step="10000"
                      value={formData.requested_amount}
                      onChange={e => setFormData({ ...formData, requested_amount: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none font-bold font-tabular text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Repayment Tenure (Months)</label>
                    <select
                      value={formData.tenure_months}
                      onChange={e => setFormData({ ...formData, tenure_months: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white font-tabular"
                    >
                      <option value="12">12 Months (1 Year)</option>
                      <option value="24">24 Months (2 Years)</option>
                      <option value="36">36 Months (3 Years)</option>
                      <option value="48">48 Months (4 Years)</option>
                      <option value="60">60 Months (5 Years)</option>
                      <option value="84">84 Months (7 Years)</option>
                      <option value="120">120 Months (10 Years)</option>
                      <option value="180">180 Months (15 Years)</option>
                      <option value="240">240 Months (20 Years)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Specific End Use / Purpose</label>
                    <input
                      type="text"
                      required
                      value={formData.purpose}
                      onChange={e => setFormData({ ...formData, purpose: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Repayment Mode Selector: Mode A (Interest-Only) vs Mode B (Secured Amortized) */}
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Repayment Structure Mode
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, repayment_mode: 'reducing_emi' })}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        formData.repayment_mode === 'reducing_emi'
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-bold">Mode B: Reducing-Balance EMI (Standard)</div>
                      <div className={`text-[11px] mt-0.5 ${formData.repayment_mode === 'reducing_emi' ? 'text-slate-300' : 'text-slate-500'}`}>
                        Principal + interest amortized monthly across tenure
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, repayment_mode: 'interest_only' })}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        formData.repayment_mode === 'interest_only'
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-bold">Mode A: Interest-Only Unsecured Credit</div>
                      <div className={`text-[11px] mt-0.5 ${formData.repayment_mode === 'interest_only' ? 'text-slate-300' : 'text-slate-500'}`}>
                        Pay monthly interest only; bullet principal at maturity
                      </div>
                    </button>
                  </div>
                </div>

                {/* Instant Calculation Preview */}
                <div className="bg-teal-50/60 border border-teal-200 rounded-xl p-4 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">
                      {formData.repayment_mode === 'interest_only' ? 'Monthly Interest-Only Servicing (Mode A)' : 'Computed Monthly Installment (Mode B EMI)'}
                    </span>
                    <span className="text-xl font-bold font-tabular text-teal-800">{formatINR(calculatedEmi)} / month</span>
                  </div>
                  <div className="text-right text-[11px] text-slate-500">
                    <div>Interest Benchmark: <strong>{selectedProduct?.base_interest_rate || 12}% p.a.</strong></div>
                    <div>Tenure: <strong>{formData.tenure_months} Months</strong></div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Collateral & Guarantor */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                  Step 4: Collateral &amp; Surety Information
                </h3>

                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                    <input
                      type="checkbox"
                      checked={formData.has_collateral}
                      onChange={e => setFormData({ ...formData, has_collateral: e.target.checked })}
                      className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                    />
                    <span>Pledge Collateral Security (Helps secure lower interest rates)</span>
                  </label>

                  {formData.has_collateral && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Collateral Asset Category</label>
                        <select
                          value={formData.collateral_type}
                          onChange={e => setFormData({ ...formData, collateral_type: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
                        >
                          <option>Residential Freehold Property</option>
                          <option>Commercial Showroom / Office</option>
                          <option>Hallmark Gold Ornaments (22K)</option>
                          <option>Fixed Deposit / Sovereign Gold Bond</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Estimated Asset Market Value (₹)</label>
                        <input
                          type="number"
                          value={formData.collateral_valuation}
                          onChange={e => setFormData({ ...formData, collateral_valuation: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none font-tabular"
                        />
                      </div>
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Guarantor / Co-Borrower Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Guarantor Full Name</label>
                        <input
                          type="text"
                          value={formData.guarantor_name}
                          onChange={e => setFormData({ ...formData, guarantor_name: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                        <input
                          type="tel"
                          value={formData.guarantor_phone}
                          onChange={e => setFormData({ ...formData, guarantor_phone: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Relationship</label>
                        <input
                          type="text"
                          value={formData.guarantor_relationship}
                          onChange={e => setFormData({ ...formData, guarantor_relationship: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: Document Uploads Sandbox & Final Review */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                  Step 5: Document Upload Sandbox &amp; Confirmation
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-teal-600" />
                      <div>
                        <div className="font-semibold text-slate-900">PAN Card Copy</div>
                        <div className="text-[10px] text-slate-400">Identity &amp; Statutory IT Record</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-100/60 px-2 py-0.5 rounded">Attached</span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-teal-600" />
                      <div>
                        <div className="font-semibold text-slate-900">Aadhaar Card / DigiLocker</div>
                        <div className="text-[10px] text-slate-400">Proof of Address</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-100/60 px-2 py-0.5 rounded">Attached</span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-teal-600" />
                      <div>
                        <div className="font-semibold text-slate-900">Last 3 Months Salary Slips</div>
                        <div className="text-[10px] text-slate-400">Income Verification</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-100/60 px-2 py-0.5 rounded">Attached</span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-teal-600" />
                      <div>
                        <div className="font-semibold text-slate-900">6 Months Bank Statement</div>
                        <div className="text-[10px] text-slate-400">Cashflow &amp; Banking Analysis</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-100/60 px-2 py-0.5 rounded">Attached</span>
                  </div>
                </div>

                {/* Final Summary Card */}
                <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3 text-xs">
                  <div className="font-bold text-sm text-teal-400">Application Summary Confirmation</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] font-tabular">
                    <div>
                      <span className="text-slate-400 block">Product</span>
                      <span className="font-bold">{selectedProduct?.product_name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Requested Amount</span>
                      <span className="font-bold text-white">{formatINR(parseFloat(formData.requested_amount))}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Monthly EMI</span>
                      <span className="font-bold text-teal-400">{formatINR(calculatedEmi)}/mo</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Tenure</span>
                      <span className="font-bold text-white">{formData.tenure_months} Months</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                    By submitting, I confirm that all income, identity, and residential disclosures provided are truthful. I consent to credit underwriting review by Kadapa branch officers.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous Step</span>
                </button>
              ) : <div></div>}

              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-2.5 text-xs font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting ? 'Routing Dossier to Underwriters...' : 'Submit Application to Underwriting'}
                </button>
              )}
            </div>

          </form>

        </div>
      )}

    </div>
  );
};
