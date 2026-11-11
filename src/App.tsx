import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

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

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans antialiased selection:bg-[#0D4A36] selection:text-[#FDF8E7]">
      <ScrollToTop />
      <Navbar />

      <main className="flex-1">
        <Suspense
          fallback={
            <div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs font-semibold text-[#0E6245]">
              Loading Tatito Financial Suite...
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/loans" element={<LoansPage />} />
            <Route path="/loan-application" element={<LoanApplicationPage />} />
            <Route path="/emi-calculator" element={<EmiCalculatorPage />} />
            <Route path="/stocks" element={<StocksPage />} />
            <Route path="/mutual-funds" element={<MutualFundsPage />} />
            <Route path="/sip-calculator" element={<MutualFundsPage />} />
            <Route path="/investments" element={<InvestmentsPage />} />
            <Route path="/demat" element={<DematPage />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/bills" element={<WalletPage />} />
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
    </div>
  );
};

export default App;
