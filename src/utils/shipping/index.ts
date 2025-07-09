import { USPSAddressValidationService } from './addressValidation';
import { ShippingCalculator } from './shippingCalculator';
import { api, API_TIMEOUTS } from '@/lib/api-client';
import type { Address } from '@/types/auth';
import type { CartItem } from '@/types/cart';
import type { 
  ShippingMethod, 
  ValidateAddressResponse, 
  CalculateShippingResponse,
  TaxCalculation
} from '@/types/checkout';

export class ShippingService {
  private addressValidator: USPSAddressValidationService;
  private shippingCalculator: ShippingCalculator;

  constructor() {
    this.addressValidator = new USPSAddressValidationService();
    this.shippingCalculator = new ShippingCalculator();
  }

  // Address validation methods
  async validateAddress(address: Omit<Address, 'id' | 'is_default'>): Promise<ValidateAddressResponse> {
    return this.addressValidator.validateAddress(address);
  }

  async suggestAddresses(partialAddress: string): Promise<Address[]> {
    return this.addressValidator.suggestAddresses(partialAddress);
  }

  async normalizeAddress(address: Omit<Address, 'id' | 'is_default'>): Promise<Address> {
    return this.addressValidator.normalizeAddress(address);
  }

  // Shipping calculation methods
  async calculateShipping(
    shipping_address: Address, 
    cart_items: CartItem[]
  ): Promise<CalculateShippingResponse> {
    return this.shippingCalculator.calculateShipping({
      shipping_address,
      cart_items
    });
  }

  async getAvailableShippingMethods(address: Address): Promise<ShippingMethod[]> {
    return this.shippingCalculator.getAvailableShippingMethods(address);
  }

  estimateDeliveryDate(shippingMethod: ShippingMethod): Date {
    return this.shippingCalculator.estimateDeliveryDate(shippingMethod);
  }

  // Tax calculation
  async calculateTax(
    shipping_address: Address,
    cart_items: CartItem[],
    shipping_cost: number
  ): Promise<{ tax_calculation: TaxCalculation; total_tax_amount: number }> {
    try {
      // For demo purposes, use simplified tax calculation
      if (this.isTestMode()) {
        return this.simulateTaxCalculation(shipping_address, cart_items, shipping_cost);
      }

      // Real tax API call would go here
      const response = await api.post('/api/shipping/calculate-tax', {
        shipping_address,
        cart_items,
        shipping_cost
      }, {
        timeout: API_TIMEOUTS.STANDARD
      });

      return await response.json();
    } catch (error) {
      // Tax calculation error handled by API client
      // Fallback to demo calculation
      return this.simulateTaxCalculation(shipping_address, cart_items, shipping_cost);
    }
  }

  private simulateTaxCalculation(
    shipping_address: Address,
    cart_items: CartItem[],
    shipping_cost: number
  ): { tax_calculation: TaxCalculation; total_tax_amount: number } {
    // Get tax rate by state
    const stateTaxRates: Record<string, number> = {
      'AL': 4.0, 'AK': 0.0, 'AZ': 5.6, 'AR': 6.5, 'CA': 7.25, 'CO': 2.9,
      'CT': 6.35, 'DE': 0.0, 'FL': 6.0, 'GA': 4.0, 'HI': 4.0, 'ID': 6.0,
      'IL': 6.25, 'IN': 7.0, 'IA': 6.0, 'KS': 6.5, 'KY': 6.0, 'LA': 4.45,
      'ME': 5.5, 'MD': 6.0, 'MA': 6.25, 'MI': 6.0, 'MN': 6.875, 'MS': 7.0,
      'MO': 4.225, 'MT': 0.0, 'NE': 5.5, 'NV': 6.85, 'NH': 0.0, 'NJ': 6.625,
      'NM': 5.125, 'NY': 4.0, 'NC': 4.75, 'ND': 5.0, 'OH': 5.75, 'OK': 4.5,
      'OR': 0.0, 'PA': 6.0, 'RI': 7.0, 'SC': 6.0, 'SD': 4.5, 'TN': 7.0,
      'TX': 6.25, 'UT': 5.95, 'VT': 6.0, 'VA': 5.3, 'WA': 6.5, 'WV': 6.0,
      'WI': 5.0, 'WY': 4.0
    };

    const state_tax_rate = stateTaxRates[shipping_address.state] || 0;
    const local_tax_rate = state_tax_rate > 0 ? Math.random() * 2 : 0; // Random local tax 0-2%
    const county_tax_rate = state_tax_rate > 0 ? Math.random() * 1 : 0; // Random county tax 0-1%

    const total_rate = state_tax_rate + local_tax_rate + county_tax_rate;

    // Calculate subtotal
    const subtotal = cart_items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Tax usually doesn't apply to shipping in most states
    const taxable_amount = subtotal;
    
    const state_tax = (taxable_amount * state_tax_rate) / 100;
    const local_tax = (taxable_amount * local_tax_rate) / 100;
    const county_tax = (taxable_amount * county_tax_rate) / 100;
    
    const total_tax_amount = state_tax + local_tax + county_tax;

    const tax_calculation: TaxCalculation = {
      rate: total_rate,
      amount: total_tax_amount,
      breakdown: {
        state_tax: state_tax,
        local_tax: local_tax,
        county_tax: county_tax
      }
    };

    return {
      tax_calculation,
      total_tax_amount: Math.round(total_tax_amount * 100) / 100
    };
  }

  // Utility methods
  isValidZipCode(zipCode: string): boolean {
    const zipRegex = /^\d{5}(-\d{4})?$/;
    return zipRegex.test(zipCode);
  }

  isValidState(state: string): boolean {
    const validStates = [
      'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
      'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
      'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
      'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
      'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
    ];
    return validStates.includes(state.toUpperCase());
  }

  formatShippingCost(cost: number): string {
    if (cost === 0) return 'FREE';
    return `$${cost.toFixed(2)}`;
  }

  formatDeliveryDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  private isTestMode(): boolean {
    return process.env.NODE_ENV === 'development' || 
           window.location.hostname === 'localhost';
  }

  // Static helper methods
  static getStatesList(): Array<{ code: string; name: string }> {
    return [
      { code: 'AL', name: 'Alabama' },
      { code: 'AK', name: 'Alaska' },
      { code: 'AZ', name: 'Arizona' },
      { code: 'AR', name: 'Arkansas' },
      { code: 'CA', name: 'California' },
      { code: 'CO', name: 'Colorado' },
      { code: 'CT', name: 'Connecticut' },
      { code: 'DE', name: 'Delaware' },
      { code: 'FL', name: 'Florida' },
      { code: 'GA', name: 'Georgia' },
      { code: 'HI', name: 'Hawaii' },
      { code: 'ID', name: 'Idaho' },
      { code: 'IL', name: 'Illinois' },
      { code: 'IN', name: 'Indiana' },
      { code: 'IA', name: 'Iowa' },
      { code: 'KS', name: 'Kansas' },
      { code: 'KY', name: 'Kentucky' },
      { code: 'LA', name: 'Louisiana' },
      { code: 'ME', name: 'Maine' },
      { code: 'MD', name: 'Maryland' },
      { code: 'MA', name: 'Massachusetts' },
      { code: 'MI', name: 'Michigan' },
      { code: 'MN', name: 'Minnesota' },
      { code: 'MS', name: 'Mississippi' },
      { code: 'MO', name: 'Missouri' },
      { code: 'MT', name: 'Montana' },
      { code: 'NE', name: 'Nebraska' },
      { code: 'NV', name: 'Nevada' },
      { code: 'NH', name: 'New Hampshire' },
      { code: 'NJ', name: 'New Jersey' },
      { code: 'NM', name: 'New Mexico' },
      { code: 'NY', name: 'New York' },
      { code: 'NC', name: 'North Carolina' },
      { code: 'ND', name: 'North Dakota' },
      { code: 'OH', name: 'Ohio' },
      { code: 'OK', name: 'Oklahoma' },
      { code: 'OR', name: 'Oregon' },
      { code: 'PA', name: 'Pennsylvania' },
      { code: 'RI', name: 'Rhode Island' },
      { code: 'SC', name: 'South Carolina' },
      { code: 'SD', name: 'South Dakota' },
      { code: 'TN', name: 'Tennessee' },
      { code: 'TX', name: 'Texas' },
      { code: 'UT', name: 'Utah' },
      { code: 'VT', name: 'Vermont' },
      { code: 'VA', name: 'Virginia' },
      { code: 'WA', name: 'Washington' },
      { code: 'WV', name: 'West Virginia' },
      { code: 'WI', name: 'Wisconsin' },
      { code: 'WY', name: 'Wyoming' }
    ];
  }
}

// Export individual services
export { USPSAddressValidationService } from './addressValidation';
export { ShippingCalculator } from './shippingCalculator';

// Create default shipping service instance
export const createShippingService = () => {
  return new ShippingService();
};