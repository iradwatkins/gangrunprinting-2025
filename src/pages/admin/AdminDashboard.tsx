import React from 'react';
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
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateOrderForCustomer } from '@/components/admin/CreateOrderForCustomer';

export function AdminDashboard() {
  const stats = [
    {
      title: 'Total Products',
      value: '0',
      change: '+0 this month',
      icon: Package,
      color: 'text-blue-600',
      href: '/admin/products'
    },
    {
      title: 'Active Orders',
      value: '0',
      change: '+0 today',
      icon: ShoppingCart,
      color: 'text-green-600',
      href: '/admin/orders'
    },
    {
      title: 'Revenue',
      value: '$0',
      change: '+$0 this month',
      icon: DollarSign,
      color: 'text-purple-600',
      href: '/admin/analytics'
    },
    {
      title: 'Customers',
      value: '0',
      change: '+0 this month',
      icon: Users,
      color: 'text-orange-600',
      href: '/admin/analytics'
    }
  ];

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
    <AdminLayout>
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
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                      </div>
                      <div className={`p-3 rounded-full bg-gray-50 ${stat.color}`}>
                        <Icon className="h-6 w-6" />
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
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Recent business activity will appear here</p>
                </div>
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
      </div>
    </AdminLayout>
  );
}