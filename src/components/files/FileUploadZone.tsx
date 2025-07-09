import React, { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Upload, 
  File, 
  Image as ImageIcon, 
  FileText, 
  X, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FileValidator } from '@/utils/fileValidation';
import type { 
  FileUploadConfig, 
  FileUploadProgress, 
  FileValidationResult,
  FileStatus 
} from '@/types/files';
import { FILE_CONFIGS } from '@/types/files';

interface FileUploadZoneProps {
  productType?: string;
  maxFiles?: number;
  onFilesSelected: (files: File[]) => void;
  onFileRemoved: (index: number) => void;
  uploadProgress?: FileUploadProgress[];
  config?: Partial<FileUploadConfig>;
  disabled?: boolean;
  className?: string;
}

interface FileWithStatus {
  file: File;
  status: FileStatus;
  progress?: number;
  error?: string;
  validation?: FileValidationResult;
  id: string;
}

export function FileUploadZone({
  productType = 'default',
  maxFiles,
  onFilesSelected,
  onFileRemoved,
  uploadProgress = [],
  config = {},
  disabled = false,
  className
}: FileUploadZoneProps) {
  const [selectedFiles, setSelectedFiles] = useState<FileWithStatus[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get configuration for product type
  const uploadConfig = {
    ...FILE_CONFIGS[productType],
    ...config,
    maxFiles: maxFiles || config.maxFiles || FILE_CONFIGS[productType].maxFiles
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = async (file: File): Promise<FileValidationResult> => {
    // Use secure file validation
    const securityValidation = await FileValidator.validateFile(file);
    
    const errors: any[] = [];
    const warnings: any[] = securityValidation.warnings.map(w => ({ 
      code: 'SECURITY_WARNING', 
      message: w 
    }));
    const suggestions: string[] = [];
    
    // Add security errors
    if (!securityValidation.isValid) {
      errors.push(...securityValidation.errors.map(e => ({
        code: 'SECURITY_ERROR',
        message: e,
        field: 'security'
      })));
    }

    // Additional product-specific validation
    if (!uploadConfig.allowedTypes.includes(file.type)) {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!uploadConfig.allowedExtensions.includes(ext)) {
        errors.push({
          code: 'INVALID_TYPE',
          message: `File type ${file.type || ext} is not supported for ${productType}`,
          field: 'type'
        });
      }
    }

    // Check file size for product requirements
    if (file.size > uploadConfig.maxFileSize) {
      errors.push({
        code: 'FILE_TOO_LARGE',
        message: `File size ${formatFileSize(file.size)} exceeds maximum ${formatFileSize(uploadConfig.maxFileSize)}`,
        field: 'size'
      });
    }

    // Check total size
    const totalSize = selectedFiles.reduce((sum, f) => sum + f.file.size, 0) + file.size;
    if (totalSize > uploadConfig.maxTotalSize) {
      errors.push({
        code: 'TOTAL_SIZE_EXCEEDED',
        message: `Total upload size would exceed ${formatFileSize(uploadConfig.maxTotalSize)}`,
        field: 'totalSize'
      });
    }

    // Add suggestions based on file type
    if (file.type.startsWith('image/')) {
      suggestions.push('For best print quality, use images with at least 300 DPI resolution');
      if (file.type === 'image/jpeg') {
        suggestions.push('Ensure JPEG quality is set to maximum for print applications');
      }
    } else if (file.type === 'application/pdf') {
      suggestions.push('Ensure PDF contains high-resolution images and embedded fonts');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev + 1);
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => {
      const newCounter = prev - 1;
      if (newCounter === 0) {
        setIsDragOver(false);
      }
      return newCounter;
    });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setDragCounter(0);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    handleFileSelection(files);
  }, [disabled]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFileSelection(files);
    }
  };

  const handleFileSelection = async (files: File[]) => {
    if (selectedFiles.length + files.length > uploadConfig.maxFiles) {
      return; // Show error toast or message
    }

    const newFiles: FileWithStatus[] = files.map(file => ({
      file,
      status: 'validating' as FileStatus,
      id: `${file.name}-${Date.now()}-${Math.random()}`
    }));

    // Add files in validating state
    setSelectedFiles(prev => [...prev, ...newFiles]);

    // Validate files asynchronously
    const validatedFiles = await Promise.all(
      newFiles.map(async (fileItem) => {
        const validation = await validateFile(fileItem.file);
        return {
          ...fileItem,
          status: validation.isValid ? 'idle' : 'error' as FileStatus,
          validation,
          error: validation.errors[0]?.message
        };
      })
    );

    // Update with validation results
    setSelectedFiles(prev => 
      prev.map(file => {
        const validated = validatedFiles.find(v => v.id === file.id);
        return validated || file;
      })
    );
    
    onFilesSelected(validatedFiles.filter(f => f.status !== 'error').map(f => f.file));
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    onFileRemoved(index);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="w-5 h-5" />;
    } else if (file.type === 'application/pdf') {
      return <FileText className="w-5 h-5" />;
    }
    return <File className="w-5 h-5" />;
  };

  const getStatusIcon = (status: FileStatus) => {
    switch (status) {
      case 'validating':
      case 'uploading':
      case 'processing':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Upload Zone */}
      <Card 
        className={cn(
          "border-2 border-dashed transition-colors cursor-pointer",
          isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center",
              isDragOver ? "bg-blue-100" : "bg-gray-100"
            )}>
              <Upload className={cn(
                "w-8 h-8",
                isDragOver ? "text-blue-600" : "text-gray-600"
              )} />
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                {isDragOver ? 'Drop files here' : 'Drop files or click to upload'}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Supports {uploadConfig.allowedExtensions.join(', ')} files up to {formatFileSize(uploadConfig.maxFileSize)}
              </p>
              
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge variant="secondary">
                  Max {uploadConfig.maxFiles} files
                </Badge>
                <Badge variant="secondary">
                  {formatFileSize(uploadConfig.maxTotalSize)} total
                </Badge>
                {uploadConfig.minDPI && (
                  <Badge variant="secondary">
                    Min {uploadConfig.minDPI} DPI
                  </Badge>
                )}
              </div>
            </div>

            <Button 
              variant="outline"
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              Choose Files
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={uploadConfig.allowedTypes.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* File List */}
      {selectedFiles.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Selected Files ({selectedFiles.length})</h3>
          
          <div className="space-y-3">
            {selectedFiles.map((fileItem, index) => (
              <Card key={fileItem.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    {getFileIcon(fileItem.file)}
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {fileItem.file.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {formatFileSize(fileItem.file.size)}
                      </p>
                      
                      {/* Progress Bar */}
                      {fileItem.progress !== undefined && (
                        <div className="mt-2">
                          <Progress value={fileItem.progress} className="h-2" />
                        </div>
                      )}
                      
                      {/* Error Message */}
                      {fileItem.error && (
                        <Alert variant="destructive" className="mt-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-xs">
                            {fileItem.error}
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      {/* Validation Suggestions */}
                      {fileItem.validation?.suggestions && fileItem.validation.suggestions.length > 0 && (
                        <div className="mt-2">
                          {fileItem.validation.suggestions.map((suggestion, i) => (
                            <p key={i} className="text-xs text-blue-600">
                              💡 {suggestion}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(fileItem.status)}
                    
                    <Badge variant={
                      fileItem.status === 'error' ? 'destructive' :
                      fileItem.status === 'complete' ? 'default' : 'secondary'
                    }>
                      {fileItem.status}
                    </Badge>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      disabled={fileItem.status === 'uploading'}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Upload Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-900 mb-2">File Requirements</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use high-resolution files (300+ DPI) for best print quality</li>
            <li>• Include 0.125" bleed for designs extending to page edges</li>
            <li>• Convert text to outlines or embed fonts in PDF files</li>
            <li>• Use CMYK color mode for accurate color reproduction</li>
            <li>• Save images in RGB format at maximum quality</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}