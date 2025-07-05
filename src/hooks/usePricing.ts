import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { PriceCalculation, BrokerTier } from '@/types/broker';

interface PricingRequest {
  category_id: string;
  product_id: string;
  quantity: number;
  base_price: number;
  rush_order?: boolean;
}

interface PricingResult {
  pricing: PriceCalculation;
  is_broker: boolean;
  broker_tier: string | null;
}

export function usePricing() {
  const { user, isAuthenticated } = useAuth();
  const [brokerTiers, setBrokerTiers] = useState<BrokerTier[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchBrokerTiers();
    }
  }, [isAuthenticated, user]);

  const fetchBrokerTiers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/pricing/tiers');
      if (!response.ok) {
        throw new Error('Failed to fetch broker tiers');
      }

      const data = await response.json();
      setBrokerTiers(data.tiers);
    } catch (err) {
      console.error('Error fetching broker tiers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch broker tiers');
    } finally {
      setIsLoading(false);
    }
  };

  const calculatePrice = async (pricingRequest: PricingRequest): Promise<PricingResult> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/pricing/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pricingRequest),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to calculate price');
      }

      const result = await response.json();
      return result;
    } catch (err) {
      console.error('Error calculating price:', err);
      setError(err instanceof Error ? err.message : 'Failed to calculate price');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const previewPricing = async (pricingRequest: PricingRequest) => {
    try {
      const response = await fetch('/api/pricing/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pricingRequest),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to preview pricing');
      }

      return await response.json();
    } catch (err) {
      console.error('Error previewing pricing:', err);
      throw err;
    }
  };

  const getBrokerTierByVolume = (annualVolume: number): BrokerTier | null => {
    return brokerTiers
      .slice()
      .reverse()
      .find(tier => annualVolume >= tier.minimum_annual_volume) || null;
  };

  const calculatePotentialSavings = (basePrice: number, quantity: number, targetTier: BrokerTier): number => {
    const totalPrice = basePrice * quantity;
    const discount = totalPrice * (targetTier.base_discount_percentage / 100);
    return discount;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatPercentage = (percentage: number): string => {
    return `${percentage.toFixed(1)}%`;
  };

  return {
    brokerTiers,
    isLoading,
    error,
    calculatePrice,
    previewPricing,
    getBrokerTierByVolume,
    calculatePotentialSavings,
    formatCurrency,
    formatPercentage,
    refreshTiers: fetchBrokerTiers
  };
}

export function usePriceCalculator(
  categoryId: string,
  productId: string,
  basePrice: number
) {
  const { calculatePrice } = usePricing();
  const [currentPricing, setCurrentPricing] = useState<PricingResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const updatePrice = async (quantity: number, rushOrder: boolean = false) => {
    if (!categoryId || !productId || !basePrice || quantity <= 0) {
      return;
    }

    try {
      setIsCalculating(true);
      const result = await calculatePrice({
        category_id: categoryId,
        product_id: productId,
        quantity,
        base_price: basePrice,
        rush_order: rushOrder
      });
      setCurrentPricing(result);
    } catch (error) {
      console.error('Error updating price:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  return {
    currentPricing,
    isCalculating,
    updatePrice
  };
}