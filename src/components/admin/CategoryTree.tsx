import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Tags,
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
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { categoriesApi, type CategoryFilters } from '@/api/categories';
import type { Tables } from '@/integrations/supabase/types';

type Category = Tables<'product_categories'>;

export function CategoryTree() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  console.log('CategoryTree component mounted');

  const loadData = async () => {
    console.log('CategoryTree: Loading categories...');
    setLoading(true);
    setError(null);

    try {
      const filters: CategoryFilters = {};
      if (searchTerm.trim()) {
        filters.search = searchTerm.trim();
      }

      const response = await categoriesApi.getCategories(filters);
      console.log('CategoryTree: API response received');

      if (response.error) {
        const errorMsg = response.error;
        console.error('CategoryTree: API error:', errorMsg);
        setError(errorMsg);
        toast({
          title: "Error Loading Categories",
          description: errorMsg,
          variant: "destructive",
        });
      } else {
        const categories = response.data || [];
        console.log('CategoryTree: Categories loaded successfully:', categories.length, 'items');
        setCategories(categories);
      }
    } catch (error) {
      console.error('CategoryTree: Load error (catch block):', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to load categories';
      setError(errorMsg);
      toast({
        title: "Error Loading Categories",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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
        loadData(); // Refresh the list
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
        loadData(); // Refresh the list
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tags className="h-5 w-5" />
            Category Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Tags className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to Load Categories</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <div className="space-x-2">
              <Button onClick={loadData} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
              <Button onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              <p>Check the browser console for more details.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tags className="h-5 w-5" />
            Loading Categories...
          </CardTitle>
          <CardDescription>
            Please wait while we load your categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tags className="h-5 w-5" />
            Category Management
          </CardTitle>
          <CardDescription>
            Manage product categories ({categories.length} total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Controls */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Button onClick={loadData} variant="outline" disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>

          {/* Categories List */}
          {categories.length === 0 ? (
            <div className="text-center py-8">
              <Tags className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
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