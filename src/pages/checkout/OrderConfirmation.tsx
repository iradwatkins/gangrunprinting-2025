import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Download, Mail, Package, Truck, User, Home, ShoppingBag } from 'lucide-react';

// Mock order data - in a real app, this would come from an API
const mockOrderData = {
  reference_number: 'ORD-1234567890-ABC123',
  order_id: 'ord_1234567890',
  payment_id: 'pay_1234567890',
  status: 'payment_confirmed',
  subtotal: 89.97,
  shipping_cost: 12.99,
  tax_amount: 8.45,
  total_amount: 111.41,
  created_at: new Date().toISOString(),
  estimated_delivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
  shipping_address: {
    first_name: 'John',
    last_name: 'Doe',
    street_address: '123 Main Street',
    city: 'New York',
    state: 'NY',
    postal_code: '10001',
    country: 'US'
  },
  shipping_method: {
    name: 'Standard Shipping',
    description: '5-7 business days',
    carrier: 'USPS'
  },
  payment_method: {
    type: 'square',
    last_four: '4242'
  },
  items: [
    {
      id: '1',
      product_name: 'Premium Business Cards',
      quantity: 500,
      unit_price: 0.18,
      total_price: 89.97,
      configuration_display: {
        paper_stock_name: '14pt Cardstock',
        print_size_name: '3.5" x 2"',
        turnaround_time_name: '5-7 Business Days'
      }
    }
  ]
};

export default function OrderConfirmation() {
  const { referenceNumber } = useParams();
  const [order, setOrder] = useState(mockOrderData);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    // Simulate email confirmation
    const timer = setTimeout(() => {
      setEmailSent(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const formatEstimatedDelivery = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatAddress = (address: any) => {
    return [
      `${address.first_name} ${address.last_name}`,
      address.street_address,
      `${address.city}, ${address.state} ${address.postal_code}`
    ].join('\n');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order Confirmed!
          </h1>
          
          <p className="text-lg text-gray-600 mb-4">
            Thank you for your order. We've received your payment and will begin processing your items.
          </p>
          
          <div className="flex items-center justify-center space-x-4">
            <Badge variant="outline" className="text-sm">
              Order #{order.reference_number}
            </Badge>
            <Badge variant="secondary" className="text-sm">
              Payment Confirmed
            </Badge>
          </div>
        </div>

        {/* Email Confirmation Status */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                emailSent ? 'bg-green-100' : 'bg-yellow-100'
              }`}>
                <Mail className={`w-4 h-4 ${emailSent ? 'text-green-600' : 'text-yellow-600'}`} />
              </div>
              <div>
                <p className="font-medium">
                  {emailSent ? 'Confirmation email sent!' : 'Sending confirmation email...'}
                </p>
                <p className="text-sm text-gray-600">
                  {emailSent 
                    ? 'Check your inbox for order details and tracking information.'
                    : 'We\'re sending a confirmation email with your order details.'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Details */}
          <div className="space-y-6">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="w-5 h-5" />
                  <span>Order Items</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.product_name}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Quantity: {item.quantity.toLocaleString()}
                        </p>
                        <div className="text-sm text-gray-600 mt-1 space-y-1">
                          {item.configuration_display.paper_stock_name && (
                            <p>Paper: {item.configuration_display.paper_stock_name}</p>
                          )}
                          {item.configuration_display.print_size_name && (
                            <p>Size: {item.configuration_display.print_size_name}</p>
                          )}
                          {item.configuration_display.turnaround_time_name && (
                            <p>Turnaround: {item.configuration_display.turnaround_time_name}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${item.total_price.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">
                          ${item.unit_price.toFixed(3)} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Truck className="w-5 h-5" />
                  <span>Shipping Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Delivery Address</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-line">
                    {formatAddress(order.shipping_address)}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Shipping Method</h4>
                  <p className="font-medium">{order.shipping_method.name}</p>
                  <p className="text-sm text-gray-600">{order.shipping_method.description}</p>
                  <p className="text-sm text-gray-600">via {order.shipping_method.carrier}</p>
                </div>
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-1">Estimated Delivery</h4>
                  <p className="text-blue-800">
                    {formatEstimatedDelivery(order.estimated_delivery)}
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    You'll receive tracking information once your order ships.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary and Actions */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${order.subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>${order.shipping_cost.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${order.tax_amount.toFixed(2)}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${order.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Payment Method</span>
                    <span>•••• •••• •••• {order.payment_method.last_four}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Status</span>
                    <Badge variant="secondary">Confirmed</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment ID</span>
                    <span className="text-sm font-mono">{order.payment_id}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <Button className="w-full" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download Receipt (PDF)
                </Button>
                
                <Button className="w-full" variant="outline">
                  <Mail className="w-4 h-4 mr-2" />
                  Resend Confirmation Email
                </Button>
                
                <Separator />
                
                <div className="space-y-3">
                  <Link to="/account">
                    <Button className="w-full" variant="outline">
                      <User className="w-4 h-4 mr-2" />
                      View Order in Account
                    </Button>
                  </Link>
                  
                  <Link to="/products">
                    <Button className="w-full">
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Continue Shopping
                    </Button>
                  </Link>
                  
                  <Link to="/">
                    <Button className="w-full" variant="outline">
                      <Home className="w-4 h-4 mr-2" />
                      Back to Home
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Next Steps */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>What happens next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-medium mb-2">Order Processing</h4>
                <p className="text-sm text-gray-600">
                  We'll prepare your order for production within 24 hours.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Truck className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-medium mb-2">Production & Shipping</h4>
                <p className="text-sm text-gray-600">
                  Your items will be printed and shipped according to your selected turnaround time.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-medium mb-2">Delivery</h4>
                <p className="text-sm text-gray-600">
                  You'll receive tracking information and delivery updates via email.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}