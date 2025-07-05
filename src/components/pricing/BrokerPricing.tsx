import { useState, useEffect } from 'react';
import { usePricing, usePriceCalculator } from '@/hooks/usePricing';
import { useBroker } from '@/hooks/useBroker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingDown, 
  Calculator, 
  Crown, 
  Target,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface BrokerPricingProps {
  categoryId: string;
  productId: string;
  basePrice: number;
  quantity: number;
  onQuantityChange?: (quantity: number) => void;
  rushOrder?: boolean;
  showVolumeBreakdown?: boolean;
}

export function BrokerPricing({
  categoryId,
  productId,
  basePrice,
  quantity,
  onQuantityChange,
  rushOrder = false,
  showVolumeBreakdown = true
}: BrokerPricingProps) {
  const { brokerStatus, brokerProfile } = useBroker();
  const { currentPricing, isCalculating, updatePrice } = usePriceCalculator(
    categoryId,
    productId,
    basePrice
  );
  const { formatCurrency, formatPercentage } = usePricing();
  const [showBreakdown, setShowBreakdown] = useState(false);

  useEffect(() => {
    updatePrice(quantity, rushOrder);
  }, [quantity, rushOrder, categoryId, productId, basePrice]);

  if (isCalculating) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-600">Calculating price...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentPricing) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-600">Unable to calculate pricing</p>
        </CardContent>
      </Card>
    );
  }

  const { pricing, is_broker, broker_tier } = currentPricing;
  const totalBasePrice = basePrice * quantity;

  return (
    <div className="space-y-4">
      {/* Main Pricing Display */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Calculator className="h-5 w-5 mr-2" />
              Your Price
            </CardTitle>
            {is_broker && (
              <Badge variant="default" className="bg-yellow-500">
                <Crown className="h-3 w-3 mr-1" />
                {broker_tier} Tier
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Price Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(pricing.final_price)}
                </div>
                <div className="text-sm text-gray-600">Your Price</div>
                <div className="text-xs text-gray-500">
                  {formatCurrency(pricing.final_price / quantity)} per unit
                </div>
              </div>
              
              {pricing.savings > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    -{formatCurrency(pricing.savings)}
                  </div>
                  <div className="text-sm text-gray-600">You Save</div>
                  <div className="text-xs text-gray-500">
                    {formatPercentage((pricing.savings / totalBasePrice) * 100)} off
                  </div>
                </div>
              )}
            </div>

            {/* Rush Order Notice */}
            {rushOrder && pricing.rush_surcharge > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="flex items-center">
                  <Info className="h-4 w-4 text-orange-600 mr-2" />
                  <span className="text-sm text-orange-800">
                    Rush order surcharge: {formatCurrency(pricing.rush_surcharge)}
                    {is_broker && brokerProfile && (
                      <span className="ml-1">
                        ({formatPercentage(15 - brokerProfile.broker_tier.rush_order_discount)} instead of 15%)
                      </span>
                    )}
                  </span>
                </div>
              </div>
            )}

            {/* Broker Benefits */}
            {is_broker && brokerProfile && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Crown className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-900">
                      {brokerProfile.broker_tier.display_name} Broker Benefits Applied
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBreakdown(!showBreakdown)}
                  >
                    {showBreakdown ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
                
                {showBreakdown && (
                  <div className="mt-3 space-y-2">
                    {pricing.discount_breakdown.map((discount, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">{discount.description}</span>
                        <span className="font-medium text-green-600">
                          -{formatCurrency(discount.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Not a Broker CTA */}
            {!is_broker && (
              <BrokerCTA 
                basePrice={totalBasePrice}
                quantity={quantity}
                currentPrice={pricing.final_price}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Volume Pricing Breakdown */}
      {showVolumeBreakdown && (
        <VolumePricingCard
          categoryId={categoryId}
          productId={productId}
          basePrice={basePrice}
          currentQuantity={quantity}
          onQuantityChange={onQuantityChange}
          isBroker={is_broker}
        />
      )}
    </div>
  );
}

function BrokerCTA({ 
  basePrice, 
  quantity, 
  currentPrice 
}: { 
  basePrice: number; 
  quantity: number; 
  currentPrice: number; 
}) {
  const { formatCurrency, formatPercentage, calculatePotentialSavings } = usePricing();
  
  // Estimate Silver tier savings
  const silverTier = {
    id: 'silver',
    name: 'silver' as const,
    display_name: 'Silver',
    minimum_annual_volume: 50000,
    base_discount_percentage: 10,
    benefits: [],
    payment_terms_days: 30,
    rush_order_discount: 5,
    free_shipping_threshold: 300
  };

  const potentialSavings = calculatePotentialSavings(basePrice / quantity, quantity, silverTier);

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <Crown className="h-5 w-5 text-blue-600 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-blue-900">
            Become a Broker and Save More
          </h3>
          <p className="text-sm text-blue-700 mt-1">
            With Silver tier status, this order would cost only{' '}
            <span className="font-bold">
              {formatCurrency(currentPrice - potentialSavings)}
            </span>
            {' '}— saving you {formatCurrency(potentialSavings)} 
            ({formatPercentage((potentialSavings / currentPrice) * 100)})
          </p>
          <div className="mt-3 flex space-x-2">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              Apply for Broker Status
            </Button>
            <Button size="sm" variant="outline">
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function VolumePricingCard({
  categoryId,
  productId,
  basePrice,
  currentQuantity,
  onQuantityChange,
  isBroker
}: {
  categoryId: string;
  productId: string;
  basePrice: number;
  currentQuantity: number;
  onQuantityChange?: (quantity: number) => void;
  isBroker: boolean;
}) {
  const { formatCurrency } = usePricing();
  const [volumePricing, setVolumePricing] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchVolumePricing();
  }, [categoryId, productId, basePrice]);

  const fetchVolumePricing = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/pricing/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_id: categoryId,
          product_id: productId,
          base_price: basePrice,
          quantities: [1, 25, 50, 100, 250, 500, 1000, 2500]
        })
      });

      if (response.ok) {
        const data = await response.json();
        setVolumePricing(data.pricing_matrix);
      }
    } catch (error) {
      console.error('Error fetching volume pricing:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Target className="h-5 w-5 mr-2" />
          Volume Pricing
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {volumePricing.map((tier, index) => (
              <div
                key={tier.quantity}
                className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                  tier.quantity === currentQuantity
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => onQuantityChange?.(tier.quantity)}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-sm font-medium">
                    {tier.quantity.toLocaleString()} units
                  </div>
                  {tier.quantity === currentQuantity && (
                    <Badge variant="default" size="sm">Current</Badge>
                  )}
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {formatCurrency(tier.calculation.final_price)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatCurrency(tier.unit_final_price)} per unit
                  </div>
                  {tier.calculation.savings > 0 && (
                    <div className="text-xs text-green-600">
                      Save {formatCurrency(tier.calculation.savings)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}