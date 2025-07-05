import React, { useState } from 'react';
import { Users, MessageSquare, BarChart3, Settings, FileText, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CustomerList } from '@/components/crm/CustomerList';
import { CustomerProfile } from '@/components/crm/CustomerProfile';
import { SupportTickets } from '@/components/crm/SupportTickets';
import { useCustomerAnalytics } from '@/hooks/useCrm';
import type { CustomerProfile as CustomerProfileType } from '@/types/crm';

export const CRMDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfileType | null>(null);
  const { analytics, loading } = useCustomerAnalytics();

  const handleSelectCustomer = (customer: CustomerProfileType) => {
    setSelectedCustomer(customer);
    setActiveTab('customer-profile');
  };

  const handleBackToList = () => {
    setSelectedCustomer(null);
    setActiveTab('customers');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (activeTab === 'customer-profile' && selectedCustomer) {
    return (
      <div className="container mx-auto p-6">
        <CustomerProfile
          customerId={selectedCustomer.id}
          onBack={handleBackToList}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">CRM Dashboard</h1>
        <p className="text-gray-600">Manage customer relationships and support</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">
            <BarChart3 className="w-4 h-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="customers">
            <Users className="w-4 h-4 mr-2" />
            Customers
          </TabsTrigger>
          <TabsTrigger value="support">
            <MessageSquare className="w-4 h-4 mr-2" />
            Support
          </TabsTrigger>
          <TabsTrigger value="communications">
            <Mail className="w-4 h-4 mr-2" />
            Communications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {loading ? (
            <div className="text-center py-8">Loading analytics...</div>
          ) : (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics?.total_customers || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      +{analytics?.new_customers_this_month || 0} this month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics?.active_customers || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {analytics?.total_customers ? 
                        formatPercentage((analytics.active_customers / analytics.total_customers) * 100) : 
                        '0%'
                      } of total
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Customer Value</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(analytics?.average_customer_value || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Per customer
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatPercentage(analytics?.churn_rate || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      This month
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Communication Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Communication Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatPercentage(analytics?.communication_stats?.email_open_rate || 0)}
                      </div>
                      <p className="text-sm text-gray-600">Email Open Rate</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {formatPercentage(analytics?.communication_stats?.email_click_rate || 0)}
                      </div>
                      <p className="text-sm text-gray-600">Email Click Rate</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {formatPercentage(analytics?.communication_stats?.response_rate || 0)}
                      </div>
                      <p className="text-sm text-gray-600">Response Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Segments */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Customer Segments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analytics?.top_segments?.map((segment, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="font-medium">{segment.segment}</span>
                        <div className="text-right">
                          <span className="text-sm text-gray-600">{segment.count} customers</span>
                          <span className="text-sm text-gray-500 ml-2">
                            ({formatPercentage(segment.percentage)})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="customers">
          <CustomerList
            onSelectCustomer={handleSelectCustomer}
            onEditCustomer={(customer) => {
              setSelectedCustomer(customer);
              setActiveTab('customer-profile');
            }}
          />
        </TabsContent>

        <TabsContent value="support">
          <SupportTickets />
        </TabsContent>

        <TabsContent value="communications">
          <Card>
            <CardHeader>
              <CardTitle>Communication Center</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Mail className="mx-auto h-12 w-12 mb-4" />
                <p>Communication tracking and management features</p>
                <p className="text-sm">Email templates, campaigns, and interaction history</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};