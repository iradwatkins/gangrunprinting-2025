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
    
    // Get all orders with their items and jobs
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(
          *,
          products(id, name, slug)
        ),
        order_jobs(
          *,
          vendors(id, name)
        )
      `)
      .gte('created_at', dateFilter);

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      throw new Error('Failed to fetch order data');
    }

    const totalOrders = orders?.length || 0;
    const totalValue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
    const avgOrderValue = totalOrders > 0 ? totalValue / totalOrders : 0;

    // Group orders by status
    const ordersByStatus = orders?.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Calculate average processing time for completed orders
    const completedOrders = orders?.filter(o => o.status === 'completed') || [];
    const processingTimes = completedOrders
      .filter(o => o.created_at && o.updated_at)
      .map(o => new Date(o.updated_at).getTime() - new Date(o.created_at).getTime());
    
    const avgProcessingTime = processingTimes.length > 0 
      ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length / (1000 * 60 * 60) // Convert to hours
      : 0;

    // Calculate order volume trend by day
    const orderVolumeTrend = this.calculateOrderVolumeTrend(orders || [], period);

    // Calculate vendor performance
    const vendorPerformance = this.calculateVendorPerformance(orders || []);

    // Calculate top products
    const topProducts = this.calculateTopProducts(orders || []);

    return {
      total_orders: totalOrders,
      orders_by_status: ordersByStatus,
      average_order_value: avgOrderValue,
      order_volume_trend: orderVolumeTrend,
      processing_time_avg: avgProcessingTime,
      vendor_performance: vendorPerformance,
      top_products: topProducts
    };
  }

  async getCustomerAnalytics(period: AnalyticsPeriod = 'month'): Promise<CustomerAnalytics> {
    const dateFilter = this.getDateFilter(period);
    
    // Get all user profiles (customers)
    const { data: customers, error: customersError } = await supabase
      .from('user_profiles')
      .select(`
        *,
        orders(
          id,
          total_amount,
          status,
          created_at
        )
      `)
      .eq('role', 'customer');

    if (customersError) {
      console.error('Error fetching customers:', customersError);
      throw new Error('Failed to fetch customer data');
    }

    // Get new customers in period
    const newCustomers = customers?.filter(c => c.created_at >= dateFilter) || [];

    const totalCustomers = customers?.length || 0;
    const newCustomerCount = newCustomers.length;
    const returningCustomers = customers?.filter(c => 
      c.orders && c.orders.length > 1
    ).length || 0;

    // Calculate average customer lifetime value
    const customerLifetimeValues = customers?.map(customer => {
      const totalSpent = customer.orders?.reduce((sum, order) => 
        sum + (order.status === 'completed' ? (order.total_amount || 0) : 0), 0
      ) || 0;
      return totalSpent;
    }) || [];

    const avgClv = customerLifetimeValues.length > 0
      ? customerLifetimeValues.reduce((sum, value) => sum + value, 0) / customerLifetimeValues.length
      : 0;

    // Calculate churn rate (customers with no orders in the period)
    const activeCustomers = customers?.filter(c => 
      c.orders?.some(o => o.created_at >= dateFilter)
    ).length || 0;
    const churnRate = totalCustomers > 0 
      ? ((totalCustomers - activeCustomers) / totalCustomers) * 100
      : 0;

    // Group customers by acquisition source (simplified - using created_at month)
    const acquisitionSources = this.groupCustomersByAcquisitionMonth(customers || []);

    // Calculate segment performance (by order count)
    const segmentPerformance = this.calculateCustomerSegments(customers || []);

    return {
      total_customers: totalCustomers,
      new_customers: newCustomerCount,
      returning_customers: returningCustomers,
      customer_lifetime_value: avgClv,
      churn_rate: churnRate,
      acquisition_sources: acquisitionSources,
      segment_performance: segmentPerformance,
      behavior_flow: []
    };
  }

  async getRevenueAnalytics(period: AnalyticsPeriod = 'month'): Promise<RevenueAnalytics> {
    const dateFilter = this.getDateFilter(period);
    const previousPeriodFilter = this.getPreviousPeriodFilter(period);
    
    // Get orders with items for revenue calculation
    const { data: currentOrders, error: currentError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(
          *,
          products(
            id,
            name,
            category_id,
            product_categories(name)
          )
        ),
        user_profiles!orders_user_id_fkey(
          role,
          broker_discount_tier
        )
      `)
      .gte('created_at', dateFilter)
      .eq('status', 'completed');

    if (currentError) {
      console.error('Error fetching revenue data:', currentError);
      throw new Error('Failed to fetch revenue data');
    }

    // Get previous period orders for growth calculation
    const { data: previousOrders, error: previousError } = await supabase
      .from('orders')
      .select('total_amount')
      .gte('created_at', previousPeriodFilter)
      .lt('created_at', dateFilter)
      .eq('status', 'completed');

    if (previousError) {
      console.error('Error fetching previous period data:', previousError);
    }

    const totalRevenue = currentOrders?.reduce((sum, order) => 
      sum + (order.total_amount || 0), 0
    ) || 0;

    const previousRevenue = previousOrders?.reduce((sum, order) => 
      sum + (order.total_amount || 0), 0
    ) || 0;

    const revenueGrowth = previousRevenue > 0 
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
      : 0;

    // Calculate revenue by category
    const revenueByCategory = this.calculateRevenueByCategory(currentOrders || []);

    // Calculate broker vs retail split
    const brokerVsRetail = this.calculateBrokerVsRetail(currentOrders || []);

    // Calculate profit margins (simplified - using a fixed margin for now)
    const profitMargins = this.calculateProfitMargins(currentOrders || []);

    return {
      total_revenue: totalRevenue,
      revenue_growth: revenueGrowth,
      revenue_by_category: revenueByCategory,
      revenue_by_vendor: {},
      profit_margins: profitMargins,
      broker_vs_retail: brokerVsRetail,
      forecasted_revenue: []
    };
  }

  async getProductAnalytics(period: AnalyticsPeriod = 'month'): Promise<ProductAnalytics> {
    const dateFilter = this.getDateFilter(period);
    
    // Get all products with their order items
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(`
        *,
        product_categories(name),
        order_items(
          id,
          quantity,
          unit_price,
          total_price,
          orders!inner(
            created_at,
            status
          )
        )
      `)
      .eq('is_active', true);

    if (productsError) {
      console.error('Error fetching product data:', productsError);
      throw new Error('Failed to fetch product data');
    }

    // Filter order items by period
    const productsWithFilteredOrders = products?.map(product => ({
      ...product,
      order_items: product.order_items?.filter(item => 
        item.orders && 
        item.orders.created_at >= dateFilter &&
        item.orders.status === 'completed'
      ) || []
    })) || [];

    // Calculate top selling products
    const topSellingProducts = this.calculateTopSellingProducts(productsWithFilteredOrders);

    // Calculate product performance metrics
    const productPerformance = this.calculateProductPerformance(productsWithFilteredOrders);

    // Calculate configuration popularity
    const configurationPopularity = await this.calculateConfigurationPopularity(dateFilter);

    return {
      top_selling_products: topSellingProducts,
      product_performance: productPerformance,
      inventory_turnover: [],
      configuration_popularity: configurationPopularity,
      product_profitability: []
    };
  }

  async getSystemAnalytics(period: AnalyticsPeriod = 'month'): Promise<SystemAnalytics> {
    // For now, return static/mock data as these would typically come from monitoring systems
    return {
      api_response_times: [
        { endpoint: '/api/products', average_time: 45, p95_time: 120, p99_time: 250, request_count: 10000 },
        { endpoint: '/api/orders', average_time: 65, p95_time: 150, p99_time: 300, request_count: 5000 },
        { endpoint: '/api/checkout', average_time: 120, p95_time: 300, p99_time: 500, request_count: 2000 }
      ],
      error_rates: [
        { endpoint: '/api/products', error_count: 10, total_requests: 10000, error_rate: 0.1, error_types: { '404': 5, '500': 5 } },
        { endpoint: '/api/orders', error_count: 10, total_requests: 5000, error_rate: 0.2, error_types: { '400': 5, '500': 5 } },
        { endpoint: '/api/checkout', error_count: 10, total_requests: 2000, error_rate: 0.5, error_types: { '400': 7, '500': 3 } }
      ],
      uptime_percentage: 99.95,
      database_performance: [
        { query_type: 'SELECT', average_execution_time: 15, query_count: 50000, slow_queries: 5 },
        { query_type: 'INSERT', average_execution_time: 25, query_count: 5000, slow_queries: 2 },
        { query_type: 'UPDATE', average_execution_time: 20, query_count: 8000, slow_queries: 3 }
      ],
      user_sessions: [],
      security_events: []
    };
  }

  // Helper methods for calculations

  private calculateOrderVolumeTrend(orders: any[], period: AnalyticsPeriod): any[] {
    const trend: { date: string; value: number }[] = [];
    const groupedByDate = new Map<string, number>();

    orders.forEach(order => {
      const date = new Date(order.created_at).toISOString().split('T')[0];
      const existing = groupedByDate.get(date) || 0;
      groupedByDate.set(date, existing + 1);
    });

    groupedByDate.forEach((count, date) => {
      trend.push({
        date,
        value: count
      });
    });

    return trend.sort((a, b) => a.date.localeCompare(b.date));
  }

  private calculateVendorPerformance(orders: any[]): any[] {
    const vendorMap = new Map<string, any>();

    orders.forEach(order => {
      order.order_jobs?.forEach((job: any) => {
        if (job.vendors) {
          const vendorId = job.vendors.id;
          const existing = vendorMap.get(vendorId) || {
            vendor_id: vendorId,
            vendor_name: job.vendors.name,
            total_orders: 0,
            completed_orders: 0,
            revenue: 0,
            total_processing_time: 0
          };

          existing.total_orders++;
          if (job.status === 'completed') {
            existing.completed_orders++;
            // Calculate processing time if dates available
            if (job.created_at && job.updated_at) {
              const processingTime = new Date(job.updated_at).getTime() - new Date(job.created_at).getTime();
              existing.total_processing_time += processingTime / (1000 * 60 * 60); // Convert to hours
            }
          }
          existing.revenue += order.total_amount || 0;

          vendorMap.set(vendorId, existing);
        }
      });
    });

    return Array.from(vendorMap.values()).map(vendor => ({
      ...vendor,
      completion_rate: vendor.total_orders > 0 
        ? (vendor.completed_orders / vendor.total_orders) * 100 
        : 0,
      average_processing_time: vendor.completed_orders > 0
        ? vendor.total_processing_time / vendor.completed_orders
        : 0
    }));
  }

  private calculateTopProducts(orders: any[]): any[] {
    const productMap = new Map<string, any>();

    orders.forEach(order => {
      order.order_items?.forEach((item: any) => {
        if (item.products) {
          const productId = item.products.id;
          const existing = productMap.get(productId) || {
            product_id: productId,
            product_name: item.products.name,
            orders: 0,
            units_sold: 0,
            revenue: 0
          };

          existing.orders++;
          existing.units_sold += item.quantity || 0;
          existing.revenue += item.total_price || 0;

          productMap.set(productId, existing);
        }
      });
    });

    return Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }

  private groupCustomersByAcquisitionMonth(customers: any[]): Record<string, number> {
    const sources: Record<string, number> = {};

    customers.forEach(customer => {
      const month = new Date(customer.created_at).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
      sources[month] = (sources[month] || 0) + 1;
    });

    return sources;
  }

  private calculateCustomerSegments(customers: any[]): any[] {
    const segments = [
      { name: 'New Customers', criteria: (c: any) => !c.orders || c.orders.length === 0 },
      { name: 'One-time Buyers', criteria: (c: any) => c.orders && c.orders.length === 1 },
      { name: 'Repeat Customers', criteria: (c: any) => c.orders && c.orders.length > 1 && c.orders.length <= 5 },
      { name: 'VIP Customers', criteria: (c: any) => c.orders && c.orders.length > 5 }
    ];

    return segments.map(segment => {
      const segmentCustomers = customers.filter(segment.criteria);
      const totalSpent = segmentCustomers.reduce((sum, customer) => {
        const customerSpent = customer.orders?.reduce((orderSum: number, order: any) => 
          orderSum + (order.status === 'completed' ? (order.total_amount || 0) : 0), 0
        ) || 0;
        return sum + customerSpent;
      }, 0);

      return {
        segment_id: segment.name.toLowerCase().replace(/\s+/g, '-'),
        segment_name: segment.name,
        customer_count: segmentCustomers.length,
        revenue: totalSpent,
        conversion_rate: segmentCustomers.length > 0 ? 75.0 : 0 // Placeholder conversion rate
      };
    });
  }

  private calculateRevenueByCategory(orders: any[]): Record<string, number> {
    const categoryRevenue: Record<string, number> = {};

    orders.forEach(order => {
      order.order_items?.forEach((item: any) => {
        if (item.products?.product_categories) {
          const categoryName = item.products.product_categories.name;
          categoryRevenue[categoryName] = (categoryRevenue[categoryName] || 0) + (item.total_price || 0);
        }
      });
    });

    return categoryRevenue;
  }

  private calculateBrokerVsRetail(orders: any[]): any {
    let brokerRevenue = 0;
    let retailRevenue = 0;
    let brokerOrders = 0;
    let retailOrders = 0;

    orders.forEach(order => {
      if (order.user_profiles?.role === 'broker') {
        brokerRevenue += order.total_amount || 0;
        brokerOrders++;
      } else {
        retailRevenue += order.total_amount || 0;
        retailOrders++;
      }
    });

    return {
      broker_revenue: brokerRevenue,
      retail_revenue: retailRevenue,
      broker_orders: brokerOrders,
      retail_orders: retailOrders
    };
  }

  private calculateProfitMargins(orders: any[]): any[] {
    // Simplified profit margin calculation
    // In real implementation, this would use actual cost data
    const baseMargin = 0.35; // 35% base margin

    return orders.map(order => {
      const revenue = order.total_amount || 0;
      const estimatedCost = revenue * (1 - baseMargin);
      const profit = revenue - estimatedCost;

      return {
        order_id: order.id,
        revenue,
        cost: estimatedCost,
        profit,
        margin_percentage: (profit / revenue) * 100
      };
    }).slice(0, 10); // Return top 10 for display
  }

  private calculateTopSellingProducts(products: any[]): any[] {
    return products
      .map(product => ({
        product_id: product.id,
        product_name: product.name,
        category: product.product_categories?.name || 'Uncategorized',
        units_sold: product.order_items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0),
        revenue: product.order_items.reduce((sum: number, item: any) => sum + (item.total_price || 0), 0),
        order_count: product.order_items.length
      }))
      .filter(p => p.units_sold > 0)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }

  private calculateProductPerformance(products: any[]): any[] {
    return products
      .map(product => {
        const orderItems = product.order_items || [];
        const revenue = orderItems.reduce((sum: number, item: any) => sum + (item.total_price || 0), 0);
        const unitsSold = orderItems.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
        
        return {
          product_id: product.id,
          name: product.name,
          sales_velocity: unitsSold / 30, // Units per day (assuming 30 day period)
          profit_margin: 0.35, // 35% default margin
          stock_level: 1000, // Placeholder stock level
          reorder_point: 100 // Placeholder reorder point
        };
      })
      .filter(p => p.sales_velocity > 0);
  }

  private async calculateConfigurationPopularity(dateFilter: string): Promise<any[]> {
    // Get popular configurations from order items
    const { data: configurations, error } = await supabase
      .from('order_items')
      .select(`
        configuration,
        quantity,
        orders!inner(created_at, status)
      `)
      .gte('orders.created_at', dateFilter)
      .eq('orders.status', 'completed');

    if (error) {
      console.error('Error fetching configuration data:', error);
      return [];
    }

    const configMap = new Map<string, number>();

    configurations?.forEach(item => {
      if (item.configuration) {
        const configKey = JSON.stringify(item.configuration);
        configMap.set(configKey, (configMap.get(configKey) || 0) + (item.quantity || 0));
      }
    });

    return Array.from(configMap.entries())
      .map(([config, count], index) => ({
        configuration: config, // Keep as string for the type
        usage_count: count,
        revenue_impact: count * 150, // Estimated revenue impact
        popularity_rank: index + 1
      }))
      .sort((a, b) => b.usage_count - a.usage_count)
      .slice(0, 10)
      .map((item, index) => ({
        ...item,
        popularity_rank: index + 1 // Update rank after sorting
      }));
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

  private getPreviousPeriodFilter(period: AnalyticsPeriod): string {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'hour':
        startDate = new Date(now.getTime() - 2 * 60 * 60 * 1000);
        break;
      case 'day':
        startDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 2 * 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        break;
      case 'year':
        startDate = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());
    }

    return startDate.toISOString();
  }

  // Report management methods remain the same
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
    return { report, results: {} };
  }

  async exportData(
    reportId: string,
    format: ExportFormat
  ): Promise<{ exportId: string; status: string }> {
    // Simplified export - in production this would create actual export files
    return {
      exportId: `export-${Date.now()}`,
      status: 'completed'
    };
  }
}

export const analyticsAPI = new AnalyticsAPI();