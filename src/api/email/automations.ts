import { EmailAutomation } from '../../types/email';

const API_BASE = '/api/email/automations';

export const emailAutomationApi = {
  // List all automations
  getAutomations: async (params?: {
    active?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ automations: EmailAutomation[]; total: number }> => {
    const searchParams = new URLSearchParams();
    if (params?.active !== undefined) searchParams.append('active', params.active.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());

    const response = await fetch(`${API_BASE}?${searchParams}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch automations: ${response.statusText}`);
    }
    return response.json();
  },

  // Get a specific automation
  getAutomation: async (id: string): Promise<EmailAutomation> => {
    const response = await fetch(`${API_BASE}/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch automation: ${response.statusText}`);
    }
    return response.json();
  },

  // Create a new automation
  createAutomation: async (automation: Omit<EmailAutomation, 'id' | 'created_at' | 'updated_at'>): Promise<EmailAutomation> => {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(automation),
    });
    if (!response.ok) {
      throw new Error(`Failed to create automation: ${response.statusText}`);
    }
    return response.json();
  },

  // Update an automation
  updateAutomation: async (id: string, updates: Partial<EmailAutomation>): Promise<EmailAutomation> => {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      throw new Error(`Failed to update automation: ${response.statusText}`);
    }
    return response.json();
  },

  // Delete an automation
  deleteAutomation: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete automation: ${response.statusText}`);
    }
  },

  // Activate an automation
  activateAutomation: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/${id}/activate`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error(`Failed to activate automation: ${response.statusText}`);
    }
  },

  // Deactivate an automation
  deactivateAutomation: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/${id}/deactivate`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error(`Failed to deactivate automation: ${response.statusText}`);
    }
  },

  // Manually trigger an automation
  triggerAutomation: async (id: string, customerId: string, eventData?: Record<string, any>): Promise<void> => {
    const response = await fetch(`${API_BASE}/${id}/trigger`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customer_id: customerId, event_data: eventData }),
    });
    if (!response.ok) {
      throw new Error(`Failed to trigger automation: ${response.statusText}`);
    }
  },

  // Get automation analytics
  getAutomationAnalytics: async (id: string, params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<any> => {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.append('start_date', params.startDate);
    if (params?.endDate) searchParams.append('end_date', params.endDate);

    const response = await fetch(`${API_BASE}/${id}/analytics?${searchParams}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch automation analytics: ${response.statusText}`);
    }
    return response.json();
  },

  // Get automation execution history
  getExecutionHistory: async (id: string, params?: {
    limit?: number;
    offset?: number;
  }): Promise<{ executions: any[]; total: number }> => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());

    const response = await fetch(`${API_BASE}/${id}/executions?${searchParams}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch execution history: ${response.statusText}`);
    }
    return response.json();
  },

  // Test automation
  testAutomation: async (id: string, testData: Record<string, any>): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE}/${id}/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    if (!response.ok) {
      throw new Error(`Failed to test automation: ${response.statusText}`);
    }
    return response.json();
  },

  // Clone automation
  cloneAutomation: async (id: string, name: string): Promise<EmailAutomation> => {
    const response = await fetch(`${API_BASE}/${id}/clone`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) {
      throw new Error(`Failed to clone automation: ${response.statusText}`);
    }
    return response.json();
  },
};