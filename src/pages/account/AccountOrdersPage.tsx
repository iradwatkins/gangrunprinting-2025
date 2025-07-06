import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { OrderHistory } from '@/components/orders/OrderHistory';
import { OrderDetail } from '@/components/orders/OrderDetail';
import { 
  ArrowLeft, 
  Package, 
  Upload, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Truck 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// Mock order data - in real app this would come from API
const mockOrders = [
  {
    id: 'ord_1',
    reference_number: 'ORD-2024001-ABC',
    status: 'on_hold_awaiting_files',
    total_amount: 89.97,
    created_at: '2024-01-15T10:00:00Z',
    items: [
      {
        id: 'item_1',
        product_name: 'Business Cards',
        quantity: 500,
        uploaded_files: []
      }
    ]
  },
  {
    id: 'ord_2', 
    reference_number: 'ORD-2024002-DEF',
    status: 'in_production',
    total_amount: 145.50,
    created_at: '2024-01-10T14:30:00Z',
    items: [
      {
        id: 'item_2',
        product_name: 'Flyers',
        quantity: 1000,
        uploaded_files: ['file_1', 'file_2']
      }
    ]
  }
];

export function AccountOrdersPage() {
  const { user } = useAuth();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const handleOrderSelect = (orderId: string) => {
    setSelectedOrderId(orderId);
  };

  const handleBackToOrders = () => {
    setSelectedOrderId(null);
  };

  const ordersAwaitingFiles = mockOrders.filter(order => order.status === 'on_hold_awaiting_files');

  if (selectedOrderId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <OrderDetail orderId={selectedOrderId} onBack={handleBackToOrders} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Link 
                  to="/account" 
                  className="text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to Account
                </Link>
              </div>
              <h1 className="text-3xl font-bold">Your Orders</h1>
              <p className="text-gray-600 mt-2">Manage and track all your orders</p>
            </div>
          </div>

          {/* Orders Awaiting Files Alert */}
          {ordersAwaitingFiles.length > 0 && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {ordersAwaitingFiles.length} order{ordersAwaitingFiles.length !== 1 ? 's' : ''} awaiting artwork files
                    </p>
                    <p className="text-sm">
                      Upload your design files to continue production on these orders.
                    </p>
                  </div>
                  <div className="flex flex-col space-y-2">
                    {ordersAwaitingFiles.map(order => (
                      <Button 
                        key={order.id}
                        size="sm" 
                        variant="outline"
                        onClick={() => handleOrderSelect(order.id)}
                        className="text-orange-700 border-orange-300"
                      >
                        <Upload className="w-3 h-3 mr-1" />
                        Upload for {order.reference_number}
                      </Button>
                    ))}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Order Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Package className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Total Orders</p>
                    <p className="text-2xl font-bold">{mockOrders.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium">Awaiting Files</p>
                    <p className="text-2xl font-bold">{ordersAwaitingFiles.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium">In Production</p>
                    <p className="text-2xl font-bold">
                      {mockOrders.filter(o => o.status === 'in_production').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Truck className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Shipped</p>
                    <p className="text-2xl font-bold">
                      {mockOrders.filter(o => o.status === 'shipped').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Orders List */}
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
            </CardHeader>
            <CardContent>
              {mockOrders.length > 0 ? (
                <div className="space-y-4">
                  {mockOrders.map(order => (
                    <div 
                      key={order.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleOrderSelect(order.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{order.reference_number}</h3>
                          <p className="text-sm text-gray-600">
                            {new Date(order.created_at).toLocaleDateString()} • 
                            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                          </p>
                          <div className="mt-2 flex items-center space-x-4">
                            {order.status === 'on_hold_awaiting_files' ? (
                              <Badge variant="destructive">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Awaiting Files
                              </Badge>
                            ) : order.status === 'in_production' ? (
                              <Badge variant="secondary">
                                <Clock className="w-3 h-3 mr-1" />
                                In Production
                              </Badge>
                            ) : order.status === 'shipped' ? (
                              <Badge variant="default">
                                <Truck className="w-3 h-3 mr-1" />
                                Shipped
                              </Badge>
                            ) : (
                              <Badge variant="outline">
                                {order.status.replace('_', ' ')}
                              </Badge>
                            )}
                            
                            {order.items.some(item => item.uploaded_files && item.uploaded_files.length > 0) ? (
                              <div className="flex items-center text-green-600 text-sm">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Files uploaded
                              </div>
                            ) : (
                              <div className="flex items-center text-orange-600 text-sm">
                                <Upload className="w-3 h-3 mr-1" />
                                Files needed
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${order.total_amount.toFixed(2)}</p>
                          {order.status === 'on_hold_awaiting_files' && (
                            <Button size="sm" className="mt-2">
                              <Upload className="w-3 h-3 mr-1" />
                              Upload Files
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-4">You haven't placed any orders yet</p>
                  <Button asChild>
                    <Link to="/products">
                      Start Shopping
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}