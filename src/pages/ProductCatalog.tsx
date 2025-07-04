import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, Grid, List, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductFilters } from '@/components/products/ProductFilters';
import { BreadcrumbNav } from '@/components/products/BreadcrumbNav';
import { useToast } from '@/hooks/use-toast';
import { productsApi, type ProductFilters as ProductFiltersType } from '@/api/products';
import { categoriesApi } from '@/api/categories';
import type { Tables } from '@/integrations/supabase/types';

type Product = Tables<'products'> & {
  product_categories?: { id: string; name: string; slug: string };
  vendors?: { id: string; name: string };
};

type Category = Tables<'product_categories'>;

export function ProductCatalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { toast } = useToast();

  // Get filters from URL params
  const categorySlug = searchParams.get('category');
  const searchQuery = searchParams.get('search');
  const sortBy = searchParams.get('sort') || 'name';
  const page = parseInt(searchParams.get('page') || '1');

  const [filters, setFilters] = useState<ProductFiltersType>({
    search: searchQuery || '',
    page: page,
    limit: 20
  });

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [filters, categorySlug]);

  const loadCategories = async () => {
    const response = await categoriesApi.getCategories({ is_active: true });
    if (response.data) {
      setCategories(response.data);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    
    // Find category ID if category slug is provided
    let categoryId: string | undefined;
    if (categorySlug && categories.length > 0) {
      const category = categories.find(c => c.slug === categorySlug);
      categoryId = category?.id;
    }

    const productFilters: ProductFiltersType = {
      ...filters,
      category_id: categoryId,
      is_active: true
    };

    const response = await productsApi.getProducts(productFilters);
    
    if (response.error) {
      toast({
        title: 'Error',
        description: response.error,
        variant: 'destructive'
      });
    } else {
      setProducts(response.data || []);
    }
    setLoading(false);
  };

  const handleSearch = (search: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (search) {
      newParams.set('search', search);
    } else {
      newParams.delete('search');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
    setFilters(prev => ({ ...prev, search, page: 1 }));
  };

  const handleSort = (sort: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', sort);
    newParams.set('page', '1');
    setSearchParams(newParams);
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  const handleCategoryFilter = (categorySlug: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (categorySlug) {
      newParams.set('category', categorySlug);
    } else {
      newParams.delete('category');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const currentCategory = categories.find(c => c.slug === categorySlug);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <BreadcrumbNav category={currentCategory} />
          
          <div className="mt-4">
            <h1 className="text-3xl font-bold">
              {currentCategory ? currentCategory.name : 'All Products'}
            </h1>
            {currentCategory?.description && (
              <p className="text-muted-foreground mt-2">
                {currentCategory.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Search */}
            <div className="flex-1 max-w-md">
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

            {/* Controls */}
            <div className="flex items-center space-x-2">
              {/* Mobile Filters */}
              <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription>
                      Filter products by category and other criteria
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6">
                    <ProductFilters
                      categories={categories}
                      selectedCategory={categorySlug}
                      onCategoryChange={handleCategoryFilter}
                    />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Sort */}
              <Select value={sortBy} onValueChange={handleSort}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="name_desc">Name Z-A</SelectItem>
                  <SelectItem value="price">Price Low-High</SelectItem>
                  <SelectItem value="price_desc">Price High-Low</SelectItem>
                  <SelectItem value="created_at">Newest First</SelectItem>
                  <SelectItem value="created_at_desc">Oldest First</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode */}
              <div className="hidden sm:flex border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Desktop Filters */}
          <div className="hidden lg:block w-64 shrink-0">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Filters</h3>
                <ProductFilters
                  categories={categories}
                  selectedCategory={categorySlug}
                  onCategoryChange={handleCategoryFilter}
                />
              </CardContent>
            </Card>
          </div>

          {/* Products */}
          <div className="flex-1">
            {/* Results Count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                {loading ? 'Loading...' : `${products.length} products found`}
              </p>
              
              {categorySlug && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCategoryFilter(null)}
                >
                  Clear Category Filter
                </Button>
              )}
            </div>

            {/* Loading State */}
            {loading && (
              <div className={`grid gap-6 ${viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
              }`}>
                {[...Array(8)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <Skeleton className="aspect-square w-full mb-4" />
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2 mb-2" />
                      <Skeleton className="h-6 w-1/4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Products Grid */}
            {!loading && products.length > 0 && (
              <div className={`grid gap-6 ${viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
              }`}>
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}

            {/* No Results */}
            {!loading && products.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search or filter criteria
                </p>
                <Button onClick={() => handleSearch('')}>
                  Clear Search
                </Button>
              </div>
            )}

            {/* Pagination */}
            {!loading && products.length > 0 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1}
                  >
                    Previous
                  </Button>
                  
                  <span className="text-sm text-muted-foreground px-4">
                    Page {page}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={products.length < (filters.limit || 20)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}