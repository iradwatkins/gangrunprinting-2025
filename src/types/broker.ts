export interface BrokerProfile {
  id: string;
  user_id: string;
  company_name: string;
  broker_tier: BrokerTier;
  status: 'active' | 'suspended' | 'pending_verification';
  category_discounts: CategoryDiscount[];
  volume_tier: VolumeTier;
  annual_volume_committed: number;
  current_year_volume: number;
  joined_date: string;
  last_order_date?: string;
  payment_terms: PaymentTerms;
  contact_person: {
    name: string;
    email: string;
    phone: string;
  };
  shipping_preferences: {
    default_address_id?: string;
    preferred_carrier?: string;
    rush_order_eligible: boolean;
  };
}

export interface BrokerTier {
  id: string;
  name: 'bronze' | 'silver' | 'gold' | 'platinum';
  display_name: string;
  minimum_annual_volume: number;
  base_discount_percentage: number;
  benefits: string[];
  payment_terms_days: number;
  rush_order_discount: number;
  free_shipping_threshold: number;
}

export interface CategoryDiscount {
  category_id: string;
  category_name: string;
  discount_percentage: number;
  minimum_quantity?: number;
  volume_multiplier: number;
}

export interface VolumeTier {
  tier_name: string;
  minimum_volume: number;
  maximum_volume?: number;
  discount_multiplier: number;
  additional_benefits: string[];
}

export interface PaymentTerms {
  net_days: number;
  early_payment_discount: number;
  credit_limit: number;
  credit_status: 'approved' | 'pending' | 'declined';
}

export interface PricingContext {
  user_id: string;
  is_broker: boolean;
  broker_profile?: BrokerProfile;
  category_id: string;
  product_id: string;
  quantity: number;
  base_price: number;
  rush_order: boolean;
}

export interface PriceCalculation {
  base_price: number;
  broker_discount: number;
  volume_discount: number;
  category_discount: number;
  tier_discount: number;
  rush_surcharge: number;
  total_discount: number;
  final_price: number;
  savings: number;
  discount_breakdown: {
    type: string;
    amount: number;
    percentage: number;
    description: string;
  }[];
}

export interface BrokerDashboardData {
  profile: BrokerProfile;
  volume_progress: {
    current_volume: number;
    annual_target: number;
    percentage_complete: number;
    next_tier_volume: number;
    next_tier_discount: number;
  };
  recent_orders: BrokerOrderSummary[];
  pricing_summary: {
    categories: {
      category_name: string;
      discount_percentage: number;
      orders_count: number;
      total_savings: number;
    }[];
    total_annual_savings: number;
    average_discount: number;
  };
  payment_status: {
    outstanding_balance: number;
    credit_available: number;
    next_payment_due: string;
    payment_history: PaymentRecord[];
  };
}

export interface BrokerOrderSummary {
  order_id: string;
  order_number: string;
  date: string;
  total_amount: number;
  discount_applied: number;
  savings: number;
  status: string;
  items_count: number;
}

export interface PaymentRecord {
  payment_id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  status: 'paid' | 'pending' | 'failed';
}

export interface BrokerRequest {
  id: string;
  user_id: string;
  request_type: 'new_application' | 'tier_upgrade' | 'credit_increase';
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  requested_tier?: BrokerTier;
  requested_credit_limit?: number;
  business_justification: string;
  documents: {
    business_license?: string;
    tax_certificate?: string;
    financial_statements?: string;
    references?: string[];
  };
  submitted_date: string;
  reviewed_date?: string;
  reviewed_by?: string;
  admin_notes?: string;
}

export interface BrokerAdminStats {
  total_brokers: number;
  active_brokers: number;
  pending_applications: number;
  total_broker_volume: number;
  average_discount: number;
  top_performing_brokers: {
    broker_id: string;
    company_name: string;
    annual_volume: number;
    tier: string;
  }[];
  tier_distribution: {
    [key in BrokerTier['name']]: number;
  };
}