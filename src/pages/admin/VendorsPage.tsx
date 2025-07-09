import { AdminLayout } from '@/components/admin/AdminLayout';
import { VendorList } from '@/components/admin/VendorList';
import { ErrorBoundary } from '@/components/ui/error-boundary';

export function VendorsPage() {
  return (
    <AdminLayout>
      <ErrorBoundary fallback={<div className="p-4 text-red-600">Error loading Vendors. Please refresh the page.</div>}>
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
      </ErrorBoundary>
    </AdminLayout>
  );
}