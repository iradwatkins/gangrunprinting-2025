import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Users, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Eye,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import type { BrokerProfile, BrokerRequest, CategoryDiscount, BrokerTier } from '@/types/broker';

interface AdminBrokerManagerProps {
  isAdmin: boolean;
}

export function AdminBrokerManager({ isAdmin }: AdminBrokerManagerProps) {
  const [brokers, setBrokers] = useState<BrokerProfile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<BrokerRequest[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [selectedBroker, setSelectedBroker] = useState<BrokerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) {
      fetchBrokers();
      fetchPendingRequests();
      fetchCategories();
    }
  }, [isAdmin]);

  const fetchBrokers = async () => {
    try {
      const response = await fetch('/api/admin/brokers');
      if (!response.ok) throw new Error('Failed to fetch brokers');
      const data = await response.json();
      setBrokers(data.brokers);
    } catch (err) {
      setError('Failed to fetch brokers');
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await fetch('/api/admin/brokers/requests');
      if (!response.ok) throw new Error('Failed to fetch requests');
      const data = await response.json();
      setPendingRequests(data.requests);
    } catch (err) {
      setError('Failed to fetch requests');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data.categories);
    } catch (err) {
      setError('Failed to fetch categories');
    }
  };

  const approveRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/admin/brokers/requests/${requestId}/approve`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to approve request');
      await fetchBrokers();
      await fetchPendingRequests();
    } catch (err) {
      setError('Failed to approve request');
    }
  };

  const rejectRequest = async (requestId: string, reason: string) => {
    try {
      const response = await fetch(`/api/admin/brokers/requests/${requestId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      if (!response.ok) throw new Error('Failed to reject request');
      await fetchPendingRequests();
    } catch (err) {
      setError('Failed to reject request');
    }
  };

  const updateBrokerDiscounts = async (brokerId: string, discounts: CategoryDiscount[]) => {
    try {
      const response = await fetch(`/api/admin/brokers/${brokerId}/discounts`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discounts })
      });
      if (!response.ok) throw new Error('Failed to update discounts');
      await fetchBrokers();
    } catch (err) {
      setError('Failed to update discounts');
    }
  };

  const updateBrokerTier = async (brokerId: string, tierId: string) => {
    try {
      const response = await fetch(`/api/admin/brokers/${brokerId}/tier`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier_id: tierId })
      });
      if (!response.ok) throw new Error('Failed to update tier');
      await fetchBrokers();
    } catch (err) {
      setError('Failed to update tier');
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Broker Management</h1>
        <div className="flex items-center space-x-4">
          <Badge variant="outline">
            {brokers.length} Active Brokers
          </Badge>
          <Badge variant="secondary">
            {pendingRequests.length} Pending Requests
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="brokers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="brokers">Active Brokers</TabsTrigger>
          <TabsTrigger value="requests">Pending Requests</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="brokers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Active Brokers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {brokers.map((broker) => (
                  <div
                    key={broker.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-medium">{broker.company_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {broker.contact_person.name} • {broker.contact_person.email}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {broker.broker_tier.display_name}
                      </Badge>
                      <Badge variant={broker.status === 'active' ? 'default' : 'secondary'}>
                        {broker.status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedBroker(broker)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Broker Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="p-4 border rounded-lg space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{request.company_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {request.business_type} • Annual Volume: ${request.annual_volume}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {request.status}
                      </Badge>
                    </div>
                    
                    {request.business_justification && (
                      <div>
                        <Label className="text-sm font-medium">Business Justification:</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {request.business_justification}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        onClick={() => approveRequest(request.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Reject Application</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Reason for rejection</Label>
                              <Textarea
                                placeholder="Please provide a reason for rejection..."
                                className="mt-1"
                              />
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => rejectRequest(request.id, 'Admin rejected')}
                                variant="outline"
                                className="text-red-600"
                              >
                                Reject Application
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
                
                {pendingRequests.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No pending requests
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Category Discounts Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryDiscountManager
                categories={categories}
                onUpdateDiscounts={updateBrokerDiscounts}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Broker Edit Dialog */}
      {selectedBroker && (
        <BrokerEditDialog
          broker={selectedBroker}
          categories={categories}
          onClose={() => setSelectedBroker(null)}
          onUpdateDiscounts={updateBrokerDiscounts}
          onUpdateTier={updateBrokerTier}
        />
      )}
    </div>
  );
}

function CategoryDiscountManager({ 
  categories, 
  onUpdateDiscounts 
}: { 
  categories: { id: string; name: string }[];
  onUpdateDiscounts: (brokerId: string, discounts: CategoryDiscount[]) => void;
}) {
  const [defaultDiscounts, setDefaultDiscounts] = useState<CategoryDiscount[]>([]);

  const addCategoryDiscount = () => {
    const newDiscount: CategoryDiscount = {
      category_id: '',
      category_name: '',
      discount_percentage: 0,
      minimum_quantity: 1,
      volume_multiplier: 1.0
    };
    setDefaultDiscounts([...defaultDiscounts, newDiscount]);
  };

  const updateDiscount = (index: number, field: keyof CategoryDiscount, value: any) => {
    const updated = [...defaultDiscounts];
    updated[index] = { ...updated[index], [field]: value };
    setDefaultDiscounts(updated);
  };

  const removeDiscount = (index: number) => {
    setDefaultDiscounts(defaultDiscounts.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Default Category Discounts</h3>
        <Button onClick={addCategoryDiscount} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Category
        </Button>
      </div>

      <div className="space-y-3">
        {defaultDiscounts.map((discount, index) => (
          <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg">
            <Select
              value={discount.category_id}
              onValueChange={(value) => {
                const category = categories.find(c => c.id === value);
                updateDiscount(index, 'category_id', value);
                updateDiscount(index, 'category_name', category?.name || '');
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-1">
              <Input
                type="number"
                value={discount.discount_percentage}
                onChange={(e) => updateDiscount(index, 'discount_percentage', parseFloat(e.target.value))}
                className="w-20"
                placeholder="0"
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>

            <div className="flex items-center space-x-1">
              <Input
                type="number"
                value={discount.minimum_quantity}
                onChange={(e) => updateDiscount(index, 'minimum_quantity', parseInt(e.target.value))}
                className="w-20"
                placeholder="1"
              />
              <span className="text-sm text-muted-foreground">min qty</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => removeDiscount(index)}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {defaultDiscounts.length === 0 && (
          <p className="text-center text-muted-foreground py-4">
            No category discounts configured
          </p>
        )}
      </div>
    </div>
  );
}

function BrokerEditDialog({
  broker,
  categories,
  onClose,
  onUpdateDiscounts,
  onUpdateTier
}: {
  broker: BrokerProfile;
  categories: { id: string; name: string }[];
  onClose: () => void;
  onUpdateDiscounts: (brokerId: string, discounts: CategoryDiscount[]) => void;
  onUpdateTier: (brokerId: string, tierId: string) => void;
}) {
  const [discounts, setDiscounts] = useState<CategoryDiscount[]>(broker.category_discounts);
  const [selectedTier, setSelectedTier] = useState(broker.broker_tier.id);

  const brokerTiers = [
    { id: 'bronze', name: 'Bronze', discount: 5 },
    { id: 'silver', name: 'Silver', discount: 10 },
    { id: 'gold', name: 'Gold', discount: 15 },
    { id: 'platinum', name: 'Platinum', discount: 20 }
  ];

  const handleSave = async () => {
    await onUpdateDiscounts(broker.id, discounts);
    if (selectedTier !== broker.broker_tier.id) {
      await onUpdateTier(broker.id, selectedTier);
    }
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Broker: {broker.company_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Broker Tier</Label>
            <Select value={selectedTier} onValueChange={setSelectedTier}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {brokerTiers.map((tier) => (
                  <SelectItem key={tier.id} value={tier.id}>
                    {tier.name} ({tier.discount}% discount)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Category Discounts</Label>
            <div className="space-y-2 mt-2">
              {discounts.map((discount, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="w-32 text-sm">{discount.category_name}</span>
                  <Input
                    type="number"
                    value={discount.discount_percentage}
                    onChange={(e) => {
                      const updated = [...discounts];
                      updated[index].discount_percentage = parseFloat(e.target.value);
                      setDiscounts(updated);
                    }}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}