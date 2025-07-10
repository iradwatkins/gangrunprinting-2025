import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash2, AlertCircle, Hash, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import { quantitiesApi } from '@/api/global-options';
import type { Tables } from '@/integrations/supabase/types';

type QuantityGroup = Tables<'quantities'>;

interface QuantityGroupFormData {
  name: string;
  values: string;
  default_value: number | null;
  has_custom: boolean;
  is_active: boolean;
}

export function QuantitiesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<QuantityGroup | null>(null);
  const [formData, setFormData] = useState<QuantityGroupFormData>({
    name: '',
    values: '',
    default_value: null,
    has_custom: false,
    is_active: true
  });

  const { data: quantityGroups, isLoading, error } = useQuery({
    queryKey: ['admin-quantity-groups'],
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
      queryClient.invalidateQueries({ queryKey: ['admin-quantity-groups'] });
      toast({ title: 'Success', description: 'Quantity group created successfully' });
      resetForm();
      setIsFormOpen(false);
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to create quantity group', variant: 'destructive' });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<QuantityGroupFormData> }) => quantitiesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-quantity-groups'] });
      toast({ title: 'Success', description: 'Quantity group updated successfully' });
      resetForm();
      setIsFormOpen(false);
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to update quantity group', variant: 'destructive' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: quantitiesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-quantity-groups'] });
      toast({ title: 'Success', description: 'Quantity group deleted successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to delete quantity group', variant: 'destructive' });
    }
  });

  const resetForm = () => {
    setFormData({ 
      name: '', 
      values: '', 
      default_value: null, 
      has_custom: false, 
      is_active: true 
    });
    setEditingGroup(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse values to check for custom and set has_custom
    const valuesArray = formData.values.split(',').map(v => v.trim().toLowerCase());
    const hasCustom = valuesArray.includes('custom');
    
    const submitData = {
      ...formData,
      has_custom: hasCustom
    };

    if (editingGroup) {
      updateMutation.mutate({ id: editingGroup.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleEdit = (group: QuantityGroup) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      values: group.values,
      default_value: group.default_value,
      has_custom: group.has_custom,
      is_active: group.is_active
    });
    setIsFormOpen(true);
  };

  const handleDelete = (groupId: string) => {
    if (confirm('Are you sure you want to delete this quantity group?')) {
      deleteMutation.mutate(groupId);
    }
  };

  // Helper function to format values for display
  const formatValuesDisplay = (values: string, defaultValue: number | null) => {
    return values.split(',').map(v => {
      const trimmed = v.trim();
      const isDefault = defaultValue && parseInt(trimmed) === defaultValue;
      return isDefault ? `${trimmed}*` : trimmed;
    }).join(', ');
  };

  const filteredGroups = quantityGroups?.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.values.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (error) {
    return (
      <AdminLayout>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load quantity groups: {(error as Error).message}</AlertDescription>
        </Alert>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Quantity Groups</h1>
            <p className="text-gray-600">Create reusable quantity sets for easy product assignment</p>
          </div>
          
          <Button onClick={() => {
            resetForm();
            setIsFormOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Quantity Group
          </Button>
        </div>

        {/* Inline Form */}
        {isFormOpen && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {editingGroup ? 'Edit Quantity Group' : 'Add New Quantity Group'}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFormOpen(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
              <CardDescription>
                Create a named group of quantities that can be easily assigned to products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Group Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Small Orders, Standard Print Runs, Bulk Orders"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="values">Quantity Values *</Label>
                  <Input
                    id="values"
                    value={formData.values}
                    onChange={(e) => setFormData(prev => ({ ...prev, values: e.target.value }))}
                    placeholder="e.g., 25,50,100,250,500,custom"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter comma-separated values. Add "custom" to enable custom input field for customers.
                  </p>
                </div>

                <div>
                  <Label htmlFor="default_value">Default Value</Label>
                  <Input
                    id="default_value"
                    type="number"
                    min="1"
                    value={formData.default_value || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, default_value: parseInt(e.target.value) || null }))}
                    placeholder="e.g., 100 (appears first in dropdown)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This value will appear first in the product dropdown
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
                
                <div className="flex gap-2">
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingGroup ? 'Update Group' : 'Create Group'}
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
            placeholder="Search quantity groups..."
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
        ) : filteredGroups.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Hash className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-2">No quantity groups yet</p>
              {searchTerm ? (
                <p className="text-sm text-gray-400 mt-2">Try adjusting your search</p>
              ) : (
                <p className="text-sm text-gray-400 mb-4">Create quantity groups to easily assign to products</p>
              )}
              {!searchTerm && (
                <Button variant="outline" size="sm" onClick={() => setIsFormOpen(true)}>
                  Create Your First Group
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGroups.map((group) => (
              <Card key={group.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        {group.name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {formatValuesDisplay(group.values, group.default_value)}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge variant={group.is_active ? 'default' : 'secondary'}>
                        {group.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      {group.has_custom && <Badge variant="outline">Custom</Badge>}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="text-xs text-gray-500 mb-3">
                    {group.default_value && (
                      <p>Default: {group.default_value} (* = shows first in dropdown)</p>
                    )}
                    {group.has_custom && (
                      <p>Includes custom input option for customers</p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(group)}>
                      <Edit className="h-3 w-3 mr-1" />Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(group.id)}>
                      <Trash2 className="h-3 w-3 mr-1" />Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {filteredGroups.length > 0 && (
          <div className="text-sm text-gray-500">
            Total: {filteredGroups.length} quantity group{filteredGroups.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}