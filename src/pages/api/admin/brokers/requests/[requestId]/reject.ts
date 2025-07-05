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
    const { reason } = req.body;

    if (!requestId) {
      return res.status(400).json({ message: 'Request ID is required' });
    }

    if (!reason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
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

    // Reject the application
    const { error: updateError } = await supabase
      .from('broker_applications')
      .update({
        status: 'rejected',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        rejection_reason: reason,
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (updateError) {
      throw updateError;
    }

    // Log the rejection
    const { error: logError } = await supabase
      .from('admin_logs')
      .insert({
        admin_user_id: user.id,
        action: 'reject_broker_application',
        entity_type: 'broker_application',
        entity_id: requestId,
        details: {
          company_name: application.company_name,
          annual_volume: application.annual_volume,
          business_type: application.business_type,
          rejection_reason: reason
        }
      });

    if (logError) {
      console.error('Failed to log admin action:', logError);
    }

    // TODO: Send rejection email notification
    // await sendBrokerRejectionEmail(application.user_id, application.company_name, reason);

    res.status(200).json({
      message: 'Broker application rejected successfully',
      application_id: requestId,
      rejected_at: new Date().toISOString(),
      reason: reason
    });

  } catch (error) {
    console.error('Reject broker application error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}