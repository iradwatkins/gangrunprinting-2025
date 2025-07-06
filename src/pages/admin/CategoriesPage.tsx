import { AdminLayout } from '@/components/admin/AdminLayout';
import { CategoryTree } from '@/components/admin/CategoryTree';

export function CategoriesPage() {
  return (
    <AdminLayout>
      <CategoryTree />
    </AdminLayout>
  );
}