import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  CreditCard, 
  Shield, 
  Truck, 
  CheckCircle,
  AlertTriangle,
  Save 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { CheckoutFlowConfig, PaymentGateway } from '@/types/payments';

interface CheckoutSettings {
  flow_config: CheckoutFlowConfig;
  payment_gateways: PaymentGateway[];
  tax_settings: {
    auto_calculate: boolean;
    default_rate: number;
    tax_inclusive: boolean;
  };
  shipping_settings: {
    auto_calculate: boolean;
    free_shipping_threshold: number;
    default_rate: number;
  };
}

export function CheckoutSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<CheckoutSettings>({
    flow_config: {
      type: 'multi_step',
      steps: [
        { id: 'shipping', title: 'Shipping', component: 'ShippingForm', required: true, order: 1 },
        { id: 'billing', title: 'Billing', component: 'BillingForm', required: true, order: 2 },
        { id: 'shipping-method', title: 'Shipping Method', component: 'ShippingMethodForm', required: true, order: 3 },
        { id: 'payment', title: 'Payment', component: 'PaymentForm', required: true, order: 4 },
        { id: 'review', title: 'Review', component: 'OrderReview', required: true, order: 5 }
      ],
      theme: 'light',
      allow_guest_checkout: true,
      require_phone: false,
      require_company: false
    },
    payment_gateways: [
      {
        id: 'square',
        name: 'Square',
        type: 'square',
        is_enabled: true,
        is_test_mode: true,
        config: {
          square: {
            application_id: '',
            location_id: '',
            sandbox_application_id: 'sandbox-sq0idb-demo',
            sandbox_location_id: 'sandbox-location-demo'
          }
        }
      },
      {
        id: 'paypal',
        name: 'PayPal',
        type: 'paypal',
        is_enabled: true,
        is_test_mode: true,
        config: {
          paypal: {
            client_id: '',
            client_secret: '',
            sandbox_client_id: 'demo-paypal-client-id',
            sandbox_client_secret: 'demo-paypal-secret'
          }
        }
      },
      {
        id: 'cashapp',
        name: 'Cash App Pay',
        type: 'cashapp',
        is_enabled: false,
        is_test_mode: true,
        config: {
          cashapp: {
            client_id: '',
            client_secret: '',
            sandbox_client_id: '',
            sandbox_client_secret: ''
          }
        }
      }
    ],
    tax_settings: {
      auto_calculate: true,
      default_rate: 8.5,
      tax_inclusive: false
    },
    shipping_settings: {
      auto_calculate: true,
      free_shipping_threshold: 100,
      default_rate: 9.99
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would make an API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({ 
        title: 'Success',
        description: 'Checkout settings saved successfully'
      });
      setHasChanges(false);
    } catch (error) {
      toast({ 
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateFlowConfig = (updates: Partial<CheckoutFlowConfig>) => {
    setSettings(prev => ({
      ...prev,
      flow_config: { ...prev.flow_config, ...updates }
    }));
    setHasChanges(true);
  };

  const updatePaymentGateway = (gatewayId: string, updates: Partial<PaymentGateway>) => {
    setSettings(prev => ({
      ...prev,
      payment_gateways: prev.payment_gateways.map(gateway =>
        gateway.id === gatewayId ? { ...gateway, ...updates } : gateway
      )
    }));
    setHasChanges(true);
  };

  return (
    <AdminLayout>
      <ErrorBoundary>
        <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Checkout Settings</h1>
            <p className="text-gray-600 mt-2">Configure checkout flow, payment methods, and processing options</p>
          </div>
          <div className="flex space-x-4">
            {hasChanges && (
              <Badge variant="secondary" className="mr-4">
                <AlertTriangle className="w-4 h-4 mr-1" />
                Unsaved changes
              </Badge>
            )}
            <Button 
              onClick={handleSave} 
              disabled={isLoading || !hasChanges}
              className="flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{isLoading ? 'Saving...' : 'Save Settings'}</span>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="flow" className="space-y-6">
          <TabsList>
            <TabsTrigger value="flow" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Checkout Flow</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4" />
              <span>Payment Methods</span>
            </TabsTrigger>
            <TabsTrigger value="shipping" className="flex items-center space-x-2">
              <Truck className="w-4 h-4" />
              <span>Shipping & Tax</span>
            </TabsTrigger>
          </TabsList>

          {/* Checkout Flow Configuration */}
          <TabsContent value="flow">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Flow Type</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup
                    value={settings.flow_config.type}
                    onValueChange={(value: 'multi_step' | 'single_page') => 
                      updateFlowConfig({ type: value })
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="multi_step" id="multi_step" />
                      <Label htmlFor="multi_step">Multi-step Wizard</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="single_page" id="single_page" />
                      <Label htmlFor="single_page">Single Page</Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Guest Checkout</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="guest-checkout">Allow guest checkout</Label>
                    <Switch
                      id="guest-checkout"
                      checked={settings.flow_config.allow_guest_checkout}
                      onCheckedChange={(checked) => 
                        updateFlowConfig({ allow_guest_checkout: checked })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="require-phone">Require phone number</Label>
                    <Switch
                      id="require-phone"
                      checked={settings.flow_config.require_phone}
                      onCheckedChange={(checked) => 
                        updateFlowConfig({ require_phone: checked })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="require-company">Require company name</Label>
                    <Switch
                      id="require-company"
                      checked={settings.flow_config.require_company}
                      onCheckedChange={(checked) => 
                        updateFlowConfig({ require_company: checked })
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Payment Methods Configuration */}
          <TabsContent value="payments">
            <div className="space-y-6">
              {settings.payment_gateways.map((gateway) => (
                <Card key={gateway.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <CreditCard className="w-5 h-5" />
                        <span>{gateway.name}</span>
                        {gateway.is_enabled ? (
                          <Badge variant="default">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Enabled
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Disabled</Badge>
                        )}
                      </CardTitle>
                      <Switch
                        checked={gateway.is_enabled}
                        onCheckedChange={(checked) => 
                          updatePaymentGateway(gateway.id, { is_enabled: checked })
                        }
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Test Mode</Label>
                      <Switch
                        checked={gateway.is_test_mode}
                        onCheckedChange={(checked) => 
                          updatePaymentGateway(gateway.id, { is_test_mode: checked })
                        }
                      />
                    </div>

                    {gateway.is_test_mode && (
                      <Alert>
                        <Shield className="h-4 w-4" />
                        <AlertDescription>
                          Test mode is enabled. No real transactions will be processed.
                        </AlertDescription>
                      </Alert>
                    )}

                    <Separator />

                    {gateway.type === 'square' && gateway.config.square && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`${gateway.id}-app-id`}>Application ID</Label>
                          <Input
                            id={`${gateway.id}-app-id`}
                            value={gateway.config.square.application_id}
                            onChange={(e) => updatePaymentGateway(gateway.id, {
                              config: {
                                ...gateway.config,
                                square: {
                                  ...gateway.config.square,
                                  application_id: e.target.value
                                }
                              }
                            })}
                            placeholder="Square Application ID"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`${gateway.id}-location-id`}>Location ID</Label>
                          <Input
                            id={`${gateway.id}-location-id`}
                            value={gateway.config.square.location_id}
                            onChange={(e) => updatePaymentGateway(gateway.id, {
                              config: {
                                ...gateway.config,
                                square: {
                                  ...gateway.config.square,
                                  location_id: e.target.value
                                }
                              }
                            })}
                            placeholder="Square Location ID"
                          />
                        </div>
                      </div>
                    )}

                    {gateway.type === 'paypal' && gateway.config.paypal && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`${gateway.id}-client-id`}>Client ID</Label>
                          <Input
                            id={`${gateway.id}-client-id`}
                            value={gateway.config.paypal.client_id}
                            onChange={(e) => updatePaymentGateway(gateway.id, {
                              config: {
                                ...gateway.config,
                                paypal: {
                                  ...gateway.config.paypal,
                                  client_id: e.target.value
                                }
                              }
                            })}
                            placeholder="PayPal Client ID"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`${gateway.id}-client-secret`}>Client Secret</Label>
                          <Input
                            id={`${gateway.id}-client-secret`}
                            type="password"
                            value={gateway.config.paypal.client_secret}
                            onChange={(e) => updatePaymentGateway(gateway.id, {
                              config: {
                                ...gateway.config,
                                paypal: {
                                  ...gateway.config.paypal,
                                  client_secret: e.target.value
                                }
                              }
                            })}
                            placeholder="PayPal Client Secret"
                          />
                        </div>
                      </div>
                    )}

                    {gateway.type === 'cashapp' && gateway.config.cashapp && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`${gateway.id}-client-id`}>Client ID</Label>
                          <Input
                            id={`${gateway.id}-client-id`}
                            value={gateway.config.cashapp.client_id}
                            onChange={(e) => updatePaymentGateway(gateway.id, {
                              config: {
                                ...gateway.config,
                                cashapp: {
                                  ...gateway.config.cashapp,
                                  client_id: e.target.value
                                }
                              }
                            })}
                            placeholder="Cash App Client ID"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`${gateway.id}-client-secret`}>Client Secret</Label>
                          <Input
                            id={`${gateway.id}-client-secret`}
                            type="password"
                            value={gateway.config.cashapp.client_secret}
                            onChange={(e) => updatePaymentGateway(gateway.id, {
                              config: {
                                ...gateway.config,
                                cashapp: {
                                  ...gateway.config.cashapp,
                                  client_secret: e.target.value
                                }
                              }
                            })}
                            placeholder="Cash App Client Secret"
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Shipping & Tax Configuration */}
          <TabsContent value="shipping">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tax Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-tax">Auto-calculate tax</Label>
                    <Switch
                      id="auto-tax"
                      checked={settings.tax_settings.auto_calculate}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({
                          ...prev,
                          tax_settings: { ...prev.tax_settings, auto_calculate: checked }
                        }))
                      }
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="default-tax-rate">Default tax rate (%)</Label>
                    <Input
                      id="default-tax-rate"
                      type="number"
                      step="0.1"
                      value={settings.tax_settings.default_rate}
                      onChange={(e) => 
                        setSettings(prev => ({
                          ...prev,
                          tax_settings: { ...prev.tax_settings, default_rate: parseFloat(e.target.value) || 0 }
                        }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="tax-inclusive">Tax inclusive pricing</Label>
                    <Switch
                      id="tax-inclusive"
                      checked={settings.tax_settings.tax_inclusive}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({
                          ...prev,
                          tax_settings: { ...prev.tax_settings, tax_inclusive: checked }
                        }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Shipping Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-shipping">Auto-calculate shipping</Label>
                    <Switch
                      id="auto-shipping"
                      checked={settings.shipping_settings.auto_calculate}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({
                          ...prev,
                          shipping_settings: { ...prev.shipping_settings, auto_calculate: checked }
                        }))
                      }
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="free-shipping-threshold">Free shipping threshold ($)</Label>
                    <Input
                      id="free-shipping-threshold"
                      type="number"
                      step="0.01"
                      value={settings.shipping_settings.free_shipping_threshold}
                      onChange={(e) => 
                        setSettings(prev => ({
                          ...prev,
                          shipping_settings: { ...prev.shipping_settings, free_shipping_threshold: parseFloat(e.target.value) || 0 }
                        }))
                      }
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="default-shipping-rate">Default shipping rate ($)</Label>
                    <Input
                      id="default-shipping-rate"
                      type="number"
                      step="0.01"
                      value={settings.shipping_settings.default_rate}
                      onChange={(e) => 
                        setSettings(prev => ({
                          ...prev,
                          shipping_settings: { ...prev.shipping_settings, default_rate: parseFloat(e.target.value) || 0 }
                        }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      </ErrorBoundary>
    </AdminLayout>
  );
}