import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { OrdersAPI } from '@/api/orders';
import { 
  OrderHistoryItem, 
  OrderDetail, 
  OrderFilter, 
  OrderSummary, 
  ReorderValidation 
} from '@/types/orders';

export function useOrders(filter?: OrderFilter, page = 1, pageSize = 10) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(page);

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await OrdersAPI.getOrders(filter, currentPage, pageSize);
        setOrders(result.data);
        setTotalCount(result.count);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, filter, currentPage, pageSize]);

  const refetch = () => {
    if (user) {
      setCurrentPage(1);
    }
  };

  const loadMore = () => {
    if (orders.length < totalCount) {
      setCurrentPage(prev => prev + 1);
    }
  };

  return {
    orders,
    loading,
    error,
    totalCount,
    currentPage,
    hasMore: orders.length < totalCount,
    refetch,
    loadMore,
    setCurrentPage
  };
}

export function useOrderDetail(orderId: string) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        const orderDetail = await OrdersAPI.getOrderById(orderId);
        setOrder(orderDetail);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const updateNotes = async (notes: string) => {
    if (!orderId) return;
    
    try {
      await OrdersAPI.updateOrderNotes(orderId, notes);
      setOrder(prev => prev ? { ...prev, notes } : null);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update notes');
    }
  };

  return {
    order,
    loading,
    error,
    updateNotes
  };
}

export function useOrderSummary() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<OrderSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError(null);
        const orderSummary = await OrdersAPI.getOrderSummary();
        setSummary(orderSummary);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch order summary');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [user]);

  return {
    summary,
    loading,
    error
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
      const results = await OrdersAPI.searchOrders(searchTerm);
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
      return await OrdersAPI.validateReorder(orderId);
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
      return await OrdersAPI.reorder(orderId, selectedJobIds);
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