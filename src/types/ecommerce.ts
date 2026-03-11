export interface Product {
  id: string;
  supplier_id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url?: string;
  category?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  added_at: string;
  updated_at: string;
  product?: Product;
}

export interface ShippingAddress {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  street_address: string;
  city: string;
  province: string;
  postal_code: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  postal_codes: string[];
  delivery_fee: number;
  estimated_days: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  tax: number;
  delivery_fee: number;
  total: number;
  shipping_address_id: string;
  delivery_zone_id: string;
  delivery_date: string;
  estimated_delivery_end: string;
  tracking_number?: string;
  stripe_payment_intent_id: string;
  payment_status: 'pending' | 'succeeded' | 'failed';
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  product?: Product;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status: string;
  notes?: string;
  created_at: string;
}
