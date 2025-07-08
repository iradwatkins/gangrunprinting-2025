import { supabase } from '@/integrations/supabase/client';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  description: string;
}

export interface VendorEmail {
  to: string;
  subject: string;
  body: string;
  vendor_id: string;
  template_id?: string;
}

export interface VendorEmailLog {
  id: string;
  vendor_id: string;
  to_email: string;
  subject: string;
  body: string;
  status: 'sent' | 'failed' | 'pending';
  error_message?: string;
  sent_at: string;
  created_at: string;
}

// Pre-built email templates
export const emailTemplates: EmailTemplate[] = [
  {
    id: 'order_notification',
    name: 'Order Notification',
    subject: 'New Order Assignment - Order #{{order_number}}',
    description: 'Notify vendor about new order assignment',
    body: `Dear {{vendor_name}},

We have a new order that needs to be fulfilled. Please review the details below:

Order Number: {{order_number}}
Customer: {{customer_name}}
Due Date: {{due_date}}
Quantity: {{quantity}}
Product: {{product_name}}

Please confirm receipt of this order and provide an estimated completion time.

Thank you for your continued partnership.

Best regards,
GangRun Printing Team`
  },
  {
    id: 'quote_request',
    name: 'Quote Request',
    subject: 'Quote Request - {{product_name}}',
    description: 'Request pricing quote from vendor',
    body: `Dear {{vendor_name}},

We would like to request a quote for the following:

Product: {{product_name}}
Quantity: {{quantity}}
Specifications: {{specifications}}
Timeline: {{timeline}}

Please provide your best pricing and delivery time for this project.

Looking forward to your response.

Best regards,
GangRun Printing Team`
  },
  {
    id: 'general_inquiry',
    name: 'General Inquiry',
    subject: 'Inquiry from GangRun Printing',
    description: 'General communication template',
    body: `Dear {{vendor_name}},

I hope this message finds you well.

{{message_content}}

Please let me know if you have any questions or need additional information.

Best regards,
GangRun Printing Team`
  },
  {
    id: 'order_status',
    name: 'Order Status Update',
    subject: 'Order Status Update Request - Order #{{order_number}}',
    description: 'Request status update on existing order',
    body: `Dear {{vendor_name}},

Could you please provide a status update on the following order:

Order Number: {{order_number}}
Original Due Date: {{due_date}}
Product: {{product_name}}

We would appreciate an update on the current status and any revised timeline.

Thank you for your attention to this matter.

Best regards,
GangRun Printing Team`
  }
];

export class VendorEmailService {
  static async sendEmail(emailData: VendorEmail): Promise<{ success: boolean; error?: string }> {
    try {
      // Log the email attempt first
      const logEntry = await this.logEmail({
        vendor_id: emailData.vendor_id,
        to_email: emailData.to,
        subject: emailData.subject,
        body: emailData.body,
        status: 'pending'
      });

      // TODO: Replace with actual email service integration
      // For now, simulate email sending
      const success = await this.simulateEmailSending(emailData);

      if (success) {
        // Update log with success
        await this.updateEmailLog(logEntry.id, { 
          status: 'sent', 
          sent_at: new Date().toISOString() 
        });
        return { success: true };
      } else {
        // Update log with failure
        await this.updateEmailLog(logEntry.id, { 
          status: 'failed', 
          error_message: 'Email delivery failed' 
        });
        return { success: false, error: 'Email delivery failed' };
      }
    } catch (error) {
      console.error('Error sending vendor email:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  static async logEmail(emailData: Omit<VendorEmailLog, 'id' | 'created_at' | 'sent_at'>): Promise<{ id: string }> {
    const { data, error } = await supabase
      .from('vendor_email_log')
      .insert({
        vendor_id: emailData.vendor_id,
        to_email: emailData.to_email,
        subject: emailData.subject,
        body: emailData.body,
        status: emailData.status,
        error_message: emailData.error_message
      })
      .select('id')
      .single();

    if (error) throw error;
    return { id: data.id };
  }

  static async updateEmailLog(logId: string, updates: Partial<VendorEmailLog>): Promise<void> {
    const { error } = await supabase
      .from('vendor_email_log')
      .update(updates)
      .eq('id', logId);

    if (error) throw error;
  }

  static async getEmailHistory(vendorId: string): Promise<VendorEmailLog[]> {
    const { data, error } = await supabase
      .from('vendor_email_log')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static getEmailTemplates(): EmailTemplate[] {
    return emailTemplates;
  }

  static getTemplate(templateId: string): EmailTemplate | undefined {
    return emailTemplates.find(template => template.id === templateId);
  }

  static replaceTemplateVariables(template: string, variables: Record<string, string>): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, value);
    }
    return result;
  }

  // Simulate email sending - replace with actual email service
  private static async simulateEmailSending(emailData: VendorEmail): Promise<boolean> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate 95% success rate
    return Math.random() > 0.05;
  }

  // TODO: Replace with actual email service integration
  // Example integration with SendGrid, Mailgun, AWS SES, or Resend
  private static async sendEmailWithProvider(emailData: VendorEmail): Promise<boolean> {
    // Example SendGrid integration:
    /*
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to: emailData.to,
      from: 'noreply@gangrunprinting.com',
      subject: emailData.subject,
      text: emailData.body,
      html: emailData.body.replace(/\n/g, '<br>'),
    };

    try {
      await sgMail.send(msg);
      return true;
    } catch (error) {
      console.error('SendGrid error:', error);
      return false;
    }
    */
    
    return this.simulateEmailSending(emailData);
  }
}