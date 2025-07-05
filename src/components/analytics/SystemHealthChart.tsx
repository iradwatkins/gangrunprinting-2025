import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart
} from 'recharts';
import { Activity, AlertCircle, Shield, Database, Users, Zap } from 'lucide-react';
import { Badge } from '../ui/badge';
import type { SystemAnalytics, AnalyticsPeriod } from '../../types/analytics';

interface SystemHealthChartProps {
  analytics: SystemAnalytics | null;
  period: AnalyticsPeriod;
}

export function SystemHealthChart({ analytics, period }: SystemHealthChartProps) {
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

  if (!analytics) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No system analytics data available
      </div>
    );
  }

  const criticalEvents = analytics.security_events.filter(event => event.severity === 'critical' || event.severity === 'high');
  const unresolvedEvents = analytics.security_events.filter(event => !event.resolved);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* System Health Overview */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Health Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {analytics.uptime_percentage.toFixed(2)}%
              </div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {analytics.api_response_times.length}
              </div>
              <div className="text-sm text-muted-foreground">API Endpoints</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {analytics.error_rates.reduce((sum, metric) => sum + metric.error_count, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Errors</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {analytics.database_performance.length}
              </div>
              <div className="text-sm text-muted-foreground">DB Queries</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {criticalEvents.length}
              </div>
              <div className="text-sm text-muted-foreground">Critical Events</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-600">
                {analytics.user_sessions.reduce((sum, session) => sum + session.total_sessions, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Sessions</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Response Times */}
      {analytics.api_response_times.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              API Response Times
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.api_response_times.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="endpoint" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [`${value}ms`, name]}
                />
                <Legend />
                <Bar dataKey="average_time" fill={colors[0]} name="Avg Response" />
                <Bar dataKey="p95_time" fill={colors[1]} name="95th Percentile" />
                <Bar dataKey="p99_time" fill={colors[2]} name="99th Percentile" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Error Rates */}
      {analytics.error_rates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Error Rates by Endpoint
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.error_rates.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="endpoint" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'error_rate') return [`${(value * 100).toFixed(2)}%`, 'Error Rate'];
                    return [value.toLocaleString(), name];
                  }}
                />
                <Legend />
                <Bar dataKey="error_count" fill={colors[3]} name="Error Count" />
                <Bar dataKey="error_rate" fill={colors[4]} name="Error Rate" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Database Performance */}
      {analytics.database_performance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.database_performance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="query_type" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'average_execution_time') return [`${value}ms`, 'Avg Execution Time'];
                    return [value.toLocaleString(), name];
                  }}
                />
                <Legend />
                <Bar dataKey="average_execution_time" fill={colors[0]} name="Avg Execution Time" />
                <Bar dataKey="slow_queries" fill={colors[1]} name="Slow Queries" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* User Sessions */}
      {analytics.user_sessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Sessions Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.user_sessions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="total_sessions"
                  stackId="1"
                  stroke={colors[0]}
                  fill={colors[0]}
                  name="Total Sessions"
                />
                <Area
                  type="monotone"
                  dataKey="average_duration"
                  stackId="2"
                  stroke={colors[1]}
                  fill={colors[1]}
                  name="Avg Duration"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Security Events */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Events
            {unresolvedEvents.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unresolvedEvents.length} Unresolved
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.security_events.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No security events recorded
            </div>
          ) : (
            <div className="space-y-4">
              {analytics.security_events.slice(0, 10).map((event, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        event.severity === 'critical' ? 'destructive' :
                        event.severity === 'high' ? 'destructive' :
                        event.severity === 'medium' ? 'default' : 'secondary'
                      }
                    >
                      {event.severity}
                    </Badge>
                    <div>
                      <p className="font-medium">{event.event_type}</p>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {new Date(event.timestamp).toLocaleDateString()}
                    </p>
                    <Badge variant={event.resolved ? 'default' : 'destructive'}>
                      {event.resolved ? 'Resolved' : 'Open'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session Analytics */}
      {analytics.user_sessions.length > 0 && (
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Session Analytics Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {analytics.user_sessions.reduce((sum, session) => sum + session.total_sessions, 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {(analytics.user_sessions.reduce((sum, session) => sum + session.average_duration, 0) / analytics.user_sessions.length || 0).toFixed(1)}m
                </div>
                <div className="text-sm text-muted-foreground">Avg Duration</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {(analytics.user_sessions.reduce((sum, session) => sum + session.bounce_rate, 0) / analytics.user_sessions.length || 0).toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Bounce Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {(analytics.user_sessions.reduce((sum, session) => sum + session.conversion_rate, 0) / analytics.user_sessions.length || 0).toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Conversion Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}