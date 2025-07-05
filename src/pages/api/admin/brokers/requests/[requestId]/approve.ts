import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

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

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile?.is_admin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { requestId } = req.query;

    if (!requestId) {
      return res.status(400).json({ message: 'Request ID is required' });
    }

    // Get the broker application
    const { data: application, error: appError } = await supabase
      .from('broker_applications')
      .select('*')
      .eq('id', requestId)
      .single();

    if (appError || !application) {
      return res.status(404).json({ message: 'Broker application not found' });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({ 
        message: `Application is already ${application.status}` 
      });
    }

    // Approve the application
    const { error: updateError } = await supabase
      .from('broker_applications')
      .update({
        status: 'approved',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (updateError) {
      throw updateError;
    }

    // Set up default broker category discounts based on tier
    const annualVolume = parseInt(application.annual_volume);
    const defaultDiscounts = [
      {
        category_id: 'business-cards',
        category_name: 'Business Cards',
        discount_percentage: annualVolume >= 500000 ? 20 : annualVolume >= 150000 ? 15 : annualVolume >= 50000 ? 10 : 5,
        minimum_quantity: 1,
        volume_multiplier: 1.2
      },
      {
        category_id: 'flyers',
        category_name: 'Flyers & Brochures',
        discount_percentage: annualVolume >= 500000 ? 18 : annualVolume >= 150000 ? 12 : annualVolume >= 50000 ? 8 : 3,
        minimum_quantity: 25,
        volume_multiplier: 1.1
      },
      {
        category_id: 'banners',
        category_name: 'Banners & Signs',
        discount_percentage: annualVolume >= 500000 ? 15 : annualVolume >= 150000 ? 10 : annualVolume >= 50000 ? 6 : 2,
        minimum_quantity: 1,
        volume_multiplier: 1.0
      }
    ];

    // Update user profile with broker discounts
    const { error: profileUpdateError } = await supabase
      .from('user_profiles')
      .update({
        broker_category_discounts: defaultDiscounts,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', application.user_id);

    if (profileUpdateError) {
      console.error('Failed to update broker discounts:', profileUpdateError);
    }

    // Log the approval
    const { error: logError } = await supabase
      .from('admin_logs')
      .insert({
        admin_user_id: user.id,
        action: 'approve_broker_application',
        entity_type: 'broker_application',
        entity_id: requestId,
        details: {
          company_name: application.company_name,
          annual_volume: application.annual_volume,
          business_type: application.business_type
        }
      });

    if (logError) {
      console.error('Failed to log admin action:', logError);
    }

    // TODO: Send approval email notification
    // await sendBrokerApprovalEmail(application.user_id, application.company_name);

    res.status(200).json({
      message: 'Broker application approved successfully',
      application_id: requestId,
      approved_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Approve broker application error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}