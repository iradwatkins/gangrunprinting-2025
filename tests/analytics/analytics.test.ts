import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { analyticsAPI } from '../../src/api/analytics';
import type { AnalyticsPeriod } from '../../src/types/analytics';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      gte: vi.fn(() => ({
        data: [],
        error: null
      })),
      eq: vi.fn(() => ({
        single: vi.fn(() => ({
          data: null,
          error: null
        })),
        select: vi.fn(() => ({
          data: [],
          error: null
        }))
      })),
      order: vi.fn(() => ({
        data: [],
        error: null
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: null,
            error: null
          }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: null,
              error: null
            }))
          }))
        }))
      }))
    }))
  })),
  rpc: vi.fn(() => ({
    data: [],
    error: null
  })),
  storage: {
    from: vi.fn(() => ({
      download: vi.fn(() => ({
        data: new Blob(),
        error: null
      }))
    }))
  }
};

// Mock the supabase client import
vi.mock('../../src/integrations/supabase/client', () => ({
  supabase: mockSupabase
}));

// Sample test data
const mockOrdersData = [
  {
    id: '1',
    status: 'completed',
    total_amount: 150.00,
    created_at: '2024-01-01T10:00:00Z',
    completed_at: '2024-01-02T14:00:00Z',
    customer_id: 'customer-1'
  },
  {
    id: '2',
    status: 'processing',
    total_amount: 75.50,
    created_at: '2024-01-05T09:00:00Z',
    customer_id: 'customer-2'
  },
  {
    id: '3',
    status: 'pending',
    total_amount: 200.00,
    created_at: '2024-01-10T15:30:00Z',
    customer_id: 'customer-1'
  }
];

const mockCustomersData = [
  {
    id: 'customer-1',
    email: 'john@example.com',
    created_at: '2023-12-01T00:00:00Z'
  },
  {
    id: 'customer-2',
    email: 'jane@example.com',
    created_at: '2024-01-01T00:00:00Z'
  }
];

const mockTrendData = [
  { date: '2024-01-01', value: 5 },
  { date: '2024-01-02', value: 8 },
  { date: '2024-01-03', value: 12 },
  { date: '2024-01-04', value: 6 },
  { date: '2024-01-05', value: 10 }
];

const mockVendorData = [
  {
    vendor_id: 'vendor-1',
    vendor_name: 'Premium Print Co',
    total_orders: 150,
    average_processing_time: 24.5,
    completion_rate: 98.5,
    revenue: 15000
  },
  {
    vendor_id: 'vendor-2',
    vendor_name: 'Quick Print Ltd',
    total_orders: 89,
    average_processing_time: 18.2,
    completion_rate: 96.8,
    revenue: 8900
  }
];

const mockTopProductsData = [
  {
    product_id: 'product-1',
    product_name: 'Business Cards',
    orders: 75,
    revenue: 3750,
    units_sold: 15000
  },
  {
    product_id: 'product-2',
    product_name: 'Flyers',
    orders: 45,
    revenue: 2250,
    units_sold: 9000
  }
];

describe('Analytics Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Order Analytics Integration', () => {
    it('aggregates order data correctly for different periods', async () => {
      // Mock orders query
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          gte: vi.fn(() => ({
            data: mockOrdersData,
            error: null
          }))
        }))
      });

      // Mock RPC calls for aggregated data
      mockSupabase.rpc
        .mockResolvedValueOnce({ data: mockTrendData, error: null }) // order volume trend
        .mockResolvedValueOnce({ data: mockVendorData, error: null }) // vendor performance
        .mockResolvedValueOnce({ data: mockTopProductsData, error: null }); // top products

      const orderAnalytics = await analyticsAPI.getOrderAnalytics('month');

      expect(orderAnalytics.total_orders).toBe(3);
      expect(orderAnalytics.average_order_value).toBeCloseTo(141.83, 2);
      expect(orderAnalytics.orders_by_status).toEqual({
        completed: 1,
        processing: 1,
        pending: 1
      });
      expect(orderAnalytics.order_volume_trend).toEqual(mockTrendData);
      expect(orderAnalytics.vendor_performance).toEqual(mockVendorData);
      expect(orderAnalytics.top_products).toEqual(mockTopProductsData);
    });

    it('calculates processing time correctly', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          gte: vi.fn(() => ({
            data: mockOrdersData,
            error: null
          }))
        }))
      });

      mockSupabase.rpc
        .mockResolvedValue({ data: [], error: null });

      const orderAnalytics = await analyticsAPI.getOrderAnalytics('month');

      // Only one order has both created_at and completed_at
      // Time difference: 2024-01-02T14:00:00Z - 2024-01-01T10:00:00Z = 28 hours
      expect(orderAnalytics.processing_time_avg).toBe(28);
    });

    it('handles empty order data gracefully', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          gte: vi.fn(() => ({
            data: [],
            error: null
          }))
        }))
      });

      mockSupabase.rpc
        .mockResolvedValue({ data: [], error: null });

      const orderAnalytics = await analyticsAPI.getOrderAnalytics('week');

      expect(orderAnalytics.total_orders).toBe(0);
      expect(orderAnalytics.average_order_value).toBe(0);
      expect(orderAnalytics.processing_time_avg).toBe(0);
      expect(orderAnalytics.orders_by_status).toEqual({});
    });
  });

  describe('Customer Analytics Integration', () => {
    it('calculates customer metrics correctly', async () => {
      // Mock customers queries
      mockSupabase.from
        .mockReturnValueOnce({
          select: vi.fn(() => ({
            data: mockCustomersData,
            error: null
          }))
        })
        .mockReturnValueOnce({
          select: vi.fn(() => ({
            gte: vi.fn(() => ({
              data: [mockCustomersData[1]], // Only customer-2 is new
              error: null
            }))
          }))
        });

      // Mock RPC calls
      mockSupabase.rpc
        .mockResolvedValueOnce({ data: [{ avg_clv: 245.80 }], error: null }) // CLV
        .mockResolvedValueOnce({ data: [], error: null }) // segment performance
        .mockResolvedValueOnce({ data: [], error: null }); // behavior flow

      const customerAnalytics = await analyticsAPI.getCustomerAnalytics('month');

      expect(customerAnalytics.total_customers).toBe(2);
      expect(customerAnalytics.new_customers).toBe(1);
      expect(customerAnalytics.returning_customers).toBe(1);
      expect(customerAnalytics.customer_lifetime_value).toBe(245.80);
    });

    it('handles customer data errors gracefully', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          data: null,
          error: new Error('Database connection failed')
        }))
      });

      await expect(analyticsAPI.getCustomerAnalytics('day'))
        .rejects.toThrow('Database connection failed');
    });
  });

  describe('Revenue Analytics Integration', () => {
    it('calculates revenue metrics from multiple data sources', async () => {
      const mockRevenueData = [
        { total_revenue: 125000, growth_rate: 12.5 }
      ];

      const mockCategoryData = [
        { category: 'Business Cards', revenue: 45000 },
        { category: 'Flyers', revenue: 30000 },
        { category: 'Banners', revenue: 25000 },
        { category: 'Brochures', revenue: 25000 }
      ];

      const mockBrokerData = [
        {
          broker_revenue: 75000,
          retail_revenue: 50000,
          broker_orders: 800,
          retail_orders: 450
        }
      ];

      mockSupabase.rpc
        .mockResolvedValueOnce({ data: mockRevenueData, error: null })
        .mockResolvedValueOnce({ data: mockCategoryData, error: null })
        .mockResolvedValueOnce({ data: mockBrokerData, error: null });

      const revenueAnalytics = await analyticsAPI.getRevenueAnalytics('quarter');

      expect(revenueAnalytics.total_revenue).toBe(125000);
      expect(revenueAnalytics.revenue_growth).toBe(12.5);
      expect(revenueAnalytics.revenue_by_category).toEqual({
        'Business Cards': 45000,
        'Flyers': 30000,
        'Banners': 25000,
        'Brochures': 25000
      });
      expect(revenueAnalytics.broker_vs_retail).toEqual(mockBrokerData[0]);
    });
  });

  describe('Product Analytics Integration', () => {
    it('integrates product performance and inventory data', async () => {
      const mockProductPerformance = [
        {
          product_id: 'product-1',
          name: 'Business Cards',
          sales_velocity: 15.5,
          profit_margin: 45.2,
          stock_level: 5000,
          reorder_point: 1000
        }
      ];

      const mockInventoryData = [
        {
          product_id: 'product-1',
          current_stock: 5000,
          turnover_rate: 2.3,
          days_supply: 45,
          reorder_needed: false
        }
      ];

      mockSupabase.rpc
        .mockResolvedValueOnce({ data: mockProductPerformance, error: null })
        .mockResolvedValueOnce({ data: mockInventoryData, error: null });

      const productAnalytics = await analyticsAPI.getProductAnalytics('month');

      expect(productAnalytics.product_performance).toEqual(mockProductPerformance);
      expect(productAnalytics.inventory_turnover).toEqual(mockInventoryData);
    });
  });

  describe('Report Management Integration', () => {
    it('creates and retrieves reports correctly', async () => {
      const reportData = {
        name: 'Test Report',
        description: 'Integration test report',
        report_type: 'custom' as const,
        data_sources: [],
        filters: [],
        visualizations: [],
        export_formats: ['pdf' as const],
        created_by: 'test-user'
      };

      const mockCreatedReport = {
        id: 'report-123',
        ...reportData,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z'
      };

      // Mock create report
      mockSupabase.from.mockReturnValue({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: mockCreatedReport,
              error: null
            }))
          }))
        }))
      });

      const createdReport = await analyticsAPI.createReport(reportData);

      expect(createdReport).toEqual(mockCreatedReport);
      expect(mockSupabase.from).toHaveBeenCalledWith('analytics_reports');
    });

    it('updates reports correctly', async () => {
      const updates = { name: 'Updated Report Name' };
      const mockUpdatedReport = {
        id: 'report-123',
        name: 'Updated Report Name',
        description: 'Test report',
        report_type: 'custom' as const,
        data_sources: [],
        filters: [],
        visualizations: [],
        export_formats: ['pdf' as const],
        created_by: 'test-user',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T11:00:00Z'
      };

      mockSupabase.from.mockReturnValue({
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => ({
                data: mockUpdatedReport,
                error: null
              }))
            }))
          }))
        }))
      });

      const updatedReport = await analyticsAPI.updateReport('report-123', updates);

      expect(updatedReport).toEqual(mockUpdatedReport);
    });

    it('handles export data requests correctly', async () => {
      const mockExportResult = {
        exportId: 'export-456',
        status: 'started'
      };

      mockSupabase.rpc.mockResolvedValue({
        data: mockExportResult,
        error: null
      });

      const result = await analyticsAPI.exportData('report-123', 'csv');

      expect(result).toEqual(mockExportResult);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('create_analytics_export', {
        report_id: 'report-123',
        export_format: 'csv'
      });
    });
  });

  describe('Date Filter Integration', () => {
    it('generates correct date filters for different periods', async () => {
      const periods: AnalyticsPeriod[] = ['hour', 'day', 'week', 'month', 'quarter', 'year'];
      
      for (const period of periods) {
        mockSupabase.from.mockReturnValue({
          select: vi.fn(() => ({
            gte: vi.fn((dateFilter) => {
              // Verify that a date filter is provided
              expect(dateFilter).toBeDefined();
              expect(typeof dateFilter).toBe('string');
              expect(new Date(dateFilter).getTime()).not.toBeNaN();
              
              return {
                data: [],
                error: null
              };
            })
          }))
        });

        mockSupabase.rpc.mockResolvedValue({ data: [], error: null });

        await analyticsAPI.getOrderAnalytics(period);
      }
    });
  });

  describe('Error Handling Integration', () => {
    it('propagates database errors correctly', async () => {
      const dbError = new Error('Connection timeout');
      
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          gte: vi.fn(() => ({
            data: null,
            error: dbError
          }))
        }))
      });

      await expect(analyticsAPI.getOrderAnalytics('month'))
        .rejects.toThrow('Connection timeout');
    });

    it('handles RPC function errors correctly', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          gte: vi.fn(() => ({
            data: [],
            error: null
          }))
        }))
      });

      const rpcError = new Error('Function execution failed');
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: rpcError
      });

      await expect(analyticsAPI.getOrderAnalytics('month'))
        .rejects.toThrow('Function execution failed');
    });
  });
});