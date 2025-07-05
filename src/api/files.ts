import { supabase } from '@/integrations/supabase/client';
import { auth } from '@/lib/auth';
import { ApiResponse, handleApiError } from '@/lib/errors';
import type {
  ArtworkFile,
  FileUploadRequest,
  FileUploadResponse,
  MultipleFileUploadResponse,
  FileUpdateRequest,
  FileAssociationRequest,
  FileSearchParams,
  FileSearchResponse,
  FileOperationResult
} from '@/types/files';

class FilesApi {
  private bucketName = 'artwork-files';

  // File upload operations
  async uploadFile(request: FileUploadRequest): Promise<ApiResponse<FileUploadResponse>> {
    try {
      const user = await auth.getCurrentUser();
      if (!user) {
        return { success: false, error: 'Authentication required' };
      }

      const { file, purpose = 'artwork', order_job_id } = request;
      
      // Generate unique filename
      const fileExtension = file.name.split('.').pop();
      const storedFilename = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
      
      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(this.bucketName)
        .upload(storedFilename, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get file dimensions if it's an image
      let dimensions;
      if (file.type.startsWith('image/')) {
        dimensions = await this.getImageDimensions(file);
      }

      // Create file record in database
      const artworkFile: Omit<ArtworkFile, 'id' | 'created_at' | 'updated_at'> = {
        user_id: user.id,
        order_job_id,
        original_filename: file.name,
        stored_filename: storedFilename,
        file_path: uploadData.path,
        file_size: file.size,
        file_type: fileExtension || '',
        mime_type: file.type,
        dimensions,
        validation_status: 'pending'
      };

      const { data: dbData, error: dbError } = await supabase
        .from('artwork_files')
        .insert(artworkFile)
        .select()
        .single();

      if (dbError) {
        // Clean up uploaded file if database insert fails
        await supabase.storage
          .from(this.bucketName)
          .remove([storedFilename]);
        throw new Error(`Database error: ${dbError.message}`);
      }

      // Generate preview URL
      const { data: { publicUrl } } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(storedFilename);

      const result: ArtworkFile = {
        ...dbData,
        preview_url: publicUrl
      };

      // Start validation process in background
      this.validateFileInBackground(result.id);

      return {
        success: true,
        data: {
          success: true,
          file: result
        }
      };
    } catch (error) {
      return handleApiError(error, 'Failed to upload file');
    }
  }

  async uploadMultipleFiles(files: FileUploadRequest[]): Promise<ApiResponse<MultipleFileUploadResponse>> {
    try {
      const uploadPromises = files.map(request => this.uploadFile(request));
      const results = await Promise.allSettled(uploadPromises);

      const uploadedFiles: ArtworkFile[] = [];
      const errors: Array<{ filename: string; error: string }> = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.success && result.value.data?.file) {
          uploadedFiles.push(result.value.data.file);
        } else {
          errors.push({
            filename: files[index].file.name,
            error: result.status === 'rejected' ? result.reason : result.value.error || 'Upload failed'
          });
        }
      });

      return {
        success: true,
        data: {
          success: true,
          files: uploadedFiles,
          errors,
          totalUploaded: uploadedFiles.length,
          totalFailed: errors.length
        }
      };
    } catch (error) {
      return handleApiError(error, 'Failed to upload multiple files');
    }
  }

  // File management operations
  async getFiles(params: FileSearchParams = {}): Promise<ApiResponse<FileSearchResponse>> {
    try {
      const user = await auth.getCurrentUser();
      if (!user) {
        return { success: false, error: 'Authentication required' };
      }

      let query = supabase
        .from('artwork_files')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id);

      // Apply filters
      if (params.order_job_id) {
        query = query.eq('order_job_id', params.order_job_id);
      }
      
      if (params.validation_status) {
        query = query.eq('validation_status', params.validation_status);
      }
      
      if (params.file_type) {
        query = query.eq('file_type', params.file_type);
      }
      
      if (params.created_after) {
        query = query.gte('created_at', params.created_after);
      }
      
      if (params.created_before) {
        query = query.lte('created_at', params.created_before);
      }

      // Apply sorting
      const sortBy = params.sort_by || 'created_at';
      const sortOrder = params.sort_order || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      const limit = params.limit || 20;
      const offset = params.offset || 0;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        throw new Error(error.message);
      }

      // Add preview URLs
      const filesWithUrls = await Promise.all((data || []).map(async (file) => {
        const { data: { publicUrl } } = supabase.storage
          .from(this.bucketName)
          .getPublicUrl(file.stored_filename);
        
        return {
          ...file,
          preview_url: publicUrl
        };
      }));

      return {
        success: true,
        data: {
          files: filesWithUrls,
          total: count || 0,
          has_more: (offset + limit) < (count || 0)
        }
      };
    } catch (error) {
      return handleApiError(error, 'Failed to fetch files');
    }
  }

  async getFile(fileId: string): Promise<ApiResponse<ArtworkFile | null>> {
    try {
      const user = await auth.getCurrentUser();
      if (!user) {
        return { success: false, error: 'Authentication required' };
      }

      const { data, error } = await supabase
        .from('artwork_files')
        .select('*')
        .eq('id', fileId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { success: true, data: null };
        }
        throw new Error(error.message);
      }

      // Add preview URL
      const { data: { publicUrl } } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(data.stored_filename);

      return {
        success: true,
        data: {
          ...data,
          preview_url: publicUrl
        }
      };
    } catch (error) {
      return handleApiError(error, 'Failed to fetch file');
    }
  }

  async updateFile(fileId: string, updates: FileUpdateRequest): Promise<ApiResponse<FileOperationResult>> {
    try {
      const user = await auth.getCurrentUser();
      if (!user) {
        return { success: false, error: 'Authentication required' };
      }

      const { data, error } = await supabase
        .from('artwork_files')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', fileId)
        .eq('user_id', user.id);

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        data: {
          success: true,
          message: 'File updated successfully'
        }
      };
    } catch (error) {
      return handleApiError(error, 'Failed to update file');
    }
  }

  async deleteFile(fileId: string): Promise<ApiResponse<FileOperationResult>> {
    try {
      const user = await auth.getCurrentUser();
      if (!user) {
        return { success: false, error: 'Authentication required' };
      }

      // Get file info first
      const { data: fileData, error: fetchError } = await supabase
        .from('artwork_files')
        .select('stored_filename')
        .eq('id', fileId)
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(this.bucketName)
        .remove([fileData.stored_filename]);

      if (storageError) {
        console.warn('Failed to delete file from storage:', storageError.message);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('artwork_files')
        .delete()
        .eq('id', fileId)
        .eq('user_id', user.id);

      if (dbError) {
        throw new Error(dbError.message);
      }

      return {
        success: true,
        data: {
          success: true,
          message: 'File deleted successfully'
        }
      };
    } catch (error) {
      return handleApiError(error, 'Failed to delete file');
    }
  }

  // File association operations
  async associateFileWithOrderJob(
    orderJobId: string, 
    request: FileAssociationRequest
  ): Promise<ApiResponse<FileOperationResult>> {
    try {
      const user = await auth.getCurrentUser();
      if (!user) {
        return { success: false, error: 'Authentication required' };
      }

      // Update the file record
      const { error } = await supabase
        .from('artwork_files')
        .update({
          order_job_id: orderJobId,
          updated_at: new Date().toISOString()
        })
        .eq('id', request.artwork_file_id)
        .eq('user_id', user.id);

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        data: {
          success: true,
          message: 'File associated with order job successfully'
        }
      };
    } catch (error) {
      return handleApiError(error, 'Failed to associate file with order job');
    }
  }

  async getFilesForOrderJob(orderJobId: string): Promise<ApiResponse<ArtworkFile[]>> {
    try {
      const user = await auth.getCurrentUser();
      if (!user) {
        return { success: false, error: 'Authentication required' };
      }

      const { data, error } = await supabase
        .from('artwork_files')
        .select('*')
        .eq('order_job_id', orderJobId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      // Add preview URLs
      const filesWithUrls = await Promise.all((data || []).map(async (file) => {
        const { data: { publicUrl } } = supabase.storage
          .from(this.bucketName)
          .getPublicUrl(file.stored_filename);
        
        return {
          ...file,
          preview_url: publicUrl
        };
      }));

      return {
        success: true,
        data: filesWithUrls
      };
    } catch (error) {
      return handleApiError(error, 'Failed to fetch files for order job');
    }
  }

  // Utility methods
  private async getImageDimensions(file: File): Promise<{ width: number; height: number; dpi?: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight,
          dpi: 150 // Default DPI - would need EXIF reading for actual DPI
        });
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  private async validateFileInBackground(fileId: string): Promise<void> {
    // This would run validation logic in the background
    // For now, we'll just mark it as valid after a delay
    setTimeout(async () => {
      try {
        await supabase
          .from('artwork_files')
          .update({
            validation_status: 'valid',
            updated_at: new Date().toISOString()
          })
          .eq('id', fileId);
      } catch (error) {
        console.error('Background validation failed:', error);
      }
    }, 2000);
  }

  // Get download URL for file
  async getDownloadUrl(fileId: string): Promise<ApiResponse<string>> {
    try {
      const user = await auth.getCurrentUser();
      if (!user) {
        return { success: false, error: 'Authentication required' };
      }

      const { data: fileData, error: fetchError } = await supabase
        .from('artwork_files')
        .select('stored_filename')
        .eq('id', fileId)
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .createSignedUrl(fileData.stored_filename, 3600); // 1 hour

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        data: data.signedUrl
      };
    } catch (error) {
      return handleApiError(error, 'Failed to get download URL');
    }
  }
}

export const filesApi = new FilesApi();