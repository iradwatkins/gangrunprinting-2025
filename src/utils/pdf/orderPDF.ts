import { OrderDetail } from '@/types/orders';

export class OrderPDFGenerator {
  static async generateOrderPDF(order: OrderDetail): Promise<Blob> {
    const htmlContent = this.generateOrderHTML(order);
    return this.htmlToPDF(htmlContent);
  }

  static async generateInvoicePDF(order: OrderDetail): Promise<Blob> {
    const htmlContent = this.generateInvoiceHTML(order);
    return this.htmlToPDF(htmlContent);
  }

  static async generateReceiptPDF(order: OrderDetail): Promise<Blob> {
    const htmlContent = this.generateReceiptHTML(order);
    return this.htmlToPDF(htmlContent);
  }

  static generateOrderHTML(order: OrderDetail): string {
    const formatAddress = (address: any) => {
      if (!address) return 'N/A';
      return `${address.street1}${address.street2 ? `, ${address.street2}` : ''}<br>${address.city}, ${address.state} ${address.zip}`;
    };

    const formatStatus = (status: string) => {
      return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order ${order.reference_number}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; }
          .company-name { font-size: 24px; font-weight: bold; color: #1f2937; }
          .order-title { font-size: 20px; margin-top: 10px; color: #6b7280; }
          .order-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .info-section { width: 48%; }
          .info-section h3 { margin-bottom: 10px; color: #1f2937; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
          .info-row span:first-child { font-weight: bold; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .items-table th, .items-table td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; }
          .items-table th { background-color: #f9fafb; font-weight: bold; }
          .total-section { text-align: right; margin-top: 20px; }
          .total-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
          .total-row.final { font-weight: bold; font-size: 18px; border-top: 2px solid #e5e7eb; padding-top: 10px; }
          .status-badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
          .status-confirmed { background-color: #d1fae5; color: #065f46; }
          .status-production { background-color: #e0e7ff; color: #3730a3; }
          .status-shipped { background-color: #d1fae5; color: #065f46; }
          .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">Gang Run Printing</div>
          <div class="order-title">Order Details</div>
        </div>

        <div class="order-info">
          <div class="info-section">
            <h3>Order Information</h3>
            <div class="info-row">
              <span>Order Number:</span>
              <span>${order.reference_number}</span>
            </div>
            <div class="info-row">
              <span>Order Date:</span>
              <span>${formatDate(order.created_at)}</span>
            </div>
            <div class="info-row">
              <span>Status:</span>
              <span class="status-badge status-${order.status.replace('_', '-')}">${formatStatus(order.status)}</span>
            </div>
            <div class="info-row">
              <span>Payment Method:</span>
              <span>${order.payment_method || 'N/A'}</span>
            </div>
          </div>

          <div class="info-section">
            <h3>Shipping Address</h3>
            <div>${formatAddress(order.shipping_address)}</div>
          </div>
        </div>

        <h3>Order Items</h3>
        <table class="items-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Configuration</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.order_jobs.map(job => `
              <tr>
                <td>${job.product.name}</td>
                <td>
                  ${job.configuration_display.size}<br>
                  ${job.configuration_display.paper}<br>
                  ${job.configuration_display.coating ? `${job.configuration_display.coating}<br>` : ''}
                  ${job.configuration_display.turnaround}
                </td>
                <td>${job.quantity}</td>
                <td>$${job.unit_price.toFixed(2)}</td>
                <td>$${job.total_price.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="total-section">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>$${order.subtotal.toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>Tax:</span>
            <span>$${order.tax_amount.toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>Shipping:</span>
            <span>$${order.shipping_cost.toFixed(2)}</span>
          </div>
          <div class="total-row final">
            <span>Total:</span>
            <span>$${order.total_amount.toFixed(2)}</span>
          </div>
        </div>

        ${order.notes || order.special_instructions ? `
          <div style="margin-top: 30px;">
            <h3>Notes & Instructions</h3>
            ${order.special_instructions ? `<div><strong>Special Instructions:</strong> ${order.special_instructions}</div>` : ''}
            ${order.notes ? `<div><strong>Notes:</strong> ${order.notes}</div>` : ''}
          </div>
        ` : ''}

        <div class="footer">
          <p>Thank you for your business!</p>
          <p>Generated on ${formatDate(new Date().toISOString())}</p>
        </div>
      </body>
      </html>
    `;
  }

  static generateInvoiceHTML(order: OrderDetail): string {
    const formatAddress = (address: any) => {
      if (!address) return 'N/A';
      return `${address.street1}${address.street2 ? `, ${address.street2}` : ''}<br>${address.city}, ${address.state} ${address.zip}`;
    };

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice ${order.reference_number}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
          .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .company-info { flex: 1; }
          .company-name { font-size: 24px; font-weight: bold; color: #1f2937; }
          .invoice-info { text-align: right; flex: 1; }
          .invoice-title { font-size: 20px; font-weight: bold; color: #dc2626; }
          .invoice-number { font-size: 16px; margin-top: 5px; }
          .addresses { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .address-section { width: 48%; }
          .address-section h3 { margin-bottom: 10px; color: #1f2937; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .items-table th, .items-table td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; }
          .items-table th { background-color: #f9fafb; font-weight: bold; }
          .total-section { background-color: #f9fafb; padding: 20px; border-radius: 8px; }
          .total-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
          .total-row.final { font-weight: bold; font-size: 18px; border-top: 2px solid #e5e7eb; padding-top: 10px; }
          .payment-info { margin-top: 30px; padding: 20px; background-color: #f3f4f6; border-radius: 8px; }
          .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-info">
            <div class="company-name">Gang Run Printing</div>
            <div>123 Print Street</div>
            <div>Print City, PC 12345</div>
            <div>Phone: (555) 123-4567</div>
            <div>Email: info@gangrunprinting.com</div>
          </div>
          <div class="invoice-info">
            <div class="invoice-title">INVOICE</div>
            <div class="invoice-number">Invoice #: ${order.reference_number}</div>
            <div>Date: ${formatDate(order.created_at)}</div>
            <div>Due Date: ${formatDate(order.created_at)}</div>
          </div>
        </div>

        <div class="addresses">
          <div class="address-section">
            <h3>Bill To:</h3>
            <div>${formatAddress(order.billing_address)}</div>
          </div>
          <div class="address-section">
            <h3>Ship To:</h3>
            <div>${formatAddress(order.shipping_address)}</div>
          </div>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.order_jobs.map(job => `
              <tr>
                <td>
                  <strong>${job.product.name}</strong><br>
                  Size: ${job.configuration_display.size}<br>
                  Paper: ${job.configuration_display.paper}<br>
                  ${job.configuration_display.coating ? `Coating: ${job.configuration_display.coating}<br>` : ''}
                  Turnaround: ${job.configuration_display.turnaround}
                </td>
                <td>${job.quantity}</td>
                <td>$${job.unit_price.toFixed(2)}</td>
                <td>$${job.total_price.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="total-section">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>$${order.subtotal.toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>Tax (${(order.tax_amount / order.subtotal * 100).toFixed(1)}%):</span>
            <span>$${order.tax_amount.toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>Shipping:</span>
            <span>$${order.shipping_cost.toFixed(2)}</span>
          </div>
          <div class="total-row final">
            <span>Total Amount Due:</span>
            <span>$${order.total_amount.toFixed(2)}</span>
          </div>
        </div>

        <div class="payment-info">
          <h3>Payment Information</h3>
          <div>Payment Method: ${order.payment_method || 'N/A'}</div>
          <div>Payment Status: ${order.payment_status || 'N/A'}</div>
        </div>

        <div class="footer">
          <p>Thank you for your business!</p>
          <p>Questions? Contact us at info@gangrunprinting.com or (555) 123-4567</p>
        </div>
      </body>
      </html>
    `;
  }

  static generateReceiptHTML(order: OrderDetail): string {
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Receipt ${order.reference_number}</title>
        <style>
          body { font-family: 'Courier New', monospace; max-width: 400px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; }
          .company-name { font-size: 18px; font-weight: bold; }
          .receipt-title { font-size: 16px; margin-top: 10px; }
          .divider { border-top: 1px dashed #000; margin: 15px 0; }
          .row { display: flex; justify-content: space-between; margin-bottom: 5px; }
          .row.bold { font-weight: bold; }
          .items { margin: 20px 0; }
          .item { margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #eee; }
          .item:last-child { border-bottom: none; }
          .item-name { font-weight: bold; }
          .item-details { font-size: 12px; color: #666; }
          .total-section { border-top: 2px solid #000; padding-top: 10px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">GANG RUN PRINTING</div>
          <div class="receipt-title">RECEIPT</div>
        </div>

        <div class="divider"></div>

        <div class="row">
          <span>Order #:</span>
          <span>${order.reference_number}</span>
        </div>
        <div class="row">
          <span>Date:</span>
          <span>${formatDate(order.created_at)}</span>
        </div>
        <div class="row">
          <span>Status:</span>
          <span>${order.status.toUpperCase()}</span>
        </div>

        <div class="divider"></div>

        <div class="items">
          ${order.order_jobs.map(job => `
            <div class="item">
              <div class="item-name">${job.product.name}</div>
              <div class="item-details">
                ${job.configuration_display.size} | ${job.configuration_display.paper}<br>
                ${job.configuration_display.coating ? `${job.configuration_display.coating} | ` : ''}${job.configuration_display.turnaround}
              </div>
              <div class="row">
                <span>Qty: ${job.quantity} × $${job.unit_price.toFixed(2)}</span>
                <span>$${job.total_price.toFixed(2)}</span>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="total-section">
          <div class="row">
            <span>Subtotal:</span>
            <span>$${order.subtotal.toFixed(2)}</span>
          </div>
          <div class="row">
            <span>Tax:</span>
            <span>$${order.tax_amount.toFixed(2)}</span>
          </div>
          <div class="row">
            <span>Shipping:</span>
            <span>$${order.shipping_cost.toFixed(2)}</span>
          </div>
          <div class="divider"></div>
          <div class="row bold">
            <span>TOTAL:</span>
            <span>$${order.total_amount.toFixed(2)}</span>
          </div>
        </div>

        <div class="footer">
          <p>Thank you for your order!</p>
          <p>Questions? Call (555) 123-4567</p>
          <p>www.gangrunprinting.com</p>
        </div>
      </body>
      </html>
    `;
  }

  static async htmlToPDF(htmlContent: string): Promise<Blob> {
    // Create a temporary iframe to render the HTML
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px';
    iframe.style.top = '-9999px';
    iframe.style.width = '8.5in';
    iframe.style.height = '11in';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      document.body.removeChild(iframe);
      throw new Error('Failed to create PDF document');
    }

    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();

    try {
      // Wait for images and fonts to load
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Use window.print() to generate PDF
      const printWindow = iframe.contentWindow;
      if (!printWindow) {
        throw new Error('Failed to access print window');
      }

      // This is a simplified approach - in a real implementation,
      // you would use a library like jsPDF, Puppeteer, or a PDF service
      const htmlString = iframeDoc.documentElement.outerHTML;
      const blob = new Blob([htmlString], { type: 'text/html' });
      
      return blob;
    } finally {
      document.body.removeChild(iframe);
    }
  }

  static downloadPDF(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}