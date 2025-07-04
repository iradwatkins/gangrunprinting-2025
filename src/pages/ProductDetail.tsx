import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BreadcrumbNav } from '@/components/products/BreadcrumbNav';
import { ProductImageGallery } from '@/components/products/ProductImageGallery';
import { ProductConfiguration } from '@/components/products/ProductConfiguration';
import { ProductSpecs } from '@/components/products/ProductSpecs';
import { PriceCalculator } from '@/components/products/PriceCalculator';

type Product = {
  id: string;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  images: string[];
  specifications: {
    [key: string]: string;
  };
};

export default function ProductDetail() {
  const [selectedConfiguration, setSelectedConfiguration] = useState({});
  const [quantity, setQuantity] = useState(100);

  // Mock product data
  const product = {
    id: '1',
    name: 'Premium Business Cards',
    description: 'High-quality business cards printed on premium cardstock',
    category: 'Business Cards',
    basePrice: 49.99,
    images: [
      '/placeholder.svg',
      '/placeholder.svg',
      '/placeholder.svg'
    ],
    specifications: {
      'Paper Stock': '16pt Cardstock',
      'Finish': 'Matte or Gloss',
      'Size': '3.5" x 2"',
      'Colors': 'Full Color (CMYK)',
      'Turnaround': '3-5 Business Days'
    }
  };

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: product.category, href: `/products/${product.category.toLowerCase().replace(' ', '-')}` },
    { label: product.name, href: '#' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BreadcrumbNav items={breadcrumbItems} />
        
        <div className="grid lg:grid-cols-2 gap-8 mt-8">
          {/* Product Images */}
          <div>
            <ProductImageGallery images={product.images} />
          </div>
          
          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-2">
                {product.category}
              </Badge>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>
              <p className="text-lg text-gray-600">
                {product.description}
              </p>
            </div>

            <Separator />

            {/* Configuration */}
            <ProductConfiguration 
              onConfigurationChange={setSelectedConfiguration}
            />

            <Separator />

            {/* Price Calculator */}
            <PriceCalculator 
              basePrice={product.basePrice}
              configuration={selectedConfiguration}
              quantity={quantity}
              onQuantityChange={setQuantity}
            />

            <div className="flex space-x-4">
              <Button size="lg" className="flex-1">
                Add to Cart
              </Button>
              <Button size="lg" variant="outline">
                Get Quote
              </Button>
            </div>
          </div>
        </div>

        {/* Product Specifications */}
        <div className="mt-12">
          <ProductSpecs specifications={product.specifications} />
        </div>
      </div>
    </div>
  );
}
