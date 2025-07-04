import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Package, Star, ShoppingCart } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Product = Tables<'products'> & {
  product_categories?: { name: string; slug: string };
  vendors?: { name: string };
};

interface ProductPreviewProps {
  product?: Partial<Product>;
  formData?: {
    name: string;
    description?: string;
    base_price: number;
    minimum_quantity: number;
    is_active: boolean;
  };
  categoryName?: string;
  vendorName?: string;
  imageUrl?: string;
}

export function ProductPreview({ 
  product, 
  formData, 
  categoryName, 
  vendorName, 
  imageUrl 
}: ProductPreviewProps) {
  // Use form data if provided, otherwise fall back to product data
  const displayData = formData ? {
    name: formData.name,
    description: formData.description,
    base_price: formData.base_price,
    minimum_quantity: formData.minimum_quantity,
    is_active: formData.is_active,
    product_categories: categoryName ? { name: categoryName, slug: '' } : undefined,
    vendors: vendorName ? { name: vendorName } : undefined,
  } : product;

  if (!displayData) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Product preview will appear here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Customer View Preview
      </div>
      
      {/* Product Card */}
      <Card className="overflow-hidden">
        {/* Product Image */}
        <div className="aspect-square bg-muted flex items-center justify-center">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={displayData.name || 'Product'} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center text-muted-foreground">
              <Package className="h-16 w-16 mx-auto mb-2" />
              <p className="text-sm">No image uploaded</p>
            </div>
          )}
        </div>

        <CardContent className="p-6 space-y-4">
          {/* Category Badge */}
          {displayData.product_categories && (
            <Badge variant="secondary" className="text-xs">
              {displayData.product_categories.name}
            </Badge>
          )}

          {/* Product Name */}
          <div>
            <h3 className="text-xl font-semibold leading-tight">
              {displayData.name || 'Product Name'}
            </h3>
            {displayData.vendors && (
              <p className="text-sm text-muted-foreground mt-1">
                by {displayData.vendors.name}
              </p>
            )}
          </div>

          {/* Description */}
          {displayData.description && (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {displayData.description}
            </p>
          )}

          <Separator />

          {/* Pricing */}
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold">
                ${displayData.base_price?.toFixed(2) || '0.00'}
              </span>
              <div className="flex items-center space-x-1 text-yellow-500">
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4 fill-current" />
                <Star className="h-4 w-4" />
                <span className="text-sm text-muted-foreground ml-2">4.0</span>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Starting price • Min qty: {displayData.minimum_quantity || 1}
            </p>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between">
            <Badge variant={displayData.is_active ? 'default' : 'secondary'}>
              {displayData.is_active ? 'Available' : 'Unavailable'}
            </Badge>
            
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Pricing from</p>
              <p className="text-sm font-medium">Multiple options available</p>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button className="w-full" disabled>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Configure & Add to Cart
            </Button>
            <Button variant="outline" className="w-full" disabled>
              Get Quote
            </Button>
          </div>

          {/* Features */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Features:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Multiple paper stock options</li>
              <li>• Various coating choices</li>
              <li>• Custom sizing available</li>
              <li>• Fast turnaround times</li>
              <li>• Professional finishing</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Mobile View</CardTitle>
          <CardDescription>
            How this product appears on mobile devices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-sm mx-auto border rounded-lg overflow-hidden">
            {/* Mobile Product Image */}
            <div className="aspect-square bg-muted flex items-center justify-center">
              {imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt={displayData.name || 'Product'} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            
            {/* Mobile Product Info */}
            <div className="p-4 space-y-3">
              <div>
                <h4 className="font-medium text-sm leading-tight">
                  {displayData.name || 'Product Name'}
                </h4>
                {displayData.product_categories && (
                  <p className="text-xs text-muted-foreground">
                    {displayData.product_categories.name}
                  </p>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-bold">
                  ${displayData.base_price?.toFixed(2) || '0.00'}
                </span>
                <Badge 
                  variant={displayData.is_active ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {displayData.is_active ? 'Available' : 'Unavailable'}
                </Badge>
              </div>
              
              <Button size="sm" className="w-full text-xs" disabled>
                Configure Product
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}