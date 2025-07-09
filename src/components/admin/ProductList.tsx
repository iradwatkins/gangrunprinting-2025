import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MoreHorizontal, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  Package
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { productsApi, type ProductFilters } from '@/api/products';
import { categoriesApi } from '@/api/categories';
import { vendorsApi } from '@/api/vendors';
import type { Tables } from '@/integrations/supabase/types';

type Product = Tables<'products'> & {
  product_categories?: { id: string; name: string; slug: string };
  vendors?: { id: string; name: string };
};

type Category = Tables<'product_categories'>;
type Vendor = Tables<'vendors'>;

export function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProductFilters>({
    page: 1,
    limit: 20
  });
  const { toast } = useToast();

  // Debug logging
  console.log('ProductList component mounted');

  useEffect(() => {
    loadData();
  }, [filters]);

  useEffect(() => {
    loadCategories();
    loadVendors();
  }, []);

  // Add timeout safety
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loading) {
        setLoading(false);
        toast({
          title: 'Loading timeout',
          description: 'Products are taking too long to load. Please refresh the page.',
          variant: 'destructive'
        });
      }
    }, 10000); // 10 second timeout
    
    return () => clearTimeout(timeoutId);
  }, [loading, toast]);

  const loadData = async () => {
    console.log('Loading products with filters:', filters);
    setLoading(true);
    setError(null);
    try {
      const response = await productsApi.getProducts(filters);
      console.log('Products API response:', response);
      
      if (response.error) {
        const errorMsg = response.error;
        console.error('Products API error:', errorMsg);
        setError(errorMsg);
        toast({
          title: 'Error Loading Products',
          description: errorMsg,
          variant: 'destructive'
        });
        setProducts([]);
      } else {
        console.log('Products loaded successfully:', response.data?.length || 0, 'items');
        setProducts(response.data || []);
      }
    } catch (error) {
      console.error('Products load error (catch block):', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to load products. Please try again.';
      setError(errorMsg);
      toast({
        title: 'Error Loading Products',
        description: errorMsg,
        variant: 'destructive'
      });
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    console.log('Loading categories...');
    try {
      const response = await categoriesApi.getCategories({ is_active: true });
      console.log('Categories API response:', response);
      if (response.data) {
        setCategories(response.data);
        console.log('Categories loaded successfully:', response.data.length, 'items');
      }
    } catch (error) {
      console.error('Categories load error:', error);
      // Silently fail - categories are optional
    }
  };

  const loadVendors = async () => {
    console.log('Loading vendors...');
    try {
      const response = await vendorsApi.getVendors({ is_active: true });
      console.log('Vendors API response:', response);
      if (response.data) {
        setVendors(response.data);
        console.log('Vendors loaded successfully:', response.data.length, 'items');
      }
    } catch (error) {
      console.error('Vendors load error:', error);
      // Silently fail - vendors are optional
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    const response = await productsApi.deleteProduct(productId);
    
    if (response.error) {
      toast({
        title: 'Error',
        description: response.error,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Success',
        description: 'Product deleted successfully'
      });
      loadData();
    }
  };

  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search, page: 1 }));
  };

  const handleCategoryFilter = (categoryId: string) => {
    setFilters(prev => ({ 
      ...prev, 
      category_id: categoryId === 'all' ? undefined : categoryId,
      page: 1 
    }));
  };

  const handleVendorFilter = (vendorId: string) => {
    setFilters(prev => ({ 
      ...prev, 
      vendor_id: vendorId === 'all' ? undefined : vendorId,
      page: 1 
    }));
  };

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({ 
      ...prev, 
      is_active: status === 'all' ? undefined : status === 'active',
      page: 1 
    }));
  };

  // Show error state
  if (error && !loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Products</h1>
            <p className="text-muted-foreground">Manage your product catalog</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Failed to Load Products</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <div className="space-x-2">
                <Button onClick={loadData} variant="outline">
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
      </div>
    );
  }

  if (loading && products.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage your product catalog
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            Import Products
          </Button>
          <Button variant="outline" asChild>
            <Link to="/admin/products/workflow">
              <Package className="mr-2 h-4 w-4" />
              Step-by-Step
            </Link>
          </Button>
          <Button asChild>
            <Link to="/admin/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  className="pl-10"
                  value={filters.search || ''}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Select onValueChange={handleCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select onValueChange={handleVendorFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Vendors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vendors</SelectItem>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select onValueChange={handleStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products ({products.length})</CardTitle>
          <CardDescription>
            A list of all products in your catalog
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                // Loading skeleton
                Array.from({ length: 3 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-8 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center space-y-2">
                      <Package className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No information at this time</p>
                      <Button asChild variant="outline" size="sm">
                        <Link to="/admin/products/new">Add your first product</Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Min Qty: {product.minimum_quantity}
                      </div>
                    </TableCell>
                    <TableCell>
                      {product.product_categories?.name || 'No Category'}
                    </TableCell>
                    <TableCell>
                      {product.vendors?.name || 'No Vendor'}
                    </TableCell>
                    <TableCell>
                      ${product.base_price.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.is_active ? 'default' : 'secondary'}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link to={`/admin/products/${product.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/admin/products/${product.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDelete(product.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}