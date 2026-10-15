import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Wallet, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Code2, 
  Zap,
  Info
} from 'lucide-react';
import { User, BillCategory, Transaction, LoanType, NotificationItem } from './types';
import { storageService } from './services/storage';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { QuickActionGrid } from './components/QuickActionGrid';
import { BillPaymentSection } from './components/BillPaymentSection';
import { LoanRepaymentTracker } from './components/LoanRepaymentTracker';
import { LoanCalculator } from './components/LoanCalculator';
import { LoanApplicationPortal } from './components/LoanApplicationPortal';
import { FinancialLiteracySection } from './components/FinancialLiteracySection';
import { AdminDashboard } from './components/AdminDashboard';
import { ReceiptModal } from './components/ReceiptModal';
import { FastApiModal } from './components/FastApiModal';
import { Footer } from './components/Footer';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(storageService.getCurrentUser());
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    storageService.getUserNotifications(currentUser.id)
  );

  const [activeTab, setActiveTab] = useState<string>('services');
  const [activeBillCategory, setActiveBillCategory] = useState<BillCategory>('electricity');

  // Pre-filled loan application parameters (handed over from calculator)
  const [loanApplyParams, setLoanApplyParams] = useState<{
    type: LoanType;
    amount?: number;
    tenure?: number;
  }>({
    type: 'gold',
    amount: 300000,
    tenure: 24
  });

  // Modal states
  const [activeReceipt, setActiveReceipt] = useState<Transaction | null>(null);
  const [showApiDocs, setShowApiDocs] = useState<boolean>(false);

  // Sync notifications on user switch
  useEffect(() => {
    setNotifications(storageService.getUserNotifications(currentUser.id));
  }, [currentUser.id]);

  const handleSwitchUser = (userId: number) => {
    const updated = storageService.switchUser(userId);
    setCurrentUser({ ...updated });
    setNotifications(storageService.getUserNotifications(updated.id));
  };

  const handleAddMoney = (amount: number) => {
    const updated = storageService.addMoneyToWallet(amount);
    setCurrentUser({ ...updated });
    setNotifications(storageService.getUserNotifications(updated.id));
  };

  const handleMarkNotificationAsRead = (id: string) => {
    storageService.markNotificationAsRead(id);
    setNotifications(storageService.getUserNotifications(currentUser.id));
  };

  const handleMarkAllAsRead = () => {
    storageService.markAllNotificationsAsRead(currentUser.id);
    setNotifications(storageService.getUserNotifications(currentUser.id));
  };

  const handlePaymentSuccess = (txn: Transaction) => {
    setCurrentUser({ ...storageService.getCurrentUser() });
    setNotifications(storageService.getUserNotifications(currentUser.id));
    setActiveReceipt(txn);
  };

  const handleApplyFromCalculator = (type: LoanType, amount: number, tenure: number) => {
    setLoanApplyParams({ type, amount, tenure });
    setActiveTab('loans');
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleQuickRechargeCategory = (category: BillCategory) => {
    setActiveBillCategory(category);
    setActiveTab('services');
    setTimeout(() => {
      const el = document.getElementById('recharges-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        onAddMoney={handleAddMoney}
        notifications={notifications}
        onMarkNotificationAsRead={handleMarkNotificationAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onOpenApiDocs={() => setShowApiDocs(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Role Indicator Banner */}
      <div className="bg-emerald-950 border-b border-emerald-900/60 py-2 px-4 text-xs text-emerald-200">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              Active Session: <strong className="text-white">{currentUser.fullName}</strong>
              <span className="text-emerald-400/80 ml-1">
                ({currentUser.role === 'admin' ? '🛡️ Admin Branch Desk' : '👤 Customer, Kadapa Hub'})
              </span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-emerald-300/70">
              Wallet Balance: <strong className="text-emerald-300">₹{currentUser.walletBalance.toLocaleString('en-IN')}</strong>
            </span>
            <button
              onClick={() => handleSwitchUser(currentUser.id === 1 ? 2 : 1)}
              className="text-slate-950 bg-emerald-400 hover:bg-emerald-300 px-2.5 py-0.5 rounded-md font-bold text-[11px] transition cursor-pointer"
            >
              Switch to {currentUser.id === 1 ? 'Admin (Ankalaiah)' : 'Customer (Ramesh)'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Render sections depending on activeTab or overview */}
        {activeTab === 'services' && (
          <>
            <HeroSection
              onSelectAction={setActiveTab}
              onOpenQuickRecharge={() => {
                const el = document.getElementById('recharges-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />
            <QuickActionGrid
              onSelectCategory={handleQuickRechargeCategory}
              activeCategory={activeBillCategory}
            />
            <BillPaymentSection
              currentUser={currentUser}
              activeCategory={activeBillCategory}
              onSelectCategory={setActiveBillCategory}
              onPaymentSuccess={handlePaymentSuccess}
              onOpenWalletModal={() => handleAddMoney(2000)}
            />
            {/* Embedded Calculator Preview */}
            <LoanCalculator onApplyWithParameters={handleApplyFromCalculator} />
            <FinancialLiteracySection />
          </>
        )}

        {activeTab === 'loans' && (
          <div className="pt-6">
            <LoanApplicationPortal
              currentUser={currentUser}
              prefilledType={loanApplyParams.type}
              prefilledAmount={loanApplyParams.amount}
              prefilledTenure={loanApplyParams.tenure}
              onApplicationSubmitted={() => {
                // application submitted
              }}
            />
            <LoanCalculator onApplyWithParameters={handleApplyFromCalculator} />
          </div>
        )}

        {activeTab === 'emi-tracker' && (
          <div className="pt-6">
            <LoanRepaymentTracker
              currentUser={currentUser}
              onPaymentSuccess={handlePaymentSuccess}
              onOpenWalletModal={() => handleAddMoney(5000)}
              onApplyForLoan={() => setActiveTab('loans')}
            />
          </div>
        )}

        {activeTab === 'calculator' && (
          <div className="pt-6">
            <LoanCalculator onApplyWithParameters={handleApplyFromCalculator} />
          </div>
        )}

        {activeTab === 'blogs' && (
          <div className="pt-6">
            <FinancialLiteracySection />
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="pt-6">
            <AdminDashboard
              currentUser={currentUser}
              onSwitchToUser={() => {
                handleSwitchUser(1);
                setActiveTab('services');
              }}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer
        onSelectTab={setActiveTab}
        onOpenAdmin={() => {
          handleSwitchUser(2);
          setActiveTab('admin');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenApiDocs={() => setShowApiDocs(true)}
      />

      {/* BBPS Printable Receipt Modal */}
      {activeReceipt && (
        <ReceiptModal
          transaction={activeReceipt}
          onClose={() => setActiveReceipt(null)}
        />
      )}

      {/* FastAPI Backend Architecture Modal */}
      {showApiDocs && (
        <FastApiModal onClose={() => setShowApiDocs(false)} />
      )}
    </div>
  );
}
