import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash2, AlertCircle, Tags, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import { categoriesApi } from '@/api/categories';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Category = Tables<'product_categories'>;

interface CategoryFormData {
  name: string;
  slug: string;
  description?: string;
  sort_order?: number;
  is_active: boolean;
  parent_category_id?: string;
}

export function CategoriesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    slug: '',
    description: '',
    sort_order: 0,
    is_active: true
  });

  // Debug admin status function
  const checkAdminStatus = async () => {
    try {
      console.log('🔍 Checking admin status...');
      
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('Auth result:', { user: user ? { id: user.id, email: user.email } : null, error: authError?.message });

      if (!user) {
        setDebugInfo({ error: 'Not authenticated' });
        return;
      }

      // Check is_admin function
      const { data: isAdminResult, error: adminError } = await supabase.rpc('is_admin');
      console.log('is_admin() result:', { result: isAdminResult, error: adminError?.message });

      // Try debug_admin_status function if available
      const { data: debugResult, error: debugError } = await supabase.rpc('debug_admin_status');
      console.log('debug_admin_status() result:', { result: debugResult, error: debugError?.message });

      setDebugInfo({
        user,
        isAdmin: isAdminResult,
        adminError: adminError?.message,
        debugStatus: debugResult,
        debugError: debugError?.message
      });
    } catch (error) {
      console.error('Debug check failed:', error);
      setDebugInfo({ error: (error as Error).message });
    }
  };

  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const response = await categoriesApi.getAll();
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: categoriesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast({ title: 'Success', description: 'Category created successfully' });
      resetForm();
      setIsFormOpen(false);
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to create category', variant: 'destructive' });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CategoryFormData> }) => categoriesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast({ title: 'Success', description: 'Category updated successfully' });
      resetForm();
      setIsFormOpen(false);
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to update category', variant: 'destructive' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: categoriesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast({ title: 'Success', description: 'Category deleted successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to delete category', variant: 'destructive' });
    }
  });

  const resetForm = () => {
    setFormData({ name: '', slug: '', description: '', sort_order: 0, is_active: true });
    setEditingCategory(null);
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({ 
      ...prev, 
      name,
      slug: generateSlug(name)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      sort_order: category.sort_order || 0,
      is_active: category.is_active,
      parent_category_id: category.parent_category_id || undefined
    });
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      deleteMutation.mutate(id);
    }
  };

  const filteredCategories = categories?.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.slug.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (error) {
    return (
      <AdminLayout>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load categories: {(error as Error).message}</AlertDescription>
        </Alert>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Categories</h1>
            <p className="text-gray-600">Manage product categories</p>
          </div>
          
          <Button onClick={() => {
            resetForm();
            setIsFormOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>

        {/* Debug Admin Status (Development & Production) */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center gap-2">
              🔍 Admin Status Debug
              <Button size="sm" variant="outline" onClick={checkAdminStatus}>
                Check Status
              </Button>
            </CardTitle>
            <CardDescription>
              Debug authentication and admin permissions for troubleshooting category saving issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            {debugInfo ? (
              <div className="space-y-2 text-sm">
                {debugInfo.error ? (
                  <div className="text-red-600">Error: {debugInfo.error}</div>
                ) : (
                  <>
                    <div><strong>User:</strong> {debugInfo.user?.email || 'Not logged in'}</div>
                    <div><strong>User ID:</strong> {debugInfo.user?.id || 'N/A'}</div>
                    <div className="flex items-center gap-2">
                      <strong>Admin Status:</strong>
                      <Badge variant={debugInfo.isAdmin ? 'default' : 'destructive'}>
                        {debugInfo.isAdmin ? 'Admin' : 'Not Admin'}
                      </Badge>
                    </div>
                    {debugInfo.adminError && (
                      <div className="text-red-600">Admin Check Error: {debugInfo.adminError}</div>
                    )}
                    {debugInfo.debugStatus && (
                      <div className="mt-2 p-2 bg-white rounded border">
                        <strong>Detailed Status:</strong>
                        <pre className="text-xs mt-1 overflow-auto">
                          {JSON.stringify(debugInfo.debugStatus, null, 2)}
                        </pre>
                      </div>
                    )}
                    {debugInfo.debugError && (
                      <div className="text-orange-600 text-xs">
                        Debug function not available: {debugInfo.debugError}
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="text-gray-500">Click "Check Status" to debug admin permissions</div>
            )}
          </CardContent>
        </Card>

        {/* Inline Form */}
        {isFormOpen && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFormOpen(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g., Business Cards, Flyers, Banners"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="auto-generated-from-name"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of this category"
                  />
                </div>

                <div>
                  <Label htmlFor="sort_order">Sort Order</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={formData.sort_order || 0}
                    onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
                
                <div className="flex gap-2">
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingCategory ? 'Update' : 'Create'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No information at this time</p>
              {searchTerm && <p className="text-sm text-gray-400 mt-2">Try adjusting your search</p>}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategories.map((category) => (
              <Card key={category.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Tags className="h-4 w-4" />
                        {category.name}
                      </CardTitle>
                      <CardDescription>
                        {category.slug}
                      </CardDescription>
                      {category.description && (
                        <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge variant={category.is_active ? 'default' : 'secondary'}>
                        {category.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      {category.sort_order !== null && (
                        <Badge variant="outline">#{category.sort_order}</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(category)}>
                      <Edit className="h-3 w-3 mr-1" />Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(category.id)}>
                      <Trash2 className="h-3 w-3 mr-1" />Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        <div className="text-sm text-gray-500">
          Total: {filteredCategories.length} categor{filteredCategories.length !== 1 ? 'ies' : 'y'}
        </div>
      </div>
    </AdminLayout>
  );
}