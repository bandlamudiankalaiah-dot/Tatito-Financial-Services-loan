import React, { useState } from 'react';
import { 
  Building2, 
  Wallet, 
  Bell, 
  ShieldCheck, 
  UserCheck, 
  ChevronDown, 
  Plus, 
  CheckCheck,
  Code2,
  ExternalLink,
  Menu,
  X
} from 'lucide-react';
import { User, NotificationItem } from '../types';

interface NavbarProps {
  currentUser: User;
  onSwitchUser: (userId: number) => void;
  onAddMoney: (amount: number) => void;
  notifications: NotificationItem[];
  onMarkNotificationAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onOpenApiDocs: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onSwitchUser,
  onAddMoney,
  notifications,
  onMarkNotificationAsRead,
  onMarkAllAsRead,
  onOpenApiDocs,
  activeTab,
  setActiveTab
}) => {
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [customAmount, setCustomAmount] = useState('2000');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleAddFunds = (amt: number) => {
    onAddMoney(amt);
    setShowWalletModal(false);
  };

  const navLinks = [
    { id: 'services', label: 'Recharges & Bills' },
    { id: 'loans', label: 'Loans & Applications' },
    { id: 'emi-tracker', label: 'EMI Tracker' },
    { id: 'calculator', label: 'EMI Calculator' },
    { id: 'blogs', label: 'Financial Literacy' },
    ...(currentUser.role === 'admin' ? [{ id: 'admin', label: 'Admin Portal' }] : [])
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        {/* Top utility ticker */}
        <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 hidden sm:block">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" /> RBI-Regulated NBFC Partners
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300">BBPS Enabled Platform</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">Headquarters: Trunk Road, Kadapa, Andhra Pradesh</span>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={onOpenApiDocs}
                className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-medium transition cursor-pointer"
              >
                <Code2 className="w-3.5 h-3.5" /> FastAPI Backend Architecture
              </button>
              <span className="text-slate-400">Support: +91 8562 245678</span>
            </div>
          </div>
        </div>

        {/* Main Nav */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('services')}>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
                    TATITO
                  </span>
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    KADAPA
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium tracking-wide">
                  Financial Services &amp; BBPS
                </div>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => {
                    setActiveTab(link.id);
                  }}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === link.id
                      ? 'text-emerald-700 bg-emerald-50 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </nav>

            {/* Right side controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Wallet Button */}
              <button
                onClick={() => setShowWalletModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/60 text-emerald-900 transition-all cursor-pointer group"
                title="Tatito Pay Wallet"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs">
                  <Wallet className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <div className="text-[10px] text-emerald-700 font-medium uppercase tracking-wider hidden sm:block">Wallet</div>
                  <div className="text-xs sm:text-sm font-bold text-emerald-950">
                    ₹{currentUser.walletBalance.toLocaleString('en-IN')}
                  </div>
                </div>
                <Plus className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-125 transition-transform hidden sm:block" />
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 sm:p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-emerald-400" />
                        <span className="font-semibold text-sm">Notifications</span>
                        <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-0.5 rounded-full font-medium">
                          {unreadCount} unread
                        </span>
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={onMarkAllAsRead}
                          className="text-xs text-slate-300 hover:text-white flex items-center gap-1 font-medium transition cursor-pointer"
                        >
                          <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 text-xs">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => onMarkNotificationAsRead(n.id)}
                            className={`p-3.5 transition cursor-pointer hover:bg-slate-50 ${
                              !n.isRead ? 'bg-emerald-50/40 border-l-3 border-emerald-500' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                              <span className="text-[10px] text-slate-400 shrink-0">
                                {new Date(n.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Switcher / Profile */}
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition cursor-pointer"
                >
                  <img
                    src={currentUser.avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"}
                    alt={currentUser.fullName}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover ring-1 ring-slate-200"
                  />
                  <div className="text-left hidden md:block">
                    <div className="text-xs font-bold text-slate-900 leading-tight">
                      {currentUser.fullName}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium capitalize">
                      {currentUser.role === 'admin' ? '🛡️ Admin Officer' : '👤 Customer (Kadapa)'}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Switch Account (Demo)</p>
                      <p className="text-xs text-slate-500 mt-0.5">Test Standard User vs Admin roles instantly:</p>
                    </div>

                    <div className="mt-1 space-y-1">
                      <button
                        onClick={() => {
                          onSwitchUser(1);
                          setShowUserDropdown(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition cursor-pointer ${
                          currentUser.id === 1 ? 'bg-emerald-50 text-emerald-900 font-bold' : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <div>
                          <div className="font-semibold">Ramesh Kumar (Customer)</div>
                          <div className="text-[10px] text-slate-500">Kadapa Resident • Active Loans</div>
                        </div>
                        {currentUser.id === 1 && <UserCheck className="w-4 h-4 text-emerald-600" />}
                      </button>

                      <button
                        onClick={() => {
                          onSwitchUser(2);
                          setShowUserDropdown(false);
                          setActiveTab('admin');
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition cursor-pointer ${
                          currentUser.id === 2 ? 'bg-emerald-50 text-emerald-900 font-bold' : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <div>
                          <div className="font-semibold">Ankalaiah B. (Admin)</div>
                          <div className="text-[10px] text-amber-600 font-medium">Branch Officer • Loan Approver</div>
                        </div>
                        {currentUser.id === 2 && <UserCheck className="w-4 h-4 text-emerald-600" />}
                      </button>
                    </div>

                    <div className="border-t border-slate-100 mt-2 pt-2">
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          onOpenApiDocs();
                        }}
                        className="w-full flex items-center gap-2 p-2 rounded-lg text-xs text-slate-600 hover:bg-slate-100 font-medium transition cursor-pointer"
                      >
                        <Code2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>View FastAPI Backend Code</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  setActiveTab(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
                  activeTab === link.id
                    ? 'text-emerald-700 bg-emerald-50'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenApiDocs();
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-amber-700 bg-amber-50 flex items-center justify-between"
            >
              <span>FastAPI Architecture Guide</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        )}
      </header>

      {/* Top-up Wallet Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Add Money to Tatito Pay</h3>
                  <p className="text-xs text-slate-500">Current Balance: ₹{currentUser.walletBalance.toLocaleString('en-IN')}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowWalletModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">Quick Select Amount</label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {[1000, 2000, 5000, 10000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setCustomAmount(amt.toString())}
                      className={`py-2 px-1 text-xs font-bold rounded-xl border transition cursor-pointer ${
                        customAmount === amt.toString()
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      +₹{amt.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Enter Amount (₹)</label>
                <div className="relative mt-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. 5000"
                    min="100"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Instant Bank Auto-Credit
                </div>
                <p className="text-[11px] text-slate-500">
                  Kadapa Regional Clearing: Funds are instantly credited to your wallet for instant BBPS bills &amp; loan repayments.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleAddFunds(parseFloat(customAmount) || 0)}
                disabled={!customAmount || parseFloat(customAmount) <= 0}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition cursor-pointer disabled:opacity-50"
              >
                Proceed to Add ₹{parseFloat(customAmount || '0').toLocaleString('en-IN')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
