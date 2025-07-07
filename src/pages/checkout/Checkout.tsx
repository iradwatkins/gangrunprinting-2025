import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/hooks/useCart';
import { useCheckout } from '@/hooks/useCheckout';
import { CheckoutProvider } from '@/contexts/CheckoutContext';
import { CheckoutWizard } from '@/components/checkout/CheckoutWizard';
import { SinglePageCheckout } from '@/components/checkout/SinglePageCheckout';
import { EmptyCart } from '@/components/checkout/EmptyCart';
import { CheckoutHeader } from '@/components/checkout/CheckoutHeader';
import { CheckoutFooter } from '@/components/checkout/CheckoutFooter';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function Checkout() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { cart, isLoading: cartLoading } = useCart();
  
  // Redirect to cart if empty
  useEffect(() => {
    if (!cartLoading && (!cart?.items || cart.items.length === 0)) {
      navigate('/cart');
    }
  }, [cart, cartLoading, navigate]);

  // Show loading state
  if (authLoading || cartLoading) {
    return (
      <Layout showFooter={false}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card className="p-6">
                  <Skeleton className="h-8 w-48 mb-4" />
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </Card>
              </div>
              <div className="lg:col-span-1">
                <Card className="p-6">
                  <Skeleton className="h-6 w-32 mb-4" />
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Show empty cart if no items
  if (!cart?.items || cart.items.length === 0) {
    return (
      <Layout showFooter={false}>
        <EmptyCart />
      </Layout>
    );
  }

  return (
    <CheckoutProvider>
      <CheckoutContent />
    </CheckoutProvider>
  );
}

function CheckoutContent() {
  const { flowConfig } = useCheckout();
  
  return (
    <Layout showFooter={false}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {flowConfig.type === 'multi_step' ? (
            <CheckoutWizard />
          ) : (
            <SinglePageCheckout />
          )}
        </main>
      </div>
    </Layout>
  );
}