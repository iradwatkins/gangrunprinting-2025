import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Switch } from '../ui/switch';
import { useToast } from '@/hooks/use-toast';
import { EmailAutomation } from '../../types/email';
import { emailAutomationApi } from '../../api/email';
import AutomationBuilder from './AutomationBuilder';
import { 
  Plus, 
  Search, 
  Play, 
  Pause, 
  Edit, 
  Copy, 
  Trash2, 
  MoreHorizontal,
  Activity,
  Clock,
  Mail,
  Users,
  BarChart3,
  Calendar,
  Zap
} from 'lucide-react';

const AutomationManager: React.FC = () => {
  const [automations, setAutomations] = useState<EmailAutomation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('');
  const [builderOpen, setBuilderOpen] = useState(false);
  const [selectedAutomation, setSelectedAutomation] = useState<EmailAutomation | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchAutomations();
  }, [activeFilter]);

  const fetchAutomations = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (activeFilter) filters.active = activeFilter === 'active';
      
      const response = await emailAutomationApi.getAutomations(filters);
      setAutomations(response.automations);
    } catch (error) {
      console.error('Failed to fetch automations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAutomations = automations.filter(automation =>
    automation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    automation.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateAutomation = () => {
    setSelectedAutomation(null);
    setBuilderOpen(true);
  };

  const handleEditAutomation = (automation: EmailAutomation) => {
    setSelectedAutomation(automation);
    setBuilderOpen(true);
  };

  const handleSaveAutomation = async (automationData: Partial<EmailAutomation>) => {
    try {
      if (selectedAutomation) {
        const updatedAutomation = await emailAutomationApi.updateAutomation(selectedAutomation.id, automationData);
        setAutomations(prev => prev.map(a => a.id === selectedAutomation.id ? updatedAutomation : a));
      } else {
        const newAutomation = await emailAutomationApi.createAutomation(automationData as any);
        setAutomations(prev => [newAutomation, ...prev]);
      }
      setBuilderOpen(false);
      setSelectedAutomation(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save automation",
        variant: "destructive",
      });
    }
  };

  const handleToggleAutomation = async (automationId: string, isActive: boolean) => {
    try {
      await emailAutomationApi.toggleAutomation(automationId, isActive);
      await fetchAutomations(); // Refresh data
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle automation",
        variant: "destructive",
      });
    }
  };

  const handleCloneAutomation = async (automation: EmailAutomation) => {
    try {
      const clonedAutomation = await emailAutomationApi.duplicateAutomation(
        automation.id,
        `${automation.name} (Copy)`
      );
      setAutomations(prev => [clonedAutomation, ...prev]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clone automation",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAutomation = async (automationId: string) => {
    if (!confirm('Are you sure you want to delete this automation?')) return;
    
    try {
      await emailAutomationApi.deleteAutomation(automationId);
      setAutomations(prev => prev.filter(a => a.id !== automationId));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete automation",
        variant: "destructive",
      });
    }
  };

  const handleTestAutomation = async (automation: EmailAutomation) => {
    const testEmail = prompt('Enter email address to test with:');
    if (!testEmail) return;

    try {
      await emailAutomationApi.testAutomation(automation.id, testEmail);
      toast({
        title: "Success",
        description: "Test automation sent successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to test automation",
        variant: "destructive",
      });
    }
  };

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case 'order_created': return '🛒';
      case 'order_shipped': return '📦';
      case 'cart_abandoned': return '⏰';
      case 'user_registered': return '👤';
      case 'date_based': return '📅';
      default: return '⚡';
    }
  };

  const getTriggerLabel = (type: string) => {
    switch (type) {
      case 'order_created': return 'Order Created';
      case 'order_shipped': return 'Order Shipped';
      case 'cart_abandoned': return 'Cart Abandoned';
      case 'user_registered': return 'User Registered';
      case 'date_based': return 'Date Based';
      default: return type;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading automations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Email Automations</h2>
          <p className="text-gray-600">Set up automated email sequences</p>
        </div>
        <Button onClick={handleCreateAutomation} className="flex items-center gap-2">
          <Plus size={16} />
          Create Automation
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <Input
            placeholder="Search automations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={activeFilter === '' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('')}
          >
            All
          </Button>
          <Button
            variant={activeFilter === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('active')}
          >
            Active
          </Button>
          <Button
            variant={activeFilter === 'inactive' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('inactive')}
          >
            Inactive
          </Button>
        </div>
      </div>

      {/* Automations List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredAutomations.map((automation) => (
          <Card key={automation.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{getTriggerIcon(automation.trigger.type)}</span>
                    <Badge variant={automation.is_active ? "default" : "secondary"}>
                      {automation.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline">
                      {automation.actions.length} action{automation.actions.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{automation.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {automation.description || 'No description'}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={automation.is_active}
                    onCheckedChange={(checked) => handleToggleAutomation(automation.id, checked)}
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditAutomation(automation)}>
                        <Edit size={16} className="mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleTestAutomation(automation)}>
                        <Play size={16} className="mr-2" />
                        Test
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleCloneAutomation(automation)}>
                        <Copy size={16} className="mr-2" />
                        Clone
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteAutomation(automation.id)}
                        className="text-red-600"
                      >
                        <Trash2 size={16} className="mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Zap size={16} className="text-blue-600" />
                  <span className="font-medium">Trigger:</span>
                  <span>{getTriggerLabel(automation.trigger.type)}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Activity size={14} />
                    <span>Actions:</span>
                  </div>
                  <div className="ml-5 space-y-1">
                    {automation.actions.slice(0, 3).map((action, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        {action.type === 'send_email' && <Mail size={12} />}
                        {action.type === 'wait' && <Clock size={12} />}
                        {action.type === 'add_tag' && <Users size={12} />}
                        <span>
                          {action.type === 'send_email' && 'Send Email'}
                          {action.type === 'wait' && `Wait ${action.delay_hours}h`}
                          {action.type === 'add_tag' && 'Add Tag'}
                          {action.type === 'update_segment' && 'Update Segment'}
                        </span>
                      </div>
                    ))}
                    {automation.actions.length > 3 && (
                      <div className="text-sm text-gray-500 ml-4">
                        +{automation.actions.length - 3} more actions
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    Created {formatDate(automation.created_at)}
                  </div>
                  <div className="flex items-center gap-1">
                    <BarChart3 size={14} />
                    View Analytics
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredAutomations.length === 0 && (
        <div className="text-center py-12">
          <Zap className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No automations found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || activeFilter
              ? 'No automations match your current filters.'
              : 'Get started by creating your first email automation.'}
          </p>
          <Button onClick={handleCreateAutomation}>
            <Plus size={16} className="mr-2" />
            Create Your First Automation
          </Button>
        </div>
      )}

      {/* Automation Builder Dialog */}
      <Dialog open={builderOpen} onOpenChange={setBuilderOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedAutomation ? 'Edit Automation' : 'Create New Automation'}
            </DialogTitle>
          </DialogHeader>
          <AutomationBuilder
            automation={selectedAutomation || undefined}
            onSave={handleSaveAutomation}
            onCancel={() => setBuilderOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AutomationManager;