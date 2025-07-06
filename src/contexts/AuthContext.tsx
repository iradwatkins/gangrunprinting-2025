
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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session?.user) {
          await loadUserProfile(session.user);
          
          if (event === 'SIGNED_IN') {
            toast.success('Successfully signed in!');
            // Redirect based on user role after successful login
            const profile = await getUserProfile(session.user);
            if (profile?.role === 'admin') {
              navigate('/admin');
            } else {
              navigate('/');
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
        // Create profile if it doesn't exist
        const isHardcodedAdmin = authUser.email === 'iradwatkins@gmail.com';
        const newProfile = {
          user_id: authUser.id,
          email: authUser.email || '',
          full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || null,
          role: isHardcodedAdmin ? 'admin' as const : 'customer' as const,
        };

        const { data: createdProfile } = await supabase
          .from('user_profiles')
          .insert(newProfile)
          .select()
          .single();

        return createdProfile;
      }

      return profile;
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
          email: authUser.email || '',
          full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || null,
          role: isHardcodedAdmin ? 'admin' as const : 'customer' as const,
          is_broker: false,
          broker_category_discounts: {}
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
              broker_category_discounts: createdProfile.broker_category_discounts || {}
            }
          });
        }
      } else if (error) {
        console.error('Error fetching user profile:', error);
        setUser({ ...authUser, profile: undefined });
      } else {
        setUser({ 
          ...authUser, 
          profile: {
            ...profile,
            broker_category_discounts: profile.broker_category_discounts || {}
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
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/`
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
          redirectTo: `${window.location.origin}/`
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
