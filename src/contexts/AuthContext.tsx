
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
  signOut: () => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to clean OAuth fragments from URL
const cleanOAuthFragments = () => {
  // Remove hash if it contains OAuth tokens or if it's just an empty hash
  if (window.location.hash && (window.location.hash.includes('access_token') || window.location.hash === '#')) {
    const cleanUrl = window.location.href.split('#')[0];
    window.history.replaceState({}, document.title, cleanUrl);
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize authentication
    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          setLoading(false);
          return;
        }

        setSession(session);
        
        if (session?.user) {
          await loadUserProfile(session.user);
        } else {
          setLoading(false);
        }
        
        // Always clean OAuth fragments and trailing hashes
        cleanOAuthFragments();
      } catch (error) {
        console.error('Auth initialization error:', error);
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session?.user) {
          const shouldRedirect = event === 'SIGNED_IN';
          await loadUserProfile(session.user, shouldRedirect);
          
          // Clean URL fragments after OAuth
          if (event === 'SIGNED_IN') {
            cleanOAuthFragments();
            toast.success('Successfully signed in!');
          }
        } else {
          setUser(null);
          setLoading(false);
          
          if (event === 'SIGNED_OUT') {
            toast.success('Successfully signed out!');
            navigate('/');
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Simplified, reliable profile loading function
  const loadUserProfile = async (authUser: User, shouldRedirect = false) => {
    try {
      // Get or create user profile
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      let finalProfile = null;

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it with essential fields only
        const newProfile = {
          user_id: authUser.id,
          email: authUser.email || '',
          full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || null,
          role: (authUser.email === 'iradwatkins@gmail.com' ? 'admin' : 'customer') as const,
          is_broker: false,
          broker_category_discounts: {}
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert(newProfile)
          .select()
          .single();

        if (createError) {
          toast.error('Failed to create user profile. Please try again.');
          setUser({ ...authUser, profile: undefined });
        } else {
          finalProfile = {
            ...createdProfile,
            broker_category_discounts: createdProfile.broker_category_discounts || {}
          };
          setUser({ 
            ...authUser, 
            profile: finalProfile
          });
          toast.success('Profile created successfully!');
        }
      } else if (error) {
        toast.error('Failed to load user profile. Please try refreshing.');
        setUser({ ...authUser, profile: undefined });
      } else {
        finalProfile = {
          ...profile,
          broker_category_discounts: profile.broker_category_discounts || {}
        };
        setUser({ 
          ...authUser, 
          profile: finalProfile
        });
      }

      // Handle redirect after profile is loaded
      if (shouldRedirect && finalProfile) {
        if (finalProfile.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.');
      setUser({ ...authUser, profile: undefined });
    } finally {
      setLoading(false);
    }
  };


  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // Clear any cached state and redirect to home
      localStorage.removeItem('adminMode');
      navigate('/');
    } catch (error) {
      toast.error('Error signing out');
    }
  };


  const signInWithMagicLink = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: getRedirectUrl()
        }
      });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getRedirectUrl()
        }
      });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  };

// Environment-aware redirect URL utility
const getRedirectUrl = () => {
  const hostname = window.location.hostname;
  
  // Development environment
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${window.location.origin}/`;
  }
  
  // Production environment - always redirect to canonical domain
  if (hostname === 'gangrunprinting.com' || hostname.includes('vercel.app')) {
    return 'https://gangrunprinting.com/';
  }
  
  // Fallback to current origin
  return `${window.location.origin}/`;
};

  const value: AuthContextType = {
    user,
    session,
    isAuthenticated: !!user,
    loading,
    signOut,
    signInWithMagicLink,
    signInWithGoogle,
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
