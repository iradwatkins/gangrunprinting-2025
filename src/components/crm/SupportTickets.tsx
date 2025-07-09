import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Calendar, User, AlertCircle, CheckCircle, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useSupportTickets } from '@/hooks/useCrm';
import type { SupportTicket } from '@/types/crm';

export const SupportTickets: React.FC = () => {
  const { tickets, loading, createTicket, updateTicket, getTickets } = useSupportTickets();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    customer_id: '',
    priority: 'medium' as const,
    category: 'general' as const,
    order_id: ''
  });

  useEffect(() => {
    getTickets();
  }, []);

  const handleCreateTicket = async () => {
    if (!newTicket.subject || !newTicket.description || !newTicket.customer_id) {
      return;
    }

    try {
      await createTicket({
        ...newTicket,
        status: 'open'
      });
      setShowCreateDialog(false);
      setNewTicket({
        subject: '',
        description: '',
        customer_id: '',
        priority: 'medium',
        category: 'general',
        order_id: ''
      });
    } catch (error) {
      // Handle error silently or with user feedback
    }
  };

  const handleUpdateTicket = async (ticketId: string, updates: Partial<SupportTicket>) => {
    try {
      await updateTicket(ticketId, updates);
      setSelectedTicket(null);
    } catch (error) {
      // Handle error silently or with user feedback
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'closed': return <X className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Support Tickets</h2>
          <p className="text-gray-600">Manage customer support requests</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create Support Ticket</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Customer ID</label>
                <Input
                  value={newTicket.customer_id}
                  onChange={(e) => setNewTicket({...newTicket, customer_id: e.target.value})}
                  placeholder="Enter customer ID"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Subject</label>
                <Input
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                  placeholder="Brief description of the issue"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                  placeholder="Detailed description of the issue"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select value={newTicket.priority} onValueChange={(value: any) => setNewTicket({...newTicket, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select value={newTicket.category} onValueChange={(value: any) => setNewTicket({...newTicket, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="order_issue">Order Issue</SelectItem>
                      <SelectItem value="billing">Billing</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Order ID (Optional)</label>
                <Input
                  value={newTicket.order_id}
                  onChange={(e) => setNewTicket({...newTicket, order_id: e.target.value})}
                  placeholder="Related order ID"
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleCreateTicket}>Create Ticket</Button>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Tickets List */}
      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-8">Loading tickets...</div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No tickets found</div>
        ) : (
          filteredTickets.map((ticket) => (
            <Card key={ticket.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(ticket.status)}
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status}
                      </Badge>
                    </div>
                    <Badge className={getPriorityColor(ticket.priority)}>
                      {ticket.priority}
                    </Badge>
                    <Badge variant="outline">{ticket.category}</Badge>
                  </div>
                  <div className="text-sm text-gray-500 text-right">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <h3 className="font-semibold mb-2">{ticket.subject}</h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{ticket.description}</p>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <User className="w-3 h-3" />
                    <span>{ticket.customer_profiles?.user_profiles?.full_name || 'Unknown Customer'}</span>
                  </div>
                  <div className="flex space-x-2">
                    {ticket.status === 'open' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateTicket(ticket.id, { status: 'in_progress' })}
                      >
                        Take
                      </Button>
                    )}
                    {ticket.status === 'in_progress' && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateTicket(ticket.id, { status: 'resolved' })}
                      >
                        Resolve
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Ticket Details Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>
              Ticket Details - {selectedTicket?.subject}
            </DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Badge className={getStatusColor(selectedTicket.status)}>
                  {selectedTicket.status}
                </Badge>
                <Badge className={getPriorityColor(selectedTicket.priority)}>
                  {selectedTicket.priority}
                </Badge>
                <Badge variant="outline">{selectedTicket.category}</Badge>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-gray-600">{selectedTicket.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-1">Customer</h4>
                  <p className="text-sm text-gray-600">
                    {selectedTicket.customer_profiles?.user_profiles?.full_name || 'Unknown'}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Created</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedTicket.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              
              {selectedTicket.order_id && (
                <div>
                  <h4 className="font-medium mb-1">Related Order</h4>
                  <p className="text-sm text-gray-600">#{selectedTicket.order_id}</p>
                </div>
              )}
              
              {selectedTicket.resolution && (
                <div>
                  <h4 className="font-medium mb-2">Resolution</h4>
                  <p className="text-sm text-gray-600">{selectedTicket.resolution}</p>
                </div>
              )}
              
              <div className="flex space-x-2">
                {selectedTicket.status === 'open' && (
                  <Button
                    onClick={() => handleUpdateTicket(selectedTicket.id, { status: 'in_progress' })}
                  >
                    Take Ticket
                  </Button>
                )}
                {selectedTicket.status === 'in_progress' && (
                  <Button
                    onClick={() => handleUpdateTicket(selectedTicket.id, { status: 'resolved' })}
                  >
                    Mark Resolved
                  </Button>
                )}
                <Button variant="outline" onClick={() => setSelectedTicket(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};