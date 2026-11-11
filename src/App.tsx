import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoansPage } from './pages/LoansPage';
import { LoanApplicationPage } from './pages/LoanApplicationPage';
import { EmiCalculatorPage } from './pages/EmiCalculatorPage';
import { StocksPage } from './pages/StocksPage';
import { MutualFundsPage } from './pages/MutualFundsPage';
import { InvestmentsPage } from './pages/InvestmentsPage';
import { DematPage } from './pages/DematPage';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { AgentDashboard } from './pages/AgentDashboard';
import { CreditOfficerDashboard } from './pages/CreditOfficerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotificationsPage } from './pages/NotificationsPage';
import { WalletPage } from './pages/WalletPage';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans antialiased selection:bg-[#003366] selection:text-white">
      <ScrollToTop />
      <Navbar />

      <main className="flex-1">
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
      </main>

      <Footer />
    </div>
  );
};

export default App;
