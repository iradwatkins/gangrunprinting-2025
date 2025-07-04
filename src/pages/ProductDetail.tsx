
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BreadcrumbNav } from '@/components/products/BreadcrumbNav';
import { ProductImageGallery } from '@/components/products/ProductImageGallery';
import { ProductConfiguration } from '@/components/products/ProductConfiguration';
import { PriceCalculator } from '@/components/products/PriceCalculator';
import { ProductSpecs } from '@/components/products/ProductSpecs';
import { ShoppingCart, Heart, Share2 } from 'lucide-react';

// Mock product data - in a real app, this would come from an API
const mockProduct = {
  id: 1,
  name: "Premium Business Cards",
  category: "Business Cards",
  basePrice: 39.99,
  description: "High-quality business cards printed on premium cardstock with your choice of finishes.",
  images: [
    "/placeholder.svg",
    "/placeholder.svg",
    "/placeholder.svg"
  ],
  inStock: true,
  rating: 4.8,
  reviewCount: 234
};

export default function ProductDetail() {
  const { id } = useParams();
  const [product] = useState(mockProduct);
  const [configuration, setConfiguration] = useState({
    quantity: 500,
    add_on_ids: []
  });

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: product.category, href: `/products?category=${product.category.toLowerCase()}` },
    { label: product.name, href: "#" }
  ];

  const handleAddToCart = () => {
    console.log('Adding to cart:', { product, configuration });
    // Add to cart logic here
  };

  const productSpecs = {
    'Paper Stock': '14pt Cardstock',
    'Finish': 'Matte',
    'Size': '3.5" x 2"',
    'Colors': 'Full Color (CMYK)',
    'Turnaround': '3-5 Business Days'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BreadcrumbNav />
        
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div>
            <ProductImageGallery />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              <div className="mt-2 flex items-center space-x-2">
                <Badge variant="outline">{product.category}</Badge>
                <span className="text-sm text-gray-500">★ {product.rating} ({product.reviewCount} reviews)</span>
              </div>
            </div>

            <p className="text-gray-600">{product.description}</p>

            {/* Configuration */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Configure Your Order</h3>
                <ProductConfiguration />
              </CardContent>
            </Card>

            {/* Price Calculator */}
            <Card>
              <CardContent className="p-6">
                <PriceCalculator />
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button 
                onClick={handleAddToCart}
                className="w-full"
                size="lg"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
              
              <div className="flex space-x-4">
                <Button variant="outline" className="flex-1">
                  <Heart className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" className="flex-1">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            <Separator />

            {/* Product Specifications */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Specifications</h3>
              <ProductSpecs />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
