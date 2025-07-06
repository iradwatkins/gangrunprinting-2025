
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { BreadcrumbNav } from '@/components/products/BreadcrumbNav';
import { ProductImageGallery } from '@/components/products/ProductImageGallery';
import { ProductConfiguration } from '@/components/products/ProductConfiguration';
import { PriceCalculator } from '@/components/products/PriceCalculator';
import { ProductSpecs } from '@/components/products/ProductSpecs';
import { AuthModal } from '@/components/auth/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { useProduct } from '@/hooks/useProduct';
import { ShoppingCart, Heart, Share2, User, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductDetail() {
  const { slug } = useParams();
  const { user, isLoading } = useAuth();
  const { product, loading: productLoading, error: productError } = useProduct(slug || '');
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Loading or error states
  if (productLoading) {
    return <ProductDetailSkeleton />;
  }

  if (productError || !product) {
    return <ProductDetailError error={productError} />;
  }

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: product.product_categories?.name || "Products", href: `/products?category=${product.product_categories?.slug || ''}` },
    { label: product.name, href: "#" }
  ];

  const handleAddToCart = () => {
    if (!user) {
      setAuthModalOpen(true);
      toast.info('Please sign in to add items to your cart');
      return;
    }

    toast.info('Please use the configuration panel to add items to your cart');
  };

  const handleSaveProduct = () => {
    if (!user) {
      setAuthModalOpen(true);
      toast.info('Please sign in to save products');
      return;
    }
    
    toast.success('Product saved to your favorites!');
    // Save to favorites logic here
  };

  const getBrokerDiscount = () => {
    if (user?.profile?.is_broker && user.profile.broker_category_discounts && product.product_categories?.slug) {
      const categoryKey = product.product_categories.slug.toLowerCase().replace(/-/g, '_');
      return user.profile.broker_category_discounts[categoryKey] || 0;
    }
    return 0;
  };

  const getDiscountedPrice = () => {
    const discount = getBrokerDiscount();
    if (discount > 0) {
      return (product.base_price || 0) * (1 - discount / 100);
    }
    return product.base_price || 0;
  };

  // Dynamic product specs based on real data
  const getProductSpecs = () => {
    const specs: Record<string, string> = {};
    
    if (product.product_paper_stocks && product.product_paper_stocks.length > 0) {
      const defaultPaper = product.product_paper_stocks.find(ps => ps.is_default) || product.product_paper_stocks[0];
      if (defaultPaper?.paper_stocks) {
        specs['Paper Stock'] = `${defaultPaper.paper_stocks.weight}pt ${defaultPaper.paper_stocks.name}`;
      }
    }
    
    if (product.product_print_sizes && product.product_print_sizes.length > 0) {
      const defaultSize = product.product_print_sizes.find(ps => ps.is_default) || product.product_print_sizes[0];
      if (defaultSize?.print_sizes) {
        specs['Size'] = `${defaultSize.print_sizes.width}" x ${defaultSize.print_sizes.height}"`;
      }
    }
    
    if (product.product_turnaround_times && product.product_turnaround_times.length > 0) {
      const defaultTurnaround = product.product_turnaround_times.find(tt => tt.is_default) || product.product_turnaround_times[0];
      if (defaultTurnaround?.turnaround_times) {
        specs['Turnaround'] = `${defaultTurnaround.turnaround_times.business_days} Business Days`;
      }
    }
    
    specs['Colors'] = 'Full Color (CMYK)';
    
    return specs;
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
                <Badge variant="outline">{product.product_categories?.name || 'Product'}</Badge>
                {product.vendors?.name && (
                  <Badge variant="secondary">{product.vendors.name}</Badge>
                )}
                {user?.profile?.is_broker && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Broker Pricing
                  </Badge>
                )}
              </div>
              
              {/* Pricing Information */}
              <div className="mt-4">
                <div className="flex items-center space-x-3">
                  {getBrokerDiscount() > 0 ? (
                    <>
                      <span className="text-2xl font-bold text-green-600">
                        ${getDiscountedPrice().toFixed(2)}
                      </span>
                      <span className="text-lg text-gray-500 line-through">
                        ${(product.base_price || 0).toFixed(2)}
                      </span>
                      <Badge variant="destructive">
                        {getBrokerDiscount()}% off
                      </Badge>
                    </>
                  ) : (
                    <span className="text-2xl font-bold text-gray-900">
                      Starting at ${(product.base_price || 0).toFixed(2)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {user?.profile?.is_broker 
                    ? 'Broker discounted pricing applied' 
                    : 'Pricing varies by quantity and options'
                  }
                </p>
              </div>
            </div>

            <p className="text-gray-600">{product.description || 'No description available.'}</p>

            {/* Configuration */}
            <ProductConfiguration product={product} />

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
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={handleSaveProduct}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  {user ? 'Save' : 'Sign in to Save'}
                </Button>
                <Button variant="outline" className="flex-1">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
              
              {!user && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-900">Sign in for better pricing</span>
                  </div>
                  <p className="text-sm text-blue-700 mb-3">
                    Create an account to access bulk discounts, save favorites, and track orders.
                  </p>
                  <Button 
                    onClick={() => setAuthModalOpen(true)}
                    className="w-full"
                    variant="outline"
                  >
                    Sign In or Register
                  </Button>
                </div>
              )}
            </div>

            <Separator />

            {/* Product Specifications */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Specifications</h3>
              <ProductSpecs product={product} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Authentication Modal */}
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  );
}

// Loading skeleton component
function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-4 mb-8">
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image skeleton */}
          <div>
            <Skeleton className="w-full h-96 rounded-lg" />
          </div>

          {/* Product info skeleton */}
          <div className="space-y-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <div className="flex items-center space-x-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-4 w-60" />
              </div>
            </div>
            
            <Skeleton className="h-20 w-full" />
            
            <div className="space-y-4">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Error component
function ProductDetailError({ error }: { error: string | null }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-6">
            {error || 'The product you are looking for could not be found.'}
          </p>
          <Button onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
