import { EmailTemplate } from '../../types/email';

const API_BASE = '/api/email/templates';

export const emailTemplateApi = {
  // List all email templates
  getTemplates: async (params?: {
    category?: string;
    active?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ templates: EmailTemplate[]; total: number }> => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append('category', params.category);
    if (params?.active !== undefined) searchParams.append('active', params.active.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());

    const response = await fetch(`${API_BASE}?${searchParams}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch templates: ${response.statusText}`);
    }
    return response.json();
  },

  // Get a specific template
  getTemplate: async (id: string): Promise<EmailTemplate> => {
    const response = await fetch(`${API_BASE}/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch template: ${response.statusText}`);
    }
    return response.json();
  },

  // Create a new template
  createTemplate: async (template: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<EmailTemplate> => {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(template),
    });
    if (!response.ok) {
      throw new Error(`Failed to create template: ${response.statusText}`);
    }
    return response.json();
  },

  // Update a template
  updateTemplate: async (id: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate> => {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      throw new Error(`Failed to update template: ${response.statusText}`);
    }
    return response.json();
  },

  // Delete a template
  deleteTemplate: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete template: ${response.statusText}`);
    }
  },

  // Clone a template
  cloneTemplate: async (id: string, name: string): Promise<EmailTemplate> => {
    const response = await fetch(`${API_BASE}/${id}/clone`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) {
      throw new Error(`Failed to clone template: ${response.statusText}`);
    }
    return response.json();
  },

  // Preview template with test data
  previewTemplate: async (id: string, testData?: Record<string, any>): Promise<{ html: string; text: string }> => {
    const response = await fetch(`${API_BASE}/${id}/preview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ testData }),
    });
    if (!response.ok) {
      throw new Error(`Failed to preview template: ${response.statusText}`);
    }
    return response.json();
  },

  // Send test email
  sendTestEmail: async (id: string, email: string, testData?: Record<string, any>): Promise<void> => {
    const response = await fetch(`${API_BASE}/${id}/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, testData }),
    });
    if (!response.ok) {
      throw new Error(`Failed to send test email: ${response.statusText}`);
    }
  },
};