'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

interface AuthContextType {
  user: {
    email: string;
    name: string;
    image: string;
  } | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status !== 'loading') {
      setIsLoading(false);
    }
  }, [status]);

  const isAuthenticated = !!session?.user && !!session.user.email;

  const login = () => {
    signIn('google', { callbackUrl: '/' });
  };

  const logout = () => {
    signOut({ callbackUrl: '/' });
  };

  const value = {
    user: isAuthenticated ? {
      email: session?.user?.email || '',
      name: session?.user?.name || '',
      image: session?.user?.image || '',
    } : null,
    isLoading,
    isAuthenticated,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
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
