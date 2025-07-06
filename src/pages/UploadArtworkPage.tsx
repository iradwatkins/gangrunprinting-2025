import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUploadZone } from '@/components/files/FileUploadZone';
import { Header } from '@/components/Header';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/contexts/AuthContext';
import { filesApi } from '@/api/files';
import { Upload, ArrowRight, Skip } from 'lucide-react';
import { toast } from 'sonner';
import type { ArtworkFile } from '@/types/files';

export default function UploadArtworkPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { cart } = useCart();
  const { user } = useAuth();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<ArtworkFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [currentCartItem, setCurrentCartItem] = useState(null);

  // Get the last added cart item or from search params
  useEffect(() => {
    const cartItemId = searchParams.get('item');
    if (cartItemId && cart?.items) {
      const item = cart.items.find(item => item.id === cartItemId);
      setCurrentCartItem(item || cart.items[cart.items.length - 1]);
    } else if (cart?.items && cart.items.length > 0) {
      // Use the most recently added item
      setCurrentCartItem(cart.items[cart.items.length - 1]);
    }
  }, [cart, searchParams]);

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleFileRemoved = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one file to upload');
      return;
    }

    setIsUploading(true);
    try {
      const uploads = await Promise.all(
        selectedFiles.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('user_id', user?.id || '');
          formData.append('cart_item_id', currentCartItem?.id || '');
          formData.append('product_type', currentCartItem?.product_name || 'general');

          const response = await filesApi.uploadFile(formData);
          if (response.success) {
            return response.data;
          } else {
            throw new Error(response.error);
          }
        })
      );

      setUploadedFiles(uploads);
      toast.success(`Successfully uploaded ${uploads.length} file${uploads.length > 1 ? 's' : ''}`);
      
      // Store uploaded file IDs in localStorage for checkout
      const existingFileIds = JSON.parse(localStorage.getItem('cart_uploaded_files') || '{}');
      existingFileIds[currentCartItem?.id || 'general'] = uploads.map(f => f.id);
      localStorage.setItem('cart_uploaded_files', JSON.stringify(existingFileIds));

    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload files. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSkip = () => {
    navigate('/checkout');
  };

  const handleContinueToCheckout = () => {
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Step 1: Add to Cart</span>
              <span className="font-medium text-blue-600">Step 2: Upload Artwork</span>
              <span>Step 3: Checkout</span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '50%' }}></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upload Section */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Upload Your Artwork
                  </CardTitle>
                  <CardDescription>
                    Upload your design files for printing. You can upload multiple files or skip this step and upload later.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUploadZone
                    productType={currentCartItem?.product_name?.toLowerCase() || 'default'}
                    onFilesSelected={handleFilesSelected}
                    onFileRemoved={handleFileRemoved}
                    disabled={isUploading}
                  />

                  {selectedFiles.length > 0 && (
                    <div className="mt-6 flex gap-4">
                      <Button
                        onClick={handleUpload}
                        disabled={isUploading}
                        className="flex items-center gap-2"
                      >
                        {isUploading ? 'Uploading...' : 'Upload Files'}
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  {uploadedFiles.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium text-green-700 mb-3">
                        ✅ Files uploaded successfully!
                      </h4>
                      <div className="space-y-2">
                        {uploadedFiles.map((file) => (
                          <div key={file.id} className="text-sm text-gray-600 bg-green-50 p-2 rounded">
                            📄 {file.original_name} ({Math.round(file.file_size / 1024)} KB)
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Order Item</CardTitle>
                </CardHeader>
                <CardContent>
                  {currentCartItem ? (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium">{currentCartItem.product_name}</h4>
                        <p className="text-sm text-gray-600">Quantity: {currentCartItem.quantity}</p>
                        <p className="text-lg font-bold text-green-600">
                          ${currentCartItem.total_price.toFixed(2)}
                        </p>
                      </div>
                      
                      {currentCartItem.configuration_display && (
                        <div className="text-sm space-y-1">
                          <h5 className="font-medium">Configuration:</h5>
                          {currentCartItem.configuration_display.paper_stock_name && (
                            <p>Paper: {currentCartItem.configuration_display.paper_stock_name}</p>
                          )}
                          {currentCartItem.configuration_display.print_size_name && (
                            <p>Size: {currentCartItem.configuration_display.print_size_name}</p>
                          )}
                          {currentCartItem.configuration_display.turnaround_time_name && (
                            <p>Turnaround: {currentCartItem.configuration_display.turnaround_time_name}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500">No cart item found</p>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                {uploadedFiles.length > 0 ? (
                  <Button 
                    onClick={handleContinueToCheckout} 
                    className="w-full"
                    size="lg"
                  >
                    Continue to Checkout
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={handleSkip} 
                      variant="outline" 
                      className="w-full"
                      size="lg"
                    >
                      <Skip className="mr-2 w-4 h-4" />
                      Skip - Upload Later
                    </Button>
                    <p className="text-xs text-center text-gray-500">
                      You can upload files later from your account
                    </p>
                  </>
                )}
              </div>

              {/* Info Card */}
              <Card className="mt-6 bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <h4 className="font-medium text-blue-900 mb-2">💡 Need Help?</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• You can always upload files later</li>
                    <li>• Orders without files will be put on hold</li>
                    <li>• We'll email you if we need your artwork</li>
                    <li>• Need design help? We offer design services!</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}