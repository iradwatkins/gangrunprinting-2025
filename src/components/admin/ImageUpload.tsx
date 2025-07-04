import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ImageUploadProps {
  onUpload: (url: string) => void;
  currentImage?: string;
  bucket?: string;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
}

export function ImageUpload({ 
  onUpload, 
  currentImage, 
  bucket = 'product-images',
  maxSize = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp']
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      return `File type not supported. Please use: ${acceptedTypes.map(type => type.split('/')[1]).join(', ')}`;
    }

    // Check file size
    const maxBytes = maxSize * 1024 * 1024;
    if (file.size > maxBytes) {
      return `File size too large. Maximum size: ${maxSize}MB`;
    }

    return null;
  };

  const generateFileName = (file: File): string => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    const extension = file.name.split('.').pop();
    return `${timestamp}-${random}.${extension}`;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const error = validateFile(file);
    if (error) {
      toast({
        title: 'Invalid file',
        description: error,
        variant: 'destructive'
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    setProgress(0);

    try {
      const fileName = generateFileName(file);
      const filePath = `products/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      onUpload(publicUrl);
      
      toast({
        title: 'Success',
        description: 'Image uploaded successfully'
      });

    } catch (error: any) {
      console.error('Upload error:', error);
      setPreview(currentImage || null);
      
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload image',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onUpload('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {preview ? (
        <Card>
          <CardContent className="p-4">
            <div className="relative group">
              <img
                src={preview}
                alt="Product preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              
              {uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                  <div className="text-center text-white">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <Progress value={progress} className="w-32 mb-2" />
                    <p className="text-sm">Uploading...</p>
                  </div>
                </div>
              )}

              {!uploading && (
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                  <div className="flex space-x-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleClick}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Replace
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleRemove}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8">
            <div 
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
              onClick={handleClick}
            >
              <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Upload Product Image</p>
              <p className="text-sm text-muted-foreground">
                Click to select an image file
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Supported formats: {acceptedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')}
                <br />
                Maximum size: {maxSize}MB
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}