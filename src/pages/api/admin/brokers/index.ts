import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { brokerService } from '@/services/broker';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const supabase = createServerSupabaseClient({ req, res });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile?.is_admin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    switch (req.method) {
      case 'GET':
        // Get all brokers
        const { data: brokers, error: brokersError } = await supabase
          .from('broker_applications')
          .select(`
            *,
            user_profiles!inner(
              user_id,
              first_name,
              last_name,
              email,
              phone,
              company_name,
              broker_category_discounts,
              created_at
            )
          `)
          .eq('status', 'approved');

        if (brokersError) {
          throw brokersError;
        }

        const brokerProfiles = await Promise.all(
          brokers.map(async (broker) => {
            const profile = await brokerService.getBrokerProfile(broker.user_profiles.user_id);
            return profile;
          })
        );

        res.status(200).json({
          brokers: brokerProfiles.filter(Boolean),
          total: brokerProfiles.length
        });
        break;

      case 'POST':
        // Create new broker (admin override)
        const { user_id, tier_id, category_discounts } = req.body;

        if (!user_id || !tier_id) {
          return res.status(400).json({ 
            message: 'Missing required fields',
            required: ['user_id', 'tier_id']
          });
        }

        // Create broker application
        const { data: newBroker, error: createError } = await supabase
          .from('broker_applications')
          .insert({
            user_id,
            company_name: 'Admin Created',
            business_type: 'Admin Override',
            tax_id: 'ADMIN-000',
            annual_volume: '50000',
            status: 'approved',
            approved_by: user.id,
            approved_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) {
          throw createError;
        }

        // Update category discounts
        if (category_discounts) {
          const { error: discountError } = await supabase
            .from('user_profiles')
            .update({
              broker_category_discounts: category_discounts
            })
            .eq('user_id', user_id);

          if (discountError) {
            throw discountError;
          }
        }

        res.status(201).json({
          message: 'Broker created successfully',
          broker: newBroker
        });
        break;

      default:
        res.status(405).json({ message: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Admin brokers error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}