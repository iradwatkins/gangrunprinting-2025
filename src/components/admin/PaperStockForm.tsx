import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Save, Loader2, X, Plus, Trash2 } from 'lucide-react';
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
import { paperStocksApi } from '@/api/global-options';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

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
  // Enhanced coating options with individual markups
  high_gloss_uv_available: z.boolean(),
  high_gloss_uv_markup: z.coerce.number().min(0).max(100).optional(),
  high_gloss_uv_one_side_available: z.boolean(),
  high_gloss_uv_one_side_markup: z.coerce.number().min(0).max(100).optional(),
  gloss_aqueous_available: z.boolean(),
  gloss_aqueous_markup: z.coerce.number().min(0).max(100).optional(),
  matte_aqueous_available: z.boolean(),
  matte_aqueous_markup: z.coerce.number().min(0).max(100).optional(),
  coatings_tooltip_text: z.string().optional(),
  // Custom options
  custom_sides_options: z.array(z.object({
    name: z.string(),
    available: z.boolean(),
    markup: z.number().min(0).max(100)
  })).optional(),
  custom_coating_options: z.array(z.object({
    name: z.string(),
    available: z.boolean(),
    markup: z.number().min(0).max(100)
  })).optional(),
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
  
  // State for custom options
  const [customSidesOptions, setCustomSidesOptions] = useState<Array<{name: string, available: boolean, markup: number}>>([]);
  const [customCoatingOptions, setCustomCoatingOptions] = useState<Array<{name: string, available: boolean, markup: number}>>([]);

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
      // Enhanced coating options with 1% default markup
      high_gloss_uv_available: true,
      high_gloss_uv_markup: 1,
      high_gloss_uv_one_side_available: true,
      high_gloss_uv_one_side_markup: 1,
      gloss_aqueous_available: true,
      gloss_aqueous_markup: 1,
      matte_aqueous_available: true,
      matte_aqueous_markup: 1,
      coatings_tooltip_text: '',
      // Custom options
      custom_sides_options: [],
      custom_coating_options: [],
      is_active: true
    }
  });

  // Add custom option functions
  const addCustomSidesOption = () => {
    setCustomSidesOptions([...customSidesOptions, { name: '', available: true, markup: 1 }]);
  };

  const addCustomCoatingOption = () => {
    setCustomCoatingOptions([...customCoatingOptions, { name: '', available: true, markup: 1 }]);
  };

  const removeCustomSidesOption = (index: number) => {
    setCustomSidesOptions(customSidesOptions.filter((_, i) => i !== index));
  };

  const removeCustomCoatingOption = (index: number) => {
    setCustomCoatingOptions(customCoatingOptions.filter((_, i) => i !== index));
  };

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
        // Enhanced coating options - fallback to defaults if not set
        high_gloss_uv_available: paperStock.high_gloss_uv_available ?? true,
        high_gloss_uv_markup: paperStock.high_gloss_uv_markup ?? 1,
        high_gloss_uv_one_side_available: paperStock.high_gloss_uv_one_side_available ?? true,
        high_gloss_uv_one_side_markup: paperStock.high_gloss_uv_one_side_markup ?? 1,
        gloss_aqueous_available: paperStock.gloss_aqueous_available ?? true,
        gloss_aqueous_markup: paperStock.gloss_aqueous_markup ?? 1,
        matte_aqueous_available: paperStock.matte_aqueous_available ?? true,
        matte_aqueous_markup: paperStock.matte_aqueous_markup ?? 1,
        coatings_tooltip_text: paperStock.coatings_tooltip_text || '',
        // Custom options from additional data
        custom_sides_options: additionalData.custom_sides_options || [],
        custom_coating_options: additionalData.custom_coating_options || [],
        is_active: paperStock.is_active ?? true
      });
      
      // Load custom options into state
      setCustomSidesOptions(additionalData.custom_sides_options || []);
      setCustomCoatingOptions(additionalData.custom_coating_options || []);
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
        // Enhanced coating options with 1% default markup
        high_gloss_uv_available: true,
        high_gloss_uv_markup: 1,
        high_gloss_uv_one_side_available: true,
        high_gloss_uv_one_side_markup: 1,
        gloss_aqueous_available: true,
        gloss_aqueous_markup: 1,
        matte_aqueous_available: true,
        matte_aqueous_markup: 1,
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

      // Prepare the data with custom options stored in tooltip_text
      const additionalData = {
        custom_sides_options: customSidesOptions,
        custom_coating_options: customCoatingOptions
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
        // Enhanced coating options
        high_gloss_uv_available: data.high_gloss_uv_available,
        high_gloss_uv_markup: data.high_gloss_uv_markup,
        high_gloss_uv_one_side_available: data.high_gloss_uv_one_side_available,
        high_gloss_uv_one_side_markup: data.high_gloss_uv_one_side_markup,
        gloss_aqueous_available: data.gloss_aqueous_available,
        gloss_aqueous_markup: data.gloss_aqueous_markup,
        matte_aqueous_available: data.matte_aqueous_available,
        matte_aqueous_markup: data.matte_aqueous_markup,
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
            Custom Sides Options: {customSidesOptions.length} | 
            Custom Coating Options: {customCoatingOptions.length}
          </span>
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

            {/* Step 3: Enhanced Coating Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Step 3: Coating Options</h3>
              <p className="text-sm text-muted-foreground">Configure the specific coating options that customers will see as their third choice. Each option can have its own markup percentage.</p>
              
              <div className="grid grid-cols-1 gap-4">
                {/* High Gloss UV */}
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center space-x-4 flex-1">
                    <FormField
                      control={form.control}
                      name="high_gloss_uv_available"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-base font-medium">
                            High Gloss UV
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex items-center space-x-2 min-w-[120px]">
                    <FormField
                      control={form.control}
                      name="high_gloss_uv_markup"
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

                {/* High Gloss UV on ONE SIDE */}
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center space-x-4 flex-1">
                    <FormField
                      control={form.control}
                      name="high_gloss_uv_one_side_available"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-base font-medium">
                            High Gloss UV on ONE SIDE
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex items-center space-x-2 min-w-[120px]">
                    <FormField
                      control={form.control}
                      name="high_gloss_uv_one_side_markup"
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

                {/* Gloss Aqueous */}
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center space-x-4 flex-1">
                    <FormField
                      control={form.control}
                      name="gloss_aqueous_available"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-base font-medium">
                            Gloss Aqueous
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex items-center space-x-2 min-w-[120px]">
                    <FormField
                      control={form.control}
                      name="gloss_aqueous_markup"
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

                {/* Matte Aqueous */}
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center space-x-4 flex-1">
                    <FormField
                      control={form.control}
                      name="matte_aqueous_available"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-base font-medium">
                            Matte Aqueous
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex items-center space-x-2 min-w-[120px]">
                    <FormField
                      control={form.control}
                      name="matte_aqueous_markup"
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

            {/* Custom Sides Options */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Custom Sides Options</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCustomSidesOption}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Custom Option
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">Add custom sides printing options beyond the standard 4 options above.</p>
              
              {customSidesOptions.map((option, index) => (
                <div key={index} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center space-x-4 flex-1">
                    <Input
                      placeholder="Custom sides option name"
                      value={option.name}
                      onChange={(e) => {
                        const newOptions = [...customSidesOptions];
                        newOptions[index].name = e.target.value;
                        setCustomSidesOptions(newOptions);
                      }}
                      className="flex-1"
                    />
                    <Switch
                      checked={option.available}
                      onCheckedChange={(checked) => {
                        const newOptions = [...customSidesOptions];
                        newOptions[index].available = checked;
                        setCustomSidesOptions(newOptions);
                      }}
                    />
                  </div>
                  <div className="flex items-center space-x-2 min-w-[120px]">
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        placeholder="1"
                        className="pr-8 w-20"
                        value={option.markup}
                        onChange={(e) => {
                          const newOptions = [...customSidesOptions];
                          newOptions[index].markup = parseFloat(e.target.value) || 0;
                          setCustomSidesOptions(newOptions);
                        }}
                      />
                      <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">%</span>
                    </div>
                    <span className="text-sm text-muted-foreground">markup</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCustomSidesOption(index)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Custom Coating Options */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Custom Coating Options</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCustomCoatingOption}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Custom Option
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">Add custom coating options beyond the standard 4 options above.</p>
              
              {customCoatingOptions.map((option, index) => (
                <div key={index} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center space-x-4 flex-1">
                    <Input
                      placeholder="Custom coating option name"
                      value={option.name}
                      onChange={(e) => {
                        const newOptions = [...customCoatingOptions];
                        newOptions[index].name = e.target.value;
                        setCustomCoatingOptions(newOptions);
                      }}
                      className="flex-1"
                    />
                    <Switch
                      checked={option.available}
                      onCheckedChange={(checked) => {
                        const newOptions = [...customCoatingOptions];
                        newOptions[index].available = checked;
                        setCustomCoatingOptions(newOptions);
                      }}
                    />
                  </div>
                  <div className="flex items-center space-x-2 min-w-[120px]">
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        placeholder="1"
                        className="pr-8 w-20"
                        value={option.markup}
                        onChange={(e) => {
                          const newOptions = [...customCoatingOptions];
                          newOptions[index].markup = parseFloat(e.target.value) || 0;
                          setCustomCoatingOptions(newOptions);
                        }}
                      />
                      <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">%</span>
                    </div>
                    <span className="text-sm text-muted-foreground">markup</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCustomCoatingOption(index)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
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