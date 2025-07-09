import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { BrokerProfile, BrokerDashboardData, BrokerApplicationRequest } from '@/types/broker';

interface BrokerStatus {
  is_broker: boolean;
  application_status: 'pending' | 'approved' | 'rejected' | null;
  application_id?: string;
  company_name?: string;
  submitted_date?: string;
  can_apply?: boolean;
}

export function useBroker() {
  const { user, isAuthenticated } = useAuth();
  const [brokerStatus, setBrokerStatus] = useState<BrokerStatus>({
    is_broker: false,
    application_status: null,
    can_apply: false
  });
  const [brokerProfile, setBrokerProfile] = useState<BrokerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchBrokerStatus();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  const fetchBrokerStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/broker/status');
      if (!response.ok) {
        throw new Error('Failed to fetch broker status');
      }

      const data = await response.json();
      setBrokerStatus(data);

      if (data.is_broker && data.broker_profile) {
        setBrokerProfile(data.broker_profile);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch broker status');
    } finally {
      setIsLoading(false);
    }
  };

  const applyForBrokerStatus = async (applicationData: BrokerApplicationRequest) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/broker/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit broker application');
      }

      const result = await response.json();
      
      // Refresh broker status
      await fetchBrokerStatus();
      
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit application');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateBrokerProfile = async (profileData: Partial<BrokerProfile>) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/broker/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update broker profile');
      }

      const result = await response.json();
      setBrokerProfile(result.profile);
      
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    brokerStatus,
    brokerProfile,
    isLoading,
    error,
    applyForBrokerStatus,
    updateBrokerProfile,
    refreshBrokerStatus: fetchBrokerStatus
  };
}

export function useBrokerDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [dashboardData, setDashboardData] = useState<BrokerDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchDashboardData();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/broker/dashboard');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    dashboardData,
    isLoading,
    error,
    refreshDashboard: fetchDashboardData
  };
}