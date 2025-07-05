import { Database } from '@/integrations/supabase/types';

export type OrderStatus = Database['public']['Enums']['order_status'];
export type JobStatus = Database['public']['Enums']['job_status'];

export interface Address {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface OrderHistoryItem {
  id: string;
  reference_number: string;
  status: OrderStatus;
  total_amount: number;
  created_at: string;
  updated_at: string;
  job_count: number;
  product_names: string[];
  estimated_delivery?: string;
  tracking_numbers: string[];
}

export interface OrderFilter {
  date_range?: {
    start: string;
    end: string;
  };
  status?: OrderStatus[];
  product_category?: string[];
  min_amount?: number;
  max_amount?: number;
  search_term?: string;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status: string;
  notes?: string;
  created_at: string;
  created_by?: string;
}

export interface ArtworkFile {
  id: string;
  filename: string;
  file_url: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  category_id: string;
  base_price: number;
  slug: string;
}

export interface Vendor {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: Address;
}

export interface ProductConfiguration {
  print_size: {
    id: string;
    name: string;
    width: number;
    height: number;
  };
  paper_stock: {
    id: string;
    name: string;
    weight: number;
  };
  coating?: {
    id: string;
    name: string;
    price_modifier: number;
  };
  turnaround_time: {
    id: string;
    name: string;
    business_days: number;
  };
  add_ons?: Array<{
    id: string;
    name: string;
    configuration: any;
  }>;
}

export interface ConfigurationDisplay {
  paper_stock_name?: string;
  print_size_name?: string;
  turnaround_time_name?: string;
  add_on_names: string[];
}

export interface OrderJobDetail {
  id: string;
  product: Product;
  quantity: number;
  unit_price: number;
  total_price: number;
  configuration: ProductConfiguration;
  configuration_display: ConfigurationDisplay;
  status: JobStatus;
  vendor: Vendor;
  tracking_number?: string;
  estimated_delivery?: string;
  actual_delivery?: string;
  artwork_files: ArtworkFile[];
}

export interface OrderDetail {
  id: string;
  reference_number: string;
  status: OrderStatus;
  subtotal: number;
  tax_amount: number;
  shipping_cost: number;
  total_amount: number;
  shipping_address: Address;
  billing_address: Address;
  payment_method: string;
  payment_status: string;
  created_at: string;
  updated_at: string;
  order_jobs: OrderJobDetail[];
  status_history: OrderStatusHistory[];
  notes?: string;
  special_instructions?: string;
}

export interface OrderSummary {
  total_orders: number;
  total_amount: number;
  pending_orders: number;
  in_production_orders: number;
  shipped_orders: number;
  delivered_orders: number;
}

export interface ReorderValidation {
  is_valid: boolean;
  unavailable_products: string[];
  modified_prices: Array<{
    product_id: string;
    old_price: number;
    new_price: number;
  }>;
  warnings: string[];
}