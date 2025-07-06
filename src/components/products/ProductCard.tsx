import { Link } from 'react-router-dom';
import { Star, Package, ShoppingCart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { getProductImageUrls, getPlaceholderImages } from '@/utils/images';
import type { Tables } from '@/integrations/supabase/types';

type Product = Tables<'products'> & {
  product_categories?: { id: string; name: string; slug: string };
  vendors?: { id: string; name: string };
};

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
  compact?: boolean;
}

export function ProductCard({ product, viewMode = 'grid', compact = false }: ProductCardProps) {
  const isListView = viewMode === 'list';

  // Get product images with fallback
  const productImages = getProductImageUrls(product.images, product.name);
  const displayImages = productImages.length > 0 ? productImages : getPlaceholderImages(product.name);
  const primaryImage = displayImages[0];

  const ProductImage = () => (
    <div className={`bg-muted overflow-hidden ${
      isListView ? 'w-32 h-32' : 'aspect-square w-full'
    }`}>
      {primaryImage && !primaryImage.isPlaceholder ? (
        <img
          src={primaryImage.url}
          alt={primaryImage.alt}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            // Fallback to placeholder on error
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList.remove('hidden');
          }}
        />
      ) : null}
      <div className={`flex items-center justify-center w-full h-full ${primaryImage && !primaryImage.isPlaceholder ? 'hidden' : ''}`}>
        <Package className="h-8 w-8 text-muted-foreground" />
      </div>
    </div>
  );

  const ProductInfo = () => (
    <div className={`${compact ? 'space-y-2' : 'space-y-3'} ${isListView ? 'flex-1' : ''}`}>
      {/* Category Badge */}
      {product.product_categories && (
        <Badge variant="secondary" className="text-xs">
          {product.product_categories.name}
        </Badge>
      )}

      {/* Product Name */}
      <div>
        <h3 className={`font-semibold leading-tight line-clamp-2 ${compact ? 'text-base' : 'text-lg'}`}>
          {product.name}
        </h3>
        {product.vendors && (
          <p className="text-sm text-muted-foreground">
            by {product.vendors.name}
          </p>
        )}
      </div>

      {/* Description - hidden in compact mode */}
      {!compact && product.description && (
        <p className="text-sm text-muted-foreground line-clamp-2">
          {product.description}
        </p>
      )}

      {/* Rating (placeholder) - simplified in compact mode */}
      <div className="flex items-center space-x-1">
        <div className="flex items-center">
          {[...Array(compact ? 3 : 5)].map((_, i) => (
            <Star
              key={i}
              className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} ${
                i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <span className="text-sm text-muted-foreground">(4.0)</span>
      </div>

      {/* Pricing and Availability */}
      <div className="space-y-1">
        <div className="flex items-baseline space-x-2">
          <span className={`font-bold ${compact ? 'text-lg' : 'text-2xl'} ${!product.is_active ? 'text-muted-foreground' : ''}`}>
            ${product.base_price.toFixed(2)}
          </span>
          <span className="text-sm text-muted-foreground">starting at</span>
        </div>
        {!compact && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              Min qty: {product.minimum_quantity} • Multiple options available
            </p>
            {!product.is_active && (
              <Badge variant="secondary" className="text-xs">
                Currently Unavailable
              </Badge>
            )}
          </div>
        )}
        {compact && !product.is_active && (
          <Badge variant="secondary" className="text-xs">
            Unavailable
          </Badge>
        )}
      </div>

      {/* Features - hidden in compact mode */}
      {!compact && (
        <div className="space-y-1">
          <p className="text-xs font-medium">Features:</p>
          <ul className="text-xs text-muted-foreground space-y-0.5">
            <li>• Multiple paper options</li>
            <li>• Custom sizes available</li>
            <li>• Fast turnaround</li>
          </ul>
        </div>
      )}
    </div>
  );

  const ProductActions = () => (
    <div className={`${compact ? 'space-y-1' : 'space-y-2'} ${isListView ? 'w-40' : ''}`}>
      <Button 
        asChild={product.is_active} 
        disabled={!product.is_active}
        className={`w-full ${compact ? 'text-sm h-8' : ''}`}
      >
        {product.is_active ? (
          <Link to={`/products/${product.slug}`}>
            <ShoppingCart className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} mr-2`} />
            {compact ? 'View' : 'Configure'}
          </Link>
        ) : (
          <>
            <ShoppingCart className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} mr-2`} />
            {compact ? 'Unavailable' : 'Currently Unavailable'}
          </>
        )}
      </Button>
      {!compact && product.is_active && (
        <Button variant="outline" className="w-full">
          <Eye className="h-4 w-4 mr-2" />
          Quick View
        </Button>
      )}
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
    <Card className={`overflow-hidden hover:shadow-md transition-shadow group ${compact ? 'h-fit' : ''}`}>
      <Link to={`/products/${product.slug}`} className="block">
        <ProductImage />
      </Link>
      
      <CardContent className={compact ? 'p-3' : 'p-4'}>
        <ProductInfo />
      </CardContent>
      
      <CardFooter className={compact ? 'p-3 pt-0' : 'p-4 pt-0'}>
        <ProductActions />
      </CardFooter>
    </Card>
  );
}