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
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Supabase session:', session?.user ? 'authenticated' : 'not authenticated');
      setUser(session?.user ?? null);
      // Show turtle intro when user logs in
      if (session?.user) {
        setShowTurtleIntro(true);
      }
      setLoading(false);
    }).catch((error) => {
      console.error('Supabase session error:', error);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event, session?.user ? 'authenticated' : 'not authenticated');
        setUser(session?.user ?? null);
        
        // Show turtle intro on sign in events
        if (event === 'SIGNED_IN' && session?.user) {
          setShowTurtleIntro(true);
        } else if (event === 'SIGNED_OUT') {
          setShowTurtleIntro(false);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
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
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Supabase sign out error:', error);
        // Don't throw error, continue with local cleanup
      }
      
      console.log('Sign out completed');
      
      // Platform-specific navigation
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