import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { handleError, validateRequired, validateUUID, createSuccessResponse } from '@/lib/errors';
import { auth } from '@/lib/auth';

// Types for API responses
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface ProductFilters {
  category_id?: string;
  vendor_id?: string | null;
  is_active?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

// Products API
export const productsApi = {
  // Get all products with filtering and pagination
  async getProducts(filters: ProductFilters = {}): Promise<ApiResponse<Tables<'products'>[]>> {
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          product_categories(id, name, slug),
          vendors(id, name)
        `);

      // Apply filters
      if (filters.category_id) {
        query = query.eq('category_id', filters.category_id);
      }
      if (filters.vendor_id !== undefined) {
        if (filters.vendor_id === null) {
          query = query.is('vendor_id', null);
        } else {
          query = query.eq('vendor_id', filters.vendor_id);
        }
      }
      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
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
      return { error: 'Failed to fetch products' };
    }
  },

  // Get single product by ID
  async getProduct(id: string): Promise<ApiResponse<Tables<'products'>>> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_categories(id, name, slug),
          vendors(id, name, email),
          product_paper_stocks(
            paper_stocks(id, name, weight, price_per_sq_inch),
            is_default,
            price_override
          ),
          product_print_sizes(
            print_sizes(id, name, width, height),
            is_default,
            price_modifier
          ),
          product_turnaround_times(
            turnaround_times(id, name, business_days, price_markup_percent),
            is_default,
            price_override
          ),
          product_add_ons(
            add_ons(id, name, pricing_model, configuration),
            is_mandatory,
            price_override
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      return { error: 'Failed to fetch product' };
    }
  },

  // Get single product by slug
  async getProductBySlug(slug: string): Promise<ApiResponse<Tables<'products'>>> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_categories(id, name, slug),
          vendors(id, name, email),
          product_paper_stocks(
            paper_stocks(id, name, weight, price_per_sq_inch),
            is_default,
            price_override
          ),
          product_print_sizes(
            print_sizes(id, name, width, height),
            is_default,
            price_modifier
          ),
          product_turnaround_times(
            turnaround_times(id, name, business_days, price_markup_percent),
            is_default,
            price_override
          ),
          product_add_ons(
            add_ons(id, name, pricing_model, configuration),
            is_mandatory,
            price_override
          )
        `)
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      return { error: 'Failed to fetch product' };
    }
  },

  // Create new product
  async createProduct(product: TablesInsert<'products'>): Promise<ApiResponse<Tables<'products'>>> {
    try {
      // Validate admin access
      await auth.requireAdmin();

      // Validate required fields
      validateRequired(product.name, 'Product name');
      validateRequired(product.slug, 'Product slug');
      validateRequired(product.category_id, 'Category ID');
      validateRequired(product.vendor_id, 'Vendor ID');
      validateUUID(product.category_id, 'Category ID');
      validateUUID(product.vendor_id, 'Vendor ID');

      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return createSuccessResponse(data);
    } catch (error) {
      return handleError(error);
    }
  },

  // Update product
  async updateProduct(id: string, updates: TablesUpdate<'products'>): Promise<ApiResponse<Tables<'products'>>> {
    try {
      // Validate admin access
      await auth.requireAdmin();

      // Validate ID
      validateUUID(id, 'Product ID');

      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return createSuccessResponse(data);
    } catch (error) {
      return handleError(error);
    }
  },

  // Delete product
  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    try {
      // Validate admin access
      await auth.requireAdmin();

      // Validate ID
      validateUUID(id, 'Product ID');

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        return { error: error.message };
      }

      return createSuccessResponse(undefined);
    } catch (error) {
      return handleError(error);
    }
  }
};