import { AdminLayout } from '@/components/admin/AdminLayout';
import { VendorList } from '@/components/admin/VendorList';

export function VendorsPage() {
  return (
    <AdminLayout>
      <VendorList />
    </AdminLayout>
  );
}