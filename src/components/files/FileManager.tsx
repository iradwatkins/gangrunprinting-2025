import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  Grid, 
  List, 
  SortAsc, 
  SortDesc, 
  Filter, 
  Upload, 
  Trash2, 
  Download,
  MoreHorizontal,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FilePreview } from './FilePreview';
import { FileUploadZone } from './FileUploadZone';
import { filesApi } from '@/api/files';
import type { 
  ArtworkFile, 
  FileSearchParams, 
  FileDisplayMode, 
  FileSortOption 
} from '@/types/files';
import { toast } from 'sonner';

interface FileManagerProps {
  orderJobId?: string;
  allowUpload?: boolean;
  allowDelete?: boolean;
  onFileSelect?: (file: ArtworkFile) => void;
  selectedFiles?: string[];
  className?: string;
}

export function FileManager({
  orderJobId,
  allowUpload = true,
  allowDelete = true,
  onFileSelect,
  selectedFiles = [],
  className
}: FileManagerProps) {
  const [files, setFiles] = useState<ArtworkFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [displayMode, setDisplayMode] = useState<FileDisplayMode>('grid');
  const [sortOption, setSortOption] = useState<FileSortOption>({
    field: 'created_at',
    label: 'Date Created',
    order: 'desc'
  });
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showUploadZone, setShowUploadZone] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const sortOptions: FileSortOption[] = [
    { field: 'created_at', label: 'Date Created', order: 'desc' },
    { field: 'created_at', label: 'Date Created (Oldest)', order: 'asc' },
    { field: 'filename', label: 'Name (A-Z)', order: 'asc' },
    { field: 'filename', label: 'Name (Z-A)', order: 'desc' },
    { field: 'file_size', label: 'Size (Largest)', order: 'desc' },
    { field: 'file_size', label: 'Size (Smallest)', order: 'asc' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Files' },
    { value: 'pending', label: 'Pending Validation' },
    { value: 'valid', label: 'Valid' },
    { value: 'invalid', label: 'Invalid' },
    { value: 'needs_review', label: 'Needs Review' }
  ];

  useEffect(() => {
    loadFiles(true);
  }, [orderJobId, sortOption, filterStatus]);

  useEffect(() => {
    if (searchTerm) {
      const timer = setTimeout(() => loadFiles(true), 500);
      return () => clearTimeout(timer);
    } else {
      loadFiles(true);
    }
  }, [searchTerm]);

  const loadFiles = async (reset = false) => {
    try {
      if (reset) {
        setIsLoading(true);
        setCurrentPage(0);
      }

      const params: FileSearchParams = {
        limit: 20,
        offset: reset ? 0 : currentPage * 20,
        sort_by: sortOption.field,
        sort_order: sortOption.order
      };

      if (orderJobId) {
        params.order_job_id = orderJobId;
      }

      if (filterStatus !== 'all') {
        params.validation_status = filterStatus as any;
      }

      const response = await filesApi.getFiles(params);

      if (response.success && response.data) {
        if (reset) {
          setFiles(response.data.files);
        } else {
          setFiles(prev => [...prev, ...response.data.files]);
        }
        setHasMore(response.data.has_more);
        setError(null);
      } else {
        setError(response.error || 'Failed to load files');
      }
    } catch (err) {
      setError('Failed to load files');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilesUploaded = async (uploadedFiles: File[]) => {
    // Refresh file list after upload
    await loadFiles(true);
    setShowUploadZone(false);
    toast.success(`${uploadedFiles.length} file(s) uploaded successfully`);
  };

  const handleFileRemoved = (index: number) => {
    // Handle file removal from upload zone
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      const response = await filesApi.deleteFile(fileId);
      if (response.success) {
        setFiles(prev => prev.filter(f => f.id !== fileId));
        toast.success('File deleted successfully');
      } else {
        toast.error(response.error || 'Failed to delete file');
      }
    } catch (err) {
      toast.error('Failed to delete file');
    }
  };

  const handleDownloadFile = async (file: ArtworkFile) => {
    try {
      const response = await filesApi.getDownloadUrl(file.id);
      if (response.success && response.data) {
        const link = document.createElement('a');
        link.href = response.data;
        link.download = file.original_filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        toast.error('Failed to generate download link');
      }
    } catch (err) {
      toast.error('Failed to download file');
    }
  };

  const filteredFiles = files.filter(file =>
    file.original_filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredFiles.map((file) => (
        <div key={file.id} className="relative group">
          <FilePreview
            file={file}
            showFullPreview
            onDownload={() => handleDownloadFile(file)}
            className={cn(
              "transition-all duration-200",
              selectedFiles.includes(file.id) && "ring-2 ring-blue-500",
              onFileSelect && "cursor-pointer hover:shadow-lg"
            )}
          />
          
          {/* File Actions */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex space-x-1">
              {allowDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFile(file.id);
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownloadFile(file);
                }}
              >
                <Download className="w-3 h-3" />
              </Button>
            </div>
          </div>
          
          {/* Selection Overlay */}
          {onFileSelect && (
            <div
              className="absolute inset-0 cursor-pointer"
              onClick={() => onFileSelect(file)}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-2">
      {filteredFiles.map((file) => (
        <div key={file.id} className="relative group">
          <FilePreview
            file={file}
            className={cn(
              "transition-all duration-200 hover:shadow-sm",
              selectedFiles.includes(file.id) && "ring-2 ring-blue-500",
              onFileSelect && "cursor-pointer"
            )}
          />
          
          {/* File Actions */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex space-x-1">
              {allowDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFile(file.id);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownloadFile(file);
                }}
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Selection Overlay */}
          {onFileSelect && (
            <div
              className="absolute inset-0 cursor-pointer"
              onClick={() => onFileSelect(file)}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderLoadingSkeleton = () => (
    <div className={displayMode === 'grid' 
      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      : "space-y-2"
    }>
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className={displayMode === 'grid' ? "h-64" : "h-20"} />
      ))}
    </div>
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">File Manager</h2>
          <p className="text-gray-600">
            {files.length} file{files.length !== 1 ? 's' : ''} 
            {orderJobId && ' for this order'}
          </p>
        </div>
        
        {allowUpload && (
          <Button onClick={() => setShowUploadZone(!showUploadZone)}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Files
          </Button>
        )}
      </div>

      {/* Upload Zone */}
      {showUploadZone && allowUpload && (
        <FileUploadZone
          onFilesSelected={handleFilesUploaded}
          onFileRemoved={handleFileRemoved}
        />
      )}

      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter by Status */}
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select
          value={`${sortOption.field}_${sortOption.order}`}
          onValueChange={(value) => {
            const option = sortOptions.find(opt => 
              `${opt.field}_${opt.order}` === value
            );
            if (option) setSortOption(option);
          }}
        >
          <SelectTrigger className="w-48">
            {sortOption.order === 'asc' ? 
              <SortAsc className="w-4 h-4 mr-2" /> : 
              <SortDesc className="w-4 h-4 mr-2" />
            }
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem 
                key={`${option.field}_${option.order}`} 
                value={`${option.field}_${option.order}`}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* View Mode */}
        <div className="flex rounded-md border">
          <Button
            variant={displayMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setDisplayMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={displayMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setDisplayMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>

        {/* Refresh */}
        <Button variant="outline" size="sm" onClick={() => loadFiles(true)}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Files Display */}
      {isLoading && files.length === 0 ? (
        renderLoadingSkeleton()
      ) : filteredFiles.length === 0 ? (
        <div className="text-center py-12">
          <Upload className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? 'No files match your search criteria'
              : allowUpload 
                ? 'Upload some files to get started'
                : 'No files have been uploaded yet'
            }
          </p>
          {allowUpload && !searchTerm && (
            <Button onClick={() => setShowUploadZone(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Files
            </Button>
          )}
        </div>
      ) : (
        <>
          {displayMode === 'grid' ? renderGridView() : renderListView()}
          
          {/* Load More */}
          {hasMore && (
            <div className="text-center pt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentPage(prev => prev + 1);
                  loadFiles(false);
                }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}