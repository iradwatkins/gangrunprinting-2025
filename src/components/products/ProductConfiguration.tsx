import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calculator, Package, Palette, Ruler, Clock, Plus, ShoppingCart, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ConfigurationStep } from '@/components/products/ConfigurationStep';
import { PriceCalculator } from '@/components/products/PriceCalculator';
import { ConfigurationSummary } from '@/components/products/ConfigurationSummary';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/useCart';
import { coatingsApi } from '@/api/global-options';
import { supabase } from '@/integrations/supabase/client';
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

interface ProductConfigurationProps {
  product: Product;
}

interface Configuration {
  paper_stock_id?: string;
  print_size_id?: string;
  coating_id?: string;
  turnaround_time_id?: string;
  add_on_ids: string[];
  quantity: number;
  notes?: string;
}

export function ProductConfiguration({ product }: ProductConfigurationProps) {
  const [configMode, setConfigMode] = useState<'guided' | 'advanced'>('guided');
  const [currentStep, setCurrentStep] = useState(0);
  const [configuration, setConfiguration] = useState<Configuration>({
    add_on_ids: [],
    quantity: product.minimum_quantity || 1
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const { addToCart, isAddingToCart } = useCart();

  // Load available coatings for selected paper stock
  const { data: availableCoatings = [] } = useQuery({
    queryKey: ['paper-stock-coatings', configuration.paper_stock_id],
    queryFn: async () => {
      if (!configuration.paper_stock_id) return [];
      
      const { data, error } = await supabase
        .from('paper_stock_coatings')
        .select(`
          coatings(id, name, description, price_modifier, is_active),
          is_default
        `)
        .eq('paper_stock_id', configuration.paper_stock_id)
        .eq('coatings.is_active', true);

      if (error) {
        console.error('Error loading coatings:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!configuration.paper_stock_id
  });

  // Set default values from product options
  useEffect(() => {
    const defaults: Partial<Configuration> = {
      quantity: product.minimum_quantity || 1
    };

    // Set default paper stock
    const defaultPaperStock = product.product_paper_stocks?.find(ps => ps.is_default);
    if (defaultPaperStock) {
      defaults.paper_stock_id = defaultPaperStock.paper_stocks.id;
    }

    // Set default print size
    const defaultPrintSize = product.product_print_sizes?.find(ps => ps.is_default);
    if (defaultPrintSize) {
      defaults.print_size_id = defaultPrintSize.print_sizes.id;
    }

    // Set default turnaround time
    const defaultTurnaround = product.product_turnaround_times?.find(tt => tt.is_default);
    if (defaultTurnaround) {
      defaults.turnaround_time_id = defaultTurnaround.turnaround_times.id;
    }

    // Add mandatory add-ons
    const mandatoryAddOns = product.product_add_ons
      ?.filter(ao => ao.is_mandatory)
      ?.map(ao => ao.add_ons.id) || [];
    
    if (mandatoryAddOns.length > 0) {
      defaults.add_on_ids = mandatoryAddOns;
    }

    setConfiguration(prev => ({ ...prev, ...defaults }));
  }, [product]);

  // Set default coating when paper stock changes or coatings load
  useEffect(() => {
    if (availableCoatings.length > 0 && !configuration.coating_id) {
      const defaultCoating = availableCoatings.find(coating => coating.is_default);
      if (defaultCoating?.coatings) {
        setConfiguration(prev => ({
          ...prev,
          coating_id: defaultCoating.coatings.id
        }));
      }
    }
    // Clear coating if paper stock changes and current coating is not available
    else if (configuration.coating_id && availableCoatings.length > 0) {
      const isCoatingAvailable = availableCoatings.some(
        coating => coating.coatings?.id === configuration.coating_id
      );
      if (!isCoatingAvailable) {
        setConfiguration(prev => ({
          ...prev,
          coating_id: undefined
        }));
      }
    }
  }, [availableCoatings, configuration.coating_id]);

  // Real-time validation on configuration changes
  useEffect(() => {
    // Only validate if we have basic configuration started
    if (configuration.paper_stock_id || configuration.print_size_id || configuration.turnaround_time_id) {
      validateConfiguration();
    }
  }, [configuration, availableCoatings, product]);

  const validateConfiguration = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Basic required field validation
    if (!configuration.paper_stock_id) {
      newErrors.paper_stock = 'Please select a paper stock';
    }

    if (!configuration.print_size_id) {
      newErrors.print_size = 'Please select a print size';
    }

    if (!configuration.coating_id && availableCoatings.length > 0) {
      newErrors.coating = 'Please select a coating';
    }

    if (!configuration.turnaround_time_id) {
      newErrors.turnaround_time = 'Please select a turnaround time';
    }

    // Quantity validation
    if (configuration.quantity < (product.minimum_quantity || 1)) {
      newErrors.quantity = `Minimum quantity is ${product.minimum_quantity || 1}`;
    }

    if (product.maximum_quantity && configuration.quantity > product.maximum_quantity) {
      newErrors.quantity = `Maximum quantity is ${product.maximum_quantity}`;
    }

    // Business rules validation
    if (configuration.paper_stock_id && configuration.coating_id) {
      // Validate coating is compatible with selected paper stock
      const isCoatingCompatible = availableCoatings.some(
        coating => coating.coatings?.id === configuration.coating_id
      );
      if (!isCoatingCompatible) {
        newErrors.coating = 'Selected coating is not compatible with this paper stock';
      }
    }

    // Print size validation based on paper stock
    if (configuration.paper_stock_id && configuration.print_size_id) {
      const selectedPrintSize = product.product_print_sizes?.find(
        ps => ps.print_sizes.id === configuration.print_size_id
      );
      if (selectedPrintSize) {
        const area = (selectedPrintSize.print_sizes.width || 0) * (selectedPrintSize.print_sizes.height || 0);
        if (area > 1000) { // Large format size check
          const selectedPaperStock = product.product_paper_stocks?.find(
            ps => ps.paper_stocks.id === configuration.paper_stock_id
          );
          if (selectedPaperStock?.paper_stocks.weight && selectedPaperStock.paper_stocks.weight < 300) {
            newErrors.print_size = 'Large format prints require heavier paper stock (300gsm+)';
          }
        }
      }
    }

    // Mandatory add-ons validation
    const mandatoryAddOns = product.product_add_ons?.filter(ao => ao.is_mandatory) || [];
    const missingMandatory = mandatoryAddOns.filter(
      mandatory => !configuration.add_on_ids.includes(mandatory.add_ons.id)
    );
    if (missingMandatory.length > 0) {
      newErrors.add_ons = `Required add-ons: ${missingMandatory.map(ao => ao.add_ons.name).join(', ')}`;
    }

    // Vendor availability validation
    if (product.vendors && !product.vendors_active) {
      newErrors.vendor = 'This product is temporarily unavailable from the vendor';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getConfigurationRecommendations = () => {
    const recommendations: string[] = [];

    // Recommend default options if none selected
    if (!configuration.paper_stock_id) {
      const defaultPaperStock = product.product_paper_stocks?.find(ps => ps.is_default);
      if (defaultPaperStock) {
        recommendations.push(`Try "${defaultPaperStock.paper_stocks.name}" paper stock (recommended)`);
      }
    }

    // Recommend coating based on paper stock
    if (configuration.paper_stock_id && !configuration.coating_id && availableCoatings.length > 0) {
      const defaultCoating = availableCoatings.find(coating => coating.is_default);
      if (defaultCoating?.coatings) {
        recommendations.push(`Add "${defaultCoating.coatings.name}" coating for best finish`);
      }
    }

    // Recommend quantity tiers for savings
    if (configuration.quantity < 250 && configuration.quantity > 0) {
      recommendations.push('Order 250+ units for 5% bulk discount');
    } else if (configuration.quantity >= 250 && configuration.quantity < 500) {
      recommendations.push('Order 500+ units for 10% bulk discount');
    } else if (configuration.quantity >= 500 && configuration.quantity < 1000) {
      recommendations.push('Order 1000+ units for 15% bulk discount');
    }

    // Recommend faster turnaround if rush available
    if (configuration.turnaround_time_id) {
      const selectedTurnaround = product.product_turnaround_times?.find(
        tt => tt.turnaround_times.id === configuration.turnaround_time_id
      );
      const rushOption = product.product_turnaround_times?.find(
        tt => tt.turnaround_times.business_days === 0
      );
      if (selectedTurnaround?.turnaround_times.business_days && selectedTurnaround.turnaround_times.business_days > 1 && rushOption) {
        recommendations.push(`Rush delivery available for same-day completion`);
      }
    }

    return recommendations;
  };

  const handleConfigurationChange = (field: keyof Configuration, value: any) => {
    setConfiguration(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleAddToCart = () => {
    if (validateConfiguration()) {
      addToCart({
        product_id: product.id,
        quantity: configuration.quantity,
        configuration: {
          paper_stock_id: configuration.paper_stock_id,
          print_size_id: configuration.print_size_id,
          coating_id: configuration.coating_id,
          turnaround_time_id: configuration.turnaround_time_id,
          add_on_ids: configuration.add_on_ids,
          notes: configuration.notes
        }
      });
    }
  };

  const handleSaveConfiguration = () => {
    if (validateConfiguration()) {
      // TODO: Implement save configuration functionality
      toast({
        title: 'Configuration Saved',
        description: 'Your product configuration has been saved for later'
      });
    }
  };

  const steps = [
    {
      title: 'Paper Stock',
      icon: Palette,
      description: 'Choose your paper type and quality',
      options: product.product_paper_stocks || [],
      field: 'paper_stock_id' as keyof Configuration,
      required: true
    },
    {
      title: 'Print Size',
      icon: Ruler,
      description: 'Select the dimensions for your product',
      options: product.product_print_sizes || [],
      field: 'print_size_id' as keyof Configuration,
      required: true
    },
    {
      title: 'Coating',
      icon: Palette,
      description: 'Select coating finish for your paper stock',
      options: availableCoatings || [],
      field: 'coating_id' as keyof Configuration,
      required: availableCoatings.length > 0
    },
    {
      title: 'Turnaround Time',
      icon: Clock,
      description: 'Choose your delivery timeline',
      options: product.product_turnaround_times || [],
      field: 'turnaround_time_id' as keyof Configuration,
      required: true
    },
    {
      title: 'Add-ons',
      icon: Plus,
      description: 'Optional services and enhancements',
      options: product.product_add_ons || [],
      field: 'add_on_ids' as keyof Configuration,
      required: false
    }
  ];

  const canProceedToNext = () => {
    const currentStepData = steps[currentStep];
    if (currentStepData.required) {
      return !!configuration[currentStepData.field];
    }
    return true;
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1 && canProceedToNext()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration Mode Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Product Configuration
          </CardTitle>
          <CardDescription>
            Configure your {product.name} with the options below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={configMode} onValueChange={(value) => setConfigMode(value as 'guided' | 'advanced')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="guided">Guided Setup</TabsTrigger>
              <TabsTrigger value="advanced">All Options</TabsTrigger>
            </TabsList>

            {/* Guided Configuration */}
            <TabsContent value="guided" className="mt-6 space-y-6">
              {/* Progress Indicator */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
                </h3>
                <div className="flex space-x-1">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-3 h-3 rounded-full ${
                        index <= currentStep ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Current Step */}
              <ConfigurationStep
                step={steps[currentStep]}
                configuration={configuration}
                onChange={handleConfigurationChange}
                error={errors[steps[currentStep].field]}
              />

              {/* Navigation */}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                >
                  Previous
                </Button>
                <Button
                  onClick={nextStep}
                  disabled={currentStep === steps.length - 1 || !canProceedToNext()}
                >
                  {currentStep === steps.length - 1 ? 'Review' : 'Next'}
                </Button>
              </div>
            </TabsContent>

            {/* Advanced Configuration */}
            <TabsContent value="advanced" className="mt-6 space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {steps.map((step, index) => (
                  <ConfigurationStep
                    key={index}
                    step={step}
                    configuration={configuration}
                    onChange={handleConfigurationChange}
                    error={errors[step.field]}
                    compact
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quantity and Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min={product.minimum_quantity}
                value={configuration.quantity}
                onChange={(e) => handleConfigurationChange('quantity', parseInt(e.target.value) || product.minimum_quantity)}
                className={errors.quantity ? 'border-destructive' : ''}
              />
              {errors.quantity && (
                <p className="text-sm text-destructive mt-1">{errors.quantity}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Minimum quantity: {product.minimum_quantity}
              </p>
            </div>
            <div>
              <Label htmlFor="notes">Special Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any special requirements or instructions..."
                value={configuration.notes || ''}
                onChange={(e) => handleConfigurationChange('notes', e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Recommendations */}
      {getConfigurationRecommendations().length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="h-5 w-5 mr-2" />
              Recommendations
            </CardTitle>
            <CardDescription>
              Suggestions to optimize your configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {getConfigurationRecommendations().map((recommendation, index) => (
                <Alert key={index}>
                  <Calculator className="h-4 w-4" />
                  <AlertDescription>{recommendation}</AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Configuration Summary */}
        <ConfigurationSummary
          product={product}
          configuration={configuration}
        />

        {/* Price Calculator */}
        <PriceCalculator
          product={product}
          configuration={configuration}
        />
      </div>

      {/* Action Buttons */}
      <Card>
        <CardContent className="p-6">
          {Object.keys(errors).length > 0 && (
            <Alert className="mb-4">
              <AlertDescription>
                Please complete all required configuration options before adding to cart.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex gap-3">
            <Button 
              onClick={handleAddToCart}
              className="flex-1"
              disabled={Object.keys(errors).length > 0 || isAddingToCart}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {isAddingToCart ? 'Adding...' : 'Add to Cart'}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleSaveConfiguration}
              disabled={Object.keys(errors).length > 0}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Config
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}