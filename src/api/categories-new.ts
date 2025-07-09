import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export interface SimpleApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CategoryFilters {
  search?: string;
  is_active?: boolean;
}

export type Category = Tables<'product_categories'>;

// Simple, reliable categories API
export const newCategoriesApi = {
  // Get all categories - simple, no complex queries
  async getCategories(filters: CategoryFilters = {}): Promise<SimpleApiResponse<Category[]>> {
    try {
      console.log('New Categories API: Starting simple query');
      
      let query = supabase
        .from('product_categories')
        .select('*')
        .order('sort_order', { ascending: true });

      // Apply simple filters
      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }
      
      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      console.log('New Categories API: Executing query...');
      const { data, error } = await query;
      console.log('New Categories API: Query result:', { dataCount: data?.length, error });

      if (error) {
        console.error('New Categories API: Database error:', error);
        return { success: false, error: error.message };
      }

      console.log('New Categories API: Success!', data?.length || 0, 'categories found');
      return { success: true, data: data || [] };

    } catch (error) {
      console.error('New Categories API: Unexpected error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  },

  // Create a new category
  async createCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<SimpleApiResponse<Category>> {
    try {
      console.log('New Categories API: Creating category:', category.name);
      
      const { data, error } = await supabase
        .from('product_categories')
        .insert(category)
        .select()
        .single();

      if (error) {
        console.error('New Categories API: Create error:', error);
        return { success: false, error: error.message };
      }

      console.log('New Categories API: Category created successfully');
      return { success: true, data };

    } catch (error) {
      console.error('New Categories API: Create unexpected error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create category' 
      };
    }
  },

  // Update a category
  async updateCategory(id: string, updates: Partial<Category>): Promise<SimpleApiResponse<Category>> {
    try {
      console.log('New Categories API: Updating category:', id);
      
      const { data, error } = await supabase
        .from('product_categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('New Categories API: Update error:', error);
        return { success: false, error: error.message };
      }

      console.log('New Categories API: Category updated successfully');
      return { success: true, data };

    } catch (error) {
      console.error('New Categories API: Update unexpected error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update category' 
      };
    }
  },

  // Delete a category
  async deleteCategory(id: string): Promise<SimpleApiResponse<void>> {
    try {
      console.log('New Categories API: Deleting category:', id);
      
      const { error } = await supabase
        .from('product_categories')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('New Categories API: Delete error:', error);
        return { success: false, error: error.message };
      }

      console.log('New Categories API: Category deleted successfully');
      return { success: true };

    } catch (error) {
      console.error('New Categories API: Delete unexpected error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete category' 
      };
    }
  }
};