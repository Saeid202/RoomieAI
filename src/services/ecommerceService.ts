import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product?: any;
}

export interface Order {
  id: string;
  order_number: string;
  status: string;
  subtotal: number;
  tax: number;
  delivery_fee: number;
  total: number;
  delivery_date: string;
  created_at: string;
}

export interface ShippingAddress {
  id: string;
  full_name: string;
  phone: string;
  street_address: string;
  city: string;
  province: string;
  postal_code: string;
  is_default: boolean;
}

// Cart operations
export const cartService = {
  async getCart(userId: string) {
    const { data, error } = await supabase
      .from('ecommerce_carts')
      .select(`
        *,
        product:products(*)
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  },

  async addToCart(userId: string, productId: string, quantity: number = 1) {
    const { data, error } = await supabase
      .from('ecommerce_carts')
      .upsert({
        user_id: userId,
        product_id: productId,
        quantity,
        updated_at: new Date().toISOString(),
      })
      .select();

    if (error) throw error;
    return data?.[0];
  },

  async updateCartQuantity(userId: string, productId: string, quantity: number) {
    if (quantity <= 0) {
      return this.removeFromCart(userId, productId);
    }

    const { data, error } = await supabase
      .from('ecommerce_carts')
      .update({ quantity, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('product_id', productId)
      .select();

    if (error) throw error;
    return data?.[0];
  },

  async removeFromCart(userId: string, productId: string) {
    const { error } = await supabase
      .from('ecommerce_carts')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) throw error;
  },

  async clearCart(userId: string) {
    const { error } = await supabase
      .from('ecommerce_carts')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
  },
};

// Shipping address operations
export const shippingService = {
  async getAddresses(userId: string) {
    const { data, error } = await supabase
      .from('ecommerce_shipping_addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async addAddress(userId: string, address: Omit<ShippingAddress, 'id'>) {
    const { data, error } = await supabase
      .from('ecommerce_shipping_addresses')
      .insert({
        id: uuidv4(),
        user_id: userId,
        ...address,
      })
      .select();

    if (error) throw error;
    return data?.[0];
  },

  async updateAddress(addressId: string, updates: Partial<ShippingAddress>) {
    const { data, error } = await supabase
      .from('ecommerce_shipping_addresses')
      .update(updates)
      .eq('id', addressId)
      .select();

    if (error) throw error;
    return data?.[0];
  },

  async setDefaultAddress(userId: string, addressId: string) {
    // Remove default from all addresses
    await supabase
      .from('ecommerce_shipping_addresses')
      .update({ is_default: false })
      .eq('user_id', userId);

    // Set new default
    const { data, error } = await supabase
      .from('ecommerce_shipping_addresses')
      .update({ is_default: true })
      .eq('id', addressId)
      .select();

    if (error) throw error;
    return data?.[0];
  },
};

// Delivery zones
export const deliveryService = {
  async getZones() {
    const { data, error } = await supabase
      .from('ecommerce_delivery_zones')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  },

  async getZoneByPostalCode(postalCode: string) {
    const prefix = postalCode.substring(0, 3).toUpperCase();
    const { data, error } = await supabase
      .from('ecommerce_delivery_zones')
      .select('*')
      .eq('is_active', true)
      .contains('postal_codes', [prefix])
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },
};

// Order operations
export const orderService = {
  async createOrder(
    userId: string,
    cartItems: CartItem[],
    shippingAddressId: string,
    deliveryZoneId: string,
    deliveryDate: string,
    stripePaymentIntentId: string
  ) {
    // Calculate totals
    let subtotal = 0;
    const orderItems = cartItems.map((item) => {
      const itemTotal = (item.product?.price || 0) * item.quantity;
      subtotal += itemTotal;
      return {
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.product?.price || 0,
        total_price: itemTotal,
      };
    });

    // Get delivery zone for fee
    const { data: zone } = await supabase
      .from('ecommerce_delivery_zones')
      .select('delivery_fee, estimated_days')
      .eq('id', deliveryZoneId)
      .single();

    const deliveryFee = zone?.delivery_fee || 0;
    const tax = subtotal * 0.13; // 13% HST for Ontario
    const total = subtotal + tax + deliveryFee;

    // Create order
    const orderNumber = `HS-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const { data: order, error: orderError } = await supabase
      .from('ecommerce_orders')
      .insert({
        id: uuidv4(),
        user_id: userId,
        order_number: orderNumber,
        status: 'pending',
        subtotal,
        tax,
        delivery_fee: deliveryFee,
        total,
        shipping_address_id: shippingAddressId,
        delivery_zone_id: deliveryZoneId,
        delivery_date: deliveryDate,
        estimated_delivery_end: new Date(new Date(deliveryDate).getTime() + (zone?.estimated_days || 3) * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        stripe_payment_intent_id: stripePaymentIntentId,
        payment_status: 'pending',
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Add order items
    const { error: itemsError } = await supabase
      .from('ecommerce_order_items')
      .insert(
        orderItems.map((item) => ({
          id: uuidv4(),
          order_id: order.id,
          ...item,
        }))
      );

    if (itemsError) throw itemsError;

    // Add initial status history
    await supabase.from('ecommerce_order_status_history').insert({
      id: uuidv4(),
      order_id: order.id,
      status: 'pending',
      notes: 'Order created, awaiting payment confirmation',
    });

    return order;
  },

  async getOrders(userId: string) {
    const { data, error } = await supabase
      .from('ecommerce_orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getOrderDetails(orderId: string) {
    const { data: order, error: orderError } = await supabase
      .from('ecommerce_orders')
      .select(`
        *,
        items:ecommerce_order_items(
          *,
          product:products(*)
        ),
        status_history:ecommerce_order_status_history(*)
      `)
      .eq('id', orderId)
      .single();

    if (orderError) throw orderError;
    return order;
  },

  async updateOrderStatus(orderId: string, status: string, notes?: string) {
    const { data, error } = await supabase
      .from('ecommerce_orders')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;

    // Add to status history
    await supabase.from('ecommerce_order_status_history').insert({
      id: uuidv4(),
      order_id: orderId,
      status,
      notes: notes || null,
    });

    return data;
  },

  async confirmPayment(orderId: string) {
    return this.updateOrderStatus(orderId, 'confirmed', 'Payment confirmed');
  },
};
