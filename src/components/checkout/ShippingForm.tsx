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
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useAuth';
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
  postal_code: z.string().regex(/^\\d{5}(-\\d{4})?$/, 'Invalid postal code format'),
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
    <div className=\"space-y-6\">
      {/* Saved Addresses */}
      {isAuthenticated && addresses.length > 0 && (
        <div>
          <h3 className=\"text-lg font-semibold mb-3 flex items-center\">
            <MapPin className=\"w-5 h-5 mr-2\" />
            Saved Addresses
          </h3>
          <div className=\"grid gap-3\">
            {addresses.map((address) => (
              <Card 
                key={address.id} 
                className={`cursor-pointer transition-colors ${\n                  selectedAddressId === address.id \n                    ? 'ring-2 ring-primary bg-primary/5' \n                    : 'hover:bg-muted/50'\n                }`}
                onClick={() => handleAddressSelect(address)}
              >
                <CardContent className=\"p-4\">
                  <div className=\"flex items-start justify-between\">
                    <div className=\"flex-1\">
                      <div className=\"font-medium\">
                        {address.first_name} {address.last_name}
                      </div>
                      {address.company && (
                        <div className=\"text-sm text-muted-foreground\">{address.company}</div>
                      )}
                      <div className=\"text-sm text-muted-foreground mt-1\">
                        {address.street_address}
                        {address.street_address_2 && `, ${address.street_address_2}`}
                      </div>\n                      <div className=\"text-sm text-muted-foreground\">\n                        {address.city}, {address.state} {address.postal_code}\n                      </div>\n                      {address.phone && (\n                        <div className=\"text-sm text-muted-foreground\">{address.phone}</div>\n                      )}\n                    </div>\n                    {selectedAddressId === address.id && (\n                      <Check className=\"w-5 h-5 text-primary\" />\n                    )}\n                  </div>\n                </CardContent>\n              </Card>\n            ))}\n          </div>\n          \n          <div className=\"mt-4 p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg\">\n            <button \n              type=\"button\"\n              onClick={() => {\n                setSelectedAddressId(null);\n                reset();\n              }}\n              className=\"flex items-center text-muted-foreground hover:text-foreground transition-colors\"\n            >\n              <Plus className=\"w-4 h-4 mr-2\" />\n              Use a different address\n            </button>\n          </div>\n        </div>\n      )}\n\n      {/* Address Form */}\n      <div className={isAuthenticated && addresses.length > 0 && selectedAddressId ? 'opacity-50 pointer-events-none' : ''}>\n        <h3 className=\"text-lg font-semibold mb-4\">\n          {isAuthenticated && addresses.length > 0 ? 'New Address' : 'Shipping Address'}\n        </h3>\n        \n        <form onSubmit={handleSubmit(onSubmit)} className=\"space-y-4\">\n          <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">\n            <div>\n              <Label htmlFor=\"first_name\">First Name *</Label>\n              <Input\n                id=\"first_name\"\n                {...register('first_name')}\n                error={errors.first_name?.message}\n              />\n            </div>\n            <div>\n              <Label htmlFor=\"last_name\">Last Name *</Label>\n              <Input\n                id=\"last_name\"\n                {...register('last_name')}\n                error={errors.last_name?.message}\n              />\n            </div>\n          </div>\n\n          <div>\n            <Label htmlFor=\"company\">Company (Optional)</Label>\n            <Input\n              id=\"company\"\n              {...register('company')}\n              error={errors.company?.message}\n            />\n          </div>\n\n          <div>\n            <Label htmlFor=\"street_address\">Street Address *</Label>\n            <Input\n              id=\"street_address\"\n              {...register('street_address')}\n              error={errors.street_address?.message}\n            />\n          </div>\n\n          <div>\n            <Label htmlFor=\"street_address_2\">Apartment, suite, etc. (Optional)</Label>\n            <Input\n              id=\"street_address_2\"\n              {...register('street_address_2')}\n              error={errors.street_address_2?.message}\n            />\n          </div>\n\n          <div className=\"grid grid-cols-1 md:grid-cols-3 gap-4\">\n            <div>\n              <Label htmlFor=\"city\">City *</Label>\n              <Input\n                id=\"city\"\n                {...register('city')}\n                error={errors.city?.message}\n              />\n            </div>\n            <div>\n              <Label htmlFor=\"state\">State *</Label>\n              <Input\n                id=\"state\"\n                {...register('state')}\n                placeholder=\"CA\"\n                maxLength={2}\n                style={{ textTransform: 'uppercase' }}\n                error={errors.state?.message}\n              />\n            </div>\n            <div>\n              <Label htmlFor=\"postal_code\">ZIP Code *</Label>\n              <Input\n                id=\"postal_code\"\n                {...register('postal_code')}\n                placeholder=\"12345\"\n                error={errors.postal_code?.message}\n              />\n            </div>\n          </div>\n\n          <div>\n            <Label htmlFor=\"phone\">Phone Number (Optional)</Label>\n            <Input\n              id=\"phone\"\n              type=\"tel\"\n              {...register('phone')}\n              error={errors.phone?.message}\n            />\n          </div>\n\n          {/* Address Validation */}\n          {watchedFields.street_address && watchedFields.city && watchedFields.state && watchedFields.postal_code && (\n            <div className=\"space-y-2\">\n              <Button\n                type=\"button\"\n                variant=\"outline\"\n                onClick={handleValidateAddress}\n                disabled={isValidating}\n                className=\"w-full\"\n              >\n                {isValidating ? 'Validating...' : 'Validate Address'}\n              </Button>\n              \n              {validationResult && (\n                <div className={`p-3 rounded-lg ${\n                  validationResult.is_valid \n                    ? 'bg-green-50 border border-green-200 text-green-800'\n                    : 'bg-yellow-50 border border-yellow-200 text-yellow-800'\n                }`}>\n                  {validationResult.is_valid ? (\n                    <div className=\"flex items-center\">\n                      <Check className=\"w-4 h-4 mr-2\" />\n                      Address validated successfully\n                    </div>\n                  ) : (\n                    <div>\n                      <p className=\"font-medium mb-1\">Address needs attention:</p>\n                      <ul className=\"text-sm list-disc list-inside\">\n                        {validationResult.errors?.map((error: string, index: number) => (\n                          <li key={index}>{error}</li>\n                        ))}\n                      </ul>\n                      {validationResult.corrected_address && (\n                        <div className=\"mt-2\">\n                          <p className=\"font-medium\">Suggested correction:</p>\n                          <p className=\"text-sm\">\n                            {validationResult.corrected_address.street_address}<br />\n                            {validationResult.corrected_address.city}, {validationResult.corrected_address.state} {validationResult.corrected_address.postal_code}\n                          </p>\n                        </div>\n                      )}\n                    </div>\n                  )}\n                </div>\n              )}\n            </div>\n          )}\n\n          {/* Save Address Option */}\n          {isAuthenticated && (\n            <div className=\"flex items-center space-x-2\">\n              <Checkbox \n                id=\"save_address\" \n                {...register('save_address')}\n              />\n              <Label htmlFor=\"save_address\" className=\"text-sm\">\n                Save this address for future orders\n              </Label>\n            </div>\n          )}\n\n          <div className=\"flex justify-end pt-4\">\n            <Button \n              type=\"submit\" \n              disabled={isSubmitting}\n              className=\"min-w-[150px]\"\n            >\n              {isSubmitting ? 'Saving...' : 'Continue to Billing'}\n            </Button>\n          </div>\n        </form>\n      </div>\n    </div>\n  );\n}"