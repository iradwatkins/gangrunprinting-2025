import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import type { BrokerTier } from '@/types/broker';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const supabase = createServerSupabaseClient({ req, res });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const brokerTiers: BrokerTier[] = [
      {
        id: 'bronze',
        name: 'bronze',
        display_name: 'Bronze',
        minimum_annual_volume: 10000,
        base_discount_percentage: 5,
        benefits: [
          '5% base discount on all orders',
          'Standard customer support',
          '30-day payment terms',
          'Free shipping on orders over $500'
        ],
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
        benefits: [
          '10% base discount on all orders',
          'Priority customer support',
          '30-day payment terms',
          '5% discount on rush orders',
          'Free shipping on orders over $300'
        ],
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
        benefits: [
          '15% base discount on all orders',
          'Dedicated account manager',
          '45-day payment terms',
          '10% discount on rush orders',
          'Free shipping on orders over $200',
          'Volume-based additional discounts'
        ],
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
        benefits: [
          '20% base discount on all orders',
          'White-glove service and support',
          '60-day payment terms',
          '15% discount on rush orders',
          'Free shipping on orders over $100',
          'Custom pricing negotiations',
          'Priority production scheduling'
        ],
        payment_terms_days: 60,
        rush_order_discount: 15,
        free_shipping_threshold: 100
      }
    ];

    res.status(200).json({
      tiers: brokerTiers,
      message: 'Broker tiers retrieved successfully'
    });

  } catch (error) {
    console.error('Broker tiers error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}