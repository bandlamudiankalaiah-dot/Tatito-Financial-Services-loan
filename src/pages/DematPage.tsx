import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { DematAccount } from '../types';
import { 
  ShieldCheck, CheckCircle2, AlertCircle, Building, 
  CreditCard, ExternalLink, ArrowRight, RefreshCw, Lock 
} from 'lucide-react';

export const DematPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [demat, setDemat] = useState<DematAccount | null>(null);
  const [kycStatus, setKycStatus] = useState<any>(null);
  const [panInput, setPanInput] = useState<string>('ABCDE1234F');
  const [panVerifying, setPanVerifying] = useState<boolean>(false);
  const [panFeedback, setPanFeedback] = useState<any>(null);
  const [bankAccount, setBankAccount] = useState<string>('501004821092');
  const [bankIfsc, setBankIfsc] = useState<string>('SBIN0000840');
  const [bankName, setBankName] = useState<string>('State Bank of India (Kadapa Main)');
  const [onboardingSuccess, setOnboardingSuccess] = useState<boolean>(false);

  const loadData = async () => {
    try {
      const [dematData, kyc] = await Promise.all([
        api.getDemat(),
        api.getKycStatus(),
      ]);
      setDemat(dematData);
      setKycStatus(kyc);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleVerifyPan = async () => {
    setPanVerifying(true);
    setPanFeedback(null);
    try {
      const res = await api.verifyPan(panInput, user?.full_name);
      setPanFeedback(res);
      await loadData();
    } catch (err: any) {
      setPanFeedback({ error: true, detail: err.message || 'PAN Verification failed' });
    } finally {
      setPanVerifying(false);
    }
  };

  const handleLinkBank = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateProfile({
        bank_account_no: bankAccount,
        bank_ifsc: bankIfsc,
        bank_name: bankName,
      });
      setOnboardingSuccess(true);
      await refreshUser();
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div>
        <div className="text-xs font-semibold text-teal-600 uppercase tracking-wider mb-1">Depository Services</div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Electronic Demat Account &amp; KYC Verification
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your Central Depository Services (NSDL) registration, statutory PAN compliance, and linked settlement bank.
        </p>
      </div>

      {/* Compliance Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>COMPLIANCE SAFEGUARD:</strong> Tatito Financial Services is a technology platform connecting to authorized SEBI depository participants. All DP credentials, client codes (e.g. <span className="font-mono">TT-KDP-89104</span>), and mock KYC verifications operate as simulated demo records. Actual demat account opening requires live Aadhaar e-Sign and licensed broker partner onboarding.
        </div>
      </div>

      {/* Active Demat Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-teal-400 uppercase tracking-wider">National Securities Depository Limited (NSDL)</span>
            <div className="text-2xl font-bold font-mono tracking-wide">
              {demat?.client_code || 'TT-KDP-89104'}
            </div>
            <div className="text-xs text-slate-400">Beneficiary Owner (BO ID)</div>
          </div>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2.5 py-1 rounded capitalize">
            {demat?.status || 'Active / Verified'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs border-t border-slate-800 pt-4 font-tabular">
          <div>
            <span className="text-slate-400 block text-[10px]">DP ID</span>
            <span className="font-bold text-white font-mono">{demat?.dp_id || 'IN300128-10049281'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Depository</span>
            <span className="font-bold text-white">{demat?.depository || 'NSDL'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Trading Segments</span>
            <span className="font-bold text-teal-300">Equity &amp; Mutual Funds</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Settlement Bank</span>
            <span className="font-bold text-white">{demat?.linked_bank_account || '•••• 4821'}</span>
          </div>
        </div>
      </div>

      {/* Onboarding & KYC Verification Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Column: Statutory PAN Verification */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <ShieldCheck className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-slate-900 text-sm">Income Tax PAN Verification</h3>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Statutory Income Tax PAN format: 5 letters, 4 numbers, 1 letter (<code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[11px]">ABCDE1234F</code>).
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Permanent Account Number (PAN)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={10}
                  value={panInput}
                  onChange={e => setPanInput(e.target.value.toUpperCase())}
                  placeholder="e.g. ABCDE1234F"
                  className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 uppercase font-mono font-bold"
                />
                <button
                  type="button"
                  onClick={handleVerifyPan}
                  disabled={panVerifying}
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
                >
                  {panVerifying ? 'Verifying...' : 'Validate PAN'}
                </button>
              </div>
            </div>

            {panFeedback && (
              <div className={`p-3 rounded-lg text-xs ${panFeedback.error ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-teal-50 text-teal-900 border border-teal-200'}`}>
                {panFeedback.error ? (
                  <div>{panFeedback.detail}</div>
                ) : (
                  <div className="space-y-1">
                    <div className="font-bold">Status: {panFeedback.status}</div>
                    <div className="text-[11px] text-teal-800">
                      Masked PAN: <span className="font-mono">{panFeedback.pan_masked}</span> · Live Verified: <span className="font-semibold">{panFeedback.is_live_verified ? 'Yes' : 'Simulated (Demo Sandbox)'}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Linked Settlement Bank Account */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-slate-900 text-sm">Settlement Bank Account</h3>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Dividends from shares and mutual fund redemption proceeds are directly credited to this account.
          </p>

          {onboardingSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs">
              Banking details successfully updated in customer profile.
            </div>
          )}

          <form onSubmit={handleLinkBank} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bank Account Number</label>
              <input
                type="text"
                required
                value={bankAccount}
                onChange={e => setBankAccount(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 font-mono font-bold"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">IFSC Code</label>
                <input
                  type="text"
                  required
                  value={bankIfsc}
                  onChange={e => setBankIfsc(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 font-mono font-bold uppercase"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  required
                  value={bankName}
                  onChange={e => setBankName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm"
            >
              Update Settlement Bank
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
