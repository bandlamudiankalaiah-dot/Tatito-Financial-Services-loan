import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api, getAuthToken, setAuthToken, removeAuthToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<User>;
  mockOtpLogin: (email: string, otp: string, role?: UserRole) => Promise<User>;
  quickLogin: (targetRole: UserRole) => Promise<User>;
  register: (data: any) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const PRESET_ACCOUNTS: Record<UserRole, { email: string; name: string; password: string; roleName: string }> = {
  customer: {
    email: 'ramesh@tatito.in',
    name: 'Ramesh Kumar Chennur',
    password: 'Password@123',
    roleName: 'Customer',
  },
  agent: {
    email: 'agent@tatito.in',
    name: 'Siva Reddy (DSA)',
    password: 'Password@123',
    roleName: 'Channel Partner / DSA',
  },
  credit_officer: {
    email: 'credit@tatito.in',
    name: 'Lakshmi Narayana Rao',
    password: 'Password@123',
    roleName: 'Credit Underwriter',
  },
  admin: {
    email: 'admin@tatitofinance.com',
    name: 'Ankalaiah Bandlamudi',
    password: 'Password@123',
    roleName: 'Branch Administrator',
  },
  super_admin: {
    email: 'superadmin@tatitofinance.com',
    name: 'M/s. Tatito Projects — Super Admin',
    password: 'Password@123',
    roleName: 'Super Administrator',
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(getAuthToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const currentToken = getAuthToken();
      if (!currentToken) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      const userData = await api.getMe();
      setUser(userData);
    } catch (err) {
      console.warn('Session verification failed:', err);
      removeAuthToken();
      setUser(null);
      setTokenState(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password = 'Password@123'): Promise<User> => {
    const res = await api.login({ email, password });
    if (res.access_token) {
      setAuthToken(res.access_token);
      setTokenState(res.access_token);
    }
    setUser(res.user);
    return res.user;
  };

  const mockOtpLogin = async (email: string, otp: string, desiredRole: UserRole = 'customer'): Promise<User> => {
    // Label clearly as simulated development mock OTP authentication
    if (!otp || otp.length < 4) {
      throw new Error('Please enter a 4 or 6-digit mock OTP (e.g. 1234 or 9999).');
    }
    // Attempt login with pre-configured password for recognized test emails or default password
    const preset = Object.values(PRESET_ACCOUNTS).find(p => p.email.toLowerCase() === email.toLowerCase());
    const pass = preset ? preset.password : 'Password@123';
    return await login(email, pass);
  };

  const quickLogin = async (targetRole: UserRole): Promise<User> => {
    const preset = PRESET_ACCOUNTS[targetRole];
    return await login(preset.email, preset.password);
  };

  const register = async (data: any): Promise<User> => {
    const res = await api.register(data);
    if (res.access_token) {
      setAuthToken(res.access_token);
      setTokenState(res.access_token);
    }
    setUser(res.user);
    return res.user;
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // Ignore
    } finally {
      removeAuthToken();
      setTokenState(null);
      setUser(null);
    }
  };

  const role: UserRole = user?.role || 'customer';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        mockOtpLogin,
        quickLogin,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
