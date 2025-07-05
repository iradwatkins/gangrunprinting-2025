import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Download, 
  Eye, 
  FileText, 
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  Clock,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ArtworkFile } from '@/types/files';
import { formatFileSize } from '@/utils/validation/files';

interface FilePreviewProps {
  file: ArtworkFile;
  showFullPreview?: boolean;
  onDownload?: () => void;
  className?: string;
}

export function FilePreview({ 
  file, 
  showFullPreview = false, 
  onDownload,
  className 
}: FilePreviewProps) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [previewError, setPreviewError] = useState(false);

  const isImage = file.mime_type.startsWith('image/');
  const isPDF = file.mime_type === 'application/pdf';

  const getStatusColor = (status: ArtworkFile['validation_status']) => {
    switch (status) {
      case 'valid':
        return 'text-green-600 bg-green-100';
      case 'invalid':
        return 'text-red-600 bg-red-100';
      case 'needs_review':
        return 'text-yellow-600 bg-yellow-100';
      case 'pending':
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: ArtworkFile['validation_status']) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="w-4 h-4" />;
      case 'invalid':
        return <AlertCircle className="w-4 h-4" />;
      case 'needs_review':
        return <Info className="w-4 h-4" />;
      case 'pending':
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDimensions = () => {
    if (!file.dimensions) return 'Unknown';
    const { width, height, dpi } = file.dimensions;
    return `${width} × ${height}px${dpi ? ` (${dpi} DPI)` : ''}`;
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 25));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const renderPreviewContent = () => {
    if (isImage && file.preview_url && !previewError) {
      return (
        <div className="relative overflow-hidden bg-gray-50 rounded-lg">
          <img
            src={file.preview_url}
            alt={file.original_filename}
            className="max-w-full max-h-full object-contain"
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transition: 'transform 0.2s ease'
            }}
            onError={() => setPreviewError(true)}
          />
          
          {/* Preview Controls */}
          <div className="absolute top-2 right-2 flex space-x-1">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoom <= 25}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoom >= 200}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRotate}
            >
              <RotateCw className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Zoom Indicator */}
          <div className="absolute bottom-2 left-2">
            <Badge variant="secondary">{zoom}%</Badge>
          </div>
        </div>
      );
    }

    if (isPDF) {
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg">
          <FileText className="w-16 h-16 text-gray-400 mb-4" />
          <p className="text-sm text-gray-600 mb-2">PDF Preview</p>
          <p className="text-xs text-gray-500 text-center">
            {file.original_filename}
          </p>
          <Button variant="outline" size="sm" className="mt-4">
            <Eye className="w-4 h-4 mr-2" />
            Open PDF
          </Button>
        </div>
      );
    }

    // Fallback for unsupported file types
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg">
        <ImageIcon className="w-16 h-16 text-gray-400 mb-4" />
        <p className="text-sm text-gray-600 mb-2">No Preview Available</p>
        <p className="text-xs text-gray-500 text-center">
          {file.original_filename}
        </p>
      </div>
    );
  };

  if (showFullPreview) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Card className={cn("cursor-pointer hover:shadow-md transition-shadow", className)}>
            <CardContent className="p-4">
              <div className="aspect-square mb-3">
                {renderPreviewContent()}
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium truncate">{file.original_filename}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{formatFileSize(file.file_size)}</span>
                  <Badge variant="outline" className={getStatusColor(file.validation_status)}>
                    {getStatusIcon(file.validation_status)}
                    <span className="ml-1 capitalize">{file.validation_status}</span>
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </DialogTrigger>
        
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{file.original_filename}</span>
              <div className="flex space-x-2">
                {onDownload && (
                  <Button variant="outline" size="sm" onClick={onDownload}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Preview Area */}
            <div className="lg:col-span-2">
              <div className="h-96 lg:h-[500px]">
                {renderPreviewContent()}
              </div>
            </div>
            
            {/* File Information */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">File Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500">File Name</label>
                    <p className="text-sm">{file.original_filename}</p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-500">File Size</label>
                    <p className="text-sm">{formatFileSize(file.file_size)}</p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-500">File Type</label>
                    <p className="text-sm">{file.mime_type}</p>
                  </div>
                  
                  {file.dimensions && (
                    <div>
                      <label className="text-xs font-medium text-gray-500">Dimensions</label>
                      <p className="text-sm">{formatDimensions()}</p>
                    </div>
                  )}
                  
                  {file.color_space && (
                    <div>
                      <label className="text-xs font-medium text-gray-500">Color Space</label>
                      <p className="text-sm">{file.color_space}</p>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div>
                    <label className="text-xs font-medium text-gray-500">Validation Status</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={getStatusColor(file.validation_status)}>
                        {getStatusIcon(file.validation_status)}
                        <span className="ml-1 capitalize">{file.validation_status}</span>
                      </Badge>
                    </div>
                  </div>
                  
                  {file.validation_notes && (
                    <div>
                      <label className="text-xs font-medium text-gray-500">Validation Notes</label>
                      <p className="text-xs text-gray-600 mt-1">{file.validation_notes}</p>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div>
                    <label className="text-xs font-medium text-gray-500">Uploaded</label>
                    <p className="text-sm">
                      {new Date(file.created_at).toLocaleDateString()} at{' '}
                      {new Date(file.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Compact preview for lists
  return (
    <div className={cn("flex items-center space-x-3 p-3 border rounded-lg", className)}>
      {/* Thumbnail */}
      <div className="w-12 h-12 flex-shrink-0">
        {isImage && file.preview_url && !previewError ? (
          <img
            src={file.preview_url}
            alt={file.original_filename}
            className="w-full h-full object-cover rounded"
            onError={() => setPreviewError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
            {isPDF ? (
              <FileText className="w-6 h-6 text-gray-400" />
            ) : (
              <ImageIcon className="w-6 h-6 text-gray-400" />
            )}
          </div>
        )}
      </div>
      
      {/* File Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{file.original_filename}</p>
        <div className="flex items-center space-x-2 mt-1">
          <span className="text-xs text-gray-500">{formatFileSize(file.file_size)}</span>
          {file.dimensions && (
            <span className="text-xs text-gray-500">{formatDimensions()}</span>
          )}
        </div>
      </div>
      
      {/* Status */}
      <div className="flex-shrink-0">
        <Badge variant="outline" className={getStatusColor(file.validation_status)}>
          {getStatusIcon(file.validation_status)}
        </Badge>
      </div>
    </div>
  );
}