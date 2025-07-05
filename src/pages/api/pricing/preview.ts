import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { pricingCalculator } from '@/utils/pricing/calculations';
import { discountCalculator } from '@/utils/pricing/discounts';
import type { PricingContext } from '@/types/broker';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const supabase = createServerSupabaseClient({ req, res });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const {
      category_id,
      product_id,
      base_price,
      quantities = [1, 25, 50, 100, 250, 500, 1000],
      rush_order = false,
      simulate_broker_tier = null
    } = req.body;

    // Validate required fields
    if (!category_id || !product_id || !base_price) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        required: ['category_id', 'product_id', 'base_price']
      });
    }

    // Get current broker profile if exists
    const { data: profile, error: profileError } = await supabase
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
      .eq('user_id', user.id)
      .eq('broker_applications.status', 'approved')
      .single();

    let brokerProfile = null;
    if (!profileError && profile) {
      // Create a simplified broker profile for pricing
      const brokerData = profile.broker_applications[0];
      brokerProfile = {
        id: brokerData.id,
        user_id: user.id,
        company_name: brokerData.company_name,
        broker_tier: pricingCalculator.estimateTierByVolume(parseInt(brokerData.annual_volume)),
        status: 'active',
        category_discounts: profile.broker_category_discounts || [],
        volume_tier: {
          tier_name: 'Standard',
          minimum_volume: 10000,
          discount_multiplier: 1.2,
          additional_benefits: []
        },
        annual_volume_committed: parseInt(brokerData.annual_volume),
        current_year_volume: parseInt(brokerData.annual_volume) * 0.6, // Simulate 60% progress
        joined_date: profile.created_at,
        payment_terms: {
          net_days: 30,
          early_payment_discount: 2,
          credit_limit: parseInt(brokerData.annual_volume) * 0.1,
          credit_status: 'approved' as const
        },
        contact_person: {
          name: `${profile.first_name} ${profile.last_name}`,
          email: profile.email || '',
          phone: profile.phone || ''
        },
        shipping_preferences: {
          preferred_carrier: 'UPS',
          rush_order_eligible: true
        }
      };
    }

    // Override broker tier if simulating
    if (simulate_broker_tier && brokerProfile) {
      brokerProfile.broker_tier = pricingCalculator.getBrokerTiers()
        .find(tier => tier.name === simulate_broker_tier) || brokerProfile.broker_tier;
    }

    // Calculate pricing for different quantities
    const pricingMatrix = quantities.map(quantity => {
      const pricingContext: PricingContext = {
        user_id: user.id,
        is_broker: !!brokerProfile,
        broker_profile: brokerProfile || undefined,
        category_id,
        product_id,
        quantity: parseInt(quantity),
        base_price: parseFloat(base_price),
        rush_order: Boolean(rush_order)
      };

      const calculation = pricingCalculator.calculatePrice(pricingContext);
      const summary = discountCalculator.calculateDiscountSummary(calculation, brokerProfile);

      return {
        quantity: parseInt(quantity),
        unit_price: parseFloat(base_price),
        total_base_price: parseFloat(base_price) * parseInt(quantity),
        calculation,
        summary,
        unit_final_price: calculation.final_price / parseInt(quantity),
        savings_per_unit: calculation.savings / parseInt(quantity)
      };
    });

    // Calculate potential broker savings if not a broker
    let brokerPotential = null;
    if (!brokerProfile) {
      const sampleTier = pricingCalculator.getBrokerTiers()[1]; // Silver tier
      const sampleContext: PricingContext = {
        user_id: user.id,
        is_broker: true,
        broker_profile: {
          ...brokerProfile,
          broker_tier: sampleTier,
          category_discounts: [
            {
              category_id,
              category_name: 'Sample Category',
              discount_percentage: 8,
              minimum_quantity: 1,
              volume_multiplier: 1.2
            }
          ]
        } as any,
        category_id,
        product_id,
        quantity: 100,
        base_price: parseFloat(base_price),
        rush_order: false
      };

      const brokerCalculation = pricingCalculator.calculatePrice(sampleContext);
      const standardCalculation = pricingCalculator.calculatePrice({
        ...sampleContext,
        is_broker: false,
        broker_profile: undefined
      });

      brokerPotential = {
        tier: sampleTier.display_name,
        sample_quantity: 100,
        standard_price: standardCalculation.final_price,
        broker_price: brokerCalculation.final_price,
        potential_savings: standardCalculation.final_price - brokerCalculation.final_price,
        savings_percentage: ((standardCalculation.final_price - brokerCalculation.final_price) / standardCalculation.final_price) * 100
      };
    }

    res.status(200).json({
      pricing_matrix: pricingMatrix,
      volume_breakpoints: pricingCalculator.getVolumeBreakpoints(),
      broker_tiers: pricingCalculator.getBrokerTiers(),
      is_broker: !!brokerProfile,
      current_tier: brokerProfile?.broker_tier?.display_name || null,
      broker_potential: brokerPotential,
      rush_order: Boolean(rush_order)
    });

  } catch (error) {
    console.error('Price preview error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}