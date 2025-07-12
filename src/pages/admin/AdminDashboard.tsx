import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  DollarSign,
  FileText,
  Settings,
  BarChart3,
  Plus,
  Eye,
  Activity,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateOrderForCustomer } from '@/components/admin/CreateOrderForCustomer';
import { DatabaseHealthCheck } from '@/components/admin/DatabaseHealthCheck';
import { DatabaseDiagnostics } from '@/components/admin/DatabaseDiagnostics';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { FixVendorAddresses } from '@/components/admin/FixVendorAddresses';
import { AdminPageWrapper } from '@/components/admin/AdminPageWrapper';

export function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState([
    {
      title: 'Total Products',
      value: '0',
      change: '+0 this month',
      icon: Package,
      color: 'text-blue-600',
      href: '/admin/products',
      loading: true
    },
    {
      title: 'Active Orders',
      value: '0',
      change: '+0 today',
      icon: ShoppingCart,
      color: 'text-green-600',
      href: '/admin/orders',
      loading: true
    },
    {
      title: 'Revenue',
      value: '$0',
      change: '+$0 this month',
      icon: DollarSign,
      color: 'text-purple-600',
      href: '/admin/analytics',
      loading: true
    },
    {
      title: 'Customers',
      value: '0',
      change: '+0 this month',
      icon: Users,
      color: 'text-orange-600',
      href: '/admin/analytics',
      loading: true
    }
  ]);

  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load product count
      const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Load customer count
      const { count: customerCount } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'customer');

      // Load orders count (active orders - not completed)
      const { count: activeOrdersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .neq('status', 'completed');

      // Load total revenue from completed orders
      const { data: revenueData } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('status', 'completed');

      const totalRevenue = revenueData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

      // Load recent orders for activity
      const { data: recentOrders } = await supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          status,
          created_at,
          user_profiles (full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      // Update stats
      setStats([
        {
          title: 'Total Products',
          value: productCount?.toString() || '0',
          change: '+0 this month',
          icon: Package,
          color: 'text-blue-600',
          href: '/admin/products',
          loading: false
        },
        {
          title: 'Active Orders',
          value: activeOrdersCount?.toString() || '0',
          change: '+0 today',
          icon: ShoppingCart,
          color: 'text-green-600',
          href: '/admin/orders',
          loading: false
        },
        {
          title: 'Revenue',
          value: `$${totalRevenue.toFixed(2)}`,
          change: '+$0 this month',
          icon: DollarSign,
          color: 'text-purple-600',
          href: '/admin/analytics',
          loading: false
        },
        {
          title: 'Customers',
          value: customerCount?.toString() || '0',
          change: '+0 this month',
          icon: Users,
          color: 'text-orange-600',
          href: '/admin/analytics',
          loading: false
        }
      ]);

      setRecentActivity(recentOrders || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Create Product',
      description: 'Add new products to catalog',
      icon: Plus,
      href: '/admin/products/new',
      color: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
    },
    {
      title: 'View Orders',
      description: 'Manage customer orders',
      icon: Eye,
      href: '/admin/orders',
      color: 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
    },
    {
      title: 'Analytics',
      description: 'View business insights',
      icon: BarChart3,
      href: '/admin/analytics',
      color: 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100'
    },
    {
      title: 'Settings',
      description: 'Configure store settings',
      icon: Settings,
      href: '/admin/categories',
      color: 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100'
    }
  ];

  return (
    <AdminPageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Business Dashboard</h1>
            <p className="text-gray-600">Manage your printing business operations</p>
          </div>
          <div className="flex items-center space-x-3">
            <CreateOrderForCustomer />
            <Button asChild>
              <Link to="/admin/products/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Product
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Link key={index} to={stat.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                        <p className={`text-2xl font-bold text-gray-900 ${stat.loading ? 'animate-pulse' : ''}`}>
                          {stat.loading ? '...' : stat.value}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                      </div>
                      <div className={`p-3 rounded-full bg-gray-50 ${stat.color}`}>
                        <Icon className={`h-6 w-6 ${stat.loading ? 'animate-pulse' : ''}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Link key={index} to={action.href}>
                    <Card className={`h-full transition-all duration-200 hover:shadow-md border-2 ${action.color}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-white">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm">{action.title}</h3>
                            <p className="text-xs text-gray-500">{action.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Business Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="h-8 w-8 mx-auto mb-2 opacity-50 animate-pulse" />
                    <p className="text-sm">Loading recent activity...</p>
                  </div>
                ) : recentActivity.length > 0 ? (
                  recentActivity.map((order: any, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          Order #{order.id?.slice(-8)} - {order.user_profiles?.full_name || order.user_profiles?.email || 'Unknown Customer'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.created_at).toLocaleDateString()} • {order.status}
                        </p>
                      </div>
                      <div className="text-sm font-medium">
                        ${order.total_amount?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No recent orders yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5" />
                <span>System Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Product Catalog</span>
                  <span className="text-sm font-medium text-green-600">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Order Processing</span>
                  <span className="text-sm font-medium text-green-600">Online</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Payment System</span>
                  <span className="text-sm font-medium text-green-600">Connected</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Email Notifications</span>
                  <span className="text-sm font-medium text-green-600">Active</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Login - Show if not authenticated */}
        {!user && <AdminLogin />}

        {/* Database Diagnostics */}
        <DatabaseDiagnostics />

        {/* Database Health Check */}
        <DatabaseHealthCheck />

        {/* Temporary: Fix Vendor Addresses */}
        <FixVendorAddresses />

      </div>
    </AdminPageWrapper>
  );
}