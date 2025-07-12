import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { auth as authLib } from '@/lib/auth';
import type { UserProfile, UserRole } from '@/types/auth';

export interface AuthUser extends User {
  profile?: UserProfile;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  loading: boolean;
  error?: string | null;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ success: boolean; error?: string }>;
  signInWithMagicLink: (email: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  updateProfile: (data: any) => Promise<{ success: boolean; error?: string }>;
  toggleAdminStatus: (userId: string) => Promise<boolean>;
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

  // Load user profile - simplified without timeout complexity
  const loadUserProfile = async (authUser: User) => {
    try {
      // Fast path for super admin to avoid RPC calls
      const isSuperAdmin = authUser.email === 'iradwatkins@gmail.com';
      
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        // Create fallback user
        const role = isSuperAdmin ? 'super_admin' : 'customer';
        const basicUser: AuthUser = {
          ...authUser,
          profile: {
            role: role,
            email: authUser.email || '',
            first_name: authUser.user_metadata?.first_name || '',
            last_name: authUser.user_metadata?.last_name || ''
          }
        };
        setUser(basicUser);
        return null;
      }
        
      if (profile) {
        const userWithProfile: AuthUser = {
          ...authUser,
          profile: {
            ...profile,
            role: isSuperAdmin ? 'super_admin' : (profile.role || 'customer')
          }
        };
        setUser(userWithProfile);
        return profile;
      }

      // Create profile if it doesn't exist
      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: authUser.id,
          email: authUser.email,
          first_name: authUser.user_metadata?.first_name || '',
          last_name: authUser.user_metadata?.last_name || '',
          role: 'customer'
        })
        .select()
        .single();

      if (!createError && newProfile) {
        const userWithProfile: AuthUser = {
          ...authUser,
          profile: {
            ...newProfile,
            role: isSuperAdmin ? 'super_admin' : 'customer'
          }
        };
        setUser(userWithProfile);
        return newProfile;
      }

      // Final fallback
      const role = isSuperAdmin ? 'super_admin' : 'customer';
      const fallbackUser: AuthUser = {
        ...authUser,
        profile: {
          role: role,
          email: authUser.email || '',
          first_name: authUser.user_metadata?.first_name || '',
          last_name: authUser.user_metadata?.last_name || ''
        }
      };
      setUser(fallbackUser);
      return null;
    } catch (err) {
      console.error('Profile loading error:', err);
      
      // Always create a fallback user to prevent infinite loading
      const role = authUser.email === 'iradwatkins@gmail.com' ? 'super_admin' : 'customer';
      const fallbackUser: AuthUser = {
        ...authUser,
        profile: {
          role: role,
          email: authUser.email || '',
          first_name: authUser.user_metadata?.first_name || '',
          last_name: authUser.user_metadata?.last_name || ''
        }
      };
      setUser(fallbackUser);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user)
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }).catch((err) => {
      console.error('Session check failed:', err);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        
        if (session?.user) {
          await loadUserProfile(session.user);
          
          // Clean URL fragments after OAuth
          if (_event === 'SIGNED_IN') {
            cleanOAuthFragments();
            toast.success('Successfully signed in!');
            
            // Get user role for redirect
            const userRole = session.user.email === 'iradwatkins@gmail.com' ? 'super_admin' : 'customer';
            if (userRole === 'super_admin' || userRole === 'admin') {
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

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await authLib.signOut();
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
      const { error } = await authLib.signIn(email, password);

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

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      setError(null);
      const { data, error } = await authLib.signUp(email, password, metadata);

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
      const { error } = await authLib.signInWithMagicLink(email);

      if (error) {
        return { error: error.message };
      }

      toast.success('Magic link sent! Check your email.');
      return { error: null };
    } catch (error: any) {
      return { error: error.message || 'Failed to send magic link' };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await authLib.signInWithGoogle();

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error: any) {
      return { error: error.message || 'Failed to sign in with Google' };
    }
  };

  const updateProfile = async (data: any) => {
    try {
      if (!user) {
        return { success: false, error: 'No user logged in' };
      }

      const { error } = await supabase
        .from('user_profiles')
        .update(data)
        .eq('user_id', user.id);

      if (error) {
        toast.error(error.message);
        return { success: false, error: error.message };
      }

      // Reload profile
      await loadUserProfile(user);
      toast.success('Profile updated successfully');
      return { success: true };
    } catch (error: any) {
      const message = error.message || 'Failed to update profile';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const toggleAdminStatus = async (userId: string) => {
    try {
      const isAdmin = await authLib.toggleAdminStatus(userId);
      toast.success(isAdmin ? 'User granted admin access' : 'Admin access revoked');
      return isAdmin;
    } catch (error: any) {
      toast.error(error.message || 'Failed to toggle admin status');
      throw error;
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    session,
    isAuthenticated: !!user,
    isAdmin: user?.profile?.role === 'admin' || user?.profile?.role === 'super_admin',
    isSuperAdmin: user?.profile?.role === 'super_admin',
    loading,
    error,
    signOut,
    signIn,
    signUp,
    signInWithMagicLink,
    signInWithGoogle,
    updateProfile,
    toggleAdminStatus,
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