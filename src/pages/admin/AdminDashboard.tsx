import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Tags, 
  Truck, 
  ShoppingCart,
  TrendingUp,
  Users,
  Plus,
  MessageSquare,
  ArrowUpRight,
  BarChart3,
  DollarSign,
  Clock,
  Activity,
  Star,
  FileText,
  Settings,
  Mail,
  ChevronRight,
  Eye,
  Calendar,
  Filter,
  Download,
  MoreHorizontal,
  AlertCircle,
  CheckCircle,
  Search,
  Bell,
  Target,
  Zap,
  Award,
  Palette
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
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
      change: '+12%',
      changeType: 'positive' as const,
      description: `${stats.activeProducts} active`,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      href: '/admin/products'
    },
    {
      title: 'Total Revenue',
      value: '$0',
      change: '+0%',
      changeType: 'neutral' as const,
      description: 'This month',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
      href: '/admin/analytics'
    },
    {
      title: 'Categories',
      value: stats.totalCategories,
      change: '+2',
      changeType: 'positive' as const,
      description: 'Product categories',
      icon: Tags,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
      href: '/admin/categories'
    },
    {
      title: 'Active Orders',
      value: 0,
      change: '+0%',
      changeType: 'neutral' as const,
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
      color: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600',
      primary: true
    },
    {
      title: 'View Analytics',
      description: 'Sales & performance',
      href: '/admin/analytics',
      icon: BarChart3,
      color: 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600'
    },
    {
      title: 'Manage Orders',
      description: 'Process customer orders',
      href: '/admin/orders',
      icon: ShoppingCart,
      color: 'bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600'
    },
    {
      title: 'Email Marketing',
      description: 'Send campaigns',
      href: '/admin/email',
      icon: Mail,
      color: 'bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600'
    }
  ];

  const recentActivity = [
    {
      type: 'system',
      title: 'Admin dashboard initialized',
      description: 'System is ready for configuration',
      time: 'Just now',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      type: 'setup',
      title: 'Product catalog setup required',
      description: 'Add categories and products to get started',
      time: 'Pending',
      icon: AlertCircle,
      color: 'text-orange-600'
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
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Welcome back! Here's what's happening with your printing business.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button size="sm" asChild>
              <Link to="/admin/products/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Link>
            </Button>
          </div>
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
                      <div className="flex items-baseline space-x-2">
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                          {loading ? (
                            <Skeleton className="h-8 w-16" />
                          ) : (
                            typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value
                          )}
                        </p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          stat.changeType === 'positive' 
                            ? 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900' 
                            : stat.changeType === 'negative'
                            ? 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900'
                            : 'text-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-700'
                        }`}>
                          {stat.change}
                        </span>
                      </div>
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
                <Card className={`h-full transition-all duration-200 hover:shadow-md border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-700 ${action.primary ? 'ring-2 ring-blue-100 dark:ring-blue-900 border-blue-200 dark:border-blue-800' : ''} bg-white dark:bg-gray-800`}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${action.color} group-hover:scale-105 transition-transform`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {action.description}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Setup Progress & Activity */}
          <div className="lg:col-span-2 space-y-6">
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
                  <Badge 
                    variant="outline" 
                    className={`${setupProgress === 100 ? 'text-green-600 bg-green-100 border-green-200 dark:bg-green-900 dark:border-green-800' : 'text-orange-600 bg-orange-100 border-orange-200 dark:bg-orange-900 dark:border-orange-800'}`}
                  >
                    {completedTasks}/{setupTasks.length} Complete
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Overall Progress</span>
                    <span className="font-medium text-gray-900 dark:text-white">{Math.round(setupProgress)}%</span>
                  </div>
                  <Progress value={setupProgress} className="h-2" />
                  
                  <div className="space-y-3 mt-6">
                    {setupTasks.map((task, index) => {
                      const Icon = task.icon;
                      return (
                        <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group">
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
                                <ChevronRight className="h-4 w-4" />
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

            {/* Recent Activity */}
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                    Recent Activity
                  </CardTitle>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => {
                    const Icon = activity.icon;
                    return (
                      <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <div className={`p-2 rounded-full bg-gray-100 dark:bg-gray-700 ${activity.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">{activity.title}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{activity.description}</p>
                        </div>
                        <span className="text-xs text-gray-400 dark:text-gray-500">{activity.time}</span>
                      </div>
                    );
                  })}
                  
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">More activity will appear as you use the admin panel</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Management Links & Tools */}
          <div className="space-y-6">
            {/* Management Shortcuts */}
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  Management
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {[
                    { icon: Package, label: 'Products', href: '/admin/products', badge: stats.totalProducts },
                    { icon: Tags, label: 'Categories', href: '/admin/categories', badge: stats.totalCategories },
                    { icon: Truck, label: 'Vendors', href: '/admin/vendors', badge: stats.totalVendors },
                    { icon: Palette, label: 'Paper Stocks', href: '/admin/paper-stocks' },
                    { icon: ShoppingCart, label: 'Orders', href: '/admin/orders' },
                    { icon: Users, label: 'CRM', href: '/admin/crm' },
                    { icon: Mail, label: 'Email Marketing', href: '/admin/email' },
                    { icon: FileText, label: 'Files', href: '/admin/files' }
                  ].map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={index}
                        to={item.href}
                        className="flex items-center justify-between px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                          <span className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                            {item.label}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {item.badge !== undefined && (
                            <Badge variant="secondary" className="text-xs">
                              {item.badge}
                            </Badge>
                          )}
                          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                        </div>
                      </Link>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>

            {/* Tools & Analytics */}
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  Tools & Reports
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start hover:bg-gray-50 dark:hover:bg-gray-700" asChild>
                  <Link to="/admin/analytics">
                    <BarChart3 className="h-4 w-4 mr-3" />
                    View Analytics
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Download className="h-4 w-4 mr-3" />
                  Export Reports
                </Button>
                <Button variant="outline" className="w-full justify-start hover:bg-gray-50 dark:hover:bg-gray-700" asChild>
                  <Link to="/admin/checkout-settings">
                    <Settings className="h-4 w-4 mr-3" />
                    Store Settings
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Database</span>
                  <Badge variant="secondary" className="text-green-600 bg-green-100 dark:bg-green-900">
                    Online
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">API Status</span>
                  <Badge variant="secondary" className="text-green-600 bg-green-100 dark:bg-green-900">
                    Healthy
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Storage</span>
                  <Badge variant="secondary" className="text-green-600 bg-green-100 dark:bg-green-900">
                    Available
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Setup Progress</span>
                  <Badge variant={setupProgress === 100 ? "secondary" : "outline"} 
                         className={setupProgress === 100 ? "text-green-600 bg-green-100 dark:bg-green-900" : "text-orange-600 bg-orange-100 dark:bg-orange-900"}>
                    {Math.round(setupProgress)}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}