
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { useCheckout } from '@/hooks/useCheckout';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { MapPin, Plus, Check } from 'lucide-react';
import type { Address } from '@/types/auth';

const shippingSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  company: z.string().optional(),
  street_address: z.string().min(5, 'Street address must be at least 5 characters'),
  street_address_2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().length(2, 'State must be 2 characters (e.g., CA)'),
  postal_code: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid postal code format'),
  country: z.string().default('US'),
  phone: z.string().optional(),
  save_address: z.boolean().default(false)
});

type ShippingFormData = z.infer<typeof shippingSchema>;

interface ShippingFormProps {
  onNext: () => void;
}

export function ShippingForm({ onNext }: ShippingFormProps) {
  const { session, updateSession, validateAddress } = useCheckout();
  const { isAuthenticated } = useAuth();
  const { addresses } = useProfile();
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset
  } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      country: 'US',
      save_address: false
    }
  });

  // Load existing shipping address from session
  useEffect(() => {
    if (session?.shipping_address) {
      const addr = session.shipping_address;
      reset({
        first_name: addr.first_name,
        last_name: addr.last_name,
        company: addr.company || '',
        street_address: addr.street_address,
        street_address_2: addr.street_address_2 || '',
        city: addr.city,
        state: addr.state,
        postal_code: addr.postal_code,
        country: addr.country,
        phone: addr.phone || '',
        save_address: false
      });
    }
  }, [session?.shipping_address, reset]);

  const watchedFields = watch();

  const handleAddressSelect = (address: Address) => {
    setSelectedAddressId(address.id);
    setValue('first_name', address.first_name);
    setValue('last_name', address.last_name);
    setValue('company', address.company || '');
    setValue('street_address', address.street_address);
    setValue('street_address_2', address.street_address_2 || '');
    setValue('city', address.city);
    setValue('state', address.state);
    setValue('postal_code', address.postal_code);
    setValue('country', address.country);
    setValue('phone', address.phone || '');
  };

  const handleValidateAddress = async () => {
    const addressData = {
      first_name: watchedFields.first_name,
      last_name: watchedFields.last_name,
      company: watchedFields.company,
      street_address: watchedFields.street_address,
      street_address_2: watchedFields.street_address_2,
      city: watchedFields.city,
      state: watchedFields.state,
      postal_code: watchedFields.postal_code,
      country: watchedFields.country,
      phone: watchedFields.phone
    };

    setIsValidating(true);
    try {
      const result = await validateAddress(addressData);
      setValidationResult(result);
    } catch (error) {
      console.error('Address validation failed:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const onSubmit = async (data: ShippingFormData) => {
    const shippingAddress: Address = {
      id: selectedAddressId || `addr_${Date.now()}`,
      label: data.company || 'Shipping Address',
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

    await updateSession({ shipping_address: shippingAddress });
    onNext();
  };

  return (
    <div className="space-y-6">
      {/* Saved Addresses */}
      {isAuthenticated && addresses.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Saved Addresses
          </h3>
          <div className="grid gap-3">
            {addresses.map((address) => (
              <Card 
                key={address.id} 
                className={`cursor-pointer transition-colors ${
                  selectedAddressId === address.id 
                    ? 'ring-2 ring-primary bg-primary/5' 
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => handleAddressSelect(address)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium">
                        {address.first_name} {address.last_name}
                      </div>
                      {address.company && (
                        <div className="text-sm text-muted-foreground">{address.company}</div>
                      )}
                      <div className="text-sm text-muted-foreground mt-1">
                        {address.street_address}
                        {address.street_address_2 && `, ${address.street_address_2}`}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {address.city}, {address.state} {address.postal_code}
                      </div>
                      {address.phone && (
                        <div className="text-sm text-muted-foreground">{address.phone}</div>
                      )}
                    </div>
                    {selectedAddressId === address.id && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-4 p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg">
            <button 
              type="button"
              onClick={() => {
                setSelectedAddressId(null);
                reset();
              }}
              className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Use a different address
            </button>
          </div>
        </div>
      )}

      {/* Address Form */}
      <div className={isAuthenticated && addresses.length > 0 && selectedAddressId ? 'opacity-50 pointer-events-none' : ''}>
        <h3 className="text-lg font-semibold mb-4">
          {isAuthenticated && addresses.length > 0 ? 'New Address' : 'Shipping Address'}
        </h3>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                {...register('first_name')}
                error={errors.first_name?.message}
              />
            </div>
            <div>
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                {...register('last_name')}
                error={errors.last_name?.message}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="company">Company (Optional)</Label>
            <Input
              id="company"
              {...register('company')}
              error={errors.company?.message}
            />
          </div>

          <div>
            <Label htmlFor="street_address">Street Address *</Label>
            <Input
              id="street_address"
              {...register('street_address')}
              error={errors.street_address?.message}
            />
          </div>

          <div>
            <Label htmlFor="street_address_2">Apartment, suite, etc. (Optional)</Label>
            <Input
              id="street_address_2"
              {...register('street_address_2')}
              error={errors.street_address_2?.message}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                {...register('city')}
                error={errors.city?.message}
              />
            </div>
            <div>
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                {...register('state')}
                placeholder="CA"
                maxLength={2}
                style={{ textTransform: 'uppercase' }}
                error={errors.state?.message}
              />
            </div>
            <div>
              <Label htmlFor="postal_code">ZIP Code *</Label>
              <Input
                id="postal_code"
                {...register('postal_code')}
                placeholder="12345"
                error={errors.postal_code?.message}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <Input
              id="phone"
              type="tel"
              {...register('phone')}
              error={errors.phone?.message}
            />
          </div>

          {/* Address Validation */}
          {watchedFields.street_address && watchedFields.city && watchedFields.state && watchedFields.postal_code && (
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleValidateAddress}
                disabled={isValidating}
                className="w-full"
              >
                {isValidating ? 'Validating...' : 'Validate Address'}
              </Button>
              
              {validationResult && (
                <div className={`p-3 rounded-lg ${
                  validationResult.is_valid 
                    ? 'bg-green-50 border border-green-200 text-green-800'
                    : 'bg-yellow-50 border border-yellow-200 text-yellow-800'
                }`}>
                  {validationResult.is_valid ? (
                    <div className="flex items-center">
                      <Check className="w-4 h-4 mr-2" />
                      Address validated successfully
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium mb-1">Address needs attention:</p>
                      <ul className="text-sm list-disc list-inside">
                        {validationResult.errors?.map((error: string, index: number) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                      {validationResult.corrected_address && (
                        <div className="mt-2">
                          <p className="font-medium">Suggested correction:</p>
                          <p className="text-sm">
                            {validationResult.corrected_address.street_address}<br />
                            {validationResult.corrected_address.city}, {validationResult.corrected_address.state} {validationResult.corrected_address.postal_code}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Save Address Option */}
          {isAuthenticated && (
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="save_address" 
                {...register('save_address')}
              />
              <Label htmlFor="save_address" className="text-sm">
                Save this address for future orders
              </Label>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="min-w-[150px]"
            >
              {isSubmitting ? 'Saving...' : 'Continue to Billing'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
