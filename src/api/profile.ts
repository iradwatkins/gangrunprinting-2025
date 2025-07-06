import { supabase } from '@/integrations/supabase/client';
import { auth } from '@/lib/auth';
import { ApiResponse, handleApiError } from '@/lib/errors';
import type { 
  UserProfile, 
  Address, 
  UpdateProfileRequest,
  BrokerApplicationRequest,
  BrokerApplication 
} from '@/types/auth';

class ProfileApi {
  async getProfile(): Promise<ApiResponse<UserProfile | null>> {
    try {
      const user = await auth.getCurrentUser();
      if (!user) {
        return { success: true, data: null };
      }

      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error is OK
        return handleApiError(error, 'Failed to load profile');
      }

      return { success: true, data: profile as UserProfile };
    } catch (error) {
      return handleApiError(error, 'Failed to load profile');
    }
  }

  async createProfile(data: { company_name?: string; phone?: string }): Promise<ApiResponse<UserProfile>> {
    try {
      const user = await auth.getCurrentUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data: profile, error } = await supabase
        .from('user_profiles')
        .insert({
          user_id: user.id,
          company_name: data.company_name,
          phone: data.phone,
          is_broker: false,
          broker_category_discounts: {}
        })
        .select()
        .single();

      if (error) {
        return handleApiError(error, 'Failed to create profile');
      }

      return { success: true, data: profile as UserProfile };
    } catch (error) {
      return handleApiError(error, 'Failed to create profile');
    }
  }

  async updateProfile(updates: UpdateProfileRequest): Promise<ApiResponse<UserProfile>> {
    try {
      const user = await auth.getCurrentUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data: profile, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        return handleApiError(error, 'Failed to update profile');
      }

      return { success: true, data: profile as UserProfile };
    } catch (error) {
      return handleApiError(error, 'Failed to update profile');
    }
  }

  async uploadProfilePicture(file: File): Promise<ApiResponse<string>> {
    try {
      const user = await auth.getCurrentUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Create unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `profile-pictures/${fileName}`;

      // Upload file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('user-content')
        .upload(filePath, file);

      if (uploadError) {
        return handleApiError(uploadError, 'Failed to upload profile picture');
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('user-content')
        .getPublicUrl(filePath);

      return { success: true, data: publicUrl };
    } catch (error) {
      return handleApiError(error, 'Failed to upload profile picture');
    }
  }

  async getAddresses(): Promise<ApiResponse<Address[]>> {
    try {
      const user = await auth.getCurrentUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // For now, return empty array since addresses are handled separately
      return { success: true, data: [] };
    } catch (error) {
      return handleApiError(error, 'Failed to load addresses');
    }
  }

  async addAddress(address: Omit<Address, 'id'>): Promise<ApiResponse<Address>> {
    try {
      const user = await auth.getCurrentUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // For now, simulate adding address
      const newAddress: Address = {
        ...address,
        id: crypto.randomUUID(),
      };

      return { success: true, data: newAddress };
    } catch (error) {
      return handleApiError(error, 'Failed to add address');
    }
  }

  async updateAddress(addressId: string, updates: Partial<Address>): Promise<ApiResponse<Address>> {
    try {
      const user = await auth.getCurrentUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const addressesResponse = await this.getAddresses();
      if (!addressesResponse.success) {
        return { success: false, error: 'Failed to load addresses' };
      }

      const addresses = addressesResponse.data;
      const addressIndex = addresses.findIndex(addr => addr.id === addressId);
      
      if (addressIndex === -1) {
        return { success: false, error: 'Address not found' };
      }

      const updatedAddress = { ...addresses[addressIndex], ...updates };
      
      // If marking as default, remove default from others
      if (updates.is_default) {
        addresses.forEach(addr => addr.is_default = false);
      }

      addresses[addressIndex] = updatedAddress;

      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          shipping_addresses: addresses,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        return handleApiError(error, 'Failed to update address');
      }

      return { success: true, data: updatedAddress };
    } catch (error) {
      return handleApiError(error, 'Failed to update address');
    }
  }

  async deleteAddress(addressId: string): Promise<ApiResponse<void>> {
    try {
      const user = await auth.getCurrentUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const addressesResponse = await this.getAddresses();
      if (!addressesResponse.success) {
        return { success: true };
      }

      const addresses = addressesResponse.data;
      const updatedAddresses = addresses.filter(addr => addr.id !== addressId);

      // If we removed the default address, make the first remaining address default
      if (updatedAddresses.length > 0 && !updatedAddresses.some(addr => addr.is_default)) {
        updatedAddresses[0].is_default = true;
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          shipping_addresses: updatedAddresses,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        return handleApiError(error, 'Failed to delete address');
      }

      return { success: true };
    } catch (error) {
      return handleApiError(error, 'Failed to delete address');
    }
  }

  async applyForBroker(application: BrokerApplicationRequest): Promise<ApiResponse<BrokerApplication>> {
    try {
      const user = await auth.getCurrentUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Create broker application record
      const brokerApplication: Omit<BrokerApplication, 'id' | 'created_at' | 'updated_at'> = {
        user_id: user.id,
        status: 'pending',
        company_name: application.company_name,
        business_type: application.business_type,
        tax_id: application.tax_id,
        annual_volume: application.annual_volume,
        business_address: {
          ...application.business_address,
          id: crypto.randomUUID(),
          label: 'Business',
          is_default: false
        },
        additional_info: application.additional_info
      };

      // In a real implementation, this would be stored in a broker_applications table
      // For now, we'll simulate the process and store in user preferences
      
      const profileResponse = await this.getProfile();
      if (!profileResponse.success || !profileResponse.data) {
        return { success: false, error: 'Profile not found' };
      }

      const now = new Date().toISOString();
      const fullApplication: BrokerApplication = {
        ...brokerApplication,
        id: crypto.randomUUID(),
        created_at: now,
        updated_at: now
      };

      
      // Store application in user preferences for now
      const updatedPreferences = {
        ...profileResponse.data.preferences,
        broker_application: fullApplication
      };

      const updateResponse = await this.updateProfile({
        preferences: updatedPreferences
      });

      if (!updateResponse.success) {
        return updateResponse;
      }

      return { success: true, data: fullApplication };
    } catch (error) {
      return handleApiError(error, 'Failed to submit broker application');
    }
  }

  async getBrokerApplication(): Promise<ApiResponse<BrokerApplication | null>> {
    try {
      const profileResponse = await this.getProfile();
      if (!profileResponse.success || !profileResponse.data) {
        return { success: true, data: null };
      }

      const application = (profileResponse.data.preferences as any)?.broker_application;
      return { success: true, data: application || null };
    } catch (error) {
      return handleApiError(error, 'Failed to load broker application');
    }
  }
}

export const profileApi = new ProfileApi();