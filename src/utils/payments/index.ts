import { SquarePaymentService } from './square';
import { PayPalPaymentService } from './paypal';
import { CashAppPaymentService } from './cashapp';
import type { PaymentGateway, PaymentRequest, PaymentResponse } from '@/types/payments';

export class PaymentManager {
  private services: Map<string, any> = new Map();
  private gateways: PaymentGateway[] = [];

  constructor(gateways: PaymentGateway[]) {
    this.gateways = gateways;
    this.initializeServices();
  }

  private initializeServices() {
    this.gateways.forEach(gateway => {
      if (!gateway.is_enabled) return;

      switch (gateway.type) {
        case 'square':
          if (gateway.config.square) {
            const service = new SquarePaymentService(
              gateway.config.square.application_id,
              gateway.config.square.location_id
            );
            this.services.set('square', service);
          }
          break;

        case 'paypal':
          if (gateway.config.paypal) {
            const service = new PayPalPaymentService(
              gateway.config.paypal.client_id,
              gateway.is_test_mode
            );
            this.services.set('paypal', service);
          }
          break;

        case 'cashapp':
          if (gateway.config.cashapp) {
            const service = new CashAppPaymentService(
              gateway.config.cashapp.client_id,
              gateway.is_test_mode
            );
            this.services.set('cashapp', service);
          }
          break;
      }
    });
  }

  getService(type: 'square' | 'paypal' | 'cashapp') {
    return this.services.get(type);
  }

  getEnabledGateways(): PaymentGateway[] {
    return this.gateways.filter(gateway => gateway.is_enabled);
  }

  async processPayment(
    gatewayType: 'square' | 'paypal' | 'cashapp',
    request: PaymentRequest
  ): Promise<PaymentResponse> {
    const service = this.getService(gatewayType);
    if (!service) {
      throw new Error(`Payment gateway ${gatewayType} is not available`);
    }

    return await service.processPayment(request);
  }

  async initializeGateway(type: 'square' | 'paypal' | 'cashapp'): Promise<void> {
    const service = this.getService(type);
    if (!service) {
      throw new Error(`Payment gateway ${type} is not available`);
    }

    await service.initialize();
  }

  isGatewayEnabled(type: 'square' | 'paypal' | 'cashapp'): boolean {
    return this.services.has(type);
  }

  getDefaultGateway(): PaymentGateway | null {
    const enabled = this.getEnabledGateways();
    return enabled.length > 0 ? enabled[0] : null;
  }

  // Security and validation helpers
  static validateAmount(amount: number): boolean {
    return amount > 0 && amount <= 999999.99;
  }

  static sanitizePaymentData(data: any): any {
    // Remove sensitive data that shouldn't be logged
    const sanitized = { ...data };
    delete sanitized.card_number;
    delete sanitized.cvv;
    delete sanitized.client_secret;
    return sanitized;
  }

  static generatePaymentReference(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `PAY_${timestamp}_${random}`.toUpperCase();
  }
}

// Hook for using payment manager in React components
export const usePaymentManager = (gateways: PaymentGateway[]) => {
  const manager = new PaymentManager(gateways);
  
  return {
    manager,
    processPayment: manager.processPayment.bind(manager),
    getEnabledGateways: manager.getEnabledGateways.bind(manager),
    isGatewayEnabled: manager.isGatewayEnabled.bind(manager),
    initializeGateway: manager.initializeGateway.bind(manager),
    getDefaultGateway: manager.getDefaultGateway.bind(manager)
  };
};

// Export individual services
export { SquarePaymentService } from './square';
export { PayPalPaymentService } from './paypal';
export { CashAppPaymentService } from './cashapp';