import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Building2, Calendar, CheckCircle, XCircle, Clock, Eye, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface BrokerApplication {
  id: string;
  user_id: string;
  company_name: string;
  business_type: string;
  tax_id: string;
  annual_volume: string;
  business_address: any;
  additional_info?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  user_profiles: {
    email: string;
    first_name?: string;
    last_name?: string;
  };
}

export function BrokerApplications() {
  const queryClient = useQueryClient();
  const [selectedApplication, setSelectedApplication] = useState<BrokerApplication | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('10');

  // Fetch broker applications - separate queries due to missing FK relationships
  const { data: applications, isLoading } = useQuery({
    queryKey: ['broker-applications'],
    queryFn: async () => {
      // Get broker applications separately
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('broker_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (applicationsError) throw applicationsError;

      // Get user profiles separately
      const { data: userProfiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select(`
          id,
          user_id,
          company_name,
          phone,
          is_broker
        `);

      if (profilesError) throw profilesError;

      // Manual join: combine applications with user profiles
      const applicationsWithUsers = applicationsData?.map(application => {
        const profile = userProfiles?.find(p => p.user_id === application.user_id);
        
        return {
          ...application,
          user_profiles: {
            email: `user${application.user_id.slice(-8)}@example.com`, // Placeholder since we can't get auth user email easily
            first_name: profile?.company_name || 'Unknown',
            last_name: ''
          }
        };
      }) || [];

      return applicationsWithUsers as BrokerApplication[];
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });

  // Approve application mutation
  const approveMutation = useMutation({
    mutationFn: async ({ applicationId, discount }: { applicationId: string; discount: number }) => {
      const { data, error } = await supabase
        .rpc('approve_broker_application', {
          application_id: applicationId,
          discount_percentage: discount
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broker-applications'] });
      toast.success('Application approved successfully');
      setShowReviewDialog(false);
      setSelectedApplication(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to approve application');
    }
  });

  // Reject application mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ applicationId, reason }: { applicationId: string; reason: string }) => {
      const { data, error } = await supabase
        .rpc('reject_broker_application', {
          application_id: applicationId,
          reason: reason
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broker-applications'] });
      toast.success('Application rejected');
      setShowReviewDialog(false);
      setSelectedApplication(null);
      setRejectionReason('');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to reject application');
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  const getVolumeLabel = (volume: string) => {
    const labels: Record<string, string> = {
      'under_10k': 'Under $10,000',
      '10k_50k': '$10,000 - $50,000',
      '50k_100k': '$50,000 - $100,000',
      '100k_250k': '$100,000 - $250,000',
      'over_250k': 'Over $250,000'
    };
    return labels[volume] || volume;
  };

  const handleApprove = () => {
    if (selectedApplication) {
      approveMutation.mutate({
        applicationId: selectedApplication.id,
        discount: parseFloat(discountPercentage)
      });
    }
  };

  const handleReject = () => {
    if (selectedApplication && rejectionReason) {
      rejectMutation.mutate({
        applicationId: selectedApplication.id,
        reason: rejectionReason
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Broker Applications</CardTitle>
          <CardDescription>
            Review and manage broker discount applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Business Type</TableHead>
                  <TableHead>Annual Volume</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications?.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span>{application.company_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {application.user_profiles.first_name} {application.user_profiles.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {application.user_profiles.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">
                      {application.business_type.replace('_', ' ')}
                    </TableCell>
                    <TableCell>{getVolumeLabel(application.annual_volume)}</TableCell>
                    <TableCell>{getStatusBadge(application.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{format(new Date(application.created_at), 'MMM d, yyyy')}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedApplication(application);
                          setShowReviewDialog(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {applications?.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No broker applications to review
            </p>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Broker Application</DialogTitle>
            <DialogDescription>
              Review the application details and approve or reject the broker status
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Company Name</Label>
                  <p className="font-medium">{selectedApplication.company_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Business Type</Label>
                  <p className="font-medium capitalize">
                    {selectedApplication.business_type.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Tax ID</Label>
                  <p className="font-medium">{selectedApplication.tax_id}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Annual Volume</Label>
                  <p className="font-medium">{getVolumeLabel(selectedApplication.annual_volume)}</p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Business Address</Label>
                <p className="font-medium">
                  {selectedApplication.business_address.street_address}<br />
                  {selectedApplication.business_address.street_address_2 && (
                    <>{selectedApplication.business_address.street_address_2}<br /></>
                  )}
                  {selectedApplication.business_address.city}, {selectedApplication.business_address.state} {selectedApplication.business_address.postal_code}
                </p>
              </div>

              {selectedApplication.additional_info && (
                <div>
                  <Label className="text-muted-foreground">Additional Information</Label>
                  <p className="font-medium">{selectedApplication.additional_info}</p>
                </div>
              )}

              {selectedApplication.status === 'pending' && (
                <>
                  <div className="border-t pt-4">
                    <Label htmlFor="discount">Discount Percentage</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <Input
                        id="discount"
                        type="number"
                        min="0"
                        max="100"
                        value={discountPercentage}
                        onChange={(e) => setDiscountPercentage(e.target.value)}
                        className="w-24"
                      />
                      <span className="text-muted-foreground">%</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Standard broker discount is 10%
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="rejection-reason">Rejection Reason (if rejecting)</Label>
                    <Textarea
                      id="rejection-reason"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Please provide a reason for rejection..."
                      rows={3}
                      className="mt-2"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
              Cancel
            </Button>
            {selectedApplication?.status === 'pending' && (
              <>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={!rejectionReason || rejectMutation.isPending}
                >
                  {rejectMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    'Reject'
                  )}
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={approveMutation.isPending}
                >
                  {approveMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    'Approve'
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}