import { supabase } from '@/integrations/supabase/client';
import type {
  CustomerProfile,
  CustomerNote,
  CustomerInteraction,
  CustomerTag,
  CustomerSegment,
  SupportTicket,
  CustomerFeedback,
  ExportRequest,
  CustomerListFilters,
  CustomerAnalytics,
  EmailInteraction
} from '@/types/crm';

export class CRMService {
  async getCustomers(filters?: CustomerListFilters, page = 1, limit = 50) {
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
      query = query.ilike('user_profiles.email', `%${filters.search}%`);
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

    if (error) throw error;
    return data;
  }

  async getCustomerProfile(customerId: string): Promise<CustomerProfile | null> {
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

    if (error) throw error;
    return data;
  }

  async updateCustomerProfile(customerId: string, updates: Partial<CustomerProfile>) {
    const { data, error } = await supabase
      .from('customer_profiles')
      .update(updates)
      .eq('id', customerId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async addCustomerNote(customerId: string, note: Omit<CustomerNote, 'id' | 'created_at' | 'updated_at'>) {
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

    if (error) throw error;
    return data;
  }

  async addCustomerInteraction(interaction: Omit<CustomerInteraction, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('customer_interactions')
      .insert({
        ...interaction,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getCustomerTags(): Promise<CustomerTag[]> {
    const { data, error } = await supabase
      .from('customer_tags')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  }

  async createCustomerTag(tag: Omit<CustomerTag, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('customer_tags')
      .insert({
        ...tag,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async addTagToCustomer(customerId: string, tagId: string) {
    const { error } = await supabase
      .from('customer_tag_assignments')
      .insert({
        customer_id: customerId,
        tag_id: tagId,
        created_at: new Date().toISOString()
      });

    if (error) throw error;
  }

  async removeTagFromCustomer(customerId: string, tagId: string) {
    const { error } = await supabase
      .from('customer_tag_assignments')
      .delete()
      .eq('customer_id', customerId)
      .eq('tag_id', tagId);

    if (error) throw error;
  }

  async getCustomerSegments(): Promise<CustomerSegment[]> {
    const { data, error } = await supabase
      .from('customer_segments')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  }

  async createCustomerSegment(segment: Omit<CustomerSegment, 'id' | 'created_at' | 'updated_at' | 'customer_count'>) {
    const { data, error } = await supabase
      .from('customer_segments')
      .insert({
        ...segment,
        customer_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateCustomerSegment(segmentId: string, updates: Partial<CustomerSegment>) {
    const { data, error } = await supabase
      .from('customer_segments')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', segmentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getSupportTickets(customerId?: string, page = 1, limit = 50) {
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

    if (error) throw error;
    return data;
  }

  async createSupportTicket(ticket: Omit<SupportTicket, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('support_tickets')
      .insert({
        ...ticket,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateSupportTicket(ticketId: string, updates: Partial<SupportTicket>) {
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

    if (error) throw error;
    return data;
  }

  async getCustomerFeedback(customerId?: string, page = 1, limit = 50) {
    let query = supabase
      .from('customer_feedback')
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

    if (error) throw error;
    return data;
  }

  async createCustomerFeedback(feedback: Omit<CustomerFeedback, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('customer_feedback')
      .insert({
        ...feedback,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async trackEmailInteraction(interaction: Omit<EmailInteraction, 'id'>) {
    const { data, error } = await supabase
      .from('email_interactions')
      .insert(interaction)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getEmailInteractions(customerId: string, page = 1, limit = 50) {
    const { data, error } = await supabase
      .from('email_interactions')
      .select('*')
      .eq('customer_id', customerId)
      .range((page - 1) * limit, page * limit - 1)
      .order('sent_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async createExportRequest(request: Omit<ExportRequest, 'id' | 'created_at' | 'status'>) {
    const { data, error } = await supabase
      .from('export_requests')
      .insert({
        ...request,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getExportStatus(exportId: string) {
    const { data, error } = await supabase
      .from('export_requests')
      .select('*')
      .eq('id', exportId)
      .single();

    if (error) throw error;
    return data;
  }

  async getCustomerAnalytics(): Promise<CustomerAnalytics> {
    const { data: totalCustomers, error: totalError } = await supabase
      .from('customer_profiles')
      .select('id', { count: 'exact' });

    const { data: activeCustomers, error: activeError } = await supabase
      .from('customer_profiles')
      .select('id', { count: 'exact' })
      .eq('customer_status', 'active');

    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const { data: newCustomers, error: newError } = await supabase
      .from('customer_profiles')
      .select('id', { count: 'exact' })
      .gte('created_at', lastMonth.toISOString());

    if (totalError || activeError || newError) {
      throw new Error('Failed to fetch analytics data');
    }

    return {
      total_customers: totalCustomers?.length || 0,
      active_customers: activeCustomers?.length || 0,
      new_customers_this_month: newCustomers?.length || 0,
      churn_rate: 0,
      average_customer_value: 0,
      customer_lifetime_value: 0,
      customer_acquisition_cost: 0,
      top_segments: [],
      communication_stats: {
        email_open_rate: 0,
        email_click_rate: 0,
        response_rate: 0
      }
    };
  }

  async refreshCustomerMetrics(customerId: string) {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('total_amount, created_at')
      .eq('customer_id', customerId);

    if (error) throw error;

    const totalOrders = orders?.length || 0;
    const totalSpent = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
    const lastOrderDate = orders?.[0]?.created_at;

    await this.updateCustomerProfile(customerId, {
      total_orders: totalOrders,
      customer_value: totalSpent,
      average_order_value: averageOrderValue,
      last_order_date: lastOrderDate
    });
  }
}

export const crmService = new CRMService();