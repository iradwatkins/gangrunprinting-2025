
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AuthUser extends User {
  profile?: {
    id: string;
    user_id: string;
    is_broker: boolean;
    broker_category_discounts: Record<string, any>;
    company_name: string | null;
    phone: string | null;
    created_at: string;
    updated_at: string;
    // Derived fields from auth.users
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    role: 'customer' | 'admin' | 'broker';
    broker_status: 'pending' | 'approved' | 'rejected' | null;
  };
}

interface Address {
  id: string;
  label: string;
  first_name: string;
  last_name: string;
  company?: string;
  street_address: string;
  street_address_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
  is_default: boolean;
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('AuthContext: Initial session check:', { session, error });
        
        setSession(session);
        if (session?.user) {
          await loadUserProfile(session.user);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('AuthContext: Auth initialization error:', error);
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthContext: Auth state change:', event, session?.user?.email);
        setSession(session);
        
        if (session?.user) {
          await loadUserProfile(session.user);
          
          if (event === 'SIGNED_IN') {
            console.log('AuthContext: User signed in:', session.user.email);
            toast.success('Successfully signed in!');
            // Note: Navigation is handled by AuthCallback component for OAuth flows
            // Only handle navigation for non-OAuth sign-ins (like magic links)
            if (!window.location.pathname.includes('/auth/callback')) {
              const profile = await getUserProfile(session.user);
              if (profile?.role === 'admin') {
                navigate('/admin');
              } else {
                navigate('/');
              }
            }
          }
        } else {
          setUser(null);
          setLoading(false);
          
          if (event === 'SIGNED_OUT') {
            toast.success('Successfully signed out!');
            // Redirect to home page after logout
            navigate('/');
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Helper function to get user profile
  const getUserProfile = async (authUser: User) => {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error);
        return null;
      }

      if (!profile) {
        // Create profile if it doesn't exist - only use fields that exist in the schema
        const isHardcodedAdmin = authUser.email === 'iradwatkins@gmail.com';
        const newProfile = {
          user_id: authUser.id,
          is_broker: isHardcodedAdmin || false,
          broker_category_discounts: {},
          company_name: null,
          phone: null
        };

        const { data: createdProfile } = await supabase
          .from('user_profiles')
          .insert(newProfile)
          .select()
          .single();

        if (createdProfile) {
          // Add derived fields from auth.users
          return {
            ...createdProfile,
            email: authUser.email || '',
            full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || null,
            avatar_url: authUser.user_metadata?.avatar_url || null,
            role: isHardcodedAdmin ? 'admin' as const : 'customer' as const,
            broker_status: null
          };
        }

        return null;
      }

      // Add derived fields from auth.users
      const isHardcodedAdmin = authUser.email === 'iradwatkins@gmail.com';
      return {
        ...profile,
        email: authUser.email || '',
        full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || null,
        avatar_url: authUser.user_metadata?.avatar_url || null,
        role: isHardcodedAdmin ? 'admin' as const : 'customer' as const,
        broker_status: null
      };
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      return null;
    }
  };

  const loadUserProfile = async (authUser: User) => {
    try {
      // Get or create user profile
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const isHardcodedAdmin = authUser.email === 'iradwatkins@gmail.com';
        const newProfile = {
          user_id: authUser.id,
          is_broker: isHardcodedAdmin || false,
          broker_category_discounts: {},
          company_name: null,
          phone: null
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert(newProfile)
          .select()
          .single();

        if (createError) {
          console.error('Error creating user profile:', createError);
          setUser({ ...authUser, profile: undefined });
        } else {
          setUser({ 
            ...authUser, 
            profile: {
              ...createdProfile,
              broker_category_discounts: createdProfile.broker_category_discounts || {},
              // Add derived fields from auth.users
              email: authUser.email || '',
              full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || null,
              avatar_url: authUser.user_metadata?.avatar_url || null,
              role: isHardcodedAdmin ? 'admin' as const : 'customer' as const,
              broker_status: null
            }
          });
        }
      } else if (error) {
        console.error('Error fetching user profile:', error);
        setUser({ ...authUser, profile: undefined });
      } else {
        const isHardcodedAdmin = authUser.email === 'iradwatkins@gmail.com';
        setUser({ 
          ...authUser, 
          profile: {
            ...profile,
            broker_category_discounts: profile.broker_category_discounts || {},
            // Add derived fields from auth.users
            email: authUser.email || '',
            full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || null,
            avatar_url: authUser.user_metadata?.avatar_url || null,
            role: isHardcodedAdmin ? 'admin' as const : 'customer' as const,
            broker_status: null
          }
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
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
      console.error('Error signing out:', error);
      toast.error('Error signing out');
    }
  };


  const signInWithMagicLink = async (email: string) => {
    try {
      console.log('Magic link sign-in initiated for:', email);
      console.log('Redirect URL:', `${window.location.origin}/auth/callback`);
      
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      console.log('Magic link response:', { data, error });

      if (error) {
        console.error('Magic link error:', error);
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      console.error('Magic link exception:', error);
      return { error: 'An unexpected error occurred' };
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log('Google sign-in initiated');
      const currentOrigin = window.location.origin;
      console.log('Current origin:', currentOrigin);
      
      // Use different redirect URL for development vs production
      const redirectUrl = currentOrigin.includes('localhost') 
        ? `${currentOrigin}/auth/callback` 
        : `${currentOrigin}/auth/callback`;
      
      console.log('Redirect URL:', redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl
        }
      });

      console.log('Google OAuth response:', { data, error });

      if (error) {
        console.error('Google OAuth error:', error);
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      console.error('Google sign-in exception:', error);
      return { error: 'An unexpected error occurred' };
    }
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
