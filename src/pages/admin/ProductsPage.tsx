import { AdminLayout } from '@/components/admin/AdminLayout';
import { ProductList } from '@/components/admin/ProductList';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export function ProductsPage() {
  return (
    <AdminLayout>
      <ErrorBoundary>
        <ProductList />
      </ErrorBoundary>
    </AdminLayout>
  );
}