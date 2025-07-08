import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function NewPaperStockPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to main paper stocks page where creation happens
    navigate('/admin/paper-stocks', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>
  );
}