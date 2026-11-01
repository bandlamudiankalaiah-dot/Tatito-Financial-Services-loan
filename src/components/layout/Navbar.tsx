import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, PRESET_ACCOUNTS } from '../../context/AuthContext';
import { 
  Menu, X, ChevronDown, UserCheck, LogOut, LayoutDashboard, 
  CreditCard, TrendingUp, ShieldCheck, User as UserIcon, Bell
} from 'lucide-react';
import { UserRole } from '../../types';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, quickLogin, role } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleRoleSwitch = async (targetRole: UserRole) => {
    try {
      await quickLogin(targetRole);
      setRoleDropdownOpen(false);
      if (targetRole === 'admin') navigate('/admin');
      else if (targetRole === 'credit_officer') navigate('/credit-officer');
      else if (targetRole === 'agent') navigate('/agents');
      else navigate('/dashboard');
    } catch (err) {
      console.error('Failed to switch role:', err);
    }
  };

  const getDashboardLink = () => {
    if (role === 'admin') return '/admin';
    if (role === 'credit_officer') return '/credit-officer';
    if (role === 'agent') return '/agents';
    return '/dashboard';
  };

  return (
    <>
      {/* Top Utility Disclaimer */}
      <div className="bg-slate-900 text-slate-300 text-xs border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-3">
            <span className="text-slate-400">Headquarters: Trunk Road, Kadapa, Andhra Pradesh</span>
            <span className="hidden sm:inline text-slate-600">·</span>
            <span className="hidden sm:inline text-slate-400">M/s. Tatito Projects</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-teal-400 font-medium">Demo Prototype Sandbox</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">Illustrative Benchmarks</span>
          </div>
        </div>
      </div>

      {/* Main Top Bar (Complies with Top Bar Contract: 3 zones separated by gap-8) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          
          {/* Zone 1: Single Wordmark Brand */}
          <Link to="/" className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-teal-400 font-bold flex items-center justify-center text-sm shadow-sm border border-slate-800">
              TF
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-slate-900 leading-none">TATITO</span>
              <span className="text-[10px] font-semibold text-slate-500 tracking-wider">FINANCIAL SERVICES</span>
            </div>
          </Link>

          {/* Zone 2: 4–5 single-line clean text navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <Link 
              to="/" 
              className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${isActive('/') ? 'text-slate-900 font-semibold' : ''}`}
            >
              Home
            </Link>
            <Link 
              to="/loans" 
              className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${isActive('/loans') ? 'text-slate-900 font-semibold' : ''}`}
            >
              Borrow &amp; Loans
            </Link>
            <Link 
              to="/investments" 
              className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${isActive('/investments') ? 'text-slate-900 font-semibold' : ''}`}
            >
              Investments
            </Link>
            <Link 
              to="/stocks" 
              className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${isActive('/stocks') ? 'text-slate-900 font-semibold' : ''}`}
            >
              Stocks
            </Link>
            <Link 
              to="/mutual-funds" 
              className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${isActive('/mutual-funds') ? 'text-slate-900 font-semibold' : ''}`}
            >
              Mutual Funds
            </Link>
            <Link 
              to="/emi-calculator" 
              className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${isActive('/emi-calculator') ? 'text-slate-900 font-semibold' : ''}`}
            >
              EMI Calculator
            </Link>
          </nav>

          {/* Zone 3: 1 primary action or authenticated user controls */}
          <div className="flex items-center gap-3 shrink-0">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/notifications"
                  className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                </Link>

                <Link
                  to={getDashboardLink()}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-slate-700" />
                  <span>Dashboard</span>
                </Link>

                {/* Role Switcher Menu for Evaluation and Testing */}
                <div className="relative">
                  <button
                    onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                    title="Switch role for demo testing"
                  >
                    <span className="capitalize">{role.replace('_', ' ')}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {roleDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50">
                      <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                        Switch Persona (Test Auth)
                      </div>
                      {(Object.keys(PRESET_ACCOUNTS) as UserRole[]).map((r) => (
                        <button
                          key={r}
                          onClick={() => handleRoleSwitch(r)}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${role === r ? 'text-teal-700 font-semibold bg-teal-50/50' : 'text-slate-700'}`}
                        >
                          <div>
                            <div>{PRESET_ACCOUNTS[r].name}</div>
                            <div className="text-[10px] text-slate-400">{PRESET_ACCOUNTS[r].roleName}</div>
                          </div>
                          {role === r && <UserCheck className="w-3.5 h-3.5 text-teal-600" />}
                        </button>
                      ))}
                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <Link
                          to="/profile"
                          onClick={() => setRoleDropdownOpen(false)}
                          className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <UserIcon className="w-3.5 h-3.5" />
                          <span>Profile Settings</span>
                        </Link>
                        <button
                          onClick={() => {
                            setRoleDropdownOpen(false);
                            logout();
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors whitespace-nowrap"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shadow-sm"
                >
                  Open Account
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-slate-800 rounded-lg hover:bg-slate-50"
            >
              Home
            </Link>
            <Link
              to="/loans"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-slate-800 rounded-lg hover:bg-slate-50"
            >
              Borrow &amp; Loans
            </Link>
            <Link
              to="/investments"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-slate-800 rounded-lg hover:bg-slate-50"
            >
              Investments &amp; Wealth
            </Link>
            <Link
              to="/stocks"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-slate-800 rounded-lg hover:bg-slate-50"
            >
              Stock Trading Terminal
            </Link>
            <Link
              to="/mutual-funds"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-slate-800 rounded-lg hover:bg-slate-50"
            >
              Mutual Funds &amp; SIPs
            </Link>
            <Link
              to="/demat"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-slate-800 rounded-lg hover:bg-slate-50"
            >
              Demat Onboarding
            </Link>
            <Link
              to="/emi-calculator"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-slate-800 rounded-lg hover:bg-slate-50"
            >
              EMI Calculator
            </Link>

            {isAuthenticated ? (
              <div className="border-t border-slate-100 pt-3 space-y-1">
                <Link
                  to={getDashboardLink()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-semibold text-teal-700 bg-teal-50 rounded-lg"
                >
                  Go to {role.replace('_', ' ')} Dashboard
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-rose-600 rounded-lg hover:bg-rose-50"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="border-t border-slate-100 pt-3 grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-sm font-semibold text-white bg-slate-900 rounded-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
};
