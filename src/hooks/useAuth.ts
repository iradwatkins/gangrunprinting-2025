import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Define types and interfaces
interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
}

interface ProfileData {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  company: string | null;
  role: 'customer' | 'admin' | 'broker';
  broker_status: 'pending' | 'approved' | 'rejected' | null;
  addresses: Address[];
  created_at: string;
  updated_at: string;
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);

        if (event === 'SIGNED_IN') {
          toast.success('Successfully signed in!');
        } else if (event === 'SIGNED_OUT') {
          toast.success('Successfully signed out!');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        return { error: error.message };
      }

      toast.success('Check your email to confirm your account!');
      return { error: null };
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error signing out');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return { error: error.message };
      }

      toast.success('Password reset email sent!');
      return { error: null };
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  };

  const value: AuthContextType = {
    user,
    session,
    isAuthenticated: !!user,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
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

// Profile hook
export function useProfile() {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchProfile();
      fetchAddresses();
    } else {
      setProfile(null);
      setAddresses([]);
      setIsLoading(false);
    }
  }, [user, isAuthenticated]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Error loading profile');
    }
  };

  const fetchAddresses = async () => {
    try {
      const { data, error } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', user?.id)
        .order('is_default', { ascending: false });

      if (error) throw error;

      setAddresses(data || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<ProfileData>) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({ id: user?.id, ...updates })
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      toast.success('Profile updated successfully!');
      return { error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error updating profile');
      return { error: 'Failed to update profile' };
    }
  };

  const addAddress = async (address: Omit<Address, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('user_addresses')
        .insert({ ...address, user_id: user?.id })
        .select()
        .single();

      if (error) throw error;

      setAddresses(prev => [...prev, data]);
      toast.success('Address added successfully!');
      return { error: null };
    } catch (error) {
      console.error('Error adding address:', error);
      toast.error('Error adding address');
      return { error: 'Failed to add address' };
    }
  };

  const updateAddress = async (id: string, updates: Partial<Address>) => {
    try {
      const { data, error } = await supabase
        .from('user_addresses')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;

      setAddresses(prev => prev.map(addr => addr.id === id ? data : addr));
      toast.success('Address updated successfully!');
      return { error: null };
    } catch (error) {
      console.error('Error updating address:', error);
      toast.error('Error updating address');
      return { error: 'Failed to update address' };
    }
  };

  const deleteAddress = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_addresses')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      setAddresses(prev => prev.filter(addr => addr.id !== id));
      toast.success('Address deleted successfully!');
      return { error: null };
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Error deleting address');
      return { error: 'Failed to delete address' };
    }
  };

  return {
    profile,
    addresses,
    isLoading,
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress,
  };
}
