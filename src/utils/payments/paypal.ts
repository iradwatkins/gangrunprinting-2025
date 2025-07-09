import type { PayPalPaymentRequest, PaymentResponse } from '@/types/payments';
import { api, API_TIMEOUTS } from '@/lib/api-client';

declare global {
  interface Window {
    paypal?: {
      Buttons: (options: any) => {
        render: (selector: string) => Promise<void>;
      };
      FUNDING: {
        PAYPAL: string;
        CREDIT: string;
        CARD: string;
      };
    };
  }
}

export class PayPalPaymentService {
  private clientId: string;
  private isTestMode: boolean;
  private isInitialized = false;

  constructor(clientId: string, isTestMode = true) {
    this.clientId = clientId;
    this.isTestMode = isTestMode;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    await this.loadPayPalSDK();
    
    if (!window.paypal) {
      throw new Error('PayPal SDK failed to load');
    }

    this.isInitialized = true;
  }

  private async loadPayPalSDK(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.paypal) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      const environment = this.isTestMode ? 'sandbox' : '';
      script.src = `https://www.paypal.com/sdk/js?client-id=${this.clientId}&currency=USD&intent=capture&environment=${environment}`;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load PayPal SDK'));
      document.head.appendChild(script);
    });
  }

  async createPayPalButton(containerId: string, options: {
    amount: string;
    currency?: string;
    onApprove: (data: any, actions: any) => Promise<void>;
    onError?: (error: any) => void;
    onCancel?: (data: any) => void;
  }): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const paypalButtons = window.paypal!.Buttons({
      createOrder: async (data: any, actions: any) => {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: options.amount,
              currency_code: options.currency || 'USD'
            }
          }]
        });
      },
      onApprove: options.onApprove,
      onError: options.onError || ((error: any) => {
        // PayPal payment error
      }),
      onCancel: options.onCancel || ((data: any) => {
        // PayPal payment cancelled
      })
    });

    await paypalButtons.render(`#${containerId}`);
  }

  async processPayment(request: PayPalPaymentRequest): Promise<PaymentResponse> {
    try {
      // This would normally make a secure server-side call
      const response = await api.post('/api/payments/paypal/process', request, {
        timeout: API_TIMEOUTS.STANDARD
      });

      const result = await response.json();
      return result;
    } catch (error) {
      throw new Error('Payment failed to process');
    }
  }

  async capturePayment(orderId: string): Promise<any> {
    try {
      const response = await api.post('/api/payments/paypal/capture', { orderId }, {
        timeout: API_TIMEOUTS.STANDARD
      });

      return await response.json();
    } catch (error) {
      throw new Error('Payment capture failed');
    }
  }

  static getTestCredentials() {
    return {
      sandbox_client_id: 'Aa4H8CaP_0L6OVUQe4YSBfKnBp6ZMWXl1d-8I_KVTjzAXDO8M5Z8hCr8YjkGEGFQ6XvN8QqgJyLQu8Lg',
      sandbox_client_secret: 'EKfSR9QQUjv5T4k1Tbn3FvGt8A8TvE7tT2R9QU8k7hF7c8C5A8Q4K4FzT8T6fTkL'
    };
  }

  static isTestMode(): boolean {
    return process.env.NODE_ENV === 'development' || 
           window.location.hostname === 'localhost';
  }
}

export const createPayPalPaymentService = (clientId: string, isTestMode = true) => {
  return new PayPalPaymentService(clientId, isTestMode);
};