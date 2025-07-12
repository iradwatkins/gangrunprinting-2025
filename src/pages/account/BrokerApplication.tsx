import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Building2, FileText, DollarSign, MapPin, Info, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface BrokerApplicationForm {
  company_name: string;
  business_type: string;
  tax_id: string;
  annual_volume: string;
  street_address: string;
  street_address_2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  additional_info: string;
}

export function BrokerApplication() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<BrokerApplicationForm>({
    company_name: '',
    business_type: '',
    tax_id: '',
    annual_volume: '',
    street_address: '',
    street_address_2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'USA',
    additional_info: ''
  });

  // Check if user already has an application
  const { data: existingApplication, isLoading: checkingApplication } = useQuery({
    queryKey: ['broker-application', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('broker_applications')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking application:', error);
      }
      
      return data;
    },
    enabled: !!user,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to apply');
      return;
    }

    setLoading(true);

    try {
      const businessAddress = {
        street_address: formData.street_address,
        street_address_2: formData.street_address_2,
        city: formData.city,
        state: formData.state,
        postal_code: formData.postal_code,
        country: formData.country
      };

      const { error } = await supabase
        .from('broker_applications')
        .insert({
          user_id: user.id,
          company_name: formData.company_name,
          business_type: formData.business_type,
          tax_id: formData.tax_id,
          annual_volume: formData.annual_volume,
          business_address: businessAddress,
          additional_info: formData.additional_info || null
        });

      if (error) throw error;

      toast.success('Application submitted successfully! We will review it within 2-3 business days.');
      navigate('/account');
    } catch (error: any) {
      console.error('Error submitting application:', error);
      toast.error(error.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  if (checkingApplication) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (existingApplication) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Broker Application Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                {existingApplication.status === 'pending' && (
                  <>Your broker application is currently under review. We will notify you once a decision has been made.</>
                )}
                {existingApplication.status === 'approved' && (
                  <>Congratulations! Your broker application has been approved. You now receive broker discounts on all orders.</>
                )}
                {existingApplication.status === 'rejected' && (
                  <>
                    Your broker application was not approved.
                    {existingApplication.rejection_reason && (
                      <> Reason: {existingApplication.rejection_reason}</>
                    )}
                  </>
                )}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Apply for Broker Discount</CardTitle>
          <CardDescription>
            As a qualified broker, you can receive special pricing on all products. 
            Please fill out the form below to apply for broker status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Company Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name *</Label>
                  <Input
                    id="company_name"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business_type">Business Type *</Label>
                  <Select
                    value={formData.business_type}
                    onValueChange={(value) => handleSelectChange('business_type', value)}
                    required
                  >
                    <SelectTrigger id="business_type">
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="print_broker">Print Broker</SelectItem>
                      <SelectItem value="marketing_agency">Marketing Agency</SelectItem>
                      <SelectItem value="design_studio">Design Studio</SelectItem>
                      <SelectItem value="reseller">Reseller</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tax_id">Tax ID / EIN *</Label>
                  <Input
                    id="tax_id"
                    name="tax_id"
                    value={formData.tax_id}
                    onChange={handleInputChange}
                    placeholder="XX-XXXXXXX"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="annual_volume">Estimated Annual Volume *</Label>
                  <Select
                    value={formData.annual_volume}
                    onValueChange={(value) => handleSelectChange('annual_volume', value)}
                    required
                  >
                    <SelectTrigger id="annual_volume">
                      <SelectValue placeholder="Select volume range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="under_10k">Under $10,000</SelectItem>
                      <SelectItem value="10k_50k">$10,000 - $50,000</SelectItem>
                      <SelectItem value="50k_100k">$50,000 - $100,000</SelectItem>
                      <SelectItem value="100k_250k">$100,000 - $250,000</SelectItem>
                      <SelectItem value="over_250k">Over $250,000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Business Address */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Business Address
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="street_address">Street Address *</Label>
                  <Input
                    id="street_address"
                    name="street_address"
                    value={formData.street_address}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="street_address_2">Street Address 2</Label>
                  <Input
                    id="street_address_2"
                    name="street_address_2"
                    value={formData.street_address_2}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="e.g., CA"
                    maxLength={2}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postal_code">ZIP Code *</Label>
                  <Input
                    id="postal_code"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Additional Information
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="additional_info">
                  Tell us more about your business (optional)
                </Label>
                <Textarea
                  id="additional_info"
                  name="additional_info"
                  value={formData.additional_info}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Please provide any additional information that might help us process your application..."
                />
              </div>
            </div>

            <Alert>
              <DollarSign className="h-4 w-4" />
              <AlertDescription>
                Once approved, you'll receive automatic discounts on all orders. 
                The discount percentage varies based on volume and product category.
              </AlertDescription>
            </Alert>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/account')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
    </Layout>
  );
}