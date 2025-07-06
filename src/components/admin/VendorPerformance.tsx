import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Package, Clock, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { vendorsApi } from '@/api/vendors';
import type { Tables } from '@/integrations/supabase/types';

type Vendor = Tables<'vendors'>;

interface VendorPerformanceProps {
  vendor: Vendor;
}

interface PerformanceMetrics {
  totalOrders: number;
  completedOrders: number;
  totalRevenue: number;
  completionRate: number;
  recentOrders: number;
  averageOrderValue: number;
}

export function VendorPerformance({ vendor }: VendorPerformanceProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPerformanceData();
  }, [vendor.id]);

  const loadPerformanceData = async () => {
    setLoading(true);
    const response = await vendorsApi.getVendorPerformance(vendor.id);
    
    if (response.error) {
      toast({
        title: "Error",
        description: response.error,
        variant: "destructive",
      });
    } else {
      setMetrics(response.data);
    }
    setLoading(false);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getPerformanceRating = (completionRate: number): { label: string; color: string } => {
    if (completionRate >= 95) return { label: 'Excellent', color: 'text-green-600' };
    if (completionRate >= 85) return { label: 'Good', color: 'text-blue-600' };
    if (completionRate >= 70) return { label: 'Average', color: 'text-yellow-600' };
    return { label: 'Poor', color: 'text-red-600' };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Failed to load performance data
      </div>
    );
  }

  const performanceRating = getPerformanceRating(metrics.completionRate);

  return (
    <div className="space-y-6">
      {/* Header with vendor info */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{vendor.name} Performance</h3>
          <p className="text-sm text-muted-foreground">
            Performance metrics and statistics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={performanceRating.color}>
            {performanceRating.label}
          </Badge>
          <Badge variant={vendor.is_active ? 'default' : 'secondary'}>
            {vendor.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </div>

      {/* Performance Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.recentOrders} in last 30 days
            </p>
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Avg: {formatCurrency(metrics.averageOrderValue)}
            </p>
          </CardContent>
        </Card>

        {/* Completion Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.completionRate.toFixed(1)}%</div>
            <Progress value={metrics.completionRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.completedOrders} of {metrics.totalOrders} completed
            </p>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.recentOrders}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {metrics.recentOrders > 0 ? (
                <>
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  Active last 30 days
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                  No recent activity
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Vendor Rating */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendor Rating</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendor.rating?.toFixed(1) || '0.0'}/5</div>
            <div className="flex items-center mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <div
                  key={star}
                  className={`w-3 h-3 rounded-full mr-1 ${
                    star <= (vendor.rating || 0) 
                      ? 'bg-yellow-400' 
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pricing Tier */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pricing Tier</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendor.pricing_tier || 'Standard'}</div>
            <p className="text-xs text-muted-foreground">
              Cost category
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Performance Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {metrics.completionRate >= 95 && (
            <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
              <Award className="h-4 w-4 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800">Excellent Performance</p>
                <p className="text-xs text-green-600">
                  This vendor has an outstanding completion rate of {metrics.completionRate.toFixed(1)}%
                </p>
              </div>
            </div>
          )}
          
          {metrics.recentOrders === 0 && metrics.totalOrders > 0 && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
              <Clock className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Low Recent Activity</p>
                <p className="text-xs text-yellow-600">
                  No orders in the last 30 days. Consider reaching out to maintain relationship.
                </p>
              </div>
            </div>
          )}

          {metrics.completionRate < 70 && metrics.totalOrders > 5 && (
            <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
              <TrendingDown className="h-4 w-4 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Performance Issues</p>
                <p className="text-xs text-red-600">
                  Completion rate of {metrics.completionRate.toFixed(1)}% is below standards. Consider review.
                </p>
              </div>
            </div>
          )}

          {metrics.averageOrderValue > 1000 && (
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
              <DollarSign className="h-4 w-4 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">High Value Vendor</p>
                <p className="text-xs text-blue-600">
                  Average order value of {formatCurrency(metrics.averageOrderValue)} indicates premium services
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}