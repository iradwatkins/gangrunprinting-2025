import { useState } from 'react';
import { ChevronLeft, ChevronRight, Package, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ProductImageGalleryProps {
  images: string[];
  productName?: string;
}

export function ProductImageGallery({ images, productName = 'Product' }: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  // Placeholder images if none provided
  const displayImages = images.length > 0 ? images : [
    '/placeholder-product-1.jpg',
    '/placeholder-product-2.jpg',
    '/placeholder-product-3.jpg',
  ];

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % displayImages.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  const PlaceholderImage = ({ className }: { className?: string }) => (
    <div className={`bg-muted flex items-center justify-center ${className}`}>
      <Package className="h-16 w-16 text-muted-foreground" />
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <Card className="overflow-hidden">
        <div className="relative aspect-square bg-muted">
          {images.length > 0 ? (
            <img
              src={displayImages[selectedImage]}
              alt={`${productName} - Image ${selectedImage + 1}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <PlaceholderImage className="w-full h-full" />
          )}

          {/* Navigation Arrows */}
          {displayImages.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 opacity-75 hover:opacity-100"
                onClick={prevImage}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-75 hover:opacity-100"
                onClick={nextImage}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Zoom Button */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-2 right-2 opacity-75 hover:opacity-100"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <div className="relative">
                {images.length > 0 ? (
                  <img
                    src={displayImages[selectedImage]}
                    alt={`${productName} - Large view`}
                    className="w-full h-auto max-h-[80vh] object-contain"
                  />
                ) : (
                  <PlaceholderImage className="w-full h-96" />
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Image Counter */}
          {displayImages.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-1 rounded">
              {selectedImage + 1} / {displayImages.length}
            </div>
          )}
        </div>
      </Card>

      {/* Thumbnail Grid */}
      {displayImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {displayImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`relative aspect-square rounded-md overflow-hidden border-2 transition-colors ${
                selectedImage === index
                  ? 'border-primary'
                  : 'border-transparent hover:border-muted-foreground'
              }`}
            >
              {images.length > 0 ? (
                <img
                  src={image}
                  alt={`${productName} thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <PlaceholderImage className="w-full h-full" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Image Info */}
      <div className="text-xs text-muted-foreground text-center">
        Click on image to zoom • {displayImages.length} image{displayImages.length !== 1 ? 's' : ''} available
      </div>
    </div>
  );
}