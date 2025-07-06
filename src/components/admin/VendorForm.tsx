import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Save, Loader2, X, Plus, Trash2 } from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { vendorsApi } from '@/api/vendors';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

const addressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
});

const capabilitiesSchema = z.object({
  printing_methods: z.array(z.string()).optional(),
  paper_stocks: z.array(z.string()).optional(),
  max_quantity: z.coerce.number().min(1).optional(),
  specialties: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
});

const vendorSchema = z.object({
  name: z.string().min(1, 'Vendor name is required').max(100, 'Name too long'),
  slug: z.string().min(1, 'Slug is required').max(100, 'Slug too long')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens only'),
  contact_name: z.string().min(1, 'Contact name is required').max(100, 'Name too long'),
  contact_email: z.string().email('Invalid email address').max(100, 'Email too long'),
  contact_phone: z.string().min(1, 'Phone number is required').max(20, 'Phone too long'),
  address: addressSchema.optional(),
  capabilities: capabilitiesSchema.optional(),
  pricing_tier: z.enum(['Budget', 'Standard', 'Premium', 'Enterprise']),
  turnaround_times: z.record(z.string(), z.coerce.number()).optional(),
  rating: z.coerce.number().min(0).max(5),
  notes: z.string().optional(),
  is_active: z.boolean()
});

type VendorFormData = z.infer<typeof vendorSchema>;
type Vendor = Tables<'vendors'>;

interface VendorFormProps {
  open: boolean;
  onClose: () => void;
  vendor?: Vendor | null;
  onSuccess: () => void;
}

const printingMethods = [
  'Digital Printing',
  'Offset Printing',
  'Large Format',
  'Screen Printing',
  'Letterpress',
  'Embossing',
  'Foil Stamping',
  'UV Printing'
];

const specialtyOptions = [
  'Rush Orders',
  'Custom Sizes',
  'Eco-Friendly',
  'Metallic Inks',
  'Textured Papers',
  'Die Cutting',
  'Binding Services',
  'Packaging'
];

const certificationOptions = [
  'ISO 9001',
  'ISO 14001',
  'FSC Certified',
  'PEFC Certified',
  'G7 Master',
  'Fogra Certified',
  'Green Business'
];

export function VendorForm({ open, onClose, vendor, onSuccess }: VendorFormProps) {
  const { toast } = useToast();
  const isEditing = !!vendor;

  const form = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: '',
      slug: '',
      contact_name: '',
      contact_email: '',
      contact_phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        zip: '',
        country: 'United States'
      },
      capabilities: {
        printing_methods: [],
        specialties: [],
        certifications: [],
        max_quantity: 10000,
        paper_stocks: []
      },
      pricing_tier: 'Standard',
      turnaround_times: {
        'rush': 1,
        'standard': 3,
        'economy': 7
      },
      rating: 0,
      notes: '',
      is_active: true
    }
  });

  useEffect(() => {
    if (vendor) {
      const address = typeof vendor.address === 'object' ? vendor.address : {};
      const capabilities = typeof vendor.capabilities === 'object' ? vendor.capabilities : {};
      const turnaroundTimes = typeof vendor.turnaround_times === 'object' ? vendor.turnaround_times : {};

      form.reset({
        name: vendor.name || '',
        slug: vendor.slug || '',
        contact_name: vendor.contact_name || '',
        contact_email: vendor.contact_email || '',
        contact_phone: vendor.contact_phone || '',
        address: {
          street: address.street || '',
          city: address.city || '',
          state: address.state || '',
          zip: address.zip || '',
          country: address.country || 'United States'
        },
        capabilities: {
          printing_methods: capabilities.printing_methods || [],
          specialties: capabilities.specialties || [],
          certifications: capabilities.certifications || [],
          max_quantity: capabilities.max_quantity || 10000,
          paper_stocks: capabilities.paper_stocks || []
        },
        pricing_tier: vendor.pricing_tier as 'Budget' | 'Standard' | 'Premium' | 'Enterprise' || 'Standard',
        turnaround_times: turnaroundTimes,
        rating: vendor.rating || 0,
        notes: vendor.notes || '',
        is_active: vendor.is_active ?? true
      });
    } else {
      form.reset({
        name: '',
        slug: '',
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        address: {
          street: '',
          city: '',
          state: '',
          zip: '',
          country: 'United States'
        },
        capabilities: {
          printing_methods: [],
          specialties: [],
          certifications: [],
          max_quantity: 10000,
          paper_stocks: []
        },
        pricing_tier: 'Standard',
        turnaround_times: {
          'rush': 1,
          'standard': 3,
          'economy': 7
        },
        rating: 0,
        notes: '',
        is_active: true
      });
    }
  }, [vendor, form]);

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleNameChange = (name: string) => {
    form.setValue('name', name);
    
    // Auto-generate slug if not editing or if slug is empty/auto-generated
    const currentSlug = form.getValues('slug');
    if (!isEditing || !currentSlug || currentSlug === generateSlug(form.getValues('name'))) {
      form.setValue('slug', generateSlug(name));
    }
  };

  const toggleCapability = (type: 'printing_methods' | 'specialties' | 'certifications', value: string) => {
    const current = form.getValues(`capabilities.${type}`) || [];
    const updated = current.includes(value)
      ? current.filter(item => item !== value)
      : [...current, value];
    form.setValue(`capabilities.${type}`, updated);
  };

  const onSubmit = async (data: VendorFormData) => {
    try {
      let response;

      if (isEditing && vendor) {
        response = await vendorsApi.updateVendor(vendor.id, data as TablesUpdate<'vendors'>);
      } else {
        response = await vendorsApi.createVendor(data as TablesInsert<'vendors'>);
      }

      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: `Vendor ${isEditing ? 'updated' : 'created'} successfully`,
      });

      form.reset();
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} vendor`,
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {isEditing ? 'Edit Vendor' : 'Add Vendor'}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update vendor information and capabilities' : 'Add a new print vendor with capabilities and contact information'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vendor Name *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., ABC Printing Co."
                            {...field}
                            onChange={(e) => handleNameChange(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL Slug *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., abc-printing-co"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="pricing_tier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pricing Tier</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Budget">Budget</SelectItem>
                            <SelectItem value="Standard">Standard</SelectItem>
                            <SelectItem value="Premium">Premium</SelectItem>
                            <SelectItem value="Enterprise">Enterprise</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Performance Rating (0-5)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            step="0.1"
                            min="0"
                            max="5"
                            placeholder="4.5"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="contact_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Person *</FormLabel>
                      <FormControl>
                        <Input placeholder="John Smith" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contact_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input 
                            type="email"
                            placeholder="john@abcprinting.com" 
                            {...field} 
                          />
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
                        <FormLabel>Phone *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="(555) 123-4567" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Address */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="address.street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main Street" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="address.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="New York" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address.state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input placeholder="NY" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address.zip"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ZIP Code</FormLabel>
                        <FormControl>
                          <Input placeholder="10001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address.country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="United States" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Capabilities */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Capabilities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Printing Methods */}
                <div>
                  <FormLabel className="text-sm font-medium">Printing Methods</FormLabel>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {printingMethods.map((method) => (
                      <Badge
                        key={method}
                        variant={form.watch('capabilities.printing_methods')?.includes(method) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleCapability('printing_methods', method)}
                      >
                        {method}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Specialties */}
                <div>
                  <FormLabel className="text-sm font-medium">Specialties</FormLabel>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {specialtyOptions.map((specialty) => (
                      <Badge
                        key={specialty}
                        variant={form.watch('capabilities.specialties')?.includes(specialty) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleCapability('specialties', specialty)}
                      >
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Certifications */}
                <div>
                  <FormLabel className="text-sm font-medium">Certifications</FormLabel>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {certificationOptions.map((cert) => (
                      <Badge
                        key={cert}
                        variant={form.watch('capabilities.certifications')?.includes(cert) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleCapability('certifications', cert)}
                      >
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="capabilities.max_quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Order Quantity</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          min="1"
                          placeholder="10000"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Maximum quantity this vendor can handle per order
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Notes and Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Internal notes about this vendor..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Internal notes for admin reference only
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
                        <FormLabel className="text-base">
                          Active Vendor
                        </FormLabel>
                        <FormDescription>
                          Make this vendor available for order assignments
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

            {/* Form Actions */}
            <div className="flex items-center gap-3 pt-4">
              <Button 
                type="submit" 
                disabled={form.formState.isSubmitting}
                className="flex-1"
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isEditing ? 'Update Vendor' : 'Create Vendor'}
                  </>
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}