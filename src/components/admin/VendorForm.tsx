import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { vendorsApi } from '@/api/vendors';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

// Simple vendor schema - just the essentials
const vendorSchema = z.object({
  name: z.string().min(1, 'Vendor name is required'),
  contact_email: z.string().email('Valid email is required'),
  contact_phone: z.string().optional(),
  address: z.string().min(1, 'Address is required'),
  notes: z.string().optional(),
  is_active: z.boolean().default(true),
});

type VendorFormData = z.infer<typeof vendorSchema>;

interface VendorFormProps {
  vendor?: Tables<'vendors'>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function VendorForm({ vendor, open, onOpenChange, onSuccess }: VendorFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const isEditing = !!vendor;

  const form = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: '',
      contact_email: '',
      contact_phone: '',
      address: '',
      notes: '',
      is_active: true,
    },
  });

  // Load vendor data when editing
  useEffect(() => {
    if (vendor) {
      form.reset({
        name: vendor.name || '',
        contact_email: vendor.contact_email || '',
        contact_phone: vendor.contact_phone || '',
        address: vendor.address || '',
        notes: vendor.notes || '',
        is_active: vendor.is_active ?? true,
      });
    } else {
      form.reset({
        name: '',
        contact_email: '',
        contact_phone: '',
        address: '',
        notes: '',
        is_active: true,
      });
    }
  }, [vendor, form]);

  const onSubmit = async (data: VendorFormData) => {
    setIsLoading(true);
    try {
      if (isEditing) {
        const updateData: TablesUpdate<'vendors'> = {
          name: data.name,
          contact_email: data.contact_email,
          contact_phone: data.contact_phone,
          address: data.address,
          notes: data.notes,
          is_active: data.is_active,
        };
        await vendorsApi.updateVendor(vendor.id, updateData);
        toast({ title: 'Vendor updated successfully' });
      } else {
        const insertData: TablesInsert<'vendors'> = {
          name: data.name,
          contact_email: data.contact_email,
          contact_phone: data.contact_phone,
          address: data.address,
          notes: data.notes,
          is_active: data.is_active,
        };
        await vendorsApi.createVendor(insertData);
        toast({ title: 'Vendor created successfully' });
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving vendor:', error);
      toast({
        title: 'Error saving vendor',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Vendor' : 'Add New Vendor'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update vendor information' : 'Add a new vendor for product assignments'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vendor Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vendor Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter vendor name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="vendor@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="(555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shipping Address *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter full shipping address where products will be sent"
                          className="min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Complete address where products should be shipped
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Any additional notes about this vendor"
                          className="min-h-[60px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Internal notes for admin reference
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Vendor</FormLabel>
                        <FormDescription>
                          Make this vendor available for product assignments
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Update Vendor' : 'Create Vendor'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}