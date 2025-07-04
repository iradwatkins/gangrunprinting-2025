
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

export interface AuthUser extends User {
  profile?: {
    is_broker: boolean;
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
        throw new AuthError(error.message);
      }

      if (!user) {
        return null;
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('is_broker, broker_category_discounts')
        .eq('user_id', user.id)
        .single();

      return {
        ...user,
        profile: profile ? {
          is_broker: profile.is_broker,
          broker_category_discounts: (profile.broker_category_discounts as Record<string, any>) || {}
        } : { is_broker: false, broker_category_discounts: {} }
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

      // Check if user has admin privileges
      const isEmailAdmin = currentUser.email?.endsWith('@gangrunprinting.com');
      const hasAdminDiscount = currentUser.profile?.broker_category_discounts?.admin;

      return isEmailAdmin || !!hasAdminDiscount;
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

      return currentUser.profile?.is_broker || false;
    } catch (error) {
      console.error('Failed to check broker status:', error);
      return false;
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
