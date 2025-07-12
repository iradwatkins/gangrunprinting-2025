import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export function AdminLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect non-admin users immediately
    if (!loading && (!user || !user.profile || (user.profile.role !== 'admin' && user.profile.role !== 'super_admin'))) {
      console.warn('Access denied: User is not an admin');
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Double-check admin access - Allow both admin and super_admin
  if (!user || !user.profile || (user.profile.role !== 'admin' && user.profile.role !== 'super_admin')) {
    return null; // Don't render anything while redirecting
  }

  // Render admin routes
  return <Outlet />;
}