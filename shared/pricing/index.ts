/**
 * CRITICAL: Gang Run Printing Pricing Service
 * 
 * This module preserves ALL pricing logic from the original implementation.
 * DO NOT MODIFY without approval from Product Owner, Finance, and Dev Lead.
 * 
 * Any changes could result in:
 * - Revenue loss
 * - Customer pricing errors
 * - Broker discount failures
 * - Legal/contractual issues
 */

// Re-export all pricing modules WITHOUT modification
export * from './documentation-calculations';
export * from './calculations';
export * from './discounts';

// Import the calculators
import { DocumentationPricingCalculator } from './documentation-calculations';
import { PricingCalculator } from './calculations';
import { applyBrokerDiscount, calculateVolumeDiscount } from './discounts';

/**
 * Unified Pricing Service
 * Provides a single interface for all pricing operations
 */
export class UnifiedPricingService {
  private docCalculator: DocumentationPricingCalculator;
  private advancedCalculator: PricingCalculator;

  constructor() {
    this.docCalculator = new DocumentationPricingCalculator();
    this.advancedCalculator = new PricingCalculator();
  }

  /**
   * Calculate price using the documentation-compliant formula
   * This is the PRIMARY pricing method
   */
  async calculateDocumentationPrice(context: any): Promise<any> {
    return this.docCalculator.calculatePrice(context);
  }

  /**
   * Calculate price with advanced broker features
   * Includes tier discounts, volume bonuses, etc.
   */
  async calculateAdvancedPrice(context: any): Promise<any> {
    return this.advancedCalculator.calculatePrice(context);
  }

  /**
   * Apply broker discount to a price
   */
  applyBrokerDiscount(price: number, discountPercentage: number): number {
    return applyBrokerDiscount(price, discountPercentage);
  }

  /**
   * Calculate volume discount
   */
  calculateVolumeDiscount(quantity: number): number {
    return calculateVolumeDiscount(quantity);
  }

  /**
   * Get all volume breakpoints (for display)
   */
  getVolumeBreakpoints() {
    return this.advancedCalculator.getVolumeBreakpoints();
  }

  /**
   * Get all broker tiers (for display)
   */
  getBrokerTiers() {
    return this.advancedCalculator.getBrokerTiers();
  }
}

// Create singleton instance
let pricingServiceInstance: UnifiedPricingService | null = null;

export function getPricingService(): UnifiedPricingService {
  if (!pricingServiceInstance) {
    pricingServiceInstance = new UnifiedPricingService();
  }
  return pricingServiceInstance;
}

// Default export for convenience
export default UnifiedPricingService;