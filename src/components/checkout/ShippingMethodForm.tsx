import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useCheckout } from '@/hooks/useCheckout';
import { Truck, Clock, DollarSign, AlertCircle } from 'lucide-react';
import type { ShippingMethod } from '@/types/checkout';

interface ShippingMethodFormProps {
  onNext: () => void;
  onPrev: () => void;
}

export function ShippingMethodForm({ onNext, onPrev }: ShippingMethodFormProps) {
  const { session, updateSession, calculateShipping, isLoading } = useCheckout();
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [loadingMethods, setLoadingMethods] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load shipping methods when component mounts or shipping address changes
  useEffect(() => {
    const loadShippingMethods = async () => {
      if (!session?.shipping_address || !session?.cart_items) {
        return;
      }

      try {
        setLoadingMethods(true);
        setError(null);
        
        const methods = await calculateShipping(session.shipping_address, session.cart_items);
        setShippingMethods(methods);
        
        // Pre-select existing method or first available method
        if (session.shipping_method) {
          setSelectedMethod(session.shipping_method.id);
        } else if (methods.length > 0) {
          setSelectedMethod(methods[0].id);
        }
      } catch (err) {
        setError('Failed to load shipping methods. Please try again.');
      } finally {
        setLoadingMethods(false);
      }
    };

    loadShippingMethods();
  }, [session?.shipping_address, session?.cart_items, calculateShipping]);

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
  };

  const handleContinue = async () => {
    if (!selectedMethod) {
      setError('Please select a shipping method');
      return;
    }

    const method = shippingMethods.find(m => m.id === selectedMethod);
    if (!method) {
      setError('Selected shipping method is not available');
      return;
    }

    try {
      await updateSession({
        shipping_method: method
      });
      onNext();
    } catch (error) {
      setError('Failed to save shipping method. Please try again.');
    }
  };

  const formatEstimatedDelivery = (days: number) => {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + days);
    return deliveryDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getMethodIcon = (carrier: string) => {
    return Truck; // In a real app, you might have different icons for different carriers
  };

  const getMethodBadge = (methodId: string) => {
    switch (methodId) {
      case 'standard':
        return <Badge variant="secondary">Most Popular</Badge>;
      case 'expedited':
        return <Badge variant="outline">Fast</Badge>;
      case 'overnight':
        return <Badge variant="destructive">Fastest</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-lg font-semibold mb-2">Choose Shipping Method</h2>
        <p className="text-sm text-gray-600">
          Select how you'd like your order to be delivered
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Shipping Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Truck className="w-5 h-5" />
            <span>Available Shipping Options</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingMethods ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="w-5 h-5 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : shippingMethods.length === 0 ? (
            <div className="text-center py-8">
              <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No shipping methods available</p>
              <p className="text-sm text-gray-500 mt-1">
                Please check your shipping address and try again
              </p>
            </div>
          ) : (
            <RadioGroup value={selectedMethod} onValueChange={handleMethodSelect}>
              <div className="space-y-3">
                {shippingMethods.map((method) => {
                  const MethodIcon = getMethodIcon(method.carrier);
                  return (
                    <div key={method.id} className="relative">
                      <Label
                        htmlFor={method.id}
                        className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                          selectedMethod === method.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <RadioGroupItem value={method.id} id={method.id} />
                          <MethodIcon className="w-5 h-5 text-gray-600" />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium">{method.name}</span>
                              {getMethodBadge(method.id)}
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{method.description}</span>
                              </div>
                              <span>•</span>
                              <span>via {method.carrier}</span>
                              <span>•</span>
                              <span>Est. delivery: {formatEstimatedDelivery(method.estimated_days)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4 text-gray-500" />
                            <span className="font-semibold">
                              {method.cost === 0 ? 'FREE' : `$${method.cost.toFixed(2)}`}
                            </span>
                          </div>
                        </div>
                      </Label>
                    </div>
                  );
                })}
              </div>
            </RadioGroup>
          )}
        </CardContent>
      </Card>

      {/* Special Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Delivery Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Important Notes</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Packages require signature confirmation for orders over $100</li>
                    <li>• Business addresses may have faster delivery times</li>
                    <li>• Holiday periods may affect delivery estimates</li>
                    <li>• Tracking information will be provided via email</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        <Button 
          variant="outline" 
          onClick={onPrev}
          disabled={isLoading}
        >
          Back to Billing
        </Button>
        <Button 
          onClick={handleContinue}
          disabled={isLoading || !selectedMethod || loadingMethods}
        >
          {isLoading ? 'Saving...' : 'Continue to Payment'}
        </Button>
      </div>
    </div>
  );
}