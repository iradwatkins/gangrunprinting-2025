import { ApiResponse, handleApiError } from '@/lib/errors';
import type {
  PaymentRequest,
  PaymentResponse,
  SquarePaymentRequest,
  PayPalPaymentRequest,
  CashAppPaymentRequest,
  RefundRequest,
  RefundResponse,
  PaymentGateway,
  SavedPaymentMethod,
  CreateSavedPaymentMethodRequest,
  PaymentMethodValidation
} from '@/types/payments';

class PaymentsApi {
  private getGatewayConfig(): Record<string, PaymentGateway> {
    // In real implementation, this would come from environment variables or API
    return {
      square: {
        id: 'square',
        name: 'Square',
        type: 'square',
        is_enabled: true,
        is_test_mode: true,
        config: {
          square: {
            application_id: process.env.REACT_APP_SQUARE_APPLICATION_ID || 'sandbox-sq0idb-demo',
            location_id: process.env.REACT_APP_SQUARE_LOCATION_ID || 'sandbox-location-demo',
            sandbox_application_id: 'sandbox-sq0idb-demo',
            sandbox_location_id: 'sandbox-location-demo'
          }
        }
      },
      paypal: {
        id: 'paypal',
        name: 'PayPal',
        type: 'paypal',
        is_enabled: true,
        is_test_mode: true,
        config: {
          paypal: {
            client_id: process.env.REACT_APP_PAYPAL_CLIENT_ID || 'demo-paypal-client-id',
            client_secret: process.env.REACT_APP_PAYPAL_CLIENT_SECRET || 'demo-paypal-secret',
            sandbox_client_id: 'demo-paypal-client-id',
            sandbox_client_secret: 'demo-paypal-secret'
          }
        }
      },
      cashapp: {
        id: 'cashapp',
        name: 'Cash App Pay',
        type: 'cashapp',
        is_enabled: true,
        is_test_mode: true,
        config: {
          cashapp: {
            client_id: process.env.REACT_APP_CASHAPP_CLIENT_ID || 'demo-cashapp-client-id',
            client_secret: process.env.REACT_APP_CASHAPP_CLIENT_SECRET || 'demo-cashapp-secret',
            sandbox_client_id: 'demo-cashapp-client-id',
            sandbox_client_secret: 'demo-cashapp-secret'
          }
        }
      }
    };
  }

  async getAvailableGateways(): Promise<ApiResponse<PaymentGateway[]>> {
    try {
      const gateways = Object.values(this.getGatewayConfig())
        .filter(gateway => gateway.is_enabled);
      
      return { success: true, data: gateways };
    } catch (error) {
      return handleApiError(error, 'Failed to get payment gateways');
    }
  }

  async processSquarePayment(request: SquarePaymentRequest): Promise<ApiResponse<PaymentResponse>> {
    try {
      // Mock Square payment processing
      // In real implementation, this would use Square's Payments API
      const response = await this.mockPaymentProcessing({
        ...request,
        gateway: 'square'
      });

      return { success: true, data: response };
    } catch (error) {
      return handleApiError(error, 'Square payment processing failed');
    }
  }

  async processPayPalPayment(request: PayPalPaymentRequest): Promise<ApiResponse<PaymentResponse>> {
    try {
      // Mock PayPal payment processing
      // In real implementation, this would use PayPal's REST API
      const response = await this.mockPaymentProcessing({
        ...request,
        gateway: 'paypal'
      });

      return { success: true, data: response };
    } catch (error) {
      return handleApiError(error, 'PayPal payment processing failed');
    }
  }

  async processCashAppPayment(request: CashAppPaymentRequest): Promise<ApiResponse<PaymentResponse>> {
    try {
      // Mock Cash App payment processing
      // In real implementation, this would use Cash App Pay API
      const response = await this.mockPaymentProcessing({
        ...request,
        gateway: 'cashapp'
      });

      return { success: true, data: response };
    } catch (error) {
      return handleApiError(error, 'Cash App payment processing failed');
    }
  }

  private async mockPaymentProcessing(request: PaymentRequest & { gateway: string }): Promise<PaymentResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

    const success_rate = 0.85; // 85% success rate for demo
    const is_successful = Math.random() < success_rate;

    const payment_id = `${request.gateway}_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
    const transaction_id = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    if (is_successful) {
      return {
        success: true,
        payment_id,
        transaction_id,
        status: 'completed',
        amount_charged: request.amount,
        receipt_url: `https://receipts.demo.com/${payment_id}`,
        created_at: new Date().toISOString()
      };
    } else {
      // Simulate different types of payment failures
      const error_types = [
        { code: 'CARD_DECLINED', message: 'Your card was declined. Please try a different payment method.' },
        { code: 'INSUFFICIENT_FUNDS', message: 'Insufficient funds. Please try a different payment method.' },
        { code: 'EXPIRED_CARD', message: 'Your card has expired. Please use a different card.' },
        { code: 'INVALID_CVV', message: 'Invalid security code. Please check your CVV and try again.' },
        { code: 'PROCESSING_ERROR', message: 'Payment processing error. Please try again.' }
      ];

      const error = error_types[Math.floor(Math.random() * error_types.length)];

      return {
        success: false,
        payment_id,
        status: 'failed',
        amount_charged: 0,
        error: {
          code: error.code,
          message: error.message,
          category: 'payment_method'
        },
        created_at: new Date().toISOString()
      };
    }
  }

  async refundPayment(request: RefundRequest): Promise<ApiResponse<RefundResponse>> {
    try {
      // Mock refund processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      const refund_id = `ref_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;

      // Get the original payment amount (mock)
      const original_amount = request.amount || 100; // Mock original amount
      const refund_amount = request.amount || original_amount;

      const response: RefundResponse = {
        success: true,
        refund_id,
        payment_id: request.payment_id,
        amount_refunded: refund_amount,
        status: 'completed',
        created_at: new Date().toISOString()
      };

      return { success: true, data: response };
    } catch (error) {
      return handleApiError(error, 'Payment refund failed');
    }
  }

  async validatePaymentMethod(type: 'card', data: any): Promise<ApiResponse<PaymentMethodValidation>> {
    try {
      // Mock payment method validation
      const errors: string[] = [];
      const warnings: string[] = [];

      if (type === 'card') {
        const { card_number, exp_month, exp_year, cvv } = data;

        // Basic card number validation (Luhn algorithm simulation)
        if (!card_number || card_number.length < 13 || card_number.length > 19) {
          errors.push('Invalid card number length');
        }

        // Expiration date validation
        const now = new Date();
        const current_year = now.getFullYear();
        const current_month = now.getMonth() + 1;

        if (!exp_year || exp_year < current_year || (exp_year === current_year && exp_month < current_month)) {
          errors.push('Card has expired');
        }

        // CVV validation
        if (!cvv || cvv.length < 3 || cvv.length > 4) {
          errors.push('Invalid security code');
        }

        // Mock card type detection
        let card_type: 'visa' | 'mastercard' | 'amex' | 'discover' | 'unknown' = 'unknown';
        if (card_number) {
          const first_digit = card_number.charAt(0);
          if (first_digit === '4') card_type = 'visa';
          else if (first_digit === '5') card_type = 'mastercard';
          else if (first_digit === '3') card_type = 'amex';
          else if (first_digit === '6') card_type = 'discover';
        }

        const validation: PaymentMethodValidation & { card_type?: typeof card_type } = {
          is_valid: errors.length === 0,
          errors,
          warnings,
          card_type
        };

        return { success: true, data: validation };
      }

      return { success: false, error: 'Unsupported payment method type' };
    } catch (error) {
      return handleApiError(error, 'Payment method validation failed');
    }
  }

  async getSavedPaymentMethods(userId: string): Promise<ApiResponse<SavedPaymentMethod[]>> {
    try {
      // Mock saved payment methods
      const saved_methods: SavedPaymentMethod[] = [
        {
          id: 'pm_1',
          user_id: userId,
          type: 'card',
          last_four: '4242',
          brand: 'visa',
          exp_month: 12,
          exp_year: 2025,
          billing_name: 'John Doe',
          billing_address: {
            line1: '123 Main St',
            city: 'Anytown',
            state: 'CA',
            postal_code: '12345',
            country: 'US'
          },
          is_default: true,
          gateway_id: 'square',
          gateway_customer_id: 'cust_123',
          gateway_payment_method_id: 'pm_square_123',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ];

      return { success: true, data: saved_methods };
    } catch (error) {
      return handleApiError(error, 'Failed to get saved payment methods');
    }
  }

  async createSavedPaymentMethod(request: CreateSavedPaymentMethodRequest): Promise<ApiResponse<SavedPaymentMethod>> {
    try {
      // Mock creating saved payment method
      await new Promise(resolve => setTimeout(resolve, 500));

      const saved_method: SavedPaymentMethod = {
        id: `pm_${Date.now()}`,
        user_id: 'current_user_id', // Would get from auth context
        type: 'card',
        last_four: '1234', // Would extract from token
        brand: 'visa', // Would detect from token
        exp_month: 12, // Would extract from token
        exp_year: 2025, // Would extract from token
        billing_name: request.billing_name,
        billing_address: request.billing_address,
        is_default: request.is_default || false,
        gateway_id: request.gateway,
        gateway_customer_id: `cust_${Date.now()}`,
        gateway_payment_method_id: `pm_${request.gateway}_${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return { success: true, data: saved_method };
    } catch (error) {
      return handleApiError(error, 'Failed to save payment method');
    }
  }

  async deleteSavedPaymentMethod(paymentMethodId: string): Promise<ApiResponse<void>> {
    try {
      // Mock deletion
      await new Promise(resolve => setTimeout(resolve, 300));
      return { success: true };
    } catch (error) {
      return handleApiError(error, 'Failed to delete payment method');
    }
  }

  async getPaymentStatus(paymentId: string): Promise<ApiResponse<PaymentResponse>> {
    try {
      // Mock payment status check
      await new Promise(resolve => setTimeout(resolve, 200));

      const payment: PaymentResponse = {
        success: true,
        payment_id: paymentId,
        transaction_id: `txn_${paymentId}`,
        status: 'completed',
        amount_charged: 99.99,
        receipt_url: `https://receipts.demo.com/${paymentId}`,
        created_at: new Date().toISOString()
      };

      return { success: true, data: payment };
    } catch (error) {
      return handleApiError(error, 'Failed to get payment status');
    }
  }
}

export const paymentsApi = new PaymentsApi();