import { AdminLayout } from '@/components/admin/AdminLayout';
import { ProductList } from '@/components/admin/ProductList';

export function ProductsPage() {
  return (
    <AdminLayout>
      <ProductList />
    </AdminLayout>
  );
}