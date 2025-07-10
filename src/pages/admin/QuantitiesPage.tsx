import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash2, AlertCircle, Hash, X, Star, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import { quantitiesApi } from '@/api/global-options';
import type { Tables } from '@/integrations/supabase/types';

type Quantity = Tables<'quantities'>;

interface QuantityFormData {
  name: string;
  value: number | null;
  is_custom: boolean;
  min_custom_value: number | null;
  increment_value: number | null;
  is_active: boolean;
  is_default: boolean;
}

interface BulkQuantityFormData {
  quantities_input: string;
  make_default_index: number;
}

export function QuantitiesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isBulkFormOpen, setIsBulkFormOpen] = useState(false);
  const [editingQuantity, setEditingQuantity] = useState<Quantity | null>(null);
  const [formData, setFormData] = useState<QuantityFormData>({
    name: '',
    value: null,
    is_custom: false,
    min_custom_value: 5000,
    increment_value: 5000,
    is_active: true,
    is_default: false
  });
  const [bulkFormData, setBulkFormData] = useState<BulkQuantityFormData>({
    quantities_input: '',
    make_default_index: -1
  });

  const { data: quantities, isLoading, error } = useQuery({
    queryKey: ['admin-quantities'],
    queryFn: async () => {
      const response = await quantitiesApi.getAll();
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: quantitiesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-quantities'] });
      toast({ title: 'Success', description: 'Quantity created successfully' });
      resetForm();
      setIsFormOpen(false);
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to create quantity', variant: 'destructive' });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<QuantityFormData> }) => quantitiesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-quantities'] });
      toast({ title: 'Success', description: 'Quantity updated successfully' });
      resetForm();
      setIsFormOpen(false);
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to update quantity', variant: 'destructive' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: quantitiesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-quantities'] });
      toast({ title: 'Success', description: 'Quantity deleted successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to delete quantity', variant: 'destructive' });
    }
  });

  const bulkCreateMutation = useMutation({
    mutationFn: quantitiesApi.bulkCreate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-quantities'] });
      toast({ title: 'Success', description: 'Quantities created successfully' });
      resetBulkForm();
      setIsBulkFormOpen(false);
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to create quantities', variant: 'destructive' });
    }
  });

  const setDefaultMutation = useMutation({
    mutationFn: quantitiesApi.setDefault,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-quantities'] });
      toast({ title: 'Success', description: 'Default quantity updated' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to set default quantity', variant: 'destructive' });
    }
  });

  const resetForm = () => {
    setFormData({ name: '', value: null, is_custom: false, min_custom_value: 5000, increment_value: 5000, is_active: true, is_default: false });
    setEditingQuantity(null);
  };

  const resetBulkForm = () => {
    setBulkFormData({ quantities_input: '', make_default_index: -1 });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingQuantity) {
      updateMutation.mutate({ id: editingQuantity.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (quantity: Quantity) => {
    setEditingQuantity(quantity);
    setFormData({
      name: quantity.name,
      value: quantity.value,
      is_custom: quantity.is_custom,
      min_custom_value: quantity.min_custom_value,
      increment_value: quantity.increment_value,
      is_active: quantity.is_active,
      is_default: quantity.is_default || false
    });
    setIsFormOpen(true);
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse the input
    const values = bulkFormData.quantities_input
      .split(',')
      .map(v => v.trim())
      .filter(v => v !== '')
      .map(v => parseInt(v))
      .filter(v => !isNaN(v) && v > 0);
    
    if (values.length === 0) {
      toast({ title: 'Error', description: 'Please enter valid quantity values', variant: 'destructive' });
      return;
    }
    
    // Create quantities array
    const quantities = values.map((value, index) => ({
      name: value.toString(),
      value: value,
      is_custom: false,
      is_default: index === bulkFormData.make_default_index
    }));
    
    bulkCreateMutation.mutate(quantities);
  };

  const handleSetDefault = (quantity: Quantity) => {
    setDefaultMutation.mutate(quantity.id);
  };

  const presetQuantityGroups = [
    { name: 'Small Orders', values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
    { name: 'Standard', values: [25, 50, 100, 250, 500] },
    { name: 'Large Orders', values: [1000, 2500, 5000, 10000] }
  ];

  const handlePresetGroup = (values: number[]) => {
    setBulkFormData({
      quantities_input: values.join(', '),
      make_default_index: -1
    });
    setIsBulkFormOpen(true);
  };

  const filteredQuantities = quantities?.filter(q =>
    q.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    // Sort by is_default first (default first), then by sort_order/value
    if (a.is_default && !b.is_default) return -1;
    if (!a.is_default && b.is_default) return 1;
    const aOrder = a.sort_order || a.value || 999999;
    const bOrder = b.sort_order || b.value || 999999;
    return aOrder - bOrder;
  }) || [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Quantities</h1>
            <p className="text-gray-600">Manage quantity tiers and custom options</p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => {
                resetBulkForm();
                setIsBulkFormOpen(true);
              }}
            >
              <Layers className="mr-2 h-4 w-4" />
              Bulk Add
            </Button>
            <Button onClick={() => {
              resetForm();
              setIsFormOpen(true);
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Quantity
            </Button>
          </div>
        </div>

        {/* Inline Form */}
        {isFormOpen && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {editingQuantity ? 'Edit Quantity' : 'Add New Quantity'}
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
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., 250, 500, Custom..."
                    required
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_custom"
                    checked={formData.is_custom}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_custom: checked }))}
                  />
                  <Label htmlFor="is_custom">Custom Quantity Option</Label>
                </div>

                {!formData.is_custom && (
                  <div>
                    <Label htmlFor="value">Quantity Value *</Label>
                    <Input
                      id="value"
                      type="number"
                      min="1"
                      value={formData.value || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, value: parseInt(e.target.value) || null }))}
                      placeholder="250"
                      required
                    />
                  </div>
                )}

                {formData.is_custom && (
                  <div className="space-y-3 p-3 bg-gray-50 rounded">
                    <Label className="text-sm font-medium">Custom Quantity Settings</Label>
                    <div>
                      <Label htmlFor="min_custom_value">Minimum Custom Value</Label>
                      <Input
                        id="min_custom_value"
                        type="number"
                        min="1"
                        value={formData.min_custom_value || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, min_custom_value: parseInt(e.target.value) || null }))}
                        placeholder="5000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="increment_value">Increment Value</Label>
                      <Input
                        id="increment_value"
                        type="number"
                        min="1"
                        value={formData.increment_value || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, increment_value: parseInt(e.target.value) || null }))}
                        placeholder="5000"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Custom quantities must be multiples of this value
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_default"
                    checked={formData.is_default}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_default: checked }))}
                  />
                  <Label htmlFor="is_default">Set as Default Quantity</Label>
                  <span className="text-xs text-gray-500">(Only one quantity can be default)</span>
                </div>
                
                <div className="flex gap-2">
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingQuantity ? 'Update' : 'Create'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Bulk Creation Form */}
        {isBulkFormOpen && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Bulk Add Quantities
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsBulkFormOpen(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
              <CardDescription>
                Add multiple quantities at once using comma-separated values (e.g., "1,2,3,4,5,6,7")
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBulkSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="quantities_input">Quantity Values *</Label>
                  <Input
                    id="quantities_input"
                    value={bulkFormData.quantities_input}
                    onChange={(e) => setBulkFormData(prev => ({ ...prev, quantities_input: e.target.value }))}
                    placeholder="1,2,3,4,5,6,7"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter numbers separated by commas. Example: 1,2,3,4,5,6,7 or 25,50,100,250,500
                  </p>
                </div>

                <div>
                  <Label htmlFor="make_default_index">Make Default (Optional)</Label>
                  <Select onValueChange={(value) => setBulkFormData(prev => ({ ...prev, make_default_index: parseInt(value) }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="No default" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-1">No default</SelectItem>
                      {bulkFormData.quantities_input.split(',').map((_, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          Position {index + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Choose which position should be the default quantity
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Quick Presets</Label>
                  <div className="flex gap-2 mt-2">
                    {presetQuantityGroups.map((group) => (
                      <Button
                        key={group.name}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setBulkFormData({
                          quantities_input: group.values.join(', '),
                          make_default_index: -1
                        })}
                      >
                        {group.name}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button type="submit" disabled={bulkCreateMutation.isPending}>
                    Create Quantities
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsBulkFormOpen(false)}>
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
            placeholder="Search quantities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : filteredQuantities.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Hash className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-2">No quantities yet</p>
              {searchTerm ? (
                <p className="text-sm text-gray-400 mt-2">Try adjusting your search</p>
              ) : (
                <p className="text-sm text-gray-400 mb-4">Create quantity options for your products</p>
              )}
              {!searchTerm && (
                <div className="flex gap-2 justify-center mt-4">
                  <Button variant="outline" size="sm" onClick={() => handlePresetGroup([1,2,3,4,5,6,7])}>
                    Add Small Orders (1-7)
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handlePresetGroup([25,50,100,250,500])}>
                    Add Standard (25-500)
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredQuantities.map((quantity) => (
              <Card key={quantity.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        {quantity.name}
                      </CardTitle>
                      <CardDescription>
                        {quantity.is_custom 
                          ? `Min: ${quantity.min_custom_value}, Inc: ${quantity.increment_value}`
                          : `${quantity.value} units`
                        }
                      </CardDescription>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge variant={quantity.is_active ? 'default' : 'secondary'}>
                        {quantity.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      {quantity.is_custom && <Badge variant="outline">Custom</Badge>}
                      {quantity.is_default && (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          Default
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex gap-2 flex-wrap">
                    {!quantity.is_default && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleSetDefault(quantity)}
                        disabled={setDefaultMutation.isPending}
                      >
                        <Star className="h-3 w-3 mr-1" />
                        Set Default
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => handleEdit(quantity)}>
                      <Edit className="h-3 w-3 mr-1" />Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => deleteMutation.mutate(quantity.id)}>
                      <Trash2 className="h-3 w-3 mr-1" />Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {filteredQuantities.length > 0 && (
          <div className="text-sm text-gray-500 flex items-center justify-between">
            <span>Total: {filteredQuantities.length} quantit{filteredQuantities.length !== 1 ? 'ies' : 'y'}</span>
            {filteredQuantities.some(q => q.is_default) && (
              <span className="flex items-center">
                <Star className="h-3 w-3 mr-1 fill-current text-yellow-600" />
                Default: {filteredQuantities.find(q => q.is_default)?.name}
              </span>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}