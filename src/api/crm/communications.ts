import { supabase } from '@/integrations/supabase/client';
import type { EmailInteraction } from '@/types/crm';

export const trackEmailInteraction = async (interaction: Omit<EmailInteraction, 'id'>) => {
  const { data, error } = await supabase
    .from('email_interactions')
    .insert(interaction)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to track email interaction: ${error.message}`);
  }

  return data;
};

export const getEmailInteractions = async (customerId: string, page = 1, limit = 50) => {
  const { data, error } = await supabase
    .from('email_interactions')
    .select('*')
    .eq('customer_id', customerId)
    .range((page - 1) * limit, page * limit - 1)
    .order('sent_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch email interactions: ${error.message}`);
  }

  return data;
};

export const updateEmailStatus = async (interactionId: string, status: string, timestamp?: string) => {
  const updateData: any = { 
    status,
    updated_at: new Date().toISOString()
  };

  if (status === 'opened' && timestamp) {
    updateData.opened_at = timestamp;
  } else if (status === 'clicked' && timestamp) {
    updateData.clicked_at = timestamp;
  } else if (status === 'replied' && timestamp) {
    updateData.replied_at = timestamp;
  }

  const { data, error } = await supabase
    .from('email_interactions')
    .update(updateData)
    .eq('id', interactionId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update email status: ${error.message}`);
  }

  return data;
};

export const getCommunicationAnalytics = async (customerId?: string, dateRange?: { start: string; end: string }) => {
  let query = supabase
    .from('email_interactions')
    .select('status, sent_at, opened_at, clicked_at, replied_at');

  if (customerId) {
    query = query.eq('customer_id', customerId);
  }

  if (dateRange) {
    query = query
      .gte('sent_at', dateRange.start)
      .lte('sent_at', dateRange.end);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch communication analytics: ${error.message}`);
  }

  const totalSent = data?.length || 0;
  const totalOpened = data?.filter(email => email.opened_at).length || 0;
  const totalClicked = data?.filter(email => email.clicked_at).length || 0;
  const totalReplied = data?.filter(email => email.replied_at).length || 0;

  return {
    total_sent: totalSent,
    total_opened: totalOpened,
    total_clicked: totalClicked,
    total_replied: totalReplied,
    open_rate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
    click_rate: totalSent > 0 ? (totalClicked / totalSent) * 100 : 0,
    reply_rate: totalSent > 0 ? (totalReplied / totalSent) * 100 : 0
  };
};

export const getCustomerCommunicationHistory = async (customerId: string) => {
  const { data, error } = await supabase
    .from('email_interactions')
    .select('*')
    .eq('customer_id', customerId)
    .order('sent_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch communication history: ${error.message}`);
  }

  return data;
};