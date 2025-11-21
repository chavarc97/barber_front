import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { api } from '../lib/api.ts';
import type { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string, phone: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const profile = await api.get<UserProfile>('profiles/me/');
      setUser(profile);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    const response = await api.post<{ access: string; refresh: string; user: UserProfile }>(
      'auth/login/',
      { username, password },
      false
    );

    localStorage.setItem('access_token', response.access);
    localStorage.setItem('refresh_token', response.refresh);
    setUser(response.user);
  };

  const signup = async (username: string, email: string, password: string, phone: string) => {
    const response = await api.post<{ access: string; refresh: string; user: UserProfile }>(
      'auth/register/',
      { username, email, password, phone_number: phone },
      false
    );

    localStorage.setItem('access_token', response.access);
    localStorage.setItem('refresh_token', response.refresh);
    setUser(response.user);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
