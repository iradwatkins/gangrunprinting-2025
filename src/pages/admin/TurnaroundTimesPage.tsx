import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash2, AlertCircle, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { turnaroundTimesApi } from '@/api/global-options';
import type { Tables } from '@/integrations/supabase/types';

type TurnaroundTime = Tables<'turnaround_times'>;

interface TurnaroundTimeFormData {
  name: string;
  business_days: number;
  price_markup_percent: number;
  base_description?: string;
  tooltip?: string;
  is_active: boolean;
}

export function TurnaroundTimesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTime, setEditingTime] = useState<TurnaroundTime | null>(null);
  const [formData, setFormData] = useState<TurnaroundTimeFormData>({
    name: '',
    business_days: 1,
    price_markup_percent: 0,
    is_active: true
  });

  // Fetch turnaround times with React Query
  const { data: turnaroundTimes = [], isLoading, error } = useQuery({
    queryKey: ['turnaroundTimes'],
    queryFn: async () => {
      const response = await turnaroundTimesApi.getAll();
      if (response.error) throw new Error(response.error);
      return response.data || [];
    },
    staleTime: 30000,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: TurnaroundTimeFormData) => turnaroundTimesApi.create(data),
    onSuccess: (result) => {
      if (result.error) throw new Error(result.error);
      toast({ title: 'Success', description: 'Turnaround time created successfully' });
      queryClient.invalidateQueries({ queryKey: ['turnaroundTimes'] });
      resetForm();
      setIsFormOpen(false);
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to create turnaround time', variant: 'destructive' });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TurnaroundTimeFormData> }) => 
      turnaroundTimesApi.update(id, data),
    onSuccess: (result) => {
      if (result.error) throw new Error(result.error);
      toast({ title: 'Success', description: 'Turnaround time updated successfully' });
      queryClient.invalidateQueries({ queryKey: ['turnaroundTimes'] });
      resetForm();
      setIsFormOpen(false);
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to update turnaround time', variant: 'destructive' });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => turnaroundTimesApi.delete(id),
    onSuccess: (result) => {
      if (result.error) throw new Error(result.error);
      toast({ title: 'Success', description: 'Turnaround time deleted successfully' });
      queryClient.invalidateQueries({ queryKey: ['turnaroundTimes'] });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to delete turnaround time', variant: 'destructive' });
    }
  });

  const resetForm = () => {
    setFormData({ name: '', business_days: 1, price_markup_percent: 0, is_active: true });
    setEditingTime(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTime) {
      updateMutation.mutate({ id: editingTime.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (time: TurnaroundTime) => {
    setEditingTime(time);
    setFormData({
      name: time.name,
      business_days: time.business_days,
      price_markup_percent: time.price_markup_percent,
      base_description: time.base_description || '',
      tooltip: time.tooltip || '',
      is_active: time.is_active
    });
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this turnaround time?')) {
      deleteMutation.mutate(id);
    }
  };

  const getSpeedBadge = (days: number) => {
    if (days <= 1) return { variant: 'destructive' as const, text: 'Rush' };
    if (days <= 3) return { variant: 'default' as const, text: 'Fast' };
    if (days <= 7) return { variant: 'secondary' as const, text: 'Standard' };
    return { variant: 'outline' as const, text: 'Extended' };
  };

  const filteredTimes = turnaroundTimes.filter(time =>
    time.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load turnaround times: {(error as Error).message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Turnaround Times</h1>
            <p className="text-gray-600">Manage delivery speed options and pricing markups</p>
          </div>
          
          <Button onClick={() => {
            resetForm();
            setIsFormOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Turnaround Time
          </Button>
        </div>

        {/* Inline Form */}
        {isFormOpen && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {editingTime ? 'Edit Turnaround Time' : 'Add New Turnaround Time'}
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
                    placeholder="e.g., Standard, Rush, Same Day"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="business_days">Business Days *</Label>
                    <Input
                      id="business_days"
                      type="number"
                      min="0"
                      step="1"
                      value={formData.business_days}
                      onChange={(e) => setFormData(prev => ({ ...prev, business_days: parseInt(e.target.value) || 1 }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="price_markup_percent">Markup (%)</Label>
                    <Input
                      id="price_markup_percent"
                      type="number"
                      step="0.01"
                      value={formData.price_markup_percent}
                      onChange={(e) => setFormData(prev => ({ ...prev, price_markup_percent: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="base_description">Base Description</Label>
                  <Input
                    id="base_description"
                    value={formData.base_description || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, base_description: e.target.value }))}
                    placeholder="e.g., Ships in 5-7 business days"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Base timeframe description (can be modified by add-ons)
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="tooltip">Customer Tooltip</Label>
                  <Textarea
                    id="tooltip"
                    value={formData.tooltip || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, tooltip: e.target.value }))}
                    placeholder="Additional information for customers"
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

                <div className="p-3 bg-gray-50 rounded text-xs text-gray-600">
                  <p><strong>Note:</strong> Turnaround estimates do not include shipping time.</p>
                </div>
                
                <div className="flex gap-2">
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingTime ? 'Update' : 'Create'}
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
            placeholder="Search turnaround times..."
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
        ) : filteredTimes.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No information at this time</p>
              {searchTerm && <p className="text-sm text-gray-400 mt-2">Try adjusting your search</p>}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTimes.map((time) => {
              const speedBadge = getSpeedBadge(time.business_days);
              return (
                <Card key={time.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {time.name}
                        </CardTitle>
                        <CardDescription>
                          {time.business_days} business day{time.business_days !== 1 ? 's' : ''}
                          {time.price_markup_percent > 0 && ` • +${time.price_markup_percent}%`}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Badge variant={time.is_active ? 'default' : 'secondary'}>
                          {time.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant={speedBadge.variant}>
                          {speedBadge.text}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {time.base_description && (
                      <p className="text-sm text-gray-600 mb-2">{time.base_description}</p>
                    )}
                    {time.tooltip && (
                      <p className="text-xs text-gray-500 mb-3">{time.tooltip}</p>
                    )}
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(time)}>
                        <Edit className="h-3 w-3 mr-1" />Edit
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(time.id)}>
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
          Total: {filteredTimes.length} turnaround option{filteredTimes.length !== 1 ? 's' : ''}
        </div>
    </div>
  );
}