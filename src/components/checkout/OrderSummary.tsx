import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCheckout } from '@/hooks/useCheckout';
import { useCart } from '@/hooks/useCart';
import { Shield, CheckCircle } from 'lucide-react';

export function OrderSummary() {
  const { session } = useCheckout();
  const { cart } = useCart();

  const items = session?.cart_items || cart?.items || [];
  const subtotal = session?.subtotal || cart?.subtotal || 0;
  const shippingCost = session?.shipping_cost || 0;
  const taxAmount = session?.tax_amount || 0;
  const discountAmount = session?.discount_amount || 0;
  const totalAmount = session?.total_amount || cart?.total_amount || subtotal;

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Items */}
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-start">
              <div className="flex-1 pr-4">
                <h4 className="font-medium text-sm line-clamp-2">{item.product_name}</h4>
                <p className="text-xs text-gray-600 mt-1">
                  Qty: {item.quantity.toLocaleString()}
                </p>
                {item.configuration_display.paper_stock_name && (
                  <p className="text-xs text-gray-600">
                    {item.configuration_display.paper_stock_name}
                  </p>
                )}
                {item.configuration_display.print_size_name && (
                  <p className="text-xs text-gray-600">
                    {item.configuration_display.print_size_name}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="font-medium text-sm">${item.total_price.toFixed(2)}</p>
                {item.price_breakdown.savings > 0 && (
                  <p className="text-xs text-green-600">
                    Save ${item.price_breakdown.savings.toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {items.length > 0 && <Separator />}

        {/* Totals */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          
          {shippingCost > 0 && (
            <div className="flex justify-between text-sm">
              <span>Shipping</span>
              <span>${shippingCost.toFixed(2)}</span>
            </div>
          )}
          
          {shippingCost === 0 && session?.shipping_method && (
            <div className="flex justify-between text-sm">
              <span>Shipping</span>
              <span className="text-green-600 font-medium">FREE</span>
            </div>
          )}
          
          {taxAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span>Tax</span>
              <span>${taxAmount.toFixed(2)}</span>
            </div>
          )}
          
          {discountAmount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Savings</span>
              <span>-${discountAmount.toFixed(2)}</span>
            </div>
          )}
          
          <Separator />
          
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Shipping Method Info */}
        {session?.shipping_method && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Shipping Method</h4>
              <div className="text-sm text-gray-600">
                <p className="font-medium">{session.shipping_method.name}</p>
                <p>{session.shipping_method.description}</p>
                <p>via {session.shipping_method.carrier}</p>
              </div>
            </div>
          </>
        )}

        {/* Payment Method Info */}
        {session?.payment_method && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Payment Method</h4>
              <div className="text-sm text-gray-600">
                {session.payment_method.type === 'square' && (
                  <p>•••• •••• •••• {session.payment_method.last_four || '****'}</p>
                )}
                {session.payment_method.type === 'paypal' && (
                  <p>PayPal Account</p>
                )}
                {session.payment_method.type === 'cashapp' && (
                  <p>Cash App Pay</p>
                )}
              </div>
            </div>
          </>
        )}

        {/* Security Badge */}
        <Separator />
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Secure SSL encrypted checkout</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Shield className="w-4 h-4 text-blue-500" />
            <span>256-bit security protection</span>
          </div>
          
          <div className="text-xs text-gray-500 space-y-1">
            <p>• No card details stored on our servers</p>
            <p>• PCI DSS compliant payment processing</p>
            <p>• Money-back guarantee</p>
          </div>
        </div>

        {/* Promo Code */}
        {!session?.discount_amount && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Have a promo code?</h4>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Enter code"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                  Apply
                </button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}