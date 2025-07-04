import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { authApi } from '@/api/auth';
import { profileApi } from '@/api/profile';
import { useToast } from '@/hooks/use-toast';
import { cartApi } from '@/api/cart';
import type { 
  AuthUser, 
  UserProfile, 
  RegisterRequest, 
  LoginRequest, 
  UpdatePasswordRequest,
  UpdateProfileRequest,
  BrokerApplicationRequest,
  AuthContextType,
  AuthState
} from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AUTH_QUERY_KEY = ['auth'];
export const PROFILE_QUERY_KEY = ['profile'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    isLoading: true,
    isAuthenticated: false,
    isBroker: false,
    hasProfile: false
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get current user and profile
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: () => authApi.getCurrentUser().then(response => {
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Update auth state when user changes
  useEffect(() => {
    setAuthState(prev => ({
      ...prev,
      user: user || null,
      profile: user?.profile || null,
      isLoading: userLoading,
      isAuthenticated: !!user,
      isBroker: user?.profile?.is_broker || false,
      hasProfile: !!user?.profile
    }));
  }, [user, userLoading]);

  // Listen to auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
        } else if (event === 'SIGNED_OUT') {
          queryClient.clear();
          setAuthState({
            user: null,
            profile: null,
            isLoading: false,
            isAuthenticated: false,
            isBroker: false,
            hasProfile: false
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [queryClient]);

  // Sign up mutation
  const signUpMutation = useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
        toast({
          title: 'Registration Successful',
          description: 'Please check your email to verify your account.'
        });
      } else {
        toast({
          title: 'Registration Failed',
          description: response.error,
          variant: 'destructive'
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Registration Failed',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
    }
  });

  // Sign in mutation
  const signInMutation = useMutation({
    mutationFn: (credentials: LoginRequest) => authApi.signIn(credentials),
    onSuccess: async (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
        
        // Sync guest cart with user cart
        if (response.data?.id) {
          const guestSessionId = localStorage.getItem('cart_session_id') || '';
          await cartApi.syncCart({
            guest_session_id: guestSessionId,
            user_id: response.data.id
          });
          // Invalidate cart queries to refetch with user data
          queryClient.invalidateQueries({ queryKey: ['cart'] });
        }
        
        toast({
          title: 'Welcome back!',
          description: 'You have been signed in successfully.'
        });
      } else {
        toast({
          title: 'Login Failed',
          description: response.error,
          variant: 'destructive'
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Login Failed',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
    }
  });

  // Sign out mutation
  const signOutMutation = useMutation({
    mutationFn: () => authApi.signOut(),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.clear();
        toast({
          title: 'Signed Out',
          description: 'You have been signed out successfully.'
        });
      } else {
        toast({
          title: 'Sign Out Failed',
          description: response.error,
          variant: 'destructive'
        });
      }
    }
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileRequest) => profileApi.updateProfile(data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
        toast({
          title: 'Profile Updated',
          description: 'Your profile has been updated successfully.'
        });
      } else {
        toast({
          title: 'Update Failed',
          description: response.error,
          variant: 'destructive'
        });
      }
    }
  });

  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: (data: UpdatePasswordRequest) => authApi.updatePassword(data),
    onSuccess: (response) => {
      if (response.success) {
        toast({
          title: 'Password Updated',
          description: 'Your password has been updated successfully.'
        });
      } else {
        toast({
          title: 'Password Update Failed',
          description: response.error,
          variant: 'destructive'
        });
      }
    }
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: (email: string) => authApi.resetPassword({ email }),
    onSuccess: (response) => {
      if (response.success) {
        toast({
          title: 'Reset Email Sent',
          description: 'Please check your email for password reset instructions.'
        });
      } else {
        toast({
          title: 'Reset Failed',
          description: response.error,
          variant: 'destructive'
        });
      }
    }
  });

  // Apply for broker mutation
  const applyForBrokerMutation = useMutation({
    mutationFn: (data: BrokerApplicationRequest) => profileApi.applyForBroker(data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
        toast({
          title: 'Broker Application Submitted',
          description: 'Your broker application has been submitted for review.'
        });
      } else {
        toast({
          title: 'Application Failed',
          description: response.error,
          variant: 'destructive'
        });
      }
    }
  });

  const contextValue: AuthContextType = {
    ...authState,
    signIn: signInMutation.mutate,
    signUp: signUpMutation.mutate,
    signOut: signOutMutation.mutate,
    updateProfile: updateProfileMutation.mutate,
    updatePassword: updatePasswordMutation.mutate,
    resetPassword: resetPasswordMutation.mutate,
    refreshProfile: () => queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY }),
    applyForBroker: applyForBrokerMutation.mutate
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Profile-specific hooks
export function useProfile() {
  const { profile, refreshProfile } = useAuth();
  
  const { data: addresses, refetch: refetchAddresses } = useQuery({
    queryKey: [...PROFILE_QUERY_KEY, 'addresses'],
    queryFn: () => profileApi.getAddresses().then(response => {
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    }),
    enabled: !!profile
  });

  const { data: brokerApplication, refetch: refetchBrokerApplication } = useQuery({
    queryKey: [...PROFILE_QUERY_KEY, 'broker-application'],
    queryFn: () => profileApi.getBrokerApplication().then(response => {
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    }),
    enabled: !!profile
  });

  return {
    profile,
    addresses: addresses || [],
    brokerApplication,
    refreshProfile,
    refetchAddresses,
    refetchBrokerApplication
  };
}