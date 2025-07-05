import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import type { RevenueAnalytics, AnalyticsPeriod } from '../../types/analytics';

interface RevenueAnalyticsChartProps {
  analytics: RevenueAnalytics | null;
  period: AnalyticsPeriod;
}

export function RevenueAnalyticsChart({ analytics, period }: RevenueAnalyticsChartProps) {
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

  if (!analytics) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No revenue analytics data available
      </div>
    );
  }

  const categoryData = Object.entries(analytics.revenue_by_category).map(([category, revenue]) => ({
    category,
    revenue
  }));

  const vendorData = Object.entries(analytics.revenue_by_vendor).map(([vendor, revenue]) => ({
    vendor,
    revenue
  }));

  const brokerRetailData = [
    { name: 'Broker Revenue', value: analytics.broker_vs_retail.broker_revenue, color: colors[0] },
    { name: 'Retail Revenue', value: analytics.broker_vs_retail.retail_revenue, color: colors[1] }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue Overview */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                ${analytics.total_revenue.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {analytics.revenue_growth > 0 ? '+' : ''}{analytics.revenue_growth.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Growth Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {analytics.broker_vs_retail.broker_orders + analytics.broker_vs_retail.retail_orders}
              </div>
              <div className="text-sm text-muted-foreground">Total Orders</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                ${(analytics.total_revenue / (analytics.broker_vs_retail.broker_orders + analytics.broker_vs_retail.retail_orders || 1)).toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Avg Order Value</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue by Category */}
      {categoryData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="revenue"
                  nameKey="category"
                  label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Broker vs Retail Revenue */}
      <Card>
        <CardHeader>
          <CardTitle>Broker vs Retail Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={brokerRetailData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {brokerRetailData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Revenue by Vendor */}
      {vendorData.length > 0 && (
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue by Vendor</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={vendorData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="vendor" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="revenue" fill={colors[0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Profit Margins */}
      {analytics.profit_margins.length > 0 && (
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Profit Margins by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.profit_margins}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'margin_percentage') {
                      return [`${value.toFixed(1)}%`, 'Margin %'];
                    }
                    return [`$${value.toLocaleString()}`, name === 'revenue' ? 'Revenue' : 'Cost'];
                  }}
                />
                <Legend />
                <Bar dataKey="revenue" fill={colors[0]} name="Revenue" />
                <Bar dataKey="cost" fill={colors[1]} name="Cost" />
                <Bar dataKey="margin_percentage" fill={colors[2]} name="Margin %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Revenue Forecast */}
      {analytics.forecasted_revenue.length > 0 && (
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.forecasted_revenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Forecasted Revenue']} />
                <Area
                  type="monotone"
                  dataKey="forecasted_revenue"
                  stroke={colors[0]}
                  fill={colors[0]}
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}