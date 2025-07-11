import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AuthUser extends User {
  profile?: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    phone: string | null;
    company: string | null;
    role: 'customer' | 'admin' | 'broker';
    broker_status: 'pending' | 'approved' | 'rejected' | null;
    is_broker: boolean;
    broker_category_discounts: Record<string, any>;
    created_at: string;
    updated_at: string;
  };
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  loading: boolean;
  error?: string | null;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ success: boolean; error?: string }>;
  signInWithMagicLink: (email: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  clearError?: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to clean OAuth fragments from URL
const cleanOAuthFragments = () => {
  if (window.location.hash && (window.location.hash.includes('access_token') || window.location.hash === '#')) {
    const cleanUrl = window.location.href.split('#')[0];
    window.history.replaceState({}, document.title, cleanUrl);
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Clear any stored error on mount
  useEffect(() => {
    sessionStorage.removeItem('auth_error');
  }, []);

  // Load user profile using RPC function
  const loadUserProfile = async (authUser: User) => {
    try {
      console.log('Loading user profile for:', authUser.id);
      
      // Use the get_or_create_profile RPC function
      const { data: profileData, error } = await supabase
        .rpc('get_or_create_profile', { user_uuid: authUser.id });

      if (error) {
        console.error('Error loading profile:', error);
        toast.error('Failed to load user profile');
        setUser({ ...authUser, profile: undefined });
        return null;
      }

      if (profileData) {
        const profile = {
          ...profileData,
          broker_category_discounts: profileData.broker_category_discounts || {}
        };
        
        setUser({
          ...authUser,
          profile
        });
        
        return profile;
      }

      // This shouldn't happen with get_or_create_profile
      console.error('No profile data returned');
      setUser({ ...authUser, profile: undefined });
      return null;
    } catch (err) {
      console.error('Unexpected error loading profile:', err);
      toast.error('An unexpected error occurred');
      setUser({ ...authUser, profile: undefined });
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        
        if (session?.user) {
          const profile = await loadUserProfile(session.user);
          
          // Clean URL fragments after OAuth
          if (_event === 'SIGNED_IN') {
            cleanOAuthFragments();
            toast.success('Successfully signed in!');
            
            // Redirect admins to admin panel on sign in
            if (profile?.role === 'admin') {
              navigate('/admin');
            }
          }
        } else {
          setUser(null);
          setLoading(false);
          
          if (_event === 'SIGNED_OUT') {
            toast.success('Successfully signed out!');
            navigate('/');
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        toast.error(error.message);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      const message = error.message || 'An error occurred during sign in';
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        setError(error.message);
        toast.error(error.message);
        return { success: false, error: error.message };
      }

      toast.success('Account created! Please check your email to verify your account.');
      return { success: true };
    } catch (error: any) {
      const message = error.message || 'An error occurred during sign up';
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const signInWithMagicLink = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
        },
      });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error: any) {
      return { error: error.message || 'Failed to send magic link' };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth`,
        },
      });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error: any) {
      return { error: error.message || 'Failed to sign in with Google' };
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    session,
    isAuthenticated: !!user,
    loading,
    error,
    signOut,
    signIn,
    signUp,
    signInWithMagicLink,
    signInWithGoogle,
    clearError,
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