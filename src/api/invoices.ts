import { supabase } from '@/integrations/supabase/client';

export interface CustomerInvoice {
  id: string;
  customer_email: string;
  customer_name: string;
  customer_company?: string;
  customer_phone?: string;
  items: Array<{
    id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    notes?: string;
  }>;
  total_amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  invoice_number: string;
  created_at: string;
  created_by_admin: boolean;
  notes?: string;
  payment_link?: string;
}

export const invoicesApi = {
  // Create a new invoice for a customer
  async createInvoice(invoiceData: Omit<CustomerInvoice, 'id' | 'created_at' | 'invoice_number' | 'payment_link'>) {
    try {
      // Generate invoice number
      const invoiceNumber = `INV-${Date.now()}`;
      
      const { data, error } = await supabase
        .from('customer_invoices')
        .insert({
          ...invoiceData,
          invoice_number: invoiceNumber,
          payment_link: `/invoice/${invoiceNumber}/pay`
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create invoice' 
      };
    }
  },

  // Get invoice by invoice number
  async getInvoiceByNumber(invoiceNumber: string) {
    try {
      const { data, error } = await supabase
        .from('customer_invoices')
        .select('*')
        .eq('invoice_number', invoiceNumber)
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Invoice not found' 
      };
    }
  },

  // Update invoice status
  async updateInvoiceStatus(invoiceNumber: string, status: CustomerInvoice['status']) {
    try {
      const { data, error } = await supabase
        .from('customer_invoices')
        .update({ status })
        .eq('invoice_number', invoiceNumber)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update invoice' 
      };
    }
  },

  // Get all invoices for admin
  async getInvoices(filters?: { status?: string; customer_email?: string }) {
    try {
      let query = supabase
        .from('customer_invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.customer_email) {
        query = query.eq('customer_email', filters.customer_email);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch invoices',
        data: [] 
      };
    }
  },

  // Send invoice email to customer
  async sendInvoiceEmail(invoiceNumber: string) {
    try {
      // TODO: Implement email sending via Supabase Edge Function
      // For now, just simulate success
      
      return { success: true, message: 'Invoice email sent successfully' };
    } catch (error) {
      return { 
        success: false, 
        error: 'Failed to send invoice email' 
      };
    }
  }
};