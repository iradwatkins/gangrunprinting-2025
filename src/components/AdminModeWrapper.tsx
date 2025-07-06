import React from 'react';
import { AdminModeProvider } from '@/contexts/AdminModeContext';
import { useAuth } from '@/contexts/AuthContext';

interface AdminModeWrapperProps {
  children: React.ReactNode;
}

export function AdminModeWrapper({ children }: AdminModeWrapperProps) {
  const { user } = useAuth();
  
  return (
    <AdminModeProvider userRole={user?.profile?.role}>
      {children}
    </AdminModeProvider>
  );
}