import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash2, AlertCircle, Ruler, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { printSizesApi } from '@/api/global-options';
import type { Tables } from '@/integrations/supabase/types';

type PrintSize = Tables<'print_sizes'>;

interface PrintSizeFormData {
  name: string;
  width: number;
  height: number;
  is_custom: boolean;
  min_width?: number;
  max_width?: number;
  min_height?: number;
  max_height?: number;
  is_active: boolean;
}

export function PrintSizesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSize, setEditingSize] = useState<PrintSize | null>(null);
  const [formData, setFormData] = useState<PrintSizeFormData>({
    name: '',
    width: 0,
    height: 0,
    is_custom: false,
    is_active: true
  });

  // Fetch print sizes with React Query
  const { data: printSizes = [], isLoading, error } = useQuery({
    queryKey: ['printSizes'],
    queryFn: async () => {
      const response = await printSizesApi.getAll();
      if (response.error) throw new Error(response.error);
      return response.data || [];
    },
    staleTime: 30000,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: PrintSizeFormData) => printSizesApi.create(data),
    onSuccess: (result) => {
      if (result.error) throw new Error(result.error);
      toast({ title: 'Success', description: 'Print size created successfully' });
      queryClient.invalidateQueries({ queryKey: ['printSizes'] });
      resetForm();
      setIsFormOpen(false);
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to create print size', variant: 'destructive' });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PrintSizeFormData> }) => 
      printSizesApi.update(id, data),
    onSuccess: (result) => {
      if (result.error) throw new Error(result.error);
      toast({ title: 'Success', description: 'Print size updated successfully' });
      queryClient.invalidateQueries({ queryKey: ['printSizes'] });
      resetForm();
      setIsFormOpen(false);
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to update print size', variant: 'destructive' });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => printSizesApi.delete(id),
    onSuccess: (result) => {
      if (result.error) throw new Error(result.error);
      toast({ title: 'Success', description: 'Print size deleted successfully' });
      queryClient.invalidateQueries({ queryKey: ['printSizes'] });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to delete print size', variant: 'destructive' });
    }
  });

  const resetForm = () => {
    setFormData({ name: '', width: 0, height: 0, is_custom: false, is_active: true });
    setEditingSize(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSize) {
      updateMutation.mutate({ id: editingSize.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (size: PrintSize) => {
    setEditingSize(size);
    setFormData({
      name: size.name,
      width: size.width,
      height: size.height,
      is_custom: size.is_custom || false,
      min_width: size.min_width || undefined,
      max_width: size.max_width || undefined,
      min_height: size.min_height || undefined,
      max_height: size.max_height || undefined,
      is_active: size.is_active
    });
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this print size?')) {
      deleteMutation.mutate(id);
    }
  };

  const calculateArea = (width: number, height: number) => {
    return (width * height).toFixed(2);
  };

  const filteredSizes = printSizes.filter(size =>
    size.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load print sizes: {(error as Error).message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Print Sizes</h1>
            <p className="text-gray-600">Manage standard and custom print size options</p>
          </div>
          
          <Button onClick={() => {
            resetForm();
            setIsFormOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Print Size
          </Button>
        </div>

        {/* Inline Form */}
        {isFormOpen && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {editingSize ? 'Edit Print Size' : 'Add New Print Size'}
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
                    placeholder="e.g., 4x6, 8.5x11, Custom"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="width">Width (inches) *</Label>
                    <Input
                      id="width"
                      type="number"
                      step="0.01"
                      value={formData.width}
                      onChange={(e) => setFormData(prev => ({ ...prev, width: parseFloat(e.target.value) || 0 }))}
                      placeholder="4.00"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="height">Height (inches) *</Label>
                    <Input
                      id="height"
                      type="number"
                      step="0.01"
                      value={formData.height}
                      onChange={(e) => setFormData(prev => ({ ...prev, height: parseFloat(e.target.value) || 0 }))}
                      placeholder="6.00"
                      required
                    />
                  </div>
                </div>

                {formData.width > 0 && formData.height > 0 && (
                  <div className="text-sm text-gray-600">
                    Area: {calculateArea(formData.width, formData.height)} sq inches
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_custom"
                    checked={formData.is_custom}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_custom: checked }))}
                  />
                  <Label htmlFor="is_custom">Custom Size Option</Label>
                </div>

                {formData.is_custom && (
                  <div className="space-y-3 p-3 bg-gray-50 rounded">
                    <Label className="text-sm font-medium">Custom Size Limits</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="min_width" className="text-xs">Min Width</Label>
                        <Input
                          id="min_width"
                          type="number"
                          step="0.01"
                          value={formData.min_width || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, min_width: parseFloat(e.target.value) || undefined }))}
                          placeholder="1.00"
                        />
                      </div>
                      <div>
                        <Label htmlFor="max_width" className="text-xs">Max Width</Label>
                        <Input
                          id="max_width"
                          type="number"
                          step="0.01"
                          value={formData.max_width || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, max_width: parseFloat(e.target.value) || undefined }))}
                          placeholder="24.00"
                        />
                      </div>
                      <div>
                        <Label htmlFor="min_height" className="text-xs">Min Height</Label>
                        <Input
                          id="min_height"
                          type="number"
                          step="0.01"
                          value={formData.min_height || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, min_height: parseFloat(e.target.value) || undefined }))}
                          placeholder="1.00"
                        />
                      </div>
                      <div>
                        <Label htmlFor="max_height" className="text-xs">Max Height</Label>
                        <Input
                          id="max_height"
                          type="number"
                          step="0.01"
                          value={formData.max_height || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, max_height: parseFloat(e.target.value) || undefined }))}
                          placeholder="36.00"
                        />
                      </div>
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
                
                <div className="flex gap-2">
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingSize ? 'Update' : 'Create'}
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
            placeholder="Search print sizes..."
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
        ) : filteredSizes.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No information at this time</p>
              {searchTerm && <p className="text-sm text-gray-400 mt-2">Try adjusting your search</p>}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSizes.map((size) => (
              <Card key={size.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Ruler className="h-4 w-4" />
                        {size.name}
                      </CardTitle>
                      <CardDescription>
                        {size.width}" × {size.height}" ({calculateArea(size.width, size.height)} sq in)
                      </CardDescription>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge variant={size.is_active ? 'default' : 'secondary'}>
                        {size.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      {size.is_custom && (
                        <Badge variant="outline">Custom</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {size.is_custom && (size.min_width || size.max_width || size.min_height || size.max_height) && (
                    <div className="text-xs text-gray-600 mb-3">
                      <p>Limits:</p>
                      {size.min_width && <span>Min W: {size.min_width}" </span>}
                      {size.max_width && <span>Max W: {size.max_width}" </span>}
                      {size.min_height && <span>Min H: {size.min_height}" </span>}
                      {size.max_height && <span>Max H: {size.max_height}"</span>}
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(size)}>
                      <Edit className="h-3 w-3 mr-1" />Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(size.id)}>
                      <Trash2 className="h-3 w-3 mr-1" />Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        <div className="text-sm text-gray-500">
          Total: {filteredSizes.length} size{filteredSizes.length !== 1 ? 's' : ''}
        </div>
    </div>
  );
}