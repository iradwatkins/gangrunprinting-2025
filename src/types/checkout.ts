import type { CartItem } from './cart';
import type { Address } from './auth';

export interface CheckoutSession {
  id: string;
  user_id?: string;
  session_id?: string;
  cart_items: CartItem[];
  shipping_address?: Address;
  billing_address?: Address;
  payment_method?: PaymentMethod;
  shipping_method?: ShippingMethod;
  subtotal: number;
  tax_amount: number;
  shipping_cost: number;
  discount_amount: number;
  total_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'expired';
  created_at: string;
  updated_at: string;
  expires_at: string;
}

export interface PaymentMethod {
  type: 'square' | 'paypal' | 'cashapp' | 'card';
  token?: string;
  last_four?: string;
  brand?: string;
  exp_month?: number;
  exp_year?: number;
  billing_name?: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  cost: number;
  estimated_days: number;
  carrier: string;
  is_available: boolean;
}

export interface TaxCalculation {
  rate: number;
  amount: number;
  breakdown: {
    state_tax: number;
    local_tax: number;
    county_tax: number;
  };
}

export interface OrderCreationData {
  user_id?: string;
  session_id?: string;
  reference_number: string;
  status: 'pending_payment' | 'payment_confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'on_hold_awaiting_files';
  subtotal: number;
  tax_amount: number;
  shipping_cost: number;
  discount_amount: number;
  total_amount: number;
  shipping_address: Address;
  billing_address: Address;
  payment_method: string;
  payment_id?: string;
  payment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  order_jobs: OrderJobCreationData[];
  special_instructions?: string;
  tracking_number?: string;
  notes?: string;
}

export interface OrderJobCreationData {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  configuration: Record<string, any>;
  configuration_display: {
    paper_stock_name: string;
    print_size_name: string;
    turnaround_time_name: string;
    add_on_names: string[];
  };
  status: 'pending' | 'in_production' | 'ready' | 'shipped' | 'completed' | 'on_hold_awaiting_files';
  estimated_completion_date?: string;
  uploaded_files?: string[]; // Array of file IDs
}

// Request/Response types
export interface CreateCheckoutSessionRequest {
  cart_items: CartItem[];
  user_id?: string;
  session_id?: string;
}

export interface UpdateCheckoutSessionRequest {
  shipping_address?: Address;
  billing_address?: Address;
  payment_method?: PaymentMethod;
  shipping_method?: ShippingMethod;
  special_instructions?: string;
}

export interface ValidateAddressRequest {
  address: Omit<Address, 'id' | 'is_default'>;
}

export interface ValidateAddressResponse {
  is_valid: boolean;
  suggestions?: Address[];
  corrected_address?: Address;
  errors?: string[];
}

export interface CalculateShippingRequest {
  shipping_address: Address;
  cart_items: CartItem[];
}

export interface CalculateShippingResponse {
  shipping_methods: ShippingMethod[];
  errors?: string[];
}

export interface CalculateTaxRequest {
  shipping_address: Address;
  cart_items: CartItem[];
  shipping_cost: number;
}

export interface CalculateTaxResponse {
  tax_calculation: TaxCalculation;
  total_tax_amount: number;
}

export interface ProcessPaymentRequest {
  checkout_session_id: string;
  payment_method: PaymentMethod;
  payment_token: string;
  save_payment_method?: boolean;
}

export interface ProcessPaymentResponse {
  success: boolean;
  payment_id: string;
  order_id: string;
  reference_number: string;
  transaction_id?: string;
  error?: string;
}

// Checkout flow configuration
export interface CheckoutFlowConfig {
  type: 'multi_step' | 'single_page';
  steps: CheckoutStep[];
  theme: 'light' | 'dark';
  allow_guest_checkout: boolean;
  require_phone: boolean;
  require_company: boolean;
}

export interface CheckoutStep {
  id: string;
  title: string;
  component: string;
  required: boolean;
  order: number;
}

// Form validation schemas
export interface CheckoutFormData {
  shipping_address: Address;
  billing_address: Address;
  shipping_method: ShippingMethod;
  payment_method: PaymentMethod;
  billing_same_as_shipping: boolean;
  save_addresses: boolean;
  special_instructions: string;
  terms_accepted: boolean;
  marketing_opt_in: boolean;
}

// Checkout context type
export interface CheckoutContextType {
  session: CheckoutSession | null;
  isLoading: boolean;
  error: string | null;
  currentStep: number;
  flowConfig: CheckoutFlowConfig;
  createSession: (items: CartItem[]) => Promise<void>;
  updateSession: (updates: UpdateCheckoutSessionRequest) => Promise<void>;
  validateAddress: (address: Omit<Address, 'id' | 'is_default'>) => Promise<ValidateAddressResponse>;
  calculateShipping: (address: Address, items: CartItem[]) => Promise<ShippingMethod[]>;
  calculateTax: (address: Address, items: CartItem[], shipping: number) => Promise<TaxCalculation>;
  processPayment: (paymentData: ProcessPaymentRequest) => Promise<ProcessPaymentResponse>;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  resetCheckout: () => void;
}

export interface CheckoutState {
  session: CheckoutSession | null;
  isLoading: boolean;
  error: string | null;
  currentStep: number;
  validationErrors: Record<string, string[]>;
  paymentProcessing: boolean;
}