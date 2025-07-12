import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  OrderHistoryItem, 
  OrderDetail, 
  OrderFilter, 
  OrderSummary, 
  ReorderValidation 
} from '@/types/orders';

export function useOrders(filter?: OrderFilter, page = 1, pageSize = 10) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['orders', user?.id, filter, page, pageSize],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          reference_number,
          status,
          total_amount,
          created_at,
          updated_at,
          user_profiles (
            email,
            first_name,
            last_name
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (error) throw error;
      return {
        orders: data || [],
        totalCount: data?.length || 0,
        currentPage: page,
        hasMore: (data?.length || 0) === pageSize
      };
    },
    enabled: !!user,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
    retry: 1
  });
}

export function useOrderDetail(orderId: string) {
  return useQuery({
    queryKey: ['order-detail', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          user_profiles (
            email,
            first_name,
            last_name
          ),
          order_items (
            *,
            products (
              name,
              category
            )
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!orderId,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
    retry: 1
  });
}

export function useOrderSummary() {
  const { user } = useAuth();
  
  const { data: summary, isLoading: loading, error } = useQuery({
    queryKey: ['order-summary'],
    queryFn: async () => {
      // Get basic order statistics
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, total_amount, status, created_at');

      if (ordersError) {
        throw new Error(ordersError.message);
      }

      if (!orders) {
        return {
          total_orders: 0,
          total_amount: 0,
          pending_orders: 0,
          completed_orders: 0,
          processing_orders: 0
        } as OrderSummary;
      }

      const summary: OrderSummary = {
        total_orders: orders.length,
        total_amount: orders.reduce((sum, order) => sum + (order.total_amount || 0), 0),
        pending_orders: orders.filter(o => o.status === 'pending').length,
        completed_orders: orders.filter(o => o.status === 'completed').length,
        processing_orders: orders.filter(o => o.status === 'processing').length
      };

      return summary;
    },
    enabled: !!user,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
    retry: 1
  });

  return {
    summary,
    loading,
    error: error?.message || null
  };
}

export function useOrderSearch() {
  const [searchResults, setSearchResults] = useState<OrderHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchOrders = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          reference_number,
          status,
          total_amount,
          created_at,
          updated_at,
          user_profiles (
            email,
            first_name,
            last_name
          )
        `)
        .or(`reference_number.ilike.%${searchTerm}%,user_profiles.email.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      const results = data || [];
      setSearchResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search orders');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchResults([]);
    setError(null);
  };

  return {
    searchResults,
    loading,
    error,
    searchOrders,
    clearSearch
  };
}

export function useReorder() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateReorder = async (orderId: string): Promise<ReorderValidation> => {
    try {
      setLoading(true);
      setError(null);
      // Simple validation - check if order exists and has items
      const { data: order, error } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          order_items (
            id,
            product_id,
            quantity
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      
      return {
        canReorder: order && order.order_items && order.order_items.length > 0,
        issues: order?.order_items?.length === 0 ? ['No items found in order'] : []
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to validate reorder';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const reorder = async (orderId: string, selectedJobIds?: string[]): Promise<string> => {
    try {
      setLoading(true);
      setError(null);
      // Create a new order based on the existing one
      const { data: originalOrder, error: fetchError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('id', orderId)
        .single();

      if (fetchError) throw fetchError;

      // Create new order
      const { data: newOrder, error: createError } = await supabase
        .from('orders')
        .insert({
          user_id: originalOrder.user_id,
          status: 'pending',
          total_amount: originalOrder.total_amount,
          reference_number: `REORDER-${Date.now()}`
        })
        .select()
        .single();

      if (createError) throw createError;

      // Copy order items
      const itemsToReorder = selectedJobIds 
        ? originalOrder.order_items.filter((item: any) => selectedJobIds.includes(item.id))
        : originalOrder.order_items;

      if (itemsToReorder.length > 0) {
        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(itemsToReorder.map((item: any) => ({
            order_id: newOrder.id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            configuration: item.configuration
          })));

        if (itemsError) throw itemsError;
      }

      return newOrder.id;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create reorder';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    validateReorder,
    reorder
  };
}