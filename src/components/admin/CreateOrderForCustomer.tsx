import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { UserPlus, Plus, Trash2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { invoicesApi } from '@/api/invoices';

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
}

interface CustomerInfo {
  email: string;
  full_name: string;
  company?: string;
  phone?: string;
}

export function CreateOrderForCustomer() {
  const [isOpen, setIsOpen] = useState(false);
  const [customer, setCustomer] = useState<CustomerInfo>({
    email: '',
    full_name: '',
    company: '',
    phone: ''
  });
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [newItem, setNewItem] = useState({
    product_name: '',
    quantity: 1,
    unit_price: 0,
    notes: ''
  });
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addOrderItem = () => {
    if (!newItem.product_name || newItem.unit_price <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    const item: OrderItem = {
      id: Date.now().toString(),
      product_name: newItem.product_name,
      quantity: newItem.quantity,
      unit_price: newItem.unit_price,
      total_price: newItem.quantity * newItem.unit_price,
      notes: newItem.notes || undefined
    };

    setOrderItems([...orderItems, item]);
    setNewItem({
      product_name: '',
      quantity: 1,
      unit_price: 0,
      notes: ''
    });
  };

  const removeOrderItem = (id: string) => {
    setOrderItems(orderItems.filter(item => item.id !== id));
  };

  const getTotalAmount = () => {
    return orderItems.reduce((total, item) => total + item.total_price, 0);
  };

  const handleSubmit = async () => {
    if (!customer.email || !customer.full_name || orderItems.length === 0) {
      toast.error('Please fill in customer information and add at least one order item');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create invoice for customer
      const invoiceData = {
        customer_email: customer.email,
        customer_name: customer.full_name,
        customer_company: customer.company || undefined,
        customer_phone: customer.phone || undefined,
        items: orderItems,
        notes: orderNotes || undefined,
        total_amount: getTotalAmount(),
        status: 'pending' as const,
        created_by_admin: true
      };

      const response = await invoicesApi.createInvoice(invoiceData);
      
      if (response.success) {
        const invoice = response.data;
        toast.success(`Invoice ${invoice.invoice_number} created successfully!`);
        
        // Send invoice email to customer
        await invoicesApi.sendInvoiceEmail(invoice.invoice_number);
        
        toast.info(`Payment link sent to ${customer.email}`);
        
        // Copy payment link to clipboard
        const paymentLink = `${window.location.origin}/invoice/${invoice.invoice_number}/pay`;
        await navigator.clipboard.writeText(paymentLink);
        toast.info('Payment link copied to clipboard');
        
        // Reset form
        setCustomer({ email: '', full_name: '', company: '', phone: '' });
        setOrderItems([]);
        setOrderNotes('');
        setIsOpen(false);
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error('Failed to create invoice. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Create Order for Customer
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Order for Customer</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customer.email}
                    onChange={(e) => setCustomer({...customer, email: e.target.value})}
                    placeholder="customer@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={customer.full_name}
                    onChange={(e) => setCustomer({...customer, full_name: e.target.value})}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={customer.company}
                    onChange={(e) => setCustomer({...customer, company: e.target.value})}
                    placeholder="Acme Corp"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={customer.phone}
                    onChange={(e) => setCustomer({...customer, phone: e.target.value})}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add New Item */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg bg-gray-50">
                <div>
                  <Label htmlFor="product_name">Product Name</Label>
                  <Input
                    id="product_name"
                    value={newItem.product_name}
                    onChange={(e) => setNewItem({...newItem, product_name: e.target.value})}
                    placeholder="Business Cards"
                  />
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 1})}
                  />
                </div>
                <div>
                  <Label htmlFor="unit_price">Unit Price ($)</Label>
                  <Input
                    id="unit_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newItem.unit_price}
                    onChange={(e) => setNewItem({...newItem, unit_price: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    value={newItem.notes}
                    onChange={(e) => setNewItem({...newItem, notes: e.target.value})}
                    placeholder="Optional notes"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={addOrderItem} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </div>

              {/* Order Items List */}
              {orderItems.length > 0 && (
                <div className="space-y-2">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{item.product_name}</div>
                        <div className="text-sm text-gray-600">
                          Qty: {item.quantity} × ${item.unit_price.toFixed(2)} = ${item.total_price.toFixed(2)}
                        </div>
                        {item.notes && (
                          <div className="text-xs text-gray-500 mt-1">{item.notes}</div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOrderItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {orderItems.length > 0 && (
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="font-medium">Total Amount:</span>
                  <span className="text-lg font-bold">${getTotalAmount().toFixed(2)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Add any special instructions or notes for this order..."
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting || !customer.email || !customer.full_name || orderItems.length === 0}
            >
              {isSubmitting ? 'Creating Order...' : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Create Order & Send Invoice
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}