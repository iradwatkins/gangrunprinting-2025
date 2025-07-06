import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminMode } from '@/contexts/AdminModeContext';
import { AccountDashboard } from '@/pages/account/AccountDashboard';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';

export function DashboardRouter() {
  const { user, isLoading } = useAuth();
  const { isAdminMode, canUseAdminMode } = useAdminMode();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If user can use admin mode AND they have it enabled, show admin dashboard
  // Otherwise show customer dashboard
  if (canUseAdminMode && isAdminMode) {
    return <AdminDashboard />;
  } else {
    return <AccountDashboard />;
  }
}