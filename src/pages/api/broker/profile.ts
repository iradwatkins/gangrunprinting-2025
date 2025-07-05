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

    switch (req.method) {
      case 'GET':
        const brokerProfile = await brokerService.getBrokerProfile(user.id);
        
        if (!brokerProfile) {
          return res.status(404).json({ message: 'Broker profile not found' });
        }

        res.status(200).json({
          profile: brokerProfile
        });
        break;

      case 'PUT':
        // Update broker profile preferences
        const { shipping_preferences, contact_person } = req.body;
        
        const updateData: any = {};
        if (shipping_preferences) {
          updateData.shipping_preferences = shipping_preferences;
        }
        if (contact_person) {
          updateData.contact_person = contact_person;
        }

        const { error: updateError } = await supabase
          .from('user_profiles')
          .update(updateData)
          .eq('user_id', user.id);

        if (updateError) {
          throw updateError;
        }

        const updatedProfile = await brokerService.getBrokerProfile(user.id);
        res.status(200).json({
          message: 'Profile updated successfully',
          profile: updatedProfile
        });
        break;

      default:
        res.status(405).json({ message: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Broker profile error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}