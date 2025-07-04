import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Star, Package, Share2, Heart, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { BreadcrumbNav } from '@/components/products/BreadcrumbNav';
import { ProductImageGallery } from '@/components/products/ProductImageGallery';
import { ProductConfiguration } from '@/components/products/ProductConfiguration';
import { ProductSpecs } from '@/components/products/ProductSpecs';
import { RelatedProducts } from '@/components/products/RelatedProducts';
import { useToast } from '@/hooks/use-toast';
import { productsApi } from '@/api/products';
import type { Tables } from '@/integrations/supabase/types';

type Product = Tables<'products'> & {
  product_categories?: Tables<'product_categories'>;
  vendors?: Tables<'vendors'>;
  product_paper_stocks?: Array<{
    paper_stocks: Tables<'paper_stocks'>;
    is_default: boolean;
    price_override?: number;
  }>;
  product_print_sizes?: Array<{
    print_sizes: Tables<'print_sizes'>;
    is_default: boolean;
    price_modifier?: number;
  }>;
  product_turnaround_times?: Array<{
    turnaround_times: Tables<'turnaround_times'>;
    is_default: boolean;
    price_override?: number;
  }>;
  product_add_ons?: Array<{
    add_ons: Tables<'add_ons'>;
    is_mandatory: boolean;
    price_override?: any;
  }>;
};

export function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('configure');
  const { toast } = useToast();

  useEffect(() => {
    if (slug) {
      loadProduct(slug);
    }
  }, [slug]);

  const loadProduct = async (productSlug: string) => {
    setLoading(true);
    
    // First get product by slug - we'll need to add this to the API
    // For now, we'll get all products and find by slug
    const response = await productsApi.getProducts({ search: productSlug, limit: 1 });
    
    if (response.error) {
      toast({
        title: 'Error',
        description: response.error,
        variant: 'destructive'
      });
    } else if (response.data && response.data.length > 0) {
      const productData = response.data.find(p => p.slug === productSlug);
      if (productData) {
        // Get full product details
        const detailResponse = await productsApi.getProduct(productData.id);
        if (detailResponse.data) {
          setProduct(detailResponse.data as Product);
        }
      }
    }
    
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <Skeleton className="h-6 w-96 mb-6" />
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            <Skeleton className="aspect-square w-full" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-6 w-32" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The product you're looking for doesn't exist.
          </p>
          <Button asChild>
            <a href="/products">Browse Products</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <BreadcrumbNav 
            category={product.product_categories}
            product={{ name: product.name, slug: product.slug }}
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Product Overview */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Product Images */}
          <div>
            <ProductImageGallery images={[]} />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category & Vendor */}
            <div className="flex items-center gap-2">
              {product.product_categories && (
                <Badge variant="secondary">
                  {product.product_categories.name}
                </Badge>
              )}
              {product.vendors && (
                <span className="text-sm text-muted-foreground">
                  by {product.vendors.name}
                </span>
              )}
            </div>

            {/* Product Name */}
            <div>
              <h1 className="text-3xl font-bold leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">(4.0) · 127 reviews</span>
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Pricing */}
            <div className="space-y-2">
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold">
                  ${product.base_price.toFixed(2)}
                </span>
                <span className="text-lg text-muted-foreground">starting at</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Price varies by configuration • Min qty: {product.minimum_quantity}
              </p>
            </div>

            {/* Key Features */}
            <div className="space-y-3">
              <h3 className="font-semibold">Key Features:</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Professional quality printing</li>
                <li>• Multiple paper and coating options</li>
                <li>• Custom sizing available</li>
                <li>• Fast turnaround times</li>
                <li>• Bulk pricing discounts</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={() => setSelectedTab('configure')}
                className="flex-1"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Configure Product
              </Button>
              <Button variant="outline" size="icon">
                <Heart className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <div className="font-semibold">✓ Quality Guaranteed</div>
                <div className="text-muted-foreground">100% satisfaction</div>
              </div>
              <div>
                <div className="font-semibold">✓ Fast Shipping</div>
                <div className="text-muted-foreground">1-5 business days</div>
              </div>
              <div>
                <div className="font-semibold">✓ Expert Support</div>
                <div className="text-muted-foreground">Design assistance</div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="configure">Configure</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="related">Related</TabsTrigger>
          </TabsList>

          <TabsContent value="configure" className="mt-6">
            <ProductConfiguration product={product} />
          </TabsContent>

          <TabsContent value="specifications" className="mt-6">
            <ProductSpecs product={product} />
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Reviews</CardTitle>
                <CardDescription>
                  See what customers are saying about this product
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Reviews feature coming soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="related" className="mt-6">
            <RelatedProducts categoryId={product.category_id} currentProductId={product.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}