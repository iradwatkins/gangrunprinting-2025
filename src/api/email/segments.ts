import { CustomerSegment } from '../../types/email';

const API_BASE = '/api/email/segments';

export const emailSegmentApi = {
  // List all segments
  getSegments: async (params?: {
    limit?: number;
    offset?: number;
  }): Promise<{ segments: CustomerSegment[]; total: number }> => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());

    const response = await fetch(`${API_BASE}?${searchParams}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch segments: ${response.statusText}`);
    }
    return response.json();
  },

  // Get a specific segment
  getSegment: async (id: string): Promise<CustomerSegment> => {
    const response = await fetch(`${API_BASE}/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch segment: ${response.statusText}`);
    }
    return response.json();
  },

  // Create a new segment
  createSegment: async (segment: Omit<CustomerSegment, 'id' | 'customer_count' | 'created_at' | 'updated_at'>): Promise<CustomerSegment> => {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(segment),
    });
    if (!response.ok) {
      throw new Error(`Failed to create segment: ${response.statusText}`);
    }
    return response.json();
  },

  // Update a segment
  updateSegment: async (id: string, updates: Partial<CustomerSegment>): Promise<CustomerSegment> => {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      throw new Error(`Failed to update segment: ${response.statusText}`);
    }
    return response.json();
  },

  // Delete a segment
  deleteSegment: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete segment: ${response.statusText}`);
    }
  },

  // Get segment preview (customers that would match)
  getSegmentPreview: async (conditions: CustomerSegment['conditions'], limit?: number): Promise<{ customers: any[]; total: number }> => {
    const response = await fetch(`${API_BASE}/preview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ conditions, limit }),
    });
    if (!response.ok) {
      throw new Error(`Failed to get segment preview: ${response.statusText}`);
    }
    return response.json();
  },

  // Get segment customers
  getSegmentCustomers: async (id: string, params?: {
    limit?: number;
    offset?: number;
  }): Promise<{ customers: any[]; total: number }> => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());

    const response = await fetch(`${API_BASE}/${id}/customers?${searchParams}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch segment customers: ${response.statusText}`);
    }
    return response.json();
  },

  // Export segment customers
  exportSegmentCustomers: async (id: string, format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> => {
    const response = await fetch(`${API_BASE}/${id}/export?format=${format}`);
    if (!response.ok) {
      throw new Error(`Failed to export segment customers: ${response.statusText}`);
    }
    return response.blob();
  },

  // Refresh segment (recalculate customer count)
  refreshSegment: async (id: string): Promise<CustomerSegment> => {
    const response = await fetch(`${API_BASE}/${id}/refresh`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error(`Failed to refresh segment: ${response.statusText}`);
    }
    return response.json();
  },
};