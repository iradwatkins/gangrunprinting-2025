import { EmailCampaign, CampaignAnalytics } from '../../types/email';

const API_BASE = '/api/email/campaigns';

export const emailCampaignApi = {
  // List all campaigns
  getCampaigns: async (params?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ campaigns: EmailCampaign[]; total: number }> => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());

    const response = await fetch(`${API_BASE}?${searchParams}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch campaigns: ${response.statusText}`);
    }
    return response.json();
  },

  // Get a specific campaign
  getCampaign: async (id: string): Promise<EmailCampaign> => {
    const response = await fetch(`${API_BASE}/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch campaign: ${response.statusText}`);
    }
    return response.json();
  },

  // Create a new campaign
  createCampaign: async (campaign: Omit<EmailCampaign, 'id' | 'created_at' | 'updated_at' | 'analytics'>): Promise<EmailCampaign> => {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(campaign),
    });
    if (!response.ok) {
      throw new Error(`Failed to create campaign: ${response.statusText}`);
    }
    return response.json();
  },

  // Update a campaign
  updateCampaign: async (id: string, updates: Partial<EmailCampaign>): Promise<EmailCampaign> => {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      throw new Error(`Failed to update campaign: ${response.statusText}`);
    }
    return response.json();
  },

  // Delete a campaign
  deleteCampaign: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete campaign: ${response.statusText}`);
    }
  },

  // Send campaign
  sendCampaign: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/${id}/send`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error(`Failed to send campaign: ${response.statusText}`);
    }
  },

  // Schedule campaign
  scheduleCampaign: async (id: string, sendAt: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/${id}/schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ send_at: sendAt }),
    });
    if (!response.ok) {
      throw new Error(`Failed to schedule campaign: ${response.statusText}`);
    }
  },

  // Pause campaign
  pauseCampaign: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/${id}/pause`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error(`Failed to pause campaign: ${response.statusText}`);
    }
  },

  // Resume campaign
  resumeCampaign: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/${id}/resume`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error(`Failed to resume campaign: ${response.statusText}`);
    }
  },

  // Cancel campaign
  cancelCampaign: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/${id}/cancel`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error(`Failed to cancel campaign: ${response.statusText}`);
    }
  },

  // Send test email for campaign
  sendTestEmail: async (id: string, email: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/${id}/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      throw new Error(`Failed to send test email: ${response.statusText}`);
    }
  },

  // Get campaign analytics
  getAnalytics: async (id: string): Promise<CampaignAnalytics> => {
    const response = await fetch(`${API_BASE}/${id}/analytics`);
    if (!response.ok) {
      throw new Error(`Failed to fetch campaign analytics: ${response.statusText}`);
    }
    return response.json();
  },

  // Get detailed campaign analytics
  getDetailedAnalytics: async (id: string, params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'hour' | 'day' | 'week' | 'month';
  }): Promise<any> => {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.append('start_date', params.startDate);
    if (params?.endDate) searchParams.append('end_date', params.endDate);
    if (params?.groupBy) searchParams.append('group_by', params.groupBy);

    const response = await fetch(`${API_BASE}/${id}/analytics/detailed?${searchParams}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch detailed analytics: ${response.statusText}`);
    }
    return response.json();
  },

  // Clone campaign
  cloneCampaign: async (id: string, name: string): Promise<EmailCampaign> => {
    const response = await fetch(`${API_BASE}/${id}/clone`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) {
      throw new Error(`Failed to clone campaign: ${response.statusText}`);
    }
    return response.json();
  },
};