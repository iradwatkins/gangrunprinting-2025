import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AnalyticsDashboard } from '../AnalyticsDashboard';
import { useAnalytics } from '../../../hooks/useAnalytics';
import type { DashboardMetrics } from '../../../types/analytics';

// Mock the useAnalytics hook
vi.mock('../../../hooks/useAnalytics');

// Mock recharts components
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  Legend: () => <div data-testid="legend" />,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />
}));

const mockDashboardMetrics: DashboardMetrics = {
  order_analytics: {
    total_orders: 1250,
    orders_by_status: {
      pending: 45,
      processing: 120,
      completed: 980,
      cancelled: 105
    },
    average_order_value: 85.50,
    order_volume_trend: [
      { date: '2024-01-01', value: 50 },
      { date: '2024-01-02', value: 75 },
      { date: '2024-01-03', value: 60 }
    ],
    processing_time_avg: 2.5,
    vendor_performance: [
      {
        vendor_id: '1',
        vendor_name: 'Premium Print Co',
        total_orders: 450,
        average_processing_time: 2.2,
        completion_rate: 98.5,
        revenue: 38000
      }
    ],
    top_products: [
      {
        product_id: '1',
        product_name: 'Business Cards',
        orders: 320,
        revenue: 8500,
        units_sold: 15000
      }
    ]
  },
  customer_analytics: {
    total_customers: 5200,
    new_customers: 280,
    returning_customers: 4920,
    customer_lifetime_value: 245.80,
    churn_rate: 3.2,
    acquisition_sources: {
      organic: 1200,
      social: 800,
      referral: 600,
      paid: 400
    },
    segment_performance: [],
    behavior_flow: []
  },
  revenue_analytics: {
    total_revenue: 125000,
    revenue_growth: 12.5,
    revenue_by_category: {
      'Business Cards': 45000,
      'Flyers': 30000,
      'Banners': 25000,
      'Brochures': 25000
    },
    revenue_by_vendor: {
      'Premium Print Co': 75000,
      'Quick Print Ltd': 50000
    },
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

const mockUseAnalytics = {
  dashboardMetrics: mockDashboardMetrics,
  loading: false,
  error: null,
  loadDashboardMetrics: vi.fn(),
  refreshMetrics: vi.fn()
};

beforeEach(() => {
  vi.mocked(useAnalytics).mockReturnValue(mockUseAnalytics as any);
});

describe('AnalyticsDashboard', () => {
  it('renders dashboard header correctly', () => {
    render(<AnalyticsDashboard />);
    
    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Platform performance and business insights')).toBeInTheDocument();
  });

  it('displays key metrics cards with correct values', () => {
    render(<AnalyticsDashboard />);
    
    expect(screen.getByText('1,250')).toBeInTheDocument(); // Total Orders
    expect(screen.getByText('$125,000')).toBeInTheDocument(); // Revenue
    expect(screen.getByText('5,200')).toBeInTheDocument(); // Customers
    expect(screen.getByText('$85.50')).toBeInTheDocument(); // Avg Order Value
  });

  it('renders period selector with correct options', () => {
    render(<AnalyticsDashboard />);
    
    const periodSelector = screen.getByRole('combobox');
    expect(periodSelector).toBeInTheDocument();
    
    fireEvent.click(periodSelector);
    
    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('This Week')).toBeInTheDocument();
    expect(screen.getByText('This Month')).toBeInTheDocument();
    expect(screen.getByText('This Quarter')).toBeInTheDocument();
    expect(screen.getByText('This Year')).toBeInTheDocument();
  });

  it('calls loadDashboardMetrics when period changes', async () => {
    render(<AnalyticsDashboard />);
    
    const periodSelector = screen.getByRole('combobox');
    fireEvent.click(periodSelector);
    
    const weekOption = screen.getByText('This Week');
    fireEvent.click(weekOption);
    
    await waitFor(() => {
      expect(mockUseAnalytics.loadDashboardMetrics).toHaveBeenCalledWith('week');
    });
  });

  it('calls refreshMetrics when refresh button is clicked', async () => {
    render(<AnalyticsDashboard />);
    
    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);
    
    await waitFor(() => {
      expect(mockUseAnalytics.refreshMetrics).toHaveBeenCalled();
    });
  });

  it('renders analytics tabs correctly', () => {
    render(<AnalyticsDashboard />);
    
    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.getByText('Customers')).toBeInTheDocument();
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
  });

  it('displays order volume trend chart', () => {
    render(<AnalyticsDashboard />);
    
    expect(screen.getByText('Order Volume Trend')).toBeInTheDocument();
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('shows order status distribution', () => {
    render(<AnalyticsDashboard />);
    
    expect(screen.getByText('Order Status Distribution')).toBeInTheDocument();
  });

  it('displays top products list', () => {
    render(<AnalyticsDashboard />);
    
    expect(screen.getByText('Top Products')).toBeInTheDocument();
    expect(screen.getByText('Business Cards')).toBeInTheDocument();
    expect(screen.getByText('320 orders')).toBeInTheDocument();
  });

  it('shows vendor performance', () => {
    render(<AnalyticsDashboard />);
    
    expect(screen.getByText('Vendor Performance')).toBeInTheDocument();
    expect(screen.getByText('Premium Print Co')).toBeInTheDocument();
    expect(screen.getByText('450 orders • 98.5% completion')).toBeInTheDocument();
  });

  it('displays loading state correctly', () => {
    vi.mocked(useAnalytics).mockReturnValue({
      ...mockUseAnalytics,
      dashboardMetrics: null,
      loading: true
    } as any);

    render(<AnalyticsDashboard />);
    
    expect(screen.getByTestId('loading-spinner') || screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays error state correctly', () => {
    vi.mocked(useAnalytics).mockReturnValue({
      ...mockUseAnalytics,
      dashboardMetrics: null,
      loading: false,
      error: 'Failed to load analytics data'
    } as any);

    render(<AnalyticsDashboard />);
    
    expect(screen.getByText('Error loading analytics: Failed to load analytics data')).toBeInTheDocument();
  });

  it('switches between tabs correctly', async () => {
    render(<AnalyticsDashboard />);
    
    const customersTab = screen.getByText('Customers');
    fireEvent.click(customersTab);
    
    await waitFor(() => {
      expect(screen.getByText('Customer Type Distribution')).toBeInTheDocument();
    });
    
    const revenueTab = screen.getByText('Revenue');
    fireEvent.click(revenueTab);
    
    await waitFor(() => {
      expect(screen.getByText('Revenue Overview')).toBeInTheDocument();
    });
  });

  it('handles missing data gracefully', () => {
    vi.mocked(useAnalytics).mockReturnValue({
      ...mockUseAnalytics,
      dashboardMetrics: {
        ...mockDashboardMetrics,
        order_analytics: {
          ...mockDashboardMetrics.order_analytics,
          top_products: [],
          vendor_performance: []
        }
      }
    } as any);

    render(<AnalyticsDashboard />);
    
    // Should still render without errors
    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Top Products')).toBeInTheDocument();
    expect(screen.getByText('Vendor Performance')).toBeInTheDocument();
  });
});