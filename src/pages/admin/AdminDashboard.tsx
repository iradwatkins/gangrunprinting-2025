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
  MessageSquare
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
      bgColor: 'bg-blue-100',
      href: '/admin/products'
    },
    {
      title: 'Categories',
      value: stats.totalCategories,
      description: 'Product categories',
      icon: Tags,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      href: '/admin/categories'
    },
    {
      title: 'Vendors',
      value: stats.totalVendors,
      description: 'Print suppliers',
      icon: Truck,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      href: '/admin/vendors'
    },
    {
      title: 'CRM & Support',
      value: 0,
      description: 'Customer management',
      icon: MessageSquare,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      href: '/admin/crm'
    }
  ];

  const quickActions = [
    {
      title: 'Add Product',
      description: 'Create a new product in your catalog',
      href: '/admin/products/new',
      icon: Package,
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      title: 'Add Category',
      description: 'Create a new product category',
      href: '/admin/categories/new',
      icon: Tags,
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      title: 'Add Vendor',
      description: 'Add a new print supplier',
      href: '/admin/vendors/new',
      icon: Truck,
      color: 'bg-purple-600 hover:bg-purple-700'
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your product catalog management system
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          
          return (
            <Card key={index} className="transition-colors hover:bg-muted/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-md ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    stat.value.toLocaleString()
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
                {stat.href !== '#' && (
                  <Button asChild variant="link" className="h-auto p-0 mt-2">
                    <Link to={stat.href}>View all →</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks to manage your catalog
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              
              return (
                <Button 
                  key={index}
                  asChild 
                  variant="outline" 
                  className="w-full justify-start h-auto p-4"
                >
                  <Link to={action.href}>
                    <div className={`p-2 rounded-md mr-3 ${action.color}`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{action.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {action.description}
                      </div>
                    </div>
                  </Link>
                </Button>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest changes to your catalog
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">System initialized</p>
                  <p className="text-xs text-muted-foreground">
                    Product catalog is ready for setup
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Now
                </Badge>
              </div>
              
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  Activity will appear here as you manage your catalog
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Set up your product catalog in a few simple steps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">1</span>
              </div>
              <div>
                <h4 className="font-medium">Create Product Categories</h4>
                <p className="text-sm text-muted-foreground">
                  Organize your products with categories like Business Cards, Flyers, etc.
                </p>
                <Button asChild variant="link" size="sm" className="h-auto p-0 mt-1">
                  <Link to="/admin/categories">Manage Categories</Link>
                </Button>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">2</span>
              </div>
              <div>
                <h4 className="font-medium">Add Vendors</h4>
                <p className="text-sm text-muted-foreground">
                  Set up your print suppliers and their capabilities
                </p>
                <Button asChild variant="link" size="sm" className="h-auto p-0 mt-1">
                  <Link to="/admin/vendors">Manage Vendors</Link>
                </Button>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">3</span>
              </div>
              <div>
                <h4 className="font-medium">Create Products</h4>
                <p className="text-sm text-muted-foreground">
                  Add your first products with pricing and configuration options
                </p>
                <Button asChild variant="link" size="sm" className="h-auto p-0 mt-1">
                  <Link to="/admin/products/new">Add Product</Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </AdminLayout>
  );
}