import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Save, Loader2, X } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { paperStocksApi, printSizesApi, turnaroundTimesApi, addOnsApi, coatingsApi } from '@/api/global-options';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

const paperStockSchema = z.object({
  name: z.string().min(1, 'Paper stock name is required'),
  description: z.string().optional(),
  weight: z.coerce.number().min(0.1, 'Weight must be at least 0.1 GSI').max(100, 'Weight cannot exceed 100 GSI'),
  price_per_sq_inch: z.coerce.number().min(0.10, 'Price must be at least $0.10').max(99.99, 'Price cannot exceed $99.99'),
  single_sided_available: z.boolean(),
  double_sided_available: z.boolean(),
  second_side_markup_percent: z.coerce.number().min(0).max(100).optional(),
  sides_tooltip_text: z.string().optional(),
  available_coatings: z.array(z.string()).optional(),
  coatings_tooltip_text: z.string().optional(),
  available_print_sizes: z.array(z.string()).optional(),
  available_turnaround_times: z.array(z.string()).optional(),
  available_add_ons: z.array(z.string()).optional(),
  is_active: z.boolean()
});

type PaperStockFormData = z.infer<typeof paperStockSchema>;
type PaperStock = Tables<'paper_stocks'>;

interface PaperStockFormProps {
  open: boolean;
  onClose: () => void;
  paperStock?: PaperStock | null;
  onSuccess: () => void;
}


export function PaperStockForm({ open, onClose, paperStock, onSuccess }: PaperStockFormProps) {
  const { toast } = useToast();
  const isEditing = !!paperStock;
  
  // State for loaded options
  const [printSizes, setPrintSizes] = useState<Tables<'print_sizes'>[]>([]);
  const [turnaroundTimes, setTurnaroundTimes] = useState<Tables<'turnaround_times'>[]>([]);
  const [addOns, setAddOns] = useState<Tables<'add_ons'>[]>([]);
  const [coatings, setCoatings] = useState<Tables<'coatings'>[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const form = useForm<PaperStockFormData>({
    resolver: zodResolver(paperStockSchema),
    defaultValues: {
      name: '',
      description: '',
      weight: 12.0, // Common default weight for business cards (GSI)
      price_per_sq_inch: 0.10, // $0.10 per square inch default
      single_sided_available: true,
      double_sided_available: true,
      second_side_markup_percent: 50, // 50% markup for double-sided
      sides_tooltip_text: '',
      available_coatings: [],
      coatings_tooltip_text: '',
      available_print_sizes: [],
      available_turnaround_times: [],
      available_add_ons: [],
      is_active: true
    }
  });

  // Load all available options
  const loadOptions = async () => {
    setLoadingOptions(true);
    try {
      const [printSizesResult, turnaroundTimesResult, addOnsResult, coatingsResult] = await Promise.all([
        printSizesApi.getAll({ is_active: true }),
        turnaroundTimesApi.getAll({ is_active: true }),
        addOnsApi.getAll({ is_active: true }),
        coatingsApi.getAll({ is_active: true })
      ]);

      setPrintSizes(printSizesResult.data || []);
      setTurnaroundTimes(turnaroundTimesResult.data || []);
      setAddOns(addOnsResult.data || []);
      setCoatings(coatingsResult.data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load options",
        variant: "destructive",
      });
    } finally {
      setLoadingOptions(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadOptions();
    }
  }, [open]);

  useEffect(() => {
    if (paperStock) {
      // Parse additional data from tooltip_text if available
      let additionalData = {};
      try {
        if (paperStock.tooltip_text) {
          additionalData = JSON.parse(paperStock.tooltip_text);
        }
      } catch (e) {
        // Ignore parsing errors
      }

      form.reset({
        name: paperStock.name || '',
        description: paperStock.description || '',
        weight: paperStock.weight || 12.0,
        price_per_sq_inch: paperStock.price_per_sq_inch || 0.10,
        single_sided_available: paperStock.single_sided_available ?? true,
        double_sided_available: paperStock.double_sided_available ?? true,
        second_side_markup_percent: paperStock.second_side_markup_percent || 50,
        sides_tooltip_text: paperStock.sides_tooltip_text || '',
        available_coatings: additionalData.available_coatings || [],
        coatings_tooltip_text: paperStock.coatings_tooltip_text || '',
        available_print_sizes: additionalData.available_print_sizes || [],
        available_turnaround_times: additionalData.available_turnaround_times || [],
        available_add_ons: additionalData.available_add_ons || [],
        is_active: paperStock.is_active ?? true
      });
    } else {
      form.reset({
        name: '',
        description: '',
        weight: 12.0,
          price_per_sq_inch: 0.10,
        single_sided_available: true,
        double_sided_available: true,
        second_side_markup_percent: 50,
        sides_tooltip_text: '',
        available_coatings: [],
        coatings_tooltip_text: '',
          available_print_sizes: [],
        available_turnaround_times: [],
        available_add_ons: [],
        is_active: true
      });
    }
  }, [paperStock, form]);

  const onSubmit = async (data: PaperStockFormData) => {
    try {
      let response;

      // Prepare the data with additional fields stored in tooltip_text
      const additionalData = {
        available_print_sizes: data.available_print_sizes || [],
        available_turnaround_times: data.available_turnaround_times || [],
        available_add_ons: data.available_add_ons || [],
        available_coatings: data.available_coatings || []
      };

      const paperStockData = {
        name: data.name,
        description: data.description,
        weight: data.weight,
        price_per_sq_inch: data.price_per_sq_inch,
        single_sided_available: data.single_sided_available,
        double_sided_available: data.double_sided_available,
        second_side_markup_percent: data.second_side_markup_percent,
        sides_tooltip_text: data.sides_tooltip_text,
        coatings_tooltip_text: data.coatings_tooltip_text,
        tooltip_text: JSON.stringify(additionalData),
        is_active: data.is_active
      };

      if (isEditing && paperStock) {
        response = await paperStocksApi.updatePaperStock(paperStock.id, paperStockData as TablesUpdate<'paper_stocks'>);
      } else {
        response = await paperStocksApi.createPaperStock(paperStockData as TablesInsert<'paper_stocks'>);
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
        description: `Paper stock ${isEditing ? 'updated' : 'created'} successfully`,
      });

      form.reset();
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} paper stock`,
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {isEditing ? 'Edit Paper Stock' : 'Add Paper Stock'}
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
            {isEditing ? 'Update paper stock information and pricing' : 'Add a new paper stock for product configuration'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Paper Stock Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Step 1: Paper Stock</h3>
              <p className="text-sm text-muted-foreground">Create the main paper stock that customers will see as their first choice.</p>
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Premium Matte Cardstock" {...field} />
                    </FormControl>
                    <FormDescription>
                      Display name for this paper stock
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
                        placeholder="Detailed description of the paper stock..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional description for admin and customer reference
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Paper Specifications */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Paper Specifications</h3>
              
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (GSI) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1"
                        min="0.1" 
                        max="100"
                        placeholder="12.0"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Paper weight in grams per square inch (GSI)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Pricing</h3>
              
              <FormField
                control={form.control}
                name="price_per_sq_inch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price per Square Inch *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                        <Input 
                          type="number" 
                          step="0.10"
                          min="0.10"
                          max="99.99"
                          placeholder="0.10"
                          className="pl-8"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Base pricing per square inch for calculations (e.g., $0.10)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Step 2: Sides Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Step 2: Sides Options</h3>
              <p className="text-sm text-muted-foreground">Configure the sides printing options that customers will see as their second choice.</p>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="single_sided_available"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Single Sided Available
                        </FormLabel>
                        <FormDescription>
                          Allow single-sided printing
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

                <FormField
                  control={form.control}
                  name="double_sided_available"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Double Sided Available
                        </FormLabel>
                        <FormDescription>
                          Allow double-sided printing
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
              </div>

              <FormField
                control={form.control}
                name="second_side_markup_percent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Second Side Markup Percentage</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type="number" 
                          step="1"
                          min="0"
                          max="100"
                          placeholder="50"
                          className="pr-8"
                          {...field}
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">%</span>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Additional markup percentage for double-sided printing
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sides_tooltip_text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sides Tooltip Text</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Helpful text to explain sides options to customers..."
                        className="min-h-[60px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional tooltip text to help customers understand sides options
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Step 3: Coating Options */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Step 3: Coating Options</h3>
              <p className="text-sm text-muted-foreground">Configure the coating options that customers will see as their third choice.</p>
              
              {loadingOptions ? (
                <div className="text-center py-4">Loading coating options...</div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <FormLabel className="text-base font-medium">Available Coatings</FormLabel>
                    <FormDescription className="mb-3">
                      Select which coatings are available for this paper stock
                    </FormDescription>
                    <div className="grid grid-cols-2 gap-2">
                      {coatings.map((coating) => (
                        <FormField
                          key={coating.id}
                          control={form.control}
                          name="available_coatings"
                          render={({ field }) => {
                            return (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(coating.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, coating.id])
                                        : field.onChange(field.value?.filter((value) => value !== coating.id))
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {coating.name} {coating.price_modifier !== 0 && `(${coating.price_modifier > 0 ? '+' : ''}$${coating.price_modifier})`}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="coatings_tooltip_text"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Coatings Tooltip Text</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Helpful text to explain coating options to customers..."
                            className="min-h-[60px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Optional tooltip text to help customers understand coating options
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                </div>
              )}
            </div>

            {/* Additional Options */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Additional Configuration</h3>
              
              {loadingOptions ? (
                <div className="text-center py-4">Loading options...</div>
              ) : (
                <div className="space-y-6">
                  {/* Print Sizes */}
                  <div>
                    <FormLabel className="text-base font-medium">Available Print Sizes</FormLabel>
                    <FormDescription className="mb-3">
                      Select which print sizes are available for this paper stock
                    </FormDescription>
                    <div className="grid grid-cols-2 gap-2">
                      {printSizes.map((size) => (
                        <FormField
                          key={size.id}
                          control={form.control}
                          name="available_print_sizes"
                          render={({ field }) => {
                            return (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(size.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, size.id])
                                        : field.onChange(field.value?.filter((value) => value !== size.id))
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {size.name} ({size.width}" × {size.height}")
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Turnaround Times */}
                  <div>
                    <FormLabel className="text-base font-medium">Available Turnaround Times</FormLabel>
                    <FormDescription className="mb-3">
                      Select which turnaround times are available for this paper stock
                    </FormDescription>
                    <div className="grid grid-cols-2 gap-2">
                      {turnaroundTimes.map((time) => (
                        <FormField
                          key={time.id}
                          control={form.control}
                          name="available_turnaround_times"
                          render={({ field }) => {
                            return (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(time.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, time.id])
                                        : field.onChange(field.value?.filter((value) => value !== time.id))
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {time.name} ({time.business_days} days)
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Add-ons */}
                  <div>
                    <FormLabel className="text-base font-medium">Available Add-ons</FormLabel>
                    <FormDescription className="mb-3">
                      Select which add-ons are available for this paper stock
                    </FormDescription>
                    <div className="grid grid-cols-1 gap-2">
                      {addOns.map((addon) => (
                        <FormField
                          key={addon.id}
                          control={form.control}
                          name="available_add_ons"
                          render={({ field }) => {
                            return (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(addon.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, addon.id])
                                        : field.onChange(field.value?.filter((value) => value !== addon.id))
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {addon.name} {addon.price_modifier !== 0 && `(${addon.price_modifier > 0 ? '+' : ''}${addon.price_modifier})`}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </div>

            {/* Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Status</h3>
              
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Active
                      </FormLabel>
                      <FormDescription>
                        Make this paper stock available for product configuration
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
            </div>

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
                    {isEditing ? 'Update Paper Stock' : 'Create Paper Stock'}
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