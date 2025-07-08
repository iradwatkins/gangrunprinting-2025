import { useState, useEffect } from 'react';
import { 
  Send, 
  Loader2, 
  Mail, 
  User, 
  Building, 
  MapPin,
  FileText,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { VendorEmailService, EmailTemplate } from '@/services/vendorEmail';
import type { Tables } from '@/integrations/supabase/types';

interface VendorEmailModalProps {
  vendor: Tables<'vendors'> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VendorEmailModal({ vendor, open, onOpenChange }: VendorEmailModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [templates] = useState<EmailTemplate[]>(VendorEmailService.getEmailTemplates());

  useEffect(() => {
    if (!open) {
      // Reset form when modal closes
      setSelectedTemplate('');
      setSubject('');
      setBody('');
      setShowPreview(false);
    }
  }, [open]);

  const handleTemplateSelect = (templateId: string) => {
    const template = VendorEmailService.getTemplate(templateId);
    if (template && vendor) {
      setSelectedTemplate(templateId);
      
      // Replace template variables with vendor data
      const variables = {
        vendor_name: vendor.name || 'Vendor',
        order_number: 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        customer_name: 'Customer Name',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        quantity: '1000',
        product_name: 'Business Cards',
        specifications: 'Standard specifications',
        timeline: '5-7 business days',
        message_content: 'Please add your message here...'
      };

      const processedSubject = VendorEmailService.replaceTemplateVariables(template.subject, variables);
      const processedBody = VendorEmailService.replaceTemplateVariables(template.body, variables);

      setSubject(processedSubject);
      setBody(processedBody);
    }
  };

  const handleSendEmail = async () => {
    if (!vendor || !vendor.contact_email) {
      toast({
        title: 'Error',
        description: 'Vendor email address is required',
        variant: 'destructive',
      });
      return;
    }

    if (!subject.trim() || !body.trim()) {
      toast({
        title: 'Error',
        description: 'Subject and message are required',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const result = await VendorEmailService.sendEmail({
        to: vendor.contact_email,
        subject: subject.trim(),
        body: body.trim(),
        vendor_id: vendor.id,
        template_id: selectedTemplate || undefined,
      });

      if (result.success) {
        toast({
          title: 'Email Sent',
          description: `Email sent successfully to ${vendor.name}`,
        });
        onOpenChange(false);
      } else {
        toast({
          title: 'Email Failed',
          description: result.error || 'Failed to send email',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!vendor) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Email to {vendor.name}
          </DialogTitle>
          <DialogDescription>
            Compose and send an email to this vendor
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Vendor Information Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Vendor Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Name</Label>
                  <p className="font-medium">{vendor.name}</p>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    <p className="text-sm">{vendor.contact_email || 'No email provided'}</p>
                  </div>
                  {!vendor.contact_email && (
                    <Badge variant="destructive" className="text-xs">
                      Email Required
                    </Badge>
                  )}
                </div>

                {vendor.contact_phone && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Phone</Label>
                    <div className="flex items-center gap-2">
                      <Building className="h-3 w-3 text-muted-foreground" />
                      <p className="text-sm">{vendor.contact_phone}</p>
                    </div>
                  </div>
                )}

                {vendor.address && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Address</Label>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-3 w-3 text-muted-foreground mt-0.5" />
                      <p className="text-sm">{vendor.address}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <Badge variant={vendor.is_active ? "default" : "secondary"}>
                    {vendor.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Email Composition Panel */}
          <div className="lg:col-span-2 space-y-4">
            {/* Template Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Email Template (Optional)
                </CardTitle>
                <CardDescription className="text-xs">
                  Choose a pre-built template or compose a custom message
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Custom Message</SelectItem>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        <div className="flex flex-col">
                          <span>{template.name}</span>
                          <span className="text-xs text-muted-foreground">{template.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Email Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Email Content</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-xs"
                  >
                    {showPreview ? (
                      <>
                        <EyeOff className="h-3 w-3 mr-1" />
                        Hide Preview
                      </>
                    ) : (
                      <>
                        <Eye className="h-3 w-3 mr-1" />
                        Show Preview
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-subject">Subject</Label>
                  <Input
                    id="email-subject"
                    placeholder="Enter email subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email-body">Message</Label>
                  <Textarea
                    id="email-body"
                    placeholder="Enter your message"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="min-h-[200px]"
                  />
                </div>

                {showPreview && (
                  <div className="space-y-2">
                    <Label>Email Preview</Label>
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="text-sm">
                          <p><strong>To:</strong> {vendor.contact_email}</p>
                          <p><strong>Subject:</strong> {subject}</p>
                        </div>
                      </CardHeader>
                      <Separator />
                      <CardContent className="pt-4">
                        <div className="whitespace-pre-wrap text-sm">
                          {body}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Send Button */}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSendEmail} 
                disabled={loading || !vendor.contact_email}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Send className="mr-2 h-4 w-4" />
                Send Email
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}