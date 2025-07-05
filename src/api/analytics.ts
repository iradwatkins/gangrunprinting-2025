import { supabase } from '../integrations/supabase/client';
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

export class AnalyticsAPI {
  async getDashboardMetrics(period: AnalyticsPeriod = 'month'): Promise<DashboardMetrics> {
    const [
      orderAnalytics,
      customerAnalytics,
      revenueAnalytics,
      productAnalytics,
      systemAnalytics
    ] = await Promise.all([
      this.getOrderAnalytics(period),
      this.getCustomerAnalytics(period),
      this.getRevenueAnalytics(period),
      this.getProductAnalytics(period),
      this.getSystemAnalytics(period)
    ]);

    return {
      order_analytics: orderAnalytics,
      customer_analytics: customerAnalytics,
      revenue_analytics: revenueAnalytics,
      product_analytics: productAnalytics,
      system_analytics: systemAnalytics,
      generated_at: new Date().toISOString(),
      period
    };
  }

  async getOrderAnalytics(period: AnalyticsPeriod = 'month'): Promise<OrderAnalytics> {
    const dateFilter = this.getDateFilter(period);
    
    // Get basic order metrics
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .gte('created_at', dateFilter);

    if (ordersError) throw ordersError;

    // Calculate order volume trend
    const { data: trendData, error: trendError } = await supabase
      .rpc('get_order_volume_trend', { period_param: period });

    if (trendError) throw trendError;

    // Get vendor performance
    const { data: vendorData, error: vendorError } = await supabase
      .rpc('get_vendor_performance', { period_param: period });

    if (vendorError) throw vendorError;

    // Get top products
    const { data: productsData, error: productsError } = await supabase
      .rpc('get_top_products', { period_param: period, limit_param: 10 });

    if (productsError) throw productsError;

    const totalOrders = orders?.length || 0;
    const totalValue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
    const avgOrderValue = totalOrders > 0 ? totalValue / totalOrders : 0;

    // Group orders by status
    const ordersByStatus = orders?.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Calculate average processing time
    const completedOrders = orders?.filter(o => o.status === 'completed') || [];
    const processingTimes = completedOrders
      .filter(o => o.created_at && o.completed_at)
      .map(o => new Date(o.completed_at!).getTime() - new Date(o.created_at).getTime());
    
    const avgProcessingTime = processingTimes.length > 0 
      ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length / (1000 * 60 * 60) // Convert to hours
      : 0;

    return {
      total_orders: totalOrders,
      orders_by_status: ordersByStatus,
      average_order_value: avgOrderValue,
      order_volume_trend: trendData || [],
      processing_time_avg: avgProcessingTime,
      vendor_performance: vendorData || [],
      top_products: productsData || []
    };
  }

  async getCustomerAnalytics(period: AnalyticsPeriod = 'month'): Promise<CustomerAnalytics> {
    const dateFilter = this.getDateFilter(period);
    
    // Get customer metrics
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('*');

    if (customersError) throw customersError;

    // Get new customers in period
    const { data: newCustomers, error: newCustomersError } = await supabase
      .from('customers')
      .select('*')
      .gte('created_at', dateFilter);

    if (newCustomersError) throw newCustomersError;

    // Get customer lifetime value and other metrics
    const { data: clvData, error: clvError } = await supabase
      .rpc('calculate_customer_lifetime_value');

    if (clvError) throw clvError;

    // Get segment performance
    const { data: segmentData, error: segmentError } = await supabase
      .rpc('get_segment_performance', { period_param: period });

    if (segmentError) throw segmentError;

    // Get behavior flow data
    const { data: behaviorData, error: behaviorError } = await supabase
      .rpc('get_customer_behavior_flow', { period_param: period });

    if (behaviorError) throw behaviorError;

    const totalCustomers = customers?.length || 0;
    const newCustomerCount = newCustomers?.length || 0;
    const returningCustomers = totalCustomers - newCustomerCount;

    return {
      total_customers: totalCustomers,
      new_customers: newCustomerCount,
      returning_customers: returningCustomers,
      customer_lifetime_value: clvData?.[0]?.avg_clv || 0,
      churn_rate: 0, // Calculate from retention data
      acquisition_sources: {}, // Get from customer acquisition tracking
      segment_performance: segmentData || [],
      behavior_flow: behaviorData || []
    };
  }

  async getRevenueAnalytics(period: AnalyticsPeriod = 'month'): Promise<RevenueAnalytics> {
    const dateFilter = this.getDateFilter(period);
    
    // Get revenue data
    const { data: revenueData, error: revenueError } = await supabase
      .rpc('get_revenue_analytics', { period_param: period });

    if (revenueError) throw revenueError;

    // Get revenue by category
    const { data: categoryData, error: categoryError } = await supabase
      .rpc('get_revenue_by_category', { period_param: period });

    if (categoryError) throw categoryError;

    // Get broker vs retail split
    const { data: brokerData, error: brokerError } = await supabase
      .rpc('get_broker_retail_split', { period_param: period });

    if (brokerError) throw brokerError;

    return {
      total_revenue: revenueData?.[0]?.total_revenue || 0,
      revenue_growth: revenueData?.[0]?.growth_rate || 0,
      revenue_by_category: categoryData?.reduce((acc: any, item: any) => {
        acc[item.category] = item.revenue;
        return acc;
      }, {}) || {},
      revenue_by_vendor: {},
      profit_margins: [],
      broker_vs_retail: brokerData?.[0] || { broker_revenue: 0, retail_revenue: 0, broker_orders: 0, retail_orders: 0 },
      forecasted_revenue: []
    };
  }

  async getProductAnalytics(period: AnalyticsPeriod = 'month'): Promise<ProductAnalytics> {
    // Get product performance data
    const { data: performanceData, error: performanceError } = await supabase
      .rpc('get_product_performance', { period_param: period });

    if (performanceError) throw performanceError;

    // Get inventory metrics
    const { data: inventoryData, error: inventoryError } = await supabase
      .rpc('get_inventory_metrics');

    if (inventoryError) throw inventoryError;

    return {
      top_selling_products: [],
      product_performance: performanceData || [],
      inventory_turnover: inventoryData || [],
      configuration_popularity: [],
      product_profitability: []
    };
  }

  async getSystemAnalytics(period: AnalyticsPeriod = 'month'): Promise<SystemAnalytics> {
    // Mock system analytics data - in production this would come from monitoring systems
    return {
      api_response_times: [],
      error_rates: [],
      uptime_percentage: 99.9,
      database_performance: [],
      user_sessions: [],
      security_events: []
    };
  }

  async getReports(): Promise<AnalyticsReport[]> {
    const { data, error } = await supabase
      .from('analytics_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createReport(report: Partial<AnalyticsReport>): Promise<AnalyticsReport> {
    const { data, error } = await supabase
      .from('analytics_reports')
      .insert([report])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateReport(id: string, updates: Partial<AnalyticsReport>): Promise<AnalyticsReport> {
    const { data, error } = await supabase
      .from('analytics_reports')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async runReport(id: string): Promise<any> {
    const { data: report, error: reportError } = await supabase
      .from('analytics_reports')
      .select('*')
      .eq('id', id)
      .single();

    if (reportError) throw reportError;

    // Execute the report based on its configuration
    return this.executeReportQuery(report);
  }

  async exportData(
    reportId: string,
    format: ExportFormat
  ): Promise<{ exportId: string; status: string }> {
    const { data, error } = await supabase
      .rpc('create_analytics_export', {
        report_id: reportId,
        export_format: format
      });

    if (error) throw error;
    return data;
  }

  async getExportStatus(exportId: string): Promise<{ status: string; progress: number }> {
    const { data, error } = await supabase
      .from('analytics_exports')
      .select('status, progress')
      .eq('id', exportId)
      .single();

    if (error) throw error;
    return data;
  }

  async downloadExport(exportId: string): Promise<Blob> {
    const { data, error } = await supabase.storage
      .from('analytics-exports')
      .download(`${exportId}.zip`);

    if (error) throw error;
    return data;
  }

  private getDateFilter(period: AnalyticsPeriod): string {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'hour':
        startDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case 'year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    }

    return startDate.toISOString();
  }

  private async executeReportQuery(report: AnalyticsReport): Promise<any> {
    // Implementation would depend on the report configuration
    // This is a simplified version
    const results = {};
    
    for (const visualization of report.visualizations) {
      const { data, error } = await supabase.rpc('execute_analytics_query', {
        query: visualization.data_query,
        filters: report.filters
      });
      
      if (error) throw error;
      results[visualization.config.title] = data;
    }
    
    return results;
  }
}

export const analyticsAPI = new AnalyticsAPI();