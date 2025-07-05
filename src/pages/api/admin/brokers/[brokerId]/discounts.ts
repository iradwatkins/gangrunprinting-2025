import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import type { CategoryDiscount } from '@/types/broker';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

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

    const { brokerId } = req.query;
    const { discounts } = req.body;

    if (!brokerId || !Array.isArray(discounts)) {
      return res.status(400).json({ 
        message: 'Invalid request data',
        required: ['brokerId', 'discounts (array)']
      });
    }

    // Validate discount structure
    const validDiscounts = discounts.every((discount: any) => 
      discount.category_id && 
      discount.category_name && 
      typeof discount.discount_percentage === 'number' &&
      discount.discount_percentage >= 0 &&
      discount.discount_percentage <= 100
    );

    if (!validDiscounts) {
      return res.status(400).json({ 
        message: 'Invalid discount structure',
        required: ['category_id', 'category_name', 'discount_percentage (0-100)']
      });
    }

    // Get broker user_id
    const { data: brokerApp, error: brokerError } = await supabase
      .from('broker_applications')
      .select('user_id')
      .eq('id', brokerId)
      .single();

    if (brokerError || !brokerApp) {
      return res.status(404).json({ message: 'Broker not found' });
    }

    // Update category discounts
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        broker_category_discounts: discounts,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', brokerApp.user_id);

    if (updateError) {
      throw updateError;
    }

    // Log the discount update
    const { error: logError } = await supabase
      .from('admin_logs')
      .insert({
        admin_user_id: user.id,
        action: 'update_broker_discounts',
        entity_type: 'broker',
        entity_id: brokerId,
        details: {
          updated_discounts: discounts.length,
          categories: discounts.map((d: CategoryDiscount) => d.category_name)
        }
      });

    if (logError) {
      console.error('Failed to log admin action:', logError);
    }

    res.status(200).json({
      message: 'Broker discounts updated successfully',
      updated_discounts: discounts.length
    });

  } catch (error) {
    console.error('Update broker discounts error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}