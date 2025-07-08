import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  Loader2, 
  Check, 
  ChevronRight,
  Package,
  Hash,
  Palette,
  Ruler,
  Plus as PlusIcon
} from 'lucide-react';
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
import { Progress } from '@/components/ui/progress';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import { productsApi } from '@/api/products';
import { categoriesApi } from '@/api/categories';
import { vendorsApi } from '@/api/vendors';
import { 
  paperStocksApi, 
  printSizesApi, 
  turnaroundTimesApi, 
  addOnsApi,
  quantitiesApi 
} from '@/api/global-options';
import type { Tables } from '@/integrations/supabase/types';

const productSchema = z.object({
  // Step 1: Basic Info
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  category_id: z.string().min(1, 'Category is required'),
  vendor_id: z.string().min(1, 'Vendor is required'),
  base_price: z.coerce.number().min(0, 'Price must be positive'),
  minimum_quantity: z.coerce.number().min(1, 'Minimum quantity must be at least 1'),
  is_active: z.boolean(),
  
  // Step 2: Quantity Options
  quantities: z.array(z.string()).min(1, 'At least one quantity option is required'),
  
  // Step 3: Paper Stock Options  
  paper_stocks: z.array(z.string()).min(1, 'At least one paper stock is required'),
  
  // Step 4: Size Options
  print_sizes: z.array(z.string()).min(1, 'At least one print size is required'),
  
  // Step 5: Add-on Services
  add_ons: z.array(z.string()).optional()
});

type ProductFormData = z.infer<typeof productSchema>;

const STEPS = [
  { id: 1, name: 'Basic Info', description: 'Product details and category' },
  { id: 2, name: 'Quantities', description: 'Available quantity options' },
  { id: 3, name: 'Paper Stocks', description: 'Available paper options' },
  { id: 4, name: 'Print Sizes', description: 'Available size options' },
  { id: 5, name: 'Add-ons', description: 'Optional services' },
  { id: 6, name: 'Review', description: 'Final review and save' }
];

export function WorkflowProductPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Global options data
  const [categories, setCategories] = useState<Tables<'product_categories'>[]>([]);
  const [vendors, setVendors] = useState<Tables<'vendors'>[]>([]);
  const [quantities, setQuantities] = useState<Tables<'quantities'>[]>([]);
  const [paperStocks, setPaperStocks] = useState<Tables<'paper_stocks'>[]>([]);
  const [printSizes, setPrintSizes] = useState<Tables<'print_sizes'>[]>([]);
  const [addOns, setAddOns] = useState<Tables<'add_ons'>[]>([]);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      category_id: '',
      vendor_id: '',
      base_price: 0,
      minimum_quantity: 1,
      is_active: true,
      quantities: [],
      paper_stocks: [],
      print_sizes: [],
      add_ons: []
    }
  });

  useEffect(() => {
    loadGlobalOptions();
  }, []);

  const loadGlobalOptions = async () => {
    try {
      const [categoriesRes, vendorsRes, quantitiesRes, paperStocksRes, printSizesRes, addOnsRes] = await Promise.all([
        categoriesApi.getAll({ is_active: true }),
        vendorsApi.getAll({ is_active: true }),
        quantitiesApi.getAll({ is_active: true }),
        paperStocksApi.getAll({ is_active: true }),
        printSizesApi.getAll({ is_active: true }),
        addOnsApi.getAll({ is_active: true })
      ]);

      setCategories(categoriesRes.data || []);
      setVendors(vendorsRes.data || []);
      setQuantities(quantitiesRes.data || []);
      setPaperStocks(paperStocksRes.data || []);
      setPrintSizes(printSizesRes.data || []);
      setAddOns(addOnsRes.data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load options",
        variant: "destructive",
      });
    }
  };

  // Auto-generate slug from name
  const watchedName = form.watch('name');
  useEffect(() => {
    if (watchedName) {
      const slug = watchedName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      form.setValue('slug', slug);
    }
  }, [watchedName, form]);

  const handleNext = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await form.trigger(fieldsToValidate);
    
    if (isValid && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getFieldsForStep = (step: number): (keyof ProductFormData)[] => {
    switch (step) {
      case 1: return ['name', 'slug', 'category_id', 'vendor_id', 'base_price', 'minimum_quantity'];
      case 2: return ['quantities'];
      case 3: return ['paper_stocks'];
      case 4: return ['print_sizes'];
      case 5: return ['add_ons'];
      default: return [];
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true);
    try {
      // Create the product with all selected options
      const response = await productsApi.createProduct({
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        category_id: data.category_id,
        vendor_id: data.vendor_id,
        base_price: data.base_price,
        minimum_quantity: data.minimum_quantity,
        is_active: data.is_active
      }, {
        quantities: data.quantities,
        paper_stocks: data.paper_stocks,
        print_sizes: data.print_sizes,
        add_ons: data.add_ons
      });

      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "Success",
        description: "Product created successfully with all configurations",
      });

      navigate('/admin/products');
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create product",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderBasicInfoStep();
      case 2:
        return renderQuantitiesStep();
      case 3:
        return renderPaperStocksStep();
      case 4:
        return renderPrintSizesStep();
      case 5:
        return renderAddOnsStep();
      case 6:
        return renderReviewStep();
      default:
        return null;
    }
  };

  const renderBasicInfoStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Product Information
        </CardTitle>
        <CardDescription>
          Basic product details and category assignment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g., Club Flyers" />
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
                <FormLabel>URL Slug</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="club-flyers" />
                </FormControl>
                <FormDescription>Auto-generated from product name</FormDescription>
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
                <Textarea {...field} placeholder="Product description..." rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vendor_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vendor</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vendor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {vendors.map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="base_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Base Price</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input {...field} type="number" step="0.01" className="pl-7" placeholder="0.00" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="minimum_quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Quantity</FormLabel>
                <FormControl>
                  <Input {...field} type="number" placeholder="1" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderQuantitiesStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="w-5 h-5" />
          Quantity Options
        </CardTitle>
        <CardDescription>
          Select which quantity options will be available for this product
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FormField
          control={form.control}
          name="quantities"
          render={() => (
            <FormItem>
              <div className="grid gap-3 md:grid-cols-3">
                {quantities.map((quantity) => (
                  <FormField
                    key={quantity.id}
                    control={form.control}
                    name="quantities"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={quantity.id}
                          className="flex flex-row items-start space-x-3 space-y-0 border rounded-lg p-3"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(quantity.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, quantity.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== quantity.id
                                      )
                                    )
                              }}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-normal">
                              {quantity.name}
                            </FormLabel>
                            {quantity.value && (
                              <p className="text-xs text-muted-foreground">
                                {quantity.value.toLocaleString()} pieces
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
      </CardContent>
    </Card>
  );

  const renderPaperStocksStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Paper Stock Options
        </CardTitle>
        <CardDescription>
          Select which paper stocks will be available for this product
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FormField
          control={form.control}
          name="paper_stocks"
          render={() => (
            <FormItem>
              <div className="grid gap-3 md:grid-cols-2">
                {paperStocks.map((paperStock) => (
                  <FormField
                    key={paperStock.id}
                    control={form.control}
                    name="paper_stocks"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={paperStock.id}
                          className="flex flex-row items-start space-x-3 space-y-0 border rounded-lg p-3"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(paperStock.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, paperStock.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== paperStock.id
                                      )
                                    )
                              }}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-normal">
                              {paperStock.name}
                            </FormLabel>
                            <div className="text-xs text-muted-foreground">
                              {paperStock.weight} GSM • ${paperStock.price_per_sq_inch?.toFixed(4)}/sq in
                              {paperStock.second_side_markup_percent && (
                                <span> • +{paperStock.second_side_markup_percent}% double-sided</span>
                              )}
                            </div>
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
      </CardContent>
    </Card>
  );

  const renderPrintSizesStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ruler className="w-5 h-5" />
          Print Size Options
        </CardTitle>
        <CardDescription>
          Select which print sizes will be available for this product
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FormField
          control={form.control}
          name="print_sizes"
          render={() => (
            <FormItem>
              <div className="grid gap-3 md:grid-cols-3">
                {printSizes.map((printSize) => (
                  <FormField
                    key={printSize.id}
                    control={form.control}
                    name="print_sizes"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={printSize.id}
                          className="flex flex-row items-start space-x-3 space-y-0 border rounded-lg p-3"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(printSize.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, printSize.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== printSize.id
                                      )
                                    )
                              }}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-normal">
                              {printSize.name}
                            </FormLabel>
                            <p className="text-xs text-muted-foreground">
                              {printSize.width}" × {printSize.height}" ({(printSize.width * printSize.height).toFixed(1)} sq in)
                            </p>
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
      </CardContent>
    </Card>
  );

  const renderAddOnsStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          Add-on Services
        </CardTitle>
        <CardDescription>
          Select which optional services will be available for this product
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FormField
          control={form.control}
          name="add_ons"
          render={() => (
            <FormItem>
              <div className="grid gap-3 md:grid-cols-2">
                {addOns.map((addOn) => (
                  <FormField
                    key={addOn.id}
                    control={form.control}
                    name="add_ons"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={addOn.id}
                          className="flex flex-row items-start space-x-3 space-y-0 border rounded-lg p-3"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(addOn.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, addOn.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== addOn.id
                                      )
                                    )
                              }}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-normal">
                              {addOn.name}
                            </FormLabel>
                            {addOn.description && (
                              <p className="text-xs text-muted-foreground">
                                {addOn.description}
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
      </CardContent>
    </Card>
  );

  const renderReviewStep = () => {
    const watchedData = form.watch();
    const selectedCategory = categories.find(c => c.id === watchedData.category_id);
    const selectedVendor = vendors.find(v => v.id === watchedData.vendor_id);
    const selectedQuantities = quantities.filter(q => watchedData.quantities.includes(q.id));
    const selectedPaperStocks = paperStocks.filter(p => watchedData.paper_stocks.includes(p.id));
    const selectedPrintSizes = printSizes.filter(s => watchedData.print_sizes.includes(s.id));
    const selectedAddOns = addOns.filter(a => watchedData.add_ons?.includes(a.id));

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Review Product Configuration</CardTitle>
            <CardDescription>
              Review all settings before creating the product
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Basic Info */}
            <div>
              <h4 className="font-medium mb-2">Basic Information</h4>
              <div className="grid gap-2 text-sm">
                <div>Name: <span className="font-medium">{watchedData.name}</span></div>
                <div>Category: <span className="font-medium">{selectedCategory?.name}</span></div>
                <div>Vendor: <span className="font-medium">{selectedVendor?.name}</span></div>
                <div>Base Price: <span className="font-medium">${watchedData.base_price}</span></div>
                <div>Minimum Quantity: <span className="font-medium">{watchedData.minimum_quantity}</span></div>
              </div>
            </div>

            <Separator />

            {/* Configuration Summary */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-2">Quantity Options ({selectedQuantities.length})</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedQuantities.map(q => (
                    <Badge key={q.id} variant="outline">{q.name}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Paper Stocks ({selectedPaperStocks.length})</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedPaperStocks.map(p => (
                    <Badge key={p.id} variant="outline">{p.name}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Print Sizes ({selectedPrintSizes.length})</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedPrintSizes.map(s => (
                    <Badge key={s.id} variant="outline">{s.name}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Add-on Services ({selectedAddOns?.length || 0})</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedAddOns?.map(a => (
                    <Badge key={a.id} variant="outline">{a.name}</Badge>
                  )) || <span className="text-muted-foreground text-sm">None selected</span>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Create Product (Step-by-Step)</h1>
            <p className="text-muted-foreground">
              Follow your natural workflow: Categories → Product → Quantities → Paper → Sizes → Add-ons
            </p>
          </div>
          <Button variant="outline" asChild>
            <a href="/admin/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </a>
          </Button>
        </div>

        {/* Progress Steps */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span>Step {currentStep} of {STEPS.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="w-full" />
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                {STEPS.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className={`flex items-center ${
                      currentStep === step.id ? 'text-primary font-medium' : 
                      currentStep > step.id ? 'text-green-600' : ''
                    }`}>
                      {currentStep > step.id ? (
                        <Check className="w-4 h-4 mr-1" />
                      ) : (
                        <span className="w-4 h-4 mr-1 text-center">{step.id}</span>
                      )}
                      <span className="hidden sm:inline">{step.name}</span>
                    </div>
                    {index < STEPS.length - 1 && (
                      <ChevronRight className="w-3 h-3 mx-2 text-muted-foreground" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {renderStepContent()}

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              {currentStep < STEPS.length ? (
                <Button type="button" onClick={handleNext}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Create Product
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </AdminLayout>
  );
}