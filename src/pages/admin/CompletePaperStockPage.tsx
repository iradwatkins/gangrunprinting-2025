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
import { paperStocksApi, coatingsApi } from '@/api/global-options';
import { supabase } from '@/integrations/supabase/client';
import { createDemoPaperStocks } from '@/utils/demo-paper-stocks';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

const paperStockSchema = z.object({
  // Basic paper information
  name: z.string().min(1, 'Paper stock name is required'),
  weight: z.coerce.number().min(50, 'Weight must be at least 50 GSM').max(500, 'Weight must be under 500 GSM'),
  base_price_per_sq_inch: z.coerce.number().min(0.001, 'Price must be greater than $0.001').max(1, 'Price must be under $1.00'),
  description: z.string().optional(),
  
  // Sides configuration (paper-specific)
  single_sided_available: z.boolean(),
  double_sided_available: z.boolean(),
  double_sided_markup_percent: z.coerce.number().min(0, 'Markup must be 0% or higher').max(300, 'Markup must be under 300%'),
  sides_tooltip_text: z.string().min(1, 'Sides tooltip is required for customers'),
  
  // Coating configuration
  compatible_coatings: z.array(z.string()).min(1, 'At least one coating must be selected'),
  default_coating: z.string().min(1, 'Default coating is required'),
  coatings_tooltip_text: z.string().min(1, 'Coatings tooltip is required for customers'),
  
  // Status
  is_active: z.boolean()
});

type PaperStockFormData = z.infer<typeof paperStockSchema>;
type Coating = Tables<'coatings'>;

export function CompletePaperStockPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [coatings, setCoatings] = useState<Coating[]>([]);
  const [loadingCoatings, setLoadingCoatings] = useState(true);

  const form = useForm<PaperStockFormData>({
    resolver: zodResolver(paperStockSchema),
    defaultValues: {
      name: '',
      weight: 300,
      base_price_per_sq_inch: 0.008,
      description: '',
      single_sided_available: true,
      double_sided_available: true,
      double_sided_markup_percent: 80,
      sides_tooltip_text: '',
      compatible_coatings: [],
      default_coating: '',
      coatings_tooltip_text: '',
      is_active: true
    }
  });

  useEffect(() => {
    loadCoatings();
  }, []);

  const loadCoatings = async () => {
    setLoadingCoatings(true);
    try {
      const response = await coatingsApi.getAll({ is_active: true });
      if (response.data) {
        setCoatings(response.data);
        // If no coatings exist, create default ones
        if (response.data.length === 0) {
          await createDefaultCoatings();
        }
      }
    } catch (error) {
      console.error('Error loading coatings:', error);
      toast({
        title: "Error",
        description: "Failed to load coatings. Creating defaults...",
        variant: "destructive",
      });
      await createDefaultCoatings();
    }
    setLoadingCoatings(false);
  };

  const createDefaultCoatings = async () => {
    const defaultCoatings = [
      {
        name: 'No Coating',
        price_modifier: 0.0000,
        description: 'Natural paper finish without any coating',
        is_active: true
      },
      {
        name: 'High Gloss UV',
        price_modifier: 0.0000,
        description: 'High gloss UV coating for vibrant colors and protection',
        is_active: true
      },
      {
        name: 'Matte Finish',
        price_modifier: 0.0000,
        description: 'Smooth matte finish with subtle texture',
        is_active: true
      },
      {
        name: 'Satin Finish',
        price_modifier: 0.0000,
        description: 'Semi-gloss finish with elegant appearance',
        is_active: true
      }
    ];

    const createdCoatings: Coating[] = [];
    for (const coating of defaultCoatings) {
      const response = await coatingsApi.create(coating);
      if (response.data) {
        createdCoatings.push(response.data);
      }
    }
    setCoatings(createdCoatings);
    
    if (createdCoatings.length > 0) {
      toast({
        title: "Default Coatings Created",
        description: "Created basic coating options for you to use.",
      });
    }
  };

  const onSubmit = async (data: PaperStockFormData) => {
    setLoading(true);
    try {
      // Create the complete paper stock
      const paperStockData: TablesInsert<'paper_stocks'> = {
        name: data.name,
        weight: data.weight,
        price_per_sq_inch: data.base_price_per_sq_inch,
        second_side_markup_percent: data.double_sided_markup_percent,
        single_sided_available: data.single_sided_available,
        double_sided_available: data.double_sided_available,
        sides_tooltip_text: data.sides_tooltip_text,
        coatings_tooltip_text: data.coatings_tooltip_text,
        description: data.description || null,
        is_active: data.is_active
      };

      const response = await paperStocksApi.create(paperStockData);
      
      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data) {
        const paperStockId = response.data.id;

        // Create paper stock coating relationships
        for (const coatingId of data.compatible_coatings) {
          const { error } = await supabase
            .from('paper_stock_coatings')
            .insert({
              paper_stock_id: paperStockId,
              coating_id: coatingId,
              is_default: coatingId === data.default_coating
            });
          
          if (error) {
            console.warn('Failed to link coating:', error);
          }
        }

        toast({
          title: "Success",
          description: `Complete paper stock "${data.name}" created with ${data.compatible_coatings.length} coatings and custom sides pricing.`,
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

  const handleCreateQuickCoating = async () => {
    const name = prompt('Enter coating name (e.g., "Spot UV"):');
    if (!name) return;

    const description = prompt('Enter coating description:') || '';

    try {
      const response = await coatingsApi.create({
        name,
        price_modifier: 0.0000,
        description,
        is_active: true
      });

      if (response.data) {
        setCoatings(prev => [...prev, response.data!]);
        toast({
          title: "Coating Created",
          description: `"${name}" coating created successfully.`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create coating",
        variant: "destructive",
      });
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

  const compatibleCoatings = form.watch('compatible_coatings');
  const defaultCoating = form.watch('default_coating');
  const doubleSidedAvailable = form.watch('double_sided_available');

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
                  Sides Configuration (Paper-Specific)
                </CardTitle>
                <CardDescription>
                  Configure printing sides options and pricing for this specific paper
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="single_sided_available"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Single-Sided Available</FormLabel>
                          <FormDescription>
                            Allow single-sided printing (uses base price)
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="double_sided_available"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Double-Sided Available</FormLabel>
                          <FormDescription>
                            Allow double-sided printing on this paper
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {doubleSidedAvailable && (
                  <FormField
                    control={form.control}
                    name="double_sided_markup_percent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Double-Sided Markup % (Paper-Specific)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input {...field} type="number" step="0.01" className="pr-7" placeholder="80" />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Additional cost for double-sided printing on THIS paper type (0% = same price, 80% = 1.8x total)
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
                          placeholder="Choose single-sided for front only, or double-sided for front and back printing"
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
                  Compatible Coatings (Paper-Specific)
                </CardTitle>
                <CardDescription>
                  Select which coatings work with this specific paper stock
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingCoatings ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading coatings...
                  </div>
                ) : coatings.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground mb-4">No coatings available</p>
                    <Button type="button" onClick={handleCreateQuickCoating}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create First Coating
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Select coatings that are compatible with this paper type
                      </p>
                      <Button type="button" variant="outline" size="sm" onClick={handleCreateQuickCoating}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Coating
                      </Button>
                    </div>

                    <FormField
                      control={form.control}
                      name="compatible_coatings"
                      render={() => (
                        <FormItem>
                          <div className="grid gap-3 md:grid-cols-2">
                            {coatings.map((coating) => (
                              <FormField
                                key={coating.id}
                                control={form.control}
                                name="compatible_coatings"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={coating.id}
                                      className="flex flex-row items-start space-x-3 space-y-0 border rounded-lg p-3"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(coating.id)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, coating.id])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== coating.id
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <div className="space-y-1 leading-none">
                                        <FormLabel className="text-sm font-normal">
                                          {coating.name}
                                        </FormLabel>
                                        {coating.description && (
                                          <p className="text-xs text-muted-foreground">
                                            {coating.description}
                                          </p>
                                        )}
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

                    {compatibleCoatings.length > 0 && (
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
                                {coatings
                                  .filter(coating => compatibleCoatings.includes(coating.id))
                                  .map((coating) => (
                                    <SelectItem key={coating.id} value={coating.id}>
                                      {coating.name}
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
                              placeholder="This paper works well with UV coatings for extra durability and vibrant colors"
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
                  </>
                )}
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