import { supabase } from '@/integrations/supabase/client';
import { OrderDetail, OrderStatus } from '@/types/orders';

export interface NotificationPreferences {
  order_updates: boolean;
  shipping_notifications: boolean;
  promotional_emails: boolean;
  production_updates: boolean;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export class NotificationService {
  static async sendOrderStatusNotification(
    orderId: string, 
    newStatus: OrderStatus, 
    notes?: string
  ): Promise<void> {
    try {
      // Get order details and user preferences
      const order = await this.getOrderForNotification(orderId);
      if (!order) return;

      const preferences = await this.getUserNotificationPreferences(order.user_id);
      if (!preferences.order_updates) return;

      const template = this.getStatusNotificationTemplate(order, newStatus, notes);
      
      await this.sendEmail(order.user_email, template);
      
      // Log the notification
      await this.logNotification({
        user_id: order.user_id,
        order_id: orderId,
        type: 'order_status_update',
        status: newStatus,
        sent_at: new Date().toISOString()
      });
    } catch (error) {
      throw error;
    }
  }

  static async sendShippingNotification(
    orderId: string, 
    trackingNumber: string,
    carrier: string,
    estimatedDelivery?: string
  ): Promise<void> {
    try {
      const order = await this.getOrderForNotification(orderId);
      if (!order) return;

      const preferences = await this.getUserNotificationPreferences(order.user_id);
      if (!preferences.shipping_notifications) return;

      const template = this.getShippingNotificationTemplate(
        order, 
        trackingNumber, 
        carrier, 
        estimatedDelivery
      );
      
      await this.sendEmail(order.user_email, template);
      
      await this.logNotification({
        user_id: order.user_id,
        order_id: orderId,
        type: 'shipping_notification',
        tracking_number: trackingNumber,
        sent_at: new Date().toISOString()
      });
    } catch (error) {
      throw error;
    }
  }

  static async sendDeliveryConfirmation(orderId: string): Promise<void> {
    try {
      const order = await this.getOrderForNotification(orderId);
      if (!order) return;

      const preferences = await this.getUserNotificationPreferences(order.user_id);
      if (!preferences.order_updates) return;

      const template = this.getDeliveryConfirmationTemplate(order);
      
      await this.sendEmail(order.user_email, template);
      
      await this.logNotification({
        user_id: order.user_id,
        order_id: orderId,
        type: 'delivery_confirmation',
        sent_at: new Date().toISOString()
      });
    } catch (error) {
      throw error;
    }
  }

  static async updateNotificationPreferences(
    userId: string, 
    preferences: NotificationPreferences
  ): Promise<void> {
    const { error } = await supabase
      .from('user_notification_preferences')
      .upsert({
        user_id: userId,
        ...preferences,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
  }

  static async getUserNotificationPreferences(userId: string): Promise<NotificationPreferences> {
    const { data, error } = await supabase
      .from('user_notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return data || {
      order_updates: true,
      shipping_notifications: true,
      promotional_emails: false,
      production_updates: true
    };
  }

  private static async getOrderForNotification(orderId: string): Promise<any> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        user:user_profiles!inner(
          user_id,
          users!inner(email)
        )
      `)
      .eq('id', orderId)
      .single();

    if (error) throw error;
    
    return data ? {
      ...data,
      user_id: data.user.user_id,
      user_email: data.user.users.email
    } : null;
  }

  private static async sendEmail(to: string, template: EmailTemplate): Promise<void> {
    // In a real implementation, this would integrate with an email service like:
    // - SendGrid
    // - Mailgun
    // - AWS SES
    // - Resend
    
    // For now, we'll simulate the email sending
    // In production, this would integrate with an email service
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private static async logNotification(notification: any): Promise<void> {
    const { error } = await supabase
      .from('notification_log')
      .insert(notification);

    if (error) {
      // Failed to log notification
    }
  }

  static getStatusNotificationTemplate(
    order: any, 
    status: OrderStatus, 
    notes?: string
  ): EmailTemplate {
    const statusMessages = {
      pending_payment: 'Payment is pending for your order',
      payment_confirmed: 'Payment confirmed! Your order is being processed',
      in_production: 'Your order is now in production',
      shipped: 'Your order has been shipped',
      delivered: 'Your order has been delivered',
      cancelled: 'Your order has been cancelled',
      refunded: 'Your order has been refunded'
    };

    const statusColors = {
      pending_payment: '#f59e0b',
      payment_confirmed: '#10b981',
      in_production: '#8b5cf6',
      shipped: '#3b82f6',
      delivered: '#10b981',
      cancelled: '#ef4444',
      refunded: '#ef4444'
    };

    const subject = `Order ${order.reference_number} - ${statusMessages[status]}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #1f2937; color: white; padding: 20px; text-align: center; }
          .status-badge { 
            display: inline-block; 
            padding: 8px 16px; 
            background-color: ${statusColors[status]}; 
            color: white; 
            border-radius: 4px; 
            font-weight: bold; 
            margin: 20px 0; 
          }
          .order-details { background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          .button { 
            display: inline-block; 
            padding: 12px 24px; 
            background-color: #3b82f6; 
            color: white; 
            text-decoration: none; 
            border-radius: 6px; 
            margin: 20px 0; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Gang Run Printing</h1>
          </div>
          
          <h2>Order Status Update</h2>
          
          <div class="status-badge">${statusMessages[status]}</div>
          
          <div class="order-details">
            <h3>Order Details</h3>
            <p><strong>Order Number:</strong> ${order.reference_number}</p>
            <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
            <p><strong>Total Amount:</strong> $${order.total_amount.toFixed(2)}</p>
            ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.VITE_APP_URL}/account/orders/${order.id}" class="button">
              View Order Details
            </a>
          </div>
          
          <div class="footer">
            <p>Thank you for choosing Gang Run Printing!</p>
            <p>Questions? Contact us at support@gangrunprinting.com</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Order Status Update - ${statusMessages[status]}

Order Number: ${order.reference_number}
Order Date: ${new Date(order.created_at).toLocaleDateString()}
Total Amount: $${order.total_amount.toFixed(2)}
${notes ? `Notes: ${notes}` : ''}

View your order details: ${process.env.VITE_APP_URL}/account/orders/${order.id}

Thank you for choosing Gang Run Printing!
Questions? Contact us at support@gangrunprinting.com
    `;

    return { subject, html, text };
  }

  static getShippingNotificationTemplate(
    order: any,
    trackingNumber: string,
    carrier: string,
    estimatedDelivery?: string
  ): EmailTemplate {
    const subject = `Your order ${order.reference_number} has shipped!`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #1f2937; color: white; padding: 20px; text-align: center; }
          .shipping-info { background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .tracking-number { 
            font-family: monospace; 
            font-size: 18px; 
            font-weight: bold; 
            background-color: #e5e7eb; 
            padding: 8px; 
            border-radius: 4px; 
          }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          .button { 
            display: inline-block; 
            padding: 12px 24px; 
            background-color: #10b981; 
            color: white; 
            text-decoration: none; 
            border-radius: 6px; 
            margin: 20px 0; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📦 Your Order Has Shipped!</h1>
          </div>
          
          <p>Great news! Your order <strong>${order.reference_number}</strong> is on its way.</p>
          
          <div class="shipping-info">
            <h3>Shipping Information</h3>
            <p><strong>Carrier:</strong> ${carrier}</p>
            <p><strong>Tracking Number:</strong></p>
            <div class="tracking-number">${trackingNumber}</div>
            ${estimatedDelivery ? `<p><strong>Estimated Delivery:</strong> ${new Date(estimatedDelivery).toLocaleDateString()}</p>` : ''}
          </div>
          
          <div style="text-align: center;">
            <a href="${this.getTrackingUrl(carrier, trackingNumber)}" class="button">
              Track Your Package
            </a>
          </div>
          
          <div class="footer">
            <p>Thank you for choosing Gang Run Printing!</p>
            <p>Questions? Contact us at support@gangrunprinting.com</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Your Order Has Shipped!

Order Number: ${order.reference_number}
Carrier: ${carrier}
Tracking Number: ${trackingNumber}
${estimatedDelivery ? `Estimated Delivery: ${new Date(estimatedDelivery).toLocaleDateString()}` : ''}

Track your package: ${this.getTrackingUrl(carrier, trackingNumber)}

Thank you for choosing Gang Run Printing!
Questions? Contact us at support@gangrunprinting.com
    `;

    return { subject, html, text };
  }

  static getDeliveryConfirmationTemplate(order: any): EmailTemplate {
    const subject = `Order ${order.reference_number} delivered successfully!`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #10b981; color: white; padding: 20px; text-align: center; }
          .success-message { background-color: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          .button { 
            display: inline-block; 
            padding: 12px 24px; 
            background-color: #3b82f6; 
            color: white; 
            text-decoration: none; 
            border-radius: 6px; 
            margin: 10px; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Order Delivered!</h1>
          </div>
          
          <div class="success-message">
            <h2>Your order ${order.reference_number} has been delivered!</h2>
            <p>We hope you're satisfied with your printing order.</p>
          </div>
          
          <p>Order delivered on: <strong>${new Date().toLocaleDateString()}</strong></p>
          
          <div style="text-align: center;">
            <a href="${process.env.VITE_APP_URL}/account/orders/${order.id}" class="button">
              View Order Details
            </a>
            <a href="${process.env.VITE_APP_URL}/account/orders/${order.id}/reorder" class="button">
              Reorder
            </a>
          </div>
          
          <p>How was your experience? We'd love to hear your feedback!</p>
          
          <div class="footer">
            <p>Thank you for choosing Gang Run Printing!</p>
            <p>Questions? Contact us at support@gangrunprinting.com</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Order Delivered Successfully!

Your order ${order.reference_number} has been delivered!
Delivery Date: ${new Date().toLocaleDateString()}

View order details: ${process.env.VITE_APP_URL}/account/orders/${order.id}
Reorder: ${process.env.VITE_APP_URL}/account/orders/${order.id}/reorder

How was your experience? We'd love to hear your feedback!

Thank you for choosing Gang Run Printing!
Questions? Contact us at support@gangrunprinting.com
    `;

    return { subject, html, text };
  }

  private static getTrackingUrl(carrier: string, trackingNumber: string): string {
    const trackingUrls = {
      'UPS': `https://www.ups.com/track?tracknum=${trackingNumber}`,
      'FedEx': `https://www.fedex.com/apps/fedextrack/?tracknumbers=${trackingNumber}`,
      'USPS': `https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1=${trackingNumber}`,
      'DHL': `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`
    };

    return trackingUrls[carrier as keyof typeof trackingUrls] || '#';
  }
}