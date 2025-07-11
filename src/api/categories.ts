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

export interface CategoryFilters {
  parent_category_id?: string;
  is_active?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

// Product Categories API - Rebuilt for reliability
export const categoriesApi = {
  // Get all categories - simple method for React Query
  async getAll(): Promise<ApiResponse<Tables<'product_categories'>[]>> {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) {
        return { error: error.message };
      }

      return { data: data || [] };
    } catch (error) {
      console.error('Categories API - Unexpected Error:', error);
      return { error: 'Failed to fetch categories' };
    }
  },

  // Get all categories - simplified and reliable
  async getCategories(filters: CategoryFilters = {}): Promise<ApiResponse<Tables<'product_categories'>[]>> {
    try {
      // Simple query without complex joins
      let query = supabase
        .from('product_categories')
        .select('*');

      // Apply filters
      if (filters.parent_category_id) {
        query = query.eq('parent_category_id', filters.parent_category_id);
      }
      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }
      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      // Apply pagination only if page/limit are specified
      if (filters.page && filters.limit) {
        const page = filters.page;
        const limit = filters.limit;
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);
      }

      query = query.order('sort_order', { ascending: true });

      const { data, error, count } = await query;

      if (error) {
        return { error: error.message };
      }
      
      const response: ApiResponse<Tables<'product_categories'>[]> = {
        data: data || []
      };

      // Only include meta if pagination was requested
      if (filters.page && filters.limit) {
        response.meta = {
          total: count || 0,
          page: filters.page,
          limit: filters.limit
        };
      }

      return response;
    } catch (error) {
      console.error('Categories API: Unexpected error:', error);
      return { error: 'Failed to fetch categories' };
    }
  },

  // Create new category - for React Query mutations
  async create(category: TablesInsert<'product_categories'>): Promise<Tables<'product_categories'>> {
    const { data, error } = await supabase
      .from('product_categories')
      .insert(category)
      .select()
      .single();

    if (error) {
      // Simple, clear error messages
      if (error.code === '23505') {
        throw new Error('A category with this name or slug already exists.');
      } else if (error.code === '42501') {
        throw new Error('You do not have permission to create categories.');
      }
      throw new Error(error.message);
    }

    return data;
  },

  // Create new category
  async createCategory(category: TablesInsert<'product_categories'>): Promise<ApiResponse<Tables<'product_categories'>>> {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .insert(category)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      return { error: 'Failed to create category' };
    }
  },

  // Update category - for React Query mutations
  async update(id: string, updates: Partial<TablesUpdate<'product_categories'>>): Promise<Tables<'product_categories'>> {
    const { data, error } = await supabase
      .from('product_categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '42501') {
        throw new Error('You do not have permission to update categories.');
      }
      throw new Error(error.message);
    }

    return data;
  },

  // Delete category - for React Query mutations
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('product_categories')
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === '42501') {
        throw new Error('You do not have permission to delete categories.');
      }
      throw new Error(error.message);
    }
  },

  // Update category
  async updateCategory(id: string, updates: TablesUpdate<'product_categories'>): Promise<ApiResponse<Tables<'product_categories'>>> {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      return { error: 'Failed to update category' };
    }
  },

  // Delete category
  async deleteCategory(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('product_categories')
        .delete()
        .eq('id', id);

      if (error) {
        return { error: error.message };
      }

      return { data: undefined };
    } catch (error) {
      return { error: 'Failed to delete category' };
    }
  }
};