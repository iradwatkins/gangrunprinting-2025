import { useState, useEffect, useCallback } from 'react';
import { analyticsAPI } from '../api/analytics';
import type {
  DashboardMetrics,
  OrderAnalytics,
  CustomerAnalytics,
  RevenueAnalytics,
  ProductAnalytics,
  SystemAnalytics,
  AnalyticsReport,
  AnalyticsPeriod,
  ExportFormat
} from '../types/analytics';

export interface UseAnalyticsState {
  dashboardMetrics: DashboardMetrics | null;
  orderAnalytics: OrderAnalytics | null;
  customerAnalytics: CustomerAnalytics | null;
  revenueAnalytics: RevenueAnalytics | null;
  productAnalytics: ProductAnalytics | null;
  systemAnalytics: SystemAnalytics | null;
  reports: AnalyticsReport[];
  loading: boolean;
  error: string | null;
}

export interface UseAnalyticsActions {
  loadDashboardMetrics: (period?: AnalyticsPeriod) => Promise<void>;
  loadOrderAnalytics: (period?: AnalyticsPeriod) => Promise<void>;
  loadCustomerAnalytics: (period?: AnalyticsPeriod) => Promise<void>;
  loadRevenueAnalytics: (period?: AnalyticsPeriod) => Promise<void>;
  loadProductAnalytics: (period?: AnalyticsPeriod) => Promise<void>;
  loadSystemAnalytics: (period?: AnalyticsPeriod) => Promise<void>;
  loadReports: () => Promise<void>;
  createReport: (report: Partial<AnalyticsReport>) => Promise<AnalyticsReport>;
  updateReport: (id: string, updates: Partial<AnalyticsReport>) => Promise<AnalyticsReport>;
  runReport: (id: string) => Promise<any>;
  exportData: (reportId: string, format: ExportFormat) => Promise<{ exportId: string; status: string }>;
  refreshMetrics: () => Promise<void>;
  clearError: () => void;
}

export function useAnalytics(autoLoad = true): UseAnalyticsState & UseAnalyticsActions {
  const [state, setState] = useState<UseAnalyticsState>({
    dashboardMetrics: null,
    orderAnalytics: null,
    customerAnalytics: null,
    revenueAnalytics: null,
    productAnalytics: null,
    systemAnalytics: null,
    reports: [],
    loading: false,
    error: null
  });

  const setLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  };

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error, loading: false }));
  };

  const loadDashboardMetrics = useCallback(async (period: AnalyticsPeriod = 'month') => {
    try {
      setLoading(true);
      setError(null);
      
      const metrics = await analyticsAPI.getDashboardMetrics(period);
      setState(prev => ({
        ...prev,
        dashboardMetrics: metrics,
        orderAnalytics: metrics.order_analytics,
        customerAnalytics: metrics.customer_analytics,
        revenueAnalytics: metrics.revenue_analytics,
        productAnalytics: metrics.product_analytics,
        systemAnalytics: metrics.system_analytics,
        loading: false
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard metrics');
    }
  }, []);

  const loadOrderAnalytics = useCallback(async (period: AnalyticsPeriod = 'month') => {
    try {
      setLoading(true);
      setError(null);
      
      const analytics = await analyticsAPI.getOrderAnalytics(period);
      setState(prev => ({ ...prev, orderAnalytics: analytics, loading: false }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load order analytics');
    }
  }, []);

  const loadCustomerAnalytics = useCallback(async (period: AnalyticsPeriod = 'month') => {
    try {
      setLoading(true);
      setError(null);
      
      const analytics = await analyticsAPI.getCustomerAnalytics(period);
      setState(prev => ({ ...prev, customerAnalytics: analytics, loading: false }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load customer analytics');
    }
  }, []);

  const loadRevenueAnalytics = useCallback(async (period: AnalyticsPeriod = 'month') => {
    try {
      setLoading(true);
      setError(null);
      
      const analytics = await analyticsAPI.getRevenueAnalytics(period);
      setState(prev => ({ ...prev, revenueAnalytics: analytics, loading: false }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load revenue analytics');
    }
  }, []);

  const loadProductAnalytics = useCallback(async (period: AnalyticsPeriod = 'month') => {
    try {
      setLoading(true);
      setError(null);
      
      const analytics = await analyticsAPI.getProductAnalytics(period);
      setState(prev => ({ ...prev, productAnalytics: analytics, loading: false }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load product analytics');
    }
  }, []);

  const loadSystemAnalytics = useCallback(async (period: AnalyticsPeriod = 'month') => {
    try {
      setLoading(true);
      setError(null);
      
      const analytics = await analyticsAPI.getSystemAnalytics(period);
      setState(prev => ({ ...prev, systemAnalytics: analytics, loading: false }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load system analytics');
    }
  }, []);

  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const reports = await analyticsAPI.getReports();
      setState(prev => ({ ...prev, reports, loading: false }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports');
    }
  }, []);

  const createReport = useCallback(async (report: Partial<AnalyticsReport>) => {
    try {
      setLoading(true);
      setError(null);
      
      const newReport = await analyticsAPI.createReport(report);
      setState(prev => ({
        ...prev,
        reports: [newReport, ...prev.reports],
        loading: false
      }));
      
      return newReport;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create report');
      throw err;
    }
  }, []);

  const updateReport = useCallback(async (id: string, updates: Partial<AnalyticsReport>) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedReport = await analyticsAPI.updateReport(id, updates);
      setState(prev => ({
        ...prev,
        reports: prev.reports.map(r => r.id === id ? updatedReport : r),
        loading: false
      }));
      
      return updatedReport;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update report');
      throw err;
    }
  }, []);

  const runReport = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const results = await analyticsAPI.runReport(id);
      setLoading(false);
      
      return results;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run report');
      throw err;
    }
  }, []);

  const exportData = useCallback(async (reportId: string, format: ExportFormat) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await analyticsAPI.exportData(reportId, format);
      setLoading(false);
      
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export data');
      throw err;
    }
  }, []);

  const refreshMetrics = useCallback(async () => {
    await loadDashboardMetrics();
  }, [loadDashboardMetrics]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-load dashboard metrics on mount
  useEffect(() => {
    if (autoLoad) {
      loadDashboardMetrics();
    }
  }, [autoLoad, loadDashboardMetrics]);

  return {
    ...state,
    loadDashboardMetrics,
    loadOrderAnalytics,
    loadCustomerAnalytics,
    loadRevenueAnalytics,
    loadProductAnalytics,
    loadSystemAnalytics,
    loadReports,
    createReport,
    updateReport,
    runReport,
    exportData,
    refreshMetrics,
    clearError
  };
}