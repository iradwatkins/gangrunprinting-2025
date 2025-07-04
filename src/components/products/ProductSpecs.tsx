import { Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { Tables } from '@/integrations/supabase/types';

type Product = Tables<'products'> & {
  product_categories?: Tables<'product_categories'>;
  vendors?: Tables<'vendors'>;
};

interface ProductSpecsProps {
  product: Product;
}

export function ProductSpecs({ product }: ProductSpecsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Package className="h-5 w-5 mr-2" />
          Product Specifications
        </CardTitle>
        <CardDescription>
          Detailed specifications and technical information
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div>
          <h4 className="font-medium mb-3">Basic Information</h4>
          <div className="grid gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Product Name:</span>
              <span className="font-medium">{product.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Category:</span>
              <span>{product.product_categories?.name || 'Uncategorized'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vendor:</span>
              <span>{product.vendors?.name || 'Unknown'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Base Price:</span>
              <span className="font-medium">${product.base_price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Minimum Quantity:</span>
              <span>{product.minimum_quantity} units</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <Badge variant={product.is_active ? 'default' : 'secondary'}>
                {product.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </div>

        <Separator />

        {/* Technical Specifications */}
        <div>
          <h4 className="font-medium mb-3">Technical Specifications</h4>
          <div className="space-y-4">
            {/* Paper Options */}
            <div>
              <h5 className="text-sm font-medium mb-2">Available Paper Stocks</h5>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Standard White:</span>
                  <span>80gsm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Premium Matte:</span>
                  <span>120gsm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Glossy Photo:</span>
                  <span>200gsm</span>
                </div>
              </div>
            </div>

            {/* Size Options */}
            <div>
              <h5 className="text-sm font-medium mb-2">Available Sizes</h5>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Standard:</span>
                  <span>3.5" × 2.0"</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Large:</span>
                  <span>4.0" × 2.5"</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Custom:</span>
                  <span>Contact for quote</span>
                </div>
              </div>
            </div>

            {/* Finishing Options */}
            <div>
              <h5 className="text-sm font-medium mb-2">Finishing Options</h5>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Matte Lamination:</span>
                  <span>Available</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gloss Lamination:</span>
                  <span>Available</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">UV Coating:</span>
                  <span>Available</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Production Information */}
        <div>
          <h4 className="font-medium mb-3">Production Information</h4>
          <div className="grid gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Standard Turnaround:</span>
              <span>5 business days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rush Available:</span>
              <span>1-2 business days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Print Method:</span>
              <span>Digital/Offset</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Quality Check:</span>
              <span>Included</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* File Requirements */}
        <div>
          <h4 className="font-medium mb-3">File Requirements</h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Accepted Formats:</span>
              <div className="mt-1 text-muted-foreground">
                PDF, AI, EPS, PNG, JPG (300 DPI minimum)
              </div>
            </div>
            <div>
              <span className="font-medium">Color Mode:</span>
              <div className="mt-1 text-muted-foreground">
                CMYK preferred, RGB accepted
              </div>
            </div>
            <div>
              <span className="font-medium">Bleed:</span>
              <div className="mt-1 text-muted-foreground">
                0.125" bleed on all sides required
              </div>
            </div>
            <div>
              <span className="font-medium">Maximum File Size:</span>
              <div className="mt-1 text-muted-foreground">
                100MB per file
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Quality Guarantees */}
        <div>
          <h4 className="font-medium mb-3">Quality Guarantees</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div>• 100% satisfaction guarantee</div>
            <div>• Color accuracy verification</div>
            <div>• Quality control inspection</div>
            <div>• Reprint policy for defects</div>
            <div>• Professional customer support</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}