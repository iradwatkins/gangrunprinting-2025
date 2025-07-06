import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OrderJobDetail } from '@/types/orders';
import { FileText, Download, Eye, Package, Truck } from 'lucide-react';

interface OrderJobCardProps {
  job: OrderJobDetail;
}

export const OrderJobCard: React.FC<OrderJobCardProps> = ({ job }) => {
  const getJobStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in_production': return 'bg-purple-100 text-purple-800';
      case 'printing': return 'bg-indigo-100 text-indigo-800';
      case 'finishing': return 'bg-orange-100 text-orange-800';
      case 'quality_check': return 'bg-amber-100 text-amber-800';
      case 'shipped': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'on_hold_awaiting_files': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatJobStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const handleFilePreview = (file: any) => {
    // Open file in new tab for preview
    window.open(file.file_url, '_blank');
  };

  const handleFileDownload = (file: any) => {
    // Create download link
    const link = document.createElement('a');
    link.href = file.file_url;
    link.download = file.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{job.product.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getJobStatusColor(job.status)}>
                  {formatJobStatus(job.status)}
                </Badge>
                <span className="text-sm text-gray-600">
                  Qty: {job.quantity}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold">${job.total_price.toFixed(2)}</div>
              <div className="text-sm text-gray-600">
                ${job.unit_price.toFixed(2)} each
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Size:</span>
              <div className="text-gray-600">{job.configuration_display.size}</div>
            </div>
            <div>
              <span className="font-medium">Paper:</span>
              <div className="text-gray-600">{job.configuration_display.paper}</div>
            </div>
            {job.configuration_display.coating && (
              <div>
                <span className="font-medium">Coating:</span>
                <div className="text-gray-600">{job.configuration_display.coating}</div>
              </div>
            )}
            <div>
              <span className="font-medium">Turnaround:</span>
              <div className="text-gray-600">{job.configuration_display.turnaround}</div>
            </div>
          </div>

          {job.configuration_display.add_ons && job.configuration_display.add_ons.length > 0 && (
            <div>
              <span className="font-medium text-sm">Add-ons:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {job.configuration_display.add_ons.map((addon, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {addon}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {job.vendor && (
            <div className="flex items-center gap-2 text-sm">
              <Package className="w-4 h-4" />
              <span className="font-medium">Vendor:</span>
              <span className="text-gray-600">{job.vendor.name}</span>
            </div>
          )}

          {job.tracking_number && (
            <div className="flex items-center gap-2 text-sm">
              <Truck className="w-4 h-4" />
              <span className="font-medium">Tracking:</span>
              <span className="text-gray-600 font-mono">{job.tracking_number}</span>
            </div>
          )}

          {job.estimated_delivery && (
            <div className="text-sm">
              <span className="font-medium">Estimated Delivery:</span>
              <span className="text-gray-600 ml-2">
                {new Date(job.estimated_delivery).toLocaleDateString()}
              </span>
            </div>
          )}

          {job.actual_delivery && (
            <div className="text-sm">
              <span className="font-medium">Delivered:</span>
              <span className="text-gray-600 ml-2">
                {new Date(job.actual_delivery).toLocaleDateString()}
              </span>
            </div>
          )}

          {job.artwork_files && job.artwork_files.length > 0 && (
            <div>
              <div className="font-medium text-sm mb-2">Artwork Files:</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {job.artwork_files.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{file.filename}</div>
                      <div className="text-xs text-gray-500">
                        {file.file_type} • {(file.file_size / 1024 / 1024).toFixed(1)}MB
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFilePreview(file)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFileDownload(file)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};