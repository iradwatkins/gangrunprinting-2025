import { useState } from 'react';
import { Plus, Minus, Trash2, Package, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useCart } from '@/hooks/useCart';
import type { CartItem as CartItemType } from '@/types/cart';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const [isConfigExpanded, setIsConfigExpanded] = useState(false);
  const [quantity, setQuantity] = useState(item.quantity);
  const { updateCartItem, removeItem, isUpdatingItem, isRemovingItem } = useCart();

  const handleQuantityChange = (newQuantity: number) => {
    const validQuantity = Math.max(newQuantity, item.minimum_quantity);
    setQuantity(validQuantity);
    
    if (validQuantity !== item.quantity) {
      updateCartItem({
        itemId: item.id,
        request: { quantity: validQuantity }
      });
    }
  };

  const handleQuantityInputChange = (value: string) => {
    const numValue = parseInt(value) || item.minimum_quantity;
    handleQuantityChange(numValue);
  };

  const handleRemove = () => {
    removeItem(item.id);
  };

  const hasErrors = item.validation_errors && item.validation_errors.length > 0;

  return (
    <div className="border rounded-lg p-4 space-y-3">
      {/* Product Header */}
      <div className="flex items-start space-x-3">
        {/* Product Image */}
        <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
          {item.product_image ? (
            <img
              src={item.product_image}
              alt={item.product_name}
              className="w-full h-full object-cover rounded-md"
            />
          ) : (
            <Package className="h-6 w-6 text-muted-foreground" />
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm leading-tight line-clamp-2">
            {item.product_name}
          </h4>
          <div className="flex items-center justify-between mt-2">
            <span className="text-lg font-bold">
              ${item.total_price.toFixed(2)}
            </span>
            {item.price_breakdown.savings > 0 && (
              <Badge variant="secondary" className="text-green-600 text-xs">
                Save ${item.price_breakdown.savings.toFixed(2)}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            ${item.unit_price.toFixed(2)} per unit
          </p>
        </div>

        {/* Remove Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRemove}
          disabled={isRemovingItem}
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          aria-label="Remove item"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Validation Errors */}
      {hasErrors && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <ul className="text-sm space-y-1">
              {item.validation_errors?.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Quantity Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Quantity:</span>
          <div className="flex items-center border rounded-md">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= item.minimum_quantity || isUpdatingItem}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <Input
              type="number"
              min={item.minimum_quantity}
              value={quantity}
              onChange={(e) => handleQuantityInputChange(e.target.value)}
              className="w-16 h-8 text-center border-0 focus-visible:ring-0"
              disabled={isUpdatingItem}
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={isUpdatingItem}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {item.minimum_quantity > 1 && (
          <span className="text-xs text-muted-foreground">
            Min: {item.minimum_quantity}
          </span>
        )}
      </div>

      {/* Configuration Toggle */}
      <Collapsible open={isConfigExpanded} onOpenChange={setIsConfigExpanded}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-0 h-auto">
            <span className="text-sm font-medium">Configuration Details</span>
            {isConfigExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="space-y-3 mt-3">
          <Separator />
          
          {/* Configuration Details */}
          <div className="space-y-2 text-sm">
            {item.configuration_display.paper_stock_name && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paper Stock:</span>
                <span>{item.configuration_display.paper_stock_name}</span>
              </div>
            )}
            
            {item.configuration_display.print_size_name && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Print Size:</span>
                <span>{item.configuration_display.print_size_name}</span>
              </div>
            )}
            
            {item.configuration_display.turnaround_time_name && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Turnaround:</span>
                <span>{item.configuration_display.turnaround_time_name}</span>
              </div>
            )}
            
            {item.configuration_display.add_on_names.length > 0 && (
              <div>
                <span className="text-muted-foreground">Add-ons:</span>
                <ul className="mt-1 space-y-1">
                  {item.configuration_display.add_on_names.map((addOn, index) => (
                    <li key={index} className="text-sm ml-4">• {addOn}</li>
                  ))}
                </ul>
              </div>
            )}

            {item.configuration.notes && (
              <div>
                <span className="text-muted-foreground">Notes:</span>
                <p className="mt-1 text-sm bg-muted p-2 rounded">
                  {item.configuration.notes}
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Price Breakdown */}
          <div className="space-y-2 text-sm">
            <h5 className="font-medium">Price Breakdown</h5>
            
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base price (×{item.quantity}):</span>
                <span>${(item.price_breakdown.base_price * item.quantity).toFixed(2)}</span>
              </div>
              
              {item.price_breakdown.paper_cost > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paper cost:</span>
                  <span>+${(item.price_breakdown.paper_cost * item.quantity).toFixed(2)}</span>
                </div>
              )}
              
              {item.price_breakdown.size_modifier > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Size modifier:</span>
                  <span>+${(item.price_breakdown.size_modifier * item.quantity).toFixed(2)}</span>
                </div>
              )}
              
              {item.price_breakdown.turnaround_modifier > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Turnaround:</span>
                  <span>+${(item.price_breakdown.turnaround_modifier * item.quantity).toFixed(2)}</span>
                </div>
              )}
              
              {item.price_breakdown.add_on_costs > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Add-ons:</span>
                  <span>+${(item.price_breakdown.add_on_costs * item.quantity).toFixed(2)}</span>
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between font-medium">
                <span>Subtotal:</span>
                <span>${item.price_breakdown.subtotal.toFixed(2)}</span>
              </div>
              
              {item.price_breakdown.quantity_discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Quantity discount:</span>
                  <span>-${item.price_breakdown.quantity_discount.toFixed(2)}</span>
                </div>
              )}
              
              {item.price_breakdown.broker_discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Broker discount:</span>
                  <span>-${item.price_breakdown.broker_discount.toFixed(2)}</span>
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>${item.total_price.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Loading Overlay */}
      {(isUpdatingItem || isRemovingItem) && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center rounded-lg">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
        </div>
      )}
    </div>
  );
}