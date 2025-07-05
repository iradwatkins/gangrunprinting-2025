import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBroker } from '@/hooks/useBroker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Crown, 
  Building, 
  DollarSign, 
  FileText, 
  CheckCircle,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import type { BrokerApplicationRequest } from '@/types/auth';

interface BrokerRequestFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function BrokerRequestForm({ onSuccess, onCancel }: BrokerRequestFormProps) {
  const navigate = useNavigate();
  const { applyForBrokerStatus } = useBroker();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<BrokerApplicationRequest>({
    company_name: '',
    business_type: '',
    tax_id: '',
    annual_volume: '',
    business_address: {
      first_name: '',
      last_name: '',
      company: '',
      street_address: '',
      street_address_2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'US',
      phone: ''
    },
    additional_info: ''
  });

  const businessTypes = [
    'Print Shop',
    'Marketing Agency',
    'Design Studio',
    'Corporate Office',
    'Non-Profit Organization',
    'Educational Institution',
    'Government Agency',
    'Other'
  ];

  const volumeRanges = [
    { value: '10000', label: '$10,000 - $49,999', tier: 'Bronze' },
    { value: '50000', label: '$50,000 - $149,999', tier: 'Silver' },
    { value: '150000', label: '$150,000 - $499,999', tier: 'Gold' },
    { value: '500000', label: '$500,000+', tier: 'Platinum' }
  ];

  const updateFormData = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof BrokerApplicationRequest] as any),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.company_name && formData.business_type && formData.tax_id);
      case 2:
        return !!(formData.annual_volume);
      case 3:
        return !!(
          formData.business_address.street_address &&
          formData.business_address.city &&
          formData.business_address.state &&
          formData.business_address.postal_code
        );
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
      setError(null);
    } else {
      setError('Please fill in all required fields before proceeding.');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      setError('Please complete all required fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await applyForBrokerStatus(formData);
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/broker/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSelectedTier = () => {
    const range = volumeRanges.find(r => r.value === formData.annual_volume);
    return range?.tier || null;
  };

  const progressPercentage = (currentStep / 4) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Crown className="h-6 w-6 mr-2 text-yellow-500" />
            Apply for Broker Status
          </CardTitle>
          <div className="space-y-2">
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between text-sm text-gray-600">
              <span>Step {currentStep} of 4</span>
              <span>{Math.round(progressPercentage)}% Complete</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step Content */}
      <Card>
        <CardContent className="pt-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center mb-4">
                <Building className="h-5 w-5 mr-2 text-blue-600" />
                <h3 className="text-lg font-medium">Business Information</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="company_name">Company Name *</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => updateFormData('company_name', e.target.value)}
                    placeholder="Enter your company name"
                  />
                </div>

                <div>
                  <Label htmlFor="business_type">Business Type *</Label>
                  <Select
                    value={formData.business_type}
                    onValueChange={(value) => updateFormData('business_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your business type" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tax_id">Tax ID / EIN *</Label>
                  <Input
                    id="tax_id"
                    value={formData.tax_id}
                    onChange={(e) => updateFormData('tax_id', e.target.value)}
                    placeholder="XX-XXXXXXX"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Your federal tax identification number
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center mb-4">
                <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                <h3 className="text-lg font-medium">Annual Volume</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Expected Annual Print Volume *</Label>
                  <div className="grid grid-cols-1 gap-3 mt-2">
                    {volumeRanges.map((range) => (
                      <div
                        key={range.value}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          formData.annual_volume === range.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => updateFormData('annual_volume', range.value)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{range.label}</div>
                            <div className="text-sm text-gray-600">
                              Qualifies for {range.tier} tier status
                            </div>
                          </div>
                          <Badge variant={formData.annual_volume === range.value ? 'default' : 'outline'}>
                            {range.tier}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {getSelectedTier() && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
                      <div>
                        <div className="font-medium text-blue-900">
                          {getSelectedTier()} Tier Benefits
                        </div>
                        <div className="text-sm text-blue-700 mt-1">
                          {getSelectedTier() === 'Bronze' && '5% base discount, standard support'}
                          {getSelectedTier() === 'Silver' && '10% base discount, priority support, 5% rush discount'}
                          {getSelectedTier() === 'Gold' && '15% base discount, account manager, 10% rush discount'}
                          {getSelectedTier() === 'Platinum' && '20% base discount, white-glove service, 15% rush discount'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center mb-4">
                <Building className="h-5 w-5 mr-2 text-purple-600" />
                <h3 className="text-lg font-medium">Business Address</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="street_address">Street Address *</Label>
                  <Input
                    id="street_address"
                    value={formData.business_address.street_address}
                    onChange={(e) => updateFormData('business_address.street_address', e.target.value)}
                    placeholder="123 Main Street"
                  />
                </div>

                <div>
                  <Label htmlFor="street_address_2">Suite/Unit (Optional)</Label>
                  <Input
                    id="street_address_2"
                    value={formData.business_address.street_address_2}
                    onChange={(e) => updateFormData('business_address.street_address_2', e.target.value)}
                    placeholder="Suite 100"
                  />
                </div>

                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.business_address.city}
                    onChange={(e) => updateFormData('business_address.city', e.target.value)}
                    placeholder="City"
                  />
                </div>

                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={formData.business_address.state}
                    onChange={(e) => updateFormData('business_address.state', e.target.value)}
                    placeholder="State"
                  />
                </div>

                <div>
                  <Label htmlFor="postal_code">ZIP Code *</Label>
                  <Input
                    id="postal_code"
                    value={formData.business_address.postal_code}
                    onChange={(e) => updateFormData('business_address.postal_code', e.target.value)}
                    placeholder="12345"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Business Phone</Label>
                  <Input
                    id="phone"
                    value={formData.business_address.phone}
                    onChange={(e) => updateFormData('business_address.phone', e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="flex items-center mb-4">
                <FileText className="h-5 w-5 mr-2 text-orange-600" />
                <h3 className="text-lg font-medium">Additional Information</h3>
              </div>

              <div>
                <Label htmlFor="additional_info">
                  Tell us more about your business (Optional)
                </Label>
                <Textarea
                  id="additional_info"
                  value={formData.additional_info}
                  onChange={(e) => updateFormData('additional_info', e.target.value)}
                  placeholder="Describe your business, print needs, or any special requirements..."
                  rows={4}
                />
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                  <div>
                    <div className="font-medium text-green-900">Ready to Submit</div>
                    <div className="text-sm text-green-700 mt-1">
                      Your application will be reviewed within 2-3 business days. 
                      You'll receive an email notification once approved.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <div>
          {currentStep > 1 && (
            <Button variant="outline" onClick={handlePrevious}>
              Previous
            </Button>
          )}
          {onCancel && currentStep === 1 && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>

        <div>
          {currentStep < 4 ? (
            <Button onClick={handleNext} disabled={!validateStep(currentStep)}>
              Continue
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !validateStep(3)}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}