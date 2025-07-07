import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Save, Loader2, Plus, Palette, Copy, Hash } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import { paperStocksApi, coatingsApi } from '@/api/global-options';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

const paperStockSchema = z.object({
  name: z.string().min(1, 'Paper stock name is required'),
  weight: z.coerce.number().min(50, 'Weight must be at least 50 GSM').max(500, 'Weight must be under 500 GSM'),
  price_per_sq_inch: z.coerce.number().min(0.001, 'Price must be greater than $0.001').max(1, 'Price must be under $1.00'),
  second_side_markup_percent: z.coerce.number().min(0, 'Markup must be 0% or higher').max(200, 'Markup must be under 200%'),
  description: z.string().optional(),
  tooltip_text: z.string().min(1, 'Tooltip text is required for customers'),
  compatible_coatings: z.array(z.string()).min(1, 'At least one coating must be selected'),
  default_coating: z.string().min(1, 'Default coating is required'),
  is_active: z.boolean()
});

type PaperStockFormData = z.infer<typeof paperStockSchema>;
type Coating = Tables<'coatings'>;

export function SimplePaperStockPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [coatings, setCoatings] = useState<Coating[]>([]);
  const [loadingCoatings, setLoadingCoatings] = useState(true);

  const form = useForm<PaperStockFormData>({
    resolver: zodResolver(paperStockSchema),
    defaultValues: {
      name: '',
      weight: 300,
      price_per_sq_inch: 0.008,
      second_side_markup_percent: 80,
      description: '',
      tooltip_text: '',
      compatible_coatings: [],
      default_coating: '',
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
      }
    ];

    const createdCoatings: Coating[] = [];
    for (const coating of defaultCoatings) {
      const response = await coatingsApi.createCoating(coating);
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
      // Create the paper stock
      const paperStockData: TablesInsert<'paper_stocks'> = {
        name: data.name,
        weight: data.weight,
        price_per_sq_inch: data.price_per_sq_inch,
        second_side_markup_percent: data.second_side_markup_percent,
        tooltip_text: data.tooltip_text,
        description: data.description || null,
        is_active: data.is_active
      };

      const response = await paperStocksApi.createPaperStock(paperStockData);
      
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
          description: `Paper stock "${data.name}" created successfully with ${data.compatible_coatings.length} compatible coatings.`,
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
    const name = prompt('Enter coating name (e.g., "Satin Finish"):');
    if (!name) return;

    const description = prompt('Enter coating description:') || '';

    try {
      const response = await coatingsApi.createCoating({
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

  const compatibleCoatings = form.watch('compatible_coatings');
  const defaultCoating = form.watch('default_coating');

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Create Paper Stock</h1>
            <p className="text-muted-foreground">
              Define paper stock with weight, pricing, and compatible coatings
            </p>
          </div>
          <Button variant="outline" asChild>
            <a href="/admin/paper-stocks">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Paper Stocks
            </a>
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Define the paper stock name, weight, and customer description
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

                <FormField
                  control={form.control}
                  name="tooltip_text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Tooltip Text</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Thick, durable card stock ideal for business cards, postcards, and high-end flyers"
                          rows={2}
                        />
                      </FormControl>
                      <FormDescription>
                        Help text shown to customers when they hover/click for more info
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="w-5 h-5" />
                  Pricing Configuration
                </CardTitle>
                <CardDescription>
                  Set base pricing and double-sided markup
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="price_per_sq_inch"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price per Square Inch</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                            <Input {...field} type="number" step="0.0001" className="pl-7" placeholder="0.0085" />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Base price per square inch for single-sided printing
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="second_side_markup_percent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Double-Sided Markup %</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input {...field} type="number" step="0.01" className="pr-7" placeholder="80" />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Additional cost for double-sided printing (typically 80% = 1.8x total)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Compatible Coatings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Copy className="w-5 h-5" />
                  Compatible Coatings
                </CardTitle>
                <CardDescription>
                  Select which coatings work with this paper stock
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
                        Select coatings that can be applied to this paper stock
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
                                  <SelectValue placeholder="Select default coating" />
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
                              Pre-selected coating option for customers
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
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
                          Make this paper stock available to customers
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
                Create Paper Stock
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </AdminLayout>
  );
}