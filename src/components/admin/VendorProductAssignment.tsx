import { useState, useEffect } from 'react';
import { Search, Package, ArrowRight, ArrowLeft, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { vendorsApi } from '@/api/vendors';
import { productsApi } from '@/api/products';
import type { Tables } from '@/integrations/supabase/types';

type Vendor = Tables<'vendors'>;
type Product = Tables<'products'>;

interface VendorProductAssignmentProps {
  vendor: Vendor;
}

export function VendorProductAssignment({ vendor }: VendorProductAssignmentProps) {
  const [assignedProducts, setAssignedProducts] = useState<Product[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchAssigned, setSearchAssigned] = useState('');
  const [searchAvailable, setSearchAvailable] = useState('');
  const [selectedAssigned, setSelectedAssigned] = useState<Set<string>>(new Set());
  const [selectedAvailable, setSelectedAvailable] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadProductData();
  }, [vendor.id]);

  const loadProductData = async () => {
    setLoading(true);
    try {
      // Get assigned products
      const assignedResponse = await productsApi.getProducts({ vendor_id: vendor.id });
      if (assignedResponse.error) {
        toast({
          title: "Error",
          description: assignedResponse.error,
          variant: "destructive",
        });
      } else {
        setAssignedProducts(assignedResponse.data || []);
      }

      // Get all products without vendor
      const availableResponse = await productsApi.getProducts({ vendor_id: null });
      if (availableResponse.error) {
        toast({
          title: "Error",
          description: availableResponse.error,
          variant: "destructive",
        });
      } else {
        setAvailableProducts(availableResponse.data || []);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load product data",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleAssignProducts = async () => {
    if (selectedAvailable.size === 0) return;
    
    setSaving(true);
    const productIds = Array.from(selectedAvailable);
    const response = await vendorsApi.assignProductsToVendor(vendor.id, productIds);
    
    if (response.error) {
      toast({
        title: "Error",
        description: response.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `${productIds.length} products assigned to vendor`,
      });
      setSelectedAvailable(new Set());
      await loadProductData();
    }
    setSaving(false);
  };

  const handleUnassignProducts = async () => {
    if (selectedAssigned.size === 0) return;
    
    setSaving(true);
    const productIds = Array.from(selectedAssigned);
    const response = await vendorsApi.removeProductsFromVendor(productIds);
    
    if (response.error) {
      toast({
        title: "Error",
        description: response.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `${productIds.length} products removed from vendor`,
      });
      setSelectedAssigned(new Set());
      await loadProductData();
    }
    setSaving(false);
  };

  const toggleAssignedSelection = (productId: string) => {
    const newSelection = new Set(selectedAssigned);
    if (newSelection.has(productId)) {
      newSelection.delete(productId);
    } else {
      newSelection.add(productId);
    }
    setSelectedAssigned(newSelection);
  };

  const toggleAvailableSelection = (productId: string) => {
    const newSelection = new Set(selectedAvailable);
    if (newSelection.has(productId)) {
      newSelection.delete(productId);
    } else {
      newSelection.add(productId);
    }
    setSelectedAvailable(newSelection);
  };

  const filteredAssignedProducts = assignedProducts.filter(product =>
    product.name.toLowerCase().includes(searchAssigned.toLowerCase()) ||
    product.slug.toLowerCase().includes(searchAssigned.toLowerCase())
  );

  const filteredAvailableProducts = availableProducts.filter(product =>
    product.name.toLowerCase().includes(searchAvailable.toLowerCase()) ||
    product.slug.toLowerCase().includes(searchAvailable.toLowerCase())
  );

  const ProductCard = ({ 
    product, 
    isSelected, 
    onToggle 
  }: { 
    product: Product; 
    isSelected: boolean; 
    onToggle: () => void; 
  }) => (
    <div 
      className={`border rounded-lg p-3 cursor-pointer transition-colors ${
        isSelected ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={onToggle}
    >
      <div className="flex items-start gap-3">
        <Checkbox checked={isSelected} onCheckedChange={onToggle} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-gray-400" />
            <h4 className="text-sm font-medium truncate">{product.name}</h4>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{product.slug}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={product.is_active ? 'default' : 'secondary'} className="text-xs">
              {product.is_active ? 'Active' : 'Inactive'}
            </Badge>
            {product.price && (
              <Badge variant="outline" className="text-xs">
                ${product.price}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3].map((j) => (
                    <Skeleton key={j} className="h-16 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold">Product Assignment for {vendor.name}</h3>
        <p className="text-sm text-muted-foreground">
          Manage which products are assigned to this vendor
        </p>
      </div>

      {/* Assignment Actions */}
      <div className="flex items-center justify-center gap-4">
        <Button
          onClick={handleUnassignProducts}
          disabled={selectedAssigned.size === 0 || saving}
          variant="outline"
          size="sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Remove ({selectedAssigned.size})
        </Button>
        
        <div className="text-xs text-muted-foreground">
          Select products and use arrows to assign/remove
        </div>
        
        <Button
          onClick={handleAssignProducts}
          disabled={selectedAvailable.size === 0 || saving}
          size="sm"
        >
          <ArrowRight className="h-4 w-4 mr-2" />
          Assign ({selectedAvailable.size})
        </Button>
      </div>

      {/* Product Lists */}
      <div className="grid grid-cols-2 gap-6">
        {/* Assigned Products */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              Assigned Products ({filteredAssignedProducts.length})
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search assigned products..."
                className="pl-10"
                value={searchAssigned}
                onChange={(e) => setSearchAssigned(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredAssignedProducts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchAssigned ? 'No matching products found' : 'No products assigned'}
                </div>
              ) : (
                filteredAssignedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isSelected={selectedAssigned.has(product.id)}
                    onToggle={() => toggleAssignedSelection(product.id)}
                  />
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Available Products */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <X className="h-4 w-4 text-gray-400" />
              Available Products ({filteredAvailableProducts.length})
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search available products..."
                className="pl-10"
                value={searchAvailable}
                onChange={(e) => setSearchAvailable(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredAvailableProducts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchAvailable ? 'No matching products found' : 'No unassigned products available'}
                </div>
              ) : (
                filteredAvailableProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isSelected={selectedAvailable.has(product.id)}
                    onToggle={() => toggleAvailableSelection(product.id)}
                  />
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedAssigned(new Set(assignedProducts.map(p => p.id)))}
              disabled={assignedProducts.length === 0}
            >
              Select All Assigned
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedAssigned(new Set())}
              disabled={selectedAssigned.size === 0}
            >
              Clear Assigned Selection
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedAvailable(new Set(availableProducts.map(p => p.id)))}
              disabled={availableProducts.length === 0}
            >
              Select All Available
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedAvailable(new Set())}
              disabled={selectedAvailable.size === 0}
            >
              Clear Available Selection
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}