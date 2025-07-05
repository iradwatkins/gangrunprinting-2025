import React from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AnalyticsDashboard } from '../../components/analytics/AnalyticsDashboard';

export function AnalyticsPage() {
  return (
    <AdminLayout>
      <AnalyticsDashboard />
    </AdminLayout>
  );
}