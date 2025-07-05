import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCheckout } from '@/hooks/useCheckout';
import { useAuth } from '@/contexts/AuthContext';
import { 
  CreditCard, 
  Shield, 
  AlertCircle, 
  Lock,
  CheckCircle 
} from 'lucide-react';
import type { PaymentMethod } from '@/types/checkout';

const paymentSchema = z.object({
  gateway: z.enum(['square', 'paypal', 'cashapp']),
  card_number: z.string().optional(),
  exp_month: z.number().min(1).max(12).optional(),
  exp_year: z.number().min(new Date().getFullYear()).optional(),
  cvv: z.string().optional(),
  billing_name: z.string().min(1, 'Cardholder name is required'),
  save_payment_method: z.boolean().optional()
}).refine((data) => {
  if (data.gateway === 'square') {
    return !!(data.card_number && data.exp_month && data.exp_year && data.cvv);
  }
  return true;
}, {
  message: "Credit card information is required",
  path: ["card_number"]
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  onNext: () => void;
  onPrev: () => void;
}

export function PaymentForm({ onNext, onPrev }: PaymentFormProps) {
  const { session, updateSession, isLoading } = useCheckout();
  const { user } = useAuth();
  const [selectedGateway, setSelectedGateway] = useState<'square' | 'paypal' | 'cashapp'>('square');
  const [error, setError] = useState<string | null>(null);

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      gateway: 'square',
      billing_name: '',
      save_payment_method: false
    }
  });

  const paymentGateways = [
    {
      id: 'square' as const,
      name: 'Credit/Debit Card',
      description: 'Visa, Mastercard, American Express, Discover',
      icon: CreditCard,
      available: true,
      fees: 'No additional fees'
    },
    {
      id: 'paypal' as const,
      name: 'PayPal',
      description: 'Pay with your PayPal account',
      icon: () => (
        <div className="w-5 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
          PP
        </div>
      ),
      available: true,
      fees: 'No additional fees'
    },
    {
      id: 'cashapp' as const,
      name: 'Cash App Pay',
      description: 'Pay with Cash App',
      icon: () => (
        <div className="w-5 h-5 bg-green-500 rounded text-white text-xs flex items-center justify-center font-bold">
          CA
        </div>
      ),
      available: true,
      fees: 'No additional fees'
    }
  ];

  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    // Add spaces every 4 digits
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + (v.length > 2 ? '/' + v.substring(2, 4) : '');
    }
    return v;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    e.target.value = formatted;
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value);
    e.target.value = formatted;
    
    // Parse month and year
    const parts = formatted.split('/');
    if (parts.length === 2) {
      const month = parseInt(parts[0], 10);
      const year = parseInt(parts[1], 10) + 2000; // Assume 20xx
      form.setValue('exp_month', month);
      form.setValue('exp_year', year);
    }
  };

  const onSubmit = async (data: PaymentFormData) => {
    try {
      setError(null);

      const paymentMethod: PaymentMethod = {
        type: data.gateway,
        billing_name: data.billing_name
      };

      if (data.gateway === 'square' && data.card_number) {
        // In a real implementation, you would tokenize the card with Square's SDK
        paymentMethod.last_four = data.card_number.slice(-4).replace(/\s/g, '');
        paymentMethod.exp_month = data.exp_month;
        paymentMethod.exp_year = data.exp_year;
        paymentMethod.token = 'mock_token_' + Date.now(); // Mock token
      }

      await updateSession({
        payment_method: paymentMethod
      });

      onNext();
    } catch (error) {
      setError('Failed to save payment information. Please try again.');
      console.error('Payment form error:', error);
    }
  };

  const renderPaymentForm = () => {
    switch (selectedGateway) {
      case 'square':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="card_number">Card Number *</Label>
              <Input
                id="card_number"
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                {...form.register('card_number')}
                onChange={handleCardNumberChange}
              />
              {form.formState.errors.card_number && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.card_number.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry Date *</Label>
                <Input
                  id="expiry"
                  placeholder="MM/YY"
                  maxLength={5}
                  onChange={handleExpiryChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cvv">CVV *</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  maxLength={4}
                  {...form.register('cvv')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="billing_name">Cardholder Name *</Label>
              <Input
                id="billing_name"
                placeholder="John Doe"
                {...form.register('billing_name')}
              />
              {form.formState.errors.billing_name && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.billing_name.message}
                </p>
              )}
            </div>
          </div>
        );

      case 'paypal':
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded text-white text-sm flex items-center justify-center font-bold">
                PP
              </div>
            </div>
            <h3 className="font-semibold mb-2">PayPal Payment</h3>
            <p className="text-sm text-gray-600 mb-4">
              You'll be redirected to PayPal to complete your payment securely.
            </p>
            <Badge variant="outline">Secure PayPal Checkout</Badge>
          </div>
        );

      case 'cashapp':
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 bg-green-500 rounded text-white text-sm flex items-center justify-center font-bold">
                CA
              </div>
            </div>
            <h3 className="font-semibold mb-2">Cash App Pay</h3>
            <p className="text-sm text-gray-600 mb-4">
              You'll be redirected to Cash App to complete your payment.
            </p>
            <Badge variant="outline">Secure Cash App Payment</Badge>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Payment Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5" />
            <span>Payment Method</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={selectedGateway} 
            onValueChange={(value) => {
              setSelectedGateway(value as any);
              form.setValue('gateway', value as any);
            }}
          >
            <div className="space-y-3">
              {paymentGateways.map((gateway) => {
                const Icon = gateway.icon;
                return (
                  <Label
                    key={gateway.id}
                    htmlFor={gateway.id}
                    className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                      selectedGateway === gateway.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <RadioGroupItem value={gateway.id} id={gateway.id} />
                      <Icon />
                      <div>
                        <div className="font-medium">{gateway.name}</div>
                        <div className="text-sm text-gray-600">{gateway.description}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="text-xs">
                        {gateway.fees}
                      </Badge>
                      {gateway.available && (
                        <div className="flex items-center space-x-1 mt-1">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                          <span className="text-xs text-green-600">Available</span>
                        </div>
                      )}
                    </div>
                  </Label>
                );
              })}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Payment Form */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
        </CardHeader>
        <CardContent>
          {renderPaymentForm()}
        </CardContent>
      </Card>

      {/* Security Information */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Lock className="w-4 h-4" />
            <span>Your payment information is encrypted and secure</span>
          </div>
          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Shield className="w-3 h-3" />
              <span>256-bit SSL encryption</span>
            </div>
            <span>•</span>
            <span>PCI DSS compliant</span>
            <span>•</span>
            <span>No card details stored</span>
          </div>
        </CardContent>
      </Card>

      {/* Save Payment Method */}
      {user && selectedGateway === 'square' && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="save_payment_method"
                {...form.register('save_payment_method')}
                className="rounded border-gray-300"
              />
              <Label htmlFor="save_payment_method" className="text-sm">
                Save this payment method for future orders
              </Label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        <Button 
          type="button"
          variant="outline" 
          onClick={onPrev}
          disabled={isLoading}
        >
          Back to Shipping
        </Button>
        <Button 
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Review Order'}
        </Button>
      </div>
    </form>
  );
}