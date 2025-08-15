/**
 * Pricing System Type Definitions
 * CRITICAL: These types define the contract for the pricing engine
 */

// Broker Tier Definitions
export interface BrokerTier {
  id: string;
  name: string;
  display_name: string;
  base_discount_percentage: number;
  annual_volume_requirement: number;
  benefits: string[];
  color: string;
}

// Broker Profile
export interface BrokerProfile {
  id: string;
  user_id: string;
  tier: string;
  annual_volume: number;
  ytd_volume: number;
  discount_percentage: number;
  category_discounts?: CategoryDiscount[];
  is_active: boolean;
  approved_at?: string;
  approved_by?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Category Discount
export interface CategoryDiscount {
  category_id: string;
  category_name?: string;
  discount_percentage: number;
}

// Volume Tier
export interface VolumeTier {
  min_quantity: number;
  max_quantity?: number;
  discount_percentage: number;
  multiplier: number;
}

// Pricing Context for calculations
export interface PricingContext {
  // Product details
  product_id: string;
  product_name?: string;
  base_price: number;
  
  // Dimensions
  width: number;
  height: number;
  
  // Quantity
  quantity: number;
  
  // Paper stock
  paper_stock?: {
    id: string;
    name: string;
    price_per_sq_inch: number;
    second_side_markup_percent?: number;
  };
  
  // Options
  sides: 'single' | 'double';
  coating?: string;
  turnaround_time?: {
    id: string;
    name: string;
    multiplier: number;
  };
  
  // Add-ons
  add_ons?: AddOn[];
  
  // Broker information
  broker?: BrokerProfile;
  apply_broker_pricing?: boolean;
  
  // Special flags
  exact_size?: boolean;
  rush_order?: boolean;
  our_tagline?: boolean; // 5% discount, hidden from brokers
}

// Add-on Definition
export interface AddOn {
  id: string;
  name: string;
  pricing_model: 'flat' | 'per_piece' | 'setup_plus_per_piece' | 'custom';
  base_price?: number;
  setup_fee?: number;
  per_piece_price?: number;
  configuration?: any; // JSONB data
  quantity?: number;
  selected_options?: any;
}

// Price Calculation Result
export interface PriceCalculation {
  // Base calculations
  base_paper_print_price: number;
  adjusted_base_price: number;
  exact_size_price?: number;
  turnaround_price: number;
  
  // Add-ons
  add_ons_total: number;
  add_on_details?: Array<{
    name: string;
    price: number;
    breakdown?: string;
  }>;
  
  // Discounts
  broker_discount?: number;
  volume_discount?: number;
  our_tagline_discount?: number;
  total_discount: number;
  
  // Finals
  subtotal: number;
  final_price: number;
  unit_price: number;
  
  // Metadata
  calculation_timestamp: string;
  pricing_version: string;
  notes?: string[];
}

// Order Job for tracking
export interface OrderJob {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  width: number;
  height: number;
  paper_stock_id?: string;
  coating_id?: string;
  turnaround_time_id?: string;
  sides: 'single' | 'double';
  add_ons?: any; // JSONB
  unit_price: number;
  total_price: number;
  job_notes?: string;
  artwork_file_id?: string;
  status: 'pending' | 'in_production' | 'completed' | 'cancelled';
}

// Volume Breakpoint for display
export interface VolumeBreakpoint {
  min_quantity: number;
  max_quantity?: number;
  discount_percentage: number;
  multiplier: number;
  label?: string;
}

// Export all types
export type {
  PricingRule,
} from '../pricing/calculations';