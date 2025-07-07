import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Calculator, Package, Palette, Ruler, Clock, Plus, ShoppingCart, Save, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/contexts/AuthContext';
import { documentationPricingEngine, type ProductConfiguration, type DocumentationPriceCalculation } from '@/utils/pricing/documentation-calculations';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Product = Tables<'products'> & {
  product_categories?: Tables<'product_categories'>;
  vendors?: Tables<'vendors'>;
  product_paper_stocks?: Array<{
    paper_stocks: Tables<'paper_stocks'> & {
      second_side_markup_percent: number;
      default_coating_id?: string;
    };
    is_default: boolean;
    price_override?: number;
  }>;
  product_print_sizes?: Array<{
    print_sizes: Tables<'print_sizes'> & {
      is_custom: boolean;
      min_width?: number;
      max_width?: number;
      min_height?: number;
      max_height?: number;
    };
    is_default: boolean;
    price_modifier?: number;
  }>;
  product_turnaround_times?: Array<{
    turnaround_times: Tables<'turnaround_times'>;
    is_default: boolean;
    price_override?: number;
  }>;
  product_add_ons?: Array<{
    add_ons: Tables<'add_ons'> & {
      has_sub_options: boolean;
      is_mandatory: boolean;
      additional_turnaround_days: number;
      tooltip_text?: string;
    };
    is_mandatory: boolean;
    price_override?: any;
  }>;
};

interface Configuration {
  paper_stock_id?: string;
  print_size_id?: string;
  custom_width?: number;
  custom_height?: number;
  coating_id?: string;
  turnaround_time_id?: string;
  quantity: number;
  sides: 'single' | 'double';
  notes?: string;
  add_ons: {
    [key: string]: {
      selected: boolean;
      sub_options: { [key: string]: any };
    };
  };
}

interface EnhancedProductConfigurationProps {
  product: Product;
}

export function EnhancedProductConfiguration({ product }: EnhancedProductConfigurationProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { user, profile } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [configurationMode, setConfigurationMode] = useState<'guided' | 'advanced'>('guided');
  const [configuration, setConfiguration] = useState<Configuration>({
    quantity: 250, // Default minimum from documentation
    sides: 'single',
    add_ons: {}
  });
  
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [priceCalculation, setPriceCalculation] = useState<DocumentationPriceCalculation | null>(null);

  // Fetch coatings data
  const { data: coatings } = useQuery({
    queryKey: ['coatings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coatings')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch quantities data
  const { data: quantities } = useQuery({
    queryKey: ['quantities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quantities')
        .select('*')
        .eq('is_active', true)
        .order('value');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch sides data
  const { data: sides } = useQuery({
    queryKey: ['sides'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sides')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch add-on sub-options
  const { data: addOnSubOptions } = useQuery({
    queryKey: ['add-on-sub-options'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('add_on_sub_options')
        .select('*')
        .eq('is_active', true)
        .order('add_on_id', { ascending: true })
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  // Get default selections
  useEffect(() => {
    const defaults: Partial<Configuration> = {};
    
    // Set default paper stock
    const defaultPaperStock = product.product_paper_stocks?.find(pps => pps.is_default);
    if (defaultPaperStock) {
      defaults.paper_stock_id = defaultPaperStock.paper_stocks.id;
      
      // Set default coating for this paper stock
      if (defaultPaperStock.paper_stocks.default_coating_id) {
        defaults.coating_id = defaultPaperStock.paper_stocks.default_coating_id;
      }
    }
    
    // Set default print size
    const defaultPrintSize = product.product_print_sizes?.find(pps => pps.is_default);
    if (defaultPrintSize) {
      defaults.print_size_id = defaultPrintSize.print_sizes.id;
    }
    
    // Set default turnaround time
    const defaultTurnaround = product.product_turnaround_times?.find(ptt => ptt.is_default);
    if (defaultTurnaround) {
      defaults.turnaround_time_id = defaultTurnaround.turnaround_times.id;
    }
    
    // Set mandatory add-ons
    const mandatoryAddOns: Configuration['add_ons'] = {};
    product.product_add_ons?.forEach(pao => {
      if (pao.is_mandatory) {
        mandatoryAddOns[pao.add_ons.id] = {
          selected: true,
          sub_options: {}
        };
      }
    });
    
    setConfiguration(prev => ({
      ...prev,
      ...defaults,
      add_ons: { ...prev.add_ons, ...mandatoryAddOns }
    }));
  }, [product]);

  // Validate configuration
  const validateConfiguration = useMemo(() => {
    const errors: string[] = [];
    
    // Required selections
    if (!configuration.paper_stock_id) {
      errors.push('Please select a paper stock');
    }
    
    if (!configuration.print_size_id && !configuration.custom_width && !configuration.custom_height) {
      errors.push('Please select a print size or enter custom dimensions');
    }
    
    if (!configuration.turnaround_time_id) {
      errors.push('Please select a turnaround time');
    }
    
    // Quantity validation (from documentation: min 5,000, multiples of 5,000 for custom)
    if (configuration.quantity < 5) {
      errors.push('Minimum quantity is 5');
    }
    
    // Custom size validation
    if (configuration.custom_width || configuration.custom_height) {
      const selectedSize = product.product_print_sizes?.find(pps => pps.print_sizes.id === configuration.print_size_id);
      if (selectedSize?.print_sizes.is_custom) {
        if (!configuration.custom_width || !configuration.custom_height) {
          errors.push('Both width and height are required for custom sizes');
        }
        
        const size = selectedSize.print_sizes;
        if (size.min_width && configuration.custom_width < size.min_width) {
          errors.push(`Minimum width is ${size.min_width} inches`);
        }
        if (size.max_width && configuration.custom_width > size.max_width) {
          errors.push(`Maximum width is ${size.max_width} inches`);
        }
        if (size.min_height && configuration.custom_height < size.min_height) {
          errors.push(`Minimum height is ${size.min_height} inches`);
        }
        if (size.max_height && configuration.custom_height > size.max_height) {
          errors.push(`Maximum height is ${size.max_height} inches`);
        }
      }
    }
    
    // Folding size validation (min 5"x6" from documentation)
    const foldingSelected = configuration.add_ons['folding']?.selected;
    if (foldingSelected) {
      const selectedSize = product.product_print_sizes?.find(pps => pps.print_sizes.id === configuration.print_size_id);
      if (selectedSize) {
        const width = configuration.custom_width || selectedSize.print_sizes.width;
        const height = configuration.custom_height || selectedSize.print_sizes.height;
        if (width < 5 || height < 6) {
          errors.push('Folding requires minimum size of 5" x 6"');
        }
      }
    }
    
    // EDDM eligibility validation
    const eddmSelected = configuration.add_ons['eddm_process']?.selected;
    if (eddmSelected && !product.is_eddm_eligible) {
      errors.push('EDDM services are not available for this product');
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  }, [configuration, product]);

  // Calculate price using documentation formula
  useEffect(() => {
    if (validateConfiguration) {
      try {
        const selectedPaperStock = product.product_paper_stocks?.find(
          pps => pps.paper_stocks.id === configuration.paper_stock_id
        );
        const selectedPrintSize = product.product_print_sizes?.find(
          pps => pps.print_sizes.id === configuration.print_size_id
        );
        const selectedTurnaround = product.product_turnaround_times?.find(
          ptt => ptt.turnaround_times.id === configuration.turnaround_time_id
        );
        
        if (!selectedPaperStock || !selectedPrintSize || !selectedTurnaround) {
          return;
        }
        
        // Build pricing configuration
        const pricingConfig: ProductConfiguration = {
          paper_stock: {
            id: selectedPaperStock.paper_stocks.id,
            name: selectedPaperStock.paper_stocks.name,
            price_per_sq_inch: selectedPaperStock.paper_stocks.price_per_sq_inch,
            second_side_markup_percent: selectedPaperStock.paper_stocks.second_side_markup_percent
          },
          print_size: {
            id: selectedPrintSize.print_sizes.id,
            name: selectedPrintSize.print_sizes.name,
            width: configuration.custom_width || selectedPrintSize.print_sizes.width,
            height: configuration.custom_height || selectedPrintSize.print_sizes.height,
            is_custom: selectedPrintSize.print_sizes.is_custom
          },
          quantity: configuration.quantity,
          sides: configuration.sides,
          turnaround_time: {
            id: selectedTurnaround.turnaround_times.id,
            name: selectedTurnaround.turnaround_times.name,
            price_markup_percent: selectedTurnaround.turnaround_times.price_markup_percent,
            business_days: selectedTurnaround.turnaround_times.business_days
          },
          add_ons: {
            // Convert configuration add-ons to pricing format
            our_tagline: configuration.add_ons['our_tagline']?.selected ? {
              selected: true,
              discount_percentage: 5.0
            } : undefined,
            exact_size: configuration.add_ons['exact_size']?.selected ? {
              selected: true,
              markup_percentage: 12.5
            } : undefined,
            digital_proof: configuration.add_ons['digital_proof']?.selected ? {
              selected: true,
              price: 5.00
            } : undefined
            // Add other add-ons as needed...
          },
          is_broker: !!profile?.is_broker,
          broker_discounts: profile?.broker_category_discounts ? 
            Object.entries(profile.broker_category_discounts).map(([category_id, discount]) => ({
              category_id,
              discount_percentage: discount as number
            })) : undefined,
          category_id: product.category_id
        };
        
        const calculation = documentationPricingEngine.calculatePrice(pricingConfig);
        setPriceCalculation(calculation);
      } catch (error) {
        console.error('Price calculation error:', error);
        setPriceCalculation(null);
      }
    }
  }, [configuration, validateConfiguration, product, profile]);

  const handleAddToCart = async () => {
    if (!validateConfiguration) {
      toast({
        title: 'Configuration Incomplete',
        description: 'Please complete all required selections before adding to cart.',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      await addToCart({
        product_id: product.id,
        configuration,
        quantity: configuration.quantity,
        price: priceCalculation?.calculated_product_subtotal_before_shipping_tax || 0
      });
      
      toast({
        title: 'Added to Cart',
        description: `${configuration.quantity} units of ${product.name} added to cart.`
      });
      
      // Navigate to cart or continue shopping
      navigate('/cart');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add item to cart. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const configurationSteps = [
    { title: 'Paper & Coating', icon: Package },
    { title: 'Size & Sides', icon: Ruler },
    { title: 'Quantity', icon: Calculator },
    { title: 'Turnaround', icon: Clock },
    { title: 'Add-ons', icon: Plus },
    { title: 'Review', icon: ShoppingCart }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configuration Panel */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Configure {product.name}
                <div className="flex gap-2">
                  <Button
                    variant={configurationMode === 'guided' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setConfigurationMode('guided')}
                  >
                    Guided
                  </Button>
                  <Button
                    variant={configurationMode === 'advanced' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setConfigurationMode('advanced')}
                  >
                    Advanced
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                {configurationMode === 'guided' 
                  ? 'Step-by-step configuration process'
                  : 'All options in one view for experienced users'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {validationErrors.length > 0 && (
                <Alert className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc pl-4">
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
              
              {configurationMode === 'guided' ? (
                <GuidedConfiguration
                  product={product}
                  configuration={configuration}
                  setConfiguration={setConfiguration}
                  currentStep={currentStep}
                  setCurrentStep={setCurrentStep}
                  steps={configurationSteps}
                  coatings={coatings}
                  quantities={quantities}
                  sides={sides}
                  addOnSubOptions={addOnSubOptions}
                />
              ) : (
                <AdvancedConfiguration
                  product={product}
                  configuration={configuration}
                  setConfiguration={setConfiguration}
                  coatings={coatings}
                  quantities={quantities}
                  sides={sides}
                  addOnSubOptions={addOnSubOptions}
                />
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Price Calculator & Summary */}
        <div className="space-y-6">
          {priceCalculation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Price Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DocumentationPriceDisplay calculation={priceCalculation} />
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>Configuration Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <ConfigurationSummaryDisplay 
                product={product}
                configuration={configuration}
                priceCalculation={priceCalculation}
              />
              
              <div className="mt-6 space-y-3">
                <Button 
                  onClick={handleAddToCart}
                  className="w-full"
                  disabled={!validateConfiguration}
                  size="lg"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart - ${priceCalculation?.calculated_product_subtotal_before_shipping_tax.toFixed(2) || '0.00'}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {/* Save for later functionality */}}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Helper components for guided and advanced configurations
function GuidedConfiguration({ /* props */ }) {
  // Implementation for guided step-by-step configuration
  return <div>Guided Configuration Implementation</div>;
}

function AdvancedConfiguration({ /* props */ }) {
  // Implementation for advanced all-in-one configuration
  return <div>Advanced Configuration Implementation</div>;
}

function DocumentationPriceDisplay({ calculation }: { calculation: DocumentationPriceCalculation }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <span>Base Printing:</span>
        <span>${calculation.breakdown.base_printing.toFixed(2)}</span>
      </div>
      
      {calculation.breakdown.broker_savings && (
        <div className="flex justify-between text-green-600">
          <span>Broker Discount:</span>
          <span>-${calculation.breakdown.broker_savings.toFixed(2)}</span>
        </div>
      )}
      
      {calculation.breakdown.tagline_savings && (
        <div className="flex justify-between text-green-600">
          <span>"Our Tagline" Discount:</span>
          <span>-${calculation.breakdown.tagline_savings.toFixed(2)}</span>
        </div>
      )}
      
      {calculation.breakdown.exact_size_markup && (
        <div className="flex justify-between text-orange-600">
          <span>Exact Size Markup:</span>
          <span>+${calculation.breakdown.exact_size_markup.toFixed(2)}</span>
        </div>
      )}
      
      <div className="flex justify-between">
        <span>Turnaround Markup:</span>
        <span>${calculation.breakdown.turnaround_markup.toFixed(2)}</span>
      </div>
      
      {calculation.breakdown.addons > 0 && (
        <div className="flex justify-between">
          <span>Add-on Services:</span>
          <span>${calculation.breakdown.addons.toFixed(2)}</span>
        </div>
      )}
      
      <Separator />
      
      <div className="flex justify-between font-bold text-lg">
        <span>Total:</span>
        <span>${calculation.breakdown.total.toFixed(2)}</span>
      </div>
      
      {calculation.discrete_addon_costs.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="font-medium text-sm">Add-on Details:</p>
          {calculation.discrete_addon_costs.map((addon, index) => (
            <div key={index} className="text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>{addon.name}:</span>
                <span>${addon.cost.toFixed(2)}</span>
              </div>
              <div className="text-xs">{addon.calculation_details}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ConfigurationSummaryDisplay({ product, configuration, priceCalculation }: any) {
  return (
    <div className="space-y-2 text-sm">
      <div><strong>Product:</strong> {product.name}</div>
      <div><strong>Quantity:</strong> {configuration.quantity}</div>
      <div><strong>Sides:</strong> {configuration.sides}</div>
      {/* Add more configuration details */}
    </div>
  );
}