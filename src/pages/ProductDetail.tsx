
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { BreadcrumbNav } from '@/components/products/BreadcrumbNav';
import { ProductImageGallery } from '@/components/products/ProductImageGallery';
import { ProductConfiguration } from '@/components/products/ProductConfiguration';
import { PriceCalculator } from '@/components/products/PriceCalculator';
import { ProductSpecs } from '@/components/products/ProductSpecs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Share2, ShoppingCart } from 'lucide-react';

export default function ProductDetail() {
  const { slug } = useParams();
  const [configuration, setConfiguration] = useState({
    add_on_ids: [],
    quantity: 1
  });

  // Mock product data - would come from API/database
  const product = {
    id: '1',
    name: 'Premium Business Cards',
    description: 'High-quality business cards with premium finishes',
    base_price: 39.99,
    images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    category: 'Business Cards',
    minimum_quantity: 50,
    is_active: true
  };

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: product.category, href: `/products/${product.category.toLowerCase().replace(' ', '-')}` },
    { label: product.name, href: '#' }
  ];

  const handleAddToCart = () => {
    console.log('Adding to cart:', { product, configuration });
  };

  const handleConfigurationChange = (newConfig: any) => {
    setConfiguration(newConfig);
  };

  const specifications = {
    'Paper Stock': '16pt C2S',
    'Finish': 'Matte',
    'Size': '3.5" x 2"',
    'Colors': '4/4 Full Color',
    'Turnaround': '3-5 Business Days'
  };

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
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary">{product.category}</Badge>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
              <p className="text-gray-600 mb-6">{product.description}</p>
            </div>

            {/* Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <ProductConfiguration 
                  onConfigurationChange={handleConfigurationChange}
                />
              </CardContent>
            </Card>

            {/* Price Calculator */}
            <PriceCalculator 
              basePrice={product.base_price}
              configuration={configuration}
            />

            {/* Add to Cart */}
            <div className="flex space-x-4">
              <Button onClick={handleAddToCart} className="flex-1">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
              <Button variant="outline">
                Get Quote
              </Button>
            </div>

            {/* Product Specifications */}
            <ProductSpecs specs={specifications} />
          </div>
        </div>
      </div>
    </div>
  );
}
