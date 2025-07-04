import { Link } from 'react-router-dom';
import { Star, Package, ShoppingCart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import type { Tables } from '@/integrations/supabase/types';

type Product = Tables<'products'> & {
  product_categories?: { id: string; name: string; slug: string };
  vendors?: { id: string; name: string };
};

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

export function ProductCard({ product, viewMode = 'grid' }: ProductCardProps) {
  const isListView = viewMode === 'list';

  const ProductImage = () => (
    <div className={`bg-muted flex items-center justify-center ${
      isListView ? 'w-32 h-32' : 'aspect-square w-full'
    }`}>
      {/* TODO: Replace with actual product image when available */}
      <Package className="h-8 w-8 text-muted-foreground" />
    </div>
  );

  const ProductInfo = () => (
    <div className={`space-y-3 ${isListView ? 'flex-1' : ''}`}>
      {/* Category Badge */}
      {product.product_categories && (
        <Badge variant="secondary" className="text-xs">
          {product.product_categories.name}
        </Badge>
      )}

      {/* Product Name */}
      <div>
        <h3 className="font-semibold text-lg leading-tight line-clamp-2">
          {product.name}
        </h3>
        {product.vendors && (
          <p className="text-sm text-muted-foreground">
            by {product.vendors.name}
          </p>
        )}
      </div>

      {/* Description */}
      {product.description && (
        <p className="text-sm text-muted-foreground line-clamp-2">
          {product.description}
        </p>
      )}

      {/* Rating (placeholder) */}
      <div className="flex items-center space-x-1">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <span className="text-sm text-muted-foreground">(4.0)</span>
      </div>

      {/* Pricing */}
      <div className="space-y-1">
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold">
            ${product.base_price.toFixed(2)}
          </span>
          <span className="text-sm text-muted-foreground">starting at</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Min qty: {product.minimum_quantity} • Multiple options available
        </p>
      </div>

      {/* Features */}
      <div className="space-y-1">
        <p className="text-xs font-medium">Features:</p>
        <ul className="text-xs text-muted-foreground space-y-0.5">
          <li>• Multiple paper options</li>
          <li>• Custom sizes available</li>
          <li>• Fast turnaround</li>
        </ul>
      </div>
    </div>
  );

  const ProductActions = () => (
    <div className={`space-y-2 ${isListView ? 'w-40' : ''}`}>
      <Button asChild className="w-full">
        <Link to={`/products/${product.slug}`}>
          <ShoppingCart className="h-4 w-4 mr-2" />
          Configure
        </Link>
      </Button>
      <Button variant="outline" className="w-full">
        <Eye className="h-4 w-4 mr-2" />
        Quick View
      </Button>
    </div>
  );

  if (isListView) {
    return (
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex gap-6">
            <ProductImage />
            <ProductInfo />
            <ProductActions />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow group">
      <Link to={`/products/${product.slug}`} className="block">
        <ProductImage />
      </Link>
      
      <CardContent className="p-4">
        <ProductInfo />
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <ProductActions />
      </CardFooter>
    </Card>
  );
}