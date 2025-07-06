import type { Tables } from '@/integrations/supabase/types';

export interface CartItem {
  id: string;
  product_id: string;
  product_name: string;
  product_slug: string;
  product_image?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  configuration: {
    paper_stock_id?: string;
    print_size_id?: string;
    turnaround_time_id?: string;
    add_on_ids: string[];
    custom_options?: Record<string, any>;
    notes?: string;
  };
  configuration_display: {
    paper_stock_name?: string;
    print_size_name?: string;
    turnaround_time_name?: string;
    add_on_names: string[];
  };
  price_breakdown: {
    base_price: number;
    paper_cost: number;
    size_modifier: number;
    turnaround_modifier: number;
    add_on_costs: number;
    subtotal: number;
    quantity_discount: number;
    broker_discount: number;
    savings: number;
  };
  minimum_quantity: number;
  added_at: string;
  updated_at: string;
  validation_errors?: string[];
  uploaded_files?: string[]; // Array of file IDs
  has_required_files: boolean;
}

export interface CartState {
  items: CartItem[];
  total_items: number;
  subtotal: number;
  total_discount: number;
  tax_amount: number;
  shipping_cost: number;
  total_amount: number;
  user_id?: string;
  session_id: string;
  created_at: string;
  updated_at: string;
}

export interface CartTotals {
  subtotal: number;
  total_discount: number;
  tax_amount: number;
  shipping_cost: number;
  total_amount: number;
  total_items: number;
  total_savings: number;
}

export interface AddToCartRequest {
  product_id: string;
  quantity: number;
  configuration: {
    paper_stock_id?: string;
    print_size_id?: string;
    turnaround_time_id?: string;
    add_on_ids: string[];
    custom_options?: Record<string, any>;
    notes?: string;
  };
}

export interface UpdateCartItemRequest {
  quantity?: number;
  configuration?: {
    paper_stock_id?: string;
    print_size_id?: string;
    turnaround_time_id?: string;
    add_on_ids: string[];
    custom_options?: Record<string, any>;
    notes?: string;
  };
}

export interface CartValidationResult {
  isValid: boolean;
  errors: {
    itemId: string;
    errors: string[];
  }[];
  warnings: {
    itemId: string;
    warnings: string[];
  }[];
}

export interface CartSyncRequest {
  guest_session_id: string;
  user_id: string;
}

export type CartActionType = 
  | 'ADD_ITEM'
  | 'UPDATE_ITEM'
  | 'REMOVE_ITEM'
  | 'CLEAR_CART'
  | 'SET_CART'
  | 'SYNC_CART';

export interface CartAction {
  type: CartActionType;
  payload?: any;
}