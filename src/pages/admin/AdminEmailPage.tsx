import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import EmailDashboard from '../email/EmailDashboard';

export function AdminEmailPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Email Marketing</h1>
            <p className="text-gray-600">Manage email campaigns, templates, and automation</p>
          </div>
        </div>

        {/* Email Dashboard */}
        <EmailDashboard />
      </div>
    </AdminLayout>
  );
}