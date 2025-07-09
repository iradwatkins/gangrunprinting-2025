import { AdminLayout } from '@/components/admin/AdminLayout';
import { PaperStockList } from '@/components/admin/PaperStockList';
import { ErrorBoundary } from '@/components/ui/error-boundary';

export function PaperStocksPage() {
  return (
    <AdminLayout>
      <ErrorBoundary fallback={<div className="p-4 text-red-600">Error loading Paper Stocks. Please refresh the page.</div>}>
        <PaperStockList />
      </ErrorBoundary>
    </AdminLayout>
  );
}