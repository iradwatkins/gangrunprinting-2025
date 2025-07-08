import { EmailTemplate } from '../../types/email';

// Mock data for development
const mockTemplates: EmailTemplate[] = [
  {
    id: 'template-1',
    name: 'Welcome Email',
    description: 'Welcome new customers to Gang Run Printing',
    category: 'marketing',
    subject_line: 'Welcome to Gang Run Printing!',
    preview_text: 'Thank you for joining us',
    html_content: '<h1>Welcome!</h1><p>Thank you for choosing Gang Run Printing for your printing needs.</p>',
    text_content: 'Welcome! Thank you for choosing Gang Run Printing for your printing needs.',
    design_json: {
      version: '1.0',
      blocks: [
        {
          id: 'header',
          type: 'text',
          content: { text: 'Welcome to Gang Run Printing!' },
          styles: { fontSize: '24px', fontWeight: 'bold' },
          position: 1
        }
      ],
      settings: {
        background_color: '#ffffff',
        content_width: 600,
        font_family: 'Arial, sans-serif',
        font_size: 14
      }
    },
    is_active: true,
    created_by: 'admin',
    created_at: '2024-01-10T09:00:00Z',
    updated_at: '2024-01-10T09:00:00Z'
  },
  {
    id: 'template-2',
    name: 'Order Confirmation',
    description: 'Confirmation email for orders',
    category: 'transactional',
    subject_line: 'Your order has been confirmed',
    preview_text: 'Order details and next steps',
    html_content: '<h1>Order Confirmed</h1><p>Your order has been received and is being processed.</p>',
    text_content: 'Order Confirmed. Your order has been received and is being processed.',
    design_json: {
      version: '1.0',
      blocks: [
        {
          id: 'confirmation',
          type: 'text',
          content: { text: 'Your order has been confirmed' },
          styles: { fontSize: '20px' },
          position: 1
        }
      ],
      settings: {
        background_color: '#f8f9fa',
        content_width: 600,
        font_family: 'Arial, sans-serif',
        font_size: 14
      }
    },
    is_active: true,
    created_by: 'admin',
    created_at: '2024-01-12T11:00:00Z',
    updated_at: '2024-01-12T11:00:00Z'
  }
];

export const emailTemplateApi = {
  // List all email templates
  getTemplates: async (params?: {
    category?: string;
    active?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ templates: EmailTemplate[]; total: number }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let filteredTemplates = [...mockTemplates];
    
    if (params?.category && params.category !== 'all') {
      filteredTemplates = filteredTemplates.filter(t => t.category === params.category);
    }
    
    if (params?.active !== undefined) {
      filteredTemplates = filteredTemplates.filter(t => t.is_active === params.active);
    }
    
    const total = filteredTemplates.length;
    const offset = params?.offset || 0;
    const limit = params?.limit || 20;
    const paginatedTemplates = filteredTemplates.slice(offset, offset + limit);
    
    return { templates: paginatedTemplates, total };
  },

  // Get a specific template
  getTemplate: async (id: string): Promise<EmailTemplate> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const template = mockTemplates.find(t => t.id === id);
    if (!template) {
      throw new Error(`Template with id ${id} not found`);
    }
    return template;
  },

  // Create a new template
  createTemplate: async (template: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<EmailTemplate> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newTemplate: EmailTemplate = {
      ...template,
      id: `template-${mockTemplates.length + 1}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    mockTemplates.push(newTemplate);
    return newTemplate;
  },

  // Update a template
  updateTemplate: async (id: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const index = mockTemplates.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error(`Template with id ${id} not found`);
    }
    
    mockTemplates[index] = {
      ...mockTemplates[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    return mockTemplates[index];
  },

  // Delete a template
  deleteTemplate: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = mockTemplates.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error(`Template with id ${id} not found`);
    }
    
    mockTemplates.splice(index, 1);
  },

  // Clone a template
  cloneTemplate: async (id: string, name: string): Promise<EmailTemplate> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const template = mockTemplates.find(t => t.id === id);
    if (!template) {
      throw new Error(`Template with id ${id} not found`);
    }
    
    const clonedTemplate: EmailTemplate = {
      ...template,
      id: `template-${mockTemplates.length + 1}`,
      name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    mockTemplates.push(clonedTemplate);
    return clonedTemplate;
  },

  // Preview template with test data
  previewTemplate: async (id: string, testData?: Record<string, any>): Promise<{ html: string; text: string }> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const template = mockTemplates.find(t => t.id === id);
    if (!template) {
      throw new Error(`Template with id ${id} not found`);
    }
    
    return {
      html: template.html_content,
      text: template.text_content
    };
  },

  // Send test email
  sendTestEmail: async (id: string, email: string, testData?: Record<string, any>): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const template = mockTemplates.find(t => t.id === id);
    if (!template) {
      throw new Error(`Template with id ${id} not found`);
    }
    
    // Simulate sending test email
    console.log(`Test email sent to ${email} using template: ${template.name}`);
  },
};