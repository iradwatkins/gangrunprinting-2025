import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  EmailTemplate, 
  EmailCampaign, 
  CustomerSegment, 
  EmailAutomation,
  EmailDesign,
  EmailBlock
} from '../../src/types/email';
import { 
  emailTemplateApi, 
  emailCampaignApi, 
  emailSegmentApi, 
  emailAutomationApi,
  emailAnalyticsApi 
} from '../../src/api/email';
import { 
  EmailPersonalizationEngine, 
  ProductRecommendationEngine,
  emailPersonalizationUtils 
} from '../../src/utils/email/personalization';

// Mock fetch
global.fetch = vi.fn();

describe('Email Marketing System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Email Templates', () => {
    const mockTemplate: EmailTemplate = {
      id: 'template-1',
      name: 'Test Template',
      description: 'A test template',
      category: 'marketing',
      subject_line: 'Test Subject',
      preview_text: 'Preview text',
      html_content: '<p>Hello {{first_name}}</p>',
      text_content: 'Hello {{first_name}}',
      design_json: {
        version: '1.0',
        blocks: [],
        settings: {
          background_color: '#ffffff',
          content_width: 600,
          font_family: 'Arial',
          font_size: 14
        }
      },
      is_active: true,
      created_by: 'user-1',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    };

    it('should fetch templates successfully', async () => {
      const mockResponse = { templates: [mockTemplate], total: 1 };
      (fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await emailTemplateApi.getTemplates();
      
      expect(fetch).toHaveBeenCalledWith('/api/email/templates?');
      expect(result).toEqual(mockResponse);
    });

    it('should create template successfully', async () => {
      const newTemplate = { ...mockTemplate };
      delete (newTemplate as any).id;
      delete (newTemplate as any).created_at;
      delete (newTemplate as any).updated_at;

      (fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockTemplate)
      });

      const result = await emailTemplateApi.createTemplate(newTemplate);
      
      expect(fetch).toHaveBeenCalledWith('/api/email/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTemplate)
      });
      expect(result).toEqual(mockTemplate);
    });

    it('should update template successfully', async () => {
      const updates = { name: 'Updated Template' };
      const updatedTemplate = { ...mockTemplate, ...updates };

      (fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(updatedTemplate)
      });

      const result = await emailTemplateApi.updateTemplate(mockTemplate.id, updates);
      
      expect(fetch).toHaveBeenCalledWith(`/api/email/templates/${mockTemplate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      expect(result).toEqual(updatedTemplate);
    });

    it('should delete template successfully', async () => {
      (fetch as any).mockResolvedValue({ ok: true });

      await emailTemplateApi.deleteTemplate(mockTemplate.id);
      
      expect(fetch).toHaveBeenCalledWith(`/api/email/templates/${mockTemplate.id}`, {
        method: 'DELETE'
      });
    });

    it('should handle API errors gracefully', async () => {
      (fetch as any).mockResolvedValue({
        ok: false,
        statusText: 'Not Found'
      });

      await expect(emailTemplateApi.getTemplate('invalid-id')).rejects.toThrow('Failed to fetch template: Not Found');
    });
  });

  describe('Email Campaigns', () => {
    const mockCampaign: EmailCampaign = {
      id: 'campaign-1',
      name: 'Test Campaign',
      description: 'A test campaign',
      template_id: 'template-1',
      segment_ids: ['segment-1'],
      status: 'draft',
      time_zone: 'UTC',
      personalization_rules: [],
      created_by: 'user-1',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      analytics: {
        total_sent: 0,
        delivered: 0,
        bounced: 0,
        opened: 0,
        clicked: 0,
        unsubscribed: 0,
        spam_complaints: 0,
        open_rate: 0,
        click_rate: 0,
        bounce_rate: 0
      }
    };

    it('should create campaign successfully', async () => {
      const newCampaign = { ...mockCampaign };
      delete (newCampaign as any).id;
      delete (newCampaign as any).created_at;
      delete (newCampaign as any).updated_at;
      delete (newCampaign as any).analytics;

      (fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockCampaign)
      });

      const result = await emailCampaignApi.createCampaign(newCampaign);
      
      expect(fetch).toHaveBeenCalledWith('/api/email/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCampaign)
      });
      expect(result).toEqual(mockCampaign);
    });

    it('should send campaign successfully', async () => {
      (fetch as any).mockResolvedValue({ ok: true });

      await emailCampaignApi.sendCampaign(mockCampaign.id);
      
      expect(fetch).toHaveBeenCalledWith(`/api/email/campaigns/${mockCampaign.id}/send`, {
        method: 'POST'
      });
    });

    it('should schedule campaign successfully', async () => {
      const sendAt = '2024-12-25T09:00:00Z';
      (fetch as any).mockResolvedValue({ ok: true });

      await emailCampaignApi.scheduleCampaign(mockCampaign.id, sendAt);
      
      expect(fetch).toHaveBeenCalledWith(`/api/email/campaigns/${mockCampaign.id}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ send_at: sendAt })
      });
    });
  });

  describe('Customer Segments', () => {
    const mockSegment: CustomerSegment = {
      id: 'segment-1',
      name: 'VIP Customers',
      description: 'High value customers',
      conditions: [
        {
          field: 'total_spent',
          operator: 'greater_than',
          value: '1000',
          logic: 'and'
        }
      ],
      customer_count: 150,
      created_by: 'user-1',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    };

    it('should create segment successfully', async () => {
      const newSegment = { ...mockSegment };
      delete (newSegment as any).id;
      delete (newSegment as any).customer_count;
      delete (newSegment as any).created_at;
      delete (newSegment as any).updated_at;

      (fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockSegment)
      });

      const result = await emailSegmentApi.createSegment(newSegment);
      
      expect(fetch).toHaveBeenCalledWith('/api/email/segments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSegment)
      });
      expect(result).toEqual(mockSegment);
    });

    it('should get segment preview successfully', async () => {
      const mockPreview = {
        customers: [
          { id: '1', first_name: 'John', last_name: 'Doe', email: 'john@example.com', total_spent: 1500 }
        ],
        total: 150
      };

      (fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockPreview)
      });

      const result = await emailSegmentApi.getSegmentPreview(mockSegment.conditions, 10);
      
      expect(fetch).toHaveBeenCalledWith('/api/email/segments/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conditions: mockSegment.conditions, limit: 10 })
      });
      expect(result).toEqual(mockPreview);
    });
  });

  describe('Email Automation', () => {
    const mockAutomation: EmailAutomation = {
      id: 'automation-1',
      name: 'Welcome Series',
      description: 'Welcome new customers',
      trigger: {
        type: 'user_registered',
        config: {}
      },
      conditions: [],
      actions: [
        {
          type: 'send_email',
          template_id: 'template-1',
          delay_hours: 0,
          config: {}
        }
      ],
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    };

    it('should create automation successfully', async () => {
      const newAutomation = { ...mockAutomation };
      delete (newAutomation as any).id;
      delete (newAutomation as any).created_at;
      delete (newAutomation as any).updated_at;

      (fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockAutomation)
      });

      const result = await emailAutomationApi.createAutomation(newAutomation);
      
      expect(fetch).toHaveBeenCalledWith('/api/email/automations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAutomation)
      });
      expect(result).toEqual(mockAutomation);
    });

    it('should activate automation successfully', async () => {
      (fetch as any).mockResolvedValue({ ok: true });

      await emailAutomationApi.activateAutomation(mockAutomation.id);
      
      expect(fetch).toHaveBeenCalledWith(`/api/email/automations/${mockAutomation.id}/activate`, {
        method: 'POST'
      });
    });

    it('should test automation successfully', async () => {
      const testResult = { success: true, message: 'Test successful' };
      const testData = { customer_id: 'customer-1' };

      (fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(testResult)
      });

      const result = await emailAutomationApi.testAutomation(mockAutomation.id, testData);
      
      expect(fetch).toHaveBeenCalledWith(`/api/email/automations/${mockAutomation.id}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });
      expect(result).toEqual(testResult);
    });
  });

  describe('Email Analytics', () => {
    it('should track email open successfully', async () => {
      (fetch as any).mockResolvedValue({ ok: true });

      await emailAnalyticsApi.trackOpen('delivery-1', { user_agent: 'Test' });
      
      expect(fetch).toHaveBeenCalledWith('/api/email/track/open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delivery_id: 'delivery-1', metadata: { user_agent: 'Test' } })
      });
    });

    it('should track email click successfully', async () => {
      (fetch as any).mockResolvedValue({ ok: true });

      await emailAnalyticsApi.trackClick('delivery-1', 'https://example.com', { user_agent: 'Test' });
      
      expect(fetch).toHaveBeenCalledWith('/api/email/track/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          delivery_id: 'delivery-1', 
          link_url: 'https://example.com', 
          metadata: { user_agent: 'Test' } 
        })
      });
    });

    it('should get overall analytics successfully', async () => {
      const mockAnalytics = {
        timeline: [
          { name: '2024-01-01', sent: 100, opened: 30, clicked: 5 }
        ],
        totals: { sent: 100, opened: 30, clicked: 5 }
      };

      (fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockAnalytics)
      });

      const result = await emailAnalyticsApi.getOverallAnalytics({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        groupBy: 'day'
      });
      
      expect(fetch).toHaveBeenCalledWith('/api/email/analytics/overview?start_date=2024-01-01&end_date=2024-01-31&group_by=day');
      expect(result).toEqual(mockAnalytics);
    });
  });

  describe('Email Personalization', () => {
    const mockCustomerData = {
      id: 'customer-1',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      company: 'Acme Corp',
      total_orders: 5,
      total_spent: 1250,
      last_order_date: '2024-01-15T00:00:00Z',
      broker_name: 'Jane Smith',
      broker_discount: 15
    };

    describe('EmailPersonalizationEngine', () => {
      it('should personalize content with customer data', () => {
        const engine = new EmailPersonalizationEngine(mockCustomerData);
        const content = 'Hello {{first_name}}, you have spent {{total_spent}} with us!';
        
        const result = engine.personalizeContent(content);
        
        expect(result).toBe('Hello John, you have spent $1,250.00 with us!');
      });

      it('should handle missing data with fallbacks', () => {
        const customerWithoutName = { ...mockCustomerData, first_name: undefined };
        const engine = new EmailPersonalizationEngine(customerWithoutName as any);
        const content = 'Hello {{first_name}}!';
        
        const result = engine.personalizeContent(content);
        
        expect(result).toBe('Hello Friend!');
      });

      it('should apply custom personalization rules', () => {
        const rules = [
          {
            id: 'rule-1',
            field: 'custom_greeting',
            default_value: 'Valued Customer',
            condition: 'total_spent > 1000'
          }
        ];
        
        const engine = new EmailPersonalizationEngine(mockCustomerData, rules);
        const content = 'Hello {{custom_greeting}}!';
        
        const result = engine.personalizeContent(content);
        
        expect(result).toBe('Hello Valued Customer!');
      });

      it('should generate time-based greetings', () => {
        const engine = new EmailPersonalizationEngine(mockCustomerData);
        const content = '{{greeting}}!';
        
        const result = engine.personalizeContent(content);
        
        expect(result).toMatch(/^(Good morning|Good afternoon|Good evening), John!$/);
      });

      it('should determine customer tier correctly', () => {
        const engine = new EmailPersonalizationEngine(mockCustomerData);
        const content = 'You are a {{customer_tier}} customer';
        
        const result = engine.personalizeContent(content);
        
        expect(result).toBe('You are a Silver customer');
      });
    });

    describe('ProductRecommendationEngine', () => {
      it('should generate product recommendations', async () => {
        const customerWithHistory = {
          ...mockCustomerData,
          order_history: [
            {
              id: 'order-1',
              total: 150,
              items: [
                { product_name: 'Business Cards Premium', quantity: 2, price: 75 }
              ],
              date: '2024-01-01T00:00:00Z'
            }
          ]
        };

        const engine = new ProductRecommendationEngine(customerWithHistory);
        const recommendations = await engine.generateRecommendations(2);
        
        expect(recommendations).toHaveLength(2);
        expect(recommendations[0]).toHaveProperty('id');
        expect(recommendations[0]).toHaveProperty('name');
        expect(recommendations[0]).toHaveProperty('confidence_score');
        expect(recommendations[0].confidence_score).toBeGreaterThan(0);
      });
    });

    describe('Utility Functions', () => {
      it('should validate personalization variables', () => {
        const content = 'Hello {{first_name}}, your order {{order_id}} is ready!';
        const variables = emailPersonalizationUtils.validatePersonalizationVariables(content);
        
        expect(variables).toEqual(['first_name', 'order_id']);
      });

      it('should generate dynamic subject lines', () => {
        const template = 'Welcome {{first_name}} - {{company}} Exclusive Offer';
        const result = emailPersonalizationUtils.generateDynamicSubjectLine(template, mockCustomerData);
        
        expect(result).toBe('Welcome John - Acme Corp Exclusive Offer');
      });

      it('should get available personalization variables', () => {
        const variables = emailPersonalizationUtils.getAvailableVariables();
        
        expect(variables).toBeInstanceOf(Array);
        expect(variables.length).toBeGreaterThan(0);
        expect(variables[0]).toHaveProperty('variable');
        expect(variables[0]).toHaveProperty('description');
        expect(variables[0]).toHaveProperty('example');
      });
    });
  });

  describe('Integration Tests', () => {
    it('should complete email campaign workflow', async () => {
      // Mock successful API responses for the entire workflow
      (fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ templates: [mockTemplate], total: 1 })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ segments: [mockSegment], total: 1 })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockCampaign)
        })
        .mockResolvedValueOnce({ ok: true });

      // 1. Get templates
      const templates = await emailTemplateApi.getTemplates();
      expect(templates.templates).toHaveLength(1);

      // 2. Get segments
      const segments = await emailSegmentApi.getSegments();
      expect(segments.segments).toHaveLength(1);

      // 3. Create campaign
      const campaignData = {
        name: 'Integration Test Campaign',
        template_id: templates.templates[0].id,
        segment_ids: [segments.segments[0].id],
        status: 'draft' as const,
        time_zone: 'UTC',
        personalization_rules: [],
        created_by: 'user-1'
      };
      
      const campaign = await emailCampaignApi.createCampaign(campaignData);
      expect(campaign.id).toBe('campaign-1');

      // 4. Send campaign
      await emailCampaignApi.sendCampaign(campaign.id);
      
      expect(fetch).toHaveBeenCalledTimes(4);
    });

    it('should handle email template with personalization', () => {
      const template = {
        html_content: '<p>Hello {{first_name}}, your {{customer_tier}} discount is {{broker_discount}}!</p>',
        subject_line: 'Special offer for {{first_name}}!'
      };

      const personalizedSubject = emailPersonalizationUtils.generateDynamicSubjectLine(
        template.subject_line, 
        mockCustomerData
      );
      
      const personalizedContent = emailPersonalizationUtils.personalizeEmailContent(
        template.html_content, 
        mockCustomerData
      );

      expect(personalizedSubject).toBe('Special offer for John!');
      expect(personalizedContent).toBe('<p>Hello John, your Silver discount is 15%!</p>');
    });
  });
});

// Additional test utilities
export const emailTestUtils = {
  createMockTemplate: (overrides: Partial<EmailTemplate> = {}): EmailTemplate => ({
    id: 'test-template',
    name: 'Test Template',
    description: 'Test description',
    category: 'marketing',
    subject_line: 'Test Subject',
    preview_text: 'Test preview',
    html_content: '<p>Test content</p>',
    text_content: 'Test content',
    design_json: {
      version: '1.0',
      blocks: [],
      settings: {
        background_color: '#ffffff',
        content_width: 600,
        font_family: 'Arial',
        font_size: 14
      }
    },
    is_active: true,
    created_by: 'test-user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides
  }),

  createMockCampaign: (overrides: Partial<EmailCampaign> = {}): EmailCampaign => ({
    id: 'test-campaign',
    name: 'Test Campaign',
    description: 'Test description',
    template_id: 'test-template',
    segment_ids: ['test-segment'],
    status: 'draft',
    time_zone: 'UTC',
    personalization_rules: [],
    created_by: 'test-user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    analytics: {
      total_sent: 0,
      delivered: 0,
      bounced: 0,
      opened: 0,
      clicked: 0,
      unsubscribed: 0,
      spam_complaints: 0,
      open_rate: 0,
      click_rate: 0,
      bounce_rate: 0
    },
    ...overrides
  }),

  createMockSegment: (overrides: Partial<CustomerSegment> = {}): CustomerSegment => ({
    id: 'test-segment',
    name: 'Test Segment',
    description: 'Test description',
    conditions: [
      {
        field: 'email',
        operator: 'exists',
        value: '',
        logic: 'and'
      }
    ],
    customer_count: 100,
    created_by: 'test-user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides
  })
};