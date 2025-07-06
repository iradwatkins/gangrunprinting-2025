import { AdminLayout } from '@/components/admin/AdminLayout';
import { PaperStockList } from '@/components/admin/PaperStockList';

export function PaperStocksPage() {
  return (
    <AdminLayout>
      <PaperStockList />
    </AdminLayout>
  );
}