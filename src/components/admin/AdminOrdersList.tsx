import React, { useState } from 'react';
import { OrderHistory } from '@/components/orders/OrderHistory';
import { OrderDetail } from '@/components/orders/OrderDetail';
import { useOrderSummary } from '@/hooks/useOrders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, DollarSign, Clock, CheckCircle } from 'lucide-react';

export const AdminOrdersList: React.FC = () => {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const { summary, loading: summaryLoading } = useOrderSummary();

  const handleOrderSelect = (orderId: string) => {
    setSelectedOrderId(orderId);
  };

  const handleBackToOrders = () => {
    setSelectedOrderId(null);
  };

  if (selectedOrderId) {
    return (
      <div className="space-y-6">
        <OrderDetail orderId={selectedOrderId} onBack={handleBackToOrders} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && !summaryLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_orders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${summary.total_amount.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.pending_orders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.completed_orders}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <OrderHistory onOrderSelect={handleOrderSelect} />
        </CardContent>
      </Card>
    </div>
  );
};