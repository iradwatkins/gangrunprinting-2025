import type { 
  FileUploadConfig, 
  FileValidationResult, 
  FileValidationError, 
  FileValidationWarning 
} from '@/types/files';
import { FILE_ERROR_CODES } from '@/types/files';

export class FileValidator {
  private config: FileUploadConfig;

  constructor(config: FileUploadConfig) {
    this.config = config;
  }

  async validateFile(file: File, existingFiles: File[] = []): Promise<FileValidationResult> {
    const errors: FileValidationError[] = [];
    const warnings: FileValidationWarning[] = [];
    const suggestions: string[] = [];

    // Basic validation
    this.validateFileType(file, errors);
    this.validateFileSize(file, errors);
    this.validateTotalSize(file, existingFiles, errors);
    this.validateFileCount(existingFiles, errors);

    // Advanced validation for images
    if (file.type.startsWith('image/')) {
      await this.validateImageFile(file, errors, warnings, suggestions);
    }

    // Advanced validation for PDFs
    if (file.type === 'application/pdf') {
      await this.validatePDFFile(file, errors, warnings, suggestions);
    }

    // Security validation
    await this.validateFileSecurity(file, errors);

    // Add general suggestions
    this.addGeneralSuggestions(file, suggestions);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  private validateFileType(file: File, errors: FileValidationError[]): void {
    const isValidMimeType = this.config.allowedTypes.includes(file.type);
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const isValidExtension = this.config.allowedExtensions.includes(fileExtension);

    if (!isValidMimeType && !isValidExtension) {
      errors.push({
        code: FILE_ERROR_CODES.INVALID_TYPE,
        message: `File type "${file.type || fileExtension}" is not supported. Allowed types: ${this.config.allowedExtensions.join(', ')}`,
        field: 'type'
      });
    }
  }

  private validateFileSize(file: File, errors: FileValidationError[]): void {
    if (file.size > this.config.maxFileSize) {
      errors.push({
        code: FILE_ERROR_CODES.FILE_TOO_LARGE,
        message: `File size ${this.formatFileSize(file.size)} exceeds maximum allowed size of ${this.formatFileSize(this.config.maxFileSize)}`,
        field: 'size'
      });
    }
  }

  private validateTotalSize(file: File, existingFiles: File[], errors: FileValidationError[]): void {
    const totalSize = existingFiles.reduce((sum, f) => sum + f.size, 0) + file.size;
    if (totalSize > this.config.maxTotalSize) {
      errors.push({
        code: FILE_ERROR_CODES.TOTAL_SIZE_EXCEEDED,
        message: `Total upload size would exceed maximum of ${this.formatFileSize(this.config.maxTotalSize)}`,
        field: 'totalSize'
      });
    }
  }

  private validateFileCount(existingFiles: File[], errors: FileValidationError[]): void {
    if (existingFiles.length >= this.config.maxFiles) {
      errors.push({
        code: FILE_ERROR_CODES.TOO_MANY_FILES,
        message: `Maximum of ${this.config.maxFiles} files allowed`,
        field: 'count'
      });
    }
  }

  private async validateImageFile(
    file: File, 
    errors: FileValidationError[], 
    warnings: FileValidationWarning[], 
    suggestions: string[]
  ): Promise<void> {
    try {
      const imageInfo = await this.getImageInfo(file);
      
      if (this.config.requireDimensions && imageInfo) {
        // Check minimum DPI
        if (this.config.minDPI && imageInfo.dpi && imageInfo.dpi < this.config.minDPI) {
          warnings.push({
            code: FILE_ERROR_CODES.LOW_RESOLUTION,
            message: `Image resolution (${imageInfo.dpi} DPI) is below recommended ${this.config.minDPI} DPI`,
            suggestion: `For best print quality, use images with at least ${this.config.minDPI} DPI`
          });
        }

        // Check maximum dimensions
        if (this.config.maxDimensions) {
          if (imageInfo.width > this.config.maxDimensions.width || 
              imageInfo.height > this.config.maxDimensions.height) {
            errors.push({
              code: FILE_ERROR_CODES.INVALID_DIMENSIONS,
              message: `Image dimensions (${imageInfo.width}×${imageInfo.height}) exceed maximum allowed (${this.config.maxDimensions.width}×${this.config.maxDimensions.height})`,
              field: 'dimensions'
            });
          }
        }

        // Add image-specific suggestions
        if (imageInfo.dpi && imageInfo.dpi >= 300) {
          suggestions.push('Excellent resolution for print quality!');
        } else if (imageInfo.dpi && imageInfo.dpi >= 150) {
          suggestions.push('Good resolution, but 300+ DPI recommended for crisp prints');
        }

        if (imageInfo.hasTransparency) {
          suggestions.push('Image contains transparency. Ensure background is intended to be transparent in final print');
        }
      }

      // JPEG-specific validation
      if (file.type === 'image/jpeg') {
        suggestions.push('For JPEG files, ensure quality is set to maximum (90-100%) for print applications');
      }

      // PNG-specific validation
      if (file.type === 'image/png') {
        suggestions.push('PNG format is excellent for images with transparency or sharp graphics');
      }

    } catch (error) {
      warnings.push({
        code: FILE_ERROR_CODES.PROCESSING_FAILED,
        message: 'Could not analyze image properties',
        suggestion: 'File may be corrupted or in an unsupported format'
      });
    }
  }

  private async validatePDFFile(
    file: File, 
    errors: FileValidationError[], 
    warnings: FileValidationWarning[], 
    suggestions: string[]
  ): Promise<void> {
    try {
      // Basic PDF validation
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Check PDF header
      const header = String.fromCharCode(...uint8Array.slice(0, 4));
      if (header !== '%PDF') {
        errors.push({
          code: FILE_ERROR_CODES.CORRUPTED_FILE,
          message: 'File appears to be corrupted or is not a valid PDF',
          field: 'format'
        });
        return;
      }

      // PDF-specific suggestions
      suggestions.push('Ensure PDF fonts are embedded for consistent text rendering');
      suggestions.push('Use CMYK color mode for accurate color reproduction');
      suggestions.push('Include crop marks and bleeds if design extends to page edges');
      suggestions.push('Flatten transparency effects to avoid printing issues');

    } catch (error) {
      warnings.push({
        code: FILE_ERROR_CODES.PROCESSING_FAILED,
        message: 'Could not analyze PDF file',
        suggestion: 'File may be corrupted or password protected'
      });
    }
  }

  private async validateFileSecurity(file: File, errors: FileValidationError[]): Promise<void> {
    try {
      // Check for malicious file patterns
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Check for executable signatures
      const executableSignatures = [
        [0x4D, 0x5A], // PE executable
        [0x7F, 0x45, 0x4C, 0x46], // ELF executable
        [0xCF, 0xFA, 0xED, 0xFE], // Mach-O executable
      ];

      for (const signature of executableSignatures) {
        if (this.matchesSignature(uint8Array, signature)) {
          errors.push({
            code: 'SECURITY_THREAT',
            message: 'File contains executable code and cannot be uploaded',
            field: 'security'
          });
          return;
        }
      }

      // Check file size consistency
      if (file.size === 0) {
        errors.push({
          code: FILE_ERROR_CODES.CORRUPTED_FILE,
          message: 'File is empty or corrupted',
          field: 'size'
        });
      }

    } catch (error) {
      // If we can't read the file for security validation, it's likely corrupted
      errors.push({
        code: FILE_ERROR_CODES.CORRUPTED_FILE,
        message: 'File cannot be read and may be corrupted',
        field: 'format'
      });
    }
  }

  private matchesSignature(data: Uint8Array, signature: number[]): boolean {
    if (data.length < signature.length) return false;
    return signature.every((byte, index) => data[index] === byte);
  }

  private async getImageInfo(file: File): Promise<{
    width: number;
    height: number;
    dpi?: number;
    hasTransparency?: boolean;
  } | null> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        // Basic image info - in a real implementation, you'd use a library 
        // like exif-js or similar to get DPI and other metadata
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight,
          dpi: this.estimateDPI(img.naturalWidth, img.naturalHeight),
          hasTransparency: file.type === 'image/png' // Simplified check
        });
      };
      img.onerror = () => resolve(null);
      img.src = URL.createObjectURL(file);
    });
  }

  private estimateDPI(width: number, height: number): number {
    // Estimate DPI based on common print sizes
    // This is a simplified estimation - real implementation would read EXIF data
    const commonSizes = [
      { w: 1050, h: 600, size: "3.5x2", dpi: 300 }, // Business card
      { w: 2550, h: 3300, size: "8.5x11", dpi: 300 }, // Letter
      { w: 1800, h: 2400, size: "6x8", dpi: 300 }, // Photo
    ];

    for (const size of commonSizes) {
      const ratio = Math.abs((width / height) - (size.w / size.h));
      if (ratio < 0.1) { // Similar aspect ratio
        return Math.round((width / size.w) * size.dpi);
      }
    }

    return 150; // Default estimate
  }

  private addGeneralSuggestions(file: File, suggestions: string[]): void {
    // Add suggestions based on file type
    if (file.type.startsWith('image/')) {
      suggestions.push('Convert images to CMYK color mode for accurate print colors');
      suggestions.push('Save a backup copy before making any edits');
    }

    if (file.type === 'application/pdf') {
      suggestions.push('Verify all fonts are embedded before uploading');
      suggestions.push('Consider creating a PDF/X-1a file for best print compatibility');
    }

    // Size-based suggestions
    if (file.size > 50 * 1024 * 1024) { // 50MB
      suggestions.push('Large file detected - ensure you have a stable internet connection');
    }
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Utility functions for file validation
export const validateFileExtension = (filename: string, allowedExtensions: string[]): boolean => {
  const extension = '.' + filename.split('.').pop()?.toLowerCase();
  return allowedExtensions.includes(extension);
};

export const getFileExtension = (filename: string): string => {
  return '.' + filename.split('.').pop()?.toLowerCase();
};

export const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/');
};

export const isPDFFile = (file: File): boolean => {
  return file.type === 'application/pdf';
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const createFileValidator = (config: FileUploadConfig): FileValidator => {
  return new FileValidator(config);
};