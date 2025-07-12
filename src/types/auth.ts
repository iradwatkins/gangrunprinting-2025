import type { User } from '@supabase/supabase-js';
import type { Tables } from '@/integrations/supabase/types';

export interface Address {
  id: string;
  label: string; // "Home", "Office", etc.
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

export interface UserPreferences {
  language: 'en' | 'es';
  currency: 'USD';
  email_notifications: {
    order_updates: boolean;
    marketing: boolean;
    promotions: boolean;
  };
  display_preferences: {
    theme: 'light' | 'dark' | 'auto';
    pricing_display: 'per_unit' | 'total';
  };
}

export type UserRole = 'customer' | 'admin' | 'super_admin';

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: UserRole;
  company_name?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
  billing_address?: Address;
  shipping_addresses?: Address[];
  preferences?: UserPreferences;
}

export interface AuthUser extends User {
  profile?: UserProfile;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  phone?: string;
  acceptTerms: boolean;
  marketingOptIn?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface MagicLinkRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  company_name?: string;
  phone?: string;
  preferences?: Partial<UserPreferences>;
}

export interface AuthState {
  user: AuthUser | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  hasProfile: boolean;
}

export interface AuthContextType extends AuthState {
  signIn: (credentials: LoginRequest) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<void>;
  signUp: (data: RegisterRequest) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
  updatePassword: (data: UpdatePasswordRequest) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  toggleAdminStatus: (userId: string) => Promise<boolean>;
}

export type AuthActionType = 
  | 'SET_USER'
  | 'SET_PROFILE'
  | 'SET_LOADING'
  | 'CLEAR_AUTH'
  | 'UPDATE_PROFILE';

export interface AuthAction {
  type: AuthActionType;
  payload?: any;
}