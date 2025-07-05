import type { 
  CategoryDiscount, 
  BrokerProfile, 
  BrokerTier, 
  PriceCalculation 
} from '@/types/broker';

export interface DiscountSummary {
  total_discount_percentage: number;
  total_savings: number;
  breakdown: {
    type: string;
    name: string;
    amount: number;
    percentage: number;
    description: string;
  }[];
  next_tier_savings?: {
    tier_name: string;
    additional_savings: number;
    volume_needed: number;
  };
}

export class DiscountCalculator {
  calculateDiscountSummary(
    calculation: PriceCalculation,
    brokerProfile?: BrokerProfile
  ): DiscountSummary {
    const summary: DiscountSummary = {
      total_discount_percentage: 0,
      total_savings: calculation.savings,
      breakdown: []
    };

    // Calculate total discount percentage
    const originalPrice = calculation.final_price + calculation.savings - calculation.rush_surcharge;
    summary.total_discount_percentage = originalPrice > 0 
      ? (calculation.savings / originalPrice) * 100 
      : 0;

    // Build breakdown from calculation
    summary.breakdown = calculation.discount_breakdown.map(discount => ({
      type: discount.type,
      name: this.getDiscountDisplayName(discount.type),
      amount: discount.amount,
      percentage: discount.percentage,
      description: discount.description
    }));

    // Add next tier savings if broker
    if (brokerProfile) {
      const nextTierSavings = this.calculateNextTierSavings(brokerProfile, originalPrice);
      if (nextTierSavings) {
        summary.next_tier_savings = nextTierSavings;
      }
    }

    return summary;
  }

  private getDiscountDisplayName(type: string): string {
    const displayNames: { [key: string]: string } = {
      'volume': 'Volume Discount',
      'tier': 'Broker Tier Discount',
      'category': 'Category Discount',
      'broker_volume': 'Broker Volume Bonus',
      'annual_volume': 'Annual Volume Bonus',
      'rush_surcharge': 'Rush Order Surcharge'
    };
    return displayNames[type] || type;
  }

  private calculateNextTierSavings(profile: BrokerProfile, basePrice: number) {
    const nextTier = this.getNextTier(profile.broker_tier);
    if (!nextTier) return null;

    const currentTierDiscount = basePrice * (profile.broker_tier.base_discount_percentage / 100);
    const nextTierDiscount = basePrice * (nextTier.base_discount_percentage / 100);
    const additionalSavings = nextTierDiscount - currentTierDiscount;

    return {
      tier_name: nextTier.display_name,
      additional_savings: additionalSavings,
      volume_needed: nextTier.minimum_annual_volume - profile.current_year_volume
    };
  }

  private getNextTier(currentTier: BrokerTier): BrokerTier | null {
    const tiers = [
      { name: 'bronze', next: 'silver' },
      { name: 'silver', next: 'gold' },
      { name: 'gold', next: 'platinum' },
      { name: 'platinum', next: null }
    ];

    const tierMapping = tiers.find(t => t.name === currentTier.name);
    if (!tierMapping?.next) return null;

    // This would normally come from a service or database
    const tierDefinitions: { [key: string]: BrokerTier } = {
      silver: {
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
      gold: {
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
      platinum: {
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
    };

    return tierDefinitions[tierMapping.next];
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  formatPercentage(percentage: number, decimals: number = 1): string {
    return `${percentage.toFixed(decimals)}%`;
  }

  formatVolume(volume: number): string {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    } else {
      return volume.toString();
    }
  }

  calculateYearlyProjection(
    monthlyVolume: number,
    currentPrice: number,
    projectedPrice: number
  ): {
    annual_volume: number;
    current_annual_cost: number;
    projected_annual_cost: number;
    annual_savings: number;
  } {
    const annual_volume = monthlyVolume * 12;
    const current_annual_cost = annual_volume * currentPrice;
    const projected_annual_cost = annual_volume * projectedPrice;
    const annual_savings = current_annual_cost - projected_annual_cost;

    return {
      annual_volume,
      current_annual_cost,
      projected_annual_cost,
      annual_savings
    };
  }

  getBrokerTierRecommendation(
    currentVolume: number,
    projectedVolume: number
  ): {
    current_tier: BrokerTier;
    recommended_tier: BrokerTier;
    volume_gap: number;
    potential_savings: number;
  } | null {
    // This would typically come from a service
    const tiers: BrokerTier[] = [
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

    const currentTier = tiers
      .slice()
      .reverse()
      .find(tier => currentVolume >= tier.minimum_annual_volume);

    const recommendedTier = tiers
      .slice()
      .reverse()
      .find(tier => projectedVolume >= tier.minimum_annual_volume);

    if (!currentTier || !recommendedTier || currentTier.id === recommendedTier.id) {
      return null;
    }

    const volume_gap = recommendedTier.minimum_annual_volume - currentVolume;
    const potential_savings = projectedVolume * 
      ((recommendedTier.base_discount_percentage - currentTier.base_discount_percentage) / 100);

    return {
      current_tier: currentTier,
      recommended_tier: recommendedTier,
      volume_gap,
      potential_savings
    };
  }
}

export const discountCalculator = new DiscountCalculator();