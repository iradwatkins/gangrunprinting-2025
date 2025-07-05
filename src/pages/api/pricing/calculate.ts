import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { brokerService } from '@/services/broker';
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
      quantity,
      base_price,
      rush_order = false
    } = req.body;

    // Validate required fields
    if (!category_id || !product_id || !quantity || !base_price) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        required: ['category_id', 'product_id', 'quantity', 'base_price']
      });
    }

    // Get broker profile
    const brokerProfile = await brokerService.getBrokerProfile(user.id);
    
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

    const priceCalculation = pricingCalculator.calculatePrice(pricingContext);
    const discountSummary = discountCalculator.calculateDiscountSummary(priceCalculation, brokerProfile);

    res.status(200).json({
      pricing: priceCalculation,
      discount_summary: discountSummary,
      volume_breakpoints: pricingCalculator.getVolumeBreakpoints(),
      is_broker: !!brokerProfile,
      broker_tier: brokerProfile?.broker_tier?.display_name || null
    });

  } catch (error) {
    console.error('Price calculation error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}