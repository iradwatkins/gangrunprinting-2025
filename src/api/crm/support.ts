import { supabase } from '@/integrations/supabase/client';
import type { SupportTicket } from '@/types/crm';

export const getSupportTickets = async (customerId?: string, page = 1, limit = 50) => {
  let query = supabase
    .from('support_tickets')
    .select(`
      *,
      customer_profiles!inner(user_profiles!inner(email, full_name))
    `)
    .range((page - 1) * limit, page * limit - 1)
    .order('created_at', { ascending: false });

  if (customerId) {
    query = query.eq('customer_id', customerId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch support tickets: ${error.message}`);
  }

  return data;
};

export const createSupportTicket = async (ticket: Omit<SupportTicket, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('support_tickets')
    .insert({
      ...ticket,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create support ticket: ${error.message}`);
  }

  return data;
};

export const updateSupportTicket = async (ticketId: string, updates: Partial<SupportTicket>) => {
  const { data, error } = await supabase
    .from('support_tickets')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
      ...(updates.status === 'resolved' && { resolved_at: new Date().toISOString() })
    })
    .eq('id', ticketId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update support ticket: ${error.message}`);
  }

  return data;
};

export const getTicketById = async (ticketId: string) => {
  const { data, error } = await supabase
    .from('support_tickets')
    .select(`
      *,
      customer_profiles!inner(user_profiles!inner(email, full_name))
    `)
    .eq('id', ticketId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch support ticket: ${error.message}`);
  }

  return data;
};

export const assignTicket = async (ticketId: string, assignedTo: string) => {
  const { data, error } = await supabase
    .from('support_tickets')
    .update({
      assigned_to: assignedTo,
      status: 'in_progress',
      updated_at: new Date().toISOString()
    })
    .eq('id', ticketId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to assign ticket: ${error.message}`);
  }

  return data;
};

export const resolveTicket = async (ticketId: string, resolution: string) => {
  const { data, error } = await supabase
    .from('support_tickets')
    .update({
      status: 'resolved',
      resolution,
      resolved_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', ticketId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to resolve ticket: ${error.message}`);
  }

  return data;
};