import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCheckout } from '@/hooks/useCheckout';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { 
  MapPin, 
  CreditCard, 
  Truck, 
  Package, 
  AlertCircle,
  CheckCircle,
  Lock,
  Edit
} from 'lucide-react';

interface OrderReviewProps {
  onPrev: () => void;
  onComplete?: (orderData: any) => void;
}

export function OrderReview({ onPrev, onComplete }: OrderReviewProps) {
  const navigate = useNavigate();
  const { session, processPayment, isLoading } = useCheckout();
  const { clearCart } = useCart();
  const { user } = useAuth();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePlaceOrder = async () => {
    if (!termsAccepted) {
      setError('Please accept the terms and conditions to continue.');
      return;
    }

    if (!session?.payment_method) {
      setError('Payment method is required.');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      // Process payment
      const paymentResult = await processPayment({
        checkout_session_id: session.id,
        payment_method: session.payment_method,
        payment_token: session.payment_method.token || 'mock_token_' + Date.now(),
        save_payment_method: false
      });

      if (paymentResult.success) {
        // Clear cart after successful order
        await clearCart();
        
        // Call completion callback if provided
        if (onComplete) {
          onComplete(paymentResult);
        }
        
        // Navigate to confirmation page
        navigate(`/checkout/confirmation/${paymentResult.reference_number}`);
      } else {
        setError(paymentResult.error || 'Payment failed. Please try again.');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Order placement error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!session) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No checkout session found</p>
      </div>
    );
  }

  const formatAddress = (address: any) => {
    if (!address) return 'Not provided';
    
    return [
      `${address.first_name} ${address.last_name}`,
      address.company && address.company,
      address.street_address,
      address.street_address_2 && address.street_address_2,
      `${address.city}, ${address.state} ${address.postal_code}`,
      address.country !== 'US' && address.country
    ].filter(Boolean).join('\n');
  };

  const formatPaymentMethod = (method: any) => {
    if (!method) return 'Not provided';
    
    switch (method.type) {
      case 'square':
        return `•••• •••• •••• ${method.last_four || '****'}`;
      case 'paypal':
        return 'PayPal Account';
      case 'cashapp':
        return 'Cash App Pay';
      default:
        return method.type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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
            {session.cart_items.map((item) => (
              <div key={item.id} className="flex justify-between items-start p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{item.product_name}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Quantity: {item.quantity.toLocaleString()}
                  </p>
                  {item.configuration_display.paper_stock_name && (
                    <p className="text-sm text-gray-600">
                      Paper: {item.configuration_display.paper_stock_name}
                    </p>
                  )}
                  {item.configuration_display.print_size_name && (
                    <p className="text-sm text-gray-600">
                      Size: {item.configuration_display.print_size_name}
                    </p>
                  )}
                  {item.configuration_display.turnaround_time_name && (
                    <p className="text-sm text-gray-600">
                      Turnaround: {item.configuration_display.turnaround_time_name}
                    </p>
                  )}
                  {item.configuration_display.add_on_names.length > 0 && (
                    <p className="text-sm text-gray-600">
                      Add-ons: {item.configuration_display.add_on_names.join(', ')}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-semibold">${item.total_price.toFixed(2)}</p>
                  {item.price_breakdown.savings > 0 && (
                    <p className="text-sm text-green-600">
                      Save ${item.price_breakdown.savings.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Shipping Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Shipping Information</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onPrev()}>
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Shipping Address</h4>
            <p className="text-sm text-gray-600 whitespace-pre-line">
              {formatAddress(session.shipping_address)}
            </p>
          </div>
          
          {session.shipping_method && (
            <div>
              <h4 className="font-medium mb-2">Shipping Method</h4>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{session.shipping_method.name}</p>
                  <p className="text-sm text-gray-600">{session.shipping_method.description}</p>
                  <p className="text-sm text-gray-600">via {session.shipping_method.carrier}</p>
                </div>
                <p className="font-semibold">
                  {session.shipping_method.cost === 0 ? 'FREE' : `$${session.shipping_method.cost.toFixed(2)}`}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Billing Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5" />
            <span>Billing & Payment</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Billing Address</h4>
            <p className="text-sm text-gray-600 whitespace-pre-line">
              {session.billing_address 
                ? formatAddress(session.billing_address)
                : 'Same as shipping address'
              }
            </p>
          </div>
          
          {session.payment_method && (
            <div>
              <h4 className="font-medium mb-2">Payment Method</h4>
              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-gray-600" />
                <span>{formatPaymentMethod(session.payment_method)}</span>
                {session.payment_method.type === 'square' && (
                  <Badge variant="secondary">Credit Card</Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Total */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${session.subtotal.toFixed(2)}</span>
            </div>
            
            {session.shipping_cost > 0 && (
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>${session.shipping_cost.toFixed(2)}</span>
              </div>
            )}
            
            {session.tax_amount > 0 && (
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${session.tax_amount.toFixed(2)}</span>
              </div>
            )}
            
            {session.discount_amount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-${session.discount_amount.toFixed(2)}</span>
              </div>
            )}
            
            <Separator />
            
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>${session.total_amount.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms and Conditions */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox 
              id="terms"
              checked={termsAccepted}
              onCheckedChange={setTermsAccepted}
              className="mt-1"
            />
            <Label htmlFor="terms" className="text-sm leading-relaxed">
              I agree to the{' '}
              <Button variant="link" className="p-0 h-auto text-sm">
                Terms of Service
              </Button>
              {' '}and{' '}
              <Button variant="link" className="p-0 h-auto text-sm">
                Privacy Policy
              </Button>
              . I understand that my order will be processed and charged upon confirmation.
            </Label>
          </div>
          
          <div className="flex items-start space-x-3">
            <Checkbox 
              id="marketing"
              checked={marketingOptIn}
              onCheckedChange={(checked) => setMarketingOptIn(checked === true)}
              className="mt-1"
            />
            <Label htmlFor="marketing" className="text-sm leading-relaxed">
              I would like to receive email updates about my order and promotional offers.
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Security Information */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Lock className="w-4 h-4" />
            <span>Your order is protected by 256-bit SSL encryption</span>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between pt-6">
        <Button 
          variant="outline" 
          onClick={onPrev}
          disabled={isProcessing}
        >
          Back to Payment
        </Button>
        
        <Button 
          onClick={handlePlaceOrder}
          disabled={!termsAccepted || isProcessing}
          className="bg-green-600 hover:bg-green-700"
          size="lg"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing Order...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Place Order - ${session.total_amount.toFixed(2)}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}