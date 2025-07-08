import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { PaperStockForm } from '@/components/admin/PaperStockForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export function NewPaperStockPage() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(true);

  const handleSuccess = () => {
    navigate('/admin/paper-stocks');
  };

  const handleClose = () => {
    navigate('/admin/paper-stocks');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/paper-stocks')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Paper Stocks
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create New Paper Stock</h1>
            <p className="text-muted-foreground">
              Add a new paper stock for product configuration
            </p>
          </div>
        </div>

        <PaperStockForm
          open={showForm}
          onClose={handleClose}
          paperStock={null}
          onSuccess={handleSuccess}
        />
      </div>
    </AdminLayout>
  );
}