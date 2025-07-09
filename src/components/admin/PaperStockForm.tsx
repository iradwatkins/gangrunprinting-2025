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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { paperStocksApi, printSizesApi, turnaroundTimesApi, addOnsApi, coatingsApi } from '@/api/global-options';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { ensureSidesColumns } from '@/utils/apply-migration';
import { seedCoatingOptions, getCoatingsDirectly } from '@/utils/seed-coatings';

const paperStockSchema = z.object({
  name: z.string().min(1, 'Paper stock name is required'),
  description: z.string().optional(),
  weight: z.coerce.number().min(0.1, 'Weight must be at least 0.1 per square inch').max(100, 'Weight cannot exceed 100 per square inch'),
  price_per_sq_inch: z.coerce.number().min(0.000001, 'Price must be at least $0.000001').max(99.999999, 'Price cannot exceed $99.999999'),
  // Enhanced sides options with individual markups
  different_image_both_sides_available: z.boolean(),
  different_image_both_sides_markup: z.coerce.number().min(0).max(100).optional(),
  same_image_both_sides_available: z.boolean(),
  same_image_both_sides_markup: z.coerce.number().min(0).max(100).optional(),
  image_front_only_available: z.boolean(),
  image_front_only_markup: z.coerce.number().min(0).max(100).optional(),
  your_design_front_our_back_available: z.boolean(),
  your_design_front_our_back_markup: z.coerce.number().min(0).max(100).optional(),
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
  paperStock?: PaperStock | null;
  onSuccess: () => void;
  onCancel: () => void;
}


export function PaperStockForm({ paperStock, onSuccess, onCancel }: PaperStockFormProps) {
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
      weight: 12.0, // Common default weight for business cards (per square inch)
      price_per_sq_inch: 0.000001, // $0.000001 per square inch default
      // Enhanced sides options with 1% default markup
      different_image_both_sides_available: true,
      different_image_both_sides_markup: 1,
      same_image_both_sides_available: true,
      same_image_both_sides_markup: 1,
      image_front_only_available: true,
      image_front_only_markup: 1,
      your_design_front_our_back_available: true,
      your_design_front_our_back_markup: 1,
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
      console.log('🔄 Loading options...');
      
      // Load each API separately to identify which one is failing
      console.log('📥 Loading print sizes...');
      const printSizesResult = await printSizesApi.getAll({ is_active: true });
      console.log('Print sizes result:', printSizesResult);
      
      console.log('📥 Loading turnaround times...');
      const turnaroundTimesResult = await turnaroundTimesApi.getAll({ is_active: true });
      console.log('Turnaround times result:', turnaroundTimesResult);
      
      console.log('📥 Loading add-ons...');
      const addOnsResult = await addOnsApi.getAll({ is_active: true });
      console.log('Add-ons result:', addOnsResult);
      
      console.log('📥 Loading coatings...');
      // Try direct fetch first, then fallback to API
      let coatingsResult = await getCoatingsDirectly();
      if (!coatingsResult.success) {
        console.log('🔄 Direct fetch failed, trying API...');
        coatingsResult = await coatingsApi.getAll({ is_active: true });
      }
      console.log('Coatings result:', coatingsResult);

      // Check for errors in any of the results
      if (printSizesResult.error) {
        console.error('❌ Print Sizes Error:', printSizesResult.error);
      }
      if (turnaroundTimesResult.error) {
        console.error('❌ Turnaround Times Error:', turnaroundTimesResult.error);
      }
      if (addOnsResult.error) {
        console.error('❌ Add-ons Error:', addOnsResult.error);
      }
      if (coatingsResult.error) {
        console.error('❌ Coatings Error:', coatingsResult.error);
      }

      setPrintSizes(printSizesResult.data || []);
      setTurnaroundTimes(turnaroundTimesResult.data || []);
      setAddOns(addOnsResult.data || []);
      setCoatings(coatingsResult.success ? coatingsResult.data || [] : []);
      
      console.log('✅ Options loaded successfully:', {
        printSizes: printSizesResult.data?.length || 0,
        turnaroundTimes: turnaroundTimesResult.data?.length || 0,
        addOns: addOnsResult.data?.length || 0,
        coatings: coatingsResult.data?.length || 0
      });
    } catch (error) {
      console.error('💥 Load options error:', error);
      toast({
        title: "Error",
        description: `Failed to load options: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setLoadingOptions(false);
    }
  };

  useEffect(() => {
    // Check database schema first, then load options
    const initializeForm = async () => {
      console.log('🔄 Initializing form...');
      
      // Check if enhanced sides columns exist
      const schemaCheck = await ensureSidesColumns();
      if (!schemaCheck.success) {
        console.warn('⚠️ Database schema issue:', schemaCheck.error);
        toast({
          title: "Database Schema Issue",
          description: "Some enhanced features may not be available. Please contact support.",
          variant: "destructive",
        });
      }
      
      // Load options regardless of schema check
      loadOptions();
    };
    
    initializeForm();
    
    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loadingOptions) {
        console.warn('⏰ Options loading timeout - forcing completion');
        setLoadingOptions(false);
        toast({
          title: "Loading Timeout",
          description: "Options loading took too long. Some features may not be available.",
          variant: "destructive",
        });
      }
    }, 10000); // 10 second timeout
    
    return () => clearTimeout(timeout);
  }, []);

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
        price_per_sq_inch: paperStock.price_per_sq_inch || 0.000001,
        // Enhanced sides options - fallback to defaults if not set
        different_image_both_sides_available: paperStock.different_image_both_sides_available ?? true,
        different_image_both_sides_markup: paperStock.different_image_both_sides_markup ?? 1,
        same_image_both_sides_available: paperStock.same_image_both_sides_available ?? true,
        same_image_both_sides_markup: paperStock.same_image_both_sides_markup ?? 1,
        image_front_only_available: paperStock.image_front_only_available ?? true,
        image_front_only_markup: paperStock.image_front_only_markup ?? 1,
        your_design_front_our_back_available: paperStock.your_design_front_our_back_available ?? true,
        your_design_front_our_back_markup: paperStock.your_design_front_our_back_markup ?? 1,
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
        price_per_sq_inch: 0.000001,
        // Enhanced sides options with 1% default markup
        different_image_both_sides_available: true,
        different_image_both_sides_markup: 1,
        same_image_both_sides_available: true,
        same_image_both_sides_markup: 1,
        image_front_only_available: true,
        image_front_only_markup: 1,
        your_design_front_our_back_available: true,
        your_design_front_our_back_markup: 1,
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
        // Enhanced sides options
        different_image_both_sides_available: data.different_image_both_sides_available,
        different_image_both_sides_markup: data.different_image_both_sides_markup,
        same_image_both_sides_available: data.same_image_both_sides_available,
        same_image_both_sides_markup: data.same_image_both_sides_markup,
        image_front_only_available: data.image_front_only_available,
        image_front_only_markup: data.image_front_only_markup,
        your_design_front_our_back_available: data.your_design_front_our_back_available,
        your_design_front_our_back_markup: data.your_design_front_our_back_markup,
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
      onCancel();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} paper stock`,
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    form.reset();
    onCancel();
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {isEditing ? 'Edit Paper Stock' : 'Add New Paper Stock'}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
        <CardDescription>
          {isEditing ? 'Update paper stock information and pricing' : 'Add a new paper stock for product configuration'}
        </CardDescription>
        
        {/* Debug Info */}
        <div className="text-xs text-gray-400 mt-2 flex items-center gap-2">
          <span>
            Loading: {loadingOptions ? 'Yes' : 'No'} | 
            Coatings: {coatings.length} | 
            Print Sizes: {printSizes.length} | 
            Turnaround Times: {turnaroundTimes.length} | 
            Add-ons: {addOns.length}
          </span>
          {coatings.length === 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs h-6"
              onClick={async () => {
                const result = await seedCoatingOptions();
                if (result.success) {
                  toast({
                    title: "Success",
                    description: result.message || "Coating options created successfully",
                  });
                  loadOptions();
                } else {
                  toast({
                    title: "Error",
                    description: result.error || "Failed to create coating options",
                    variant: "destructive",
                  });
                }
              }}
            >
              Quick Fix Coatings
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>

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
                    <FormLabel>Weight (per square inch) *</FormLabel>
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
                      Paper weight per square inch
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
                          step="0.000001"
                          min="0.000001"
                          max="99.999999"
                          placeholder="0.000001"
                          className="pl-8"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Base pricing per square inch for calculations (e.g., $0.000001)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Step 2: Enhanced Sides Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Step 2: Sides Options</h3>
              <p className="text-sm text-muted-foreground">Configure the specific sides printing options that customers will see as their second choice. Each option can have its own markup percentage.</p>
              
              <div className="grid grid-cols-1 gap-4">
                {/* Different Image Both Sides */}
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center space-x-4 flex-1">
                    <FormField
                      control={form.control}
                      name="different_image_both_sides_available"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-base font-medium">
                            Different Image Both Sides (2 Sided)
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex items-center space-x-2 min-w-[120px]">
                    <FormField
                      control={form.control}
                      name="different_image_both_sides_markup"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                placeholder="1"
                                className="pr-8 w-20"
                                {...field}
                              />
                              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">%</span>
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <span className="text-sm text-muted-foreground">markup</span>
                  </div>
                </div>

                {/* Same Image Both Sides */}
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center space-x-4 flex-1">
                    <FormField
                      control={form.control}
                      name="same_image_both_sides_available"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-base font-medium">
                            Same Image Both Sides (2 Sided)
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex items-center space-x-2 min-w-[120px]">
                    <FormField
                      control={form.control}
                      name="same_image_both_sides_markup"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                placeholder="1"
                                className="pr-8 w-20"
                                {...field}
                              />
                              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">%</span>
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <span className="text-sm text-muted-foreground">markup</span>
                  </div>
                </div>

                {/* Image Front Only */}
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center space-x-4 flex-1">
                    <FormField
                      control={form.control}
                      name="image_front_only_available"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-base font-medium">
                            Image Front Side Only (1 Sided)
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex items-center space-x-2 min-w-[120px]">
                    <FormField
                      control={form.control}
                      name="image_front_only_markup"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                placeholder="1"
                                className="pr-8 w-20"
                                {...field}
                              />
                              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">%</span>
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <span className="text-sm text-muted-foreground">markup</span>
                  </div>
                </div>

                {/* Your Design Front / Our Design Back */}
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center space-x-4 flex-1">
                    <FormField
                      control={form.control}
                      name="your_design_front_our_back_available"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-base font-medium">
                            Your Design Front / Our Design Back
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex items-center space-x-2 min-w-[120px]">
                    <FormField
                      control={form.control}
                      name="your_design_front_our_back_markup"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                placeholder="1"
                                className="pr-8 w-20"
                                {...field}
                              />
                              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">%</span>
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <span className="text-sm text-muted-foreground">markup</span>
                  </div>
                </div>
              </div>

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
                <div className="text-center py-4">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                    Loading coating options...
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={loadOptions} 
                    className="mt-2"
                  >
                    Retry Loading
                  </Button>
                </div>
              ) : coatings.length === 0 ? (
                <div className="space-y-4">
                  <div className="text-center py-4">
                    <p className="text-gray-500 mb-2">No coating options loaded from database</p>
                    <div className="flex gap-2 justify-center">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={loadOptions}
                      >
                        Retry Loading
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm" 
                        onClick={async () => {
                          const result = await seedCoatingOptions();
                          if (result.success) {
                            toast({
                              title: "Success",
                              description: result.message || "Coating options created successfully",
                            });
                            loadOptions(); // Reload after seeding
                          } else {
                            toast({
                              title: "Error",
                              description: result.error || "Failed to create coating options",
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        Create Coating Options
                      </Button>
                    </div>
                  </div>
                  
                  {/* Fallback: Show expected coating options */}
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <FormLabel className="text-base font-medium">Expected Coating Options</FormLabel>
                    <FormDescription className="mb-3">
                      These are the coating options that should be available (requires database setup)
                    </FormDescription>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        'High Gloss UV',
                        'High Gloss UV on ONE SIDE', 
                        'Gloss Aqueous',
                        'Matte Aqueous'
                      ].map((coating) => (
                        <div key={coating} className="flex items-center space-x-2 text-sm text-gray-600">
                          <div className="w-4 h-4 border rounded bg-white"></div>
                          <span>{coating}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
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
                <div className="text-center py-4">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                    Loading additional options...
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={loadOptions} 
                    className="mt-2"
                  >
                    Retry Loading
                  </Button>
                </div>
              ) : (printSizes.length === 0 && turnaroundTimes.length === 0 && addOns.length === 0) ? (
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-2">No additional options available</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={loadOptions}
                  >
                    Retry Loading
                  </Button>
                </div>
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
                onClick={handleCancel}
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}