import { AdminLayout } from '@/components/admin/AdminLayout';
import { ProductForm } from '@/components/admin/ProductForm';

export function EditProductPage() {
  return (
    <AdminLayout>
      <ProductForm mode="edit" />
    </AdminLayout>
  );
}