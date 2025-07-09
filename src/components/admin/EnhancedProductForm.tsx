import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Save, Loader2, Plus, X, Check } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { productsApi } from '@/api/products';
import { categoriesApi } from '@/api/categories';
import { vendorsApi } from '@/api/vendors';
import { paperStocksApi, printSizesApi, turnaroundTimesApi, addOnsApi } from '@/api/global-options';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  category_id: z.string().min(1, 'Category is required'),
  vendor_id: z.string().min(1, 'Vendor is required'),
  base_price: z.coerce.number().min(0, 'Price must be positive'),
  minimum_quantity: z.coerce.number().min(1, 'Minimum quantity must be at least 1'),
  is_active: z.boolean(),
  // Global options
  paper_stocks: z.array(z.string()).min(1, 'At least one paper stock is required'),
  print_sizes: z.array(z.string()).min(1, 'At least one print size is required'),
  turnaround_times: z.array(z.string()).min(1, 'At least one turnaround time is required'),
  add_ons: z.array(z.string()).optional()
});

type ProductFormData = z.infer<typeof productSchema>;

type Category = Tables<'product_categories'>;
type Vendor = Tables<'vendors'>;
type Product = Tables<'products'>;
type PaperStock = Tables<'paper_stocks'>;
type PrintSize = Tables<'print_sizes'>;
type TurnaroundTime = Tables<'turnaround_times'>;
type AddOn = Tables<'add_ons'>;

interface EnhancedProductFormProps {
  mode: 'create' | 'edit';
}

export function EnhancedProductForm({ mode }: EnhancedProductFormProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [paperStocks, setPaperStocks] = useState<PaperStock[]>([]);
  const [printSizes, setPrintSizes] = useState<PrintSize[]>([]);
  const [turnaroundTimes, setTurnaroundTimes] = useState<TurnaroundTime[]>([]);
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(mode === 'edit');

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
      paper_stocks: [],
      print_sizes: [],
      turnaround_times: [],
      add_ons: []
    }
  });

  useEffect(() => {
    loadAllData();
    if (mode === 'edit' && id) {
      loadProduct(id);
    }
  }, [mode, id]);

  const loadAllData = async () => {
    try {
      const [categoriesRes, vendorsRes, paperStocksRes, printSizesRes, turnaroundTimesRes, addOnsRes] = await Promise.all([
        categoriesApi.getCategories({ is_active: true }),
        vendorsApi.getVendors({ is_active: true }),
        paperStocksApi.getAll({ is_active: true }),
        printSizesApi.getAll({ is_active: true }),
        turnaroundTimesApi.getAll({ is_active: true }),
        addOnsApi.getAll({ is_active: true })
      ]);

      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (vendorsRes.data) setVendors(vendorsRes.data);
      if (paperStocksRes.data) setPaperStocks(paperStocksRes.data);
      if (printSizesRes.data) setPrintSizes(printSizesRes.data);
      if (turnaroundTimesRes.data) setTurnaroundTimes(turnaroundTimesRes.data);
      if (addOnsRes.data) setAddOns(addOnsRes.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load form data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const loadProduct = async (productId: string) => {
    setInitialLoading(true);
    try {
      const response = await productsApi.getProduct(productId);
      if (response.data) {
        const product = response.data;
        form.reset({
          name: product.name,
          slug: product.slug,
          description: product.description || '',
          category_id: product.category_id,
          vendor_id: product.vendor_id,
          base_price: product.base_price,
          minimum_quantity: product.minimum_quantity,
          is_active: product.is_active,
          paper_stocks: [], // TODO: Load from junction tables
          print_sizes: [], // TODO: Load from junction tables
          turnaround_times: [], // TODO: Load from junction tables
          add_ons: [] // TODO: Load from junction tables
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const onNameChange = (value: string) => {
    form.setValue('name', value);
    // Auto-generate slug
    const slug = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    form.setValue('slug', slug);
  };

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true);
    try {
      if (mode === 'create') {
        const productData: TablesInsert<'products'> = {
          name: data.name,
          slug: data.slug,
          description: data.description,
          category_id: data.category_id,
          vendor_id: data.vendor_id,
          base_price: data.base_price,
          minimum_quantity: data.minimum_quantity,
          is_active: data.is_active
        };

        const response = await productsApi.createProduct(productData);
        
        if (response.error) {
          throw new Error(response.error);
        }

        if (response.data) {
          // TODO: Create junction table entries for global options
          // This would require additional API endpoints for managing product relationships
          
          toast({
            title: "Success",
            description: "Product created successfully",
          });
          navigate('/admin/products');
        }
      } else if (id) {
        const productData: TablesUpdate<'products'> = {
          name: data.name,
          slug: data.slug,
          description: data.description,
          category_id: data.category_id,
          vendor_id: data.vendor_id,
          base_price: data.base_price,
          minimum_quantity: data.minimum_quantity,
          is_active: data.is_active
        };

        const response = await productsApi.updateProduct(id, productData);
        
        if (response.error) {
          throw new Error(response.error);
        }

        toast({
          title: "Success",
          description: "Product updated successfully",
        });
        navigate('/admin/products');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save product",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/products')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/products')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {mode === 'create' ? 'Add Product' : 'Edit Product'}
            </h1>
            <p className="text-muted-foreground">Configure product details and global options</p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Essential product details and identification
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
                        <Input 
                          {...field} 
                          onChange={(e) => onNameChange(e.target.value)}
                          placeholder="Enter product name"
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
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="product-slug" />
                      </FormControl>
                      <FormDescription>
                        URL-friendly version of the name
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
                        placeholder="Product description..."
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Classification */}
          <Card>
            <CardHeader>
              <CardTitle>Classification</CardTitle>
              <CardDescription>
                Category and vendor assignment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>

          {/* Paper Stocks */}
          <Card>
            <CardHeader>
              <CardTitle>Paper Stocks</CardTitle>
              <CardDescription>
                Select available paper stocks for this product
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="paper_stocks"
                render={() => (
                  <FormItem>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {paperStocks.map((stock) => (
                        <FormField
                          key={stock.id}
                          control={form.control}
                          name="paper_stocks"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={stock.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(stock.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, stock.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== stock.id
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {stock.name}
                                  <div className="text-xs text-muted-foreground">
                                    {stock.weight}gsm - ${stock.price_per_sq_inch}/sq in
                                  </div>
                                </FormLabel>
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

          {/* Print Sizes */}
          <Card>
            <CardHeader>
              <CardTitle>Print Sizes</CardTitle>
              <CardDescription>
                Select available print sizes for this product
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="print_sizes"
                render={() => (
                  <FormItem>
                    <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
                      {printSizes.map((size) => (
                        <FormField
                          key={size.id}
                          control={form.control}
                          name="print_sizes"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={size.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(size.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, size.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== size.id
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {size.name}
                                  <div className="text-xs text-muted-foreground">
                                    {size.width}" × {size.height}"
                                  </div>
                                </FormLabel>
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

          {/* Turnaround Times */}
          <Card>
            <CardHeader>
              <CardTitle>Turnaround Times</CardTitle>
              <CardDescription>
                Select available turnaround times for this product
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="turnaround_times"
                render={() => (
                  <FormItem>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {turnaroundTimes.map((time) => (
                        <FormField
                          key={time.id}
                          control={form.control}
                          name="turnaround_times"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={time.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(time.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, time.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== time.id
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {time.name}
                                  <div className="text-xs text-muted-foreground">
                                    {time.business_days} days - +{time.price_markup_percent}%
                                  </div>
                                </FormLabel>
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

          {/* Add-ons */}
          <Card>
            <CardHeader>
              <CardTitle>Add-on Services</CardTitle>
              <CardDescription>
                Select available add-on services for this product (optional)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="add_ons"
                render={() => (
                  <FormItem>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {addOns.map((addon) => (
                        <FormField
                          key={addon.id}
                          control={form.control}
                          name="add_ons"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={addon.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(addon.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, addon.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== addon.id
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {addon.name}
                                  <div className="text-xs text-muted-foreground">
                                    {addon.pricing_model}
                                  </div>
                                </FormLabel>
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

          {/* Pricing & Quantities */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Quantities</CardTitle>
              <CardDescription>
                Base pricing and minimum order requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                          <Input {...field} type="number" step="0.01" className="pl-7" />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Base price before options and discounts
                      </FormDescription>
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
                        <Input {...field} type="number" min="1" />
                      </FormControl>
                      <FormDescription>
                        Minimum order quantity for this product
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
              <CardDescription>
                Product availability and visibility
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Product</FormLabel>
                      <FormDescription>
                        Make this product visible to customers
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
            <Button type="button" variant="outline" onClick={() => navigate('/admin/products')}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              {mode === 'create' ? 'Create Product' : 'Update Product'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}