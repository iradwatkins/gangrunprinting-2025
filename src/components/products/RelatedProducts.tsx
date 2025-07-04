import { useState, useEffect } from 'react';
import { ArrowRight, Package, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductCard } from '@/components/products/ProductCard';
import { productsApi } from '@/api/products';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Product = Tables<'products'> & {
  product_categories?: Tables<'product_categories'>;
  vendors?: Tables<'vendors'>;
  product_images?: Tables<'product_images'>[];
};

interface RelatedProductsProps {
  product: Product;
  maxItems?: number;
}

export function RelatedProducts({ product, maxItems = 4 }: RelatedProductsProps) {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchRelatedProducts();
  }, [product.id]);

  const fetchRelatedProducts = async () => {
    setLoading(true);
    try {
      // Fetch products from the same category, excluding the current product
      const response = await productsApi.getProducts({
        category_id: product.category_id,
        limit: maxItems + 1, // Get one extra in case current product is included
        is_active: true
      });

      if (response.success) {
        // Filter out the current product and limit results
        const filtered = response.data
          .filter(p => p.id !== product.id)
          .slice(0, maxItems);
        
        setRelatedProducts(filtered);
      }
    } catch (error) {
      console.error('Failed to fetch related products:', error);
      toast({
        title: 'Error',
        description: 'Failed to load related products',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Related Products
          </CardTitle>
          <CardDescription>
            Similar products you might be interested in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: maxItems }).map((_, index) => (
              <div key={index} className="h-64 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (relatedProducts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Related Products
          </CardTitle>
          <CardDescription>
            Similar products you might be interested in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No related products found in this category.</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.href = '/products'}>
              Browse All Products
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Related Products
          </CardTitle>
          <CardDescription>
            Similar products you might be interested in
          </CardDescription>
        </div>
        
        {product.product_categories && (
          <Badge variant="outline" className="flex items-center">
            <Star className="h-3 w-3 mr-1" />
            {product.product_categories.name}
          </Badge>
        )}
      </CardHeader>

      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {relatedProducts.map((relatedProduct) => (
            <ProductCard
              key={relatedProduct.id}
              product={relatedProduct}
              compact
            />
          ))}
        </div>

        {relatedProducts.length >= maxItems && (
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              onClick={() => {
                const categoryParam = product.category_id ? `?category=${product.category_id}` : '';
                window.location.href = `/products${categoryParam}`;
              }}
            >
              View More Similar Products
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}