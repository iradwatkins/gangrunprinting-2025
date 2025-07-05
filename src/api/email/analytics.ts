import { EmailEvent } from '../../types/email';

const API_BASE = '/api/email';

export const emailAnalyticsApi = {
  // Track email open
  trackOpen: async (deliveryId: string, metadata?: Record<string, any>): Promise<void> => {
    const response = await fetch(`${API_BASE}/track/open`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ delivery_id: deliveryId, metadata }),
    });
    if (!response.ok) {
      throw new Error(`Failed to track open: ${response.statusText}`);
    }
  },

  // Track email click
  trackClick: async (deliveryId: string, linkUrl: string, metadata?: Record<string, any>): Promise<void> => {
    const response = await fetch(`${API_BASE}/track/click`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ delivery_id: deliveryId, link_url: linkUrl, metadata }),
    });
    if (!response.ok) {
      throw new Error(`Failed to track click: ${response.statusText}`);
    }
  },

  // Track unsubscribe
  trackUnsubscribe: async (deliveryId: string, reason?: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/track/unsubscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ delivery_id: deliveryId, reason }),
    });
    if (!response.ok) {
      throw new Error(`Failed to track unsubscribe: ${response.statusText}`);
    }
  },

  // Track bounce
  trackBounce: async (deliveryId: string, bounceType: 'hard' | 'soft', reason: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/track/bounce`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ delivery_id: deliveryId, bounce_type: bounceType, reason }),
    });
    if (!response.ok) {
      throw new Error(`Failed to track bounce: ${response.statusText}`);
    }
  },

  // Track spam complaint
  trackSpamComplaint: async (deliveryId: string, feedbackType?: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/track/spam`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ delivery_id: deliveryId, feedback_type: feedbackType }),
    });
    if (!response.ok) {
      throw new Error(`Failed to track spam complaint: ${response.statusText}`);
    }
  },

  // Get overall email analytics
  getOverallAnalytics: async (params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'hour' | 'day' | 'week' | 'month';
  }): Promise<any> => {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.append('start_date', params.startDate);
    if (params?.endDate) searchParams.append('end_date', params.endDate);
    if (params?.groupBy) searchParams.append('group_by', params.groupBy);

    const response = await fetch(`${API_BASE}/analytics/overview?${searchParams}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch overall analytics: ${response.statusText}`);
    }
    return response.json();
  },

  // Get email performance metrics
  getPerformanceMetrics: async (params?: {
    startDate?: string;
    endDate?: string;
    campaignId?: string;
    templateId?: string;
  }): Promise<any> => {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.append('start_date', params.startDate);
    if (params?.endDate) searchParams.append('end_date', params.endDate);
    if (params?.campaignId) searchParams.append('campaign_id', params.campaignId);
    if (params?.templateId) searchParams.append('template_id', params.templateId);

    const response = await fetch(`${API_BASE}/analytics/performance?${searchParams}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch performance metrics: ${response.statusText}`);
    }
    return response.json();
  },

  // Get engagement analytics
  getEngagementAnalytics: async (params?: {
    startDate?: string;
    endDate?: string;
    segmentId?: string;
  }): Promise<any> => {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.append('start_date', params.startDate);
    if (params?.endDate) searchParams.append('end_date', params.endDate);
    if (params?.segmentId) searchParams.append('segment_id', params.segmentId);

    const response = await fetch(`${API_BASE}/analytics/engagement?${searchParams}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch engagement analytics: ${response.statusText}`);
    }
    return response.json();
  },

  // Get email events
  getEmailEvents: async (params?: {
    deliveryId?: string;
    eventType?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ events: EmailEvent[]; total: number }> => {
    const searchParams = new URLSearchParams();
    if (params?.deliveryId) searchParams.append('delivery_id', params.deliveryId);
    if (params?.eventType) searchParams.append('event_type', params.eventType);
    if (params?.startDate) searchParams.append('start_date', params.startDate);
    if (params?.endDate) searchParams.append('end_date', params.endDate);
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());

    const response = await fetch(`${API_BASE}/events?${searchParams}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch email events: ${response.statusText}`);
    }
    return response.json();
  },

  // Get deliverability report
  getDeliverabilityReport: async (params?: {
    startDate?: string;
    endDate?: string;
    domain?: string;
  }): Promise<any> => {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.append('start_date', params.startDate);
    if (params?.endDate) searchParams.append('end_date', params.endDate);
    if (params?.domain) searchParams.append('domain', params.domain);

    const response = await fetch(`${API_BASE}/analytics/deliverability?${searchParams}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch deliverability report: ${response.statusText}`);
    }
    return response.json();
  },

  // Export analytics data
  exportAnalytics: async (params: {
    type: 'campaigns' | 'templates' | 'segments' | 'automations';
    startDate?: string;
    endDate?: string;
    format?: 'csv' | 'xlsx';
  }): Promise<Blob> => {
    const searchParams = new URLSearchParams();
    searchParams.append('type', params.type);
    if (params.startDate) searchParams.append('start_date', params.startDate);
    if (params.endDate) searchParams.append('end_date', params.endDate);
    if (params.format) searchParams.append('format', params.format);

    const response = await fetch(`${API_BASE}/analytics/export?${searchParams}`);
    if (!response.ok) {
      throw new Error(`Failed to export analytics: ${response.statusText}`);
    }
    return response.blob();
  },
};