import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAnalytics } from '../useAnalytics';
import { analyticsAPI } from '../../api/analytics';
import type { DashboardMetrics, AnalyticsReport } from '../../types/analytics';

// Mock the analytics API
vi.mock('../../api/analytics');

const mockDashboardMetrics: DashboardMetrics = {
  order_analytics: {
    total_orders: 1250,
    orders_by_status: { pending: 45, processing: 120, completed: 980, cancelled: 105 },
    average_order_value: 85.50,
    order_volume_trend: [
      { date: '2024-01-01', value: 50 },
      { date: '2024-01-02', value: 75 }
    ],
    processing_time_avg: 2.5,
    vendor_performance: [],
    top_products: []
  },
  customer_analytics: {
    total_customers: 5200,
    new_customers: 280,
    returning_customers: 4920,
    customer_lifetime_value: 245.80,
    churn_rate: 3.2,
    acquisition_sources: {},
    segment_performance: [],
    behavior_flow: []
  },
  revenue_analytics: {
    total_revenue: 125000,
    revenue_growth: 12.5,
    revenue_by_category: {},
    revenue_by_vendor: {},
    profit_margins: [],
    broker_vs_retail: {
      broker_revenue: 75000,
      retail_revenue: 50000,
      broker_orders: 800,
      retail_orders: 450
    },
    forecasted_revenue: []
  },
  product_analytics: {
    top_selling_products: [],
    product_performance: [],
    inventory_turnover: [],
    configuration_popularity: [],
    product_profitability: []
  },
  system_analytics: {
    api_response_times: [],
    error_rates: [],
    uptime_percentage: 99.9,
    database_performance: [],
    user_sessions: [],
    security_events: []
  },
  generated_at: '2024-01-15T10:00:00Z',
  period: 'month'
};

const mockReport: AnalyticsReport = {
  id: 'report-1',
  name: 'Monthly Sales Report',
  description: 'Comprehensive monthly sales analysis',
  report_type: 'custom',
  data_sources: [],
  filters: [],
  visualizations: [],
  export_formats: ['pdf', 'csv'],
  created_by: 'user-1',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-15T10:00:00Z'
};

const mockedAnalyticsAPI = {
  getDashboardMetrics: vi.fn(),
  getOrderAnalytics: vi.fn(),
  getCustomerAnalytics: vi.fn(),
  getRevenueAnalytics: vi.fn(),
  getProductAnalytics: vi.fn(),
  getSystemAnalytics: vi.fn(),
  getReports: vi.fn(),
  createReport: vi.fn(),
  updateReport: vi.fn(),
  runReport: vi.fn(),
  exportData: vi.fn()
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(analyticsAPI).getDashboardMetrics = mockedAnalyticsAPI.getDashboardMetrics;
  vi.mocked(analyticsAPI).getOrderAnalytics = mockedAnalyticsAPI.getOrderAnalytics;
  vi.mocked(analyticsAPI).getCustomerAnalytics = mockedAnalyticsAPI.getCustomerAnalytics;
  vi.mocked(analyticsAPI).getRevenueAnalytics = mockedAnalyticsAPI.getRevenueAnalytics;
  vi.mocked(analyticsAPI).getProductAnalytics = mockedAnalyticsAPI.getProductAnalytics;
  vi.mocked(analyticsAPI).getSystemAnalytics = mockedAnalyticsAPI.getSystemAnalytics;
  vi.mocked(analyticsAPI).getReports = mockedAnalyticsAPI.getReports;
  vi.mocked(analyticsAPI).createReport = mockedAnalyticsAPI.createReport;
  vi.mocked(analyticsAPI).updateReport = mockedAnalyticsAPI.updateReport;
  vi.mocked(analyticsAPI).runReport = mockedAnalyticsAPI.runReport;
  vi.mocked(analyticsAPI).exportData = mockedAnalyticsAPI.exportData;
});

describe('useAnalytics', () => {
  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useAnalytics(false));
    
    expect(result.current.dashboardMetrics).toBeNull();
    expect(result.current.orderAnalytics).toBeNull();
    expect(result.current.customerAnalytics).toBeNull();
    expect(result.current.revenueAnalytics).toBeNull();
    expect(result.current.productAnalytics).toBeNull();
    expect(result.current.systemAnalytics).toBeNull();
    expect(result.current.reports).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('auto-loads dashboard metrics when autoLoad is true', async () => {
    mockedAnalyticsAPI.getDashboardMetrics.mockResolvedValue(mockDashboardMetrics);
    
    renderHook(() => useAnalytics(true));
    
    await waitFor(() => {
      expect(mockedAnalyticsAPI.getDashboardMetrics).toHaveBeenCalledWith('month');
    });
  });

  it('does not auto-load when autoLoad is false', () => {
    renderHook(() => useAnalytics(false));
    
    expect(mockedAnalyticsAPI.getDashboardMetrics).not.toHaveBeenCalled();
  });

  it('loads dashboard metrics successfully', async () => {
    mockedAnalyticsAPI.getDashboardMetrics.mockResolvedValue(mockDashboardMetrics);
    
    const { result } = renderHook(() => useAnalytics(false));
    
    await act(async () => {
      await result.current.loadDashboardMetrics('week');
    });
    
    expect(mockedAnalyticsAPI.getDashboardMetrics).toHaveBeenCalledWith('week');
    expect(result.current.dashboardMetrics).toEqual(mockDashboardMetrics);
    expect(result.current.orderAnalytics).toEqual(mockDashboardMetrics.order_analytics);
    expect(result.current.customerAnalytics).toEqual(mockDashboardMetrics.customer_analytics);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('handles dashboard metrics loading error', async () => {
    const errorMessage = 'Failed to load dashboard metrics';
    mockedAnalyticsAPI.getDashboardMetrics.mockRejectedValue(new Error(errorMessage));
    
    const { result } = renderHook(() => useAnalytics(false));
    
    await act(async () => {
      await result.current.loadDashboardMetrics();
    });
    
    expect(result.current.dashboardMetrics).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(errorMessage);
  });

  it('loads order analytics successfully', async () => {
    mockedAnalyticsAPI.getOrderAnalytics.mockResolvedValue(mockDashboardMetrics.order_analytics);
    
    const { result } = renderHook(() => useAnalytics(false));
    
    await act(async () => {
      await result.current.loadOrderAnalytics('day');
    });
    
    expect(mockedAnalyticsAPI.getOrderAnalytics).toHaveBeenCalledWith('day');
    expect(result.current.orderAnalytics).toEqual(mockDashboardMetrics.order_analytics);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('loads customer analytics successfully', async () => {
    mockedAnalyticsAPI.getCustomerAnalytics.mockResolvedValue(mockDashboardMetrics.customer_analytics);
    
    const { result } = renderHook(() => useAnalytics(false));
    
    await act(async () => {
      await result.current.loadCustomerAnalytics('month');
    });
    
    expect(mockedAnalyticsAPI.getCustomerAnalytics).toHaveBeenCalledWith('month');
    expect(result.current.customerAnalytics).toEqual(mockDashboardMetrics.customer_analytics);
  });

  it('loads revenue analytics successfully', async () => {
    mockedAnalyticsAPI.getRevenueAnalytics.mockResolvedValue(mockDashboardMetrics.revenue_analytics);
    
    const { result } = renderHook(() => useAnalytics(false));
    
    await act(async () => {
      await result.current.loadRevenueAnalytics('quarter');
    });
    
    expect(mockedAnalyticsAPI.getRevenueAnalytics).toHaveBeenCalledWith('quarter');
    expect(result.current.revenueAnalytics).toEqual(mockDashboardMetrics.revenue_analytics);
  });

  it('loads product analytics successfully', async () => {
    mockedAnalyticsAPI.getProductAnalytics.mockResolvedValue(mockDashboardMetrics.product_analytics);
    
    const { result } = renderHook(() => useAnalytics(false));
    
    await act(async () => {
      await result.current.loadProductAnalytics('year');
    });
    
    expect(mockedAnalyticsAPI.getProductAnalytics).toHaveBeenCalledWith('year');
    expect(result.current.productAnalytics).toEqual(mockDashboardMetrics.product_analytics);
  });

  it('loads system analytics successfully', async () => {
    mockedAnalyticsAPI.getSystemAnalytics.mockResolvedValue(mockDashboardMetrics.system_analytics);
    
    const { result } = renderHook(() => useAnalytics(false));
    
    await act(async () => {
      await result.current.loadSystemAnalytics();
    });
    
    expect(mockedAnalyticsAPI.getSystemAnalytics).toHaveBeenCalledWith('month');
    expect(result.current.systemAnalytics).toEqual(mockDashboardMetrics.system_analytics);
  });

  it('loads reports successfully', async () => {
    const mockReports = [mockReport];
    mockedAnalyticsAPI.getReports.mockResolvedValue(mockReports);
    
    const { result } = renderHook(() => useAnalytics(false));
    
    await act(async () => {
      await result.current.loadReports();
    });
    
    expect(mockedAnalyticsAPI.getReports).toHaveBeenCalled();
    expect(result.current.reports).toEqual(mockReports);
  });

  it('creates report successfully', async () => {
    const newReportData = { name: 'New Report', report_type: 'custom' as const };
    mockedAnalyticsAPI.createReport.mockResolvedValue(mockReport);
    
    const { result } = renderHook(() => useAnalytics(false));
    
    let createdReport: AnalyticsReport;
    await act(async () => {
      createdReport = await result.current.createReport(newReportData);
    });
    
    expect(mockedAnalyticsAPI.createReport).toHaveBeenCalledWith(newReportData);
    expect(createdReport!).toEqual(mockReport);
    expect(result.current.reports).toContain(mockReport);
  });

  it('updates report successfully', async () => {
    const updates = { name: 'Updated Report Name' };
    const updatedReport = { ...mockReport, ...updates };
    mockedAnalyticsAPI.updateReport.mockResolvedValue(updatedReport);
    
    const { result } = renderHook(() => useAnalytics(false));
    
    // Set initial reports state
    await act(async () => {
      result.current.reports.push(mockReport);
    });
    
    let updatedReportResult: AnalyticsReport;
    await act(async () => {
      updatedReportResult = await result.current.updateReport(mockReport.id, updates);
    });
    
    expect(mockedAnalyticsAPI.updateReport).toHaveBeenCalledWith(mockReport.id, updates);
    expect(updatedReportResult!).toEqual(updatedReport);
  });

  it('runs report successfully', async () => {
    const reportResults = { data: 'mock results' };
    mockedAnalyticsAPI.runReport.mockResolvedValue(reportResults);
    
    const { result } = renderHook(() => useAnalytics(false));
    
    let runResults: any;
    await act(async () => {
      runResults = await result.current.runReport(mockReport.id);
    });
    
    expect(mockedAnalyticsAPI.runReport).toHaveBeenCalledWith(mockReport.id);
    expect(runResults).toEqual(reportResults);
  });

  it('exports data successfully', async () => {
    const exportResult = { exportId: 'export-123', status: 'started' };
    mockedAnalyticsAPI.exportData.mockResolvedValue(exportResult);
    
    const { result } = renderHook(() => useAnalytics(false));
    
    let exportResults: any;
    await act(async () => {
      exportResults = await result.current.exportData(mockReport.id, 'pdf');
    });
    
    expect(mockedAnalyticsAPI.exportData).toHaveBeenCalledWith(mockReport.id, 'pdf');
    expect(exportResults).toEqual(exportResult);
  });

  it('refreshes metrics correctly', async () => {
    mockedAnalyticsAPI.getDashboardMetrics.mockResolvedValue(mockDashboardMetrics);
    
    const { result } = renderHook(() => useAnalytics(false));
    
    await act(async () => {
      await result.current.refreshMetrics();
    });
    
    expect(mockedAnalyticsAPI.getDashboardMetrics).toHaveBeenCalledWith('month');
  });

  it('clears error correctly', async () => {
    const { result } = renderHook(() => useAnalytics(false));
    
    // Set error state first
    mockedAnalyticsAPI.getDashboardMetrics.mockRejectedValue(new Error('Test error'));
    await act(async () => {
      await result.current.loadDashboardMetrics();
    });
    
    expect(result.current.error).toBe('Test error');
    
    // Clear error
    act(() => {
      result.current.clearError();
    });
    
    expect(result.current.error).toBeNull();
  });

  it('sets loading state correctly during operations', async () => {
    // Create a promise that we can control
    let resolvePromise: (value: any) => void;
    const promise = new Promise(resolve => {
      resolvePromise = resolve;
    });
    
    mockedAnalyticsAPI.getDashboardMetrics.mockReturnValue(promise);
    
    const { result } = renderHook(() => useAnalytics(false));
    
    // Start loading
    act(() => {
      result.current.loadDashboardMetrics();
    });
    
    expect(result.current.loading).toBe(true);
    
    // Resolve the promise
    await act(async () => {
      resolvePromise!(mockDashboardMetrics);
      await promise;
    });
    
    expect(result.current.loading).toBe(false);
  });
});