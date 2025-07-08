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
  },

  // Bulk activate/deactivate vendors
  async bulkUpdateVendors(ids: string[], updates: TablesUpdate<'vendors'>): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('vendors')
        .update(updates)
        .in('id', ids);

      if (error) {
        return { error: error.message };
      }

      return { data: undefined };
    } catch (error) {
      return { error: 'Failed to bulk update vendors' };
    }
  },

  // Get vendor performance metrics
  async getVendorPerformance(vendorId: string): Promise<ApiResponse<any>> {
    try {
      // Get order statistics for the vendor
      const { data: orderStats, error: orderError } = await supabase
        .from('orders')
        .select('id, status, total_amount, created_at')
        .eq('vendor_id', vendorId);

      if (orderError) {
        return { error: orderError.message };
      }

      // Calculate performance metrics
      const totalOrders = orderStats?.length || 0;
      const completedOrders = orderStats?.filter(o => o.status === 'completed').length || 0;
      const totalRevenue = orderStats?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;
      const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

      // Get recent orders for trend analysis
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentOrders = orderStats?.filter(o => 
        new Date(o.created_at) >= thirtyDaysAgo
      ).length || 0;

      return {
        data: {
          totalOrders,
          completedOrders,
          totalRevenue,
          completionRate,
          recentOrders,
          averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
        }
      };
    } catch (error) {
      return { error: 'Failed to get vendor performance' };
    }
  },

  // Get vendors with product assignments
  async getVendorsWithProducts(): Promise<ApiResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select(`
          *,
          products(id, name, is_active, category_id),
          _count:products(count)
        `)
        .eq('is_active', true)
        .order('name');

      if (error) {
        return { error: error.message };
      }

      return { data: data || [] };
    } catch (error) {
      return { error: 'Failed to fetch vendors with products' };
    }
  },

  // Assign products to vendor
  async assignProductsToVendor(vendorId: string, productIds: string[]): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('products')
        .update({ vendor_id: vendorId })
        .in('id', productIds);

      if (error) {
        return { error: error.message };
      }

      return { data: undefined };
    } catch (error) {
      return { error: 'Failed to assign products to vendor' };
    }
  },

  // Remove products from vendor
  async removeProductsFromVendor(productIds: string[]): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('products')
        .update({ vendor_id: null })
        .in('id', productIds);

      if (error) {
        return { error: error.message };
      }

      return { data: undefined };
    } catch (error) {
      return { error: 'Failed to remove products from vendor' };
    }
  },

  // Get vendor email history
  async getVendorEmailHistory(vendorId: string): Promise<ApiResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('vendor_email_log')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('sent_at', { ascending: false });

      if (error) {
        return { error: error.message };
      }

      return { data: data || [] };
    } catch (error) {
      return { error: 'Failed to fetch vendor email history' };
    }
  },

  // Log vendor email
  async logVendorEmail(emailData: {
    vendor_id: string;
    sender_id: string;
    subject: string;
    body: string;
    status: 'sent' | 'failed' | 'pending';
    error_message?: string;
  }): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('vendor_email_log')
        .insert({
          ...emailData,
          sent_at: new Date().toISOString()
        });

      if (error) {
        return { error: error.message };
      }

      return { data: undefined };
    } catch (error) {
      return { error: 'Failed to log vendor email' };
    }
  }
};