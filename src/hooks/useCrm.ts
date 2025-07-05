import { useState, useEffect } from 'react';
import { crmService } from '@/services/crm';
import type {
  CustomerProfile,
  CustomerNote,
  CustomerInteraction,
  CustomerTag,
  CustomerSegment,
  SupportTicket,
  CustomerFeedback,
  CustomerListFilters,
  CustomerAnalytics,
  EmailInteraction
} from '@/types/crm';

export const useCrm = () => {
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCustomers = async (filters?: CustomerListFilters, page = 1, limit = 50) => {
    setLoading(true);
    setError(null);
    try {
      const data = await crmService.getCustomers(filters, page, limit);
      setCustomers(data || []);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch customers');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getCustomerProfile = async (customerId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await crmService.getCustomerProfile(customerId);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch customer profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCustomerProfile = async (customerId: string, updates: Partial<CustomerProfile>) => {
    setLoading(true);
    setError(null);
    try {
      const data = await crmService.updateCustomerProfile(customerId, updates);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update customer profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addCustomerNote = async (customerId: string, note: Omit<CustomerNote, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    setError(null);
    try {
      const data = await crmService.addCustomerNote(customerId, note);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add customer note');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addCustomerInteraction = async (interaction: Omit<CustomerInteraction, 'id' | 'created_at'>) => {
    setLoading(true);
    setError(null);
    try {
      const data = await crmService.addCustomerInteraction(interaction);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add customer interaction');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    customers,
    loading,
    error,
    getCustomers,
    getCustomerProfile,
    updateCustomerProfile,
    addCustomerNote,
    addCustomerInteraction
  };
};

export const useCustomerTags = () => {
  const [tags, setTags] = useState<CustomerTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTags = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await crmService.getCustomerTags();
      setTags(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tags');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createTag = async (tag: Omit<CustomerTag, 'id' | 'created_at'>) => {
    setLoading(true);
    setError(null);
    try {
      const data = await crmService.createCustomerTag(tag);
      setTags(prev => [...prev, data]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tag');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addTagToCustomer = async (customerId: string, tagId: string) => {
    setLoading(true);
    setError(null);
    try {
      await crmService.addTagToCustomer(customerId, tagId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add tag to customer');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeTagFromCustomer = async (customerId: string, tagId: string) => {
    setLoading(true);
    setError(null);
    try {
      await crmService.removeTagFromCustomer(customerId, tagId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove tag from customer');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTags();
  }, []);

  return {
    tags,
    loading,
    error,
    getTags,
    createTag,
    addTagToCustomer,
    removeTagFromCustomer
  };
};

export const useCustomerSegments = () => {
  const [segments, setSegments] = useState<CustomerSegment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSegments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await crmService.getCustomerSegments();
      setSegments(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch segments');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createSegment = async (segment: Omit<CustomerSegment, 'id' | 'created_at' | 'updated_at' | 'customer_count'>) => {
    setLoading(true);
    setError(null);
    try {
      const data = await crmService.createCustomerSegment(segment);
      setSegments(prev => [...prev, data]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create segment');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSegment = async (segmentId: string, updates: Partial<CustomerSegment>) => {
    setLoading(true);
    setError(null);
    try {
      const data = await crmService.updateCustomerSegment(segmentId, updates);
      setSegments(prev => prev.map(seg => seg.id === segmentId ? data : seg));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update segment');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSegments();
  }, []);

  return {
    segments,
    loading,
    error,
    getSegments,
    createSegment,
    updateSegment
  };
};

export const useSupportTickets = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTickets = async (customerId?: string, page = 1, limit = 50) => {
    setLoading(true);
    setError(null);
    try {
      const data = await crmService.getSupportTickets(customerId, page, limit);
      setTickets(data || []);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tickets');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async (ticket: Omit<SupportTicket, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    setError(null);
    try {
      const data = await crmService.createSupportTicket(ticket);
      setTickets(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create ticket');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTicket = async (ticketId: string, updates: Partial<SupportTicket>) => {
    setLoading(true);
    setError(null);
    try {
      const data = await crmService.updateSupportTicket(ticketId, updates);
      setTickets(prev => prev.map(ticket => ticket.id === ticketId ? data : ticket));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update ticket');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    tickets,
    loading,
    error,
    getTickets,
    createTicket,
    updateTicket
  };
};

export const useCustomerFeedback = () => {
  const [feedback, setFeedback] = useState<CustomerFeedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getFeedback = async (customerId?: string, page = 1, limit = 50) => {
    setLoading(true);
    setError(null);
    try {
      const data = await crmService.getCustomerFeedback(customerId, page, limit);
      setFeedback(data || []);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch feedback');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createFeedback = async (feedbackData: Omit<CustomerFeedback, 'id' | 'created_at'>) => {
    setLoading(true);
    setError(null);
    try {
      const data = await crmService.createCustomerFeedback(feedbackData);
      setFeedback(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create feedback');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    feedback,
    loading,
    error,
    getFeedback,
    createFeedback
  };
};

export const useEmailTracking = () => {
  const [interactions, setInteractions] = useState<EmailInteraction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trackEmail = async (interaction: Omit<EmailInteraction, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      const data = await crmService.trackEmailInteraction(interaction);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to track email');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getEmailInteractions = async (customerId: string, page = 1, limit = 50) => {
    setLoading(true);
    setError(null);
    try {
      const data = await crmService.getEmailInteractions(customerId, page, limit);
      setInteractions(data || []);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch email interactions');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    interactions,
    loading,
    error,
    trackEmail,
    getEmailInteractions
  };
};

export const useCustomerAnalytics = () => {
  const [analytics, setAnalytics] = useState<CustomerAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await crmService.getCustomerAnalytics();
      setAnalytics(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAnalytics();
  }, []);

  return {
    analytics,
    loading,
    error,
    getAnalytics
  };
};