import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
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
import type { CustomerAnalytics, AnalyticsPeriod } from '../../types/analytics';

interface CustomerAnalyticsChartProps {
  analytics: CustomerAnalytics | null;
  period: AnalyticsPeriod;
}

export function CustomerAnalyticsChart({ analytics, period }: CustomerAnalyticsChartProps) {
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

  if (!analytics) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No customer analytics data available
      </div>
    );
  }

  const customerTypeData = [
    { name: 'New Customers', value: analytics.new_customers, color: colors[0] },
    { name: 'Returning Customers', value: analytics.returning_customers, color: colors[1] }
  ];

  const acquisitionData = Object.entries(analytics.acquisition_sources).map(([source, count]) => ({
    source,
    count
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Customer Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Type Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={customerTypeData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {customerTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Acquisition Sources */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Acquisition Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={acquisitionData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="source" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="count" fill={colors[0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Customer Metrics Summary */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Customer Metrics Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {analytics.total_customers.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                ${analytics.customer_lifetime_value.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Avg Lifetime Value</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {analytics.churn_rate.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Churn Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {((analytics.returning_customers / analytics.total_customers) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Retention Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Segment Performance */}
      {analytics.segment_performance.length > 0 && (
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Customer Segment Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.segment_performance.map((segment) => (
                <div key={segment.segment_id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{segment.segment_name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {segment.customer_count} customers
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${segment.revenue.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">
                      {segment.conversion_rate.toFixed(1)}% conversion
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Behavior Flow */}
      {analytics.behavior_flow.length > 0 && (
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Customer Behavior Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.behavior_flow}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="step" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="entry_count" fill={colors[0]} name="Entries" />
                <Bar dataKey="exit_count" fill={colors[1]} name="Exits" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}