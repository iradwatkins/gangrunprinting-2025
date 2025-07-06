import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Layout } from '@/components/layout/Layout';
import { invoicesApi, type CustomerInvoice } from '@/api/invoices';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/hooks/useCart';
import { 
  FileText, 
  CreditCard, 
  Calendar, 
  User, 
  Building, 
  Phone, 
  Mail,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

export default function InvoicePaymentPage() {
  const { invoiceNumber } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [invoice, setInvoice] = useState<CustomerInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (invoiceNumber) {
      loadInvoice(invoiceNumber);
    }
  }, [invoiceNumber]);

  const loadInvoice = async (invoiceNum: string) => {
    setLoading(true);
    const response = await invoicesApi.getInvoiceByNumber(invoiceNum);
    
    if (response.success) {
      setInvoice(response.data);
    } else {
      setError(response.error);
    }
    
    setLoading(false);
  };

  const handlePayInvoice = async () => {
    if (!invoice) return;

    if (invoice.status === 'paid') {
      toast.info('This invoice has already been paid');
      return;
    }

    setProcessing(true);
    
    try {
      // Add invoice items to cart
      for (const item of invoice.items) {
        await addToCart({
          id: `invoice-${item.id}`,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          configuration: {}, // Invoice items don't need configuration
          configuration_display: {}, // Invoice items don't need configuration display
          product_id: null // Invoice items are custom
        });
      }

      // Store invoice reference for checkout
      sessionStorage.setItem('invoice_payment', JSON.stringify({
        invoice_number: invoice.invoice_number,
        customer_email: invoice.customer_email,
        total_amount: invoice.total_amount
      }));

      toast.success('Invoice items added to cart. Redirecting to checkout...');
      
      // Redirect to checkout
      setTimeout(() => {
        navigate('/checkout');
      }, 1000);
      
    } catch (error) {
      console.error('Error processing invoice payment:', error);
      toast.error('Failed to process invoice payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !invoice) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error || 'Invoice not found'}
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Invoice Payment</h1>
            <p className="text-gray-600">
              Please review the invoice details below and proceed with payment
            </p>
          </div>

          {/* Invoice Details */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Invoice {invoice.invoice_number}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Created on {new Date(invoice.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge className={`${getStatusColor(invoice.status)} flex items-center gap-1`}>
                  {getStatusIcon(invoice.status)}
                  {invoice.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Customer Information */}
              <div>
                <h3 className="font-semibold mb-3">Bill To:</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span>{invoice.customer_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span>{invoice.customer_email}</span>
                  </div>
                  {invoice.customer_company && (
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-500" />
                      <span>{invoice.customer_company}</span>
                    </div>
                  )}
                  {invoice.customer_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span>{invoice.customer_phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Invoice Items */}
              <div>
                <h3 className="font-semibold mb-3">Items:</h3>
                <div className="space-y-3">
                  {invoice.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-start p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.product_name}</h4>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity} × ${item.unit_price.toFixed(2)}
                        </p>
                        {item.notes && (
                          <p className="text-xs text-gray-500 mt-1">{item.notes}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="font-semibold">${item.total_price.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {invoice.notes && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2">Notes:</h3>
                    <p className="text-sm text-gray-600">{invoice.notes}</p>
                  </div>
                </>
              )}

              <Separator />

              {/* Total */}
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total Amount:</span>
                <span>${invoice.total_amount.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Actions */}
          {invoice.status === 'pending' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Click the button below to add these items to your cart and proceed with secure checkout.
                </p>
                
                <div className="flex gap-4">
                  <Button 
                    onClick={handlePayInvoice}
                    disabled={processing}
                    className="flex-1"
                    size="lg"
                  >
                    {processing ? 'Processing...' : 'Proceed to Checkout'}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/')}
                    size="lg"
                  >
                    Back to Home
                  </Button>
                </div>

                <div className="text-xs text-gray-500 text-center">
                  Secure payment powered by our e-commerce platform
                </div>
              </CardContent>
            </Card>
          )}

          {invoice.status === 'paid' && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                This invoice has been paid successfully. Thank you for your business!
              </AlertDescription>
            </Alert>
          )}

          {invoice.status === 'cancelled' && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                This invoice has been cancelled and is no longer payable.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </Layout>
  );
}