// Payment gateway types
export interface PaymentGateway {
  id: string;
  name: string;
  type: 'square' | 'paypal' | 'cashapp';
  is_enabled: boolean;
  is_test_mode: boolean;
  config: PaymentGatewayConfig;
}

export interface PaymentGatewayConfig {
  square?: SquareConfig;
  paypal?: PayPalConfig;
  cashapp?: CashAppConfig;
}

export interface SquareConfig {
  application_id: string;
  location_id: string;
  sandbox_application_id?: string;
  sandbox_location_id?: string;
}

export interface PayPalConfig {
  client_id: string;
  client_secret: string;
  sandbox_client_id?: string;
  sandbox_client_secret?: string;
}

export interface CashAppConfig {
  client_id: string;
  client_secret: string;
  sandbox_client_id?: string;
  sandbox_client_secret?: string;
}

// Payment processing types
export interface PaymentRequest {
  amount: number;
  currency: 'USD';
  description: string;
  customer_id?: string;
  metadata?: Record<string, string>;
}

export interface SquarePaymentRequest extends PaymentRequest {
  source_id: string;
  verification_token?: string;
  location_id: string;
}

export interface PayPalPaymentRequest extends PaymentRequest {
  order_id: string;
  payer_id: string;
}

export interface CashAppPaymentRequest extends PaymentRequest {
  cashtag?: string;
  phone?: string;
  email?: string;
}

export interface PaymentResponse {
  success: boolean;
  payment_id: string;
  transaction_id?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  amount_charged: number;
  gateway_response?: any;
  error?: PaymentError;
  receipt_url?: string;
  created_at: string;
}

export interface PaymentError {
  code: string;
  message: string;
  detail?: string;
  category?: 'authentication' | 'invalid_request' | 'rate_limited' | 'payment_method' | 'refund' | 'api_error';
}

// Refund types
export interface RefundRequest {
  payment_id: string;
  amount?: number; // Partial refund if specified, full refund if not
  reason?: string;
}

export interface RefundResponse {
  success: boolean;
  refund_id: string;
  payment_id: string;
  amount_refunded: number;
  status: 'pending' | 'completed' | 'failed';
  error?: PaymentError;
  created_at: string;
}

// Payment method validation
export interface PaymentMethodValidation {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface CreditCardValidation extends PaymentMethodValidation {
  card_type?: 'visa' | 'mastercard' | 'amex' | 'discover' | 'unknown';
  bin_info?: {
    bank: string;
    country: string;
    type: 'debit' | 'credit' | 'prepaid';
  };
}

// Payment security
export interface PaymentSecurityCheck {
  cvv_verified: boolean;
  address_verified: boolean;
  postal_code_verified: boolean;
  risk_score: number; // 0-100, higher is riskier
  fraud_indicators: string[];
  recommendations: 'approve' | 'review' | 'decline';
}

// Webhook types for payment status updates
export interface PaymentWebhookEvent {
  id: string;
  type: 'payment.completed' | 'payment.failed' | 'payment.refunded' | 'payment.disputed';
  payment_id: string;
  data: any;
  created_at: string;
  processed: boolean;
}

// Payment reporting and analytics
export interface PaymentSummary {
  total_transactions: number;
  total_amount: number;
  successful_transactions: number;
  failed_transactions: number;
  refunded_transactions: number;
  average_transaction_amount: number;
  gateway_breakdown: Record<string, {
    count: number;
    amount: number;
    success_rate: number;
  }>;
}

// Saved payment methods for returning customers
export interface SavedPaymentMethod {
  id: string;
  user_id: string;
  type: 'card';
  last_four: string;
  brand: string;
  exp_month: number;
  exp_year: number;
  billing_name: string;
  billing_address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  is_default: boolean;
  gateway_id: string;
  gateway_customer_id: string;
  gateway_payment_method_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSavedPaymentMethodRequest {
  payment_token: string;
  gateway: 'square' | 'paypal' | 'cashapp';
  billing_name: string;
  billing_address?: SavedPaymentMethod['billing_address'];
  is_default?: boolean;
}

// Payment form types for UI components
export interface PaymentFormData {
  gateway: 'square' | 'paypal' | 'cashapp';
  card_number?: string;
  exp_month?: number;
  exp_year?: number;
  cvv?: string;
  billing_name: string;
  billing_address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  save_payment_method?: boolean;
  use_saved_method?: boolean;
  saved_method_id?: string;
}

export interface PaymentFormValidation {
  card_number: boolean;
  exp_date: boolean;
  cvv: boolean;
  billing_name: boolean;
  billing_address: boolean;
  errors: Record<string, string>;
}