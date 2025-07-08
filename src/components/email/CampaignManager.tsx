import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { EmailCampaign, EmailTemplate, CustomerSegment } from '../../types/email';
import { emailCampaignApi, emailTemplateApi, emailSegmentApi } from '../../api/email';
import { 
  Plus, 
  Search, 
  Play, 
  Pause, 
  Square, 
  Edit, 
  Copy, 
  Trash2, 
  Eye, 
  MoreHorizontal,
  Mail,
  Calendar as CalendarIcon,
  Users,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface CampaignManagerProps {
  onCreateCampaign: () => void;
  onEditCampaign: (campaign: EmailCampaign) => void;
}

const CampaignManager: React.FC<CampaignManagerProps> = ({ onCreateCampaign, onEditCampaign }) => {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [segments, setSegments] = useState<CustomerSegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    description: '',
    template_id: '',
    segment_ids: [] as string[],
    time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    send_at: '',
  });

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Mock campaigns data
      const mockCampaigns: EmailCampaign[] = [
        {
          id: '1',
          name: 'New Customer Welcome Series',
          description: 'Welcome email sequence for new customers',
          status: 'active',
          template_id: '1',
          segment_ids: ['1'],
          send_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          time_zone: 'America/New_York',
          created_by: 'admin',
          personalization_rules: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Monthly Newsletter',
          description: 'Monthly updates and printing tips',
          status: 'scheduled',
          template_id: '3',
          segment_ids: ['2'],
          send_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          time_zone: 'America/New_York',
          created_by: 'admin',
          personalization_rules: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Order Follow-up',
          description: 'Follow up with customers after order completion',
          status: 'draft',
          template_id: '2',
          segment_ids: ['3'],
          send_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          time_zone: 'America/New_York',
          created_by: 'admin',
          personalization_rules: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ];

      // Mock templates data
      const mockTemplates: EmailTemplate[] = [
        {
          id: '1',
          name: 'Welcome Email',
          description: 'Welcome new customers',
          category: 'onboarding',
          subject: 'Welcome to GangRun Printing!',
          html_content: '<h1>Welcome!</h1>',
          text_content: 'Welcome!',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ];

      // Mock segments data
      const mockSegments: CustomerSegment[] = [
        {
          id: '1',
          name: 'New Customers',
          description: 'Customers who joined in the last 30 days',
          conditions: [],
          customer_count: 150,
          is_dynamic: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'All Customers',
          description: 'All active customers',
          conditions: [],
          customer_count: 1200,
          is_dynamic: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ];

      // Apply status filter
      let filteredCampaigns = mockCampaigns;
      if (statusFilter) {
        filteredCampaigns = filteredCampaigns.filter(c => c.status === statusFilter);
      }
      
      setCampaigns(filteredCampaigns);
      setTemplates(mockTemplates);
      setSegments(mockSegments);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateCampaign = async () => {
    try {
      const campaignData = {
        ...newCampaign,
        status: 'draft' as const,
        created_by: 'current-user', // TODO: Get from auth context
        personalization_rules: [],
      };
      
      const createdCampaign = await emailCampaignApi.createCampaign(campaignData);
      setCampaigns(prev => [createdCampaign, ...prev]);
      setCreateDialogOpen(false);
      setNewCampaign({
        name: '',
        description: '',
        template_id: '',
        segment_ids: [],
        time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        send_at: '',
      });
    } catch (error) {
      console.error('Failed to create campaign:', error);
    }
  };

  const handleSendCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to send this campaign? This action cannot be undone.')) return;
    
    try {
      await emailCampaignApi.sendCampaign(campaignId);
      await fetchData(); // Refresh data
    } catch (error) {
      console.error('Failed to send campaign:', error);
    }
  };

  const handleScheduleCampaign = async (campaignId: string) => {
    const sendAt = prompt('Enter send date/time (YYYY-MM-DD HH:MM):');
    if (!sendAt) return;

    try {
      await emailCampaignApi.scheduleCampaign(campaignId, sendAt);
      await fetchData();
    } catch (error) {
      console.error('Failed to schedule campaign:', error);
    }
  };

  const handlePauseCampaign = async (campaignId: string) => {
    try {
      await emailCampaignApi.pauseCampaign(campaignId);
      await fetchData();
    } catch (error) {
      console.error('Failed to pause campaign:', error);
    }
  };

  const handleResumeCampaign = async (campaignId: string) => {
    try {
      await emailCampaignApi.resumeCampaign(campaignId);
      await fetchData();
    } catch (error) {
      console.error('Failed to resume campaign:', error);
    }
  };

  const handleCancelCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to cancel this campaign?')) return;
    
    try {
      await emailCampaignApi.cancelCampaign(campaignId);
      await fetchData();
    } catch (error) {
      console.error('Failed to cancel campaign:', error);
    }
  };

  const handleCloneCampaign = async (campaign: EmailCampaign) => {
    try {
      const clonedCampaign = await emailCampaignApi.cloneCampaign(
        campaign.id,
        `${campaign.name} (Copy)`
      );
      setCampaigns(prev => [clonedCampaign, ...prev]);
    } catch (error) {
      console.error('Failed to clone campaign:', error);
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    
    try {
      await emailCampaignApi.deleteCampaign(campaignId);
      setCampaigns(prev => prev.filter(c => c.id !== campaignId));
    } catch (error) {
      console.error('Failed to delete campaign:', error);
    }
  };

  const handleSendTestEmail = async (campaign: EmailCampaign) => {
    const email = prompt('Enter email address to send test:');
    if (!email) return;

    try {
      await emailCampaignApi.sendTestEmail(campaign.id, email);
      alert('Test email sent successfully!');
    } catch (error) {
      console.error('Failed to send test email:', error);
      alert('Failed to send test email');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'sending': return 'bg-yellow-100 text-yellow-800';
      case 'sent': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-orange-100 text-orange-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Edit size={14} />;
      case 'scheduled': return <Clock size={14} />;
      case 'sending': return <Play size={14} />;
      case 'sent': return <CheckCircle size={14} />;
      case 'paused': return <Pause size={14} />;
      case 'cancelled': return <XCircle size={14} />;
      default: return <AlertCircle size={14} />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTemplateName = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    return template?.name || 'Unknown Template';
  };

  const getSegmentNames = (segmentIds: string[]) => {
    return segmentIds.map(id => {
      const segment = segments.find(s => s.id === id);
      return segment?.name || 'Unknown Segment';
    }).join(', ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Email Campaigns</h2>
          <p className="text-gray-600">Manage your email marketing campaigns</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="flex items-center gap-2">
          <Plus size={16} />
          Create Campaign
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <Input
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="sending">Sending</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        {filteredCampaigns.map((campaign) => (
          <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getStatusColor(campaign.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(campaign.status)}
                        {campaign.status}
                      </div>
                    </Badge>
                    {campaign.send_at && (
                      <Badge variant="outline">
                        <CalendarIcon size={12} className="mr-1" />
                        {formatDate(campaign.send_at)}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">{campaign.name}</CardTitle>
                  <CardDescription>{campaign.description || 'No description'}</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEditCampaign(campaign)}>
                      <Edit size={16} className="mr-2" />
                      Edit
                    </DropdownMenuItem>
                    {campaign.status === 'draft' && (
                      <>
                        <DropdownMenuItem onClick={() => handleSendCampaign(campaign.id)}>
                          <Play size={16} className="mr-2" />
                          Send Now
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleScheduleCampaign(campaign.id)}>
                          <Clock size={16} className="mr-2" />
                          Schedule
                        </DropdownMenuItem>
                      </>
                    )}
                    {campaign.status === 'scheduled' && (
                      <DropdownMenuItem onClick={() => handleCancelCampaign(campaign.id)}>
                        <XCircle size={16} className="mr-2" />
                        Cancel
                      </DropdownMenuItem>
                    )}
                    {campaign.status === 'sending' && (
                      <DropdownMenuItem onClick={() => handlePauseCampaign(campaign.id)}>
                        <Pause size={16} className="mr-2" />
                        Pause
                      </DropdownMenuItem>
                    )}
                    {campaign.status === 'paused' && (
                      <DropdownMenuItem onClick={() => handleResumeCampaign(campaign.id)}>
                        <Play size={16} className="mr-2" />
                        Resume
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => handleCloneCampaign(campaign)}>
                      <Copy size={16} className="mr-2" />
                      Clone
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSendTestEmail(campaign)}>
                      <Mail size={16} className="mr-2" />
                      Send Test
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDeleteCampaign(campaign.id)}
                      className="text-red-600"
                    >
                      <Trash2 size={16} className="mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Template</Label>
                  <p className="text-sm text-gray-600">{getTemplateName(campaign.template_id)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Segments</Label>
                  <p className="text-sm text-gray-600">{getSegmentNames(campaign.segment_ids)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Performance</Label>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-600">
                      Sent: {campaign.analytics.total_sent}
                    </span>
                    <span className="text-green-600">
                      Opened: {campaign.analytics.open_rate}%
                    </span>
                    <span className="text-blue-600">
                      Clicked: {campaign.analytics.click_rate}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredCampaigns.length === 0 && (
        <div className="text-center py-12">
          <Mail className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter
              ? 'No campaigns match your current filters.'
              : 'Get started by creating your first email campaign.'}
          </p>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus size={16} className="mr-2" />
            Create Your First Campaign
          </Button>
        </div>
      )}

      {/* Create Campaign Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Campaign</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Campaign Name</Label>
                <Input
                  id="name"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter campaign name"
                />
              </div>
              <div>
                <Label htmlFor="timezone">Time Zone</Label>
                <Input
                  id="timezone"
                  value={newCampaign.time_zone}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, time_zone: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newCampaign.description}
                onChange={(e) => setNewCampaign(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter campaign description"
              />
            </div>
            <div>
              <Label htmlFor="template">Email Template</Label>
              <Select
                value={newCampaign.template_id}
                onValueChange={(value) => setNewCampaign(prev => ({ ...prev, template_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="segments">Customer Segments</Label>
              <Select
                value={newCampaign.segment_ids[0] || ''}
                onValueChange={(value) => setNewCampaign(prev => ({ ...prev, segment_ids: [value] }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select segments" />
                </SelectTrigger>
                <SelectContent>
                  {segments.map(segment => (
                    <SelectItem key={segment.id} value={segment.id}>
                      {segment.name} ({segment.customer_count} customers)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCampaign}>
                Create Campaign
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CampaignManager;