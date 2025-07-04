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
  }
};