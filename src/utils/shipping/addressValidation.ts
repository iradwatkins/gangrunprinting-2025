import type { Address } from '@/types/auth';
import type { ValidateAddressRequest, ValidateAddressResponse } from '@/types/checkout';
import { api, API_TIMEOUTS } from '@/lib/api-client';

export interface AddressValidationService {
  validateAddress(address: Omit<Address, 'id' | 'is_default'>): Promise<ValidateAddressResponse>;
  suggestAddresses(partialAddress: string): Promise<Address[]>;
  normalizeAddress(address: Omit<Address, 'id' | 'is_default'>): Promise<Address>;
}

export class USPSAddressValidationService implements AddressValidationService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.REACT_APP_USPS_API_KEY || 'demo-key';
    this.baseUrl = 'https://secure.shippingapis.com/ShippingAPI.dll';
  }

  async validateAddress(address: Omit<Address, 'id' | 'is_default'>): Promise<ValidateAddressResponse> {
    try {
      // For demo purposes, simulate validation
      if (this.isTestMode()) {
        return this.simulateValidation(address);
      }

      // Real USPS API call would go here
      const response = await api.post('/api/shipping/validate-address', { address }, {
        timeout: API_TIMEOUTS.STANDARD,
        skipToast: true // Don't show toast for validation errors
      });

      return await response.json();
    } catch (error) {
      // Address validation error handled silently
      return {
        is_valid: false,
        errors: ['Unable to validate address at this time']
      };
    }
  }

  async suggestAddresses(partialAddress: string): Promise<Address[]> {
    try {
      // For demo purposes, return mock suggestions
      if (this.isTestMode()) {
        return this.getMockSuggestions(partialAddress);
      }

      const response = await api.post('/api/shipping/suggest-addresses', { query: partialAddress }, {
        timeout: API_TIMEOUTS.QUICK,
        skipToast: true // Don't show toast for suggestion errors
      });

      return await response.json();
    } catch (error) {
      // Address suggestion error handled silently
      return [];
    }
  }

  async normalizeAddress(address: Omit<Address, 'id' | 'is_default'>): Promise<Address> {
    const validation = await this.validateAddress(address);
    
    if (validation.corrected_address) {
      return validation.corrected_address;
    }

    // Return original address with normalized formatting
    return {
      ...address,
      id: crypto.randomUUID(),
      street_address: this.normalizeStreetAddress(address.street_address),
      city: this.normalizeCity(address.city),
      state: this.normalizeState(address.state),
      postal_code: this.normalizeZipCode(address.postal_code),
      is_default: false
    };
  }

  private simulateValidation(address: Omit<Address, 'id' | 'is_default'>): ValidateAddressResponse {
    const errors: string[] = [];
    
    // Basic validation rules
    if (!address.street_address || address.street_address.length < 5) {
      errors.push('Street address is too short');
    }
    
    if (!address.city || address.city.length < 2) {
      errors.push('City name is required');
    }
    
    if (!this.isValidState(address.state)) {
      errors.push('Invalid state abbreviation');
    }
    
    if (!this.isValidZipCode(address.postal_code)) {
      errors.push('Invalid ZIP code format');
    }

    const is_valid = errors.length === 0;

    // Return corrected address for demo
    const corrected_address: Address | undefined = is_valid ? {
      ...address,
      id: crypto.randomUUID(),
      street_address: this.normalizeStreetAddress(address.street_address),
      city: this.normalizeCity(address.city),
      state: this.normalizeState(address.state),
      postal_code: this.normalizeZipCode(address.postal_code),
      is_default: false
    } : undefined;

    return {
      is_valid,
      errors: errors.length > 0 ? errors : undefined,
      corrected_address,
      suggestions: is_valid ? undefined : this.getMockSuggestions(address.street_address)
    };
  }

  private getMockSuggestions(query: string): Address[] {
    const suggestions: Address[] = [
      {
        id: crypto.randomUUID(),
        label: 'Suggested Address 1',
        first_name: '',
        last_name: '',
        street_address: '123 Main St',
        city: 'Atlanta',
        state: 'GA',
        postal_code: '30309',
        country: 'US',
        is_default: false
      },
      {
        id: crypto.randomUUID(),
        label: 'Suggested Address 2', 
        first_name: '',
        last_name: '',
        street_address: '456 Peachtree Rd',
        city: 'Atlanta',
        state: 'GA',
        postal_code: '30308',
        country: 'US',
        is_default: false
      }
    ];

    return suggestions.filter(addr => 
      addr.street_address.toLowerCase().includes(query.toLowerCase()) ||
      addr.city.toLowerCase().includes(query.toLowerCase())
    );
  }

  private normalizeStreetAddress(street: string): string {
    return street
      .replace(/\bSt\b/gi, 'Street')
      .replace(/\bAve\b/gi, 'Avenue')
      .replace(/\bRd\b/gi, 'Road')
      .replace(/\bBlvd\b/gi, 'Boulevard')
      .replace(/\bDr\b/gi, 'Drive')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private normalizeCity(city: string): string {
    return city
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  private normalizeState(state: string): string {
    const stateMap: Record<string, string> = {
      'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR',
      'california': 'CA', 'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE',
      'florida': 'FL', 'georgia': 'GA', 'hawaii': 'HI', 'idaho': 'ID',
      'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA', 'kansas': 'KS',
      'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
      'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS',
      'missouri': 'MO', 'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV',
      'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY',
      'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH', 'oklahoma': 'OK',
      'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
      'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT',
      'vermont': 'VT', 'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV',
      'wisconsin': 'WI', 'wyoming': 'WY'
    };

    const normalized = state.toLowerCase();
    return stateMap[normalized] || state.toUpperCase();
  }

  private normalizeZipCode(zip: string): string {
    // Remove non-digits
    const digits = zip.replace(/\D/g, '');
    
    // Format as XXXXX or XXXXX-XXXX
    if (digits.length === 9) {
      return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    } else if (digits.length === 5) {
      return digits;
    }
    
    return zip; // Return original if can't normalize
  }

  private isValidState(state: string): boolean {
    const validStates = [
      'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
      'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
      'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
      'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
      'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
    ];
    return validStates.includes(state.toUpperCase());
  }

  private isValidZipCode(zip: string): boolean {
    const zipRegex = /^\d{5}(-\d{4})?$/;
    return zipRegex.test(zip);
  }

  private isTestMode(): boolean {
    return process.env.NODE_ENV === 'development' || 
           window.location.hostname === 'localhost' ||
           !this.apiKey || 
           this.apiKey === 'demo-key';
  }
}

export const createAddressValidationService = () => {
  return new USPSAddressValidationService();
};