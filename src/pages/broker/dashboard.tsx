import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useBroker } from '@/hooks/useBroker';
import { BrokerDashboard } from '@/components/broker/BrokerDashboard';
import { BrokerRequestForm } from '@/components/broker/BrokerRequestForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Crown, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle 
} from 'lucide-react';

export default function BrokerDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { brokerStatus, isLoading: brokerLoading, error } = useBroker();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/broker/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || brokerLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show broker dashboard if approved
  if (brokerStatus.is_broker) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <BrokerDashboard />
        </div>
      </div>
    );
  }

  // Show application status if pending/rejected
  if (brokerStatus.application_status) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <ApplicationStatus
            status={brokerStatus.application_status}
            companyName={brokerStatus.company_name}
            submittedDate={brokerStatus.submitted_date}
            onReapply={() => router.push('/broker/apply')}
          />
        </div>
      </div>
    );
  }

  // Show apply option if no application exists
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <Crown className="h-8 w-8 text-yellow-600" />
          </div>
          <CardTitle>Become a Broker</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Apply for broker status to unlock exclusive discounts and benefits.
          </p>
          <div className="space-y-2 text-sm">
            <div>✓ Up to 20% discount on all orders</div>
            <div>✓ Volume-based pricing tiers</div>
            <div>✓ Dedicated account support</div>
            <div>✓ Extended payment terms</div>
          </div>
          <Button 
            className="w-full" 
            onClick={() => router.push('/broker/apply')}
          >
            Apply for Broker Status
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function ApplicationStatus({
  status,
  companyName,
  submittedDate,
  onReapply
}: {
  status: 'pending' | 'rejected';
  companyName?: string;
  submittedDate?: string;
  onReapply: () => void;
}) {
  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return <Clock className="h-8 w-8 text-yellow-600" />;
      case 'rejected':
        return <XCircle className="h-8 w-8 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100';
      case 'rejected':
        return 'bg-red-100';
      default:
        return 'bg-gray-100';
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'pending':
        return {
          title: 'Application Under Review',
          description: 'Your broker application is being reviewed. You\'ll receive an email notification once it\'s processed.',
          timeframe: 'Typically reviewed within 2-3 business days'
        };
      case 'rejected':
        return {
          title: 'Application Not Approved',
          description: 'Your broker application was not approved at this time. You may reapply after addressing the feedback.',
          timeframe: 'You can submit a new application at any time'
        };
      default:
        return { title: '', description: '', timeframe: '' };
    }
  };

  const statusInfo = getStatusMessage();

  return (
    <Card>
      <CardHeader className="text-center">
        <div className={`mx-auto w-16 h-16 ${getStatusColor()} rounded-full flex items-center justify-center mb-4`}>
          {getStatusIcon()}
        </div>
        <CardTitle>{statusInfo.title}</CardTitle>
        {companyName && (
          <Badge variant="outline" className="mx-auto">
            {companyName}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-gray-600">{statusInfo.description}</p>
        
        {submittedDate && (
          <div className="text-sm text-gray-500">
            Submitted: {new Date(submittedDate).toLocaleDateString()}
          </div>
        )}
        
        <div className="text-xs text-gray-400">
          {statusInfo.timeframe}
        </div>

        {status === 'rejected' && (
          <Button onClick={onReapply} className="w-full">
            Submit New Application
          </Button>
        )}
      </CardContent>
    </Card>
  );
}