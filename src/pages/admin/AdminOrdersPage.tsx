import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { OrdersPage } from '../orders/OrdersPage';

export function AdminOrdersPage() {
  return (
    <AdminLayout>
      <OrdersPage />
    </AdminLayout>
  );
}