import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface BrokerPricingInfo {
  hasBrokerDiscount: boolean;
  discountPercentage: number;
  discountedPrice: (originalPrice: number) => number;
}

export function useBrokerPricing(): BrokerPricingInfo {
  const { user } = useAuth();

  // Fetch user's broker discount status
  const { data: brokerInfo } = useQuery({
    queryKey: ['broker-discount', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_profiles')
        .select('has_broker_discount, broker_discount_percentage')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching broker info:', error);
        return null;
      }

      return data;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const hasBrokerDiscount = brokerInfo?.has_broker_discount || false;
  const discountPercentage = brokerInfo?.broker_discount_percentage || 0;

  const discountedPrice = (originalPrice: number): number => {
    if (!hasBrokerDiscount || discountPercentage === 0) {
      return originalPrice;
    }

    const discountAmount = (originalPrice * discountPercentage) / 100;
    return originalPrice - discountAmount;
  };

  return {
    hasBrokerDiscount,
    discountPercentage,
    discountedPrice,
  };
}