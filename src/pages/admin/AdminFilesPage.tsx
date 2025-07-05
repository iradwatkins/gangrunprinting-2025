import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import FilesPage from '../files/FilesPage';

export function AdminFilesPage() {
  return (
    <AdminLayout>
      <FilesPage />
    </AdminLayout>
  );
}