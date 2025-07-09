import React, { useState, useEffect } from 'react';
import { ArrowLeft, Mail, Phone, Calendar, DollarSign, ShoppingCart, MessageSquare, Plus, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCrm } from '@/hooks/useCrm';
import { useOrders } from '@/hooks/useOrders';
import type { CustomerProfile, CustomerNote, CustomerInteraction } from '@/types/crm';

interface CustomerProfileProps {
  customerId: string;
  onBack?: () => void;
}

export const CustomerProfile: React.FC<CustomerProfileProps> = ({
  customerId,
  onBack
}) => {
  const { getCustomerProfile, addCustomerNote, addCustomerInteraction, loading } = useCrm();
  const { getOrdersByCustomer } = useOrders();
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState<'general' | 'support' | 'sales' | 'billing'>('general');
  const [showAddNote, setShowAddNote] = useState(false);
  const [showAddInteraction, setShowAddInteraction] = useState(false);
  const [interactionData, setInteractionData] = useState({
    type: 'email' as const,
    subject: '',
    description: '',
    outcome: ''
  });

  useEffect(() => {
    loadCustomerData();
  }, [customerId]);

  const loadCustomerData = async () => {
    try {
      const customerData = await getCustomerProfile(customerId);
      setCustomer(customerData);
      
      if (customerData?.user_id) {
        const customerOrders = await getOrdersByCustomer(customerData.user_id);
        setOrders(customerOrders || []);
      }
    } catch (error) {
      // Handle error silently or with user feedback
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      await addCustomerNote(customerId, {
        content: newNote,
        note_type: noteType,
        created_by: 'current_user' // This should be the current user ID
      });
      
      setNewNote('');
      setShowAddNote(false);
      loadCustomerData(); // Refresh data
    } catch (error) {
      // Handle error silently or with user feedback
    }
  };

  const handleAddInteraction = async () => {
    if (!interactionData.subject.trim()) return;

    try {
      await addCustomerInteraction({
        customer_id: customerId,
        interaction_type: interactionData.type,
        subject: interactionData.subject,
        description: interactionData.description,
        outcome: interactionData.outcome,
        created_by: 'current_user' // This should be the current user ID
      });
      
      setInteractionData({
        type: 'email',
        subject: '',
        description: '',
        outcome: ''
      });
      setShowAddInteraction(false);
      loadCustomerData(); // Refresh data
    } catch (error) {
      // Handle error silently or with user feedback
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'prospect': return 'bg-blue-100 text-blue-800';
      case 'churned': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLifecycleColor = (stage: string) => {
    switch (stage) {
      case 'lead': return 'bg-yellow-100 text-yellow-800';
      case 'customer': return 'bg-green-100 text-green-800';
      case 'loyal': return 'bg-purple-100 text-purple-800';
      case 'at_risk': return 'bg-orange-100 text-orange-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading || !customer) {
    return <div className="p-4">Loading customer profile...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{customer.user_profiles?.full_name}</h1>
            <p className="text-gray-600">{customer.user_profiles?.email}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Badge className={getStatusColor(customer.customer_status)}>
            {customer.customer_status}
          </Badge>
          <Badge className={getLifecycleColor(customer.lifecycle_stage)}>
            {customer.lifecycle_stage}
          </Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{customer.total_orders || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold">{formatCurrency(customer.customer_value || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold">{formatCurrency(customer.average_order_value || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Last Order</p>
                <p className="text-sm font-medium">
                  {customer.last_order_date ? 
                    new Date(customer.last_order_date).toLocaleDateString() : 
                    'Never'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="interactions">Interactions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span>{customer.user_profiles?.email}</span>
                </div>
                {customer.user_profiles?.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span>{customer.user_profiles.phone}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>Customer since {new Date(customer.created_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tags & Segments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {customer.tags?.map((tag) => (
                      <Badge key={tag.id} style={{ backgroundColor: tag.color }}>
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Segments</p>
                  <div className="flex flex-wrap gap-2">
                    {customer.segments?.map((segment) => (
                      <Badge key={segment.id} variant="outline">
                        {segment.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No orders found</p>
              ) : (
                <div className="space-y-2">
                  {orders.map((order) => (
                    <div key={order.id} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <p className="font-medium">Order #{order.id}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(order.total_amount)}</p>
                        <Badge variant="outline">{order.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Customer Notes</CardTitle>
                <Button onClick={() => setShowAddNote(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Note
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showAddNote && (
                <div className="space-y-4 mb-4 p-4 border rounded">
                  <Select value={noteType} onValueChange={(value: any) => setNoteType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="support">Support</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="billing">Billing</SelectItem>
                    </SelectContent>
                  </Select>
                  <Textarea
                    placeholder="Add your note here..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                  />
                  <div className="flex space-x-2">
                    <Button onClick={handleAddNote}>Save Note</Button>
                    <Button variant="outline" onClick={() => setShowAddNote(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                {customer.notes?.map((note) => (
                  <div key={note.id} className="p-3 border rounded">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline">{note.note_type}</Badge>
                      <span className="text-sm text-gray-500">
                        {new Date(note.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm">{note.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interactions">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Customer Interactions</CardTitle>
                <Button onClick={() => setShowAddInteraction(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Interaction
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showAddInteraction && (
                <div className="space-y-4 mb-4 p-4 border rounded">
                  <Select 
                    value={interactionData.type} 
                    onValueChange={(value: any) => setInteractionData({...interactionData, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="chat">Chat</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="order">Order</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <input
                    type="text"
                    placeholder="Subject"
                    value={interactionData.subject}
                    onChange={(e) => setInteractionData({...interactionData, subject: e.target.value})}
                    className="w-full p-2 border rounded"
                  />
                  
                  <Textarea
                    placeholder="Description (optional)"
                    value={interactionData.description}
                    onChange={(e) => setInteractionData({...interactionData, description: e.target.value})}
                  />
                  
                  <Textarea
                    placeholder="Outcome (optional)"
                    value={interactionData.outcome}
                    onChange={(e) => setInteractionData({...interactionData, outcome: e.target.value})}
                  />
                  
                  <div className="flex space-x-2">
                    <Button onClick={handleAddInteraction}>Save Interaction</Button>
                    <Button variant="outline" onClick={() => setShowAddInteraction(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                {customer.interactions?.map((interaction) => (
                  <div key={interaction.id} className="p-3 border rounded">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{interaction.interaction_type}</Badge>
                        <span className="font-medium">{interaction.subject}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(interaction.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {interaction.description && (
                      <p className="text-sm text-gray-600 mb-2">{interaction.description}</p>
                    )}
                    {interaction.outcome && (
                      <p className="text-sm"><strong>Outcome:</strong> {interaction.outcome}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};