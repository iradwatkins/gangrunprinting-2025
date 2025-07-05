import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface MetricCardProps {
  title: string;
  value: number;
  icon?: React.ReactNode;
  trend?: number;
  format?: 'number' | 'currency' | 'percentage';
  description?: string;
  className?: string;
}

export function MetricCard({
  title,
  value,
  icon,
  trend,
  format = 'number',
  description,
  className
}: MetricCardProps) {
  const formatValue = (val: number, fmt: string) => {
    switch (fmt) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(val);
      case 'percentage':
        return `${val.toFixed(1)}%`;
      case 'number':
      default:
        return new Intl.NumberFormat('en-US').format(val);
    }
  };

  const formatTrend = (trendValue?: number) => {
    if (trendValue === undefined) return null;
    
    const isPositive = trendValue > 0;
    const TrendIcon = isPositive ? TrendingUp : TrendingDown;
    
    return (
      <div className={cn(
        "flex items-center gap-1 text-sm",
        isPositive ? "text-green-600" : "text-red-600"
      )}>
        <TrendIcon className="h-3 w-3" />
        <span>{Math.abs(trendValue).toFixed(1)}%</span>
      </div>
    );
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className="text-muted-foreground">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">
              {formatValue(value, format)}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
          {trend !== undefined && (
            <div className="text-right">
              {formatTrend(trend)}
              <p className="text-xs text-muted-foreground">vs last period</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}