'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { AuthUser, getCurrentUser, signInWithEmail, signOut, signUpWithEmail, supabase } from '@/lib/api/supabase';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, username?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check if current user is an admin
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    // Initialize: Get current session and user on first load
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);

        if (session) {
          // Get detailed user data
          const userData = await getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        toast.error('Error loading user data');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);

      if (event === 'SIGNED_IN' && session) {
        const userData = await getCurrentUser();
        setUser(userData);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign up function
  const signUp = async (email: string, password: string, username?: string) => {
    setIsLoading(true);
    try {
      await signUpWithEmail(email, password, { username });
      toast.success('Account created successfully! Please check your email for verification.');
      router.push('/auth/verify');
    } catch (error: any) {
      console.error('Error signing up:', error);
      toast.error(error.message || 'An error occurred during sign up');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { user } = await signInWithEmail(email, password);
      if (user) {
        toast.success('Signed in successfully!');
        router.push('/');
      }
    } catch (error: any) {
      console.error('Error signing in:', error);
      toast.error(error.message || 'Invalid email or password');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    try {
      await signOut();
      toast.success('Signed out successfully');
      router.push('/');
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast.error(error.message || 'An error occurred during sign out');
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    session,
    isLoading,
    isAdmin,
    signUp,
    signIn,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
