import { supabase } from '@/integrations/supabase/client';
import type { CustomerListFilters } from '@/types/crm';

export const getCustomers = async (filters?: CustomerListFilters, page = 1, limit = 50) => {
  let query = supabase
    .from('customer_profiles')
    .select(`
      *,
      user_profiles!inner(email, full_name, phone),
      customer_tags(id, name, color),
      customer_segments(id, name)
    `)
    .range((page - 1) * limit, page * limit - 1);

  if (filters?.search) {
    query = query.or(`user_profiles.email.ilike.%${filters.search}%,user_profiles.full_name.ilike.%${filters.search}%`);
  }

  if (filters?.status?.length) {
    query = query.in('customer_status', filters.status);
  }

  if (filters?.lifecycle_stage?.length) {
    query = query.in('lifecycle_stage', filters.lifecycle_stage);
  }

  if (filters?.date_range) {
    query = query
      .gte('created_at', filters.date_range.start)
      .lte('created_at', filters.date_range.end);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch customers: ${error.message}`);
  }

  return data;
};

export const getCustomerById = async (customerId: string) => {
  const { data, error } = await supabase
    .from('customer_profiles')
    .select(`
      *,
      user_profiles!inner(email, full_name, phone),
      customer_tags(id, name, color, description),
      customer_segments(id, name, description),
      customer_notes(id, content, note_type, created_by, created_at),
      customer_interactions(id, interaction_type, subject, description, outcome, created_at)
    `)
    .eq('id', customerId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch customer: ${error.message}`);
  }

  return data;
};

export const updateCustomer = async (customerId: string, updates: Record<string, any>) => {
  const { data, error } = await supabase
    .from('customer_profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', customerId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update customer: ${error.message}`);
  }

  return data;
};

export const addCustomerNote = async (customerId: string, note: Record<string, any>) => {
  const { data, error } = await supabase
    .from('customer_notes')
    .insert({
      ...note,
      customer_id: customerId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to add customer note: ${error.message}`);
  }

  return data;
};

export const addCustomerInteraction = async (interaction: Record<string, any>) => {
  const { data, error } = await supabase
    .from('customer_interactions')
    .insert({
      ...interaction,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to add customer interaction: ${error.message}`);
  }

  return data;
};