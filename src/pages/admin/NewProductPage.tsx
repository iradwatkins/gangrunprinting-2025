import { AdminLayout } from '@/components/admin/AdminLayout';
import { EnhancedProductForm } from '@/components/admin/EnhancedProductForm';

export function NewProductPage() {
  return (
    <AdminLayout>
      <EnhancedProductForm mode="create" />
    </AdminLayout>
  );
}