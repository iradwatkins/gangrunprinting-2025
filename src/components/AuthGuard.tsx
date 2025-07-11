import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

export function AuthGuard({ children, requireAuth = false, requireAdmin = false }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [showTimeout, setShowTimeout] = useState(false);

  useEffect(() => {
    // Show timeout message after 3 seconds
    const timer = setTimeout(() => {
      if (loading) {
        setShowTimeout(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [loading]);

  // Show loading state with timeout handling
  if (loading && !showTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If loading times out, allow access but show a warning
  if (loading && showTimeout) {
    console.warn('Auth loading timeout - allowing access');
    return <>{children}</>;
  }

  // Check authentication requirements
  if (requireAuth && !user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check admin requirements
  if (requireAdmin) {
    // Check if user exists and has admin role
    if (!user || !user.profile || user.profile.role !== 'admin') {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}