import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { UserRole } from '../types';
import { 
  Lock, Mail, ShieldCheck, CheckCircle2, AlertCircle, KeyRound
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, mockOtpLogin, quickLogin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const [authMethod, setAuthMethod] = useState<'password' | 'mockOtp'>('password');
  const [email, setEmail] = useState<string>('ramesh@tatito.in');
  const [password, setPassword] = useState<string>('Password@123');
  const [otp, setOtp] = useState<string>('123456');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Forgot / Reset Password Modal State
  const [resetModalOpen, setResetModalOpen] = useState<boolean>(false);
  const [resetEmail, setResetEmail] = useState<string>('ramesh@tatito.in');
  const [resetOtp, setResetOtp] = useState<string>('849201');
  const [newPassword, setNewPassword] = useState<string>('Password@123');
  const [resetStep, setResetStep] = useState<'request' | 'verify'>('request');
  const [resetNotice, setResetNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [resetBusy, setResetBusy] = useState<boolean>(false);

  const routeByRole = (role: string) => {
    if (role === 'admin' || role === 'super_admin') navigate('/admin');
    else if (role === 'credit_officer') navigate('/credit-officer');
    else if (role === 'agent') navigate('/agents');
    else navigate(redirect);
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const loggedUser = await login(email, password);
      routeByRole(loggedUser.role);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleMockOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const loggedUser = await mockOtpLogin(email, otp);
      routeByRole(loggedUser.role);
    } catch (err: any) {
      setErrorMsg(err.message || 'Mock OTP login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRole = async (targetRole: UserRole) => {
    setLoading(true);
    setErrorMsg('');
    try {
      await quickLogin(targetRole);
      routeByRole(targetRole);
    } catch (err: any) {
      setErrorMsg(err.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetBusy(true);
    setResetNotice(null);
    try {
      const res = await api.forgotPassword(resetEmail);
      setResetStep('verify');
      setResetNotice({
        type: 'success',
        text: `${res.message} (Sandbox OTP pre-filled: ${res.sandbox_otp_hint || '849201'})`
      });
    } catch (err: any) {
      setResetNotice({ type: 'error', text: err.message || 'Could not dispatch reset OTP.' });
    } finally {
      setResetBusy(false);
    }
  };

  const handleConfirmResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetBusy(true);
    setResetNotice(null);
    try {
      const res = await api.resetPassword({
        email: resetEmail,
        otp: resetOtp,
        new_password: newPassword
      });
      setResetNotice({ type: 'success', text: res.message });
      setEmail(resetEmail);
      setPassword(newPassword);
      setTimeout(() => {
        setResetModalOpen(false);
        setResetStep('request');
        setResetNotice(null);
      }, 1500);
    } catch (err: any) {
      setResetNotice({ type: 'error', text: err.message || 'Password reset failed.' });
    } finally {
      setResetBusy(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-slate-900 text-teal-400 font-extrabold flex items-center justify-center text-lg mx-auto shadow-md">
          TF
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Sign In to Tatito 2.0
        </h1>
        <p className="text-xs text-slate-500">
          M/s. Tatito Projects · Borrow. Invest. Trade. Grow.
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
        
        {/* Auth Method Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setAuthMethod('password')}
            className={`flex-1 py-1.5 rounded-lg transition-colors ${authMethod === 'password' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600'}`}
          >
            Password Login
          </button>
          <button
            type="button"
            onClick={() => setAuthMethod('mockOtp')}
            className={`flex-1 py-1.5 rounded-lg transition-colors ${authMethod === 'mockOtp' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600'}`}
          >
            Sandbox OTP (Test)
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {authMethod === 'password' ? (
          <form onSubmit={handlePasswordLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="ramesh@tatito.in"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email || 'ramesh@tatito.in');
                    setResetModalOpen(true);
                  }}
                  className="text-[11px] font-semibold text-teal-700 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleMockOtpLogin} className="space-y-4 text-xs">
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-[11px] text-teal-900 leading-relaxed">
              <strong>Development Sandbox OTP:</strong> Enter any registered email and use <strong>123456</strong> or <strong>849201</strong> as the test OTP code. Clearly labeled for sandbox verification.
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Registered Email or Mobile</label>
              <input
                type="text"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ramesh@tatito.in"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Sandbox Test OTP Code</label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={e => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 font-mono text-center tracking-widest font-bold text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? 'Verifying OTP...' : 'Verify Test OTP & Sign In'}
            </button>
          </form>
        )}

        {/* 1-Click Persona Quick Logins for Testing */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase text-center">
            1-Click Enterprise Persona Sign In
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickRole('customer')}
              className="p-2 text-left bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            >
              <div className="font-bold text-slate-900">Customer</div>
              <div className="text-[10px] text-slate-400">Ramesh Kumar</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickRole('agent')}
              className="p-2 text-left bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            >
              <div className="font-bold text-slate-900">DSA Agent</div>
              <div className="text-[10px] text-slate-400">Siva Reddy</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickRole('credit_officer')}
              className="p-2 text-left bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            >
              <div className="font-bold text-slate-900">Credit Officer</div>
              <div className="text-[10px] text-slate-400">Lakshmi Narayana</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickRole('admin')}
              className="p-2 text-left bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            >
              <div className="font-bold text-slate-900">Branch Admin</div>
              <div className="text-[10px] text-slate-400">Ankalaiah B</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickRole('super_admin')}
              className="col-span-2 p-2 text-center bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors"
            >
              <div className="font-bold text-teal-400">Super Administrator (Enterprise Governance)</div>
              <div className="text-[10px] text-slate-300">superadmin@tatitofinance.com</div>
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-teal-700 hover:underline">
            Register New Account
          </Link>
        </div>

      </div>

      {/* Forgot / Reset Password Modal */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-slate-200 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <KeyRound className="w-4 h-4 text-teal-600" />
                <span>Reset Account Password</span>
              </div>
              <button
                type="button"
                onClick={() => setResetModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-semibold"
              >
                ✕
              </button>
            </div>

            {resetNotice && (
              <div className={`p-3 rounded-lg border ${
                resetNotice.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}>
                {resetNotice.text}
              </div>
            )}

            {resetStep === 'request' ? (
              <form onSubmit={handleRequestResetOtp} className="space-y-3">
                <p className="text-slate-500">
                  Enter your account email to receive a simulated password reset OTP in sandbox mode.
                </p>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Account Email</label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={resetBusy}
                  className="w-full py-2.5 font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
                >
                  {resetBusy ? 'Dispatching...' : 'Send Sandbox Reset OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleConfirmResetPassword} className="space-y-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sandbox Reset OTP (Use 849201)</label>
                  <input
                    type="text"
                    required
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-center"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">New Password (min 8 chars)</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <button
                  type="submit"
                  disabled={resetBusy}
                  className="w-full py-2.5 font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg"
                >
                  {resetBusy ? 'Updating Password...' : 'Confirm New Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
