import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { UserManagement } from './UserManagement';

export function UserManagementPage() {
  return (
    <AdminLayout>
      <UserManagement />
    </AdminLayout>
  );
}