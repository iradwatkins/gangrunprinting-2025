import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import EmailTemplateList from '../../components/email/EmailTemplateList';
import EmailBuilder from '../../components/email/EmailBuilder';
import CampaignManager from '../../components/email/CampaignManager';
import SegmentManager from '../../components/email/SegmentManager';
import AutomationManager from '../../components/email/AutomationManager';
import EmailAnalytics from '../../components/email/EmailAnalytics';
import { EmailTemplate, EmailCampaign } from '../../types/email';
import { 
  Mail, 
  Users, 
  BarChart3, 
  Zap, 
  PlusCircle,
  FileText,
  Settings,
  TrendingUp
} from 'lucide-react';

const EmailDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showTemplateBuilder, setShowTemplateBuilder] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [showCampaignBuilder, setShowCampaignBuilder] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<EmailCampaign | null>(null);

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setShowTemplateBuilder(true);
  };

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setShowTemplateBuilder(true);
  };

  const handleSaveTemplate = async (templateData: Partial<EmailTemplate>) => {
    // In a real implementation, this would call the API
    console.log('Saving template:', templateData);
    setShowTemplateBuilder(false);
    setEditingTemplate(null);
  };

  const handlePreviewTemplate = async (templateData: Partial<EmailTemplate>) => {
    // In a real implementation, this would show a preview modal
    console.log('Previewing template:', templateData);
  };

  const handleEditCampaign = (campaign: EmailCampaign) => {
    setEditingCampaign(campaign);
    setShowCampaignBuilder(true);
  };

  const handleCreateCampaign = () => {
    setEditingCampaign(null);
    setShowCampaignBuilder(true);
  };

  if (showTemplateBuilder) {
    return (
      <div className="min-h-screen">
        <EmailBuilder
          template={editingTemplate || undefined}
          onSave={handleSaveTemplate}
          onPreview={handlePreviewTemplate}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Email Marketing</h1>
        <p className="text-gray-600">Manage your email campaigns, templates, and automation</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 size={16} />
            Overview
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <Mail size={16} />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText size={16} />
            Templates
          </TabsTrigger>
          <TabsTrigger value="segments" className="flex items-center gap-2">
            <Users size={16} />
            Segments
          </TabsTrigger>
          <TabsTrigger value="automations" className="flex items-center gap-2">
            <Zap size={16} />
            Automations
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp size={16} />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">
                  +2 from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Email Templates</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  +4 from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Customer Segments</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">
                  +1 from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Automations</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">6</div>
                <p className="text-xs text-muted-foreground">
                  +2 from last month
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Campaigns</CardTitle>
                <CardDescription>Your latest email campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Holiday Sale 2024', status: 'sent', sent: 1250, opened: 425 },
                    { name: 'Product Launch Announcement', status: 'sending', sent: 800, opened: 320 },
                    { name: 'Welcome Series - Week 1', status: 'scheduled', sent: 0, opened: 0 },
                  ].map((campaign, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{campaign.name}</div>
                        <div className="text-sm text-gray-600">
                          {campaign.sent > 0 ? `${campaign.sent} sent, ${campaign.opened} opened` : 'Not sent yet'}
                        </div>
                      </div>
                      <Badge variant={campaign.status === 'sent' ? 'default' : campaign.status === 'sending' ? 'secondary' : 'outline'}>
                        {campaign.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common email marketing tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button onClick={handleCreateTemplate} className="h-20 flex flex-col items-center gap-2">
                    <PlusCircle size={24} />
                    <span>Create Template</span>
                  </Button>
                  <Button onClick={handleCreateCampaign} variant="outline" className="h-20 flex flex-col items-center gap-2">
                    <Mail size={24} />
                    <span>New Campaign</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center gap-2"
                    onClick={() => setActiveTab('segments')}
                  >
                    <Users size={24} />
                    <span>Create Segment</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center gap-2"
                    onClick={() => setActiveTab('automations')}
                  >
                    <Zap size={24} />
                    <span>New Automation</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
              <CardDescription>Key metrics for the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">15,234</div>
                  <div className="text-sm text-gray-600">Emails Sent</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">94.2%</div>
                  <div className="text-sm text-gray-600">Delivery Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">28.5%</div>
                  <div className="text-sm text-gray-600">Open Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">4.2%</div>
                  <div className="text-sm text-gray-600">Click Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">1.8%</div>
                  <div className="text-sm text-gray-600">Unsubscribe Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns">
          <CampaignManager 
            onCreateCampaign={handleCreateCampaign}
            onEditCampaign={handleEditCampaign}
          />
        </TabsContent>

        <TabsContent value="templates">
          <EmailTemplateList 
            onEdit={handleEditTemplate}
            onCreateNew={handleCreateTemplate}
          />
        </TabsContent>

        <TabsContent value="segments">
          <SegmentManager />
        </TabsContent>

        <TabsContent value="automations">
          <AutomationManager />
        </TabsContent>

        <TabsContent value="analytics">
          <EmailAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmailDashboard;