import { EmailCampaign, CampaignAnalytics } from '../../types/email';

// Mock data for development
const mockCampaigns: EmailCampaign[] = [
  {
    id: '1',
    name: 'Welcome Campaign',
    description: 'Welcome new customers to Gang Run Printing',
    template_id: 'template-1',
    segment_ids: ['segment-1'],
    status: 'sent',
    time_zone: 'America/New_York',
    personalization_rules: [],
    created_by: 'admin',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    analytics: {
      delivered: 150,
      opened: 75,
      clicked: 25,
      unsubscribed: 2,
      bounced: 3,
      open_rate: 50,
      click_rate: 16.7,
      unsubscribe_rate: 1.3,
      bounce_rate: 2
    }
  },
  {
    id: '2',
    name: 'Holiday Promotions',
    description: 'Special offers for holiday season',
    template_id: 'template-2',
    segment_ids: ['segment-2'],
    status: 'draft',
    time_zone: 'America/New_York',
    personalization_rules: [],
    created_by: 'admin',
    created_at: '2024-01-20T14:30:00Z',
    updated_at: '2024-01-20T14:30:00Z',
    analytics: {
      delivered: 0,
      opened: 0,
      clicked: 0,
      unsubscribed: 0,
      bounced: 0,
      open_rate: 0,
      click_rate: 0,
      unsubscribe_rate: 0,
      bounce_rate: 0
    }
  }
];

export const emailCampaignApi = {
  // List all campaigns
  getCampaigns: async (params?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ campaigns: EmailCampaign[]; total: number }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let filteredCampaigns = [...mockCampaigns];
    
    if (params?.status && params.status !== 'all') {
      filteredCampaigns = filteredCampaigns.filter(c => c.status === params.status);
    }
    
    const total = filteredCampaigns.length;
    const offset = params?.offset || 0;
    const limit = params?.limit || 20;
    const paginatedCampaigns = filteredCampaigns.slice(offset, offset + limit);
    
    return { campaigns: paginatedCampaigns, total };
  },

  // Get a specific campaign
  getCampaign: async (id: string): Promise<EmailCampaign> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const campaign = mockCampaigns.find(c => c.id === id);
    if (!campaign) {
      throw new Error(`Campaign with id ${id} not found`);
    }
    return campaign;
  },

  // Create a new campaign
  createCampaign: async (campaign: Omit<EmailCampaign, 'id' | 'created_at' | 'updated_at' | 'analytics'>): Promise<EmailCampaign> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newCampaign: EmailCampaign = {
      ...campaign,
      id: (mockCampaigns.length + 1).toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      analytics: {
        delivered: 0,
        opened: 0,
        clicked: 0,
        unsubscribed: 0,
        bounced: 0,
        open_rate: 0,
        click_rate: 0,
        unsubscribe_rate: 0,
        bounce_rate: 0
      }
    };
    
    mockCampaigns.push(newCampaign);
    return newCampaign;
  },

  // Update a campaign
  updateCampaign: async (id: string, updates: Partial<EmailCampaign>): Promise<EmailCampaign> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const index = mockCampaigns.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error(`Campaign with id ${id} not found`);
    }
    
    mockCampaigns[index] = {
      ...mockCampaigns[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    return mockCampaigns[index];
  },

  // Delete a campaign
  deleteCampaign: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = mockCampaigns.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error(`Campaign with id ${id} not found`);
    }
    
    mockCampaigns.splice(index, 1);
  },

  // Send campaign
  sendCampaign: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const index = mockCampaigns.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error(`Campaign with id ${id} not found`);
    }
    
    mockCampaigns[index].status = 'sending';
    
    // Simulate completion after a delay
    setTimeout(() => {
      if (mockCampaigns[index]) {
        mockCampaigns[index].status = 'sent';
        mockCampaigns[index].updated_at = new Date().toISOString();
      }
    }, 3000);
  },

  // Schedule campaign
  scheduleCampaign: async (id: string, sendAt: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const index = mockCampaigns.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error(`Campaign with id ${id} not found`);
    }
    
    mockCampaigns[index].status = 'scheduled';
    mockCampaigns[index].send_at = sendAt;
    mockCampaigns[index].updated_at = new Date().toISOString();
  },

  // Pause campaign
  pauseCampaign: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = mockCampaigns.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error(`Campaign with id ${id} not found`);
    }
    
    mockCampaigns[index].status = 'paused';
    mockCampaigns[index].updated_at = new Date().toISOString();
  },

  // Resume campaign
  resumeCampaign: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = mockCampaigns.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error(`Campaign with id ${id} not found`);
    }
    
    mockCampaigns[index].status = 'sending';
    mockCampaigns[index].updated_at = new Date().toISOString();
  },

  // Cancel campaign
  cancelCampaign: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = mockCampaigns.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error(`Campaign with id ${id} not found`);
    }
    
    mockCampaigns[index].status = 'cancelled';
    mockCampaigns[index].updated_at = new Date().toISOString();
  },

  // Send test email for campaign
  sendTestEmail: async (id: string, email: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const campaign = mockCampaigns.find(c => c.id === id);
    if (!campaign) {
      throw new Error(`Campaign with id ${id} not found`);
    }
    
    // Simulate sending test email
    console.log(`Test email sent to ${email} for campaign: ${campaign.name}`);
  },

  // Get campaign analytics
  getCampaignAnalytics: async (id: string): Promise<CampaignAnalytics> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const campaign = mockCampaigns.find(c => c.id === id);
    if (!campaign) {
      throw new Error(`Campaign with id ${id} not found`);
    }
    
    return campaign.analytics;
  }
};