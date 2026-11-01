import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  User,
  ShieldCheck,
  CreditCard,
  Building2,
  Wallet,
  AlertCircle,
  CheckCircle2,
  Plus,
  RefreshCw,
  Clock,
  Lock,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [kycStatus, setKycStatus] = useState<any>(null);
  const [demat, setDemat] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState<number>(25000);
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositMessage, setDepositMessage] = useState<string | null>(null);

  // KYC form state
  const [panNumber, setPanNumber] = useState('');
  const [panLoading, setPanLoading] = useState(false);
  const [panResult, setPanResult] = useState<any>(null);
  const [panError, setPanError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [profileData, kycData, dematData] = await Promise.allSettled([
        api.getProfile(),
        api.getKycStatus(),
        api.getDemat(),
      ]);

      if (profileData.status === 'fulfilled') setProfile(profileData.value?.user || profileData.value);
      if (kycData.status === 'fulfilled') setKycStatus(kycData.value);
      if (dematData.status === 'fulfilled') setDemat(dematData.value?.demat);
    } catch (err) {
      console.error('Failed to load profile data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeposit = async () => {
    if (!depositAmount || depositAmount <= 0) return;
    setDepositLoading(true);
    setDepositMessage(null);
    try {
      const res = await api.depositWallet(depositAmount);
      setDepositMessage(`Successfully credited ₹${depositAmount.toLocaleString('en-IN')} to Tatito Wallet!`);
      await refreshUser();
      await loadData();
    } catch (err: any) {
      setDepositMessage(err?.message || 'Deposit failed');
    } finally {
      setDepositLoading(false);
    }
  };

  const handleVerifyPan = async (e: React.FormEvent) => {
    e.preventDefault();
    setPanLoading(true);
    setPanError(null);
    setPanResult(null);
    try {
      const res = await api.verifyPan(panNumber.toUpperCase(), user?.full_name);
      setPanResult(res);
      await loadData();
      await refreshUser();
    } catch (err: any) {
      setPanError(err?.message || 'PAN verification failed');
    } finally {
      setPanLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Profile Banner */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#003366] text-white flex items-center justify-center font-bold text-2xl shadow-md">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{user?.full_name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#003366] border border-blue-200 uppercase">
                  {user?.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Account ID: <span className="font-mono">{user?.id}</span> &bull; {user?.email} &bull; +91 {user?.phone || '9876543210'}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Branch Jurisdiction: Kadapa (YSR District), Andhra Pradesh
              </p>
            </div>
          </div>

          {/* Quick Wallet Card */}
          <div className="bg-gradient-to-br from-slate-900 to-[#003366] text-white p-5 rounded-2xl min-w-[260px] shadow-sm">
            <div className="flex items-center justify-between text-xs text-blue-200">
              <span className="flex items-center gap-1.5 font-medium">
                <Wallet className="w-4 h-4 text-teal-400" /> Tatito Liquid Wallet
              </span>
              <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded">Instant</span>
            </div>
            <div className="text-2xl font-bold font-mono tracking-tight text-white mt-2">
              ₹{(user?.wallet_balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-blue-200/70 mt-1">Available for EMI payments & stock investments</div>
          </div>
        </div>

        {/* 2-Column Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 cols): KYC Status & Demat Profile */}
          <div className="lg:col-span-2 space-y-6">
            {/* Statutory KYC Verification Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#003366]" />
                  <h2 className="text-base font-bold text-slate-900">Statutory KYC Compliance</h2>
                </div>
                <div>
                  {user?.kyc_status === 'verified' ? (
                    <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Fully Verified
                    </span>
                  ) : user?.kyc_status === 'submitted' || user?.kyc_status === 'pending' ? (
                    <span className="px-2.5 py-1 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-full flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Under Verification
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 rounded-full flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Verification Pending
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-600 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Identity Document:</span>
                  <span className="font-mono font-medium text-slate-800">
                    {kycStatus?.pan_number ? `PAN •••••${kycStatus.pan_number.slice(-4)}` : 'Not Linked'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Provider Status:</span>
                  <span className="font-mono font-medium text-slate-800">
                    {kycStatus?.status || user?.kyc_status || 'UNVERIFIED'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Simulated Sandbox Flag:</span>
                  <span className="font-mono text-slate-700">
                    {kycStatus?.is_simulated ? 'SIMULATED_SANDBOX_DEMO' : 'LIVE_VERIFIED'}
                  </span>
                </div>
              </div>

              {/* In-page PAN verification form */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2">
                  Verify or Update PAN Card
                </h3>
                <form onSubmit={handleVerifyPan} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    required
                    maxLength={10}
                    placeholder="Enter 10-digit PAN (e.g. ABCDE1234F)"
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                    className="flex-1 px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366]"
                  />
                  <button
                    type="submit"
                    disabled={panLoading || panNumber.length < 10}
                    className="px-5 py-2 bg-[#003366] hover:bg-[#002244] text-white text-xs font-semibold rounded-lg disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
                  >
                    {panLoading ? 'Verifying...' : 'Validate PAN'}
                  </button>
                </form>

                {panError && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{panError}</span>
                  </div>
                )}

                {panResult && (
                  <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 space-y-1">
                    <div className="font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      PAN Verified Successfully!
                    </div>
                    <div>Registered Name: {panResult.registered_name || user?.full_name}</div>
                    <div className="text-[11px] text-emerald-600">Reference: {panResult.verification_reference}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Demat & Trading Profile */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#003366]" />
                  <h2 className="text-base font-bold text-slate-900">Demat & Depository Account</h2>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {demat?.status || 'ACTIVE'}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block">Depository Participant</span>
                  <span className="font-semibold text-slate-800 text-sm">{demat?.depository || 'NSDL'}</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">DP ID: {demat?.dp_id || 'IN300128'}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block">Beneficiary Owner (BO ID)</span>
                  <span className="font-mono font-semibold text-slate-800 text-sm">
                    {demat?.bo_id || '1029384756'}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">Linked to PAN</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block">Settlement Bank</span>
                  <span className="font-medium text-slate-800">{demat?.bank_name || 'State Bank of India'}</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">A/C: {demat?.account_masked || '••••••7890'}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block">Trading Segment Permissions</span>
                  <span className="font-medium text-slate-800">Equity Cash & Mutual Funds</span>
                  <span className="text-[11px] text-emerald-600 block mt-0.5">Enabled for Tatito Wealth</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (1 col): Wallet Funds Management */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-[#003366]" />
                <h2 className="text-base font-bold text-slate-900">Manage Wallet Balance</h2>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Add funds directly to your Tatito account to service loan EMIs, invest in stocks, or start SIP mandates.
              </p>

              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700">Select Deposit Amount (₹)</label>
                <div className="grid grid-cols-3 gap-2">
                  {[10000, 25000, 50000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDepositAmount(amt)}
                      className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                        depositAmount === amt
                          ? 'bg-blue-50 border-[#003366] text-[#003366]'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      ₹{amt.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>

                <div>
                  <input
                    type="number"
                    min={500}
                    step={1000}
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366]"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleDeposit}
                  disabled={depositLoading || depositAmount <= 0}
                  className="w-full py-2.5 px-4 bg-[#003366] hover:bg-[#002244] text-white text-xs font-semibold rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {depositLoading ? 'Crediting Wallet...' : `Add ₹${depositAmount.toLocaleString('en-IN')} to Wallet`}
                </button>

                {depositMessage && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
                    {depositMessage}
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1 text-slate-500">
                  <Lock className="w-3.5 h-3.5 text-slate-400" /> Safe Escrow Account Banking
                </div>
                <div>Funds held in designated partner escrow accounts for customer financial activities.</div>
              </div>
            </div>

            {/* Kadapa Head Office Card */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 text-xs text-slate-600 space-y-2">
              <div className="font-semibold text-slate-900 text-sm">M/s. Tatito Projects</div>
              <div>Kadapa Branch & Regional Financial Headquarters</div>
              <div>YSR District, Andhra Pradesh - 516001</div>
              <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                Helpline: +91 8562 245678 &bull; support@tatitoprojects.com
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
