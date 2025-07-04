import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';
import { ApiResponse, handleApiError } from '@/lib/errors';
import { 
  CartItem, 
  CartState, 
  CartTotals, 
  AddToCartRequest, 
  UpdateCartItemRequest, 
  CartValidationResult,
  CartSyncRequest 
} from '@/types/cart';
import { v4 as uuidv4 } from 'uuid';

class CartApi {
  private getSessionId(): string {
    let sessionId = localStorage.getItem('cart_session_id');
    if (!sessionId) {
      sessionId = uuidv4();
      localStorage.setItem('cart_session_id', sessionId);
    }
    return sessionId;
  }

  private calculateItemPrice(item: Omit<CartItem, 'total_price' | 'price_breakdown'>): {
    unit_price: number;
    total_price: number;
    price_breakdown: CartItem['price_breakdown'];
  } {
    const basePrice = item.unit_price || 0;
    const quantity = item.quantity;

    // Mock price calculation - in real implementation, this would call the pricing API
    const paperCost = Math.random() * 5;
    const sizeModifier = Math.random() * 2;
    const turnaroundModifier = Math.random() * 10;
    const addOnCosts = item.configuration.add_on_ids.length * Math.random() * 15;

    const subtotal = (basePrice + paperCost + sizeModifier + turnaroundModifier + addOnCosts) * quantity;

    // Quantity discounts
    let quantityDiscountPercent = 0;
    if (quantity >= 1000) quantityDiscountPercent = 15;
    else if (quantity >= 500) quantityDiscountPercent = 10;
    else if (quantity >= 250) quantityDiscountPercent = 5;

    const quantityDiscount = subtotal * (quantityDiscountPercent / 100);

    // Broker discount (placeholder - would check user status)
    const brokerDiscountPercent = 0; // Would check user.is_broker
    const afterQuantityDiscount = subtotal - quantityDiscount;
    const brokerDiscount = afterQuantityDiscount * (brokerDiscountPercent / 100);

    const finalTotal = afterQuantityDiscount - brokerDiscount;
    const unitPrice = finalTotal / quantity;
    const savings = subtotal - finalTotal;

    return {
      unit_price: unitPrice,
      total_price: finalTotal,
      price_breakdown: {
        base_price: basePrice,
        paper_cost: paperCost,
        size_modifier: sizeModifier,
        turnaround_modifier: turnaroundModifier,
        add_on_costs: addOnCosts,
        subtotal,
        quantity_discount: quantityDiscount,
        broker_discount: brokerDiscount,
        savings
      }
    };
  }

  private calculateCartTotals(items: CartItem[]): CartTotals {
    const subtotal = items.reduce((sum, item) => sum + item.price_breakdown.subtotal, 0);
    const total_discount = items.reduce((sum, item) => 
      sum + item.price_breakdown.quantity_discount + item.price_breakdown.broker_discount, 0
    );
    const total_savings = items.reduce((sum, item) => sum + item.price_breakdown.savings, 0);
    const total_amount = items.reduce((sum, item) => sum + item.total_price, 0);
    const total_items = items.reduce((sum, item) => sum + item.quantity, 0);

    // Mock tax and shipping calculation
    const tax_amount = total_amount * 0.08; // 8% tax
    const shipping_cost = total_amount > 100 ? 0 : 15; // Free shipping over $100

    return {
      subtotal,
      total_discount,
      tax_amount,
      shipping_cost,
      total_amount: total_amount + tax_amount + shipping_cost,
      total_items,
      total_savings
    };
  }

  async getCart(): Promise<ApiResponse<CartState>> {
    try {
      const user = await getCurrentUser();
      const sessionId = this.getSessionId();

      // Try to get cart from localStorage first for immediate response
      const localCart = localStorage.getItem('cart_items');
      const localItems: CartItem[] = localCart ? JSON.parse(localCart) : [];

      if (user) {
        // For authenticated users, sync with server
        // In a real implementation, this would query the database
        // For now, we'll use localStorage as the source of truth
      }

      const totals = this.calculateCartTotals(localItems);
      const now = new Date().toISOString();

      const cartState: CartState = {
        items: localItems,
        ...totals,
        user_id: user?.id,
        session_id: sessionId,
        created_at: localStorage.getItem('cart_created_at') || now,
        updated_at: now
      };

      return { success: true, data: cartState };
    } catch (error) {
      return handleApiError(error, 'Failed to load cart');
    }
  }

  async addItem(request: AddToCartRequest): Promise<ApiResponse<CartItem>> {
    try {
      // Get product details to build cart item
      const { data: product, error: productError } = await supabase
        .from('products')
        .select(`
          id,
          name,
          slug,
          base_price,
          minimum_quantity,
          product_images(image_url)
        `)
        .eq('id', request.product_id)
        .single();

      if (productError || !product) {
        return { success: false, error: 'Product not found' };
      }

      const now = new Date().toISOString();
      const cartItemId = uuidv4();

      // Build cart item
      const baseItem: Omit<CartItem, 'total_price' | 'price_breakdown' | 'unit_price'> = {
        id: cartItemId,
        product_id: request.product_id,
        product_name: product.name,
        product_slug: product.slug,
        product_image: product.product_images?.[0]?.image_url,
        quantity: Math.max(request.quantity, product.minimum_quantity),
        configuration: request.configuration,
        configuration_display: {
          paper_stock_name: '', // Would be populated from related tables
          print_size_name: '',
          turnaround_time_name: '',
          add_on_names: []
        },
        minimum_quantity: product.minimum_quantity,
        added_at: now,
        updated_at: now,
        unit_price: product.base_price
      };

      // Calculate pricing
      const pricing = this.calculateItemPrice(baseItem);
      
      const cartItem: CartItem = {
        ...baseItem,
        ...pricing
      };

      // Get existing cart
      const cartResponse = await this.getCart();
      if (!cartResponse.success) {
        return { success: false, error: 'Failed to load existing cart' };
      }

      const existingItems = cartResponse.data.items;
      
      // Check if item with same configuration already exists
      const existingItemIndex = existingItems.findIndex(item => 
        item.product_id === request.product_id &&
        JSON.stringify(item.configuration) === JSON.stringify(request.configuration)
      );

      let updatedItems: CartItem[];
      
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        const existingItem = existingItems[existingItemIndex];
        const newQuantity = existingItem.quantity + request.quantity;
        const updatedItem = {
          ...existingItem,
          quantity: newQuantity,
          updated_at: now,
          ...this.calculateItemPrice({...existingItem, quantity: newQuantity})
        };
        
        updatedItems = [
          ...existingItems.slice(0, existingItemIndex),
          updatedItem,
          ...existingItems.slice(existingItemIndex + 1)
        ];
      } else {
        // Add new item
        updatedItems = [...existingItems, cartItem];
      }

      // Save to localStorage
      localStorage.setItem('cart_items', JSON.stringify(updatedItems));
      if (!localStorage.getItem('cart_created_at')) {
        localStorage.setItem('cart_created_at', now);
      }

      return { success: true, data: cartItem };
    } catch (error) {
      return handleApiError(error, 'Failed to add item to cart');
    }
  }

  async updateItem(itemId: string, request: UpdateCartItemRequest): Promise<ApiResponse<CartItem>> {
    try {
      const cartResponse = await this.getCart();
      if (!cartResponse.success) {
        return { success: false, error: 'Failed to load cart' };
      }

      const items = cartResponse.data.items;
      const itemIndex = items.findIndex(item => item.id === itemId);
      
      if (itemIndex === -1) {
        return { success: false, error: 'Cart item not found' };
      }

      const existingItem = items[itemIndex];
      const now = new Date().toISOString();

      // Update item
      const updatedItem = {
        ...existingItem,
        ...(request.quantity && { quantity: Math.max(request.quantity, existingItem.minimum_quantity) }),
        ...(request.configuration && { configuration: request.configuration }),
        updated_at: now
      };

      // Recalculate pricing
      const pricing = this.calculateItemPrice(updatedItem);
      const finalItem = { ...updatedItem, ...pricing };

      const updatedItems = [
        ...items.slice(0, itemIndex),
        finalItem,
        ...items.slice(itemIndex + 1)
      ];

      // Save to localStorage
      localStorage.setItem('cart_items', JSON.stringify(updatedItems));

      return { success: true, data: finalItem };
    } catch (error) {
      return handleApiError(error, 'Failed to update cart item');
    }
  }

  async removeItem(itemId: string): Promise<ApiResponse<void>> {
    try {
      const cartResponse = await this.getCart();
      if (!cartResponse.success) {
        return { success: false, error: 'Failed to load cart' };
      }

      const items = cartResponse.data.items;
      const updatedItems = items.filter(item => item.id !== itemId);

      // Save to localStorage
      localStorage.setItem('cart_items', JSON.stringify(updatedItems));

      return { success: true };
    } catch (error) {
      return handleApiError(error, 'Failed to remove cart item');
    }
  }

  async clearCart(): Promise<ApiResponse<void>> {
    try {
      localStorage.removeItem('cart_items');
      localStorage.removeItem('cart_created_at');
      return { success: true };
    } catch (error) {
      return handleApiError(error, 'Failed to clear cart');
    }
  }

  async validateCart(): Promise<ApiResponse<CartValidationResult>> {
    try {
      const cartResponse = await this.getCart();
      if (!cartResponse.success) {
        return { success: false, error: 'Failed to load cart' };
      }

      const items = cartResponse.data.items;
      const errors: { itemId: string; errors: string[] }[] = [];
      const warnings: { itemId: string; warnings: string[] }[] = [];

      // Validate each item
      for (const item of items) {
        const itemErrors: string[] = [];
        const itemWarnings: string[] = [];

        // Check minimum quantity
        if (item.quantity < item.minimum_quantity) {
          itemErrors.push(`Minimum quantity is ${item.minimum_quantity}`);
        }

        // Check if product is still active (would query database)
        // For now, we'll add mock validation

        if (itemErrors.length > 0) {
          errors.push({ itemId: item.id, errors: itemErrors });
        }

        if (itemWarnings.length > 0) {
          warnings.push({ itemId: item.id, warnings: itemWarnings });
        }
      }

      const result: CartValidationResult = {
        isValid: errors.length === 0,
        errors,
        warnings
      };

      return { success: true, data: result };
    } catch (error) {
      return handleApiError(error, 'Failed to validate cart');
    }
  }

  async syncCart(request: CartSyncRequest): Promise<ApiResponse<CartState>> {
    try {
      // Get guest cart from localStorage
      const guestCart = localStorage.getItem('cart_items');
      const guestItems: CartItem[] = guestCart ? JSON.parse(guestCart) : [];

      if (guestItems.length === 0) {
        return this.getCart();
      }

      // In a real implementation, this would:
      // 1. Load user's existing cart from database
      // 2. Merge with guest cart (handle duplicates)
      // 3. Save merged cart to database
      // 4. Clear guest cart from localStorage

      // For now, we'll just keep the guest cart and mark it as user cart
      const now = new Date().toISOString();
      
      // Update each item to associate with user
      const updatedItems = guestItems.map(item => ({
        ...item,
        updated_at: now
      }));

      // Save updated cart
      localStorage.setItem('cart_items', JSON.stringify(updatedItems));

      return this.getCart();
    } catch (error) {
      return handleApiError(error, 'Failed to sync cart');
    }
  }
}

export const cartApi = new CartApi();