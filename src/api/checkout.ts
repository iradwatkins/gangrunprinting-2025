import { supabase } from '@/integrations/supabase/client';
import { auth } from '@/lib/auth';
import { ApiResponse, handleApiError } from '@/lib/errors';
import { 
  CheckoutSession,
  CreateCheckoutSessionRequest,
  UpdateCheckoutSessionRequest,
  ValidateAddressRequest,
  ValidateAddressResponse,
  CalculateShippingRequest,
  CalculateShippingResponse,
  CalculateTaxRequest,
  CalculateTaxResponse,
  ShippingMethod,
  TaxCalculation,
  OrderCreationData
} from '@/types/checkout';
import type { CartItem } from '@/types/cart';
import type { Address } from '@/types/auth';
import { v4 as uuidv4 } from 'uuid';

class CheckoutApi {
  private getSessionId(): string {
    let sessionId = localStorage.getItem('checkout_session_id');
    if (!sessionId) {
      sessionId = uuidv4();
      localStorage.setItem('checkout_session_id', sessionId);
    }
    return sessionId;
  }

  private calculateTotals(items: CartItem[], shipping_cost: number = 0, tax_amount: number = 0): {
    subtotal: number;
    discount_amount: number;
    total_amount: number;
  } {
    const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
    const discount_amount = items.reduce((sum, item) => 
      sum + (item.price_breakdown.quantity_discount + item.price_breakdown.broker_discount), 0
    );
    const total_amount = subtotal + shipping_cost + tax_amount;

    return {
      subtotal,
      discount_amount,
      total_amount
    };
  }

  async createSession(request: CreateCheckoutSessionRequest): Promise<ApiResponse<CheckoutSession>> {
    try {
      const user = await auth.getCurrentUser();
      const sessionId = this.getSessionId();
      const now = new Date().toISOString();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

      const totals = this.calculateTotals(request.cart_items);

      const session: CheckoutSession = {
        id: uuidv4(),
        user_id: user?.id,
        session_id: sessionId,
        cart_items: request.cart_items,
        ...totals,
        tax_amount: 0,
        shipping_cost: 0,
        status: 'pending',
        created_at: now,
        updated_at: now,
        expires_at: expiresAt
      };

      // Store session in localStorage for immediate access
      localStorage.setItem('checkout_session', JSON.stringify(session));

      return { success: true, data: session };
    } catch (error) {
      return handleApiError(error, 'Failed to create checkout session');
    }
  }

  async getSession(sessionId: string): Promise<ApiResponse<CheckoutSession>> {
    try {
      // Try localStorage first for immediate response
      const localSession = localStorage.getItem('checkout_session');
      if (localSession) {
        const session: CheckoutSession = JSON.parse(localSession);
        if (session.id === sessionId) {
          return { success: true, data: session };
        }
      }

      return { success: false, error: 'Checkout session not found' };
    } catch (error) {
      return handleApiError(error, 'Failed to retrieve checkout session');
    }
  }

  async updateSession(sessionId: string, updates: UpdateCheckoutSessionRequest): Promise<ApiResponse<CheckoutSession>> {
    try {
      const sessionResponse = await this.getSession(sessionId);
      if (!sessionResponse.success) {
        return { success: false, error: 'Checkout session not found' };
      }

      const session = sessionResponse.data;
      const now = new Date().toISOString();

      // Recalculate totals if shipping method changed
      const shipping_cost = updates.shipping_method?.cost || session.shipping_cost;
      const totals = this.calculateTotals(session.cart_items, shipping_cost, session.tax_amount);

      const updatedSession: CheckoutSession = {
        ...session,
        ...updates,
        ...totals,
        shipping_cost,
        updated_at: now
      };

      // Update localStorage
      localStorage.setItem('checkout_session', JSON.stringify(updatedSession));

      return { success: true, data: updatedSession };
    } catch (error) {
      return handleApiError(error, 'Failed to update checkout session');
    }
  }

  async validateAddress(request: ValidateAddressRequest): Promise<ApiResponse<ValidateAddressResponse>> {
    try {
      // Mock address validation - in real implementation, this would call USPS or similar service
      const { address } = request;
      
      // Basic validation rules
      const errors: string[] = [];
      
      if (!address.street_address || address.street_address.trim().length < 5) {
        errors.push('Street address must be at least 5 characters');
      }
      
      if (!address.city || address.city.trim().length < 2) {
        errors.push('City is required');
      }
      
      if (!address.state || address.state.length !== 2) {
        errors.push('State must be a valid 2-letter code');
      }
      
      if (!address.postal_code || !/^\d{5}(-\d{4})?$/.test(address.postal_code)) {
        errors.push('Postal code must be in format 12345 or 12345-6789');
      }
      
      const is_valid = errors.length === 0;
      
      // Mock address correction for demo
      let corrected_address;
      if (is_valid && address.street_address.toLowerCase().includes('st')) {
        corrected_address = {
          ...address,
          id: uuidv4(),
          is_default: false,
          street_address: address.street_address.replace(/\bst\b/gi, 'Street')
        };
      }

      const response: ValidateAddressResponse = {
        is_valid,
        errors: errors.length > 0 ? errors : undefined,
        corrected_address
      };

      return { success: true, data: response };
    } catch (error) {
      return handleApiError(error, 'Failed to validate address');
    }
  }

  async calculateShipping(request: CalculateShippingRequest): Promise<ApiResponse<CalculateShippingResponse>> {
    try {
      const { shipping_address, cart_items } = request;
      
      // Calculate package weight and dimensions
      const totalWeight = cart_items.reduce((sum, item) => sum + (item.quantity * 0.1), 0); // Mock weight calculation
      const subtotal = cart_items.reduce((sum, item) => sum + item.total_price, 0);
      
      // Mock shipping methods - in real implementation, this would call shipping APIs
      const shipping_methods: ShippingMethod[] = [
        {
          id: 'standard',
          name: 'Standard Shipping',
          description: '5-7 business days',
          cost: subtotal > 100 ? 0 : 15,
          estimated_days: 6,
          carrier: 'USPS',
          is_available: true
        },
        {
          id: 'expedited',
          name: 'Expedited Shipping',
          description: '2-3 business days',
          cost: 25,
          estimated_days: 3,
          carrier: 'UPS',
          is_available: true
        },
        {
          id: 'overnight',
          name: 'Overnight Shipping',
          description: 'Next business day',
          cost: 45,
          estimated_days: 1,
          carrier: 'FedEx',
          is_available: totalWeight < 10 // Weight restriction for overnight
        }
      ];

      // Filter based on address (mock - some methods not available to certain areas)
      const available_methods = shipping_methods.filter(method => {
        if (method.id === 'overnight' && shipping_address.state === 'AK') {
          return false; // No overnight to Alaska
        }
        return method.is_available;
      });

      const response: CalculateShippingResponse = {
        shipping_methods: available_methods
      };

      return { success: true, data: response };
    } catch (error) {
      return handleApiError(error, 'Failed to calculate shipping');
    }
  }

  async calculateTax(request: CalculateTaxRequest): Promise<ApiResponse<CalculateTaxResponse>> {
    try {
      const { shipping_address, cart_items, shipping_cost } = request;
      
      // Mock tax calculation - in real implementation, this would call tax service API
      const subtotal = cart_items.reduce((sum, item) => sum + item.total_price, 0);
      const taxable_amount = subtotal + shipping_cost;
      
      // Mock tax rates by state
      const tax_rates: Record<string, number> = {
        'CA': 0.0875, // California
        'NY': 0.08,   // New York
        'TX': 0.0625, // Texas
        'FL': 0.06,   // Florida
        'WA': 0.065,  // Washington
        'OR': 0.0,    // Oregon (no sales tax)
        'MT': 0.0,    // Montana (no sales tax)
        'NH': 0.0,    // New Hampshire (no sales tax)
        'DE': 0.0     // Delaware (no sales tax)
      };
      
      const state_rate = tax_rates[shipping_address.state] || 0.05; // Default 5%
      const local_rate = state_rate > 0 ? 0.01 : 0; // Mock local tax
      const county_rate = state_rate > 0 ? 0.005 : 0; // Mock county tax
      
      const total_rate = state_rate + local_rate + county_rate;
      const total_tax_amount = Math.round(taxable_amount * total_rate * 100) / 100;
      
      const tax_calculation: TaxCalculation = {
        rate: total_rate,
        amount: total_tax_amount,
        breakdown: {
          state_tax: Math.round(taxable_amount * state_rate * 100) / 100,
          local_tax: Math.round(taxable_amount * local_rate * 100) / 100,
          county_tax: Math.round(taxable_amount * county_rate * 100) / 100
        }
      };

      const response: CalculateTaxResponse = {
        tax_calculation,
        total_tax_amount
      };

      return { success: true, data: response };
    } catch (error) {
      return handleApiError(error, 'Failed to calculate tax');
    }
  }

  async createOrder(sessionId: string): Promise<ApiResponse<OrderCreationData>> {
    try {
      const sessionResponse = await this.getSession(sessionId);
      if (!sessionResponse.success) {
        return { success: false, error: 'Checkout session not found' };
      }

      const session = sessionResponse.data;
      
      if (!session.shipping_address || !session.billing_address || !session.payment_method) {
        return { success: false, error: 'Incomplete checkout session' };
      }

      const now = new Date().toISOString();
      const reference_number = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      const order_jobs = session.cart_items.map(item => ({
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        configuration: item.configuration,
        configuration_display: item.configuration_display,
        status: 'pending' as const,
        estimated_completion_date: undefined
      }));

      const order: OrderCreationData = {
        user_id: session.user_id,
        session_id: session.session_id,
        reference_number,
        status: 'pending_payment',
        subtotal: session.subtotal,
        tax_amount: session.tax_amount,
        shipping_cost: session.shipping_cost,
        discount_amount: session.discount_amount,
        total_amount: session.total_amount,
        shipping_address: session.shipping_address,
        billing_address: session.billing_address,
        payment_method: session.payment_method.type,
        payment_status: 'pending',
        order_jobs
      };

      // In a real implementation, this would save to the database
      // For now, we'll store in localStorage
      localStorage.setItem(`order_${reference_number}`, JSON.stringify(order));

      return { success: true, data: order };
    } catch (error) {
      return handleApiError(error, 'Failed to create order');
    }
  }

  async validateSession(sessionId: string): Promise<ApiResponse<{ is_valid: boolean; errors: string[] }>> {
    try {
      const sessionResponse = await this.getSession(sessionId);
      if (!sessionResponse.success) {
        return { success: false, error: 'Checkout session not found' };
      }

      const session = sessionResponse.data;
      const errors: string[] = [];

      // Check if session is expired
      if (new Date(session.expires_at) < new Date()) {
        errors.push('Checkout session has expired');
      }

      // Validate cart items are still available and pricing is current
      if (session.cart_items.length === 0) {
        errors.push('Cart is empty');
      }

      // Validate addresses if they exist
      if (session.shipping_address) {
        const addressValidation = await this.validateAddress({ 
          address: session.shipping_address 
        });
        if (addressValidation.success && !addressValidation.data.is_valid) {
          errors.push('Shipping address is invalid');
        }
      }

      // Validate shipping method is still available
      if (session.shipping_method && session.shipping_address) {
        const shippingResponse = await this.calculateShipping({
          shipping_address: session.shipping_address,
          cart_items: session.cart_items
        });
        
        if (shippingResponse.success) {
          const available = shippingResponse.data.shipping_methods.find(
            method => method.id === session.shipping_method?.id
          );
          if (!available) {
            errors.push('Selected shipping method is no longer available');
          }
        }
      }

      const result = {
        is_valid: errors.length === 0,
        errors
      };

      return { success: true, data: result };
    } catch (error) {
      return handleApiError(error, 'Failed to validate checkout session');
    }
  }

  async clearSession(sessionId: string): Promise<ApiResponse<void>> {
    try {
      localStorage.removeItem('checkout_session');
      localStorage.removeItem('checkout_session_id');
      return { success: true };
    } catch (error) {
      return handleApiError(error, 'Failed to clear checkout session');
    }
  }
}

export const checkoutApi = new CheckoutApi();