import type { CashAppPaymentRequest, PaymentResponse } from '@/types/payments';

declare global {
  interface Window {
    CashApp?: {
      Pay: {
        render: (options: any) => Promise<any>;
        configure: (config: any) => void;
      };
    };
  }
}

export class CashAppPaymentService {
  private clientId: string;
  private isTestMode: boolean;
  private isInitialized = false;

  constructor(clientId: string, isTestMode = true) {
    this.clientId = clientId;
    this.isTestMode = isTestMode;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    await this.loadCashAppSDK();
    
    if (!window.CashApp) {
      throw new Error('Cash App Pay SDK failed to load');
    }

    // Configure Cash App Pay
    window.CashApp.Pay.configure({
      applicationId: this.clientId,
      environment: this.isTestMode ? 'sandbox' : 'production'
    });

    this.isInitialized = true;
  }

  private async loadCashAppSDK(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.CashApp) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = this.isTestMode 
        ? 'https://sandbox.cash.app/pay/sdk/web/pay-button.js'
        : 'https://cash.app/pay/sdk/web/pay-button.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Cash App Pay SDK'));
      document.head.appendChild(script);
    });
  }

  async createPayButton(containerId: string, options: {
    amount: number;
    currency?: string;
    onSuccess: (data: any) => Promise<void>;
    onError?: (error: any) => void;
    onCancel?: () => void;
  }): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const payButton = await window.CashApp!.Pay.render({
      applicationId: this.clientId,
      amount: options.amount,
      currency: options.currency || 'USD',
      onSuccess: options.onSuccess,
      onError: options.onError || ((error: any) => {
        console.error('Cash App Pay error:', error);
      }),
      onCancel: options.onCancel || (() => {
        console.log('Cash App Pay cancelled');
      })
    });

    // Mount the button to the container
    const container = document.getElementById(containerId);
    if (container) {
      container.appendChild(payButton);
    }
  }

  async processPayment(request: CashAppPaymentRequest): Promise<PaymentResponse> {
    try {
      // This would normally make a secure server-side call
      const response = await fetch('/api/payments/cashapp/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Cash App payment processing failed');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Cash App payment processing error:', error);
      throw new Error('Payment failed to process');
    }
  }

  async createPaymentRequest(amount: number, currency = 'USD'): Promise<any> {
    try {
      const response = await fetch('/api/payments/cashapp/create-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          applicationId: this.clientId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create Cash App payment request');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating Cash App payment request:', error);
      throw new Error('Payment request creation failed');
    }
  }

  static getTestCredentials() {
    return {
      sandbox_client_id: 'CA_sandbox_demo_client_id_12345',
      sandbox_client_secret: 'CA_sandbox_demo_secret_67890'
    };
  }

  static isTestMode(): boolean {
    return process.env.NODE_ENV === 'development' || 
           window.location.hostname === 'localhost';
  }
}

export const createCashAppPaymentService = (clientId: string, isTestMode = true) => {
  return new CashAppPaymentService(clientId, isTestMode);
};