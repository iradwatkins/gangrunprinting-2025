import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import { coatingsApi } from '@/api/global-options';
import type { Tables } from '@/integrations/supabase/types';

type Coating = Tables<'coatings'>;

interface CoatingFormData {
  name: string;
  price_modifier: number;
  description: string;
  is_active: boolean;
}

export function CoatingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoating, setEditingCoating] = useState<Coating | null>(null);
  const [formData, setFormData] = useState<CoatingFormData>({
    name: '',
    price_modifier: 0,
    description: '',
    is_active: true
  });

  const { data: coatings, isLoading, error } = useQuery({
    queryKey: ['admin-coatings'],
    queryFn: async () => {
      const response = await coatingsApi.getAll();
      return response.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: coatingsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coatings'] });
      toast({ title: 'Success', description: 'Coating created successfully' });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to create coating', variant: 'destructive' });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CoatingFormData> }) => coatingsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coatings'] });
      toast({ title: 'Success', description: 'Coating updated successfully' });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to update coating', variant: 'destructive' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: coatingsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coatings'] });
      toast({ title: 'Success', description: 'Coating deleted successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to delete coating', variant: 'destructive' });
    }
  });

  const resetForm = () => {
    setFormData({ name: '', price_modifier: 0, description: '', is_active: true });
    setEditingCoating(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCoating) {
      updateMutation.mutate({ id: editingCoating.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (coating: Coating) => {
    setEditingCoating(coating);
    setFormData({
      name: coating.name,
      price_modifier: coating.price_modifier,
      description: coating.description || '',
      is_active: coating.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this coating?')) {
      deleteMutation.mutate(id);
    }
  };

  const filteredCoatings = coatings?.filter(coating =>
    coating.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coating.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (error) {
    return (
      <AdminLayout>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load coatings: {(error as Error).message}</AlertDescription>
        </Alert>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Coatings</h1>
            <p className="text-gray-600">Manage coating options and price modifiers</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Add Coating
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingCoating ? 'Edit Coating' : 'Add New Coating'}</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., High Gloss UV, Matte"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="price_modifier">Price Modifier (%)</Label>
                  <Input
                    id="price_modifier"
                    type="number"
                    step="0.01"
                    value={formData.price_modifier}
                    onChange={(e) => setFormData(prev => ({ ...prev, price_modifier: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Percentage modifier (0 = no change, 10 = 10% increase)
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Coating description and details"
                    rows={2}
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
                    {editingCoating ? 'Update' : 'Create'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search coatings..."
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
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredCoatings.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No coatings found</p>
              {searchTerm && <p className="text-sm text-gray-400 mt-2">Try adjusting your search</p>}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCoatings.map((coating) => (
              <Card key={coating.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{coating.name}</CardTitle>
                      <CardDescription>
                        {coating.price_modifier === 0 
                          ? 'No price change'
                          : `${coating.price_modifier > 0 ? '+' : ''}${coating.price_modifier}% modifier`
                        }
                      </CardDescription>
                    </div>
                    <Badge variant={coating.is_active ? 'default' : 'secondary'}>
                      {coating.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {coating.description && (
                    <p className="text-sm text-gray-600 mb-4">{coating.description}</p>
                  )}
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(coating)}>
                      <Edit className="h-3 w-3 mr-1" />Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(coating.id)}>
                      <Trash2 className="h-3 w-3 mr-1" />Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        <div className="text-sm text-gray-500">
          Total: {filteredCoatings.length} coating{filteredCoatings.length !== 1 ? 's' : ''}
        </div>
      </div>
    </AdminLayout>
  );
}