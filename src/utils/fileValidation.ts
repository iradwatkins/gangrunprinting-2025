import type { FileUploadRequest } from '@/types/files';

// Security constants
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const MIN_FILE_SIZE = 1024; // 1KB

// Allowed file types for printing
const ALLOWED_MIME_TYPES = {
  // Images
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/tiff': ['.tif', '.tiff'],
  'image/bmp': ['.bmp'],
  'image/svg+xml': ['.svg'],
  
  // Documents
  'application/pdf': ['.pdf'],
  'application/postscript': ['.eps', '.ai'],
  'application/illustrator': ['.ai'],
  
  // Adobe formats
  'application/x-photoshop': ['.psd'],
  'application/x-indesign': ['.indd'],
  
  // Other print-ready formats
  'application/x-pdf': ['.pdf'],
  'application/eps': ['.eps'],
  'application/x-eps': ['.eps'],
} as const;

// Magic number signatures for file validation
const FILE_SIGNATURES: Record<string, Uint8Array[]> = {
  'image/jpeg': [
    new Uint8Array([0xFF, 0xD8, 0xFF]), // JPEG
  ],
  'image/png': [
    new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]), // PNG
  ],
  'image/tiff': [
    new Uint8Array([0x49, 0x49, 0x2A, 0x00]), // TIFF (little-endian)
    new Uint8Array([0x4D, 0x4D, 0x00, 0x2A]), // TIFF (big-endian)
  ],
  'image/bmp': [
    new Uint8Array([0x42, 0x4D]), // BMP
  ],
  'application/pdf': [
    new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2D]), // %PDF-
  ],
  'application/postscript': [
    new Uint8Array([0x25, 0x21, 0x50, 0x53]), // %!PS
  ],
};

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedFileName: string;
  detectedMimeType?: string;
}

export class FileValidator {
  /**
   * Validate a file for upload
   */
  static async validateFile(file: File): Promise<FileValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Sanitize filename
    const sanitizedFileName = this.sanitizeFileName(file.name);
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    }
    
    if (file.size < MIN_FILE_SIZE) {
      errors.push('File is too small (minimum 1KB)');
    }
    
    // Check file extension
    const fileExtension = this.getFileExtension(file.name);
    if (!this.isAllowedExtension(fileExtension)) {
      errors.push(`File type .${fileExtension} is not allowed for printing`);
    }
    
    // Validate MIME type
    if (!this.isAllowedMimeType(file.type)) {
      errors.push(`MIME type ${file.type} is not allowed`);
    }
    
    // Check magic numbers (file signature)
    const detectedMimeType = await this.detectFileType(file);
    if (detectedMimeType && detectedMimeType !== file.type) {
      warnings.push(`File content doesn't match declared type. Expected ${file.type}, detected ${detectedMimeType}`);
    }
    
    // Additional checks for specific file types
    if (file.type.startsWith('image/')) {
      const imageValidation = await this.validateImage(file);
      errors.push(...imageValidation.errors);
      warnings.push(...imageValidation.warnings);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sanitizedFileName,
      detectedMimeType
    };
  }
  
  /**
   * Sanitize filename to prevent directory traversal and other attacks
   */
  private static sanitizeFileName(filename: string): string {
    // Remove any path components
    const basename = filename.split(/[\\/]/).pop() || '';
    
    // Remove dangerous characters and sequences
    return basename
      .replace(/[^a-zA-Z0-9._-]/g, '_') // Allow only safe characters
      .replace(/\.{2,}/g, '_') // Remove multiple dots
      .replace(/^\./, '_') // Don't allow hidden files
      .substring(0, 255); // Limit length
  }
  
  /**
   * Get file extension safely
   */
  private static getFileExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
  }
  
  /**
   * Check if file extension is allowed
   */
  private static isAllowedExtension(extension: string): boolean {
    const allowedExtensions = Object.values(ALLOWED_MIME_TYPES).flat();
    return allowedExtensions.includes(`.${extension}`);
  }
  
  /**
   * Check if MIME type is allowed
   */
  private static isAllowedMimeType(mimeType: string): boolean {
    return mimeType in ALLOWED_MIME_TYPES;
  }
  
  /**
   * Detect file type by reading magic numbers
   */
  private static async detectFileType(file: File): Promise<string | null> {
    const buffer = await this.readFileHeader(file, 16);
    
    for (const [mimeType, signatures] of Object.entries(FILE_SIGNATURES)) {
      for (const signature of signatures) {
        if (this.matchesSignature(buffer, signature)) {
          return mimeType;
        }
      }
    }
    
    return null;
  }
  
  /**
   * Read file header for magic number detection
   */
  private static readFileHeader(file: File, bytes: number): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const buffer = new Uint8Array(reader.result as ArrayBuffer);
        resolve(buffer);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file.slice(0, bytes));
    });
  }
  
  /**
   * Check if buffer matches signature
   */
  private static matchesSignature(buffer: Uint8Array, signature: Uint8Array): boolean {
    if (buffer.length < signature.length) return false;
    
    for (let i = 0; i < signature.length; i++) {
      if (buffer[i] !== signature[i]) return false;
    }
    
    return true;
  }
  
  /**
   * Validate image files
   */
  private static async validateImage(file: File): Promise<{ errors: string[]; warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    try {
      const dimensions = await this.getImageDimensions(file);
      
      // Check minimum resolution for print (300 DPI at 2" x 2" minimum)
      const minPixels = 600;
      if (dimensions.width < minPixels || dimensions.height < minPixels) {
        warnings.push(`Image resolution is low (${dimensions.width}x${dimensions.height}). Minimum recommended is ${minPixels}x${minPixels} pixels for print quality.`);
      }
      
      // Check aspect ratio (warn if extremely wide or tall)
      const aspectRatio = dimensions.width / dimensions.height;
      if (aspectRatio > 10 || aspectRatio < 0.1) {
        warnings.push('Image has an extreme aspect ratio which may not print well');
      }
      
      // Check file size vs dimensions (detect potential corruption)
      const expectedMinSize = (dimensions.width * dimensions.height * 3) / 10; // Rough estimate
      if (file.size < expectedMinSize) {
        warnings.push('File size seems unusually small for the image dimensions');
      }
      
    } catch (error) {
      errors.push('Failed to read image properties');
    }
    
    return { errors, warnings };
  }
  
  /**
   * Get image dimensions
   */
  private static getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight
        });
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };
      
      img.src = url;
    });
  }
  
  /**
   * Check if filename contains suspicious patterns
   */
  static hasSecurityRisk(filename: string): boolean {
    const suspiciousPatterns = [
      /\.\./,              // Directory traversal
      /^\/|^\\/,           // Absolute paths
      /\0/,                // Null bytes
      /<script/i,          // Script tags
      /\.exe$|\.bat$|\.cmd$|\.com$|\.scr$/i,  // Executable files
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(filename));
  }
}

/**
 * Convenience function for validating file uploads
 */
export async function validateFileUpload(request: FileUploadRequest): Promise<FileValidationResult> {
  return FileValidator.validateFile(request.file);
}