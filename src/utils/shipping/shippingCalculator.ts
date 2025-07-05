import type { Address } from '@/types/auth';
import type { CartItem } from '@/types/cart';
import type { ShippingMethod, CalculateShippingRequest, CalculateShippingResponse } from '@/types/checkout';

export interface ShippingCalculatorService {
  calculateShipping(request: CalculateShippingRequest): Promise<CalculateShippingResponse>;
  getAvailableShippingMethods(address: Address): Promise<ShippingMethod[]>;
  estimateDeliveryDate(shippingMethod: ShippingMethod, origin?: Address): Date;
}

export class ShippingCalculator implements ShippingCalculatorService {
  private originAddress: Address;
  private carriers: ShippingCarrier[];

  constructor() {
    // Default origin address (GangRun Printing location)
    this.originAddress = {
      id: 'origin',
      label: 'GangRun Printing',
      first_name: '',
      last_name: '',
      company: 'GangRun Printing',
      street_address: '1234 Printing Way',
      city: 'Atlanta',
      state: 'GA',
      postal_code: '30309',
      country: 'US',
      is_default: false
    };

    this.carriers = [
      {
        id: 'usps',
        name: 'USPS',
        methods: [
          {
            id: 'usps-ground',
            name: 'USPS Ground Advantage',
            description: 'Reliable ground shipping',
            carrier: 'USPS',
            estimated_days: 3,
            cost: 0, // Will be calculated
            is_available: true
          },
          {
            id: 'usps-priority',
            name: 'USPS Priority Mail',
            description: 'Faster delivery with tracking',
            carrier: 'USPS',
            estimated_days: 2,
            cost: 0,
            is_available: true
          },
          {
            id: 'usps-express',
            name: 'USPS Priority Mail Express',
            description: 'Overnight delivery',
            carrier: 'USPS',
            estimated_days: 1,
            cost: 0,
            is_available: true
          }
        ]
      },
      {
        id: 'ups',
        name: 'UPS',
        methods: [
          {
            id: 'ups-ground',
            name: 'UPS Ground',
            description: 'Economical ground shipping',
            carrier: 'UPS',
            estimated_days: 4,
            cost: 0,
            is_available: true
          },
          {
            id: 'ups-3day',
            name: 'UPS 3-Day Select',
            description: 'Guaranteed 3-day delivery',
            carrier: 'UPS',
            estimated_days: 3,
            cost: 0,
            is_available: true
          },
          {
            id: 'ups-2day',
            name: 'UPS 2nd Day Air',
            description: 'Guaranteed 2-day delivery',
            carrier: 'UPS',
            estimated_days: 2,
            cost: 0,
            is_available: true
          },
          {
            id: 'ups-next',
            name: 'UPS Next Day Air',
            description: 'Guaranteed next-day delivery',
            carrier: 'UPS',
            estimated_days: 1,
            cost: 0,
            is_available: true
          }
        ]
      },
      {
        id: 'fedex',
        name: 'FedEx',
        methods: [
          {
            id: 'fedex-ground',
            name: 'FedEx Ground',
            description: 'Reliable ground delivery',
            carrier: 'FedEx',
            estimated_days: 4,
            cost: 0,
            is_available: true
          },
          {
            id: 'fedex-2day',
            name: 'FedEx 2Day',
            description: 'Guaranteed 2-day delivery',
            carrier: 'FedEx',
            estimated_days: 2,
            cost: 0,
            is_available: true
          },
          {
            id: 'fedex-overnight',
            name: 'FedEx Standard Overnight',
            description: 'Next business day delivery',
            carrier: 'FedEx',
            estimated_days: 1,
            cost: 0,
            is_available: true
          }
        ]
      }
    ];
  }

  async calculateShipping(request: CalculateShippingRequest): Promise<CalculateShippingResponse> {
    try {
      const { shipping_address, cart_items } = request;
      
      // Calculate package dimensions and weight
      const packageInfo = this.calculatePackageInfo(cart_items);
      
      // Get distance and zone
      const zone = this.calculateShippingZone(this.originAddress, shipping_address);
      
      // Get available methods with calculated costs
      const shipping_methods = await this.getAvailableShippingMethods(shipping_address);
      
      // Calculate costs for each method
      const methodsWithCosts = shipping_methods.map(method => ({
        ...method,
        cost: this.calculateMethodCost(method, packageInfo, zone)
      }));

      // Filter out unavailable methods based on destination
      const availableMethods = methodsWithCosts.filter(method => 
        this.isMethodAvailable(method, shipping_address, packageInfo)
      );

      // Sort by cost (cheapest first)
      availableMethods.sort((a, b) => a.cost - b.cost);

      return {
        shipping_methods: availableMethods
      };
    } catch (error) {
      console.error('Shipping calculation error:', error);
      return {
        shipping_methods: [],
        errors: ['Unable to calculate shipping costs at this time']
      };
    }
  }

  async getAvailableShippingMethods(address: Address): Promise<ShippingMethod[]> {
    const allMethods: ShippingMethod[] = [];
    
    for (const carrier of this.carriers) {
      allMethods.push(...carrier.methods);
    }

    // Filter based on destination
    return allMethods.filter(method => 
      this.isMethodAvailableForAddress(method, address)
    );
  }

  estimateDeliveryDate(shippingMethod: ShippingMethod, origin?: Address): Date {
    const now = new Date();
    const deliveryDate = new Date(now);
    
    // Add estimated days
    deliveryDate.setDate(now.getDate() + shippingMethod.estimated_days);
    
    // Skip weekends for business deliveries
    while (deliveryDate.getDay() === 0 || deliveryDate.getDay() === 6) {
      deliveryDate.setDate(deliveryDate.getDate() + 1);
    }
    
    return deliveryDate;
  }

  private calculatePackageInfo(cartItems: CartItem[]): PackageInfo {
    let totalWeight = 0;
    let totalVolume = 0;
    let maxLength = 0;
    let maxWidth = 0;
    let maxHeight = 0;

    cartItems.forEach(item => {
      // Estimate weight and dimensions based on product type and quantity
      const itemWeight = this.estimateItemWeight(item);
      const itemDimensions = this.estimateItemDimensions(item);
      
      totalWeight += itemWeight * item.quantity;
      totalVolume += itemDimensions.volume * item.quantity;
      
      maxLength = Math.max(maxLength, itemDimensions.length);
      maxWidth = Math.max(maxWidth, itemDimensions.width);
      maxHeight = Math.max(maxHeight, itemDimensions.height * item.quantity);
    });

    return {
      weight: totalWeight,
      volume: totalVolume,
      length: maxLength,
      width: maxWidth,
      height: maxHeight,
      itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0)
    };
  }

  private estimateItemWeight(item: CartItem): number {
    // Base weights by product category (in ounces)
    const baseWeights: Record<string, number> = {
      'business-cards': 0.1,
      'flyers': 0.3,
      'postcards': 0.2,
      'posters': 2.0,
      'banners': 8.0,
      'brochures': 0.5,
      'booklets': 1.0,
      'stickers': 0.1,
      'labels': 0.1,
      'calendars': 3.0
    };

    const productSlug = item.product_slug || 'business-cards';
    return baseWeights[productSlug] || 0.5;
  }

  private estimateItemDimensions(item: CartItem): ItemDimensions {
    // Base dimensions by product category (in inches)
    const baseDimensions: Record<string, ItemDimensions> = {
      'business-cards': { length: 3.5, width: 2, height: 0.01, volume: 0.07 },
      'flyers': { length: 8.5, width: 11, height: 0.004, volume: 0.374 },
      'postcards': { length: 6, width: 4, height: 0.007, volume: 0.168 },
      'posters': { length: 24, width: 18, height: 0.004, volume: 1.728 },
      'banners': { length: 36, width: 24, height: 0.01, volume: 8.64 },
      'brochures': { length: 8.5, width: 11, height: 0.008, volume: 0.748 },
      'booklets': { length: 8.5, width: 11, height: 0.25, volume: 23.375 },
      'stickers': { length: 4, width: 4, height: 0.003, volume: 0.048 },
      'labels': { length: 4, width: 6, height: 0.003, volume: 0.072 },
      'calendars': { length: 11, width: 8.5, height: 0.1, volume: 9.35 }
    };

    const productSlug = item.product_slug || 'business-cards';
    return baseDimensions[productSlug] || baseDimensions['business-cards'];
  }

  private calculateShippingZone(origin: Address, destination: Address): number {
    // Simplified zone calculation based on states
    if (origin.state === destination.state) {
      return 1; // Same state
    }

    const stateZones: Record<string, number> = {
      'GA': 1, 'FL': 1, 'SC': 1, 'NC': 1, 'TN': 1, 'AL': 1, // Zone 1
      'VA': 2, 'KY': 2, 'WV': 2, 'OH': 2, 'IN': 2, 'IL': 2, // Zone 2
      'PA': 3, 'NY': 3, 'NJ': 3, 'CT': 3, 'MA': 3, 'RI': 3, // Zone 3
      'TX': 4, 'OK': 4, 'AR': 4, 'LA': 4, 'MS': 4, 'MO': 4, // Zone 4
      'CA': 5, 'NV': 5, 'AZ': 5, 'UT': 5, 'CO': 5, 'NM': 5, // Zone 5
      'WA': 6, 'OR': 6, 'ID': 6, 'MT': 6, 'WY': 6, 'ND': 6, // Zone 6
      'AK': 7, 'HI': 7 // Zone 7
    };

    return stateZones[destination.state] || 3;
  }

  private calculateMethodCost(method: ShippingMethod, packageInfo: PackageInfo, zone: number): number {
    // Base rates by carrier and method
    const baseRates: Record<string, Record<string, number[]>> = {
      'USPS': {
        'usps-ground': [5.99, 7.99, 9.99, 12.99, 15.99, 19.99, 25.99],
        'usps-priority': [8.99, 10.99, 13.99, 16.99, 19.99, 23.99, 29.99],
        'usps-express': [24.99, 26.99, 29.99, 32.99, 35.99, 39.99, 45.99]
      },
      'UPS': {
        'ups-ground': [7.99, 9.99, 12.99, 15.99, 18.99, 22.99, 28.99],
        'ups-3day': [14.99, 16.99, 19.99, 22.99, 25.99, 29.99, 35.99],
        'ups-2day': [19.99, 21.99, 24.99, 27.99, 30.99, 34.99, 40.99],
        'ups-next': [34.99, 36.99, 39.99, 42.99, 45.99, 49.99, 55.99]
      },
      'FedEx': {
        'fedex-ground': [8.99, 10.99, 13.99, 16.99, 19.99, 23.99, 29.99],
        'fedex-2day': [21.99, 23.99, 26.99, 29.99, 32.99, 36.99, 42.99],
        'fedex-overnight': [36.99, 38.99, 41.99, 44.99, 47.99, 51.99, 57.99]
      }
    };

    const carrierRates = baseRates[method.carrier];
    if (!carrierRates || !carrierRates[method.id]) {
      return 9.99; // Default rate
    }

    const zoneRates = carrierRates[method.id];
    let baseCost = zoneRates[Math.min(zone - 1, zoneRates.length - 1)];

    // Add weight surcharge for heavy packages
    if (packageInfo.weight > 16) { // 1 pound
      baseCost += Math.ceil((packageInfo.weight - 16) / 16) * 2.99;
    }

    // Add dimensional weight surcharge for large packages
    const dimensionalWeight = (packageInfo.length * packageInfo.width * packageInfo.height) / 166;
    if (dimensionalWeight > packageInfo.weight && dimensionalWeight > 16) {
      baseCost += Math.ceil((dimensionalWeight - 16) / 16) * 1.99;
    }

    return Math.round(baseCost * 100) / 100; // Round to 2 decimal places
  }

  private isMethodAvailable(method: ShippingMethod, packageInfo: PackageInfo): boolean {
    // Weight limits by carrier
    const weightLimits: Record<string, number> = {
      'USPS': 1120, // 70 lbs
      'UPS': 2400,  // 150 lbs  
      'FedEx': 2400 // 150 lbs
    };

    // Size limits by carrier (length + girth)
    const sizeLimits: Record<string, number> = {
      'USPS': 108, // inches
      'UPS': 165,  // inches
      'FedEx': 165 // inches
    };

    const weightLimit = weightLimits[method.carrier] || 1120;
    const sizeLimit = sizeLimits[method.carrier] || 108;
    
    const girth = 2 * (packageInfo.width + packageInfo.height);
    const lengthPlusGirth = packageInfo.length + girth;

    return packageInfo.weight <= weightLimit && lengthPlusGirth <= sizeLimit;
  }

  private isMethodAvailableForAddress(method: ShippingMethod, address: Address): boolean {
    // Some carriers don't deliver to certain areas
    if (address.state === 'AK' || address.state === 'HI') {
      // Alaska and Hawaii have limited shipping options
      return !method.id.includes('ground');
    }

    return true;
  }
}

interface ShippingCarrier {
  id: string;
  name: string;
  methods: ShippingMethod[];
}

interface PackageInfo {
  weight: number; // in ounces
  volume: number; // in cubic inches
  length: number; // in inches
  width: number;  // in inches
  height: number; // in inches
  itemCount: number;
}

interface ItemDimensions {
  length: number;
  width: number;
  height: number;
  volume: number;
}

export const createShippingCalculator = () => {
  return new ShippingCalculator();
};