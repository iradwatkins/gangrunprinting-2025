import { Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CartItem } from '@/components/cart/CartItem';
import { CartSummary } from '@/components/cart/CartSummary';
import { CartValidation } from '@/components/cart/CartValidation';
import { useCart } from '@/hooks/useCart';

export function Cart() {
  const { cart, isLoading, isEmpty } = useCart();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/products">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center">
                  <ShoppingCart className="h-6 w-6 mr-2" />
                  Shopping Cart
                </h1>
                <p className="text-muted-foreground">
                  {isEmpty ? 'Your cart is empty' : `${cart.total_items} item${cart.total_items !== 1 ? 's' : ''} in your cart`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          {isEmpty ? (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <Package className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
                <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
                <p className="text-muted-foreground mb-6">
                  Looks like you haven't added any items to your cart yet. Start browsing our products to add items.
                </p>
                <div className="space-y-4">
                  <Button asChild size="lg">
                    <Link to="/products">
                      Browse Products
                    </Link>
                  </Button>
                  <div>
                    <Button variant="outline" asChild>
                      <Link to="/">
                        Back to Home
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-6">
                {/* Cart Validation */}
                <CartValidation />

                {/* Cart Items List */}
                <Card>
                  <CardHeader>
                    <CardTitle>Items in your cart</CardTitle>
                    <CardDescription>
                      Review and modify your selected items
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {cart.items.map((item) => (
                        <CartItem key={item.id} item={item} />
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Continue Shopping */}
                <div className="flex justify-center">
                  <Button variant="outline" asChild>
                    <Link to="/products">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Continue Shopping
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Cart Summary Sidebar */}
              <div>
                <div className="sticky top-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CartSummary cart={cart} showCheckoutButton />
                    </CardContent>
                  </Card>

                  {/* Trust Signals */}
                  <div className="mt-6 space-y-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>Secure checkout with SSL encryption</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span>Free shipping on orders over $100</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full" />
                      <span>30-day money-back guarantee</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}