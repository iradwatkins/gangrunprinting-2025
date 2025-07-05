import { useState } from 'react';
import { ArrowLeft, Shield, Building, FileText, DollarSign, MapPin, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import type { BrokerApplicationRequest } from '@/types/auth';
import { z } from 'zod';

const brokerApplicationSchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  business_type: z.string().min(1, 'Business type is required'),
  tax_id: z.string().min(1, 'Tax ID is required'),
  annual_volume: z.string().min(1, 'Annual volume is required'),
  business_address: z.object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    company: z.string().optional(),
    street_address: z.string().min(1, 'Street address is required'),
    street_address_2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    postal_code: z.string().min(1, 'Postal code is required'),
    country: z.string().min(1, 'Country is required'),
    phone: z.string().optional()
  }),
  additional_info: z.string().optional()
});

export function BrokerApplication() {
  const { isBroker, applyForBroker } = useAuth();
  const { brokerApplication } = useProfile();
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    try {
      brokerApplicationSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          const path = err.path.join('.');
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        await applyForBroker(formData);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const updateFormData = (path: string, value: string) => {
    const keys = path.split('.');
    if (keys.length === 1) {
      setFormData(prev => ({ ...prev, [keys[0]]: value }));
    } else if (keys.length === 2) {
      setFormData(prev => ({
        ...prev,
        [keys[0]]: {
          ...prev[keys[0] as keyof BrokerApplicationRequest] as any,
          [keys[1]]: value
        }
      }));
    }
  };

  // If user is already a broker
  if (isBroker) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-card border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/account">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Broker Status</h1>
                <p className="text-muted-foreground">
                  Your broker account details
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-green-600" />
                  Broker Account Active
                </CardTitle>
                <CardDescription>
                  You have an active broker account with special pricing benefits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center py-8">
                  <Badge className="bg-gradient-to-r from-green-500 to-blue-600 text-white text-lg px-6 py-3">
                    <Shield className="h-5 w-5 mr-2" />
                    Verified Broker
                  </Badge>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2 text-sm">
                  <div>
                    <span className="font-medium">Broker Discount:</span>
                    <div className="text-muted-foreground">Up to 20% on all orders</div>
                  </div>
                  <div>
                    <span className="font-medium">Special Pricing:</span>
                    <div className="text-muted-foreground">Volume discounts available</div>
                  </div>
                  <div>
                    <span className="font-medium">Priority Support:</span>
                    <div className="text-muted-foreground">Dedicated account manager</div>
                  </div>
                  <div>
                    <span className="font-medium">Custom Orders:</span>
                    <div className="text-muted-foreground">Special project pricing</div>
                  </div>
                </div>

                <Separator />

                <div className="text-center">
                  <Button asChild>
                    <Link to="/broker/dashboard">
                      View Broker Dashboard
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // If application exists and is pending/rejected
  if (brokerApplication) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-card border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/account">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Broker Application Status</h1>
                <p className="text-muted-foreground">
                  Track your broker application progress
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Application Status
                  </span>
                  <Badge 
                    variant={brokerApplication.status === 'approved' ? 'secondary' : 
                             brokerApplication.status === 'rejected' ? 'destructive' : 'outline'}
                    className={brokerApplication.status === 'approved' ? 'text-green-600' : ''}
                  >
                    {brokerApplication.status.charAt(0).toUpperCase() + brokerApplication.status.slice(1)}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Application #{brokerApplication.id.slice(0, 8)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Company:</span>
                    <span>{brokerApplication.company_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Business Type:</span>
                    <span>{brokerApplication.business_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Submitted:</span>
                    <span>{new Date(brokerApplication.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {brokerApplication.status === 'pending' && (
                  <Alert>
                    <AlertDescription>
                      Your application is currently under review. We'll notify you once it's processed.
                      Processing typically takes 3-5 business days.
                    </AlertDescription>
                  </Alert>
                )}

                {brokerApplication.status === 'rejected' && brokerApplication.rejection_reason && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      <div className="font-medium mb-1">Application Rejected</div>
                      <div>{brokerApplication.rejection_reason}</div>
                      <div className="mt-2 text-sm">
                        You may submit a new application after addressing the concerns above.
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // New application form
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/account">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Apply for Broker Account</h1>
              <p className="text-muted-foreground">
                Get access to special pricing and volume discounts
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          {/* Benefits Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-blue-600" />
                Broker Account Benefits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 text-sm">
                <div className="flex items-start space-x-2">
                  <DollarSign className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-medium">Volume Discounts</div>
                    <div className="text-muted-foreground">Up to 20% off on all orders</div>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <FileText className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-medium">Priority Processing</div>
                    <div className="text-muted-foreground">Faster order processing</div>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Building className="h-4 w-4 text-purple-600 mt-0.5" />
                  <div>
                    <div className="font-medium">Dedicated Support</div>
                    <div className="text-muted-foreground">Personal account manager</div>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Shield className="h-4 w-4 text-orange-600 mt-0.5" />
                  <div>
                    <div className="font-medium">Custom Solutions</div>
                    <div className="text-muted-foreground">Special project pricing</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Application Form */}
          <Card>
            <CardHeader>
              <CardTitle>Broker Application Form</CardTitle>
              <CardDescription>
                Please provide your business information for review
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Company Information */}
                <div className="space-y-4">
                  <h3 className="font-medium">Company Information</h3>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="company-name">Company Name *</Label>
                      <Input
                        id="company-name"
                        value={formData.company_name}
                        onChange={(e) => updateFormData('company_name', e.target.value)}
                        className={errors.company_name ? 'border-destructive' : ''}
                      />
                      {errors.company_name && (
                        <p className="text-sm text-destructive">{errors.company_name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="business-type">Business Type *</Label>
                      <Select 
                        value={formData.business_type} 
                        onValueChange={(value) => updateFormData('business_type', value)}
                      >
                        <SelectTrigger className={errors.business_type ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Select business type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="printing-service">Printing Service Provider</SelectItem>
                          <SelectItem value="marketing-agency">Marketing Agency</SelectItem>
                          <SelectItem value="design-studio">Design Studio</SelectItem>
                          <SelectItem value="retail">Retail Business</SelectItem>
                          <SelectItem value="nonprofit">Non-Profit Organization</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.business_type && (
                        <p className="text-sm text-destructive">{errors.business_type}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tax-id">Tax ID / EIN *</Label>
                      <Input
                        id="tax-id"
                        value={formData.tax_id}
                        onChange={(e) => updateFormData('tax_id', e.target.value)}
                        placeholder="XX-XXXXXXX"
                        className={errors.tax_id ? 'border-destructive' : ''}
                      />
                      {errors.tax_id && (
                        <p className="text-sm text-destructive">{errors.tax_id}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="annual-volume">Annual Print Volume *</Label>
                      <Select 
                        value={formData.annual_volume} 
                        onValueChange={(value) => updateFormData('annual_volume', value)}
                      >
                        <SelectTrigger className={errors.annual_volume ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Select volume range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="under-10k">Under $10,000</SelectItem>
                          <SelectItem value="10k-50k">$10,000 - $50,000</SelectItem>
                          <SelectItem value="50k-100k">$50,000 - $100,000</SelectItem>
                          <SelectItem value="100k-500k">$100,000 - $500,000</SelectItem>
                          <SelectItem value="over-500k">Over $500,000</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.annual_volume && (
                        <p className="text-sm text-destructive">{errors.annual_volume}</p>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Business Address */}
                <div className="space-y-4">
                  <h3 className="font-medium">Business Address</h3>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="first-name">First Name *</Label>
                      <Input
                        id="first-name"
                        value={formData.business_address.first_name}
                        onChange={(e) => updateFormData('business_address.first_name', e.target.value)}
                        className={errors['business_address.first_name'] ? 'border-destructive' : ''}
                      />
                      {errors['business_address.first_name'] && (
                        <p className="text-sm text-destructive">{errors['business_address.first_name']}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="last-name">Last Name *</Label>
                      <Input
                        id="last-name"
                        value={formData.business_address.last_name}
                        onChange={(e) => updateFormData('business_address.last_name', e.target.value)}
                        className={errors['business_address.last_name'] ? 'border-destructive' : ''}
                      />
                      {errors['business_address.last_name'] && (
                        <p className="text-sm text-destructive">{errors['business_address.last_name']}</p>
                      )}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="street-address">Street Address *</Label>
                      <Input
                        id="street-address"
                        value={formData.business_address.street_address}
                        onChange={(e) => updateFormData('business_address.street_address', e.target.value)}
                        className={errors['business_address.street_address'] ? 'border-destructive' : ''}
                      />
                      {errors['business_address.street_address'] && (
                        <p className="text-sm text-destructive">{errors['business_address.street_address']}</p>
                      )}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="street-address-2">Apartment, suite, etc. (Optional)</Label>
                      <Input
                        id="street-address-2"
                        value={formData.business_address.street_address_2}
                        onChange={(e) => updateFormData('business_address.street_address_2', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={formData.business_address.city}
                        onChange={(e) => updateFormData('business_address.city', e.target.value)}
                        className={errors['business_address.city'] ? 'border-destructive' : ''}
                      />
                      {errors['business_address.city'] && (
                        <p className="text-sm text-destructive">{errors['business_address.city']}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={formData.business_address.state}
                        onChange={(e) => updateFormData('business_address.state', e.target.value)}
                        className={errors['business_address.state'] ? 'border-destructive' : ''}
                      />
                      {errors['business_address.state'] && (
                        <p className="text-sm text-destructive">{errors['business_address.state']}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="postal-code">Postal Code *</Label>
                      <Input
                        id="postal-code"
                        value={formData.business_address.postal_code}
                        onChange={(e) => updateFormData('business_address.postal_code', e.target.value)}
                        className={errors['business_address.postal_code'] ? 'border-destructive' : ''}
                      />
                      {errors['business_address.postal_code'] && (
                        <p className="text-sm text-destructive">{errors['business_address.postal_code']}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number (Optional)</Label>
                      <Input
                        id="phone"
                        value={formData.business_address.phone}
                        onChange={(e) => updateFormData('business_address.phone', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Additional Information */}
                <div className="space-y-2">
                  <Label htmlFor="additional-info">Additional Information (Optional)</Label>
                  <Textarea
                    id="additional-info"
                    value={formData.additional_info}
                    onChange={(e) => updateFormData('additional_info', e.target.value)}
                    placeholder="Please provide any additional information about your business, printing needs, or special requirements..."
                    rows={4}
                  />
                </div>

                <Alert>
                  <AlertDescription>
                    Applications are typically reviewed within 3-5 business days. 
                    You'll receive an email notification once your application is processed.
                  </AlertDescription>
                </Alert>

                <div className="flex justify-end">
                  <Button type="submit" disabled={isSubmitting}>
                    <Send className="h-4 w-4 mr-2" />
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}