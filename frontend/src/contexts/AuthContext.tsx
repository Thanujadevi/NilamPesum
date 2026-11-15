import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { LogoutModal } from '../components/auth/LogoutModal';

export type UserRole = 'farmer' | 'officer' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  preferred_language: string;
  district?: string;
  taluk?: string;
  village?: string;
  state?: string;
  is_verified?: boolean;
  onboarding_completed?: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  registerUser: (data: any) => Promise<boolean>;
  logout: () => Promise<void>;
  updateLanguage: (lang: string) => Promise<void>;
  setDemoUser: (roleType: UserRole) => Promise<void>;
  openLogoutModal: () => void;
  closeLogoutModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = '/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('nilam_pesum_token'));
  const [user, setUser] = useState<UserProfile | null>(() => {
    const savedToken = localStorage.getItem('nilam_pesum_token');
    const savedUser = localStorage.getItem('nilam_pesum_user');
    if (savedToken && savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.get(`${API_BASE}/auth/me`)
        .then((res) => {
          if (res.data && res.data.id) {
            setUser(res.data);
            localStorage.setItem('nilam_pesum_user', JSON.stringify(res.data));
            if (res.data.preferred_language) {
              i18n.changeLanguage(res.data.preferred_language);
              localStorage.setItem('nilam_pesum_lang', res.data.preferred_language);
            }
          }
        })
        .catch((err) => {
          if (err.response?.status === 401) {
            logout();
          }
        });
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
      if (res.data.status === 'success') {
        const { access_token, user: loggedUser } = res.data;
        setToken(access_token);
        setUser(loggedUser);
        localStorage.setItem('nilam_pesum_token', access_token);
        localStorage.setItem('nilam_pesum_user', JSON.stringify(loggedUser));
        if (loggedUser.preferred_language) {
          i18n.changeLanguage(loggedUser.preferred_language);
          localStorage.setItem('nilam_pesum_lang', loggedUser.preferred_language);
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const registerUser = async (data: any): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/auth/register`, data);
      if (res.data.status === 'success') {
        const { access_token, user: newUser } = res.data;
        setToken(access_token);
        setUser(newUser);
        localStorage.setItem('nilam_pesum_token', access_token);
        localStorage.setItem('nilam_pesum_user', JSON.stringify(newUser));
        if (newUser.preferred_language) {
          i18n.changeLanguage(newUser.preferred_language);
          localStorage.setItem('nilam_pesum_lang', newUser.preferred_language);
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('Register error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      if (token) {
        await axios.post(`${API_BASE}/auth/logout`).catch(() => {});
      }
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('nilam_pesum_token');
      localStorage.removeItem('nilam_pesum_user');
      delete axios.defaults.headers.common['Authorization'];
      setIsLoggingOut(false);
      setLogoutModalOpen(false);
    }
  };

  const openLogoutModal = () => setLogoutModalOpen(true);
  const closeLogoutModal = () => setLogoutModalOpen(false);

  const updateLanguage = async (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('nilam_pesum_lang', lang);
    if (user) {
      const updated = { ...user, preferred_language: lang };
      setUser(updated);
      localStorage.setItem('nilam_pesum_user', JSON.stringify(updated));
      if (token) {
        try {
          await axios.put(`${API_BASE}/auth/profile/language`, { preferred_language: lang });
        } catch (e) {
          // ignore network failure
        }
      }
    }
  };

  const setDemoUser = async (roleType: UserRole) => {
    const email = roleType === 'farmer'
      ? 'farmer@nilampesum.tn.gov.in'
      : roleType === 'officer'
      ? 'officer@nilampesum.tn.gov.in'
      : 'admin@nilampesum.tn.gov.in';
    const pwd = roleType === 'farmer' ? 'farmer123' : roleType === 'officer' ? 'officer123' : 'admin123';

    const success = await login(email, pwd);
    if (!success) {
      const fallbackUser: UserProfile = {
        id: `${roleType}-demo-id`,
        email,
        full_name: roleType === 'farmer'
          ? 'செல்வம் ராமசாமி (Selvam Ramasamy)'
          : roleType === 'officer'
          ? 'டாக்டர். சுந்தரம் (Dr. Sundaram)'
          : 'Chief Geospatial Admin',
        role: roleType,
        preferred_language: 'ta',
        district: 'Thanjavur',
        village: 'Thiruvaiyaru',
        is_verified: true,
        onboarding_completed: true
      };
      setToken('demo-token');
      setUser(fallbackUser);
      localStorage.setItem('nilam_pesum_token', 'demo-token');
      localStorage.setItem('nilam_pesum_user', JSON.stringify(fallbackUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'farmer',
        token,
        isAuthenticated: Boolean(token && user),
        isLoading,
        login,
        registerUser,
        logout,
        updateLanguage,
        setDemoUser,
        openLogoutModal,
        closeLogoutModal,
      }}
    >
      {children}
      <LogoutModal
        isOpen={logoutModalOpen}
        onClose={closeLogoutModal}
        onConfirm={logout}
        isProcessing={isLoggingOut}
      />
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
