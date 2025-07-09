import type { SquarePaymentRequest, PaymentResponse } from '@/types/payments';
import { api, API_TIMEOUTS } from '@/lib/api-client';

declare global {
  interface Window {
    Square?: {
      payments: (applicationId: string, locationId: string) => {
        card: () => Promise<any>;
        paymentRequest: (options: any) => Promise<any>;
      };
    };
  }
}

export class SquarePaymentService {
  private applicationId: string;
  private locationId: string;
  private isInitialized = false;
  private payments: any;

  constructor(applicationId: string, locationId: string) {
    this.applicationId = applicationId;
    this.locationId = locationId;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Load Square Web Payments SDK
    await this.loadSquareSDK();
    
    if (!window.Square) {
      throw new Error('Square Web Payments SDK failed to load');
    }

    this.payments = window.Square.payments(this.applicationId, this.locationId);
    this.isInitialized = true;
  }

  private async loadSquareSDK(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.Square) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://sandbox.web.squarecdn.com/v1/square.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Square SDK'));
      document.head.appendChild(script);
    });
  }

  async createCardPaymentMethod(): Promise<any> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const card = await this.payments.card();
      return card;
    } catch (error) {
      throw new Error('Failed to create card payment method');
    }
  }

  async tokenizeCard(card: any): Promise<{ token: string; details: any }> {
    try {
      const tokenResult = await card.tokenize();
      
      if (tokenResult.status === 'OK') {
        return {
          token: tokenResult.token,
          details: tokenResult.details
        };
      } else {
        throw new Error(tokenResult.errors?.[0]?.message || 'Tokenization failed');
      }
    } catch (error) {
      throw new Error('Card tokenization failed');
    }
  }

  async processPayment(request: SquarePaymentRequest): Promise<PaymentResponse> {
    try {
      // This would normally make a secure server-side call
      // For demo purposes, we'll simulate the response
      const response = await api.post('/api/payments/square/process', request, {
        timeout: API_TIMEOUTS.STANDARD
      });

      const result = await response.json();
      return result;
    } catch (error) {
      throw new Error('Payment failed to process');
    }
  }

  async createVerificationDetails(card: any, billingContact: any): Promise<any> {
    try {
      const verificationDetails = {
        billingContact,
        intent: 'CHARGE'
      };

      const verificationResult = await card.verifyBuyer(verificationDetails);
      return verificationResult;
    } catch (error) {
      throw new Error('Card verification failed');
    }
  }

  // Demo/test helper methods
  static getTestCardNumbers() {
    return {
      visa: '4111 1111 1111 1111',
      mastercard: '5555 5555 5555 4444',
      amex: '3782 822463 10005',
      discover: '6011 1111 1111 1117',
      declined: '4000 0000 0000 0002'
    };
  }

  static isTestMode(): boolean {
    return process.env.NODE_ENV === 'development' || 
           window.location.hostname === 'localhost';
  }
}

export const createSquarePaymentService = (applicationId: string, locationId: string) => {
  return new SquarePaymentService(applicationId, locationId);
};