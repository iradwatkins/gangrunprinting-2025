import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';
import crypto from 'crypto';

export interface StorageFile {
  id: string;
  name: string;
  path: string;
  size: number;
  mimeType: string;
  url: string;
  createdAt: Date;
}

export interface StorageService {
  upload(file: Buffer, filename: string, mimeType: string): Promise<StorageFile>;
  download(filePath: string): Promise<Buffer>;
  delete(filePath: string): Promise<boolean>;
  getUrl(filePath: string): string;
  list(directory?: string): Promise<StorageFile[]>;
}

class LocalStorageService implements StorageService {
  private basePath: string;
  private baseUrl: string;

  constructor() {
    this.basePath = process.env.STORAGE_PATH || './uploads';
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    // Ensure upload directory exists
    this.ensureDirectoryExists(this.basePath);
  }

  private ensureDirectoryExists(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  private generateUniqueFilename(originalFilename: string): string {
    const ext = path.extname(originalFilename);
    const name = path.basename(originalFilename, ext);
    const uniqueId = crypto.randomBytes(6).toString('hex');
    const timestamp = Date.now();
    return `${name}-${timestamp}-${uniqueId}${ext}`;
  }

  async upload(file: Buffer, filename: string, mimeType: string): Promise<StorageFile> {
    const uniqueFilename = this.generateUniqueFilename(filename);
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    
    // Create year/month subdirectories
    const relativePath = path.join(year.toString(), month, uniqueFilename);
    const fullPath = path.join(this.basePath, relativePath);
    
    // Ensure directory exists
    this.ensureDirectoryExists(path.dirname(fullPath));
    
    // Write file
    await fsPromises.writeFile(fullPath, file);
    
    return {
      id: crypto.randomUUID(),
      name: filename,
      path: relativePath,
      size: file.length,
      mimeType,
      url: this.getUrl(relativePath),
      createdAt: new Date(),
    };
  }

  async download(filePath: string): Promise<Buffer> {
    const fullPath = path.join(this.basePath, filePath);
    
    if (!fs.existsSync(fullPath)) {
      throw new Error('File not found');
    }
    
    return fsPromises.readFile(fullPath);
  }

  async delete(filePath: string): Promise<boolean> {
    const fullPath = path.join(this.basePath, filePath);
    
    if (!fs.existsSync(fullPath)) {
      return false;
    }
    
    await fsPromises.unlink(fullPath);
    return true;
  }

  getUrl(filePath: string): string {
    return `${this.baseUrl}/api/files/${encodeURIComponent(filePath)}`;
  }

  async list(directory?: string): Promise<StorageFile[]> {
    const searchPath = directory 
      ? path.join(this.basePath, directory)
      : this.basePath;
    
    if (!fs.existsSync(searchPath)) {
      return [];
    }
    
    const files: StorageFile[] = [];
    const entries = await fsPromises.readdir(searchPath, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isFile()) {
        const fullPath = path.join(searchPath, entry.name);
        const relativePath = path.relative(this.basePath, fullPath);
        const stats = await fsPromises.stat(fullPath);
        
        files.push({
          id: crypto.randomUUID(),
          name: entry.name,
          path: relativePath,
          size: stats.size,
          mimeType: this.getMimeType(entry.name),
          url: this.getUrl(relativePath),
          createdAt: stats.birthtime,
        });
      }
    }
    
    return files;
  }

  private getMimeType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.webp': 'image/webp',
      '.zip': 'application/zip',
      '.txt': 'text/plain',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
    
    return mimeTypes[ext] || 'application/octet-stream';
  }
}

// S3 Storage implementation (placeholder)
class S3StorageService implements StorageService {
  async upload(file: Buffer, filename: string, mimeType: string): Promise<StorageFile> {
    // TODO: Implement S3 upload using AWS SDK
    throw new Error('S3 storage not yet implemented');
  }

  async download(filePath: string): Promise<Buffer> {
    // TODO: Implement S3 download
    throw new Error('S3 storage not yet implemented');
  }

  async delete(filePath: string): Promise<boolean> {
    // TODO: Implement S3 delete
    throw new Error('S3 storage not yet implemented');
  }

  getUrl(filePath: string): string {
    // TODO: Return S3 URL or CloudFront URL
    return '';
  }

  async list(directory?: string): Promise<StorageFile[]> {
    // TODO: Implement S3 list
    throw new Error('S3 storage not yet implemented');
  }
}

// Factory function to get the appropriate storage service
export function getStorageService(): StorageService {
  const storageType = process.env.STORAGE_TYPE || 'local';
  
  switch (storageType) {
    case 's3':
      return new S3StorageService();
    case 'local':
    default:
      return new LocalStorageService();
  }
}

// Export the default storage service
export const storage = getStorageService();