import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Download, 
  Eye, 
  Image as ImageIcon, 
  FileText, 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCw,
  AlertTriangle,
  Package
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface OrderFile {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  file_url: string;
  upload_date: string;
  job_id?: string;
}

interface OrderJob {
  id: string;
  product_name: string;
  quantity: number;
  status: string;
  uploaded_files?: string[];
}

interface OrderFilesPanelProps {
  orderId: string;
  orderStatus: string;
  jobs: OrderJob[];
  files: OrderFile[];
  onClose: () => void;
}

export function OrderFilesPanel({ orderId, orderStatus, jobs, files, onClose }: OrderFilesPanelProps) {
  const [selectedFile, setSelectedFile] = useState<OrderFile | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon className="w-4 h-4 text-blue-500" />;
    }
    return <FileText className="w-4 h-4 text-gray-500" />;
  };

  const handleFilePreview = (file: OrderFile) => {
    setSelectedFile(file);
    setPreviewOpen(true);
    setZoom(100);
    setRotation(0);
  };

  const handleFileDownload = (file: OrderFile) => {
    const link = document.createElement('a');
    link.href = file.file_url;
    link.download = file.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 25));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const groupFilesByJob = () => {
    const grouped: Record<string, OrderFile[]> = {};
    const unassigned: OrderFile[] = [];

    files.forEach(file => {
      if (file.job_id) {
        if (!grouped[file.job_id]) {
          grouped[file.job_id] = [];
        }
        grouped[file.job_id].push(file);
      } else {
        unassigned.push(file);
      }
    });

    return { grouped, unassigned };
  };

  const { grouped, unassigned } = groupFilesByJob();
  const hasFiles = files.length > 0;
  const awaitingFiles = jobs.some(job => !job.uploaded_files || job.uploaded_files.length === 0);

  return (
    <>
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Order Files</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{files.length} file{files.length !== 1 ? 's' : ''}</Badge>
            {awaitingFiles && (
              <Badge variant="destructive">Awaiting Files</Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <div className="p-4 space-y-4">
              {!hasFiles && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    No artwork files have been uploaded for this order. 
                    The order may be on hold awaiting customer files.
                  </AlertDescription>
                </Alert>
              )}

              {/* Files grouped by job */}
              {jobs.map(job => {
                const jobFiles = grouped[job.id] || [];
                const hasJobFiles = jobFiles.length > 0;

                return (
                  <div key={job.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Package className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-sm">{job.product_name}</span>
                        <Badge variant="secondary" className="text-xs">
                          Qty: {job.quantity}
                        </Badge>
                      </div>
                      <Badge 
                        variant={hasJobFiles ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {hasJobFiles ? `${jobFiles.length} file${jobFiles.length !== 1 ? 's' : ''}` : 'No files'}
                      </Badge>
                    </div>

                    {hasJobFiles ? (
                      <div className="space-y-2">
                        {jobFiles.map(file => (
                          <div key={file.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                            {getFileIcon(file.file_type)}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{file.filename}</p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(file.file_size)} • {new Date(file.upload_date).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex space-x-1">
                              {file.file_type.startsWith('image/') && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleFilePreview(file)}
                                  title="Preview"
                                >
                                  <Eye className="w-3 h-3" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleFileDownload(file)}
                                title="Download"
                              >
                                <Download className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Alert className="bg-orange-50 border-orange-200">
                        <AlertTriangle className="h-3 w-3 text-orange-600" />
                        <AlertDescription className="text-xs text-orange-800">
                          This job is awaiting artwork files from the customer.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                );
              })}

              {/* Unassigned files */}
              {unassigned.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium text-sm mb-3">General Files</h4>
                    <div className="space-y-2">
                      {unassigned.map(file => (
                        <div key={file.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                          {getFileIcon(file.file_type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{file.filename}</p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(file.file_size)} • {new Date(file.upload_date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex space-x-1">
                            {file.file_type.startsWith('image/') && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleFilePreview(file)}
                                title="Preview"
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleFileDownload(file)}
                              title="Download"
                            >
                              <Download className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Bulk actions */}
              {hasFiles && (
                <div className="pt-4 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      // Implement bulk download
                      files.forEach(file => handleFileDownload(file));
                    }}
                  >
                    <Download className="w-3 h-3 mr-2" />
                    Download All Files
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* File Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="truncate">{selectedFile?.filename}</DialogTitle>
              <div className="flex items-center space-x-2">
                {selectedFile?.file_type.startsWith('image/') && (
                  <>
                    <Button variant="ghost" size="sm" onClick={handleZoomOut}>
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <span className="text-sm">{zoom}%</span>
                    <Button variant="ghost" size="sm" onClick={handleZoomIn}>
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleRotate}>
                      <RotateCw className="w-4 h-4" />
                    </Button>
                  </>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => selectedFile && handleFileDownload(selectedFile)}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto flex items-center justify-center bg-gray-50 rounded">
            {selectedFile?.file_type.startsWith('image/') ? (
              <img
                src={selectedFile.file_url}
                alt={selectedFile.filename}
                style={{
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transition: 'transform 0.2s ease'
                }}
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="text-center p-8">
                <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Preview not available for this file type</p>
                <Button 
                  className="mt-4"
                  onClick={() => selectedFile && handleFileDownload(selectedFile)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download File
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}