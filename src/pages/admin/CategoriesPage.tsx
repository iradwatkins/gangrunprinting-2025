import { AdminLayout } from '@/components/admin/AdminLayout';
import { CategoryTree } from '@/components/admin/CategoryTree';
import { ErrorBoundary } from '@/components/ui/error-boundary';

export function CategoriesPage() {
  return (
    <AdminLayout>
      <ErrorBoundary fallback={<div className="p-4 text-red-600">Error loading Categories. Please refresh the page.</div>}>
        <CategoryTree />
      </ErrorBoundary>
    </AdminLayout>
  );
}