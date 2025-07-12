import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash2, AlertCircle, Settings, Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { addOnsApi } from '@/api/global-options';
import type { Tables } from '@/integrations/supabase/types';

type AddOn = Tables<'add_ons'>;

interface AddOnFormData {
  name: string;
  pricing_model: 'flat' | 'percentage' | 'per_unit' | 'per_sq_inch' | 'custom';
  configuration: any;
  description: string;
  tooltip_text: string;
  additional_turnaround_days: number;
  has_sub_options: boolean;
  is_mandatory: boolean;
  is_active: boolean;
}

export function AddOnsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddOn, setEditingAddOn] = useState<AddOn | null>(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState<AddOnFormData>({
    name: '',
    pricing_model: 'flat',
    configuration: {},
    description: '',
    tooltip_text: '',
    additional_turnaround_days: 0,
    has_sub_options: false,
    is_mandatory: false,
    is_active: true
  });

  // Fetch add-ons with React Query
  const { data: addOns = [], isLoading, error } = useQuery({
    queryKey: ['addOns'],
    queryFn: async () => {
      const response = await addOnsApi.getAll();
      if (response.error) throw new Error(response.error);
      return response.data || [];
    },
    staleTime: 30000,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: AddOnFormData) => addOnsApi.create(data),
    onSuccess: (result) => {
      if (result.error) throw new Error(result.error);
      toast({ title: 'Success', description: 'Add-on created successfully' });
      queryClient.invalidateQueries({ queryKey: ['addOns'] });
      resetForm();
      setIsFormOpen(false);
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to create add-on', 
        variant: 'destructive' 
      });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AddOnFormData> }) => 
      addOnsApi.update(id, data),
    onSuccess: (result) => {
      if (result.error) throw new Error(result.error);
      toast({ title: 'Success', description: 'Add-on updated successfully' });
      queryClient.invalidateQueries({ queryKey: ['addOns'] });
      resetForm();
      setIsFormOpen(false);
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to update add-on', 
        variant: 'destructive' 
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => addOnsApi.delete(id),
    onSuccess: (result) => {
      if (result.error) throw new Error(result.error);
      toast({ title: 'Success', description: 'Add-on deleted successfully' });
      queryClient.invalidateQueries({ queryKey: ['addOns'] });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to delete add-on', 
        variant: 'destructive' 
      });
    }
  });

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this add-on?')) return;
    deleteMutation.mutate(id);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      pricing_model: 'flat',
      configuration: {},
      description: '',
      tooltip_text: '',
      additional_turnaround_days: 0,
      has_sub_options: false,
      is_mandatory: false,
      is_active: true
    });
    setEditingAddOn(null);
    setActiveTab('basic');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAddOn) {
      updateMutation.mutate({ id: editingAddOn.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (addOn: AddOn) => {
    setEditingAddOn(addOn);
    setFormData({
      name: addOn.name,
      pricing_model: addOn.pricing_model as any,
      configuration: addOn.configuration || {},
      description: addOn.description || '',
      tooltip_text: addOn.tooltip_text || '',
      additional_turnaround_days: addOn.additional_turnaround_days || 0,
      has_sub_options: addOn.has_sub_options || false,
      is_mandatory: addOn.is_mandatory || false,
      is_active: addOn.is_active
    });
    setIsFormOpen(true);
  };

  const renderPricingConfiguration = () => {
    const { pricing_model, configuration } = formData;
    
    switch (pricing_model) {
      case 'flat':
        return (
          <div>
            <Label htmlFor="flat_price">Price ($)</Label>
            <Input
              id="flat_price"
              type="number"
              step="0.01"
              value={configuration.price || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                configuration: { ...prev.configuration, price: parseFloat(e.target.value) || 0 }
              }))}
              placeholder="5.00"
            />
          </div>
        );
      
      case 'percentage':
        return (
          <div className="space-y-3">
            <div>
              <Label htmlFor="percentage">Percentage (%)</Label>
              <Input
                id="percentage"
                type="number"
                step="0.01"
                value={configuration.percentage || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  configuration: { ...prev.configuration, percentage: parseFloat(e.target.value) || 0 }
                }))}
                placeholder="12.5"
              />
            </div>
            <div>
              <Label htmlFor="applies_to">Applies To</Label>
              <Select
                value={configuration.applies_to || 'base_price'}
                onValueChange={(value) => setFormData(prev => ({
                  ...prev,
                  configuration: { ...prev.configuration, applies_to: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select what percentage applies to" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="base_price">Base Price</SelectItem>
                  <SelectItem value="adjusted_base_price">Adjusted Base Price</SelectItem>
                  <SelectItem value="base_paper_print_price">Base Paper Print Price</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      
      case 'per_unit':
        return (
          <div className="space-y-3">
            <div>
              <Label htmlFor="price_per_piece">Price per Piece ($)</Label>
              <Input
                id="price_per_piece"
                type="number"
                step="0.001"
                value={configuration.price_per_piece || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  configuration: { ...prev.configuration, price_per_piece: parseFloat(e.target.value) || 0 }
                }))}
                placeholder="0.01"
              />
            </div>
            <div>
              <Label htmlFor="setup_fee">Setup Fee ($)</Label>
              <Input
                id="setup_fee"
                type="number"
                step="0.01"
                value={configuration.setup_fee || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  configuration: { ...prev.configuration, setup_fee: parseFloat(e.target.value) || 0 }
                }))}
                placeholder="20.00"
              />
            </div>
          </div>
        );
      
      case 'custom':
        return (
          <div>
            <Label htmlFor="custom_config">Custom Configuration (JSON)</Label>
            <Textarea
              id="custom_config"
              value={JSON.stringify(configuration, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  setFormData(prev => ({ ...prev, configuration: parsed }));
                } catch {
                  // Invalid JSON, don't update
                }
              }}
              placeholder='{"setup_fee": 20.00, "price_per_piece": 0.01}'
              rows={4}
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter valid JSON for custom pricing configuration
            </p>
          </div>
        );
      
      default:
        return null;
    }
  };

  const getPricingBadge = (model: string) => {
    const badges = {
      flat: { variant: 'default' as const, text: 'Fixed' },
      percentage: { variant: 'secondary' as const, text: 'Percentage' },
      per_unit: { variant: 'outline' as const, text: 'Per Unit' },
      per_sq_inch: { variant: 'outline' as const, text: 'Per Sq Inch' },
      custom: { variant: 'destructive' as const, text: 'Custom' }
    };
    return badges[model as keyof typeof badges] || { variant: 'default' as const, text: model };
  };

  const filteredAddOns = addOns.filter(addOn =>
    addOn.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    addOn.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load add-ons: {(error as Error).message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Add-on Services</h1>
            <p className="text-gray-600">Manage additional services and pricing options</p>
          </div>
          
          <Button onClick={() => {
            resetForm();
            setIsFormOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Service
          </Button>
        </div>

        {/* Inline Form */}
        {isFormOpen && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {editingAddOn ? 'Edit Add-on Service' : 'Add New Service'}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFormOpen(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              
              <form onSubmit={handleSubmit}>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="pricing">Pricing</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basic" className="space-y-4">
                    <div>
                      <Label htmlFor="name">Service Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Digital Proof, Perforation"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Brief description of the service"
                        rows={2}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="tooltip_text">Customer Tooltip</Label>
                      <Textarea
                        id="tooltip_text"
                        value={formData.tooltip_text}
                        onChange={(e) => setFormData(prev => ({ ...prev, tooltip_text: e.target.value }))}
                        placeholder="Helpful information for customers"
                        rows={2}
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="pricing" className="space-y-4">
                    <div>
                      <Label htmlFor="pricing_model">Pricing Model</Label>
                      <Select
                        value={formData.pricing_model}
                        onValueChange={(value: any) => setFormData(prev => ({ 
                          ...prev, 
                          pricing_model: value,
                          configuration: {} // Reset configuration when model changes
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select pricing model" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="flat">Fixed Price</SelectItem>
                          <SelectItem value="percentage">Percentage Markup</SelectItem>
                          <SelectItem value="per_unit">Per Unit/Piece</SelectItem>
                          <SelectItem value="per_sq_inch">Per Square Inch</SelectItem>
                          <SelectItem value="custom">Custom Configuration</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {renderPricingConfiguration()}
                  </TabsContent>
                  
                  <TabsContent value="advanced" className="space-y-4">
                    <div>
                      <Label htmlFor="additional_turnaround_days">Additional Turnaround Days</Label>
                      <Input
                        id="additional_turnaround_days"
                        type="number"
                        min="0"
                        value={formData.additional_turnaround_days}
                        onChange={(e) => setFormData(prev => ({ ...prev, additional_turnaround_days: parseInt(e.target.value) || 0 }))}
                        placeholder="0"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="has_sub_options"
                          checked={formData.has_sub_options}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, has_sub_options: checked }))}
                        />
                        <Label htmlFor="has_sub_options">Has Sub-options</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="is_mandatory"
                          checked={formData.is_mandatory}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_mandatory: checked }))}
                        />
                        <Label htmlFor="is_mandatory">Mandatory Service</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="is_active"
                          checked={formData.is_active}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                        />
                        <Label htmlFor="is_active">Active</Label>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="flex gap-2 mt-6">
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingAddOn ? 'Update' : 'Create'} Service
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search add-on services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : filteredAddOns.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No information at this time</p>
              {searchTerm && <p className="text-sm text-gray-400 mt-2">Try adjusting your search</p>}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAddOns.map((addOn) => {
              const pricingBadge = getPricingBadge(addOn.pricing_model);
              return (
                <Card key={addOn.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          {addOn.name}
                        </CardTitle>
                        <CardDescription>
                          {addOn.additional_turnaround_days > 0 && `+${addOn.additional_turnaround_days} days`}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Badge variant={addOn.is_active ? 'default' : 'secondary'}>
                          {addOn.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant={pricingBadge.variant}>
                          {pricingBadge.text}
                        </Badge>
                        {addOn.is_mandatory && <Badge variant="destructive">Mandatory</Badge>}
                        {addOn.has_sub_options && <Badge variant="outline">Sub-options</Badge>}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {addOn.description && (
                      <p className="text-sm text-gray-600 mb-2">{addOn.description}</p>
                    )}
                    {addOn.tooltip_text && (
                      <div className="flex items-start gap-1 mb-3">
                        <Info className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-gray-500">{addOn.tooltip_text}</p>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(addOn)}>
                        <Edit className="h-3 w-3 mr-1" />Edit
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(addOn.id)}>
                        <Trash2 className="h-3 w-3 mr-1" />Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
        
        <div className="text-sm text-gray-500">
          Total: {filteredAddOns.length} service{filteredAddOns.length !== 1 ? 's' : ''}
        </div>
    </div>
  );
}