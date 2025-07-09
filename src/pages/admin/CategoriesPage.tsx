import { AdminLayout } from '@/components/admin/AdminLayout';
import { CategoryTree } from '@/components/admin/CategoryTree';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export function CategoriesPage() {
  return (
    <AdminLayout>
      <ErrorBoundary>
        <CategoryTree />
      </ErrorBoundary>
    </AdminLayout>
  );
}