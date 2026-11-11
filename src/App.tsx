import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { BottomNav } from './components/layout/BottomNav';

// Eagerly loaded core entry pages
import { LandingPage } from './pages/LandingPage';
import { LoansPage } from './pages/LoansPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Lazy-loaded feature & dashboard pages for optimal chunking (<500 kB per chunk)
const LoanApplicationPage = lazy(() => import('./pages/LoanApplicationPage').then(m => ({ default: m.LoanApplicationPage })));
const EmiCalculatorPage = lazy(() => import('./pages/EmiCalculatorPage').then(m => ({ default: m.EmiCalculatorPage })));
const StocksPage = lazy(() => import('./pages/StocksPage').then(m => ({ default: m.StocksPage })));
const MutualFundsPage = lazy(() => import('./pages/MutualFundsPage').then(m => ({ default: m.MutualFundsPage })));
const InvestmentsPage = lazy(() => import('./pages/InvestmentsPage').then(m => ({ default: m.InvestmentsPage })));
const DematPage = lazy(() => import('./pages/DematPage').then(m => ({ default: m.DematPage })));
const CustomerDashboard = lazy(() => import('./pages/CustomerDashboard').then(m => ({ default: m.CustomerDashboard })));
const AgentDashboard = lazy(() => import('./pages/AgentDashboard').then(m => ({ default: m.AgentDashboard })));
const CreditOfficerDashboard = lazy(() => import('./pages/CreditOfficerDashboard').then(m => ({ default: m.CreditOfficerDashboard })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage').then(m => ({ default: m.NotificationsPage })));
const WalletPage = lazy(() => import('./pages/WalletPage').then(m => ({ default: m.WalletPage })));
const PaymentsHubPage = lazy(() => import('./pages/PaymentsHubPage').then(m => ({ default: m.PaymentsHubPage })));
const SuperServicesPage = lazy(() => import('./pages/SuperServicesPage').then(m => ({ default: m.SuperServicesPage })));

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--ink)] font-sans antialiased selection:bg-[var(--ac)] selection:text-[var(--ai)] transition-colors pb-14 md:pb-0">
      <ScrollToTop />
      <Navbar />

      <main className="flex-1">
        <Suspense
          fallback={
            <div className="max-w-[1100px] mx-auto px-4 py-16 text-center text-xs font-semibold text-[var(--lt)]">
              Loading Tatito Financial Services...
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/payments" element={<PaymentsHubPage />} />
            <Route path="/services" element={<SuperServicesPage />} />
            <Route path="/loans" element={<LoansPage />} />
            <Route path="/loan-application" element={<LoanApplicationPage />} />
            <Route path="/emi-calculator" element={<EmiCalculatorPage />} />
            <Route path="/stocks" element={<StocksPage />} />
            <Route path="/mutual-funds" element={<MutualFundsPage />} />
            <Route path="/sip-calculator" element={<MutualFundsPage />} />
            <Route path="/investments" element={<InvestmentsPage />} />
            <Route path="/demat" element={<DematPage />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/bills" element={<PaymentsHubPage />} />
            <Route path="/dashboard" element={<CustomerDashboard />} />
            <Route path="/agents" element={<AgentDashboard />} />
            <Route path="/credit-officer" element={<CreditOfficerDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/notifications" element={<NotificationsPage />} />

            {/* Fallback */}
            <Route path="*" element={<LandingPage />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default App;
