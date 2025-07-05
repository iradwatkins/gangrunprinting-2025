import { supabase } from '@/integrations/supabase/client';
import type { 
  BrokerProfile, 
  BrokerDashboardData, 
  BrokerRequest,
  BrokerTier,
  PricingContext,
  PriceCalculation 
} from '@/types/broker';

export class BrokerService {
  async getBrokerProfile(userId: string): Promise<BrokerProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        broker_applications!inner(
          id,
          company_name,
          status,
          business_type,
          annual_volume
        )
      `)
      .eq('user_id', userId)
      .eq('broker_applications.status', 'approved')
      .single();

    if (error || !data) return null;

    const brokerData = data.broker_applications[0];
    if (!brokerData) return null;

    return {
      id: brokerData.id,
      user_id: userId,
      company_name: brokerData.company_name,
      broker_tier: await this.determineBrokerTier(parseInt(brokerData.annual_volume)),
      status: 'active',
      category_discounts: data.broker_category_discounts || [],
      volume_tier: await this.getVolumeTier(parseInt(brokerData.annual_volume)),
      annual_volume_committed: parseInt(brokerData.annual_volume),
      current_year_volume: await this.getCurrentYearVolume(userId),
      joined_date: data.created_at,
      last_order_date: await this.getLastOrderDate(userId),
      payment_terms: {
        net_days: 30,
        early_payment_discount: 2,
        credit_limit: parseInt(brokerData.annual_volume) * 0.1,
        credit_status: 'approved'
      },
      contact_person: {
        name: `${data.first_name} ${data.last_name}`,
        email: data.email || '',
        phone: data.phone || ''
      },
      shipping_preferences: {
        preferred_carrier: 'UPS',
        rush_order_eligible: true
      }
    };
  }

  async requestBrokerStatus(userId: string, requestData: any): Promise<string> {
    const { data, error } = await supabase
      .from('broker_applications')
      .insert({
        user_id: userId,
        company_name: requestData.company_name,
        business_type: requestData.business_type,
        tax_id: requestData.tax_id,
        annual_volume: requestData.annual_volume,
        business_address: requestData.business_address,
        additional_info: requestData.additional_info,
        status: 'pending'
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  async getDashboardData(userId: string): Promise<BrokerDashboardData | null> {
    const profile = await this.getBrokerProfile(userId);
    if (!profile) return null;

    const [volumeProgress, recentOrders, pricingSummary, paymentStatus] = await Promise.all([
      this.getVolumeProgress(userId, profile),
      this.getRecentOrders(userId),
      this.getPricingSummary(userId),
      this.getPaymentStatus(userId)
    ]);

    return {
      profile,
      volume_progress: volumeProgress,
      recent_orders: recentOrders,
      pricing_summary: pricingSummary,
      payment_status: paymentStatus
    };
  }

  async calculatePrice(context: PricingContext): Promise<PriceCalculation> {
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

    if (!context.is_broker || !context.broker_profile) {
      return calculation;
    }

    const profile = context.broker_profile;

    // Apply tier discount
    calculation.tier_discount = context.base_price * (profile.broker_tier.base_discount_percentage / 100);
    calculation.discount_breakdown.push({
      type: 'tier',
      amount: calculation.tier_discount,
      percentage: profile.broker_tier.base_discount_percentage,
      description: `${profile.broker_tier.display_name} Tier Discount`
    });

    // Apply category discount
    const categoryDiscount = profile.category_discounts.find(
      cd => cd.category_id === context.category_id
    );
    if (categoryDiscount) {
      calculation.category_discount = context.base_price * (categoryDiscount.discount_percentage / 100);
      calculation.discount_breakdown.push({
        type: 'category',
        amount: calculation.category_discount,
        percentage: categoryDiscount.discount_percentage,
        description: `${categoryDiscount.category_name} Category Discount`
      });
    }

    // Apply volume discount
    const volumeMultiplier = this.getVolumeMultiplier(context.quantity, profile.volume_tier);
    if (volumeMultiplier > 1) {
      const additionalDiscount = (context.base_price * 0.05) * (volumeMultiplier - 1);
      calculation.volume_discount = additionalDiscount;
      calculation.discount_breakdown.push({
        type: 'volume',
        amount: calculation.volume_discount,
        percentage: (additionalDiscount / context.base_price) * 100,
        description: `Volume Discount (${context.quantity} units)`
      });
    }

    // Apply rush surcharge
    if (context.rush_order) {
      const rushPercentage = Math.max(0, 15 - profile.broker_tier.rush_order_discount);
      calculation.rush_surcharge = context.base_price * (rushPercentage / 100);
    }

    // Calculate totals
    calculation.total_discount = calculation.tier_discount + 
                                calculation.category_discount + 
                                calculation.volume_discount;
    
    calculation.final_price = context.base_price - calculation.total_discount + calculation.rush_surcharge;
    calculation.savings = calculation.total_discount;

    return calculation;
  }

  private async determineBrokerTier(annualVolume: number): Promise<BrokerTier> {
    const tiers: BrokerTier[] = [
      {
        id: 'bronze',
        name: 'bronze',
        display_name: 'Bronze',
        minimum_annual_volume: 10000,
        base_discount_percentage: 5,
        benefits: ['5% base discount', 'Standard support', '30-day payment terms'],
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
        benefits: ['10% base discount', 'Priority support', '30-day payment terms', '5% rush discount'],
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
        benefits: ['15% base discount', 'Dedicated account manager', '45-day payment terms', '10% rush discount'],
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
        benefits: ['20% base discount', 'White-glove service', '60-day payment terms', '15% rush discount'],
        payment_terms_days: 60,
        rush_order_discount: 15,
        free_shipping_threshold: 100
      }
    ];

    return tiers.reverse().find(tier => annualVolume >= tier.minimum_annual_volume) || tiers[0];
  }

  private async getVolumeTier(annualVolume: number) {
    if (annualVolume >= 500000) return { tier_name: 'Ultra High', minimum_volume: 500000, discount_multiplier: 1.5, additional_benefits: ['Custom pricing', 'Dedicated team'] };
    if (annualVolume >= 150000) return { tier_name: 'High', minimum_volume: 150000, discount_multiplier: 1.3, additional_benefits: ['Priority processing', 'Account manager'] };
    if (annualVolume >= 50000) return { tier_name: 'Medium', minimum_volume: 50000, discount_multiplier: 1.2, additional_benefits: ['Priority support'] };
    return { tier_name: 'Standard', minimum_volume: 10000, discount_multiplier: 1.0, additional_benefits: ['Standard support'] };
  }

  private async getCurrentYearVolume(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('user_id', userId)
      .gte('created_at', new Date(new Date().getFullYear(), 0, 1).toISOString());

    if (error) return 0;
    return data.reduce((sum, order) => sum + (order.total_amount || 0), 0);
  }

  private async getLastOrderDate(userId: string): Promise<string | undefined> {
    const { data, error } = await supabase
      .from('orders')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return error ? undefined : data?.created_at;
  }

  private async getVolumeProgress(userId: string, profile: BrokerProfile) {
    const currentVolume = profile.current_year_volume;
    const annualTarget = profile.annual_volume_committed;
    const percentage = (currentVolume / annualTarget) * 100;
    
    const nextTier = await this.getNextTier(profile.broker_tier);
    
    return {
      current_volume: currentVolume,
      annual_target: annualTarget,
      percentage_complete: Math.min(percentage, 100),
      next_tier_volume: nextTier?.minimum_annual_volume || annualTarget,
      next_tier_discount: nextTier?.base_discount_percentage || profile.broker_tier.base_discount_percentage
    };
  }

  private async getRecentOrders(userId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        created_at,
        total_amount,
        status,
        order_items(count)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) return [];

    return data.map(order => ({
      order_id: order.id,
      order_number: order.order_number,
      date: order.created_at,
      total_amount: order.total_amount || 0,
      discount_applied: 0, // Calculate from pricing
      savings: 0, // Calculate from pricing
      status: order.status,
      items_count: order.order_items?.[0]?.count || 0
    }));
  }

  private async getPricingSummary(userId: string) {
    return {
      categories: [],
      total_annual_savings: 0,
      average_discount: 0
    };
  }

  private async getPaymentStatus(userId: string) {
    return {
      outstanding_balance: 0,
      credit_available: 0,
      next_payment_due: '',
      payment_history: []
    };
  }

  private async getNextTier(currentTier: BrokerTier): Promise<BrokerTier | null> {
    const tierOrder = ['bronze', 'silver', 'gold', 'platinum'];
    const currentIndex = tierOrder.indexOf(currentTier.name);
    if (currentIndex < tierOrder.length - 1) {
      return await this.determineBrokerTier(999999); // Get next tier
    }
    return null;
  }

  private getVolumeMultiplier(quantity: number, volumeTier: any): number {
    if (quantity >= 1000) return 1.3;
    if (quantity >= 500) return 1.2;
    if (quantity >= 100) return 1.1;
    return 1.0;
  }
}

export const brokerService = new BrokerService();