import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBroker } from '@/hooks/useBroker';
import { BrokerRequestForm } from '@/components/broker/BrokerRequestForm';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Layout } from '@/components/layout/Layout';
import { AlertCircle } from 'lucide-react';

export default function BrokerRequestPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { brokerStatus, isLoading: brokerLoading } = useBroker();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth/login?redirect=/broker/request');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (!brokerLoading && brokerStatus.is_broker) {
      navigate('/broker/dashboard');
    }
  }, [brokerStatus.is_broker, brokerLoading, navigate]);

  useEffect(() => {
    if (!brokerLoading && brokerStatus.application_status === 'pending') {
      navigate('/broker/dashboard');
    }
  }, [brokerStatus.application_status, brokerLoading, navigate]);

  if (authLoading || brokerLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (brokerStatus.is_broker || brokerStatus.application_status === 'pending') {
    return null; // Will redirect via useEffect
  }

  const handleSuccess = () => {
    navigate('/broker/dashboard');
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {brokerStatus.application_status === 'rejected' && (
            <div className="max-w-2xl mx-auto mb-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Your previous application was not approved. You can submit a new application with updated information.
                </AlertDescription>
              </Alert>
            </div>
          )}
          
          <BrokerRequestForm
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </Layout>
  );
}