import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, PRESET_ACCOUNTS } from '../../context/AuthContext';
import { 
  Menu, X, ChevronDown, UserCheck, LogOut, LayoutDashboard, 
  Wallet, User as UserIcon, Bell, Sun, Moon
} from 'lucide-react';
import { UserRole } from '../../types';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, quickLogin, role } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('tatito_theme') === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('tatito_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('tatito_theme', 'light');
    }
  }, [isDark]);

  const isActive = (path: string) => location.pathname === path;

  const handleRoleSwitch = async (targetRole: UserRole) => {
    try {
      await quickLogin(targetRole);
      setRoleDropdownOpen(false);
      if (targetRole === 'admin' || targetRole === 'super_admin') navigate('/admin');
      else if (targetRole === 'credit_officer') navigate('/credit-officer');
      else if (targetRole === 'agent') navigate('/agents');
      else navigate('/dashboard');
    } catch (err) {
      console.error('Failed to switch role:', err);
    }
  };

  const getDashboardLink = () => {
    if (role === 'admin' || role === 'super_admin') return '/admin';
    if (role === 'credit_officer') return '/credit-officer';
    if (role === 'agent') return '/agents';
    return '/dashboard';
  };

  return (
    <>
      {/* Top Utility Disclaimer — Light Gold & Light Green Strip */}
      <div className="bg-gradient-to-r from-[#F8F0D8] via-[#E8F6EE] to-[#F8F0D8] text-[#144332] text-xs border-b border-[#E2D4A8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-3">
            <span className="font-medium text-[#5A4310]">Headquarters: Trunk Road, Kadapa, Andhra Pradesh</span>
            <span className="hidden sm:inline text-[#C9B376]">·</span>
            <span className="hidden sm:inline font-semibold text-[#114B36]">M/s. Tatito Projects</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-[#0B6B49] font-bold">Enterprise 2.0 Wealth &amp; NBFC Suite</span>
            <span className="text-[#C9B376]">·</span>
            <span className="text-[#785914] font-semibold">Borrow. Invest. Trade. Grow.</span>
          </div>
        </div>
      </div>

      {/* Main Top Bar (Complies with Top Bar Contract: 3 zones separated by gap-8) */}
      <header className="sticky top-0 z-40 bg-[#FFFEFA]/95 backdrop-blur-md border-b border-[#E5D8B1] shadow-[0_2px_15px_-4px_rgba(180,140,40,0.08)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          
          {/* Zone 1: Single Wordmark Brand */}
          <Link to="/" className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0D4A36] to-[#176B4F] text-[#F9E29C] font-extrabold flex items-center justify-center text-sm shadow-sm border border-[#D4AF37]/60">
              TF
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-[#0D3828] leading-none">TATITO</span>
              <span className="text-[10px] font-bold text-[#8C6918] tracking-wider">FINANCIAL SERVICES</span>
            </div>
          </Link>

          {/* Zone 2: 5 single-line clean text navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#2A5242]">
            <Link 
              to="/loans" 
              className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#0B3B2B] ${isActive('/loans') ? 'text-[#0B3B2B] font-bold underline decoration-[#C99A2E] decoration-2 underline-offset-8' : ''}`}
            >
              Borrow &amp; Loans
            </Link>
            <Link 
              to="/stocks" 
              className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#0B3B2B] ${isActive('/stocks') ? 'text-[#0B3B2B] font-bold underline decoration-[#C99A2E] decoration-2 underline-offset-8' : ''}`}
            >
              Stocks
            </Link>
            <Link 
              to="/mutual-funds" 
              className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#0B3B2B] ${isActive('/mutual-funds') ? 'text-[#0B3B2B] font-bold underline decoration-[#C99A2E] decoration-2 underline-offset-8' : ''}`}
            >
              Mutual Funds
            </Link>
            <Link 
              to="/wallet" 
              className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#0B3B2B] ${isActive('/wallet') || isActive('/bills') ? 'text-[#0B3B2B] font-bold underline decoration-[#C99A2E] decoration-2 underline-offset-8' : ''}`}
            >
              Wallet &amp; Bills
            </Link>
            <Link 
              to="/emi-calculator" 
              className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#0B3B2B] ${isActive('/emi-calculator') ? 'text-[#0B3B2B] font-bold underline decoration-[#C99A2E] decoration-2 underline-offset-8' : ''}`}
            >
              EMI Calculator
            </Link>
          </nav>

          {/* Zone 3: Primary action, theme switcher, and authenticated user controls */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 text-[#5A4310] hover:text-[#0B3B2B] bg-[#FAF3DD] hover:bg-[#F3E6C0] border border-[#E5D5A5] rounded-lg transition-colors"
              title={isDark ? 'Switch to Light Gold & Green Mode' : 'Switch to Dark Emerald Mode'}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-[#0D4A36]" />}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/notifications"
                  className="p-2 text-[#144332] hover:text-[#0B3B2B] bg-[#EAF7F0] hover:bg-[#D5EFE1] border border-[#C2E5D3] rounded-lg transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                </Link>

                <Link
                  to={getDashboardLink()}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#0D4432] bg-gradient-to-r from-[#EAF7F0] to-[#F9F1D8] hover:from-[#DDF2E7] hover:to-[#F3E6BE] border border-[#D9CCA3] rounded-lg transition-colors whitespace-nowrap"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-[#0E6245]" />
                  <span>Dashboard</span>
                </Link>

                {/* Role Switcher Menu for Evaluation and Testing */}
                <div className="relative">
                  <button
                    onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-[#5A4310] hover:text-[#0B3B2B] bg-[#FDF8E7] border border-[#E2D3A4] rounded-lg hover:border-[#C99A2E] transition-colors"
                    title="Switch role for demo testing"
                  >
                    <span className="capitalize">{role.replace('_', ' ')}</span>
                    <ChevronDown className="w-3 h-3 text-[#8C6918]" />
                  </button>

                  {roleDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-60 bg-[#FFFEFA] border border-[#E5D8B1] rounded-xl shadow-lg py-1 z-50">
                      <div className="px-3 py-1.5 text-[11px] font-bold text-[#8C6918] uppercase tracking-wider border-b border-[#F0E8CE]">
                        Switch Persona (Test Auth)
                      </div>
                      {(Object.keys(PRESET_ACCOUNTS) as UserRole[]).map((r) => (
                        <button
                          key={r}
                          onClick={() => handleRoleSwitch(r)}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#FAF5E4] ${role === r ? 'text-[#0B6B49] font-bold bg-[#EAF7F0]' : 'text-[#1F4234]'}`}
                        >
                          <div>
                            <div>{PRESET_ACCOUNTS[r].name}</div>
                            <div className="text-[10px] text-[#6B7E74]">{PRESET_ACCOUNTS[r].roleName}</div>
                          </div>
                          {role === r && <UserCheck className="w-3.5 h-3.5 text-[#0B6B49]" />}
                        </button>
                      ))}
                      <div className="border-t border-[#F0E8CE] mt-1 pt-1">
                        <Link
                          to="/wallet"
                          onClick={() => setRoleDropdownOpen(false)}
                          className="w-full text-left px-3 py-2 text-xs text-[#1F4234] hover:bg-[#FAF5E4] flex items-center gap-2"
                        >
                          <Wallet className="w-3.5 h-3.5 text-[#8C6918]" />
                          <span>Wallet &amp; BBPS Bills</span>
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setRoleDropdownOpen(false)}
                          className="w-full text-left px-3 py-2 text-xs text-[#1F4234] hover:bg-[#FAF5E4] flex items-center gap-2"
                        >
                          <UserIcon className="w-3.5 h-3.5 text-[#0B6B49]" />
                          <span>Profile &amp; 7-Stage KYC</span>
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
                  className="px-3 py-2 text-xs font-bold text-[#144332] hover:text-[#0B3B2B] transition-colors whitespace-nowrap"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-bold text-[#FDF8E7] bg-gradient-to-r from-[#0D4A36] to-[#176B4F] hover:from-[#0B3B2B] hover:to-[#125840] border border-[#D4AF37]/50 rounded-lg transition-all whitespace-nowrap shadow-sm"
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
