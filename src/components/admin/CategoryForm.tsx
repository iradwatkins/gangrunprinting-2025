import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Save, Loader2, X } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { categoriesApi } from '@/api/categories';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100, 'Name too long'),
  slug: z.string().min(1, 'Slug is required').max(100, 'Slug too long')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens only'),
  description: z.string().optional(),
  parent_category_id: z.string().optional().nullable(),
  default_broker_discount: z.coerce.number().min(0, 'Discount cannot be negative').max(100, 'Discount cannot exceed 100%'),
  sort_order: z.coerce.number().min(0, 'Sort order must be positive').max(9999, 'Sort order too high'),
  is_active: z.boolean()
});

type CategoryFormData = z.infer<typeof categorySchema>;
type Category = Tables<'product_categories'>;

interface CategoryFormProps {
  open: boolean;
  onClose: () => void;
  category?: Category | null;
  parentCategory?: Category | null;
  onSuccess: () => void;
}

export function CategoryForm({ open, onClose, category, parentCategory, onSuccess }: CategoryFormProps) {
  const { toast } = useToast();
  const [availableParents, setAvailableParents] = useState<Category[]>([]);
  const [loadingParents, setLoadingParents] = useState(false);
  const isEditing = !!category;

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      parent_category_id: null,
      default_broker_discount: 0,
      sort_order: 0,
      is_active: true
    }
  });

  useEffect(() => {
    if (open) {
      loadAvailableParents();
    }
  }, [open]);

  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        parent_category_id: category.parent_category_id || null,
        default_broker_discount: category.default_broker_discount || 0,
        sort_order: category.sort_order || 0,
        is_active: category.is_active ?? true
      });
    } else {
      form.reset({
        name: '',
        slug: '',
        description: '',
        parent_category_id: parentCategory?.id || null,
        default_broker_discount: 0,
        sort_order: 0,
        is_active: true
      });
    }
  }, [category, parentCategory, form]);

  const loadAvailableParents = async () => {
    setLoadingParents(true);
    try {
      const response = await categoriesApi.getCategories({
        is_active: true,
        limit: 100
      });

      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        });
      } else {
        // Filter out current category and its descendants to prevent circular hierarchy
        let parents = response.data || [];
        if (category) {
          parents = parents.filter(parent => {
            return parent.id !== category.id && 
                   parent.parent_category_id !== category.id;
          });
        }
        setAvailableParents(parents);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load parent categories",
        variant: "destructive",
      });
    }
    setLoadingParents(false);
  };

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  };

  const handleNameChange = (name: string) => {
    form.setValue('name', name);
    
    // Auto-generate slug if not editing or if slug is empty/auto-generated
    const currentSlug = form.getValues('slug');
    if (!isEditing || !currentSlug || currentSlug === generateSlug(form.getValues('name'))) {
      form.setValue('slug', generateSlug(name));
    }
  };

  const validateHierarchy = async (data: CategoryFormData): Promise<string | null> => {
    // Prevent circular hierarchy
    if (data.parent_category_id && category) {
      if (data.parent_category_id === category.id) {
        return "Category cannot be its own parent";
      }
      
      // Check if proposed parent is a descendant of current category
      const checkDescendant = (parentId: string, categories: Category[]): boolean => {
        const parent = categories.find(c => c.id === parentId);
        if (!parent) return false;
        
        if (parent.parent_category_id === category.id) return true;
        if (parent.parent_category_id) {
          return checkDescendant(parent.parent_category_id, categories);
        }
        return false;
      };
      
      if (checkDescendant(data.parent_category_id, availableParents)) {
        return "Cannot move category under its own descendant";
      }
    }

    // Check slug uniqueness
    try {
      const response = await categoriesApi.getCategories({
        search: data.slug,
        limit: 100
      });
      
      if (response.data) {
        const conflicting = response.data.find(c => 
          c.slug === data.slug && (!category || c.id !== category.id)
        );
        if (conflicting) {
          return "Slug already exists. Please choose a different slug.";
        }
      }
    } catch (error) {
      // If we can't check, proceed but warn
      console.warn('Could not validate slug uniqueness');
    }

    return null;
  };

  const onSubmit = async (data: CategoryFormData) => {
    try {
      // Validate hierarchy and uniqueness
      const validationError = await validateHierarchy(data);
      if (validationError) {
        toast({
          title: "Validation Error",
          description: validationError,
          variant: "destructive",
        });
        return;
      }

      let response;

      if (isEditing && category) {
        response = await categoriesApi.updateCategory(category.id, data as TablesUpdate<'product_categories'>);
      } else {
        response = await categoriesApi.createCategory(data as TablesInsert<'product_categories'>);
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
        description: `Category ${isEditing ? 'updated' : 'created'} successfully`,
      });

      form.reset();
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} category`,
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const getFormTitle = () => {
    if (isEditing) return 'Edit Category';
    if (parentCategory) return `Add Subcategory to ${parentCategory.name}`;
    return 'Add Root Category';
  };

  const getFormDescription = () => {
    if (isEditing) return 'Update category information and settings';
    if (parentCategory) return `Create a new subcategory under ${parentCategory.name}`;
    return 'Create a new top-level category';
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {getFormTitle()}
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
            {getFormDescription()}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Business Cards" 
                        {...field}
                        onChange={(e) => handleNameChange(e.target.value)}
                      />
                    </FormControl>
                    <FormDescription>
                      Display name for this category
                    </FormDescription>
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
                        placeholder="e.g., business-cards" 
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      URL-friendly identifier (auto-generated from name)
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
                        placeholder="Optional description for this category..."
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

            {/* Hierarchy */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Hierarchy</h3>
              
              <FormField
                control={form.control}
                name="parent_category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Category</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(value === 'none' ? null : value)} 
                      value={field.value || 'none'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select parent category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No Parent (Root Category)</SelectItem>
                        {loadingParents ? (
                          <SelectItem value="loading" disabled>Loading...</SelectItem>
                        ) : (
                          availableParents.map((parent) => (
                            <SelectItem key={parent.id} value={parent.id}>
                              {parent.name} ({parent.slug})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select a parent category or leave as root category
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sort_order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sort Order</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        max="9999"
                        placeholder="0"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Order for displaying categories (lower numbers appear first)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Broker Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Broker Settings</h3>
              
              <FormField
                control={form.control}
                name="default_broker_discount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Broker Discount (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        min="0"
                        max="100"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Default discount percentage for broker customers in this category
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                        Make this category visible to customers and available for products
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
                    {isEditing ? 'Update Category' : 'Create Category'}
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