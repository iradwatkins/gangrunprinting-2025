import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { OrderDetail } from '@/components/orders/OrderDetail';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const OrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/account/orders');
  };

  if (!orderId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600">Invalid order ID</p>
          <Button onClick={handleBack} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <OrderDetail orderId={orderId} onBack={handleBack} />
    </div>
  );
};