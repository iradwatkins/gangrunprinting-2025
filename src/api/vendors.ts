import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface VendorFilters {
  is_active?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

// Vendors API
export const vendorsApi = {
  // Get all vendors with filtering and pagination
  async getVendors(filters: VendorFilters = {}): Promise<ApiResponse<Tables<'vendors'>[]>> {
    try {
      let query = supabase
        .from('vendors')
        .select(`
          *,
          _count:products(count)
        `);

      // Apply filters
      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      // Apply pagination
      const page = filters.page || 1;
      const limit = filters.limit || 50;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      query = query.range(from, to).order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) {
        return { error: error.message };
      }

      return {
        data: data || [],
        meta: {
          total: count || 0,
          page,
          limit
        }
      };
    } catch (error) {
      return { error: 'Failed to fetch vendors' };
    }
  },

  // Get single vendor by ID
  async getVendor(id: string): Promise<ApiResponse<Tables<'vendors'>>> {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select(`
          *,
          products(id, name, is_active),
          _count:products(count)
        `)
        .eq('id', id)
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      return { error: 'Failed to fetch vendor' };
    }
  },

  // Create new vendor
  async createVendor(vendor: TablesInsert<'vendors'>): Promise<ApiResponse<Tables<'vendors'>>> {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .insert(vendor)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      return { error: 'Failed to create vendor' };
    }
  },

  // Update vendor
  async updateVendor(id: string, updates: TablesUpdate<'vendors'>): Promise<ApiResponse<Tables<'vendors'>>> {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      return { error: 'Failed to update vendor' };
    }
  },

  // Delete vendor
  async deleteVendor(id: string): Promise<ApiResponse<void>> {
    try {
      // Check if vendor has products
      const { data: products } = await supabase
        .from('products')
        .select('id')
        .eq('vendor_id', id);

      if (products && products.length > 0) {
        return { error: 'Cannot delete vendor with products' };
      }

      const { error } = await supabase
        .from('vendors')
        .delete()
        .eq('id', id);

      if (error) {
        return { error: error.message };
      }

      return { data: undefined };
    } catch (error) {
      return { error: 'Failed to delete vendor' };
    }
  }
};