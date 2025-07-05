export interface CustomerProfile {
  id: string;
  user_id: string;
  customer_status: 'active' | 'inactive' | 'prospect' | 'churned';
  lifecycle_stage: 'lead' | 'customer' | 'loyal' | 'at_risk' | 'lost';
  customer_value: number;
  lifetime_value: number;
  total_orders: number;
  average_order_value: number;
  last_order_date?: string;
  acquisition_date: string;
  acquisition_source?: string;
  preferred_contact_method: 'email' | 'phone' | 'sms';
  communication_preferences: CommunicationPreferences;
  tags: CustomerTag[];
  segments: CustomerSegment[];
  notes: CustomerNote[];
  interactions: CustomerInteraction[];
  created_at: string;
  updated_at: string;
}

export interface CommunicationPreferences {
  email_notifications: boolean;
  sms_notifications: boolean;
  marketing_emails: boolean;
  order_updates: boolean;
  promotional_offers: boolean;
  newsletter: boolean;
}

export interface CustomerTag {
  id: string;
  name: string;
  color: string;
  description?: string;
  created_by: string;
  created_at: string;
}

export interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  criteria: SegmentCriteria;
  auto_update: boolean;
  customer_count: number;
  created_at: string;
  updated_at: string;
}

export interface SegmentCriteria {
  order_count?: { min?: number; max?: number };
  total_spent?: { min?: number; max?: number };
  last_order_days?: { min?: number; max?: number };
  acquisition_source?: string[];
  customer_status?: string[];
  lifecycle_stage?: string[];
  tags?: string[];
}

export interface CustomerNote {
  id: string;
  customer_id: string;
  content: string;
  note_type: 'general' | 'support' | 'sales' | 'billing';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerInteraction {
  id: string;
  customer_id: string;
  interaction_type: 'email' | 'phone' | 'chat' | 'meeting' | 'order';
  subject: string;
  description?: string;
  outcome?: string;
  follow_up_date?: string;
  created_by: string;
  created_at: string;
}

export interface EmailInteraction {
  id: string;
  customer_id: string;
  email_address: string;
  subject: string;
  content: string;
  direction: 'inbound' | 'outbound';
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'replied';
  template_id?: string;
  campaign_id?: string;
  sent_at: string;
  opened_at?: string;
  clicked_at?: string;
  replied_at?: string;
}

export interface SupportTicket {
  id: string;
  customer_id: string;
  order_id?: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'order_issue' | 'billing' | 'technical' | 'general';
  assigned_to?: string;
  resolution?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface CustomerFeedback {
  id: string;
  customer_id: string;
  order_id?: string;
  rating: number;
  comment?: string;
  category: 'product' | 'service' | 'shipping' | 'overall';
  created_at: string;
}

export interface ExportRequest {
  id: string;
  export_type: 'customers' | 'segments' | 'interactions' | 'tickets';
  format: 'csv' | 'excel' | 'pdf';
  filters?: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  file_url?: string;
  created_by: string;
  created_at: string;
  completed_at?: string;
}

export interface CustomerListFilters {
  search?: string;
  status?: string[];
  lifecycle_stage?: string[];
  tags?: string[];
  segments?: string[];
  acquisition_source?: string[];
  date_range?: {
    start: string;
    end: string;
  };
}

export interface CustomerAnalytics {
  total_customers: number;
  active_customers: number;
  new_customers_this_month: number;
  churn_rate: number;
  average_customer_value: number;
  customer_lifetime_value: number;
  customer_acquisition_cost: number;
  top_segments: Array<{
    segment: string;
    count: number;
    percentage: number;
  }>;
  communication_stats: {
    email_open_rate: number;
    email_click_rate: number;
    response_rate: number;
  };
}