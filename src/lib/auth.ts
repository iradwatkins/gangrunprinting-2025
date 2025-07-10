
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'customer' | 'broker';

export interface AuthUser extends User {
  profile?: {
    role: UserRole;
    is_broker: boolean; // Deprecated - use role instead
    broker_category_discounts: Record<string, any>;
  };
}

export class AuthError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'AuthError';
  }
}

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

      // Get user profile with new role system
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role, broker_category_discounts')
        .eq('user_id', user.id)
        .single();

      return {
        ...user,
        profile: profile ? {
          role: profile.role as UserRole,
          is_broker: profile.role === 'broker', // Backward compatibility
          broker_category_discounts: (profile.broker_category_discounts as Record<string, any>) || {}
        } : { 
          role: 'customer' as UserRole, 
          is_broker: false, 
          broker_category_discounts: {} 
        }
      };
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  },

  // Check if user is admin
  async isAdmin(user?: AuthUser): Promise<boolean> {
    try {
      const currentUser = user || await this.getCurrentUser();
      
      if (!currentUser) {
        return false;
      }

      // Use new role system - only iradwatkins@gmail.com or role === 'admin'
      return currentUser.email === 'iradwatkins@gmail.com' || 
             currentUser.profile?.role === 'admin';
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

  // Check if user is broker
  async isBroker(user?: AuthUser): Promise<boolean> {
    try {
      const currentUser = user || await this.getCurrentUser();
      
      if (!currentUser) {
        return false;
      }

      // Use new role system
      return currentUser.profile?.role === 'broker';
    } catch (error) {
      console.error('Failed to check broker status:', error);
      return false;
    }
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

  // Magic Link Sign In
  async signInWithMagicLink(email: string) {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/`
      }
    });
    return { error };
  },

  // Google Sign In
  async signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`
      }
    });
    return { error };
  },

  // Email/Password Sign Up
  async signUp(email: string, password: string) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`
      }
    });
    return { error };
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
  }
};
