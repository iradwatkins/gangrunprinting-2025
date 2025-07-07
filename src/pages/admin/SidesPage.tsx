import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash2, AlertCircle, Copy } from 'lucide-react';
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
import { sidesApi } from '@/api/global-options';
import type { Tables } from '@/integrations/supabase/types';

type Side = Tables<'sides'>;

interface SideFormData {
  name: string;
  multiplier: number;
  tooltip_text: string;
  is_active: boolean;
}

export function SidesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSide, setEditingSide] = useState<Side | null>(null);
  const [formData, setFormData] = useState<SideFormData>({
    name: '',
    multiplier: 1.0,
    tooltip_text: '',
    is_active: true
  });

  const { data: sides, isLoading, error } = useQuery({
    queryKey: ['admin-sides'],
    queryFn: async () => {
      const response = await sidesApi.getAll();
      return response.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: sidesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sides'] });
      toast({ title: 'Success', description: 'Side option created successfully' });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to create side option', variant: 'destructive' });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SideFormData> }) => sidesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sides'] });
      toast({ title: 'Success', description: 'Side option updated successfully' });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to update side option', variant: 'destructive' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: sidesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sides'] });
      toast({ title: 'Success', description: 'Side option deleted successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to delete side option', variant: 'destructive' });
    }
  });

  const resetForm = () => {
    setFormData({ name: '', multiplier: 1.0, tooltip_text: '', is_active: true });
    setEditingSide(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSide) {
      updateMutation.mutate({ id: editingSide.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (side: Side) => {
    setEditingSide(side);
    setFormData({
      name: side.name,
      multiplier: side.multiplier,
      tooltip_text: side.tooltip_text || '',
      is_active: side.is_active
    });
    setIsDialogOpen(true);
  };

  const getPricingImpact = (multiplier: number) => {
    if (multiplier === 1.0) return 'No impact';
    if (multiplier > 1.0) return `+${((multiplier - 1) * 100).toFixed(1)}% markup`;
    return `${((1 - multiplier) * 100).toFixed(1)}% discount`;
  };

  const filteredSides = sides?.filter(side =>
    side.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (error) {
    return (
      <AdminLayout>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load side options: {(error as Error).message}</AlertDescription>
        </Alert>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Print Sides</h1>
            <p className="text-gray-600">Manage printing side options and pricing multipliers</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Add Side Option
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingSide ? 'Edit Side Option' : 'Add New Side Option'}</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Single Sided, Double Sided (4/4)"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="multiplier">Pricing Multiplier *</Label>
                  <Input
                    id="multiplier"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.multiplier}
                    onChange={(e) => setFormData(prev => ({ ...prev, multiplier: parseFloat(e.target.value) || 1.0 }))}
                    placeholder="1.00"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    1.0 = no change, 2.0 = double price, 1.5 = 50% markup
                  </p>
                  {formData.multiplier !== 1.0 && (
                    <p className="text-xs font-medium mt-1">
                      Impact: {getPricingImpact(formData.multiplier)}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="tooltip_text">Customer Tooltip</Label>
                  <Textarea
                    id="tooltip_text"
                    value={formData.tooltip_text}
                    onChange={(e) => setFormData(prev => ({ ...prev, tooltip_text: e.target.value }))}
                    placeholder="Helpful information for customers about this printing option"
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
                    {editingSide ? 'Update' : 'Create'}
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
            placeholder="Search side options..."
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
        ) : filteredSides.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No side options found</p>
              {searchTerm && <p className="text-sm text-gray-400 mt-2">Try adjusting your search</p>}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSides.map((side) => (
              <Card key={side.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Copy className="h-4 w-4" />
                        {side.name}
                      </CardTitle>
                      <CardDescription>
                        Multiplier: {side.multiplier}x • {getPricingImpact(side.multiplier)}
                      </CardDescription>
                    </div>
                    <Badge variant={side.is_active ? 'default' : 'secondary'}>
                      {side.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {side.tooltip_text && (
                    <p className="text-sm text-gray-600 mb-3">{side.tooltip_text}</p>
                  )}
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(side)}>
                      <Edit className="h-3 w-3 mr-1" />Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => deleteMutation.mutate(side.id)}>
                      <Trash2 className="h-3 w-3 mr-1" />Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        <div className="text-sm text-gray-500">
          Total: {filteredSides.length} side option{filteredSides.length !== 1 ? 's' : ''}
        </div>
      </div>
    </AdminLayout>
  );
}