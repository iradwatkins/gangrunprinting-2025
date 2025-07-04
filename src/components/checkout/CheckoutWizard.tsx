import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useCheckout } from '@/hooks/useCheckout';
import { useCart } from '@/hooks/useCart';
import { ShippingForm } from './ShippingForm';
import { BillingForm } from './BillingForm';
import { ShippingMethodForm } from './ShippingMethodForm';
import { PaymentForm } from './PaymentForm';
import { OrderReview } from './OrderReview';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Circle,
  Truck,
  CreditCard,
  FileText,
  MapPin,
  DollarSign
} from 'lucide-react';

interface CheckoutWizardProps {
  onComplete?: (orderData: any) => void;
}

export function CheckoutWizard({ onComplete }: CheckoutWizardProps) {
  const { 
    session, 
    isLoading, 
    currentStep, 
    flowConfig, 
    nextStep, 
    prevStep, 
    goToStep,
    createSession
  } = useCheckout();
  const { cart } = useCart();

  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize checkout session if not exists
  useEffect(() => {
    if (!session && cart.items.length > 0 && !isInitialized) {
      createSession(cart.items);
      setIsInitialized(true);
    }
  }, [session, cart.items, createSession, isInitialized]);

  const steps = flowConfig.steps.sort((a, b) => a.order - b.order);
  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const getStepIcon = (stepId: string) => {
    switch (stepId) {
      case 'shipping': return MapPin;
      case 'billing': return DollarSign;
      case 'shipping_method': return Truck;
      case 'payment': return CreditCard;
      case 'review': return FileText;
      default: return Circle;
    }
  };

  const isStepCompleted = (stepIndex: number) => {
    if (!session) return false;
    
    const step = steps[stepIndex];
    switch (step.id) {
      case 'shipping':
        return !!session.shipping_address;
      case 'billing':
        return !!session.billing_address;
      case 'shipping_method':
        return !!session.shipping_method;
      case 'payment':
        return !!session.payment_method;
      case 'review':
        return false; // Never completed until order is placed
      default:
        return false;
    }
  };

  const canProceedToStep = (stepIndex: number) => {
    // Can always go to first step
    if (stepIndex === 0) return true;
    
    // Can proceed if all previous steps are completed
    for (let i = 0; i < stepIndex; i++) {
      if (!isStepCompleted(i)) return false;
    }
    return true;
  };

  const renderStepContent = () => {
    if (!currentStepData) return null;

    switch (currentStepData.id) {
      case 'shipping':
        return <ShippingForm onNext={nextStep} />;
      case 'billing':
        return <BillingForm onNext={nextStep} onPrev={prevStep} />;
      case 'shipping_method':
        return <ShippingMethodForm onNext={nextStep} onPrev={prevStep} />;
      case 'payment':
        return <PaymentForm onNext={nextStep} onPrev={prevStep} />;
      case 'review':
        return <OrderReview onPrev={prevStep} onComplete={onComplete} />;
      default:
        return <div>Step not implemented</div>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!session && cart.items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground mb-4">Your cart is empty</p>
        <Button onClick={() => window.location.href = '/products'}>
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Checkout</h1>
          <Badge variant="outline" className="text-sm">
            Step {currentStep + 1} of {steps.length}
          </Badge>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-6">
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Navigation */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const StepIcon = getStepIcon(step.id);
            const isCompleted = isStepCompleted(index);
            const isCurrent = index === currentStep;
            const canAccess = canProceedToStep(index);
            
            return (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => canAccess ? goToStep(index) : null}
                  disabled={!canAccess}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    isCurrent 
                      ? 'bg-primary text-primary-foreground' 
                      : isCompleted 
                        ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                        : canAccess 
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                          : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <StepIcon className="w-5 h-5" />
                  )}
                  <span className="hidden sm:block font-medium">{step.title}</span>
                </button>
                
                {index < steps.length - 1 && (
                  <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {React.createElement(getStepIcon(currentStepData?.id || ''), { className: 'w-6 h-6' })}
                <span>{currentStepData?.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderStepContent()}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Items */}
              <div className="space-y-3">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.product_name}</h4>
                      <p className="text-xs text-muted-foreground">
                        Qty: {item.quantity.toLocaleString()}
                      </p>
                      {item.configuration_display.paper_stock_name && (
                        <p className="text-xs text-muted-foreground">
                          {item.configuration_display.paper_stock_name}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${item.total_price.toFixed(2)}</p>
                      {item.price_breakdown.savings > 0 && (
                        <p className="text-xs text-green-600">
                          Save ${item.price_breakdown.savings.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${(session?.subtotal || cart.subtotal).toFixed(2)}</span>
                </div>
                
                {session?.shipping_cost ? (
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>${session.shipping_cost.toFixed(2)}</span>
                  </div>
                ) : null}
                
                {session?.tax_amount ? (
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>${session.tax_amount.toFixed(2)}</span>
                  </div>
                ) : null}
                
                {session?.discount_amount && session.discount_amount > 0 ? (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Savings</span>
                    <span>-${session.discount_amount.toFixed(2)}</span>
                  </div>
                ) : null}
                
                <Separator />
                
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${(session?.total_amount || cart.total_amount).toFixed(2)}</span>
                </div>
              </div>

              {/* Security Badge */}
              <div className="pt-4 border-t">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                  <span>Secure SSL encrypted checkout</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}