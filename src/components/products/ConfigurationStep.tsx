import { Check, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Tables } from '@/integrations/supabase/types';

interface StepOption {
  id: string;
  name: string;
  description?: string;
  is_default?: boolean;
  is_mandatory?: boolean;
  price_override?: number;
  price_modifier?: number;
  [key: string]: any;
}

interface ConfigurationStepData {
  title: string;
  icon: any;
  description: string;
  options: any[];
  field: string;
  required: boolean;
}

interface ConfigurationStepProps {
  step: ConfigurationStepData;
  configuration: any;
  onChange: (field: string, value: any) => void;
  error?: string;
  compact?: boolean;
}

export function ConfigurationStep({ 
  step, 
  configuration, 
  onChange, 
  error,
  compact = false 
}: ConfigurationStepProps) {
  const Icon = step.icon;
  const isMultiSelect = step.field === 'add_on_ids';
  const currentValue = configuration[step.field];

  const handleSingleSelect = (value: string) => {
    onChange(step.field, value);
  };

  const handleMultiSelect = (optionId: string, checked: boolean) => {
    const currentValues = currentValue || [];
    if (checked) {
      onChange(step.field, [...currentValues, optionId]);
    } else {
      onChange(step.field, currentValues.filter((id: string) => id !== optionId));
    }
  };

  const getOptionData = (option: any) => {
    // Handle different option structures based on the relationship
    if (option.paper_stocks) return option.paper_stocks;
    if (option.print_sizes) return option.print_sizes;
    if (option.turnaround_times) return option.turnaround_times;
    if (option.add_ons) return option.add_ons;
    return option;
  };

  const formatPrice = (option: any) => {
    const data = getOptionData(option);
    
    if (option.price_override !== undefined && option.price_override !== null) {
      return `+$${option.price_override.toFixed(2)}`;
    }
    
    if (option.price_modifier !== undefined && option.price_modifier !== null) {
      return option.price_modifier > 0 ? `+${option.price_modifier}%` : '';
    }

    if (data.price_per_sq_inch) {
      return `$${data.price_per_sq_inch}/sq in`;
    }

    if (data.price_markup_percent) {
      return `+${data.price_markup_percent}%`;
    }

    return '';
  };

  const CardWrapper = compact ? 'div' : Card;
  const HeaderWrapper = compact ? 'div' : CardHeader;
  const ContentWrapper = compact ? 'div' : CardContent;

  return (
    <CardWrapper className={compact ? '' : 'h-full'}>
      <HeaderWrapper className={compact ? 'mb-4' : ''}>
        <div className="flex items-center space-x-2">
          <Icon className="h-5 w-5" />
          <div>
            <CardTitle className={compact ? 'text-lg' : 'text-xl'}>
              {step.title}
              {step.required && <span className="text-destructive ml-1">*</span>}
            </CardTitle>
            <CardDescription className={compact ? 'text-sm' : ''}>
              {step.description}
            </CardDescription>
          </div>
        </div>
      </HeaderWrapper>

      <ContentWrapper className={compact ? '' : 'space-y-4'}>
        {error && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step.options.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No options available for this product</p>
          </div>
        ) : isMultiSelect ? (
          // Multi-select for add-ons
          <div className="space-y-3">
            {step.options.map((option) => {
              const data = getOptionData(option);
              const isChecked = currentValue?.includes(data.id) || false;
              const price = formatPrice(option);
              
              return (
                <div
                  key={data.id}
                  className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
                    isChecked ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  <Checkbox
                    id={data.id}
                    checked={isChecked}
                    onCheckedChange={(checked) => 
                      handleMultiSelect(data.id, checked as boolean)
                    }
                    disabled={option.is_mandatory}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <Label 
                        htmlFor={data.id}
                        className="font-medium cursor-pointer"
                      >
                        {data.name}
                        {option.is_mandatory && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            Required
                          </Badge>
                        )}
                      </Label>
                      {price && (
                        <span className="text-sm font-medium text-primary">
                          {price}
                        </span>
                      )}
                    </div>
                    {data.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {data.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Single select for other options
          <RadioGroup 
            value={currentValue || ''} 
            onValueChange={handleSingleSelect}
          >
            <div className="space-y-3">
              {step.options.map((option) => {
                const data = getOptionData(option);
                const price = formatPrice(option);
                
                return (
                  <div
                    key={data.id}
                    className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
                      currentValue === data.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    <RadioGroupItem 
                      value={data.id} 
                      id={data.id}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <Label 
                          htmlFor={data.id}
                          className="font-medium cursor-pointer"
                        >
                          {data.name}
                          {option.is_default && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              Recommended
                            </Badge>
                          )}
                        </Label>
                        {price && (
                          <span className="text-sm font-medium text-primary">
                            {price}
                          </span>
                        )}
                      </div>
                      {data.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {data.description}
                        </p>
                      )}
                      
                      {/* Additional details based on option type */}
                      {data.weight && (
                        <p className="text-xs text-muted-foreground">
                          Weight: {data.weight}gsm
                        </p>
                      )}
                      {data.width && data.height && (
                        <p className="text-xs text-muted-foreground">
                          Size: {data.width}" × {data.height}"
                        </p>
                      )}
                      {data.business_days !== undefined && (
                        <p className="text-xs text-muted-foreground">
                          {data.business_days === 0 
                            ? 'Same day' 
                            : `${data.business_days} business day${data.business_days !== 1 ? 's' : ''}`
                          }
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </RadioGroup>
        )}
      </ContentWrapper>
    </CardWrapper>
  );
}