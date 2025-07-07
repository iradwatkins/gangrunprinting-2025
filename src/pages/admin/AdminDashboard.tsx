import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Tags, 
  Truck, 
  ShoppingCart,
  Users,
  Plus,
  BarChart3,
  DollarSign,
  Mail,
  ArrowUpRight,
  CheckCircle,
  Palette
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { productsApi } from '@/api/products';
import { categoriesApi } from '@/api/categories';
import { vendorsApi } from '@/api/vendors';

interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  totalCategories: number;
  totalVendors: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    activeProducts: 0,
    totalCategories: 0,
    totalVendors: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    setLoading(true);
    
    try {
      const [productsResponse, categoriesResponse, vendorsResponse, activeProductsResponse] = await Promise.all([
        productsApi.getProducts({ limit: 1 }),
        categoriesApi.getCategories({ limit: 1 }),
        vendorsApi.getVendors({ limit: 1 }),
        productsApi.getProducts({ is_active: true, limit: 1 })
      ]);

      setStats({
        totalProducts: productsResponse.meta?.total || 0,
        activeProducts: activeProductsResponse.meta?.total || 0,
        totalCategories: categoriesResponse.meta?.total || 0,
        totalVendors: vendorsResponse.meta?.total || 0
      });
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    }

    setLoading(false);
  };

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      description: `${stats.activeProducts} active`,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      href: '/admin/products'
    },
    {
      title: 'Total Revenue',
      value: '$0',
      description: 'This month',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
      href: '/admin/analytics'
    },
    {
      title: 'Categories',
      value: stats.totalCategories,
      description: 'Product categories',
      icon: Tags,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
      href: '/admin/categories'
    },
    {
      title: 'Active Orders',
      value: 0,
      description: 'Orders in progress',
      icon: ShoppingCart,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
      href: '/admin/orders'
    }
  ];

  const quickActions = [
    {
      title: 'Add Product',
      description: 'Create a new product',
      href: '/admin/products/new',
      icon: Plus,
      color: 'bg-blue-600'
    },
    {
      title: 'View Analytics',
      description: 'Sales & performance',
      href: '/admin/analytics',
      icon: BarChart3,
      color: 'bg-green-600'
    },
    {
      title: 'Manage Orders',
      description: 'Process customer orders',
      href: '/admin/orders',
      icon: ShoppingCart,
      color: 'bg-purple-600'
    },
    {
      title: 'Email Marketing',
      description: 'Send campaigns',
      href: '/admin/email',
      icon: Mail,
      color: 'bg-orange-600'
    }
  ];

  const setupTasks = [
    {
      title: 'Create Product Categories',
      description: 'Organize products with categories',
      completed: stats.totalCategories > 0,
      href: '/admin/categories',
      icon: Tags
    },
    {
      title: 'Add Print Vendors',
      description: 'Set up your print suppliers',
      completed: stats.totalVendors > 0,
      href: '/admin/vendors',
      icon: Truck
    },
    {
      title: 'Configure Paper Stocks',
      description: 'Add available paper options',
      completed: false,
      href: '/admin/paper-stocks',
      icon: Palette
    },
    {
      title: 'Add Your First Product',
      description: 'Create a product in your catalog',
      completed: stats.totalProducts > 0,
      href: '/admin/products/new',
      icon: Package
    }
  ];

  const completedTasks = setupTasks.filter(task => task.completed).length;
  const setupProgress = (completedTasks / setupTasks.length) * 100;

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Admin Dashboard & CRM
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Complete business management platform with integrated CRM functionality
            </p>
          </div>
          <Button size="sm" asChild>
            <Link to="/admin/products/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {loading ? (
                          <Skeleton className="h-8 w-16" />
                        ) : (
                          typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value
                        )}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {stat.description}
                      </p>
                    </div>
                    <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                  <Link 
                    to={stat.href}
                    className="absolute inset-0 flex items-end justify-end p-4 opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <ArrowUpRight className="h-4 w-4 text-gray-400" />
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link key={index} to={action.href} className="group">
                <Card className="h-full transition-all duration-200 hover:shadow-md bg-white dark:bg-gray-800">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${action.color}`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Setup Progress */}
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                  Setup Progress
                </CardTitle>
                <CardDescription className="mt-1">
                  Complete these steps to get your store ready
                </CardDescription>
              </div>
              <Badge variant="outline">
                {completedTasks}/{setupTasks.length} Complete
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={setupProgress} className="h-2" />
              
              <div className="space-y-3 mt-6">
                {setupTasks.map((task, index) => {
                  const Icon = task.icon;
                  return (
                    <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <div className={`p-2 rounded-lg ${task.completed ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-700'}`}>
                        {task.completed ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <Icon className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${task.completed ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-gray-900 dark:text-white'}`}>
                          {task.title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {task.description}
                        </p>
                      </div>
                      {!task.completed && (
                        <Button size="sm" variant="ghost" asChild>
                          <Link to={task.href}>
                            Get Started
                          </Link>
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}