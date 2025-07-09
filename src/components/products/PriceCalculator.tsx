import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Calculator, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
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

interface PriceCalculatorProps {
  product: Product;
  configuration: {
    paper_stock_id?: string;
    print_size_id?: string;
    coating_id?: string;
    turnaround_time_id?: string;
    add_on_ids: string[];
    quantity: number;
    notes?: string;
  };
}

interface PriceBreakdown {
  base_price: number;
  paper_cost: number;
  size_modifier: number;
  coating_modifier: number;
  turnaround_modifier: number;
  add_on_costs: number;
  subtotal: number;
  quantity_discount: number;
  broker_discount: number;
  final_total: number;
  per_unit_price: number;
  savings: number;
}

export function PriceCalculator({ product, configuration }: PriceCalculatorProps) {
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const isBroker = user?.profile?.is_broker || false;

  // Load coating data for price calculation
  const { data: selectedCoating } = useQuery({
    queryKey: ['coating', configuration.coating_id],
    queryFn: async () => {
      if (!configuration.coating_id) return null;
      
      const { data, error } = await supabase
        .from('coatings')
        .select('*')
        .eq('id', configuration.coating_id)
        .single();

      if (error) {
        return null;
      }

      return data;
    },
    enabled: !!configuration.coating_id
  });

  useEffect(() => {
    calculatePrice();
  }, [configuration, product]);

  const calculatePrice = async () => {
    if (!configuration.paper_stock_id || !configuration.print_size_id || !configuration.turnaround_time_id) {
      setPriceBreakdown(null);
      return;
    }

    setLoading(true);

    try {
      const basePrice = product.base_price || 0;
      const quantity = configuration.quantity;

      // Calculate paper stock cost
      const selectedPaperStock = product.product_paper_stocks?.find(
        ps => ps.paper_stocks.id === configuration.paper_stock_id
      );
      const paperCostPerSqInch = selectedPaperStock?.paper_stocks.price_per_sq_inch || 0;
      const paperOverride = selectedPaperStock?.price_override;
      
      // Calculate print size modifier  
      const selectedPrintSize = product.product_print_sizes?.find(
        ps => ps.print_sizes.id === configuration.print_size_id
      );
      const sizeArea = selectedPrintSize ? 
        (selectedPrintSize.print_sizes.width || 0) * (selectedPrintSize.print_sizes.height || 0) : 1;
      
      // Apply price modifier from junction table (percentage-based)
      const priceModifierPercent = selectedPrintSize?.price_modifier || 0;
      const sizeModifier = basePrice * (priceModifierPercent / 100);
      
      // Paper cost calculation (price per square inch * area)
      const paperCost = paperOverride !== null ? 
        paperOverride : 
        (paperCostPerSqInch * sizeArea);

      // Calculate coating modifier
      const coatingModifierPercent = selectedCoating?.price_modifier || 0;
      const coatingModifier = basePrice * (coatingModifierPercent / 100);

      // Calculate turnaround time modifier
      const selectedTurnaround = product.product_turnaround_times?.find(
        tt => tt.turnaround_times.id === configuration.turnaround_time_id
      );
      const turnaroundMarkup = selectedTurnaround?.turnaround_times.price_markup_percent || 0;
      const turnaroundOverride = selectedTurnaround?.price_override;
      
      // Turnaround modifier calculation
      const turnaroundModifier = turnaroundOverride !== null ?
        turnaroundOverride :
        (basePrice * (turnaroundMarkup / 100));

      // Calculate add-on costs
      let addOnCosts = 0;
      if (configuration.add_on_ids.length > 0) {
        addOnCosts = configuration.add_on_ids.reduce((total, addOnId) => {
          const addOnOption = product.product_add_ons?.find(
            ao => ao.add_ons.id === addOnId
          );
          if (addOnOption) {
            // Check for price override first
            if (addOnOption.price_override !== null) {
              return total + (addOnOption.price_override || 0);
            }
            
            // Parse pricing from configuration JSONB
            const pricingConfig = addOnOption.add_ons.configuration;
            if (pricingConfig && typeof pricingConfig === 'object') {
              const pricing = (pricingConfig as any).pricing || 0;
              return total + pricing;
            }
          }
          return total;
        }, 0);
      }

      // Calculate unit cost before quantity discounts
      const unitCost = basePrice + paperCost + sizeModifier + coatingModifier + turnaroundModifier + addOnCosts;
      const subtotal = unitCost * quantity;

      // Apply quantity discounts
      let quantityDiscountPercent = 0;
      if (quantity >= 1000) quantityDiscountPercent = 15;
      else if (quantity >= 500) quantityDiscountPercent = 10;
      else if (quantity >= 250) quantityDiscountPercent = 5;

      const quantityDiscount = subtotal * (quantityDiscountPercent / 100);

      // Apply broker discount (if applicable)
      let brokerDiscountPercent = 0;
      if (isBroker && user?.profile?.broker_category_discounts && product.product_categories?.slug) {
        const categoryKey = product.product_categories.slug.toLowerCase().replace(/-/g, '_');
        brokerDiscountPercent = user.profile.broker_category_discounts[categoryKey] || 0;
      }
      
      const afterQuantityDiscount = subtotal - quantityDiscount;
      const brokerDiscount = afterQuantityDiscount * (brokerDiscountPercent / 100);

      const finalTotal = afterQuantityDiscount - brokerDiscount;
      const perUnitPrice = finalTotal / quantity;
      const savings = subtotal - finalTotal;

      const breakdown: PriceBreakdown = {
        base_price: basePrice,
        paper_cost: paperCost,
        size_modifier: sizeModifier,
        coating_modifier: coatingModifier,
        turnaround_modifier: turnaroundModifier,
        add_on_costs: addOnCosts,
        subtotal,
        quantity_discount: quantityDiscount,
        broker_discount: brokerDiscount,
        final_total: finalTotal,
        per_unit_price: perUnitPrice,
        savings
      };

      setPriceBreakdown(breakdown);
    } catch (error) {
      setPriceBreakdown(null);
    }

    setLoading(false);
  };

  if (!priceBreakdown) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="h-5 w-5 mr-2" />
            Price Calculator
          </CardTitle>
          <CardDescription>
            Complete your configuration to see pricing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Calculator className="h-8 w-8 mx-auto mb-2" />
            <p>Select all options to calculate price</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const quantityTiers = [
    { min: 1, max: 249, discount: 0, label: 'Standard' },
    { min: 250, max: 499, discount: 5, label: 'Small Bulk' },
    { min: 500, max: 999, discount: 10, label: 'Medium Bulk' },
    { min: 1000, max: Infinity, discount: 15, label: 'Large Bulk' }
  ];

  const currentTier = quantityTiers.find(
    tier => configuration.quantity >= tier.min && configuration.quantity <= tier.max
  );

  const nextTier = quantityTiers.find(
    tier => tier.min > configuration.quantity
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Calculator className="h-5 w-5 mr-2" />
            Price Calculator
          </span>
          {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />}
        </CardTitle>
        <CardDescription>
          Real-time pricing based on your configuration
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Main Price Display */}
        <div className="text-center space-y-2">
          <div className="text-3xl font-bold">
            ${priceBreakdown.final_total.toFixed(2)}
          </div>
          <div className="text-sm text-muted-foreground">
            ${priceBreakdown.per_unit_price.toFixed(2)} per unit
          </div>
          {priceBreakdown.savings > 0 && (
            <Badge variant="secondary" className="text-green-600">
              <TrendingDown className="h-3 w-3 mr-1" />
              Save ${priceBreakdown.savings.toFixed(2)}
            </Badge>
          )}
        </div>

        <Separator />

        {/* Price Breakdown */}
        <div className="space-y-3">
          <h4 className="font-medium">Price Breakdown</h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Base price (×{configuration.quantity})</span>
              <span>${(priceBreakdown.base_price * configuration.quantity).toFixed(2)}</span>
            </div>
            
            {priceBreakdown.paper_cost > 0 && (
              <div className="flex justify-between">
                <span>Paper stock</span>
                <span>+${(priceBreakdown.paper_cost * configuration.quantity).toFixed(2)}</span>
              </div>
            )}
            
            {priceBreakdown.size_modifier > 0 && (
              <div className="flex justify-between">
                <span>Size modifier</span>
                <span>+${(priceBreakdown.size_modifier * configuration.quantity).toFixed(2)}</span>
              </div>
            )}
            
            {priceBreakdown.coating_modifier > 0 && (
              <div className="flex justify-between">
                <span>Coating</span>
                <span>+${(priceBreakdown.coating_modifier * configuration.quantity).toFixed(2)}</span>
              </div>
            )}
            
            {priceBreakdown.turnaround_modifier > 0 && (
              <div className="flex justify-between">
                <span>Turnaround time</span>
                <span>+${(priceBreakdown.turnaround_modifier * configuration.quantity).toFixed(2)}</span>
              </div>
            )}
            
            {priceBreakdown.add_on_costs > 0 && (
              <div className="flex justify-between">
                <span>Add-ons</span>
                <span>+${(priceBreakdown.add_on_costs * configuration.quantity).toFixed(2)}</span>
              </div>
            )}
            
            <Separator />
            
            <div className="flex justify-between font-medium">
              <span>Subtotal</span>
              <span>${priceBreakdown.subtotal.toFixed(2)}</span>
            </div>
            
            {priceBreakdown.quantity_discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Quantity discount ({currentTier?.discount}%)</span>
                <span>-${priceBreakdown.quantity_discount.toFixed(2)}</span>
              </div>
            )}
            
            {priceBreakdown.broker_discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Broker discount (20%)</span>
                <span>-${priceBreakdown.broker_discount.toFixed(2)}</span>
              </div>
            )}
            
            <Separator />
            
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>${priceBreakdown.final_total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Quantity Tiers */}
        <div className="space-y-3">
          <h4 className="font-medium">Quantity Discounts</h4>
          
          <div className="space-y-2">
            {quantityTiers.map((tier, index) => {
              const isActive = tier === currentTier;
              const isReached = configuration.quantity >= tier.min;
              
              return (
                <div
                  key={index}
                  className={`flex items-center justify-between p-2 rounded text-sm ${
                    isActive ? 'bg-primary/10 border border-primary/20' : 'bg-muted/50'
                  }`}
                >
                  <span className={isActive ? 'font-medium' : ''}>
                    {tier.min === 1 ? '1' : tier.min.toLocaleString()}
                    {tier.max === Infinity ? '+' : ` - ${tier.max.toLocaleString()}`} units
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className={`${isActive ? 'font-medium' : ''} ${tier.discount > 0 ? 'text-green-600' : ''}`}>
                      {tier.discount > 0 ? `-${tier.discount}%` : 'No discount'}
                    </span>
                    {isActive && <Badge variant="secondary" className="text-xs">Current</Badge>}
                  </div>
                </div>
              );
            })}
          </div>

          {nextTier && (
            <Alert>
              <TrendingUp className="h-4 w-4" />
              <AlertDescription>
                Order {nextTier.min - configuration.quantity} more units to get {nextTier.discount}% discount
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Broker Benefits */}
        {!isBroker && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Become a broker</strong> to get 20% discount on all orders.
              <Button variant="link" className="h-auto p-0 ml-1">
                Learn more
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Price Lock */}
        <div className="text-xs text-muted-foreground text-center">
          Prices are locked for 24 hours after adding to cart
        </div>
      </CardContent>
    </Card>
  );
}