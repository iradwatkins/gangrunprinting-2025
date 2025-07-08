import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Save, Loader2, Palette, Copy, Hash, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import { paperStocksApi } from '@/api/global-options';
import { createDemoPaperStocks } from '@/utils/demo-paper-stocks';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

const paperStockSchema = z.object({
  // Basic paper information
  name: z.string().min(1, 'Paper stock name is required'),
  weight: z.coerce.number().min(50, 'Weight must be at least 50 GSM').max(500, 'Weight must be under 500 GSM'),
  base_price_per_sq_inch: z.coerce.number().min(0.001, 'Price must be greater than $0.001').max(1, 'Price must be under $1.00'),
  description: z.string().optional(),
  
  // Sides configuration (paper-specific) - mapped to existing DB fields
  available_sides: z.array(z.string()).min(1, 'At least one sides option must be selected'),
  double_sided_different_markup_percent: z.coerce.number().min(0, 'Markup must be 0% or higher').max(300, 'Markup must be under 300%').optional(),
  sides_tooltip_text: z.string().min(1, 'Sides tooltip is required for customers'),
  
  // Coating configuration - store as JSON string in existing fields
  available_coatings: z.array(z.string()).min(1, 'At least one coating must be selected'),
  default_coating: z.string().min(1, 'Default coating is required'),
  coatings_tooltip_text: z.string().min(1, 'Coatings tooltip is required for customers'),
  
  // Status
  is_active: z.boolean()
});

type PaperStockFormData = z.infer<typeof paperStockSchema>;

// Define the specific sides and coating options
const SIDES_OPTIONS = [
  {
    id: 'single_sided',
    label: 'Single Sided',
    description: 'Image Front / Blank Back'
  },
  {
    id: 'double_sided_different',
    label: 'Double Sided (Two Different Images)',
    description: 'Different images on front and back (may have price upgrade)'
  },
  {
    id: 'double_sided_same',
    label: 'Same Image Both Sides',
    description: 'Identical image printed on both sides'
  }
];

const COATING_OPTIONS = [
  {
    id: 'high_gloss_uv',
    label: 'High Gloss UV',
    description: 'High gloss UV coating on both sides'
  },
  {
    id: 'high_gloss_uv_one_side',
    label: 'High Gloss UV on ONE SIDE',
    description: 'High gloss UV coating on front side only'
  },
  {
    id: 'gloss_aqueous',
    label: 'Gloss Aqueous',
    description: 'Gloss aqueous coating'
  },
  {
    id: 'matte_aqueous',
    label: 'Matte Aqueous',
    description: 'Matte aqueous coating'
  }
];

export function CompletePaperStockPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const form = useForm<PaperStockFormData>({
    resolver: zodResolver(paperStockSchema),
    defaultValues: {
      name: '',
      weight: 300,
      base_price_per_sq_inch: 0.008,
      description: '',
      available_sides: ['single_sided'],
      double_sided_different_markup_percent: 80,
      sides_tooltip_text: 'Choose how you want your item printed',
      available_coatings: ['high_gloss_uv'],
      default_coating: 'high_gloss_uv',
      coatings_tooltip_text: 'Choose the coating finish for your print',
      is_active: true
    }
  });


  const onSubmit = async (data: PaperStockFormData) => {
    setLoading(true);
    try {
      // Map new UX options to existing database structure
      const hasSingleSided = data.available_sides.includes('single_sided');
      const hasDoubleSided = data.available_sides.includes('double_sided_different') || data.available_sides.includes('double_sided_same');
      const doubleSidedMarkup = data.available_sides.includes('double_sided_different') ? data.double_sided_different_markup_percent || 0 : 0;

      // Create the complete paper stock using existing schema
      const paperStockData: TablesInsert<'paper_stocks'> = {
        name: data.name,
        weight: data.weight,
        price_per_sq_inch: data.base_price_per_sq_inch,
        description: data.description || null,
        // Map to existing fields
        single_sided_available: hasSingleSided,
        double_sided_available: hasDoubleSided,
        second_side_markup_percent: doubleSidedMarkup,
        sides_tooltip_text: data.sides_tooltip_text,
        coatings_tooltip_text: data.coatings_tooltip_text,
        // Store additional data in description for now
        tooltip_text: JSON.stringify({
          available_sides: data.available_sides,
          available_coatings: data.available_coatings,
          default_coating: data.default_coating
        }),
        is_active: data.is_active
      };

      const response = await paperStocksApi.create(paperStockData);
      
      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data) {
        toast({
          title: "Success",
          description: `Complete paper stock "${data.name}" created with ${data.available_sides.length} sides options and ${data.available_coatings.length} coating options.`,
        });

        // Reset form
        form.reset();
      }
    } catch (error) {
      console.error('Error creating paper stock:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create paper stock",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  const handleCreateDemo = async () => {
    setDemoLoading(true);
    try {
      const results = await createDemoPaperStocks();
      const successful = results.filter(r => r.success).length;
      
      toast({
        title: "Demo Paper Stocks Created",
        description: `Created ${successful}/${results.length} complete paper stocks with sides and coating configurations.`,
      });
      
      // Reload the page to see the new paper stocks
      window.location.href = '/admin/paper-stocks';
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create demo paper stocks",
        variant: "destructive",
      });
    } finally {
      setDemoLoading(false);
    }
  };

  const availableCoatings = form.watch('available_coatings');
  const availableSides = form.watch('available_sides');
  const defaultCoating = form.watch('default_coating');

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Create Complete Paper Stock</h1>
            <p className="text-muted-foreground">
              Define paper specifications, sides pricing, and coating compatibility
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCreateDemo} disabled={demoLoading}>
              {demoLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Demo Paper Stocks
            </Button>
            <Button variant="outline" asChild>
              <a href="/admin/paper-stocks">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Paper Stocks
              </a>
            </Button>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Paper Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Paper Specifications
                </CardTitle>
                <CardDescription>
                  Define the basic paper characteristics and pricing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Paper Stock Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., 14pt Card Stock" />
                        </FormControl>
                        <FormDescription>
                          Customer-facing name (e.g., "14pt Card Stock", "100lb Text Paper")
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (GSM)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" placeholder="300" />
                        </FormControl>
                        <FormDescription>
                          Paper weight in grams per square meter (50-500 GSM)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="base_price_per_sq_inch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Price per Square Inch</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                          <Input {...field} type="number" step="0.0001" className="pl-7" placeholder="0.0085" />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Base price for single-sided printing on this paper
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Premium thick card stock perfect for professional printing"
                          rows={2}
                        />
                      </FormControl>
                      <FormDescription>
                        Internal description for admin reference
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Sides Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Copy className="w-5 h-5" />
                  Sides Options (Paper-Specific)
                </CardTitle>
                <CardDescription>
                  Select which sides printing options are available for this paper type
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="available_sides"
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-base">Available Sides Options</FormLabel>
                      <FormDescription>
                        Select all sides options that work with this paper. Selected options will be shown to customers.
                      </FormDescription>
                      <div className="grid gap-3 md:grid-cols-1">
                        {SIDES_OPTIONS.map((option) => (
                          <FormField
                            key={option.id}
                            control={form.control}
                            name="available_sides"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={option.id}
                                  className="flex flex-row items-start space-x-3 space-y-0 border rounded-lg p-4"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(option.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, option.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== option.id
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel className="text-sm font-medium">
                                      {option.label}
                                    </FormLabel>
                                    <FormDescription className="text-xs">
                                      {option.description}
                                    </FormDescription>
                                  </div>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {availableSides.includes('double_sided_different') && (
                  <FormField
                    control={form.control}
                    name="double_sided_different_markup_percent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Double-Sided (Different Images) Markup %</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input {...field} type="number" step="0.01" className="pr-7" placeholder="80" />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Additional cost for double-sided printing with different images (0% = same price, 80% = 1.8x total)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="sides_tooltip_text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Sides Tooltip</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Choose how you want your item printed"
                          rows={2}
                        />
                      </FormControl>
                      <FormDescription>
                        Help text shown to customers about sides options for this paper
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Coating Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="w-5 h-5" />
                  Coating Options (Paper-Specific)
                </CardTitle>
                <CardDescription>
                  Select which coating options are available for this paper type
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="available_coatings"
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-base">Available Coating Options</FormLabel>
                      <FormDescription>
                        Select all coating options that work with this paper. Selected options will be shown to customers.
                      </FormDescription>
                      <div className="grid gap-3 md:grid-cols-2">
                        {COATING_OPTIONS.map((option) => (
                          <FormField
                            key={option.id}
                            control={form.control}
                            name="available_coatings"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={option.id}
                                  className="flex flex-row items-start space-x-3 space-y-0 border rounded-lg p-3"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(option.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, option.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== option.id
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel className="text-sm font-medium">
                                      {option.label}
                                    </FormLabel>
                                    <FormDescription className="text-xs">
                                      {option.description}
                                    </FormDescription>
                                  </div>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {availableCoatings.length > 0 && (
                  <FormField
                    control={form.control}
                    name="default_coating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Coating</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select default coating for this paper" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {COATING_OPTIONS
                              .filter(option => availableCoatings.includes(option.id))
                              .map((option) => (
                                <SelectItem key={option.id} value={option.id}>
                                  {option.label}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Pre-selected coating option for customers choosing this paper
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="coatings_tooltip_text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Coatings Tooltip</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Choose the coating finish for your print"
                          rows={2}
                        />
                      </FormControl>
                      <FormDescription>
                        Help text shown to customers about coating options for this paper
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
                <CardDescription>
                  Paper stock availability
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Paper Stock</FormLabel>
                        <FormDescription>
                          Make this complete paper stock configuration available to customers
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

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" asChild>
                <a href="/admin/paper-stocks">Cancel</a>
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Create Complete Paper Stock
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </AdminLayout>
  );
}