import { ShoppingBag, Trash2, CreditCard, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCart } from '@/hooks/useCart';
import type { CartState } from '@/types/cart';

interface CartSummaryProps {
  cart: CartState;
  onContinueShopping?: () => void;
  showCheckoutButton?: boolean;
  className?: string;
}

export function CartSummary({ 
  cart, 
  onContinueShopping, 
  showCheckoutButton = true,
  className 
}: CartSummaryProps) {
  const { clearCart, isClearingCart } = useCart();

  const handleClearCart = () => {
    if (confirm('Are you sure you want to clear your cart? This action cannot be undone.')) {
      clearCart();
    }
  };

  const handleCheckout = () => {
    // TODO: Implement checkout navigation
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Summary Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Order Summary</h3>
        {cart.items.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearCart}
            disabled={isClearingCart}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear Cart
          </Button>
        )}
      </div>

      {/* Price Breakdown */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Subtotal ({cart.total_items} item{cart.total_items !== 1 ? 's' : ''}):</span>
          <span>${cart.subtotal.toFixed(2)}</span>
        </div>

        {cart.total_discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Total Discount:</span>
            <span>-${cart.total_discount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span>Tax:</span>
          <span>${cart.tax_amount.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span>Shipping:</span>
          <span>
            {cart.shipping_cost === 0 ? (
              <Badge variant="secondary" className="text-green-600">
                FREE
              </Badge>
            ) : (
              `$${cart.shipping_cost.toFixed(2)}`
            )}
          </span>
        </div>

        <Separator />

        <div className="flex justify-between text-lg font-bold">
          <span>Total:</span>
          <span>${cart.total_amount.toFixed(2)}</span>
        </div>
      </div>

      {/* Savings Display */}
      {cart.total_discount > 0 && (
        <Alert>
          <ShoppingBag className="h-4 w-4" />
          <AlertDescription>
            You're saving <strong>${cart.total_discount.toFixed(2)}</strong> on this order!
          </AlertDescription>
        </Alert>
      )}

      {/* Free Shipping Notice */}
      {cart.shipping_cost > 0 && cart.subtotal < 100 && (
        <Alert>
          <AlertDescription>
            Add <strong>${(100 - cart.subtotal).toFixed(2)}</strong> more to qualify for free shipping!
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        {showCheckoutButton && (
          <Button 
            onClick={handleCheckout}
            className="w-full"
            disabled={cart.items.length === 0}
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Proceed to Checkout
          </Button>
        )}

        {onContinueShopping && (
          <Button 
            variant="outline" 
            onClick={onContinueShopping}
            className="w-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Continue Shopping
          </Button>
        )}
      </div>

      {/* Order Notes */}
      <div className="text-xs text-muted-foreground text-center space-y-1">
        <p>• Prices are locked for 24 hours</p>
        <p>• Free shipping on orders over $100</p>
        <p>• Secure checkout with SSL encryption</p>
      </div>
    </div>
  );
}