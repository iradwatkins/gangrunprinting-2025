import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShippingForm } from './ShippingForm';
import { BillingForm } from './BillingForm';
import { ShippingMethodForm } from './ShippingMethodForm';
import { PaymentForm } from './PaymentForm';
import { OrderReview } from './OrderReview';
import { OrderSummary } from './OrderSummary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCheckout } from '@/hooks/useCheckout';

export function SinglePageCheckout() {
  const { session } = useCheckout();

  // For single page checkout, we'll use tabs but allow free navigation
  const tabs = [
    { id: 'shipping', label: 'Shipping', component: ShippingForm },
    { id: 'billing', label: 'Billing', component: BillingForm },
    { id: 'shipping-method', label: 'Shipping Method', component: ShippingMethodForm },
    { id: 'payment', label: 'Payment', component: PaymentForm },
    { id: 'review', label: 'Review', component: OrderReview }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Checkout</h1>
        <p className="text-gray-600">Complete your order in one convenient page</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Checkout Form */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="shipping" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="text-sm">
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="mt-6">
              <TabsContent value="shipping">
                <Card>
                  <CardHeader>
                    <CardTitle>Shipping Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ShippingForm onNext={() => {}} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="billing">
                <Card>
                  <CardHeader>
                    <CardTitle>Billing Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BillingForm onNext={() => {}} onPrev={() => {}} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="shipping-method">
                <Card>
                  <CardHeader>
                    <CardTitle>Shipping Method</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ShippingMethodForm onNext={() => {}} onPrev={() => {}} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="payment">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PaymentForm onNext={() => {}} onPrev={() => {}} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="review">
                <Card>
                  <CardHeader>
                    <CardTitle>Review Your Order</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <OrderReview onPrev={() => {}} />
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <OrderSummary />
        </div>
      </div>
    </div>
  );
}