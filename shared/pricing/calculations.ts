import type { 
  PricingContext, 
  PriceCalculation, 
  BrokerProfile, 
  BrokerTier, 
  CategoryDiscount,
  VolumeTier 
} from '../types/pricing';

export interface VolumeBreakpoint {
  min_quantity: number;
  max_quantity?: number;
  discount_percentage: number;
  multiplier: number;
}

export interface PricingRule {
  id: string;
  name: string;
  type: 'percentage' | 'fixed' | 'tiered';
  value: number;
  conditions?: {
    min_quantity?: number;
    max_quantity?: number;
    category_ids?: string[];
    product_ids?: string[];
    rush_order?: boolean;
  };
  stackable: boolean;
  priority: number;
}

export class PricingCalculator {
  private volumeBreakpoints: VolumeBreakpoint[] = [
    { min_quantity: 1, max_quantity: 24, discount_percentage: 0, multiplier: 1.0 },
    { min_quantity: 25, max_quantity: 49, discount_percentage: 2, multiplier: 1.1 },
    { min_quantity: 50, max_quantity: 99, discount_percentage: 5, multiplier: 1.2 },
    { min_quantity: 100, max_quantity: 249, discount_percentage: 8, multiplier: 1.3 },
    { min_quantity: 250, max_quantity: 499, discount_percentage: 12, multiplier: 1.4 },
    { min_quantity: 500, max_quantity: 999, discount_percentage: 15, multiplier: 1.5 },
    { min_quantity: 1000, max_quantity: 2499, discount_percentage: 18, multiplier: 1.6 },
    { min_quantity: 2500, max_quantity: 4999, discount_percentage: 22, multiplier: 1.8 },
    { min_quantity: 5000, discount_percentage: 25, multiplier: 2.0 }
  ];

  private brokerTiers: BrokerTier[] = [
    {
      id: 'bronze',
      name: 'bronze',
      display_name: 'Bronze',
      minimum_annual_volume: 10000,
      base_discount_percentage: 5,
      benefits: [],
      payment_terms_days: 30,
      rush_order_discount: 0,
      free_shipping_threshold: 500
    },
    {
      id: 'silver',
      name: 'silver',
      display_name: 'Silver',
      minimum_annual_volume: 50000,
      base_discount_percentage: 10,
      benefits: [],
      payment_terms_days: 30,
      rush_order_discount: 5,
      free_shipping_threshold: 300
    },
    {
      id: 'gold',
      name: 'gold',
      display_name: 'Gold',
      minimum_annual_volume: 150000,
      base_discount_percentage: 15,
      benefits: [],
      payment_terms_days: 45,
      rush_order_discount: 10,
      free_shipping_threshold: 200
    },
    {
      id: 'platinum',
      name: 'platinum',
      display_name: 'Platinum',
      minimum_annual_volume: 500000,
      base_discount_percentage: 20,
      benefits: [],
      payment_terms_days: 60,
      rush_order_discount: 15,
      free_shipping_threshold: 100
    }
  ];

  calculatePrice(context: PricingContext): PriceCalculation {
    const calculation: PriceCalculation = {
      base_price: context.base_price,
      broker_discount: 0,
      volume_discount: 0,
      category_discount: 0,
      tier_discount: 0,
      rush_surcharge: 0,
      total_discount: 0,
      final_price: context.base_price,
      savings: 0,
      discount_breakdown: []
    };

    // Calculate unit price for volume calculations
    const unit_price = context.base_price / context.quantity;
    const total_base_price = context.base_price * context.quantity;

    // Apply volume discounts (available to all users)
    const volumeDiscount = this.calculateVolumeDiscount(context.quantity, unit_price);
    if (volumeDiscount.amount > 0) {
      calculation.volume_discount = volumeDiscount.amount;
      calculation.discount_breakdown.push({
        type: 'volume',
        amount: volumeDiscount.amount,
        percentage: volumeDiscount.percentage,
        description: volumeDiscount.description
      });
    }

    // Apply broker-specific discounts
    if (context.is_broker && context.broker_profile) {
      const brokerDiscounts = this.calculateBrokerDiscounts(context, total_base_price);
      
      calculation.broker_discount = brokerDiscounts.broker_discount;
      calculation.category_discount = brokerDiscounts.category_discount;
      calculation.tier_discount = brokerDiscounts.tier_discount;
      calculation.discount_breakdown.push(...brokerDiscounts.breakdown);
    }

    // Apply rush order surcharge
    if (context.rush_order) {
      const rushSurcharge = this.calculateRushSurcharge(context, total_base_price);
      calculation.rush_surcharge = rushSurcharge.amount;
      if (rushSurcharge.amount > 0) {
        calculation.discount_breakdown.push({
          type: 'rush_surcharge',
          amount: rushSurcharge.amount,
          percentage: rushSurcharge.percentage,
          description: rushSurcharge.description
        });
      }
    }

    // Calculate totals
    calculation.total_discount = calculation.volume_discount + 
                                calculation.broker_discount + 
                                calculation.category_discount + 
                                calculation.tier_discount;
    
    calculation.final_price = total_base_price - calculation.total_discount + calculation.rush_surcharge;
    calculation.savings = calculation.total_discount;

    return calculation;
  }

  private calculateVolumeDiscount(quantity: number, unit_price: number) {
    const breakpoint = this.volumeBreakpoints.find(bp => 
      quantity >= bp.min_quantity && 
      (bp.max_quantity === undefined || quantity <= bp.max_quantity)
    );

    if (!breakpoint || breakpoint.discount_percentage === 0) {
      return { amount: 0, percentage: 0, description: 'No volume discount' };
    }

    const discount_amount = (unit_price * quantity) * (breakpoint.discount_percentage / 100);
    
    return {
      amount: discount_amount,
      percentage: breakpoint.discount_percentage,
      description: `Volume discount for ${quantity} units (${breakpoint.discount_percentage}% off)`
    };
  }

  private calculateBrokerDiscounts(context: PricingContext, total_base_price: number) {
    const profile = context.broker_profile!;
    const breakdown = [];
    let broker_discount = 0;
    let category_discount = 0;
    let tier_discount = 0;

    // Base tier discount
    tier_discount = total_base_price * (profile.broker_tier.base_discount_percentage / 100);
    breakdown.push({
      type: 'tier',
      amount: tier_discount,
      percentage: profile.broker_tier.base_discount_percentage,
      description: `${profile.broker_tier.display_name} Tier Discount`
    });

    // Category-specific discount
    const categoryDiscount = profile.category_discounts.find(
      cd => cd.category_id === context.category_id
    );
    
    if (categoryDiscount && context.quantity >= (categoryDiscount.minimum_quantity || 1)) {
      category_discount = total_base_price * (categoryDiscount.discount_percentage / 100);
      breakdown.push({
        type: 'category',
        amount: category_discount,
        percentage: categoryDiscount.discount_percentage,
        description: `${categoryDiscount.category_name} Category Discount`
      });
    }

    // Volume-based broker multiplier
    const volumeMultiplier = this.getBrokerVolumeMultiplier(context.quantity, profile.volume_tier);
    if (volumeMultiplier > 1) {
      const additional_discount = (tier_discount + category_discount) * (volumeMultiplier - 1);
      broker_discount = additional_discount;
      breakdown.push({
        type: 'broker_volume',
        amount: additional_discount,
        percentage: ((additional_discount / total_base_price) * 100),
        description: `Volume Multiplier Bonus (${volumeMultiplier.toFixed(1)}x)`
      });
    }

    // Annual volume bonus
    const annualVolumeBonus = this.getAnnualVolumeBonus(profile);
    if (annualVolumeBonus > 0) {
      const bonus_amount = total_base_price * (annualVolumeBonus / 100);
      broker_discount += bonus_amount;
      breakdown.push({
        type: 'annual_volume',
        amount: bonus_amount,
        percentage: annualVolumeBonus,
        description: `Annual Volume Bonus (${annualVolumeBonus}%)`
      });
    }

    return {
      broker_discount,
      category_discount,
      tier_discount,
      breakdown
    };
  }

  private calculateRushSurcharge(context: PricingContext, total_base_price: number) {
    const base_rush_percentage = 15; // 15% rush surcharge
    
    let rush_percentage = base_rush_percentage;
    
    // Apply broker rush discount
    if (context.is_broker && context.broker_profile) {
      rush_percentage = Math.max(0, base_rush_percentage - context.broker_profile.broker_tier.rush_order_discount);
    }

    const surcharge_amount = total_base_price * (rush_percentage / 100);
    
    return {
      amount: surcharge_amount,
      percentage: rush_percentage,
      description: rush_percentage > 0 
        ? `Rush Order Surcharge (${rush_percentage}%)`
        : 'Rush Order - No Surcharge (Broker Benefit)'
    };
  }

  private getBrokerVolumeMultiplier(quantity: number, volumeTier: VolumeTier): number {
    const baseMultiplier = volumeTier.discount_multiplier;
    
    // Additional multiplier based on quantity
    if (quantity >= 5000) return baseMultiplier * 1.5;
    if (quantity >= 2500) return baseMultiplier * 1.4;
    if (quantity >= 1000) return baseMultiplier * 1.3;
    if (quantity >= 500) return baseMultiplier * 1.2;
    if (quantity >= 100) return baseMultiplier * 1.1;
    
    return baseMultiplier;
  }

  private getAnnualVolumeBonus(profile: BrokerProfile): number {
    const progressPercentage = (profile.current_year_volume / profile.annual_volume_committed) * 100;
    
    // Bonus based on annual volume progress
    if (progressPercentage >= 100) return 3; // 3% bonus for meeting annual commitment
    if (progressPercentage >= 75) return 2;  // 2% bonus for 75% progress
    if (progressPercentage >= 50) return 1;  // 1% bonus for 50% progress
    
    return 0;
  }

  getVolumeBreakpoints(): VolumeBreakpoint[] {
    return this.volumeBreakpoints;
  }

  getBrokerTiers(): BrokerTier[] {
    return this.brokerTiers;
  }

  estimateTierByVolume(annualVolume: number): BrokerTier {
    return this.brokerTiers
      .slice()
      .reverse()
      .find(tier => annualVolume >= tier.minimum_annual_volume) || this.brokerTiers[0];
  }

  calculatePotentialSavings(
    basePrice: number, 
    quantity: number, 
    targetTier: BrokerTier,
    categoryDiscounts: CategoryDiscount[] = []
  ): number {
    const totalPrice = basePrice * quantity;
    
    // Tier discount
    const tierDiscount = totalPrice * (targetTier.base_discount_percentage / 100);
    
    // Volume discount
    const volumeDiscount = this.calculateVolumeDiscount(quantity, basePrice);
    
    // Category discount (use average if multiple categories)
    const avgCategoryDiscount = categoryDiscounts.length > 0 
      ? categoryDiscounts.reduce((sum, cd) => sum + cd.discount_percentage, 0) / categoryDiscounts.length
      : 0;
    const categoryDiscount = totalPrice * (avgCategoryDiscount / 100);
    
    return tierDiscount + volumeDiscount.amount + categoryDiscount;
  }
}

export const pricingCalculator = new PricingCalculator();