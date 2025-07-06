import { supabase } from '@/integrations/supabase/client';

export interface ProductImage {
  url: string;
  alt: string;
  isPlaceholder: boolean;
}

/**
 * Convert product image data to usable URLs
 */
export function getProductImageUrls(images?: string | string[] | null, productName = 'Product'): ProductImage[] {
  if (!images) {
    return [];
  }

  // Handle string (single image) or array (multiple images)
  const imageArray = Array.isArray(images) ? images : [images];
  
  return imageArray
    .filter(Boolean) // Remove empty/null values
    .map((imagePath, index) => ({
      url: getPublicImageUrl(imagePath),
      alt: `${productName} - Image ${index + 1}`,
      isPlaceholder: false
    }));
}

/**
 * Get public URL for a storage path
 */
export function getPublicImageUrl(imagePath: string, bucket = 'product-images'): string {
  // If it's already a full URL, return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // If it's a placeholder path, return as-is
  if (imagePath.startsWith('/placeholder') || imagePath.includes('placeholder')) {
    return imagePath;
  }

  // Get public URL from Supabase Storage
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(imagePath);

  return data.publicUrl;
}

/**
 * Get fallback placeholder images for products
 */
export function getPlaceholderImages(productName = 'Product'): ProductImage[] {
  return [
    {
      url: '/placeholder.svg',
      alt: `${productName} - Placeholder image`,
      isPlaceholder: true
    }
  ];
}

/**
 * Handle image loading errors with fallback
 */
export function createImageWithFallback(src: string, fallbackSrc = '/placeholder.svg'): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = () => resolve(fallbackSrc);
    img.src = src;
  });
}

/**
 * Validate if an image URL is accessible
 */
export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok && response.headers.get('content-type')?.startsWith('image/') === true;
  } catch {
    return false;
  }
}