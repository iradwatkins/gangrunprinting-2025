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
    console.log('Categories API: Starting request');
    
    try {
      // Simple query without filters
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .order('sort_order', { ascending: true });

      console.log('Categories API: Query completed', { dataCount: data?.length, error });

      if (error) {
        console.error('Categories API: Database error:', error);
        return { error: error.message };
      }

      console.log('Categories API: Success!', data?.length || 0, 'categories');
      return { data: data || [] };
    } catch (error) {
      console.error('Categories API: Unexpected error:', error);
      return { error: 'Failed to fetch categories' };
    }
  },

  // Get all categories - simplified and reliable
  async getCategories(filters: CategoryFilters = {}): Promise<ApiResponse<Tables<'product_categories'>[]>> {
    console.log('Categories API: Starting request');
    
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

      console.log('Categories API: Executing query');
      const { data, error, count } = await query;
      console.log('Categories API: Query completed', { dataCount: data?.length, error });

      if (error) {
        console.error('Categories API: Database error:', error);
        return { error: error.message };
      }

      console.log('Categories API: Success!', data?.length || 0, 'categories');
      
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
    console.log('🏷️ Categories API: Creating category', category);
    
    try {
      // First check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('🏷️ Auth check:', { 
        user: user ? { id: user.id, email: user.email } : null, 
        error: authError?.message 
      });

      if (authError || !user) {
        throw new Error('Authentication required. Please log in.');
      }

      // Check admin status by testing the is_admin() function
      console.log('🏷️ Checking admin status...');
      const { data: isAdminResult, error: adminError } = await supabase.rpc('is_admin');
      console.log('🏷️ Admin check result:', { isAdmin: isAdminResult, error: adminError?.message });

      if (adminError) {
        console.error('🏷️ Admin function error:', adminError);
      }

      if (!isAdminResult) {
        // Additional check for specific email
        if (user.email === 'iradwatkins@gmail.com') {
          console.log('🏷️ User is iradwatkins@gmail.com - should have admin access');
        } else {
          console.log('🏷️ User is not admin:', user.email);
        }
      }

      // Attempt the insert
      console.log('🏷️ Attempting category insert...');
      const { data, error } = await supabase
        .from('product_categories')
        .insert(category)
        .select()
        .single();

      if (error) {
        console.error('🏷️ Database error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });

        // Provide specific error messages
        if (error.code === '42501') {
          throw new Error('Permission denied. You need admin privileges to create categories.');
        } else if (error.message.includes('row-level security policy')) {
          throw new Error('Access denied by security policy. Please ensure you have admin role.');
        } else if (error.code === '23505') {
          throw new Error('A category with this name or slug already exists.');
        }
        
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('🏷️ Category created successfully:', data);
      return data;
    } catch (err) {
      console.error('🏷️ Category creation failed:', err);
      throw err;
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

  // Update category - for React Query mutations
  async update(id: string, updates: Partial<TablesUpdate<'product_categories'>>): Promise<Tables<'product_categories'>> {
    console.log('🏷️ Categories API: Updating category', { id, updates });
    
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('🏷️ Update error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });

        if (error.code === '42501') {
          throw new Error('Permission denied. You need admin privileges to update categories.');
        } else if (error.message.includes('row-level security policy')) {
          throw new Error('Access denied by security policy. Please ensure you have admin role.');
        }
        
        throw new Error(error.message);
      }

      console.log('🏷️ Category updated successfully:', data);
      return data;
    } catch (err) {
      console.error('🏷️ Category update failed:', err);
      throw err;
    }
  },

  // Delete category - for React Query mutations
  async delete(id: string): Promise<void> {
    console.log('🏷️ Categories API: Deleting category', { id });
    
    try {
      const { error } = await supabase
        .from('product_categories')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('🏷️ Delete error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });

        if (error.code === '42501') {
          throw new Error('Permission denied. You need admin privileges to delete categories.');
        } else if (error.message.includes('row-level security policy')) {
          throw new Error('Access denied by security policy. Please ensure you have admin role.');
        }
        
        throw new Error(error.message);
      }

      console.log('🏷️ Category deleted successfully');
    } catch (err) {
      console.error('🏷️ Category deletion failed:', err);
      throw err;
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