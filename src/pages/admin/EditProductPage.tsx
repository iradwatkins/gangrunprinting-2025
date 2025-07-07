import { AdminLayout } from '@/components/admin/AdminLayout';
import { EnhancedProductForm } from '@/components/admin/EnhancedProductForm';

export function EditProductPage() {
  return (
    <AdminLayout>
      <EnhancedProductForm mode="edit" />
    </AdminLayout>
  );
}