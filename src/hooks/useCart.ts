import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '@/api/cart';
import { useToast } from '@/hooks/use-toast';
import type { 
  CartState, 
  AddToCartRequest, 
  UpdateCartItemRequest,
  CartValidationResult 
} from '@/types/cart';

export const CART_QUERY_KEY = ['cart'];

export function useCart() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get cart data
  const {
    data: cart,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: () => cartApi.getCart().then(response => {
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false
  });

  // Add item to cart
  const addToCartMutation = useMutation({
    mutationFn: (request: AddToCartRequest) => cartApi.addItem(request),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
        toast({
          title: 'Added to Cart',
          description: 'Item has been added to your cart'
        });
      } else {
        toast({
          title: 'Error',
          description: response.error,
          variant: 'destructive'
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to add item to cart',
        variant: 'destructive'
      });
    }
  });

  // Update cart item
  const updateCartItemMutation = useMutation({
    mutationFn: ({ itemId, request }: { itemId: string; request: UpdateCartItemRequest }) =>
      cartApi.updateItem(itemId, request),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
        toast({
          title: 'Cart Updated',
          description: 'Item has been updated'
        });
      } else {
        toast({
          title: 'Error',
          description: response.error,
          variant: 'destructive'
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update cart item',
        variant: 'destructive'
      });
    }
  });

  // Remove item from cart
  const removeItemMutation = useMutation({
    mutationFn: (itemId: string) => cartApi.removeItem(itemId),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
        toast({
          title: 'Item Removed',
          description: 'Item has been removed from your cart'
        });
      } else {
        toast({
          title: 'Error',
          description: response.error,
          variant: 'destructive'
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to remove cart item',
        variant: 'destructive'
      });
    }
  });

  // Clear cart
  const clearCartMutation = useMutation({
    mutationFn: () => cartApi.clearCart(),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
        toast({
          title: 'Cart Cleared',
          description: 'All items have been removed from your cart'
        });
      } else {
        toast({
          title: 'Error',
          description: response.error,
          variant: 'destructive'
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to clear cart',
        variant: 'destructive'
      });
    }
  });

  // Validate cart
  const validateCartMutation = useMutation({
    mutationFn: () => cartApi.validateCart(),
    onSuccess: (response) => {
      if (!response.success) {
        toast({
          title: 'Validation Error',
          description: response.error,
          variant: 'destructive'
        });
      }
    }
  });

  return {
    // Data
    cart: cart || {
      items: [],
      total_items: 0,
      subtotal: 0,
      total_discount: 0,
      tax_amount: 0,
      shipping_cost: 0,
      total_amount: 0,
      session_id: '',
      created_at: '',
      updated_at: ''
    } as CartState,
    isLoading,
    error,

    // Actions
    addToCart: addToCartMutation.mutate,
    updateCartItem: updateCartItemMutation.mutate,
    removeItem: removeItemMutation.mutate,
    clearCart: clearCartMutation.mutate,
    validateCart: validateCartMutation.mutate,
    refetchCart: refetch,

    // Loading states
    isAddingToCart: addToCartMutation.isPending,
    isUpdatingItem: updateCartItemMutation.isPending,
    isRemovingItem: removeItemMutation.isPending,
    isClearingCart: clearCartMutation.isPending,
    isValidating: validateCartMutation.isPending,

    // Computed values
    hasItems: (cart?.items.length || 0) > 0,
    itemCount: cart?.total_items || 0,
    isEmpty: (cart?.items.length || 0) === 0
  };
}

export function useCartValidation() {
  const { data: validationResult, refetch } = useQuery({
    queryKey: [...CART_QUERY_KEY, 'validation'],
    queryFn: () => cartApi.validateCart().then(response => {
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    }),
    enabled: false // Only run when explicitly called
  });

  return {
    validationResult,
    validateCart: refetch
  };
}