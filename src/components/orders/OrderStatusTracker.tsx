import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OrderStatus, OrderStatusHistory } from '@/types/orders';
import { 
  CheckCircle, 
  Clock, 
  Package, 
  CreditCard, 
  Truck, 
  Home,
  XCircle,
  RotateCcw
} from 'lucide-react';
import { format } from 'date-fns';

interface OrderStatusTrackerProps {
  status: OrderStatus;
  statusHistory: OrderStatusHistory[];
  createdAt: string;
}

export const OrderStatusTracker: React.FC<OrderStatusTrackerProps> = ({ 
  status, 
  statusHistory, 
  createdAt 
}) => {
  const statusSteps = [
    {
      key: 'draft',
      label: 'Draft',
      icon: Clock,
      description: 'Order created'
    },
    {
      key: 'pending_payment',
      label: 'Pending Payment',
      icon: CreditCard,
      description: 'Awaiting payment'
    },
    {
      key: 'payment_confirmed',
      label: 'Payment Confirmed',
      icon: CheckCircle,
      description: 'Payment received'
    },
    {
      key: 'in_production',
      label: 'In Production',
      icon: Package,
      description: 'Being manufactured'
    },
    {
      key: 'shipped',
      label: 'Shipped',
      icon: Truck,
      description: 'On the way'
    },
    {
      key: 'delivered',
      label: 'Delivered',
      icon: Home,
      description: 'Order completed'
    }
  ];

  const getStepStatus = (stepKey: string) => {
    const stepIndex = statusSteps.findIndex(step => step.key === stepKey);
    const currentIndex = statusSteps.findIndex(step => step.key === status);
    
    if (status === 'cancelled' || status === 'refunded') {
      return stepKey === status ? 'current' : 'inactive';
    }
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'inactive';
  };

  const getStatusColor = (stepStatus: string) => {
    switch (stepStatus) {
      case 'completed': return 'text-green-600';
      case 'current': return 'text-blue-600';
      default: return 'text-gray-400';
    }
  };

  const getStatusBg = (stepStatus: string) => {
    switch (stepStatus) {
      case 'completed': return 'bg-green-100 border-green-600';
      case 'current': return 'bg-blue-100 border-blue-600';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  const getStatusIcon = (stepKey: string, stepStatus: string) => {
    const step = statusSteps.find(s => s.key === stepKey);
    const Icon = step?.icon || Clock;
    
    if (stepStatus === 'completed') {
      return <CheckCircle className="w-4 h-4" />;
    }
    
    return <Icon className="w-4 h-4" />;
  };

  const getStatusHistoryItem = (stepKey: string) => {
    return statusHistory.find(item => item.status === stepKey);
  };

  const isSpecialStatus = status === 'cancelled' || status === 'refunded';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Order Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {isSpecialStatus && (
            <div className="flex items-center justify-center p-4 bg-red-50 rounded-lg">
              <div className="text-center">
                {status === 'cancelled' ? (
                  <XCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
                ) : (
                  <RotateCcw className="w-8 h-8 mx-auto mb-2 text-red-500" />
                )}
                <Badge variant="destructive" className="mb-2">
                  {status === 'cancelled' ? 'Cancelled' : 'Refunded'}
                </Badge>
                <p className="text-sm text-gray-600">
                  {status === 'cancelled' 
                    ? 'This order has been cancelled'
                    : 'This order has been refunded'
                  }
                </p>
              </div>
            </div>
          )}

          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            
            <div className="space-y-6">
              {statusSteps.map((step, index) => {
                const stepStatus = getStepStatus(step.key);
                const historyItem = getStatusHistoryItem(step.key);
                
                return (
                  <div key={step.key} className="relative flex items-start gap-4">
                    <div className={`
                      relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2
                      ${getStatusBg(stepStatus)}
                    `}>
                      <div className={getStatusColor(stepStatus)}>
                        {getStatusIcon(step.key, stepStatus)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-medium ${getStatusColor(stepStatus)}`}>
                          {step.label}
                        </h3>
                        {stepStatus === 'current' && (
                          <Badge variant="secondary" className="text-xs">
                            Current
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {step.description}
                      </p>
                      
                      {historyItem && (
                        <div className="text-xs text-gray-500">
                          {format(new Date(historyItem.created_at), 'PPP p')}
                          {historyItem.notes && (
                            <p className="mt-1 text-gray-600">{historyItem.notes}</p>
                          )}
                        </div>
                      )}
                      
                      {stepStatus === 'current' && !historyItem && (
                        <div className="text-xs text-gray-500">
                          {format(new Date(createdAt), 'PPP p')}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {statusHistory.length > 0 && (
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3">Status History</h4>
              <div className="space-y-2">
                {statusHistory.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {item.status.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </Badge>
                      {item.notes && (
                        <span className="text-gray-600">{item.notes}</span>
                      )}
                    </div>
                    <span className="text-gray-500">
                      {format(new Date(item.created_at), 'MMM dd, yyyy p')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};