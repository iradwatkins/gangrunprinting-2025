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

// Product Categories API
export const categoriesApi = {
  // Get all categories with hierarchical structure
  async getCategories(filters: CategoryFilters = {}): Promise<ApiResponse<Tables<'product_categories'>[]>> {
    console.log('Categories API: Starting request with filters:', filters);
    
    try {
      // Check authentication first
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('Categories API: Auth check - User:', user?.id, 'Error:', authError);
      
      if (authError) {
        console.error('Categories API: Authentication error:', authError);
        return { error: `Authentication error: ${authError.message}` };
      }

      if (!user) {
        console.error('Categories API: No authenticated user');
        return { error: 'Authentication required' };
      }

      // Start with simplest possible query
      console.log('Categories API: Building query...');
      let query = supabase
        .from('product_categories')
        .select('*'); // Simplified - no joins initially

      console.log('Categories API: Applying filters...');
      // Apply filters
      if (filters.parent_category_id) {
        console.log('Categories API: Adding parent_category_id filter:', filters.parent_category_id);
        query = query.eq('parent_category_id', filters.parent_category_id);
      }
      if (filters.is_active !== undefined) {
        console.log('Categories API: Adding is_active filter:', filters.is_active);
        query = query.eq('is_active', filters.is_active);
      }
      if (filters.search) {
        console.log('Categories API: Adding search filter:', filters.search);
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      // Apply pagination
      const page = filters.page || 1;
      const limit = filters.limit || 50;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      console.log('Categories API: Adding pagination:', { page, limit, from, to });
      query = query.range(from, to).order('sort_order', { ascending: true });

      console.log('Categories API: Executing query...');
      
      // Add timeout protection
      const queryPromise = query;
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Query timeout after 10 seconds')), 10000);
      });
      
      const { data, error, count } = await Promise.race([queryPromise, timeoutPromise]) as any;

      console.log('Categories API: Query completed. Data:', data?.length, 'Error:', error, 'Count:', count);

      if (error) {
        console.error('Categories API: Supabase error:', error);
        return { error: `Database error: ${error.message}` };
      }

      console.log('Categories API: Success! Returning', data?.length || 0, 'categories');
      return {
        data: data || [],
        meta: {
          total: count || 0,
          page,
          limit
        }
      };
    } catch (error) {
      console.error('Categories API: Unexpected error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch categories';
      return { error: `Unexpected error: ${errorMessage}` };
    }
  },

  // Get category hierarchy (parent categories with children)
  async getCategoryHierarchy(): Promise<ApiResponse<Tables<'product_categories'>[]>> {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select(`
          *,
          children:product_categories!parent_category_id(*)
        `)
        .is('parent_category_id', null)
        .eq('is_active', true)
        .order('sort_order');

      if (error) {
        return { error: error.message };
      }

      return { data: data || [] };
    } catch (error) {
      return { error: 'Failed to fetch category hierarchy' };
    }
  },

  // Get single category by ID
  async getCategory(id: string): Promise<ApiResponse<Tables<'product_categories'>>> {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select(`
          *,
          parent_category:parent_category_id(id, name, slug),
          children:product_categories!parent_category_id(*),
          _count:products(count)
        `)
        .eq('id', id)
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      return { error: 'Failed to fetch category' };
    }
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
      // Check if category has children or products
      const { data: children } = await supabase
        .from('product_categories')
        .select('id')
        .eq('parent_category_id', id);

      const { data: products } = await supabase
        .from('products')
        .select('id')
        .eq('category_id', id);

      if (children && children.length > 0) {
        return { error: 'Cannot delete category with subcategories' };
      }

      if (products && products.length > 0) {
        return { error: 'Cannot delete category with products' };
      }

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