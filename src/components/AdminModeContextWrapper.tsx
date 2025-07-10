import React from 'react';
import { AdminModeProvider } from '@/contexts/AdminModeContext';
import { useAuth } from '@/contexts/AuthContext';

interface AdminModeContextWrapperProps {
  children: React.ReactNode;
}

export function AdminModeContextWrapper({ children }: AdminModeContextWrapperProps) {
  const { user } = useAuth();
  
  return (
    <AdminModeProvider userRole={user?.profile?.role}>
      {children}
    </AdminModeProvider>
  );
}