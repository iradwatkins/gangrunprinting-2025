import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

export type UserRole = 'customer' | 'admin' | 'super_admin';

export interface AuthUser extends User {
  profile?: {
    role: UserRole;
    email: string;
    first_name?: string;
    last_name?: string;
    company_name?: string;
    phone?: string;
  };
}

export class AuthError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'AuthError';
  }
}

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

export const auth = {
  // Get current user
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        // Don't throw for auth errors - just return null
        return null;
      }

      if (!user) {
        return null;
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role, email, first_name, last_name, company_name, phone')
        .eq('user_id', user.id)
        .single();

      // Check if super admin
      const isSuperAdmin = await this.isSuperAdmin(user.email);
      
      return {
        ...user,
        profile: profile ? {
          ...profile,
          role: isSuperAdmin ? 'super_admin' : (profile.role as UserRole)
        } : { 
          role: 'customer' as UserRole,
          email: user.email || ''
        }
      };
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  },

  // Check if user is super admin
  async isSuperAdmin(email?: string | null): Promise<boolean> {
    if (!email) return false;
    
    try {
      const { data, error } = await supabase
        .rpc('is_super_admin', { user_email: email });
      
      return !error && data === true;
    } catch {
      return false;
    }
  },

  // Check if user is admin (includes super admin)
  async isAdmin(user?: AuthUser): Promise<boolean> {
    try {
      const currentUser = user || await this.getCurrentUser();
      
      if (!currentUser) {
        return false;
      }

      return currentUser.profile?.role === 'admin' || 
             currentUser.profile?.role === 'super_admin';
    } catch (error) {
      console.error('Failed to check admin status:', error);
      return false;
    }
  },

  // Require admin access
  async requireAdmin(): Promise<AuthUser> {
    const user = await this.getCurrentUser();
    
    if (!user) {
      throw new AuthError('Authentication required', 'UNAUTHENTICATED');
    }

    const isAdmin = await this.isAdmin(user);
    
    if (!isAdmin) {
      throw new AuthError('Admin access required', 'UNAUTHORIZED');
    }

    return user;
  },

  // Require super admin access
  async requireSuperAdmin(): Promise<AuthUser> {
    const user = await this.getCurrentUser();
    
    if (!user) {
      throw new AuthError('Authentication required', 'UNAUTHENTICATED');
    }

    if (user.profile?.role !== 'super_admin') {
      throw new AuthError('Super admin access required', 'UNAUTHORIZED');
    }

    return user;
  },

  // Get user role
  async getUserRole(user?: AuthUser): Promise<UserRole> {
    try {
      const currentUser = user || await this.getCurrentUser();
      
      if (!currentUser) {
        return 'customer';
      }

      return currentUser.profile?.role || 'customer';
    } catch (error) {
      console.error('Failed to get user role:', error);
      return 'customer';
    }
  },

  // Toggle admin status (super admin only)
  async toggleAdminStatus(targetUserId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('toggle_admin_status', { target_user_id: targetUserId });
      
      if (error) throw error;
      
      return data as boolean;
    } catch (error) {
      console.error('Failed to toggle admin status:', error);
      throw new AuthError('Failed to toggle admin status', 'OPERATION_FAILED');
    }
  },

  // Magic Link Sign In
  async signInWithMagicLink(email: string) {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: getRedirectUrl()
      }
    });
    return { error };
  },

  // Google Sign In
  async signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: getRedirectUrl()
      }
    });
    return { error };
  },

  // Email/Password Sign Up
  async signUp(email: string, password: string, metadata?: Record<string, any>) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getRedirectUrl(),
        data: metadata
      }
    });
    return { data, error };
  },

  // Email/Password Sign In
  async signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { error };
  },

  // Sign Out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Reset Password
  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getRedirectUrl()}reset-password`
    });
    return { error };
  },

  // Update Password
  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    return { error };
  }
};