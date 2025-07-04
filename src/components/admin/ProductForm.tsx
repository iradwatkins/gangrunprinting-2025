import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { productsApi } from '@/api/products';
import { categoriesApi } from '@/api/categories';
import { vendorsApi } from '@/api/vendors';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  category_id: z.string().min(1, 'Category is required'),
  vendor_id: z.string().min(1, 'Vendor is required'),
  base_price: z.coerce.number().min(0, 'Price must be positive'),
  minimum_quantity: z.coerce.number().min(1, 'Minimum quantity must be at least 1'),
  is_active: z.boolean()
});

type ProductFormData = z.infer<typeof productSchema>;

type Category = Tables<'product_categories'>;
type Vendor = Tables<'vendors'>;
type Product = Tables<'products'>;

interface ProductFormProps {
  mode: 'create' | 'edit';
}

export function ProductForm({ mode }: ProductFormProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
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
      is_active: true
    }
  });

  useEffect(() => {
    loadCategories();
    loadVendors();
    if (mode === 'edit' && id) {
      loadProduct(id);
    }
  }, [mode, id]);

  const loadCategories = async () => {
    const response = await categoriesApi.getCategories({ is_active: true });
    if (response.data) {
      setCategories(response.data);
    }
  };

  const loadVendors = async () => {
    const response = await vendorsApi.getVendors({ is_active: true });
    if (response.data) {
      setVendors(response.data);
    }
  };

  const loadProduct = async (productId: string) => {
    setInitialLoading(true);
    const response = await productsApi.getProduct(productId);
    
    if (response.error) {
      toast({
        title: 'Error',
        description: response.error,
        variant: 'destructive'
      });
      navigate('/admin/products');
    } else if (response.data) {
      const product = response.data;
      form.reset({
        name: product.name,
        slug: product.slug,
        description: product.description || '',
        category_id: product.category_id,
        vendor_id: product.vendor_id,
        base_price: product.base_price,
        minimum_quantity: product.minimum_quantity,
        is_active: product.is_active
      });
    }
    setInitialLoading(false);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const onNameChange = (name: string) => {
    form.setValue('name', name);
    if (mode === 'create') {
      form.setValue('slug', generateSlug(name));
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true);
    
    try {
      if (mode === 'create') {
        const response = await productsApi.createProduct(data as TablesInsert<'products'>);
        
        if (response.error) {
          toast({
            title: 'Error',
            description: response.error,
            variant: 'destructive'
          });
        } else {
          toast({
            title: 'Success',
            description: 'Product created successfully'
          });
          navigate('/admin/products');
        }
      } else {
        if (!id) return;
        
        const response = await productsApi.updateProduct(id, data as TablesUpdate<'products'>);
        
        if (response.error) {
          toast({
            title: 'Error',
            description: response.error,
            variant: 'destructive'
          });
        } else {
          toast({
            title: 'Success',
            description: 'Product updated successfully'
          });
          navigate('/admin/products');
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
    }
    
    setLoading(false);
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
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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