import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { getSupabase } from '../lib/supabase';
import { fetchMe } from '../api/client';
import { MeResponse } from '../types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  me: MeResponse | null;
  isLoading: boolean;
  isInitialized: boolean;
  refreshMe: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (name: string, email: string, password: string) => Promise<{ error?: string; message?: string }>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [me, setMe] = useState<MeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const loadMe = useCallback(async () => {
    try {
      const data = await fetchMe();
      setMe((prev) => {
        // Prevent unnecessary state updates if me object is unchanged
        if (
          prev &&
          prev.id === data.id &&
          prev.itemCount === data.itemCount &&
          prev.itemLimit === data.itemLimit &&
          prev.isPro === data.isPro
        ) {
          return prev;
        }
        return data;
      });
    } catch (err) {
      setMe(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const sb = await getSupabase();
        const { data: { session: initialSession } } = await sb.auth.getSession();

        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          if (initialSession) {
            await loadMe();
          }
          setIsLoading(false);
          setIsInitialized(true);
        }

        const { data: { subscription } } = sb.auth.onAuthStateChange(
          async (_event, newSession) => {
            if (mounted) {
              setSession(newSession);
              setUser(newSession?.user ?? null);
              if (newSession) {
                await loadMe();
              } else {
                setMe(null);
              }
            }
          }
        );

        return () => {
          subscription.unsubscribe();
        };
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (mounted) {
          setIsLoading(false);
          setIsInitialized(true);
        }
      }
    }

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const sb = await getSupabase();
      const { data, error } = await sb.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return { error: error.message };
      }

      setSession(data.session);
      setUser(data.user);
      await loadMe();
      return {};
    } catch (err: any) {
      return { error: err.message || 'An unexpected error occurred during sign in.' };
    }
  }, [loadMe]);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    try {
      const sb = await getSupabase();
      const trimmedEmail = email.trim();
      const trimmedName = name.trim();

      const { data, error } = await sb.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: { name: trimmedName },
        },
      });

      if (error) {
        return { error: error.message };
      }

      // If email confirmation is ON, session is null until user clicks email link
      if (!data.session) {
        return {
          message: 'Account created! Check your email to confirm, then login.',
        };
      }

      setSession(data.session);
      setUser(data.user);
      await loadMe();
      return {};
    } catch (err: any) {
      return { error: err.message || 'An unexpected error occurred during sign up.' };
    }
  }, [loadMe]);

  const signOut = useCallback(async () => {
    try {
      const sb = await getSupabase();
      await sb.auth.signOut();
    } catch (err) {
      console.warn('Sign out warning:', err);
    } finally {
      setUser(null);
      setSession(null);
      setMe(null);
    }
  }, []);

  const deleteAccount = useCallback(async () => {
    try {
      const sb = await getSupabase();
      await sb.auth.signOut();
      setUser(null);
      setSession(null);
      setMe(null);
      return {};
    } catch (err: any) {
      return { error: err.message || 'Could not delete account.' };
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      user,
      session,
      me,
      isLoading,
      isInitialized,
      refreshMe: loadMe,
      signIn,
      signUp,
      signOut,
      deleteAccount,
    }),
    [user, session, me, isLoading, isInitialized, loadMe, signIn, signUp, signOut, deleteAccount]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
