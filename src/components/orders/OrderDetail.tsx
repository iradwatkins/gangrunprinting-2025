import React, { useState } from 'react';
import { useOrderDetail } from '@/hooks/useOrders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { OrderStatusTracker } from './OrderStatusTracker';
import { OrderJobCard } from './OrderJobCard';
import { ReorderInterface } from './ReorderInterface';
import { OrderPDFGenerator } from '@/utils/pdf/orderPDF';
import { 
  Package, 
  MapPin, 
  CreditCard, 
  FileText, 
  Download, 
  Edit3,
  Save,
  X,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface OrderDetailProps {
  orderId: string;
  onBack?: () => void;
}

export const OrderDetail: React.FC<OrderDetailProps> = ({ orderId, onBack }) => {
  const { order, loading, error, updateNotes } = useOrderDetail(orderId);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const { toast } = useToast();

  const handleEditNotes = () => {
    setEditingNotes(true);
    setNotesValue(order?.notes || '');
  };

  const handleSaveNotes = async () => {
    if (!order) return;
    
    try {
      setSavingNotes(true);
      await updateNotes(notesValue);
      setEditingNotes(false);
      toast({
        title: "Notes updated",
        description: "Order notes have been updated successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update notes. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSavingNotes(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingNotes(false);
    setNotesValue('');
  };

  const handleDownloadPDF = async (type: 'order' | 'invoice' | 'receipt') => {
    if (!order) return;
    
    try {
      let blob: Blob;
      let filename: string;
      
      switch (type) {
        case 'invoice':
          blob = await OrderPDFGenerator.generateInvoicePDF(order);
          filename = `invoice-${order.reference_number}.pdf`;
          break;
        case 'receipt':
          blob = await OrderPDFGenerator.generateReceiptPDF(order);
          filename = `receipt-${order.reference_number}.pdf`;
          break;
        default:
          blob = await OrderPDFGenerator.generateOrderPDF(order);
          filename = `order-${order.reference_number}.pdf`;
      }
      
      OrderPDFGenerator.downloadPDF(blob, filename);
      
      toast({
        title: "PDF Downloaded",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} PDF has been downloaded successfully.`
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'pending_payment': return 'bg-yellow-100 text-yellow-800';
      case 'payment_confirmed': return 'bg-blue-100 text-blue-800';
      case 'in_production': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const formatAddress = (address: any) => {
    if (!address) return 'N/A';
    return `${address.street1}${address.street2 ? `, ${address.street2}` : ''}, ${address.city}, ${address.state} ${address.zip}`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin" />
            <p>Loading order details...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Error loading order: {error}</p>
            {onBack && (
              <Button onClick={onBack} className="mt-4">
                Go Back
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!order) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p>Order not found</p>
            {onBack && (
              <Button onClick={onBack} className="mt-4">
                Go Back
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Order {order.reference_number}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(order.status)}>
                {formatStatus(order.status)}
              </Badge>
              {onBack && (
                <Button variant="outline" onClick={onBack}>
                  Back to Orders
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Order Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Order Date:</span>
                  <span>{format(new Date(order.created_at), 'PPP')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Updated:</span>
                  <span>{format(new Date(order.updated_at), 'PPP')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Method:</span>
                  <span>{order.payment_method || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Status:</span>
                  <span className="capitalize">{order.payment_status || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>${order.tax_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>${order.shipping_cost.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>${order.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <OrderStatusTracker 
        status={order.status} 
        statusHistory={order.status_history}
        createdAt={order.created_at}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Shipping Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{formatAddress(order.shipping_address)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Billing Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{formatAddress(order.billing_address)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Order Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.order_jobs.map((job, index) => (
              <OrderJobCard key={job.id} job={job} />
            ))}
          </div>
        </CardContent>
      </Card>

      {(order.notes || order.special_instructions) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Notes & Instructions
              </span>
              {!editingNotes && (
                <Button variant="ghost" size="sm" onClick={handleEditNotes}>
                  <Edit3 className="w-4 h-4" />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.special_instructions && (
                <div>
                  <h4 className="font-medium mb-2">Special Instructions:</h4>
                  <p className="text-sm text-gray-600">{order.special_instructions}</p>
                </div>
              )}
              
              <div>
                <h4 className="font-medium mb-2">Notes:</h4>
                {editingNotes ? (
                  <div className="space-y-2">
                    <Textarea
                      value={notesValue}
                      onChange={(e) => setNotesValue(e.target.value)}
                      placeholder="Add your notes here..."
                      className="min-h-[100px]"
                    />
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={handleSaveNotes}
                        disabled={savingNotes}
                      >
                        {savingNotes ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save
                          </>
                        )}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={handleCancelEdit}
                        disabled={savingNotes}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    {order.notes || 'No notes added yet'}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4 flex-wrap">
        <ReorderInterface orderId={order.id} />
        <Button variant="outline" onClick={() => handleDownloadPDF('order')}>
          <Download className="w-4 h-4 mr-2" />
          Download Order
        </Button>
        <Button variant="outline" onClick={() => handleDownloadPDF('invoice')}>
          <Download className="w-4 h-4 mr-2" />
          Download Invoice
        </Button>
        <Button variant="outline" onClick={() => handleDownloadPDF('receipt')}>
          <Download className="w-4 h-4 mr-2" />
          Download Receipt
        </Button>
      </div>
    </div>
  );
};