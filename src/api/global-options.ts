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

export interface GlobalOptionsFilters {
  is_active?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

// Paper Stocks API
export const paperStocksApi = {
  async getPaperStocks(filters: GlobalOptionsFilters = {}): Promise<ApiResponse<Tables<'paper_stocks'>[]>> {
    try {
      let query = supabase.from('paper_stocks').select('*');

      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query.order('name');

      if (error) {
        return { error: error.message };
      }

      return { data: data || [] };
    } catch (error) {
      return { error: 'Failed to fetch paper stocks' };
    }
  },

  async createPaperStock(paperStock: TablesInsert<'paper_stocks'>): Promise<ApiResponse<Tables<'paper_stocks'>>> {
    try {
      const { data, error } = await supabase
        .from('paper_stocks')
        .insert(paperStock)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      return { error: 'Failed to create paper stock' };
    }
  },

  async updatePaperStock(id: string, updates: TablesUpdate<'paper_stocks'>): Promise<ApiResponse<Tables<'paper_stocks'>>> {
    try {
      const { data, error } = await supabase
        .from('paper_stocks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      return { error: 'Failed to update paper stock' };
    }
  },

  async deletePaperStock(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('paper_stocks')
        .delete()
        .eq('id', id);

      if (error) {
        return { error: error.message };
      }

      return { data: undefined };
    } catch (error) {
      return { error: 'Failed to delete paper stock' };
    }
  },

  // Convenience methods for consistency
  async getAll(filters: GlobalOptionsFilters = {}) {
    return this.getPaperStocks(filters);
  },
  async create(data: TablesInsert<'paper_stocks'>) {
    return this.createPaperStock(data);
  },
  async update(id: string, data: TablesUpdate<'paper_stocks'>) {
    return this.updatePaperStock(id, data);
  },
  async delete(id: string) {
    return this.deletePaperStock(id);
  }
};

// Coatings API
export const coatingsApi = {
  async getCoatings(filters: GlobalOptionsFilters = {}): Promise<ApiResponse<Tables<'coatings'>[]>> {
    try {
      let query = supabase.from('coatings').select('*');

      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query.order('name');

      if (error) {
        return { error: error.message };
      }

      return { data: data || [] };
    } catch (error) {
      return { error: 'Failed to fetch coatings' };
    }
  },

  async createCoating(coating: TablesInsert<'coatings'>): Promise<ApiResponse<Tables<'coatings'>>> {
    try {
      const { data, error } = await supabase
        .from('coatings')
        .insert(coating)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      return { error: 'Failed to create coating' };
    }
  },

  async updateCoating(id: string, updates: TablesUpdate<'coatings'>): Promise<ApiResponse<Tables<'coatings'>>> {
    try {
      const { data, error } = await supabase
        .from('coatings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      return { error: 'Failed to update coating' };
    }
  },

  async deleteCoating(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('coatings')
        .delete()
        .eq('id', id);

      if (error) {
        return { error: error.message };
      }

      return { data: undefined };
    } catch (error) {
      return { error: 'Failed to delete coating' };
    }
  },

  // Convenience methods for consistency
  async getAll(filters: GlobalOptionsFilters = {}) {
    return this.getCoatings(filters);
  },
  async create(data: TablesInsert<'coatings'>) {
    return this.createCoating(data);
  },
  async update(id: string, data: TablesUpdate<'coatings'>) {
    return this.updateCoating(id, data);
  },
  async delete(id: string) {
    return this.deleteCoating(id);
  }
};

// Print Sizes API
export const printSizesApi = {
  async getPrintSizes(filters: GlobalOptionsFilters = {}): Promise<ApiResponse<Tables<'print_sizes'>[]>> {
    try {
      let query = supabase.from('print_sizes').select('*');

      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }
      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      const { data, error } = await query.order('name');

      if (error) {
        return { error: error.message };
      }

      return { data: data || [] };
    } catch (error) {
      return { error: 'Failed to fetch print sizes' };
    }
  },

  async createPrintSize(printSize: TablesInsert<'print_sizes'>): Promise<ApiResponse<Tables<'print_sizes'>>> {
    try {
      const { data, error } = await supabase
        .from('print_sizes')
        .insert(printSize)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      return { error: 'Failed to create print size' };
    }
  },

  async updatePrintSize(id: string, updates: TablesUpdate<'print_sizes'>): Promise<ApiResponse<Tables<'print_sizes'>>> {
    try {
      const { data, error } = await supabase
        .from('print_sizes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      return { error: 'Failed to update print size' };
    }
  },

  async deletePrintSize(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('print_sizes')
        .delete()
        .eq('id', id);

      if (error) {
        return { error: error.message };
      }

      return { data: undefined };
    } catch (error) {
      return { error: 'Failed to delete print size' };
    }
  },

  // Convenience methods for consistency
  async getAll(filters: GlobalOptionsFilters = {}) {
    return this.getPrintSizes(filters);
  },
  async create(data: TablesInsert<'print_sizes'>) {
    return this.createPrintSize(data);
  },
  async update(id: string, data: TablesUpdate<'print_sizes'>) {
    return this.updatePrintSize(id, data);
  },
  async delete(id: string) {
    return this.deletePrintSize(id);
  }
};

// Turnaround Times API
export const turnaroundTimesApi = {
  async getTurnaroundTimes(filters: GlobalOptionsFilters = {}): Promise<ApiResponse<Tables<'turnaround_times'>[]>> {
    try {
      let query = supabase.from('turnaround_times').select('*');

      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }
      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      const { data, error } = await query.order('business_days');

      if (error) {
        return { error: error.message };
      }

      return { data: data || [] };
    } catch (error) {
      return { error: 'Failed to fetch turnaround times' };
    }
  },

  async createTurnaroundTime(turnaroundTime: TablesInsert<'turnaround_times'>): Promise<ApiResponse<Tables<'turnaround_times'>>> {
    try {
      const { data, error } = await supabase
        .from('turnaround_times')
        .insert(turnaroundTime)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      return { error: 'Failed to create turnaround time' };
    }
  },

  async updateTurnaroundTime(id: string, updates: TablesUpdate<'turnaround_times'>): Promise<ApiResponse<Tables<'turnaround_times'>>> {
    try {
      const { data, error } = await supabase
        .from('turnaround_times')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      return { error: 'Failed to update turnaround time' };
    }
  },

  async deleteTurnaroundTime(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('turnaround_times')
        .delete()
        .eq('id', id);

      if (error) {
        return { error: error.message };
      }

      return { data: undefined };
    } catch (error) {
      return { error: 'Failed to delete turnaround time' };
    }
  },

  // Convenience methods for consistency
  async getAll(filters: GlobalOptionsFilters = {}) {
    return this.getTurnaroundTimes(filters);
  },
  async create(data: TablesInsert<'turnaround_times'>) {
    return this.createTurnaroundTime(data);
  },
  async update(id: string, data: TablesUpdate<'turnaround_times'>) {
    return this.updateTurnaroundTime(id, data);
  },
  async delete(id: string) {
    return this.deleteTurnaroundTime(id);
  }
};

// Add-ons API
export const addOnsApi = {
  async getAddOns(filters: GlobalOptionsFilters = {}): Promise<ApiResponse<Tables<'add_ons'>[]>> {
    try {
      let query = supabase.from('add_ons').select('*');

      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query.order('name');

      if (error) {
        return { error: error.message };
      }

      return { data: data || [] };
    } catch (error) {
      return { error: 'Failed to fetch add-ons' };
    }
  },

  async createAddOn(addOn: TablesInsert<'add_ons'>): Promise<ApiResponse<Tables<'add_ons'>>> {
    try {
      const { data, error } = await supabase
        .from('add_ons')
        .insert(addOn)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      return { error: 'Failed to create add-on' };
    }
  },

  async updateAddOn(id: string, updates: TablesUpdate<'add_ons'>): Promise<ApiResponse<Tables<'add_ons'>>> {
    try {
      const { data, error } = await supabase
        .from('add_ons')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      return { error: 'Failed to update add-on' };
    }
  },

  async deleteAddOn(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('add_ons')
        .delete()
        .eq('id', id);

      if (error) {
        return { error: error.message };
      }

      return { data: undefined };
    } catch (error) {
      return { error: 'Failed to delete add-on' };
    }
  },

  // Convenience methods for consistency
  async getAll(filters: GlobalOptionsFilters = {}) {
    return this.getAddOns(filters);
  },
  async create(data: TablesInsert<'add_ons'>) {
    return this.createAddOn(data);
  },
  async update(id: string, data: TablesUpdate<'add_ons'>) {
    return this.updateAddOn(id, data);
  },
  async delete(id: string) {
    return this.deleteAddOn(id);
  }
};

// Quantities API
export const quantitiesApi = {
  async getQuantities(filters: GlobalOptionsFilters = {}): Promise<ApiResponse<Tables<'quantities'>[]>> {
    try {
      let query = supabase.from('quantities').select('*');

      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }
      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      const { data, error } = await query.order('value', { ascending: true, nullsLast: true });

      if (error) {
        return { error: error.message };
      }

      return { data: data || [] };
    } catch (error) {
      return { error: 'Failed to fetch quantities' };
    }
  },

  async createQuantity(quantity: TablesInsert<'quantities'>): Promise<ApiResponse<Tables<'quantities'>>> {
    try {
      const { data, error } = await supabase
        .from('quantities')
        .insert(quantity)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      return { error: 'Failed to create quantity' };
    }
  },

  async updateQuantity(id: string, updates: TablesUpdate<'quantities'>): Promise<ApiResponse<Tables<'quantities'>>> {
    try {
      const { data, error } = await supabase
        .from('quantities')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      return { error: 'Failed to update quantity' };
    }
  },

  async deleteQuantity(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('quantities')
        .delete()
        .eq('id', id);

      if (error) {
        return { error: error.message };
      }

      return { data: undefined };
    } catch (error) {
      return { error: 'Failed to delete quantity' };
    }
  },

  // Convenience methods for consistency
  async getAll(filters: GlobalOptionsFilters = {}) {
    return this.getQuantities(filters);
  },
  async create(data: TablesInsert<'quantities'>) {
    return this.createQuantity(data);
  },
  async update(id: string, data: TablesUpdate<'quantities'>) {
    return this.updateQuantity(id, data);
  },
  async delete(id: string) {
    return this.deleteQuantity(id);
  }
};

// Sides API
export const sidesApi = {
  async getSides(filters: GlobalOptionsFilters = {}): Promise<ApiResponse<Tables<'sides'>[]>> {
    try {
      let query = supabase.from('sides').select('*');

      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }
      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      const { data, error } = await query.order('multiplier', { ascending: true });

      if (error) {
        return { error: error.message };
      }

      return { data: data || [] };
    } catch (error) {
      return { error: 'Failed to fetch sides' };
    }
  },

  async createSide(side: TablesInsert<'sides'>): Promise<ApiResponse<Tables<'sides'>>> {
    try {
      const { data, error } = await supabase
        .from('sides')
        .insert(side)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      return { error: 'Failed to create side' };
    }
  },

  async updateSide(id: string, updates: TablesUpdate<'sides'>): Promise<ApiResponse<Tables<'sides'>>> {
    try {
      const { data, error } = await supabase
        .from('sides')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      return { error: 'Failed to update side' };
    }
  },

  async deleteSide(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('sides')
        .delete()
        .eq('id', id);

      if (error) {
        return { error: error.message };
      }

      return { data: undefined };
    } catch (error) {
      return { error: 'Failed to delete side' };
    }
  },

  // Convenience methods for consistency
  async getAll(filters: GlobalOptionsFilters = {}) {
    return this.getSides(filters);
  },
  async create(data: TablesInsert<'sides'>) {
    return this.createSides(data);
  },
  async createSides(data: TablesInsert<'sides'>) {
    return this.createSide(data);
  },
  async update(id: string, data: TablesUpdate<'sides'>) {
    return this.updateSide(id, data);
  },
  async delete(id: string) {
    return this.deleteSide(id);
  }
};

// Product-Paper Stock Relationships API
export const productPaperStocksApi = {
  // Get paper stocks for a specific product
  async getProductPaperStocks(productId: string): Promise<ApiResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('product_paper_stocks')
        .select(`
          *,
          paper_stocks(
            id, 
            name, 
            description, 
            weight, 
            price_per_sq_inch, 
            different_image_both_sides_available,
            different_image_both_sides_markup,
            same_image_both_sides_available,
            same_image_both_sides_markup,
            image_front_only_available,
            image_front_only_markup,
            your_design_front_our_back_available,
            your_design_front_our_back_markup,
            sides_tooltip_text,
            coatings_tooltip_text,
            tooltip_text,
            is_active
          )
        `)
        .eq('product_id', productId)
        .order('is_default', { ascending: false }); // Default paper stock first

      if (error) {
        return { error: error.message };
      }

      return { data: data || [] };
    } catch (error) {
      return { error: 'Failed to fetch product paper stocks' };
    }
  },

  // Assign paper stock to product
  async assignPaperStock(productId: string, paperStockId: string, isDefault: boolean = false, priceOverride?: number): Promise<ApiResponse<Tables<'product_paper_stocks'>>> {
    try {
      // If setting as default, first unset any existing defaults
      if (isDefault) {
        await supabase
          .from('product_paper_stocks')
          .update({ is_default: false })
          .eq('product_id', productId);
      }

      const { data, error } = await supabase
        .from('product_paper_stocks')
        .insert({
          product_id: productId,
          paper_stock_id: paperStockId,
          is_default: isDefault,
          price_override: priceOverride
        })
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      return { error: 'Failed to assign paper stock to product' };
    }
  },

  // Update product-paper stock relationship
  async updateProductPaperStock(id: string, updates: { is_default?: boolean; price_override?: number }): Promise<ApiResponse<Tables<'product_paper_stocks'>>> {
    try {
      const { data, error } = await supabase
        .from('product_paper_stocks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { data };
    } catch (error) {
      return { error: 'Failed to update product paper stock relationship' };
    }
  },

  // Set default paper stock for product
  async setDefaultPaperStock(productId: string, paperStockId: string): Promise<ApiResponse<void>> {
    try {
      // First, unset all defaults for this product
      await supabase
        .from('product_paper_stocks')
        .update({ is_default: false })
        .eq('product_id', productId);

      // Then set the new default
      const { error } = await supabase
        .from('product_paper_stocks')
        .update({ is_default: true })
        .eq('product_id', productId)
        .eq('paper_stock_id', paperStockId);

      if (error) {
        return { error: error.message };
      }

      return { data: undefined };
    } catch (error) {
      return { error: 'Failed to set default paper stock' };
    }
  },

  // Remove paper stock from product
  async removePaperStock(productId: string, paperStockId: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase
        .from('product_paper_stocks')
        .delete()
        .eq('product_id', productId)
        .eq('paper_stock_id', paperStockId);

      if (error) {
        return { error: error.message };
      }

      return { data: undefined };
    } catch (error) {
      return { error: 'Failed to remove paper stock from product' };
    }
  },

  // Get all available paper stocks not assigned to a product
  async getAvailablePaperStocks(productId: string): Promise<ApiResponse<Tables<'paper_stocks'>[]>> {
    try {
      const { data, error } = await supabase
        .from('paper_stocks')
        .select('*')
        .eq('is_active', true)
        .not('id', 'in', `(
          SELECT paper_stock_id 
          FROM product_paper_stocks 
          WHERE product_id = '${productId}'
        )`)
        .order('name');

      if (error) {
        return { error: error.message };
      }

      return { data: data || [] };
    } catch (error) {
      return { error: 'Failed to fetch available paper stocks' };
    }
  }
};