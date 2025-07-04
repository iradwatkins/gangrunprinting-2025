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

export interface UserProfile extends Tables<'user_profiles'> {
  billing_address?: Address;
  shipping_addresses: Address[];
  preferences: UserPreferences;
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

export interface BrokerApplicationRequest {
  company_name: string;
  business_type: string;
  tax_id: string;
  annual_volume: string;
  business_address: Omit<Address, 'id' | 'label' | 'is_default'>;
  additional_info?: string;
}

export interface BrokerApplication {
  id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  company_name: string;
  business_type: string;
  tax_id: string;
  annual_volume: string;
  business_address: Address;
  additional_info?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: AuthUser | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isBroker: boolean;
  hasProfile: boolean;
}

export interface AuthContextType extends AuthState {
  signIn: (credentials: LoginRequest) => Promise<void>;
  signUp: (data: RegisterRequest) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
  updatePassword: (data: UpdatePasswordRequest) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  applyForBroker: (data: BrokerApplicationRequest) => Promise<void>;
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