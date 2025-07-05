import { useState, useEffect, useCallback } from 'react';
import { 
  EmailTemplate, 
  EmailCampaign, 
  CustomerSegment, 
  EmailAutomation,
  CampaignAnalytics 
} from '../types/email';
import { 
  emailTemplateApi, 
  emailCampaignApi, 
  emailSegmentApi, 
  emailAutomationApi,
  emailAnalyticsApi 
} from '../api/email';

// Template management hook
export const useEmailTemplates = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async (filters?: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await emailTemplateApi.getTemplates(filters);
      setTemplates(response.templates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTemplate = useCallback(async (templateData: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null);
      const newTemplate = await emailTemplateApi.createTemplate(templateData);
      setTemplates(prev => [newTemplate, ...prev]);
      return newTemplate;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create template');
      throw err;
    }
  }, []);

  const updateTemplate = useCallback(async (id: string, updates: Partial<EmailTemplate>) => {
    try {
      setError(null);
      const updatedTemplate = await emailTemplateApi.updateTemplate(id, updates);
      setTemplates(prev => prev.map(t => t.id === id ? updatedTemplate : t));
      return updatedTemplate;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update template');
      throw err;
    }
  }, []);

  const deleteTemplate = useCallback(async (id: string) => {
    try {
      setError(null);
      await emailTemplateApi.deleteTemplate(id);
      setTemplates(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete template');
      throw err;
    }
  }, []);

  const cloneTemplate = useCallback(async (id: string, name: string) => {
    try {
      setError(null);
      const clonedTemplate = await emailTemplateApi.cloneTemplate(id, name);
      setTemplates(prev => [clonedTemplate, ...prev]);
      return clonedTemplate;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clone template');
      throw err;
    }
  }, []);

  const sendTestEmail = useCallback(async (id: string, email: string, testData?: Record<string, any>) => {
    try {
      setError(null);
      await emailTemplateApi.sendTestEmail(id, email, testData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send test email');
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return {
    templates,
    loading,
    error,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    cloneTemplate,
    sendTestEmail,
  };
};

// Campaign management hook
export const useEmailCampaigns = () => {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async (filters?: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await emailCampaignApi.getCampaigns(filters);
      setCampaigns(response.campaigns);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  }, []);

  const createCampaign = useCallback(async (campaignData: Omit<EmailCampaign, 'id' | 'created_at' | 'updated_at' | 'analytics'>) => {
    try {
      setError(null);
      const newCampaign = await emailCampaignApi.createCampaign(campaignData);
      setCampaigns(prev => [newCampaign, ...prev]);
      return newCampaign;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create campaign');
      throw err;
    }
  }, []);

  const updateCampaign = useCallback(async (id: string, updates: Partial<EmailCampaign>) => {
    try {
      setError(null);
      const updatedCampaign = await emailCampaignApi.updateCampaign(id, updates);
      setCampaigns(prev => prev.map(c => c.id === id ? updatedCampaign : c));
      return updatedCampaign;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update campaign');
      throw err;
    }
  }, []);

  const sendCampaign = useCallback(async (id: string) => {
    try {
      setError(null);
      await emailCampaignApi.sendCampaign(id);
      await fetchCampaigns(); // Refresh to get updated status
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send campaign');
      throw err;
    }
  }, [fetchCampaigns]);

  const scheduleCampaign = useCallback(async (id: string, sendAt: string) => {
    try {
      setError(null);
      await emailCampaignApi.scheduleCampaign(id, sendAt);
      await fetchCampaigns(); // Refresh to get updated status
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule campaign');
      throw err;
    }
  }, [fetchCampaigns]);

  const pauseCampaign = useCallback(async (id: string) => {
    try {
      setError(null);
      await emailCampaignApi.pauseCampaign(id);
      await fetchCampaigns();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pause campaign');
      throw err;
    }
  }, [fetchCampaigns]);

  const resumeCampaign = useCallback(async (id: string) => {
    try {
      setError(null);
      await emailCampaignApi.resumeCampaign(id);
      await fetchCampaigns();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resume campaign');
      throw err;
    }
  }, [fetchCampaigns]);

  const cancelCampaign = useCallback(async (id: string) => {
    try {
      setError(null);
      await emailCampaignApi.cancelCampaign(id);
      await fetchCampaigns();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel campaign');
      throw err;
    }
  }, [fetchCampaigns]);

  const deleteCampaign = useCallback(async (id: string) => {
    try {
      setError(null);
      await emailCampaignApi.deleteCampaign(id);
      setCampaigns(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete campaign');
      throw err;
    }
  }, []);

  const getCampaignAnalytics = useCallback(async (id: string): Promise<CampaignAnalytics> => {
    try {
      setError(null);
      return await emailCampaignApi.getAnalytics(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  return {
    campaigns,
    loading,
    error,
    fetchCampaigns,
    createCampaign,
    updateCampaign,
    sendCampaign,
    scheduleCampaign,
    pauseCampaign,
    resumeCampaign,
    cancelCampaign,
    deleteCampaign,
    getCampaignAnalytics,
  };
};

// Segment management hook
export const useEmailSegments = () => {
  const [segments, setSegments] = useState<CustomerSegment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSegments = useCallback(async (filters?: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await emailSegmentApi.getSegments(filters);
      setSegments(response.segments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch segments');
    } finally {
      setLoading(false);
    }
  }, []);

  const createSegment = useCallback(async (segmentData: Omit<CustomerSegment, 'id' | 'customer_count' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null);
      const newSegment = await emailSegmentApi.createSegment(segmentData);
      setSegments(prev => [newSegment, ...prev]);
      return newSegment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create segment');
      throw err;
    }
  }, []);

  const updateSegment = useCallback(async (id: string, updates: Partial<CustomerSegment>) => {
    try {
      setError(null);
      const updatedSegment = await emailSegmentApi.updateSegment(id, updates);
      setSegments(prev => prev.map(s => s.id === id ? updatedSegment : s));
      return updatedSegment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update segment');
      throw err;
    }
  }, []);

  const deleteSegment = useCallback(async (id: string) => {
    try {
      setError(null);
      await emailSegmentApi.deleteSegment(id);
      setSegments(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete segment');
      throw err;
    }
  }, []);

  const refreshSegment = useCallback(async (id: string) => {
    try {
      setError(null);
      const refreshedSegment = await emailSegmentApi.refreshSegment(id);
      setSegments(prev => prev.map(s => s.id === id ? refreshedSegment : s));
      return refreshedSegment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh segment');
      throw err;
    }
  }, []);

  const getSegmentPreview = useCallback(async (conditions: CustomerSegment['conditions'], limit?: number) => {
    try {
      setError(null);
      return await emailSegmentApi.getSegmentPreview(conditions, limit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to preview segment');
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchSegments();
  }, [fetchSegments]);

  return {
    segments,
    loading,
    error,
    fetchSegments,
    createSegment,
    updateSegment,
    deleteSegment,
    refreshSegment,
    getSegmentPreview,
  };
};

// Automation management hook
export const useEmailAutomations = () => {
  const [automations, setAutomations] = useState<EmailAutomation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAutomations = useCallback(async (filters?: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await emailAutomationApi.getAutomations(filters);
      setAutomations(response.automations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch automations');
    } finally {
      setLoading(false);
    }
  }, []);

  const createAutomation = useCallback(async (automationData: Omit<EmailAutomation, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null);
      const newAutomation = await emailAutomationApi.createAutomation(automationData);
      setAutomations(prev => [newAutomation, ...prev]);
      return newAutomation;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create automation');
      throw err;
    }
  }, []);

  const updateAutomation = useCallback(async (id: string, updates: Partial<EmailAutomation>) => {
    try {
      setError(null);
      const updatedAutomation = await emailAutomationApi.updateAutomation(id, updates);
      setAutomations(prev => prev.map(a => a.id === id ? updatedAutomation : a));
      return updatedAutomation;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update automation');
      throw err;
    }
  }, []);

  const deleteAutomation = useCallback(async (id: string) => {
    try {
      setError(null);
      await emailAutomationApi.deleteAutomation(id);
      setAutomations(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete automation');
      throw err;
    }
  }, []);

  const activateAutomation = useCallback(async (id: string) => {
    try {
      setError(null);
      await emailAutomationApi.activateAutomation(id);
      await fetchAutomations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to activate automation');
      throw err;
    }
  }, [fetchAutomations]);

  const deactivateAutomation = useCallback(async (id: string) => {
    try {
      setError(null);
      await emailAutomationApi.deactivateAutomation(id);
      await fetchAutomations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deactivate automation');
      throw err;
    }
  }, [fetchAutomations]);

  const triggerAutomation = useCallback(async (id: string, customerId: string, eventData?: Record<string, any>) => {
    try {
      setError(null);
      await emailAutomationApi.triggerAutomation(id, customerId, eventData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to trigger automation');
      throw err;
    }
  }, []);

  const testAutomation = useCallback(async (id: string, testData: Record<string, any>) => {
    try {
      setError(null);
      return await emailAutomationApi.testAutomation(id, testData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to test automation');
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchAutomations();
  }, [fetchAutomations]);

  return {
    automations,
    loading,
    error,
    fetchAutomations,
    createAutomation,
    updateAutomation,
    deleteAutomation,
    activateAutomation,
    deactivateAutomation,
    triggerAutomation,
    testAutomation,
  };
};

// Analytics hook
export const useEmailAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getOverallAnalytics = useCallback(async (params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'hour' | 'day' | 'week' | 'month';
  }) => {
    try {
      setLoading(true);
      setError(null);
      return await emailAnalyticsApi.getOverallAnalytics(params);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPerformanceMetrics = useCallback(async (params?: {
    startDate?: string;
    endDate?: string;
    campaignId?: string;
    templateId?: string;
  }) => {
    try {
      setError(null);
      return await emailAnalyticsApi.getPerformanceMetrics(params);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch performance metrics');
      throw err;
    }
  }, []);

  const getEngagementAnalytics = useCallback(async (params?: {
    startDate?: string;
    endDate?: string;
    segmentId?: string;
  }) => {
    try {
      setError(null);
      return await emailAnalyticsApi.getEngagementAnalytics(params);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch engagement analytics');
      throw err;
    }
  }, []);

  const exportAnalytics = useCallback(async (params: {
    type: 'campaigns' | 'templates' | 'segments' | 'automations';
    startDate?: string;
    endDate?: string;
    format?: 'csv' | 'xlsx';
  }) => {
    try {
      setError(null);
      return await emailAnalyticsApi.exportAnalytics(params);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export analytics');
      throw err;
    }
  }, []);

  return {
    loading,
    error,
    getOverallAnalytics,
    getPerformanceMetrics,
    getEngagementAnalytics,
    exportAnalytics,
  };
};