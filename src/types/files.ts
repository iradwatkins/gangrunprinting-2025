// File management types for artwork upload system

export interface ArtworkFile {
  id: string;
  user_id: string;
  order_job_id?: string;
  original_filename: string;
  stored_filename: string;
  file_path: string;
  file_size: number;
  file_type: string;
  mime_type: string;
  dimensions?: {
    width: number;
    height: number;
    dpi?: number;
  };
  color_space?: string;
  validation_status: 'pending' | 'valid' | 'invalid' | 'needs_review';
  validation_notes?: string;
  preview_url?: string;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
}

export interface FileUploadProgress {
  file_id: string;
  filename: string;
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  error_message?: string;
}

export interface OrderJobFile {
  order_job_id: string;
  artwork_file_id: string;
  file_purpose: 'artwork' | 'reference' | 'proof';
  is_primary: boolean;
  position: number;
  notes?: string;
}

// File upload configuration
export interface FileUploadConfig {
  maxFileSize: number; // in bytes
  maxTotalSize: number; // in bytes  
  allowedTypes: string[];
  allowedExtensions: string[];
  maxFiles: number;
  requireDimensions: boolean;
  minDPI?: number;
  maxDimensions?: {
    width: number;
    height: number;
  };
}

// File validation result
export interface FileValidationResult {
  isValid: boolean;
  errors: FileValidationError[];
  warnings: FileValidationWarning[];
  suggestions: string[];
  fileInfo?: {
    dimensions?: {
      width: number;
      height: number;
      dpi?: number;
    };
    colorSpace?: string;
    hasTransparency?: boolean;
    pageCount?: number;
  };
}

export interface FileValidationError {
  code: string;
  message: string;
  field?: string;
}

export interface FileValidationWarning {
  code: string;
  message: string;
  suggestion?: string;
}

// File upload request/response types
export interface FileUploadRequest {
  file: File;
  purpose?: 'artwork' | 'reference' | 'proof';
  order_job_id?: string;
}

export interface FileUploadResponse {
  success: boolean;
  file?: ArtworkFile;
  error?: string;
  validation?: FileValidationResult;
}

export interface MultipleFileUploadResponse {
  success: boolean;
  files: ArtworkFile[];
  errors: Array<{
    filename: string;
    error: string;
  }>;
  totalUploaded: number;
  totalFailed: number;
}

// File management operations
export interface FileUpdateRequest {
  original_filename?: string;
  validation_notes?: string;
  order_job_id?: string;
}

export interface FileAssociationRequest {
  artwork_file_id: string;
  file_purpose: 'artwork' | 'reference' | 'proof';
  is_primary?: boolean;
  position?: number;
  notes?: string;
}

// File search and filtering
export interface FileSearchParams {
  user_id?: string;
  order_job_id?: string;
  validation_status?: ArtworkFile['validation_status'];
  file_type?: string;
  created_after?: string;
  created_before?: string;
  limit?: number;
  offset?: number;
  sort_by?: 'created_at' | 'filename' | 'file_size';
  sort_order?: 'asc' | 'desc';
}

export interface FileSearchResponse {
  files: ArtworkFile[];
  total: number;
  has_more: boolean;
}

// File operations
export interface FileOperationResult {
  success: boolean;
  message?: string;
  error?: string;
}

// Predefined file configurations for different product types
export const FILE_CONFIGS: Record<string, FileUploadConfig> = {
  'business-cards': {
    maxFileSize: 50 * 1024 * 1024, // 50MB
    maxTotalSize: 200 * 1024 * 1024, // 200MB
    allowedTypes: ['image/jpeg', 'image/png', 'application/pdf', 'application/postscript'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.pdf', '.ai', '.eps'],
    maxFiles: 10,
    requireDimensions: true,
    minDPI: 300,
    maxDimensions: { width: 4200, height: 2400 } // 3.5" x 2" at 300 DPI with bleed
  },
  'flyers': {
    maxFileSize: 100 * 1024 * 1024, // 100MB
    maxTotalSize: 500 * 1024 * 1024, // 500MB
    allowedTypes: ['image/jpeg', 'image/png', 'application/pdf', 'application/postscript'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.pdf', '.ai', '.eps'],
    maxFiles: 5,
    requireDimensions: true,
    minDPI: 300,
    maxDimensions: { width: 8700, height: 11200 } // 8.5" x 11" at 300 DPI with bleed
  },
  'posters': {
    maxFileSize: 200 * 1024 * 1024, // 200MB
    maxTotalSize: 1024 * 1024 * 1024, // 1GB
    allowedTypes: ['image/jpeg', 'image/png', 'application/pdf', 'application/postscript'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.pdf', '.ai', '.eps'],
    maxFiles: 3,
    requireDimensions: true,
    minDPI: 150,
    maxDimensions: { width: 7200, height: 10800 } // 24" x 36" at 300 DPI
  },
  'banners': {
    maxFileSize: 500 * 1024 * 1024, // 500MB
    maxTotalSize: 2 * 1024 * 1024 * 1024, // 2GB
    allowedTypes: ['image/jpeg', 'image/png', 'application/pdf', 'application/postscript'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.pdf', '.ai', '.eps'],
    maxFiles: 2,
    requireDimensions: true,
    minDPI: 100,
    maxDimensions: { width: 14400, height: 7200 } // 48" x 24" at 300 DPI
  },
  'default': {
    maxFileSize: 100 * 1024 * 1024, // 100MB
    maxTotalSize: 500 * 1024 * 1024, // 500MB
    allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.pdf'],
    maxFiles: 10,
    requireDimensions: false
  }
};

// File validation error codes
export const FILE_ERROR_CODES = {
  INVALID_TYPE: 'INVALID_TYPE',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  TOTAL_SIZE_EXCEEDED: 'TOTAL_SIZE_EXCEEDED',
  TOO_MANY_FILES: 'TOO_MANY_FILES',
  INVALID_DIMENSIONS: 'INVALID_DIMENSIONS',
  LOW_RESOLUTION: 'LOW_RESOLUTION',
  CORRUPTED_FILE: 'CORRUPTED_FILE',
  UNSUPPORTED_COLOR_SPACE: 'UNSUPPORTED_COLOR_SPACE',
  UPLOAD_FAILED: 'UPLOAD_FAILED',
  PROCESSING_FAILED: 'PROCESSING_FAILED'
} as const;

// File status for UI
export type FileStatus = 'idle' | 'validating' | 'uploading' | 'processing' | 'complete' | 'error';

// File display modes
export type FileDisplayMode = 'grid' | 'list';

// File sort options
export type FileSortOption = {
  field: 'created_at' | 'filename' | 'file_size' | 'validation_status';
  label: string;
  order: 'asc' | 'desc';
};