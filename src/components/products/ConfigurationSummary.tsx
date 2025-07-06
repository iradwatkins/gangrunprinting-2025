import { FileText, Check, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Product = Tables<'products'> & {
  product_categories?: Tables<'product_categories'>;
  vendors?: Tables<'vendors'>;
  product_paper_stocks?: Array<{
    paper_stocks: Tables<'paper_stocks'>;
    is_default: boolean;
  }>;
  product_print_sizes?: Array<{
    print_sizes: Tables<'print_sizes'>;
    is_default: boolean;
  }>;
  product_turnaround_times?: Array<{
    turnaround_times: Tables<'turnaround_times'>;
    is_default: boolean;
  }>;
  product_add_ons?: Array<{
    add_ons: Tables<'add_ons'>;
    is_mandatory: boolean;
  }>;
};

interface ConfigurationSummaryProps {
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

export function ConfigurationSummary({ product, configuration }: ConfigurationSummaryProps) {
  // Load coating data
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
        console.error('Error loading coating:', error);
        return null;
      }

      return data;
    },
    enabled: !!configuration.coating_id
  });

  const getPaperStock = () => {
    return product.product_paper_stocks
      ?.find(ps => ps.paper_stocks.id === configuration.paper_stock_id)
      ?.paper_stocks;
  };

  const getPrintSize = () => {
    return product.product_print_sizes
      ?.find(ps => ps.print_sizes.id === configuration.print_size_id)
      ?.print_sizes;
  };

  const getTurnaroundTime = () => {
    return product.product_turnaround_times
      ?.find(tt => tt.turnaround_times.id === configuration.turnaround_time_id)
      ?.turnaround_times;
  };

  const getSelectedAddOns = () => {
    return product.product_add_ons
      ?.filter(ao => configuration.add_on_ids.includes(ao.add_ons.id))
      ?.map(ao => ao.add_ons) || [];
  };

  const paperStock = getPaperStock();
  const printSize = getPrintSize();
  const turnaroundTime = getTurnaroundTime();
  const selectedAddOns = getSelectedAddOns();

  const isConfigurationComplete = paperStock && printSize && turnaroundTime;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Configuration Summary
        </CardTitle>
        <CardDescription>
          Review your product configuration
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Product Info */}
        <div>
          <h4 className="font-medium mb-2">{product.name}</h4>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {product.product_categories && (
              <Badge variant="outline">
                {product.product_categories.name}
              </Badge>
            )}
            {product.vendors && (
              <span>by {product.vendors.name}</span>
            )}
          </div>
        </div>

        <Separator />

        {/* Configuration Details */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Quantity:</span>
            <span className="text-sm">{configuration.quantity.toLocaleString()} units</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Paper Stock:</span>
            <div className="text-right">
              {paperStock ? (
                <div>
                  <div className="text-sm">{paperStock.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {paperStock.weight}gsm
                  </div>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">Not selected</span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Print Size:</span>
            <div className="text-right">
              {printSize ? (
                <div>
                  <div className="text-sm">{printSize.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {printSize.width}" × {printSize.height}"
                  </div>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">Not selected</span>
              )}
            </div>
          </div>

          {configuration.coating_id && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Coating:</span>
              <div className="text-right">
                {selectedCoating ? (
                  <div>
                    <div className="text-sm">{selectedCoating.name}</div>
                    {selectedCoating.description && (
                      <div className="text-xs text-muted-foreground">
                        {selectedCoating.description}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">Loading...</span>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Turnaround Time:</span>
            <div className="text-right">
              {turnaroundTime ? (
                <div>
                  <div className="text-sm">{turnaroundTime.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {turnaroundTime.business_days === 0 
                      ? 'Same day' 
                      : `${turnaroundTime.business_days} business day${turnaroundTime.business_days !== 1 ? 's' : ''}`
                    }
                  </div>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">Not selected</span>
              )}
            </div>
          </div>

          {selectedAddOns.length > 0 && (
            <div>
              <span className="text-sm font-medium">Add-ons:</span>
              <div className="mt-1 space-y-1">
                {selectedAddOns.map((addOn) => (
                  <div key={addOn.id} className="text-sm text-muted-foreground">
                    • {addOn.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {configuration.notes && (
            <div>
              <span className="text-sm font-medium">Special Notes:</span>
              <div className="text-sm text-muted-foreground mt-1 p-2 bg-muted rounded">
                {configuration.notes}
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Configuration Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Configuration Status:</span>
          <div className="flex items-center space-x-2">
            {isConfigurationComplete ? (
              <>
                <Check className="h-4 w-4 text-green-600" />
                <Badge variant="secondary" className="text-green-600">
                  Complete
                </Badge>
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <Badge variant="secondary" className="text-orange-600">
                  Incomplete
                </Badge>
              </>
            )}
          </div>
        </div>

        {!isConfigurationComplete && (
          <div className="text-xs text-muted-foreground">
            Please complete all required configuration options
          </div>
        )}

        {/* Estimated Production Time */}
        {isConfigurationComplete && turnaroundTime && (
          <div className="p-3 bg-muted/50 rounded text-sm">
            <div className="font-medium">Estimated Production:</div>
            <div className="text-muted-foreground">
              Your order will be ready in {turnaroundTime.business_days === 0 ? 'same day' : `${turnaroundTime.business_days} business day${turnaroundTime.business_days !== 1 ? 's' : ''}`}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}