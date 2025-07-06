import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { OrdersPage } from '../orders/OrdersPage';
import { CreateOrderForCustomer } from '@/components/admin/CreateOrderForCustomer';

export function AdminOrdersPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Admin Actions */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Order Management</h1>
            <p className="text-gray-600">Manage all orders and create new orders for customers</p>
          </div>
          <CreateOrderForCustomer />
        </div>
        
        {/* Orders List */}
        <OrdersPage />
      </div>
    </AdminLayout>
  );
}