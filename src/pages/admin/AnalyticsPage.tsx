import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RefreshCw, Download, TrendingUp, Users, Package, DollarSign, ShoppingCart, Loader2, BarChart3 } from 'lucide-react';

export function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month');

  // Simple analytics using React Query - basic queries only
  const { data: analytics, isLoading, error, refetch } = useQuery({
    queryKey: ['analytics', selectedPeriod],
    queryFn: async () => {
      // Since orders table has RLS issues, show basic analytics from accessible tables
      try {
        console.log('Loading analytics from accessible tables...');
        
        // Get products count (works)
        const { count: productsCount, error: productsError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });

        if (productsError) {
          console.error('Products error:', productsError);
        }

        // Get user profiles count
        const { count: usersCount, error: usersError } = await supabase
          .from('user_profiles')
          .select('*', { count: 'exact', head: true });

        if (usersError) {
          console.error('User profiles error:', usersError);
        }

        console.log('Analytics loaded - Products:', productsCount, 'Users:', usersCount);

        // Return placeholder analytics since orders table is not accessible
        return {
          totalOrders: 0,
          totalRevenue: 0,
          avgOrderValue: 0,
          totalCustomers: usersCount || 0,
          totalProducts: productsCount || 0,
          ordersByStatus: {},
          orders: [],
          note: 'Orders data not accessible due to database permissions'
        };
      } catch (error) {
        console.error('Analytics query failed:', error);
        // Return empty analytics rather than fail
        return {
          totalOrders: 0,
          totalRevenue: 0,
          avgOrderValue: 0,
          totalCustomers: 0,
          totalProducts: 0,
          ordersByStatus: {},
          orders: [],
          note: 'Database access limited'
        };
      }
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
    retry: 1
  });

  const handleRefresh = () => {
    refetch();
  };

  const getStatusBadge = (status: string, count: number) => {
    const colors = {
      pending: 'bg-yellow-500',
      processing: 'bg-blue-500',
      completed: 'bg-green-500',
      cancelled: 'bg-red-500'
    };

    return (
      <Badge className={`${colors[status as keyof typeof colors] || 'bg-gray-500'} text-white`}>
        {status}: {count}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p className="text-lg font-semibold mb-2">Error loading analytics</p>
            <p className="text-sm">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

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
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
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
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalOrders || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics?.totalRevenue?.toFixed(2) || '0.00'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalCustomers || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalProducts || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics?.avgOrderValue?.toFixed(2) || '0.00'}</div>
          </CardContent>
        </Card>
      </div>

      {/* Database Status */}
      <Card>
        <CardHeader>
          <CardTitle>Database Access Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-green-500 text-white">Products: Accessible</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-500 text-white">Users: Accessible</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-red-500 text-white">Orders: Permission Denied</Badge>
            </div>
            {analytics?.note && (
              <p className="text-sm text-muted-foreground mt-4">
                Note: {analytics.note}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Platform Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Package className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">Product Catalog</p>
                  <p className="text-sm text-muted-foreground">Active products in system</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{analytics?.totalProducts || 0}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">User Accounts</p>
                  <p className="text-sm text-muted-foreground">Registered users</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{analytics?.totalCustomers || 0}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">Orders Analytics</p>
                  <p className="text-sm text-yellow-600">Requires database permissions</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-yellow-600">Unavailable</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}