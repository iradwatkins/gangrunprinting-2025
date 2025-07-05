import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCheckout } from '@/hooks/useCheckout';
import { useAuth } from '@/contexts/AuthContext';
import { CreditCard, MapPin, User, Building, Phone } from 'lucide-react';
import type { Address } from '@/types/auth';

const billingSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  company: z.string().optional(),
  street_address: z.string().min(1, 'Street address is required'),
  street_address_2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postal_code: z.string().min(5, 'ZIP code is required'),
  country: z.string().min(1, 'Country is required'),
  phone: z.string().optional(),
  same_as_shipping: z.boolean().optional()
});

type BillingFormData = z.infer<typeof billingSchema>;

interface BillingFormProps {
  onNext: () => void;
  onPrev: () => void;
}

export function BillingForm({ onNext, onPrev }: BillingFormProps) {
  const { session, updateSession, isLoading } = useCheckout();
  const { user } = useAuth();
  const [saveToProfile, setSaveToProfile] = useState(false);
  const [sameAsShipping, setSameAsShipping] = useState(true);

  const form = useForm<BillingFormData>({
    resolver: zodResolver(billingSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      company: '',
      street_address: '',
      street_address_2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'US',
      phone: '',
      same_as_shipping: true
    }
  });

  // Populate form with existing data or shipping address
  useEffect(() => {
    if (session?.billing_address) {
      form.reset({
        first_name: session.billing_address.first_name,
        last_name: session.billing_address.last_name,
        company: session.billing_address.company || '',
        street_address: session.billing_address.street_address,
        street_address_2: session.billing_address.street_address_2 || '',
        city: session.billing_address.city,
        state: session.billing_address.state,
        postal_code: session.billing_address.postal_code,
        country: session.billing_address.country,
        phone: session.billing_address.phone || '',
        same_as_shipping: false
      });
      setSameAsShipping(false);
    } else if (sameAsShipping && session?.shipping_address) {
      form.reset({
        first_name: session.shipping_address.first_name,
        last_name: session.shipping_address.last_name,
        company: session.shipping_address.company || '',
        street_address: session.shipping_address.street_address,
        street_address_2: session.shipping_address.street_address_2 || '',
        city: session.shipping_address.city,
        state: session.shipping_address.state,
        postal_code: session.shipping_address.postal_code,
        country: session.shipping_address.country,
        phone: session.shipping_address.phone || '',
        same_as_shipping: true
      });
    }
  }, [session, sameAsShipping, form]);

  // Handle same as shipping checkbox
  const handleSameAsShipping = (checked: boolean) => {
    setSameAsShipping(checked);
    if (checked && session?.shipping_address) {
      form.reset({
        ...session.shipping_address,
        company: session.shipping_address.company || '',
        street_address_2: session.shipping_address.street_address_2 || '',
        phone: session.shipping_address.phone || '',
        same_as_shipping: true
      });
    } else if (!checked) {
      form.reset({
        first_name: '',
        last_name: '',
        company: '',
        street_address: '',
        street_address_2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'US',
        phone: '',
        same_as_shipping: false
      });
    }
  };

  const onSubmit = async (data: BillingFormData) => {
    try {
      let billingAddress: Address;

      if (data.same_as_shipping && session?.shipping_address) {
        billingAddress = session.shipping_address;
      } else {
        billingAddress = {
          id: session?.billing_address?.id || `billing_${Date.now()}`,
          label: 'Billing Address',
          first_name: data.first_name,
          last_name: data.last_name,
          company: data.company,
          street_address: data.street_address,
          street_address_2: data.street_address_2,
          city: data.city,
          state: data.state,
          postal_code: data.postal_code,
          country: data.country,
          phone: data.phone,
          is_default: false
        };
      }

      await updateSession({
        billing_address: billingAddress
      });

      onNext();
    } catch (error) {
      console.error('Failed to update billing address:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Same as Shipping Option */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="same-as-shipping"
              checked={sameAsShipping}
              onCheckedChange={handleSameAsShipping}
            />
            <Label htmlFor="same-as-shipping" className="text-sm font-medium">
              Billing address is the same as shipping address
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Billing Form */}
      {!sameAsShipping && (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Billing Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    {...form.register('first_name')}
                    placeholder="John"
                  />
                  {form.formState.errors.first_name && (
                    <p className="text-sm text-red-600">
                      {form.formState.errors.first_name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    {...form.register('last_name')}
                    placeholder="Doe"
                  />
                  {form.formState.errors.last_name && (
                    <p className="text-sm text-red-600">
                      {form.formState.errors.last_name.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company (Optional)</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="company"
                    {...form.register('company')}
                    placeholder="Your Company"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone (Optional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    {...form.register('phone')}
                    placeholder="(555) 123-4567"
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Billing Address</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="street_address">Street Address *</Label>
                <Input
                  id="street_address"
                  {...form.register('street_address')}
                  placeholder="123 Main Street"
                />
                {form.formState.errors.street_address && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.street_address.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="street_address_2">Apartment, Suite, etc. (Optional)</Label>
                <Input
                  id="street_address_2"
                  {...form.register('street_address_2')}
                  placeholder="Apt 4B"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    {...form.register('city')}
                    placeholder="New York"
                  />
                  {form.formState.errors.city && (
                    <p className="text-sm text-red-600">
                      {form.formState.errors.city.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    {...form.register('state')}
                    placeholder="NY"
                    maxLength={2}
                  />
                  {form.formState.errors.state && (
                    <p className="text-sm text-red-600">
                      {form.formState.errors.state.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postal_code">ZIP Code *</Label>
                  <Input
                    id="postal_code"
                    {...form.register('postal_code')}
                    placeholder="12345"
                  />
                  {form.formState.errors.postal_code && (
                    <p className="text-sm text-red-600">
                      {form.formState.errors.postal_code.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save to Profile */}
          {user && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="save-to-profile"
                    checked={saveToProfile}
                    onCheckedChange={setSaveToProfile}
                  />
                  <Label htmlFor="save-to-profile" className="text-sm">
                    Save this billing address to my profile for future orders
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
              {isLoading ? 'Saving...' : 'Continue to Shipping Method'}
            </Button>
          </div>
        </form>
      )}

      {/* Same as Shipping - Direct Navigation */}
      {sameAsShipping && (
        <div className="flex justify-between pt-6">
          <Button 
            variant="outline" 
            onClick={onPrev}
            disabled={isLoading}
          >
            Back to Shipping
          </Button>
          <Button 
            onClick={onNext}
            disabled={isLoading}
          >
            Continue to Shipping Method
          </Button>
        </div>
      )}
    </div>
  );
}