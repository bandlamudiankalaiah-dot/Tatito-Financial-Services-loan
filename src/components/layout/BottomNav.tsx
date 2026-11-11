import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Send, TrendingUp, Landmark, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  const tabs = [
    { label: 'Home', to: '/', icon: Home, active: path === '/' },
    { label: 'Payments', to: '/payments', icon: Send, active: path === '/payments' || path === '/bills' || path === '/wallet' },
    { label: 'Invest', to: '/mutual-funds', icon: TrendingUp, active: path === '/mutual-funds' || path === '/stocks' || path === '/investments' || path === '/sip-calculator' },
    { label: 'Loans', to: '/loans', icon: Landmark, active: path === '/loans' || path === '/loan-application' || path === '/emi-calculator' },
    { label: 'Profile', to: '/profile', icon: User, active: path === '/profile' || path === '/dashboard' || path === '/services' },
  ];

  return (
    <nav
      aria-label="Primary Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--card)]/95 backdrop-blur-md border-t border-[var(--line)] md:hidden"
    >
      <div className="grid grid-cols-5 items-center h-14 max-w-md mx-auto px-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <Link
              key={t.label}
              to={t.to}
              className={`min-h-[44px] flex flex-col items-center justify-center rounded-lg transition-colors ${
                t.active ? 'text-[var(--lt)] font-bold' : 'text-[var(--mut)] hover:text-[var(--ink)]'
              }`}
            >
              <Icon className="w-[19px] h-[19px]" />
              <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">{t.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
