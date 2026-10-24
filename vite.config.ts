import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(() => {
  return {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          index: path.resolve(__dirname, 'index.html'),
          login: path.resolve(__dirname, 'login.html'),
          register: path.resolve(__dirname, 'register.html'),
          dashboard: path.resolve(__dirname, 'dashboard.html'),
          loans: path.resolve(__dirname, 'loans.html'),
          loanApplication: path.resolve(__dirname, 'loan-application.html'),
          emiCalculator: path.resolve(__dirname, 'emi-calculator.html'),
          investments: path.resolve(__dirname, 'investments.html'),
          stocks: path.resolve(__dirname, 'stocks.html'),
          mutualFunds: path.resolve(__dirname, 'mutual-funds.html'),
          sipCalculator: path.resolve(__dirname, 'sip-calculator.html'),
          demat: path.resolve(__dirname, 'demat.html'),
          profile: path.resolve(__dirname, 'profile.html'),
          notifications: path.resolve(__dirname, 'notifications.html'),
          admin: path.resolve(__dirname, 'admin.html'),
          agents: path.resolve(__dirname, 'agents.html'),
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
