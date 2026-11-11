import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, PRESET_ACCOUNTS } from '../../context/AuthContext';
import { 
  Menu, X, ChevronDown, UserCheck, LogOut, LayoutDashboard, 
  Wallet, User as UserIcon, Bell, Sun, Moon, Search
} from 'lucide-react';
import { UserRole } from '../../types';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, quickLogin, role } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('tatito_theme');
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
      return document.documentElement.classList.contains('dark');
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('tatito_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('tatito_theme', 'light');
    }
  }, [isDark]);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/' && !location.hash;
    return location.pathname === path;
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      navigate(`/?q=${encodeURIComponent(q)}`);
      setMobileMenuOpen(false);
    } else {
      navigate('/');
    }
  };

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

  const navItems = [
    { label: 'Home', to: '/' },
    { label: 'Payments', to: '/payments' },
    { label: 'Services', to: '/services' },
    { label: 'Loans', to: '/loans' },
    { label: 'SIP', to: '/sip-calculator' },
    { label: 'Mutual funds', to: '/mutual-funds' },
    { label: 'Trading', to: '/stocks' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[var(--card)] border-b border-[var(--line)] transition-colors">
      <div className="max-w-[1140px] mx-auto px-4 py-2.5 flex items-center gap-3.5 flex-wrap justify-between">
        
        {/* Brand Lockup matching model */}
        <Link to="/" onClick={() => setSearchQuery('')} className="flex items-center gap-2.5 font-bold text-[17px] text-[var(--ink)] whitespace-nowrap shrink-0">
          <span className="w-[38px] h-[38px] rounded-[11px] bg-[var(--ac)] text-[var(--ai)] grid place-items-center text-xl font-extrabold shadow-xs">
            T
          </span>
          <span>Tatito Financial Services</span>
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 flex-wrap">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`px-2.5 py-1.5 rounded-lg text-[14px] font-medium transition-colors whitespace-nowrap ${
                isActive(item.to)
                  ? 'bg-[var(--bg)] text-[var(--lt)] font-semibold'
                  : 'text-[var(--ink)] hover:bg-[var(--bg)] hover:text-[var(--lt)]'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions: Search + Theme Toggle + Notifications + Auth */}
        <div className="flex items-center gap-2.5 ml-auto text-[14px]">
          
          {/* Quick Search Input */}
          <form onSubmit={handleSearchSubmit} className="hidden sm:flex items-center relative">
            <input
              type="text"
              name="q"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              aria-label="Search"
              className="w-[135px] focus:w-[175px] transition-all py-1.5 pl-3 pr-7 text-[13px] rounded-[10px] border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] placeholder:text-[var(--mut)]"
            />
            <button
              type="submit"
              aria-label="Submit search"
              className="absolute right-2 text-[var(--mut)] hover:text-[var(--ink)]"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Dark / Light Theme Switcher */}
          <button
            type="button"
            onClick={() => setIsDark(!isDark)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[10px] border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] hover:border-[var(--ac)] text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Dark or Light Theme"
          >
            {isDark ? (
              <>
                <Sun className="w-3.5 h-3.5 text-[#f0b429]" />
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-[var(--lt)]" />
                <span className="hidden sm:inline">Dark</span>
              </>
            )}
          </button>

          {/* Notification Bell with Gold Count Badge */}
          <Link
            to="/notifications"
            className="inline-flex items-center px-2 py-1.5 rounded-[10px] hover:bg-[var(--bg)] text-[var(--ink)] transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <i className="not-italic text-[11px] font-bold bg-[var(--ac2)] text-[#2a1d00] rounded-[9px] px-1.5 ml-1">
              3
            </i>
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                to={getDashboardLink()}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-[var(--ac)] text-[var(--ai)] text-xs font-semibold hover:opacity-95 transition-opacity whitespace-nowrap"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>

              {/* Role Switcher / User Menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-[var(--ink)] bg-[var(--bg)] border border-[var(--line)] rounded-[10px] hover:border-[var(--ac)] transition-colors cursor-pointer"
                >
                  <span>Hi, {user?.full_name ? user.full_name.split(' ')[0] : role.replace('_', ' ')}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[var(--mut)]" />
                </button>

                {roleDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-[var(--card)] border border-[var(--line)] rounded-2xl shadow-xl py-1.5 z-50">
                    <div className="px-3.5 py-1.5 text-[11px] font-bold text-[var(--mut)] uppercase tracking-wider border-b border-[var(--line)]">
                      Switch Role (Demo Auth)
                    </div>
                    {(Object.keys(PRESET_ACCOUNTS) as UserRole[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => handleRoleSwitch(r)}
                        className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-[var(--bg)] ${
                          role === r ? 'text-[var(--lt)] font-bold bg-[var(--bg)]' : 'text-[var(--ink)]'
                        }`}
                      >
                        <div>
                          <div>{PRESET_ACCOUNTS[r].name}</div>
                          <div className="text-[10px] text-[var(--mut)]">{PRESET_ACCOUNTS[r].roleName}</div>
                        </div>
                        {role === r && <UserCheck className="w-3.5 h-3.5 text-[var(--lt)]" />}
                      </button>
                    ))}
                    <div className="border-t border-[var(--line)] mt-1 pt-1">
                      <Link
                        to="/wallet"
                        onClick={() => setRoleDropdownOpen(false)}
                        className="w-full text-left px-3.5 py-2 text-xs text-[var(--ink)] hover:bg-[var(--bg)] flex items-center gap-2"
                      >
                        <Wallet className="w-3.5 h-3.5 text-[var(--lt)]" />
                        <span>Wallet &amp; Bills</span>
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setRoleDropdownOpen(false)}
                        className="w-full text-left px-3.5 py-2 text-xs text-[var(--ink)] hover:bg-[var(--bg)] flex items-center gap-2"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-[var(--lt)]" />
                        <span>Profile &amp; KYC</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setRoleDropdownOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs text-rose-500 hover:bg-[var(--bg)] flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Logout</span>
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
                className="px-2.5 py-1.5 text-[14px] font-medium text-[var(--ink)] hover:text-[var(--lt)] transition-colors whitespace-nowrap"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 text-[14px] font-semibold bg-[var(--ac)] text-[var(--ai)] rounded-[10px] hover:opacity-95 transition-opacity whitespace-nowrap"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden px-2.5 py-1.5 border border-[var(--line)] rounded-lg text-[var(--ink)] bg-transparent"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[var(--line)] bg-[var(--card)] px-4 pt-3 pb-5 space-y-2">
          <form onSubmit={handleSearchSubmit} className="mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services, loans, SIP..."
              className="w-full py-2 px-3 text-sm rounded-[10px] border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)]"
            />
          </form>

          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 text-sm font-medium rounded-lg ${
                isActive(item.to)
                  ? 'bg-[var(--bg)] text-[var(--lt)] font-semibold'
                  : 'text-[var(--ink)] hover:bg-[var(--bg)]'
              }`}
            >
              {item.label}
            </Link>
          ))}

          <Link
            to="/demat"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-[var(--ink)] rounded-lg hover:bg-[var(--bg)]"
          >
            Demat Account
          </Link>

          {isAuthenticated ? (
            <div className="border-t border-[var(--line)] pt-3 space-y-1.5">
              <Link
                to={getDashboardLink()}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-[var(--ai)] bg-[var(--ac)] rounded-lg text-center"
              >
                Open {role.replace('_', ' ')} Dashboard
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full text-left px-3 py-2 text-sm font-medium text-rose-500 rounded-lg hover:bg-[var(--bg)]"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="border-t border-[var(--line)] pt-3 grid grid-cols-2 gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 text-sm font-semibold text-[var(--ink)] bg-[var(--bg)] border border-[var(--line)] rounded-lg"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2 text-sm font-semibold text-[var(--ai)] bg-[var(--ac)] rounded-lg"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
