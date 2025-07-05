import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { brokerService } from '@/services/broker';

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

    // Get broker profile
    const brokerProfile = await brokerService.getBrokerProfile(user.id);
    
    if (!brokerProfile) {
      // Check for pending application
      const { data: pendingApplication, error: appError } = await supabase
        .from('broker_applications')
        .select('id, status, created_at, company_name')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (appError && appError.code !== 'PGRST116') {
        throw appError;
      }

      if (pendingApplication) {
        return res.status(200).json({
          is_broker: false,
          application_status: pendingApplication.status,
          application_id: pendingApplication.id,
          company_name: pendingApplication.company_name,
          submitted_date: pendingApplication.created_at
        });
      }

      return res.status(200).json({
        is_broker: false,
        application_status: null,
        can_apply: true
      });
    }

    res.status(200).json({
      is_broker: true,
      broker_profile: brokerProfile,
      application_status: 'approved'
    });

  } catch (error) {
    console.error('Broker status error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}