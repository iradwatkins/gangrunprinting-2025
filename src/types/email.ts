export interface EmailTemplate {
  id: string;
  name: string;
  description?: string;
  category: 'marketing' | 'transactional' | 'promotional';
  subject_line: string;
  preview_text?: string;
  html_content: string;
  text_content: string;
  design_json: EmailDesign;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface EmailDesign {
  version: string;
  blocks: EmailBlock[];
  settings: {
    background_color: string;
    content_width: number;
    font_family: string;
    font_size: number;
  };
}

export interface EmailBlock {
  id: string;
  type: 'text' | 'image' | 'button' | 'product' | 'divider' | 'social';
  content: Record<string, any>;
  styles: Record<string, any>;
  position: number;
}

export interface EmailCampaign {
  id: string;
  name: string;
  description?: string;
  template_id: string;
  segment_ids: string[];
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled';
  send_at?: string;
  time_zone: string;
  ab_testing?: ABTestConfig;
  personalization_rules: PersonalizationRule[];
  created_by: string;
  created_at: string;
  updated_at: string;
  analytics: CampaignAnalytics;
}

export interface ABTestConfig {
  enabled: boolean;
  test_percentage: number;
  variants: {
    subject_a: string;
    subject_b: string;
    content_a?: string;
    content_b?: string;
  };
  winner_metric: 'open_rate' | 'click_rate' | 'conversion_rate';
}

export interface PersonalizationRule {
  id: string;
  field: string;
  default_value?: string;
  condition?: string;
}

export interface CampaignAnalytics {
  total_sent: number;
  delivered: number;
  bounced: number;
  opened: number;
  clicked: number;
  unsubscribed: number;
  spam_complaints: number;
  open_rate: number;
  click_rate: number;
  bounce_rate: number;
}

export interface EmailAutomation {
  id: string;
  name: string;
  description?: string;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AutomationTrigger {
  type: 'order_created' | 'order_shipped' | 'cart_abandoned' | 'user_registered' | 'date_based';
  config: Record<string, any>;
}

export interface AutomationCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
}

export interface AutomationAction {
  type: 'send_email' | 'add_tag' | 'update_segment' | 'wait';
  delay_hours?: number;
  template_id?: string;
  config: Record<string, any>;
}

export interface CustomerSegment {
  id: string;
  name: string;
  description?: string;
  conditions: SegmentCondition[];
  customer_count: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface SegmentCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in' | 'exists' | 'not_exists';
  value: any;
  logic: 'and' | 'or';
}

export interface EmailDelivery {
  id: string;
  campaign_id: string;
  customer_id: string;
  email_address: string;
  status: 'pending' | 'sent' | 'delivered' | 'bounced' | 'failed';
  opened: boolean;
  clicked: boolean;
  unsubscribed: boolean;
  spam_complaint: boolean;
  sent_at?: string;
  opened_at?: string;
  clicked_at?: string;
  bounce_reason?: string;
  error_message?: string;
}

export interface EmailEvent {
  id: string;
  delivery_id: string;
  event_type: 'sent' | 'delivered' | 'bounced' | 'opened' | 'clicked' | 'unsubscribed' | 'spam_complaint';
  event_data: Record<string, any>;
  timestamp: string;
  user_agent?: string;
  ip_address?: string;
}

export interface EmailListImport {
  id: string;
  filename: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  total_records: number;
  valid_records: number;
  invalid_records: number;
  error_log?: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface EmailPreferences {
  customer_id: string;
  opt_in_marketing: boolean;
  opt_in_transactional: boolean;
  preferred_frequency: 'daily' | 'weekly' | 'monthly' | 'never';
  categories: string[];
  unsubscribe_token: string;
  created_at: string;
  updated_at: string;
}