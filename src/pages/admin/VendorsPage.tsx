import { AdminLayout } from '@/components/admin/AdminLayout';
import { VendorList } from '@/components/admin/VendorList';

export function VendorsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Vendor Management</h1>
            <p className="text-gray-600">Manage print vendors, email communication, and performance tracking</p>
          </div>
        </div>

        {/* Vendor List */}
        <VendorList />
      </div>
    </AdminLayout>
  );
}