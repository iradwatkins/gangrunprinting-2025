import { useState, useEffect } from 'react';
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

  const validateConfiguration = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!configuration.paper_stock_id) {
      newErrors.paper_stock = 'Please select a paper stock';
    }

    if (!configuration.print_size_id) {
      newErrors.print_size = 'Please select a print size';
    }

    if (!configuration.turnaround_time_id) {
      newErrors.turnaround_time = 'Please select a turnaround time';
    }

    if (configuration.quantity < product.minimum_quantity) {
      newErrors.quantity = `Minimum quantity is ${product.minimum_quantity}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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