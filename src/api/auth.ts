import { supabase } from '@/integrations/supabase/client';
import { ApiResponse, handleApiError } from '@/lib/errors';
import { profileApi } from '@/api/profile';
import type { 
  RegisterRequest, 
  LoginRequest, 
  ResetPasswordRequest, 
  UpdatePasswordRequest,
  AuthUser,
  UserProfile 
} from '@/types/auth';

class AuthApi {
  async register(data: RegisterRequest): Promise<ApiResponse<AuthUser>> {
    try {
      // Validate passwords match
      if (data.password !== data.confirmPassword) {
        return { success: false, error: 'Passwords do not match' };
      }

      // Register user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            company_name: data.companyName,
            phone: data.phone,
            marketing_opt_in: data.marketingOptIn
          }
        }
      });

      if (authError) {
        return handleApiError(authError, 'Registration failed');
      }

      if (!authData.user) {
        return { success: false, error: 'Failed to create user' };
      }

      // Create user profile
      const profileResponse = await profileApi.createProfile({
        first_name: data.firstName,
        last_name: data.lastName,
        company_name: data.companyName,
        phone: data.phone
      });

      if (!profileResponse.success) {
        // Log error but don't fail registration
        console.error('Failed to create user profile:', profileResponse.error);
      }

      const user: AuthUser = {
        ...authData.user,
        profile: profileResponse.data || undefined
      };

      return { success: true, data: user };
    } catch (error) {
      return handleApiError(error, 'Registration failed');
    }
  }

  async signIn(credentials: LoginRequest): Promise<ApiResponse<AuthUser>> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      if (authError) {
        return handleApiError(authError, 'Login failed');
      }

      if (!authData.user) {
        return { success: false, error: 'Login failed' };
      }

      // Load user profile
      const profileResponse = await profileApi.getProfile();
      
      const user: AuthUser = {
        ...authData.user,
        profile: profileResponse.data || undefined
      };

      return { success: true, data: user };
    } catch (error) {
      return handleApiError(error, 'Login failed');
    }
  }

  async signOut(): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return handleApiError(error, 'Logout failed');
      }

      // Clear any local storage
      localStorage.removeItem('cart_items');
      localStorage.removeItem('cart_created_at');

      return { success: true };
    } catch (error) {
      return handleApiError(error, 'Logout failed');
    }
  }

  async resetPassword(request: ResetPasswordRequest): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(request.email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        return handleApiError(error, 'Password reset failed');
      }

      return { success: true };
    } catch (error) {
      return handleApiError(error, 'Password reset failed');
    }
  }

  async updatePassword(request: UpdatePasswordRequest): Promise<ApiResponse<void>> {
    try {
      // Validate passwords match
      if (request.newPassword !== request.confirmPassword) {
        return { success: false, error: 'New passwords do not match' };
      }

      // Supabase doesn't directly support current password verification
      // In a production app, you might want to implement this server-side
      const { error } = await supabase.auth.updateUser({
        password: request.newPassword
      });

      if (error) {
        return handleApiError(error, 'Password update failed');
      }

      return { success: true };
    } catch (error) {
      return handleApiError(error, 'Password update failed');
    }
  }

  async getCurrentUser(): Promise<ApiResponse<AuthUser | null>> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        return handleApiError(error, 'Failed to get current user');
      }

      if (!user) {
        return { success: true, data: null };
      }

      // Load user profile
      const profileResponse = await profileApi.getProfile();
      
      const authUser: AuthUser = {
        ...user,
        profile: profileResponse.data || undefined
      };

      return { success: true, data: authUser };
    } catch (error) {
      return handleApiError(error, 'Failed to get current user');
    }
  }

  async refreshSession(): Promise<ApiResponse<AuthUser | null>> {
    try {
      const { data: { user }, error } = await supabase.auth.refreshSession();

      if (error) {
        return handleApiError(error, 'Failed to refresh session');
      }

      if (!user) {
        return { success: true, data: null };
      }

      // Load user profile
      const profileResponse = await profileApi.getProfile();
      
      const authUser: AuthUser = {
        ...user,
        profile: profileResponse.data || undefined
      };

      return { success: true, data: authUser };
    } catch (error) {
      return handleApiError(error, 'Failed to refresh session');
    }
  }

  async verifyEmail(token: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email'
      });

      if (error) {
        return handleApiError(error, 'Email verification failed');
      }

      return { success: true };
    } catch (error) {
      return handleApiError(error, 'Email verification failed');
    }
  }

  async resendEmailVerification(): Promise<ApiResponse<void>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.email) {
        return { success: false, error: 'No user email found' };
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email
      });

      if (error) {
        return handleApiError(error, 'Failed to resend verification email');
      }

      return { success: true };
    } catch (error) {
      return handleApiError(error, 'Failed to resend verification email');
    }
  }
}

export const authApi = new AuthApi();