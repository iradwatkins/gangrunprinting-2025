import { EmailAutomation } from '../../types/email';

// Mock automation data
const mockAutomations: EmailAutomation[] = [
  {
    id: '1',
    name: 'Welcome Series',
    description: 'Automated welcome email sequence for new customers',
    trigger_type: 'user_signup',
    trigger_conditions: { event: 'user_created' },
    steps: [
      {
        id: 'step_1',
        delay: { type: 'immediate' },
        action: {
          type: 'send_email',
          template_id: '1',
          personalization: {}
        }
      },
      {
        id: 'step_2',
        delay: { type: 'time', value: 3, unit: 'days' },
        action: {
          type: 'send_email',
          template_id: '2',
          personalization: {}
        }
      }
    ],
    is_active: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Abandoned Cart Recovery',
    description: 'Email sequence for customers who abandoned their cart',
    trigger_type: 'cart_abandoned',
    trigger_conditions: { 
      event: 'cart_abandoned',
      delay_hours: 1
    },
    steps: [
      {
        id: 'step_1',
        delay: { type: 'time', value: 1, unit: 'hours' },
        action: {
          type: 'send_email',
          template_id: '3',
          personalization: {}
        }
      },
      {
        id: 'step_2',
        delay: { type: 'time', value: 1, unit: 'days' },
        action: {
          type: 'send_email',
          template_id: '4',
          personalization: {}
        }
      }
    ],
    is_active: true,
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-01-20T10:00:00Z'
  },
  {
    id: '3',
    name: 'Order Follow-up',
    description: 'Follow-up emails after order completion',
    trigger_type: 'order_completed',
    trigger_conditions: { event: 'order_completed' },
    steps: [
      {
        id: 'step_1',
        delay: { type: 'time', value: 1, unit: 'days' },
        action: {
          type: 'send_email',
          template_id: '5',
          personalization: {}
        }
      },
      {
        id: 'step_2',
        delay: { type: 'time', value: 7, unit: 'days' },
        action: {
          type: 'send_email',
          template_id: '6',
          personalization: {}
        }
      }
    ],
    is_active: false,
    created_at: '2024-01-25T10:00:00Z',
    updated_at: '2024-01-25T10:00:00Z'
  }
];

export const emailAutomationApi = {
  // Get all automations - simple method for React Query
  getAll: async (): Promise<EmailAutomation[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockAutomations;
  },

  // Create automation - for React Query mutations
  create: async (automation: Omit<EmailAutomation, 'id' | 'created_at' | 'updated_at'>): Promise<EmailAutomation> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const newAutomation: EmailAutomation = {
      ...automation,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    mockAutomations.push(newAutomation);
    return newAutomation;
  },

  // Update automation - for React Query mutations
  update: async (id: string, updates: Partial<EmailAutomation>): Promise<EmailAutomation> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const index = mockAutomations.findIndex(a => a.id === id);
    if (index === -1) {
      throw new Error('Automation not found');
    }
    
    const updatedAutomation = {
      ...mockAutomations[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    mockAutomations[index] = updatedAutomation;
    return updatedAutomation;
  },

  // Delete automation - for React Query mutations
  delete: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const index = mockAutomations.findIndex(a => a.id === id);
    if (index === -1) {
      throw new Error('Automation not found');
    }
    
    mockAutomations.splice(index, 1);
  },

  // List all automations
  getAutomations: async (params?: {
    active?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ automations: EmailAutomation[]; total: number }> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let filteredAutomations = [...mockAutomations];
    
    // Apply active filter
    if (params?.active !== undefined) {
      filteredAutomations = filteredAutomations.filter(a => a.is_active === params.active);
    }
    
    // Apply pagination
    const limit = params?.limit || 50;
    const offset = params?.offset || 0;
    const paginatedAutomations = filteredAutomations.slice(offset, offset + limit);
    
    return {
      automations: paginatedAutomations,
      total: filteredAutomations.length
    };
  },

  // Get a specific automation
  getAutomation: async (id: string): Promise<EmailAutomation> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const automation = mockAutomations.find(a => a.id === id);
    if (!automation) {
      throw new Error('Automation not found');
    }
    
    return automation;
  },

  // Create a new automation
  createAutomation: async (automation: Omit<EmailAutomation, 'id' | 'created_at' | 'updated_at'>): Promise<EmailAutomation> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const newAutomation: EmailAutomation = {
      ...automation,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    mockAutomations.push(newAutomation);
    return newAutomation;
  },

  // Update an automation
  updateAutomation: async (id: string, updates: Partial<EmailAutomation>): Promise<EmailAutomation> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = mockAutomations.findIndex(a => a.id === id);
    if (index === -1) {
      throw new Error('Automation not found');
    }
    
    const updatedAutomation = {
      ...mockAutomations[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    mockAutomations[index] = updatedAutomation;
    return updatedAutomation;
  },

  // Delete an automation
  deleteAutomation: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const index = mockAutomations.findIndex(a => a.id === id);
    if (index === -1) {
      throw new Error('Automation not found');
    }
    
    mockAutomations.splice(index, 1);
  },

  // Activate/deactivate an automation
  toggleAutomation: async (id: string, active: boolean): Promise<EmailAutomation> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const automation = mockAutomations.find(a => a.id === id);
    if (!automation) {
      throw new Error('Automation not found');
    }
    
    automation.is_active = active;
    automation.updated_at = new Date().toISOString();
    
    return automation;
  },

  // Get automation analytics
  getAutomationAnalytics: async (id: string, params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<any> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      automation_id: id,
      total_triggered: Math.floor(Math.random() * 1000) + 100,
      total_completed: Math.floor(Math.random() * 800) + 80,
      completion_rate: 85.2,
      steps: [
        {
          step_id: 'step_1',
          emails_sent: Math.floor(Math.random() * 1000) + 100,
          open_rate: 42.5,
          click_rate: 12.3
        },
        {
          step_id: 'step_2',
          emails_sent: Math.floor(Math.random() * 800) + 80,
          open_rate: 38.7,
          click_rate: 9.8
        }
      ],
      revenue_generated: Math.floor(Math.random() * 50000) + 10000
    };
  },

  // Test automation
  testAutomation: async (id: string, testEmail: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`Testing automation ${id} with email ${testEmail}`);
  },

  // Duplicate automation
  duplicateAutomation: async (id: string, newName: string): Promise<EmailAutomation> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const automation = mockAutomations.find(a => a.id === id);
    if (!automation) {
      throw new Error('Automation not found');
    }
    
    const duplicatedAutomation: EmailAutomation = {
      ...automation,
      id: Date.now().toString(),
      name: newName,
      is_active: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    mockAutomations.push(duplicatedAutomation);
    return duplicatedAutomation;
  }
};