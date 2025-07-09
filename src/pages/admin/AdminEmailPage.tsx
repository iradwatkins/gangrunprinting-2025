import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import EmailDashboard from '../email/EmailDashboard';

export function AdminEmailPage() {
  return (
    <AdminLayout>
      <EmailDashboard />
    </AdminLayout>
  );
}