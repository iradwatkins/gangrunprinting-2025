import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

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

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile?.is_admin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { status = 'pending' } = req.query;

    // Get pending broker applications
    const { data: requests, error: requestsError } = await supabase
      .from('broker_applications')
      .select(`
        *,
        user_profiles!inner(
          user_id,
          first_name,
          last_name,
          email,
          phone,
          company_name
        )
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (requestsError) {
      throw requestsError;
    }

    const formattedRequests = requests.map(request => ({
      id: request.id,
      user_id: request.user_id,
      request_type: 'new_application',
      status: request.status,
      company_name: request.company_name,
      business_type: request.business_type,
      tax_id: request.tax_id,
      annual_volume: request.annual_volume,
      business_justification: request.additional_info || '',
      documents: {},
      submitted_date: request.created_at,
      reviewed_date: request.updated_at,
      reviewed_by: request.reviewed_by,
      admin_notes: request.rejection_reason,
      applicant: {
        name: `${request.user_profiles.first_name} ${request.user_profiles.last_name}`,
        email: request.user_profiles.email,
        phone: request.user_profiles.phone
      }
    }));

    res.status(200).json({
      requests: formattedRequests,
      total: formattedRequests.length,
      status: status
    });

  } catch (error) {
    console.error('Broker requests error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}