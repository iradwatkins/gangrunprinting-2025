import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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

interface BrokerApplication {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  business_name: string;
  tax_id: string;
  business_address: string;
  estimated_monthly_volume: number;
  created_at: string;
  reviewed_at?: string;
  review_notes?: string;
}

export function useProfile() {
  const { user, isAuthenticated } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [brokerApplication, setBrokerApplication] = useState<BrokerApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchAddresses();
      fetchBrokerApplication();
    } else {
      setAddresses([]);
      setBrokerApplication(null);
      setIsLoading(false);
    }
  }, [user, isAuthenticated]);

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

  const fetchBrokerApplication = async () => {
    try {
      const { data, error } = await supabase
        .from('broker_requests')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setBrokerApplication(data);
    } catch (error) {
      console.error('Error fetching broker application:', error);
    }
  };

  const updateProfile = async (updates: any) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({ user_id: user?.id, ...updates })
        .select()
        .single();

      if (error) throw error;

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

  const submitBrokerApplication = async (applicationData: Omit<BrokerApplication, 'id' | 'status' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('broker_requests')
        .insert({
          ...applicationData,
          user_id: user?.id,
          status: 'pending',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setBrokerApplication(data);
      toast.success('Broker application submitted successfully!');
      return { error: null };
    } catch (error) {
      console.error('Error submitting broker application:', error);
      toast.error('Error submitting broker application');
      return { error: 'Failed to submit application' };
    }
  };

  return {
    addresses,
    brokerApplication,
    isLoading,
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    submitBrokerApplication,
  };
}