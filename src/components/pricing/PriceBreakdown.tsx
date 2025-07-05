import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Receipt, 
  TrendingDown, 
  Crown, 
  Target,
  Info,
  ChevronRight,
  Calculator
} from 'lucide-react';
import type { PriceCalculation, DiscountSummary, BrokerProfile } from '@/types/broker';

interface PriceBreakdownProps {
  calculation: PriceCalculation;
  discountSummary?: DiscountSummary;
  brokerProfile?: BrokerProfile;
  quantity: number;
  showTierUpgrade?: boolean;
  className?: string;
}

export function PriceBreakdown({
  calculation,
  discountSummary,
  brokerProfile,
  quantity,
  showTierUpgrade = true,
  className = ''
}: PriceBreakdownProps) {
  const [showDetails, setShowDetails] = useState(false);

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  
  const formatPercentage = (percentage: number) => `${percentage.toFixed(1)}%`;

  const unitPrice = calculation.base_price / quantity;
  const finalUnitPrice = calculation.final_price / quantity;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Receipt className="h-5 w-5 mr-2" />
            Price Breakdown
          </div>
          {brokerProfile && (
            <Badge variant="default" className="bg-yellow-500">
              <Crown className="h-3 w-3 mr-1" />
              {brokerProfile.broker_tier.display_name}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Price Display */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Base Price ({quantity} units)</span>
            <span className="font-medium">{formatCurrency(calculation.base_price)}</span>
          </div>
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>Per unit</span>
            <span>{formatCurrency(unitPrice)}</span>
          </div>
        </div>

        <Separator />

        {/* Discounts */}
        {calculation.discount_breakdown.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center text-sm font-medium text-green-700">
              <TrendingDown className="h-4 w-4 mr-1" />
              Discounts Applied
            </div>
            
            {calculation.discount_breakdown.map((discount, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <div className="flex items-center">
                  <span className="text-gray-600">{discount.description}</span>
                  {discount.type === 'tier' && brokerProfile && (
                    <Info className="h-3 w-3 ml-1 text-blue-500" />
                  )}
                </div>
                <div className="text-right">
                  <span className="text-green-600 font-medium">
                    -{formatCurrency(discount.amount)}
                  </span>
                  <div className="text-xs text-gray-500">
                    {formatPercentage(discount.percentage)}
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-between items-center text-sm font-medium pt-2 border-t">
              <span className="text-green-700">Total Savings</span>
              <span className="text-green-600">
                -{formatCurrency(calculation.savings)}
              </span>
            </div>
          </div>
        )}

        {/* Rush Surcharge */}
        {calculation.rush_surcharge > 0 && (
          <>
            <Separator />
            <div className="flex justify-between items-center text-sm">
              <span className="text-orange-600">Rush Order Surcharge</span>
              <span className="text-orange-600 font-medium">
                +{formatCurrency(calculation.rush_surcharge)}
              </span>
            </div>
          </>
        )}

        <Separator />

        {/* Final Price */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total Price</span>
            <span>{formatCurrency(calculation.final_price)}</span>
          </div>
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Per unit</span>
            <span>{formatCurrency(finalUnitPrice)}</span>
          </div>
          
          {calculation.savings > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-800">You saved</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(calculation.savings)} 
                  ({formatPercentage((calculation.savings / calculation.base_price) * 100)})
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Tier Upgrade Suggestion */}
        {showTierUpgrade && brokerProfile && discountSummary?.next_tier_savings && (
          <TierUpgradeSuggestion
            currentTier={brokerProfile.broker_tier.display_name}
            nextTierSavings={discountSummary.next_tier_savings}
            currentVolume={brokerProfile.current_year_volume}
            annualTarget={brokerProfile.annual_volume_committed}
          />
        )}

        {/* Volume Progress for Brokers */}
        {brokerProfile && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Target className="h-4 w-4 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-900">
                  Annual Volume Progress
                </span>
              </div>
              <span className="text-xs text-blue-700">
                {formatPercentage((brokerProfile.current_year_volume / brokerProfile.annual_volume_committed) * 100)}
              </span>
            </div>
            <Progress 
              value={(brokerProfile.current_year_volume / brokerProfile.annual_volume_committed) * 100}
              className="h-2"
            />
            <div className="flex justify-between text-xs text-blue-600 mt-1">
              <span>{formatCurrency(brokerProfile.current_year_volume)}</span>
              <span>{formatCurrency(brokerProfile.annual_volume_committed)}</span>
            </div>
          </div>
        )}

        {/* Additional Details Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
          className="w-full mt-4"
        >
          {showDetails ? 'Hide' : 'Show'} Calculation Details
          <ChevronRight className={`h-4 w-4 ml-1 transition-transform ${showDetails ? 'rotate-90' : ''}`} />
        </Button>

        {showDetails && (
          <div className="space-y-3 pt-3 border-t">
            <div className="text-sm text-gray-600">
              <h4 className="font-medium mb-2">Calculation Method:</h4>
              <ul className="space-y-1 text-xs">
                <li>• Base price calculated per unit × quantity</li>
                <li>• Volume discounts applied based on quantity tiers</li>
                {brokerProfile && (
                  <>
                    <li>• Broker tier discount: {formatPercentage(brokerProfile.broker_tier.base_discount_percentage)}</li>
                    <li>• Category-specific discounts applied where applicable</li>
                    <li>• Volume multiplier bonus for large orders</li>
                  </>
                )}
                <li>• Rush order surcharge applied to expedited orders</li>
              </ul>
            </div>
            
            {brokerProfile && (
              <div className="text-sm">
                <h4 className="font-medium mb-2 text-blue-900">Your Broker Benefits:</h4>
                <ul className="space-y-1 text-xs text-blue-700">
                  {brokerProfile.broker_tier.benefits.map((benefit, index) => (
                    <li key={index}>• {benefit}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TierUpgradeSuggestion({
  currentTier,
  nextTierSavings,
  currentVolume,
  annualTarget
}: {
  currentTier: string;
  nextTierSavings: {
    tier_name: string;
    additional_savings: number;
    volume_needed: number;
  };
  currentVolume: number;
  annualTarget: number;
}) {
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const progressToNextTier = Math.max(0, (currentVolume / (currentVolume + nextTierSavings.volume_needed)) * 100);

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-3">
      <div className="flex items-start space-x-3">
        <Crown className="h-5 w-5 text-purple-600 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-medium text-purple-900">
            Upgrade to {nextTierSavings.tier_name} Tier
          </h4>
          <p className="text-sm text-purple-700 mt-1">
            You could save an additional{' '}
            <span className="font-bold">{formatCurrency(nextTierSavings.additional_savings)}</span>
            {' '}on this order with {nextTierSavings.tier_name} tier status.
          </p>
          <p className="text-xs text-purple-600 mt-1">
            Only {formatCurrency(nextTierSavings.volume_needed)} more in annual volume needed.
          </p>
          <div className="mt-2">
            <Progress value={progressToNextTier} className="h-1" />
          </div>
        </div>
      </div>
    </div>
  );
}