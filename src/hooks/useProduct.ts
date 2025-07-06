import { useState, useEffect } from 'react';
import { productsApi } from '@/api/products';
import type { Tables } from '@/integrations/supabase/types';

type Product = Tables<'products'>;

interface UseProductResult {
  product: Product | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProduct(slug: string): UseProductResult {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = async () => {
    if (!slug) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await productsApi.getProductBySlug(slug);
      
      if (response.error) {
        setError(response.error);
        setProduct(null);
      } else {
        setProduct(response.data || null);
      }
    } catch (err) {
      setError('Failed to load product');
      setProduct(null);
    }
    
    setLoading(false);
  };

  const refetch = async () => {
    await fetchProduct();
  };

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  return {
    product,
    loading,
    error,
    refetch
  };
}