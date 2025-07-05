import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ScatterChart,
  Scatter
} from 'recharts';
import { Package, TrendingUp, AlertTriangle } from 'lucide-react';
import type { ProductAnalytics, AnalyticsPeriod } from '../../types/analytics';

interface ProductAnalyticsChartProps {
  analytics: ProductAnalytics | null;
  period: AnalyticsPeriod;
}

export function ProductAnalyticsChart({ analytics, period }: ProductAnalyticsChartProps) {
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

  if (!analytics) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No product analytics data available
      </div>
    );
  }

  const topProducts = analytics.top_selling_products.slice(0, 10);
  const inventoryAlerts = analytics.inventory_turnover.filter(item => item.reorder_needed);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Selling Products */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Top Selling Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="product_name" type="category" width={120} />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'revenue') return [`$${value.toLocaleString()}`, 'Revenue'];
                  return [value, name];
                }}
              />
              <Legend />
              <Bar dataKey="units_sold" fill={colors[0]} name="Units Sold" />
              <Bar dataKey="revenue" fill={colors[1]} name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Product Performance Matrix */}
      {analytics.product_performance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Product Performance Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={analytics.product_performance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sales_velocity" name="Sales Velocity" />
                <YAxis dataKey="profit_margin" name="Profit Margin" />
                <Tooltip 
                  formatter={(value, name, props) => [
                    name === 'sales_velocity' ? `${value} units/day` : `${value.toFixed(1)}%`,
                    name === 'sales_velocity' ? 'Sales Velocity' : 'Profit Margin'
                  ]}
                  labelFormatter={(label, payload) => payload?.[0]?.payload?.name || ''}
                />
                <Scatter dataKey="sales_velocity" fill={colors[0]} />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Inventory Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Inventory Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {analytics.inventory_turnover.length}
                </div>
                <div className="text-sm text-muted-foreground">Total SKUs</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {inventoryAlerts.length}
                </div>
                <div className="text-sm text-muted-foreground">Need Reorder</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {(analytics.inventory_turnover.reduce((sum, item) => sum + item.turnover_rate, 0) / analytics.inventory_turnover.length || 0).toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">Avg Turnover</div>
              </div>
            </div>
            
            {inventoryAlerts.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-orange-600">Reorder Alerts</h4>
                {inventoryAlerts.slice(0, 5).map((item) => (
                  <div key={item.product_id} className="flex justify-between items-center p-2 bg-orange-50 rounded">
                    <span className="text-sm font-medium">Product {item.product_id}</span>
                    <span className="text-sm text-muted-foreground">
                      {item.current_stock} units ({item.days_supply} days)
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Product Profitability */}
      {analytics.product_profitability.length > 0 && (
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Product Profitability Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.product_profitability.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'profit_margin_percentage') return [`${value.toFixed(1)}%`, 'Margin %'];
                    return [`$${value.toLocaleString()}`, name === 'unit_profit' ? 'Unit Profit' : 'Total Profit'];
                  }}
                />
                <Legend />
                <Bar dataKey="unit_profit" fill={colors[0]} name="Unit Profit" />
                <Bar dataKey="total_profit" fill={colors[1]} name="Total Profit" />
                <Bar dataKey="profit_margin_percentage" fill={colors[2]} name="Margin %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Configuration Popularity */}
      {analytics.configuration_popularity.length > 0 && (
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Popular Product Configurations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.configuration_popularity.slice(0, 8).map((config, index) => (
                <div key={config.configuration} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{config.configuration}</p>
                      <p className="text-sm text-muted-foreground">
                        Rank #{config.popularity_rank}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{config.usage_count} uses</p>
                    <p className="text-sm text-muted-foreground">
                      ${config.revenue_impact.toLocaleString()} impact
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory Turnover Chart */}
      {analytics.inventory_turnover.length > 0 && (
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Inventory Turnover Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.inventory_turnover.slice(0, 20)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="product_id" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'turnover_rate') return [`${value.toFixed(2)}`, 'Turnover Rate'];
                    if (name === 'days_supply') return [`${value} days`, 'Days Supply'];
                    return [value, 'Current Stock'];
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="turnover_rate" stroke={colors[0]} name="Turnover Rate" />
                <Line type="monotone" dataKey="days_supply" stroke={colors[1]} name="Days Supply" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}