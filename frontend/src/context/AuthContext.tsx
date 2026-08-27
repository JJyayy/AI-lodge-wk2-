import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../services/supabase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'signin' | 'signup';
  openAuthModal: (mode?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
  signIn: (email: string, pass: string) => Promise<{ error: string | null }>;
  signUp: (email: string, pass: string) => Promise<{ error: string | null; message?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user && session?.access_token) {
        setUser({ id: session.user.id, email: session.user.email || '' });
        setToken(session.access_token);
      } else {
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    });

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user && session?.access_token) {
        setUser({ id: session.user.id, email: session.user.email || '' });
        setToken(session.access_token);
      } else {
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const openAuthModal = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const signIn = async (email: string, pass: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });

    if (error) {
      return { error: error.message };
    }

    if (data.session) {
      setUser({ id: data.session.user.id, email: data.session.user.email || '' });
      setToken(data.session.access_token);
      closeAuthModal();
    }
    return { error: null };
  };

  const signUp = async (email: string, pass: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
    });

    if (error) {
      return { error: error.message };
    }

    if (data.session) {
      setUser({ id: data.session.user.id, email: data.session.user.email || '' });
      setToken(data.session.access_token);
      closeAuthModal();
      return { error: null };
    } else {
      return {
        error: null,
        message: 'Account created! Please check your email to confirm registration or sign in.',
      };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
