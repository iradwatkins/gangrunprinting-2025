import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash2, AlertCircle, Palette, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import { paperStocksApi } from '@/api/global-options';
import type { Tables } from '@/integrations/supabase/types';

type PaperStock = Tables<'paper_stocks'>;

interface PaperStockFormData {
  name: string;
  description?: string;
  weight?: number;
  finish?: string;
  color?: string;
  brand?: string;
  price_per_sheet?: number;
  is_active: boolean;
}

export function PaperStocksPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPaperStock, setEditingPaperStock] = useState<PaperStock | null>(null);
  const [formData, setFormData] = useState<PaperStockFormData>({
    name: '',
    description: '',
    weight: 0,
    finish: '',
    color: '',
    brand: '',
    price_per_sheet: 0,
    is_active: true
  });

  const { data: paperStocks, isLoading, error } = useQuery({
    queryKey: ['admin-paper-stocks'],
    queryFn: async () => {
      const response = await paperStocksApi.getAll();
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: paperStocksApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-paper-stocks'] });
      toast({ title: 'Success', description: 'Paper stock created successfully' });
      resetForm();
      setIsFormOpen(false);
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to create paper stock', variant: 'destructive' });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PaperStockFormData> }) => paperStocksApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-paper-stocks'] });
      toast({ title: 'Success', description: 'Paper stock updated successfully' });
      resetForm();
      setIsFormOpen(false);
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to update paper stock', variant: 'destructive' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: paperStocksApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-paper-stocks'] });
      toast({ title: 'Success', description: 'Paper stock deleted successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to delete paper stock', variant: 'destructive' });
    }
  });

  const resetForm = () => {
    setFormData({ 
      name: '', 
      description: '', 
      weight: 0, 
      finish: '', 
      color: '', 
      brand: '', 
      price_per_sheet: 0, 
      is_active: true 
    });
    setEditingPaperStock(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPaperStock) {
      updateMutation.mutate({ id: editingPaperStock.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (paperStock: PaperStock) => {
    setEditingPaperStock(paperStock);
    setFormData({
      name: paperStock.name,
      description: paperStock.description || '',
      weight: paperStock.weight || 0,
      finish: paperStock.finish || '',
      color: paperStock.color || '',
      brand: paperStock.brand || '',
      price_per_sheet: paperStock.price_per_sheet || 0,
      is_active: paperStock.is_active
    });
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this paper stock?')) {
      deleteMutation.mutate(id);
    }
  };

  const filteredPaperStocks = paperStocks?.filter(stock =>
    stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (error) {
    return (
      <AdminLayout>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load paper stocks: {(error as Error).message}</AlertDescription>
        </Alert>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Paper Stock Management</h1>
            <p className="text-gray-600">Manage available paper types, weights, and finishes</p>
          </div>
          
          <Button onClick={() => {
            resetForm();
            setIsFormOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Paper Stock
          </Button>
        </div>

        {/* Inline Form */}
        {isFormOpen && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {editingPaperStock ? 'Edit Paper Stock' : 'Add New Paper Stock'}
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Paper Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., 100lb Gloss Text"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="brand">Brand</Label>
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                      placeholder="e.g., Mohawk, Neenah"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of this paper stock..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="weight">Weight (lb)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      value={formData.weight || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                      placeholder="100"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="finish">Finish</Label>
                    <Input
                      id="finish"
                      value={formData.finish}
                      onChange={(e) => setFormData(prev => ({ ...prev, finish: e.target.value }))}
                      placeholder="Gloss, Matte, Satin"
                    />
                  </div>

                  <div>
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      placeholder="White, Cream, Natural"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="price_per_sheet">Price per Sheet ($)</Label>
                  <Input
                    id="price_per_sheet"
                    type="number"
                    step="0.01"
                    value={formData.price_per_sheet || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, price_per_sheet: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.25"
                  />
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
                    {editingPaperStock ? 'Update' : 'Create'}
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
            placeholder="Search paper stocks..."
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
        ) : filteredPaperStocks.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No information at this time</p>
              {searchTerm && <p className="text-sm text-gray-400 mt-2">Try adjusting your search</p>}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPaperStocks.map((stock) => (
              <Card key={stock.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        {stock.name}
                      </CardTitle>
                      {stock.brand && (
                        <CardDescription>{stock.brand}</CardDescription>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge variant={stock.is_active ? 'default' : 'secondary'}>
                        {stock.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      {stock.weight && (
                        <Badge variant="outline">{stock.weight}lb</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    {stock.description && (
                      <p className="line-clamp-2">{stock.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {stock.finish && (
                        <Badge variant="outline" className="text-xs">{stock.finish}</Badge>
                      )}
                      {stock.color && (
                        <Badge variant="outline" className="text-xs">{stock.color}</Badge>
                      )}
                    </div>
                    {stock.price_per_sheet && (
                      <p className="font-medium text-green-600">
                        ${stock.price_per_sheet}/sheet
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(stock)}>
                      <Edit className="h-3 w-3 mr-1" />Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(stock.id)}>
                      <Trash2 className="h-3 w-3 mr-1" />Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        <div className="text-sm text-gray-500">
          Total: {filteredPaperStocks.length} paper stock{filteredPaperStocks.length !== 1 ? 's' : ''}
        </div>
      </div>
    </AdminLayout>
  );
}