import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Upload, 
  FileText, 
  Clock, 
  HelpCircle, 
  Sparkles,
  ChevronRight,
  Loader2,
  FileCheck
} from 'lucide-react';
import { LoanType, LoanApplication, User } from '../types';
import { LOAN_PRODUCTS } from '../services/mockData';
import { storageService } from '../services/storage';

interface LoanApplicationPortalProps {
  currentUser: User;
  prefilledType?: LoanType;
  prefilledAmount?: number;
  prefilledTenure?: number;
  onApplicationSubmitted?: (app: LoanApplication) => void;
}

export const LoanApplicationPortal: React.FC<LoanApplicationPortalProps> = ({
  currentUser,
  prefilledType = 'gold',
  prefilledAmount,
  prefilledTenure,
  onApplicationSubmitted
}) => {
  const [selectedType, setSelectedType] = useState<LoanType>(prefilledType);
  const currentProduct = LOAN_PRODUCTS.find(p => p.type === selectedType) || LOAN_PRODUCTS[0];

  const [activeTab, setActiveTab] = useState<'apply' | 'my-applications'>('apply');

  // Form Fields
  const [applicantName, setApplicantName] = useState(currentUser.fullName);
  const [phone, setPhone] = useState(currentUser.phone);
  const [email, setEmail] = useState(currentUser.email);
  const [panCard, setPanCard] = useState('ABCDE1234F');
  const [aadhaarLast4, setAadhaarLast4] = useState('8821');
  const [monthlyIncome, setMonthlyIncome] = useState('65000');
  const [requestedAmount, setRequestedAmount] = useState<string>(
    prefilledAmount ? prefilledAmount.toString() : '300000'
  );
  const [tenureMonths, setTenureMonths] = useState<string>(
    prefilledTenure ? prefilledTenure.toString() : '24'
  );
  const [purpose, setPurpose] = useState('Working capital / Emergency liquidity');

  // Documents uploaded simulation
  const [documents, setDocuments] = useState<{ pan: boolean; income: boolean; kyc: boolean }>({
    pan: true,
    income: true,
    kyc: true
  });

  // State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successApp, setSuccessApp] = useState<LoanApplication | null>(null);

  const [userApplications, setUserApplications] = useState<LoanApplication[]>(
    storageService.getUserApplications(currentUser.id)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const amt = parseFloat(requestedAmount);
    const ten = parseInt(tenureMonths, 10);
    const inc = parseFloat(monthlyIncome);

    if (!applicantName.trim()) {
      setValidationError('Please enter applicant full name');
      return;
    }

    if (!phone.trim() || phone.length < 10) {
      setValidationError('Please enter a valid 10-digit mobile number');
      return;
    }

    // PAN Card check (5 letters, 4 numbers, 1 letter)
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(panCard.toUpperCase())) {
      setValidationError('Please enter a valid 10-character PAN number (e.g. ABCDE1234F)');
      return;
    }

    if (isNaN(amt) || amt < 10000) {
      setValidationError('Minimum loan request amount is ₹10,000');
      return;
    }

    // Check against product max limit
    if (amt > currentProduct.maxAmount) {
      setValidationError(
        `Requested amount ₹${amt.toLocaleString('en-IN')} exceeds the maximum allowed limit of ₹${currentProduct.maxAmount.toLocaleString('en-IN')} for ${currentProduct.title}.`
      );
      return;
    }

    if (isNaN(ten) || ten < 3 || ten > currentProduct.maxTenureMonths) {
      setValidationError(`Tenure must be between 3 and ${currentProduct.maxTenureMonths} months for ${currentProduct.title}.`);
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      try {
        const app = storageService.submitLoanApplication({
          loanType: selectedType,
          applicantName,
          phone,
          email,
          panCard: panCard.toUpperCase(),
          aadhaarLast4,
          monthlyIncome: inc || 50000,
          requestedAmount: amt,
          interestRate: currentProduct.minRate,
          tenureMonths: ten,
          purpose
        });

        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {}

        setIsSubmitting(false);
        setSuccessApp(app);
        setUserApplications(storageService.getUserApplications(currentUser.id));
        if (onApplicationSubmitted) onApplicationSubmitted(app);
      } catch (err: any) {
        setIsSubmitting(false);
        setValidationError(err.message || 'Failed to submit application.');
      }
    }, 1200);
  };

  return (
    <section id="loan-application-portal" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Loan Application Portal &amp; Limits
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kadapa Branch Direct Lending • Transparent Interest Rates • No Hidden Charges
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('apply')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'apply' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Apply for Loan
          </button>
          <button
            onClick={() => setActiveTab('my-applications')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'my-applications' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>My Applications</span>
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] flex items-center justify-center font-bold">
              {userApplications.length}
            </span>
          </button>
        </div>
      </div>

      {activeTab === 'apply' ? (
        <div className="mt-8 space-y-8">
          {/* Loan Products Showcase (5 required products) */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {LOAN_PRODUCTS.map((prod) => {
              const isSelected = selectedType === prod.type;
              return (
                <div
                  key={prod.type}
                  onClick={() => {
                    setSelectedType(prod.type);
                    setSuccessApp(null);
                    setValidationError(null);
                    // adjust default amount if exceeding
                    if (parseFloat(requestedAmount) > prod.maxAmount) {
                      setRequestedAmount((prod.maxAmount * 0.5).toString());
                    }
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-600'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-extrabold text-slate-900">
                        {prod.title}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      )}
                    </div>
                    <div className="text-lg font-black text-emerald-700">
                      From {prod.minRate}% <span className="text-[10px] font-normal text-slate-500">p.a.</span>
                    </div>
                    <div className="text-[11px] font-bold text-slate-700 mt-1">
                      Up to ₹{(prod.maxAmount / 100000).toFixed(0)} Lakhs
                      {prod.maxAmount >= 10000000 && ' (₹1 Cr)'}
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-500 mt-2 line-clamp-2">
                    {prod.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Form & Product Summary Grid */}
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Application Form */}
            <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              {successApp ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Application Submitted Successfully!
                  </h3>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 max-w-md mx-auto text-xs space-y-2 text-left">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Application Number:</span>
                      <span className="font-mono font-bold text-slate-900">{successApp.applicationNo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Loan Type:</span>
                      <span className="font-bold text-slate-900 capitalize">{successApp.loanType} Loan</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Sanction Requested:</span>
                      <span className="font-bold text-emerald-700">₹{successApp.requestedAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Current Status:</span>
                      <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        {successApp.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    A Kadapa branch credit officer has received your application and will review KYC within 24 working hours.
                  </p>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('my-applications')}
                      className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 cursor-pointer"
                    >
                      Track Application Status
                    </button>
                    <button
                      type="button"
                      onClick={() => setSuccessApp(null)}
                      className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                    >
                      Apply for Another Loan
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">
                        {currentProduct.title} Application Form
                      </h3>
                      <p className="text-xs text-slate-500">
                        Benchmark Rate: {currentProduct.minRate}% p.a. • Ceiling: ₹{currentProduct.maxAmount.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                      Step 1 of 1: Instant e-KYC
                    </span>
                  </div>

                  {/* Applicant Details */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Full Name (as on PAN)
                      </label>
                      <input
                        type="text"
                        value={applicantName}
                        onChange={(e) => setApplicantName(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        PAN Card Number
                      </label>
                      <input
                        type="text"
                        value={panCard}
                        onChange={(e) => setPanCard(e.target.value.toUpperCase())}
                        maxLength={10}
                        placeholder="ABCDE1234F"
                        className="w-full px-3.5 py-2.5 text-xs font-mono font-bold uppercase rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Aadhaar Last 4 Digits
                      </label>
                      <input
                        type="text"
                        value={aadhaarLast4}
                        onChange={(e) => setAadhaarLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        maxLength={4}
                        placeholder="8821"
                        className="w-full px-3.5 py-2.5 text-xs font-mono font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Monthly Income / Turnover (₹)
                      </label>
                      <input
                        type="number"
                        value={monthlyIncome}
                        onChange={(e) => setMonthlyIncome(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Loan Parameters */}
                  <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Requested Amount (₹)
                        </label>
                        <span className="text-[10px] text-slate-400 font-bold">
                          Max: ₹{currentProduct.maxAmount.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <input
                        type="number"
                        value={requestedAmount}
                        onChange={(e) => setRequestedAmount(e.target.value)}
                        max={currentProduct.maxAmount}
                        className="w-full px-3.5 py-2.5 text-xs font-extrabold text-emerald-800 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Tenure in Months
                        </label>
                        <span className="text-[10px] text-slate-400 font-bold">
                          Max: {currentProduct.maxTenureMonths} Mo
                        </span>
                      </div>
                      <input
                        type="number"
                        value={tenureMonths}
                        onChange={(e) => setTenureMonths(e.target.value)}
                        max={currentProduct.maxTenureMonths}
                        className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                        Purpose of Loan
                      </label>
                      <input
                        type="text"
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        placeholder="e.g. Business expansion in Trunk Road Kadapa, inventory, or home renovation"
                        className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Document Upload Simulator */}
                  <div className="pt-2 border-t border-slate-100">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                      e-KYC Document Attachments (Verified)
                    </label>
                    <div className="grid sm:grid-cols-3 gap-3">
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <FileCheck className="w-4 h-4 text-emerald-600" />
                          <span className="font-semibold text-slate-800">PAN Card</span>
                        </div>
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded">
                          Uploaded
                        </span>
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <FileCheck className="w-4 h-4 text-emerald-600" />
                          <span className="font-semibold text-slate-800">Bank Statement</span>
                        </div>
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded">
                          Linked
                        </span>
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <FileCheck className="w-4 h-4 text-emerald-600" />
                          <span className="font-semibold text-slate-800">Aadhaar Proof</span>
                        </div>
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded">
                          UIDAI OK
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Validation Error Banner */}
                  {validationError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{validationError}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Validating Limits &amp; Generating Loan Application ID...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit {currentProduct.title} Application</span>
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Right Column: Product Highlights & Kadapa Branch info */}
            <div className="lg:col-span-4 space-y-5">
              <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" /> Product Terms &amp; Conditions
                </div>
                <h4 className="text-lg font-bold text-white">{currentProduct.title}</h4>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Interest Rate:</span>
                    <span className="font-bold text-emerald-400">From {currentProduct.minRate}% p.a.</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Max Sanction Limit:</span>
                    <span className="font-bold text-white">₹{currentProduct.maxAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Max Tenure:</span>
                    <span className="font-bold text-white">{currentProduct.maxTenureMonths} Months</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Processing Fee:</span>
                    <span className="font-bold text-slate-300">{currentProduct.processingFee}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-2">
                    Key Features:
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {currentProduct.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Branch Helpdesk card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <span>Kadapa Central Credit Desk</span>
                </div>
                <p className="text-slate-600">
                  Door No. 4/320, Trunk Road, Near 7-Roads Junction, Kadapa, AP - 516001
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-slate-500">
                  <span>Helpline: +91 8562 245678</span>
                  <span className="font-bold text-emerald-700">Open 9AM - 6PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* My Applications Tab */
        <div className="mt-8 space-y-4">
          {userApplications.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-800">No Applications Submitted</h4>
              <p className="text-xs text-slate-500 mt-1">
                You have not submitted any loan applications yet.
              </p>
              <button
                onClick={() => setActiveTab('apply')}
                className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Apply Now
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {userApplications.map((app) => (
                <div
                  key={app.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-sm text-slate-900">
                        {app.applicationNo}
                      </span>
                      <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded capitalize">
                        {app.loanType} Loan
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      Applied by <strong className="text-slate-800">{app.applicantName}</strong> on {new Date(app.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Purpose: {app.purpose}
                    </p>
                    {app.adminRemarks && (
                      <div className="mt-2 text-xs bg-slate-50 p-2 rounded-lg border border-slate-200 text-slate-700">
                        <strong className="text-slate-900">Branch Remarks:</strong> {app.adminRemarks}
                      </div>
                    )}
                  </div>

                  <div className="flex md:flex-col items-center md:items-end justify-between gap-2 shrink-0">
                    <div className="text-right">
                      <div className="text-base font-extrabold text-emerald-700">
                        ₹{app.requestedAmount.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Tenure: {app.tenureMonths} Mo @ {app.interestRate}% p.a.
                      </div>
                    </div>

                    <span
                      className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                        app.status === 'approved' || app.status === 'disbursed'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : app.status === 'under_review'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : app.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}
                    >
                      {app.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
