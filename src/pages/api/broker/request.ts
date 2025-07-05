import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { brokerService } from '@/services/broker';

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
      company_name,
      business_type,
      tax_id,
      annual_volume,
      business_address,
      additional_info
    } = req.body;

    // Validate required fields
    if (!company_name || !business_type || !tax_id || !annual_volume) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        required: ['company_name', 'business_type', 'tax_id', 'annual_volume']
      });
    }

    // Check if user already has a pending or approved application
    const { data: existingApplication, error: checkError } = await supabase
      .from('broker_applications')
      .select('id, status')
      .eq('user_id', user.id)
      .in('status', ['pending', 'approved'])
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingApplication) {
      return res.status(400).json({ 
        message: existingApplication.status === 'approved' 
          ? 'You already have an approved broker application'
          : 'You already have a pending broker application'
      });
    }

    const applicationId = await brokerService.requestBrokerStatus(user.id, {
      company_name,
      business_type,
      tax_id,
      annual_volume,
      business_address,
      additional_info
    });

    res.status(201).json({
      message: 'Broker application submitted successfully',
      application_id: applicationId,
      status: 'pending'
    });

  } catch (error) {
    console.error('Broker application error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}