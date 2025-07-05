import { supabase } from '@/integrations/supabase/client';
import { 
  OrderHistoryItem, 
  OrderDetail, 
  OrderFilter, 
  OrderSummary, 
  ReorderValidation 
} from '@/types/orders';

export class OrdersAPI {
  static async getOrders(filter?: OrderFilter, page = 1, pageSize = 10): Promise<{
    data: OrderHistoryItem[];
    count: number;
    page: number;
    pageSize: number;
  }> {
    let query = supabase
      .from('orders')
      .select(`
        id,
        reference_number,
        status,
        total_amount,
        created_at,
        updated_at,
        order_jobs (
          id,
          product:products (
            id,
            name
          ),
          tracking_number,
          estimated_delivery
        )
      `)
      .order('created_at', { ascending: false });

    if (filter?.date_range) {
      query = query
        .gte('created_at', filter.date_range.start)
        .lte('created_at', filter.date_range.end);
    }

    if (filter?.status && filter.status.length > 0) {
      query = query.in('status', filter.status);
    }

    if (filter?.min_amount) {
      query = query.gte('total_amount', filter.min_amount);
    }

    if (filter?.max_amount) {
      query = query.lte('total_amount', filter.max_amount);
    }

    if (filter?.search_term) {
      query = query.or(`reference_number.ilike.%${filter.search_term}%`);
    }

    const { data, error, count } = await query
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) throw error;

    const orders: OrderHistoryItem[] = data?.map(order => ({
      id: order.id,
      reference_number: order.reference_number,
      status: order.status,
      total_amount: order.total_amount,
      created_at: order.created_at,
      updated_at: order.updated_at,
      job_count: order.order_jobs?.length || 0,
      product_names: order.order_jobs?.map(job => job.product?.name).filter(Boolean) || [],
      estimated_delivery: order.order_jobs?.find(job => job.estimated_delivery)?.estimated_delivery,
      tracking_numbers: order.order_jobs?.map(job => job.tracking_number).filter(Boolean) || []
    })) || [];

    return {
      data: orders,
      count: count || 0,
      page,
      pageSize
    };
  }

  static async getOrderById(id: string): Promise<OrderDetail> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        reference_number,
        status,
        subtotal,
        tax_amount,
        shipping_cost,
        total_amount,
        shipping_address,
        billing_address,
        payment_method,
        payment_status,
        created_at,
        updated_at,
        notes,
        special_instructions,
        order_jobs (
          id,
          quantity,
          unit_price,
          total_price,
          configuration,
          status,
          tracking_number,
          estimated_delivery,
          actual_delivery,
          artwork_files,
          product:products (
            id,
            name,
            description,
            category_id,
            base_price,
            slug
          ),
          vendor:vendors (
            id,
            name,
            email,
            phone,
            address
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Order not found');

    const statusHistory = await this.getOrderStatusHistory(id);

    const orderDetail: OrderDetail = {
      id: data.id,
      reference_number: data.reference_number,
      status: data.status,
      subtotal: data.subtotal,
      tax_amount: data.tax_amount,
      shipping_cost: data.shipping_cost,
      total_amount: data.total_amount,
      shipping_address: data.shipping_address as any,
      billing_address: data.billing_address as any,
      payment_method: data.payment_method || '',
      payment_status: data.payment_status || '',
      created_at: data.created_at,
      updated_at: data.updated_at,
      notes: data.notes || undefined,
      special_instructions: data.special_instructions || undefined,
      order_jobs: data.order_jobs?.map(job => ({
        id: job.id,
        product: job.product as any,
        quantity: job.quantity,
        unit_price: job.unit_price,
        total_price: job.total_price,
        configuration: job.configuration as any,
        configuration_display: this.generateConfigurationDisplay(job.configuration as any),
        status: job.status,
        vendor: job.vendor as any,
        tracking_number: job.tracking_number || undefined,
        estimated_delivery: job.estimated_delivery || undefined,
        actual_delivery: job.actual_delivery || undefined,
        artwork_files: job.artwork_files ? (job.artwork_files as any) : []
      })) || [],
      status_history: statusHistory
    };

    return orderDetail;
  }

  static async getOrderStatusHistory(orderId: string) {
    const { data, error } = await supabase
      .from('order_status_history')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async searchOrders(searchTerm: string): Promise<OrderHistoryItem[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        reference_number,
        status,
        total_amount,
        created_at,
        updated_at,
        order_jobs (
          id,
          product:products (
            id,
            name
          ),
          tracking_number,
          estimated_delivery
        )
      `)
      .or(`reference_number.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    return data?.map(order => ({
      id: order.id,
      reference_number: order.reference_number,
      status: order.status,
      total_amount: order.total_amount,
      created_at: order.created_at,
      updated_at: order.updated_at,
      job_count: order.order_jobs?.length || 0,
      product_names: order.order_jobs?.map(job => job.product?.name).filter(Boolean) || [],
      estimated_delivery: order.order_jobs?.find(job => job.estimated_delivery)?.estimated_delivery,
      tracking_numbers: order.order_jobs?.map(job => job.tracking_number).filter(Boolean) || []
    })) || [];
  }

  static async getOrderSummary(): Promise<OrderSummary> {
    const { data, error } = await supabase
      .from('orders')
      .select('status, total_amount');

    if (error) throw error;

    const summary: OrderSummary = {
      total_orders: data?.length || 0,
      total_amount: data?.reduce((sum, order) => sum + order.total_amount, 0) || 0,
      pending_orders: data?.filter(order => order.status === 'pending_payment').length || 0,
      in_production_orders: data?.filter(order => order.status === 'in_production').length || 0,
      shipped_orders: data?.filter(order => order.status === 'shipped').length || 0,
      delivered_orders: data?.filter(order => order.status === 'delivered').length || 0
    };

    return summary;
  }

  static async validateReorder(orderId: string): Promise<ReorderValidation> {
    const order = await this.getOrderById(orderId);
    
    const validation: ReorderValidation = {
      is_valid: true,
      unavailable_products: [],
      modified_prices: [],
      warnings: []
    };

    for (const job of order.order_jobs) {
      const { data: currentProduct, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', job.product.id)
        .single();

      if (error || !currentProduct || !currentProduct.is_active) {
        validation.is_valid = false;
        validation.unavailable_products.push(job.product.name);
        continue;
      }

      if (currentProduct.base_price !== job.product.base_price) {
        validation.modified_prices.push({
          product_id: job.product.id,
          old_price: job.product.base_price,
          new_price: currentProduct.base_price
        });
      }
    }

    if (validation.modified_prices.length > 0) {
      validation.warnings.push('Some product prices have changed since your original order');
    }

    return validation;
  }

  static async reorder(orderId: string, selectedJobIds?: string[]): Promise<string> {
    const order = await this.getOrderById(orderId);
    
    let jobsToReorder = order.order_jobs;
    if (selectedJobIds) {
      jobsToReorder = order.order_jobs.filter(job => selectedJobIds.includes(job.id));
    }

    const { data: newOrder, error } = await supabase
      .from('orders')
      .insert({
        user_id: order.id,
        reference_number: `RO-${Date.now()}`,
        status: 'draft',
        shipping_address: order.shipping_address,
        billing_address: order.billing_address,
        subtotal: 0,
        tax_amount: 0,
        shipping_cost: 0,
        total_amount: 0,
        notes: `Reorder from ${order.reference_number}`
      })
      .select()
      .single();

    if (error) throw error;

    for (const job of jobsToReorder) {
      await supabase
        .from('order_jobs')
        .insert({
          order_id: newOrder.id,
          product_id: job.product.id,
          quantity: job.quantity,
          unit_price: job.unit_price,
          total_price: job.total_price,
          configuration: job.configuration,
          status: 'pending'
        });
    }

    return newOrder.id;
  }

  static async updateOrderNotes(orderId: string, notes: string): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .update({ notes })
      .eq('id', orderId);

    if (error) throw error;
  }

  static generateConfigurationDisplay(configuration: any): any {
    if (!configuration) return {};

    return {
      size: configuration.print_size?.name || 'N/A',
      paper: configuration.paper_stock?.name || 'N/A',
      coating: configuration.coating?.name,
      turnaround: configuration.turnaround_time?.name || 'N/A',
      add_ons: configuration.add_ons?.map((addon: any) => addon.name) || []
    };
  }
}