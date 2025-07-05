import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { RefreshCw, Download, TrendingUp, TrendingDown, Users, Package, DollarSign, ShoppingCart } from 'lucide-react';
import { useAnalytics } from '../../hooks/useAnalytics';
import { MetricCard } from './MetricCard';
import { OrderAnalyticsChart } from './OrderAnalyticsChart';
import { CustomerAnalyticsChart } from './CustomerAnalyticsChart';
import { RevenueAnalyticsChart } from './RevenueAnalyticsChart';
import { ProductAnalyticsChart } from './ProductAnalyticsChart';
import { SystemHealthChart } from './SystemHealthChart';
import type { AnalyticsPeriod } from '../../types/analytics';

export function AnalyticsDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<AnalyticsPeriod>('month');
  const {
    dashboardMetrics,
    loading,
    error,
    loadDashboardMetrics,
    refreshMetrics
  } = useAnalytics();

  const handlePeriodChange = (period: AnalyticsPeriod) => {
    setSelectedPeriod(period);
    loadDashboardMetrics(period);
  };

  const handleRefresh = () => {
    refreshMetrics();
  };

  if (loading && !dashboardMetrics) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Error loading analytics: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  const orderMetrics = dashboardMetrics?.order_analytics;
  const customerMetrics = dashboardMetrics?.customer_analytics;
  const revenueMetrics = dashboardMetrics?.revenue_analytics;
  const productMetrics = dashboardMetrics?.product_analytics;
  const systemMetrics = dashboardMetrics?.system_analytics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Platform performance and business insights
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Orders"
          value={orderMetrics?.total_orders || 0}
          icon={<ShoppingCart className="h-4 w-4" />}
          trend={5.2}
          format="number"
        />
        <MetricCard
          title="Revenue"
          value={revenueMetrics?.total_revenue || 0}
          icon={<DollarSign className="h-4 w-4" />}
          trend={revenueMetrics?.revenue_growth || 0}
          format="currency"
        />
        <MetricCard
          title="Customers"
          value={customerMetrics?.total_customers || 0}
          icon={<Users className="h-4 w-4" />}
          trend={8.1}
          format="number"
        />
        <MetricCard
          title="Avg Order Value"
          value={orderMetrics?.average_order_value || 0}
          icon={<TrendingUp className="h-4 w-4" />}
          trend={2.3}
          format="currency"
        />
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Volume Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <OrderAnalyticsChart
                  data={orderMetrics?.order_volume_trend || []}
                  period={selectedPeriod}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Order Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <OrderAnalyticsChart
                  data={Object.entries(orderMetrics?.orders_by_status || {}).map(([status, count]) => ({
                    status,
                    count
                  }))}
                  type="pie"
                />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderMetrics?.top_products?.slice(0, 5).map((product, index) => (
                    <div key={product.product_id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{product.product_name}</p>
                          <p className="text-sm text-muted-foreground">{product.orders} orders</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${product.revenue.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">{product.units_sold} units</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vendor Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderMetrics?.vendor_performance?.slice(0, 5).map((vendor) => (
                    <div key={vendor.vendor_id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{vendor.vendor_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {vendor.total_orders} orders • {vendor.completion_rate.toFixed(1)}% completion
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${vendor.revenue.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">
                          {vendor.average_processing_time.toFixed(1)}h avg
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <CustomerAnalyticsChart analytics={customerMetrics} period={selectedPeriod} />
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <RevenueAnalyticsChart analytics={revenueMetrics} period={selectedPeriod} />
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <ProductAnalyticsChart analytics={productMetrics} period={selectedPeriod} />
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <SystemHealthChart analytics={systemMetrics} period={selectedPeriod} />
        </TabsContent>
      </Tabs>
    </div>
  );
}