import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Tag,
  ToggleLeft,
  ToggleRight,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { categoriesApi, type CategoryFilters } from '@/api/categories';
import type { Tables } from '@/integrations/supabase/types';

type Category = Tables<'product_categories'>;

export function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  console.log('CategoryList component mounted');

  const loadCategories = async () => {
    console.log('CategoryList: Loading categories...');
    setLoading(true);
    setError(null);

    try {
      const filters: CategoryFilters = {};
      if (searchTerm.trim()) {
        filters.search = searchTerm.trim();
      }

      const response = await categoriesApi.getCategories(filters);
      
      if (response.error) {
        setError(response.error);
        console.error('CategoryList: API error:', response.error);
      } else {
        setCategories(response.data || []);
        console.log('CategoryList: Loaded', response.data?.length || 0, 'categories');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unexpected error occurred';
      setError(errorMsg);
      console.error('CategoryList: Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [searchTerm]);

  const handleToggleActive = async (category: Category) => {
    try {
      const response = await categoriesApi.updateCategory(category.id, {
        is_active: !category.is_active
      });

      if (response.error) {
        toast({
          title: 'Error',
          description: response.error,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Success',
          description: `Category ${category.is_active ? 'deactivated' : 'activated'} successfully`
        });
        loadCategories(); // Refresh the list
      }
    } catch (err) {
      toast({
        title: 'Error', 
        description: 'Failed to update category',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (category: Category) => {
    if (!confirm(`Are you sure you want to delete "${category.name}"?`)) {
      return;
    }

    try {
      const response = await categoriesApi.deleteCategory(category.id);

      if (response.error) {
        toast({
          title: 'Error',
          description: response.error,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Success',
          description: 'Category deleted successfully'
        });
        loadCategories(); // Refresh the list
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to delete category',
        variant: 'destructive'
      });
    }
  };

  // Show error state
  if (error && !loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
            <p className="text-muted-foreground">Manage product categories</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Failed to Load Categories</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <div className="space-x-2">
                <Button onClick={loadCategories} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
                <Button onClick={() => window.location.reload()}>
                  Refresh Page
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">
            Manage product categories ({categories.length} total)
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              variant="outline" 
              onClick={loadCategories}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Categories</CardTitle>
          <CardDescription>
            {loading ? 'Loading categories...' : `${categories.length} categories found`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded">
                  <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8">
              <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Categories Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'No categories match your search.' : 'Get started by creating your first category.'}
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sort Order</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{category.name}</div>
                        {category.description && (
                          <div className="text-sm text-muted-foreground">{category.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">{category.slug}</code>
                    </TableCell>
                    <TableCell>
                      <Badge variant={category.is_active ? 'default' : 'secondary'}>
                        {category.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>{category.sort_order || '-'}</TableCell>
                    <TableCell>
                      {category.parent_category_id ? (
                        <Badge variant="outline">Has Parent</Badge>
                      ) : (
                        <span className="text-muted-foreground">Root</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleToggleActive(category)}
                        >
                          {category.is_active ? (
                            <ToggleLeft className="h-4 w-4" />
                          ) : (
                            <ToggleRight className="h-4 w-4" />
                          )}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(category)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}