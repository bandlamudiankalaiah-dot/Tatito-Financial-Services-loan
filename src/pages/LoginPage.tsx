import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, PRESET_ACCOUNTS } from '../context/AuthContext';
import { UserRole } from '../types';
import { 
  Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2, 
  Smartphone, UserCheck, AlertCircle 
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, mockOtpLogin, quickLogin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const [authMethod, setAuthMethod] = useState<'password' | 'mockOtp'>('password');
  const [email, setEmail] = useState<string>('ramesh@tatito.in');
  const [password, setPassword] = useState<string>('Password@123');
  const [otp, setOtp] = useState<string>('9999');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const loggedUser = await login(email, password);
      if (loggedUser.role === 'admin') navigate('/admin');
      else if (loggedUser.role === 'credit_officer') navigate('/credit-officer');
      else if (loggedUser.role === 'agent') navigate('/agents');
      else navigate(redirect);
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
      if (loggedUser.role === 'admin') navigate('/admin');
      else if (loggedUser.role === 'credit_officer') navigate('/credit-officer');
      else if (loggedUser.role === 'agent') navigate('/agents');
      else navigate(redirect);
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
      const loggedUser = await quickLogin(targetRole);
      if (targetRole === 'admin') navigate('/admin');
      else if (targetRole === 'credit_officer') navigate('/credit-officer');
      else if (targetRole === 'agent') navigate('/agents');
      else navigate(redirect);
    } catch (err: any) {
      setErrorMsg(err.message || 'Quick login failed.');
    } finally {
      setLoading(false);
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
          Sign In to Tatito
        </h1>
        <p className="text-xs text-slate-500">
          M/s. Tatito Projects · Kadapa Financial Operations
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
            Mock OTP (Demo)
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
                <span className="text-[11px] text-slate-400">Default: Password@123</span>
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
              <strong>Simulated Mock OTP:</strong> Enter any valid email and enter <strong>9999</strong> or <strong>1234</strong> as the mock SMS OTP code. No external SMS gateway is triggered.
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
              <label className="block font-semibold text-slate-700 mb-1">Mock OTP Code</label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={e => setOtp(e.target.value)}
                placeholder="9999"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 font-mono text-center tracking-widest font-bold text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? 'Verifying OTP...' : 'Verify Mock OTP &amp; Sign In'}
            </button>
          </form>
        )}

        {/* 1-Click Persona Quick Logins for Testing */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase text-center">
            1-Click Demo Persona Sign In
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
          </div>
        </div>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-teal-700 hover:underline">
            Register New Account
          </Link>
        </div>

      </div>

    </div>
  );
};
