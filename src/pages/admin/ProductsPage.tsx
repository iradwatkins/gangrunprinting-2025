import { ProductList } from '@/components/admin/ProductList';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export function ProductsPage() {
  return (
    <ErrorBoundary>
      <ProductList />
    </ErrorBoundary>
  );
}