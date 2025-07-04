import { useState, useEffect } from 'react';
import { Calculator, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import type { Tables } from '@/integrations/supabase/types';

type Product = Tables<'products'>;

interface PriceCalculatorProps {
  product: Product;
  configuration: {
    paper_stock_id?: string;
    print_size_id?: string;
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
  const [isBroker, setIsBroker] = useState(false); // TODO: Get from auth context

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
      // TODO: This should call the actual pricing API
      // For now, we'll simulate the calculation
      
      const basePrice = product.base_price;
      const quantity = configuration.quantity;

      // Mock price calculation
      const paperCost = Math.random() * 5; // Paper stock cost per unit
      const sizeModifier = Math.random() * 2; // Size-based modifier
      const turnaroundModifier = Math.random() * 10; // Turnaround time modifier
      const addOnCosts = configuration.add_on_ids.length * Math.random() * 15; // Add-on costs

      const subtotal = (basePrice + paperCost + sizeModifier + turnaroundModifier + addOnCosts) * quantity;

      // Quantity discounts
      let quantityDiscountPercent = 0;
      if (quantity >= 1000) quantityDiscountPercent = 15;
      else if (quantity >= 500) quantityDiscountPercent = 10;
      else if (quantity >= 250) quantityDiscountPercent = 5;

      const quantityDiscount = subtotal * (quantityDiscountPercent / 100);

      // Broker discount (if applicable)
      const brokerDiscountPercent = isBroker ? 20 : 0;
      const afterQuantityDiscount = subtotal - quantityDiscount;
      const brokerDiscount = afterQuantityDiscount * (brokerDiscountPercent / 100);

      const finalTotal = afterQuantityDiscount - brokerDiscount;
      const perUnitPrice = finalTotal / quantity;
      const savings = subtotal - finalTotal;

      const breakdown: PriceBreakdown = {
        base_price: basePrice,
        paper_cost: paperCost,
        size_modifier: sizeModifier,
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
      console.error('Failed to calculate price:', error);
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