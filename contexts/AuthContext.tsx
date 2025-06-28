import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  showTurtleIntro: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  completeTurtleIntro: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  console.log('AuthProvider rendering...');
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTurtleIntro, setShowTurtleIntro] = useState(false);

  useEffect(() => {
    console.log('AuthProvider useEffect running...');
    
    // Get initial session with proper error handling
    const initializeAuth = async () => {
      try {
        console.log('Checking for existing session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setUser(null);
          setLoading(false);
          return;
        }

        if (session?.user) {
          console.log('Found existing session for user:', session.user.email);
          setUser(session.user);
          // Don't show turtle intro for restored sessions, only for fresh logins
        } else {
          console.log('No existing session found');
          setUser(null);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event, session?.user ? `authenticated (${session.user.email})` : 'not authenticated');
        
        setUser(session?.user ?? null);
        
        // Show turtle intro only on fresh sign ins, not on session restore
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('Fresh sign in detected, showing turtle intro');
          setShowTurtleIntro(true);
        } else if (event === 'SIGNED_OUT') {
          console.log('Sign out detected');
          setShowTurtleIntro(false);
        }
        // TOKEN_REFRESHED events don't need turtle intro
        
        setLoading(false);
      }
    );

    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      return { error };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('Starting sign out process...');
      
      // Clear local state immediately
      setUser(null);
      setShowTurtleIntro(false);
      setLoading(true);
      
      // Sign out from Supabase - this will also clear AsyncStorage
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Supabase sign out error:', error);
        // Don't throw error, continue with local cleanup
      } else {
        console.log('Successfully signed out from Supabase');
      }
      
      // Platform-specific cleanup
      if (Platform.OS === 'web') {
        // Clear any cached data and force navigation
        if (typeof window !== 'undefined') {
          // Clear localStorage/sessionStorage if needed
          try {
            localStorage.clear();
            sessionStorage.clear();
          } catch (e) {
            console.warn('Could not clear storage:', e);
          }
          
          // Force navigation to welcome page
          window.location.replace('/');
        }
      } else {
        // On mobile, Supabase should have cleared AsyncStorage automatically
        console.log('Mobile sign out completed');
      }
      
    } catch (error) {
      console.error('Error during sign out:', error);
      // Even if there's an error, ensure local state is cleared
      setUser(null);
      setShowTurtleIntro(false);
      
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.location.replace('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const completeTurtleIntro = () => {
    setShowTurtleIntro(false);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      showTurtleIntro,
      signIn, 
      signUp, 
      signOut,
      completeTurtleIntro
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};