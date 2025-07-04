import { AdminLayout } from '@/components/admin/AdminLayout';
import { ProductForm } from '@/components/admin/ProductForm';

export function NewProductPage() {
  return (
    <AdminLayout>
      <ProductForm mode="create" />
    </AdminLayout>
  );
}