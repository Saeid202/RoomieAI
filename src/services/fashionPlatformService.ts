import { supabase } from '@/integrations/supabase/client';

export interface ManufacturingPartner {
  id: string;
  name: string;
  location: 'china' | 'india' | 'vietnam' | 'bangladesh';
  specialties: string[];
  min_order: number;
  lead_time_days: number;
  quality_rating: number;
  cost_per_item: number;
  currency: string;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface FabricOption {
  id: string;
  name: string;
  type: 'cotton' | 'silk' | 'wool' | 'linen' | 'polyester' | 'cashmere' | 'denim' | 'leather';
  color: string;
  pattern?: 'solid' | 'stripes' | 'checks' | 'dots' | 'floral' | 'geometric' | 'abstract';
  weight_gsm?: number;
  cost_per_meter: number;
  currency: string;
  availability: 'in_stock' | 'limited' | 'out_of_stock';
  supplier_id?: string;
  image_url?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DesignTemplate {
  id: string;
  name: string;
  category: 'suit' | 'shirt' | 'dress' | 'pants' | 'jacket' | 'blazer';
  style_type: string;
  description?: string;
  base_price: number;
  currency: string;
  complexity_level: number;
  estimated_hours?: number;
  image_url?: string;
  design_data?: any;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CustomDesign {
  id?: string;
  user_id: string;
  template_id?: string;
  name: string;
  description?: string;
  design_data: any;
  measurements_data: any;
  fabric_selections: any;
  color_customizations: any;
  estimated_cost?: number;
  estimated_production_days?: number;
  status: 'draft' | 'pending_approval' | 'approved' | 'in_production' | 'completed' | 'cancelled';
  is_public: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Order {
  id?: string;
  user_id: string;
  design_id: string;
  manufacturing_partner_id: string;
  order_number: string;
  status: 'pending' | 'confirmed' | 'in_production' | 'quality_check' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  total_amount: number;
  currency: string;
  manufacturing_cost: number;
  shipping_cost: number;
  platform_fee: number;
  estimated_delivery_date?: string;
  actual_delivery_date?: string;
  tracking_number?: string;
  shipping_address: any;
  billing_address: any;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method?: string;
  payment_id?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PricingTier {
  id: string;
  name: string;
  location: 'china' | 'india' | 'vietnam' | 'bangladesh';
  category: 'suit' | 'shirt' | 'dress' | 'pants' | 'jacket' | 'blazer';
  base_price: number;
  complexity_multiplier: number;
  rush_order_multiplier: number;
  min_order_discount: number;
  currency: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CostEstimate {
  base_cost: number;
  manufacturing_cost: number;
  fabric_cost: number;
  complexity_cost: number;
  shipping_cost: number;
  platform_fee: number;
  total_cost: number;
  estimated_delivery_days: number;
  manufacturing_partner: ManufacturingPartner;
  currency: string;
}

export class FashionPlatformService {
  // Manufacturing Partners
  static async getManufacturingPartners(): Promise<ManufacturingPartner[]> {
    const { data, error } = await supabase
      .from('manufacturing_partners')
      .select('*')
      .eq('is_active', true)
      .order('quality_rating', { ascending: false });

    if (error) throw error;
    return (data || []) as ManufacturingPartner[];
  }

  static async getManufacturingPartnerById(id: string): Promise<ManufacturingPartner | null> {
    const { data, error } = await supabase
      .from('manufacturing_partners')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as ManufacturingPartner;
  }

  // Fabric Options
  static async getFabricOptions(): Promise<FabricOption[]> {
    const { data, error } = await supabase
      .from('fabric_options')
      .select('*')
      .eq('is_active', true)
      .order('cost_per_meter', { ascending: true });

    if (error) throw error;
    return (data || []) as FabricOption[];
  }

  static async getFabricOptionsByType(type: string): Promise<FabricOption[]> {
    const { data, error } = await supabase
      .from('fabric_options')
      .select('*')
      .eq('type', type)
      .eq('is_active', true)
      .eq('availability', 'in_stock')
      .order('cost_per_meter', { ascending: true });

    if (error) throw error;
    return (data || []) as FabricOption[];
  }

  // Design Templates
  static async getDesignTemplates(): Promise<DesignTemplate[]> {
    const { data, error } = await supabase
      .from('design_templates')
      .select('*')
      .eq('is_active', true)
      .order('base_price', { ascending: true });

    if (error) throw error;
    return (data || []) as DesignTemplate[];
  }

  static async getDesignTemplatesByCategory(category: string): Promise<DesignTemplate[]> {
    const { data, error } = await supabase
      .from('design_templates')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('base_price', { ascending: true });

    if (error) throw error;
    return (data || []) as DesignTemplate[];
  }

  // Custom Designs
  static async saveCustomDesign(design: Omit<CustomDesign, 'id' | 'created_at' | 'updated_at'>): Promise<CustomDesign> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('custom_designs')
      .insert({
        user_id: user.id,
        template_id: design.template_id,
        name: design.name,
        description: design.description,
        design_data: design.design_data,
        measurements_data: design.measurements_data,
        fabric_selections: design.fabric_selections,
        color_customizations: design.color_customizations,
        estimated_cost: design.estimated_cost,
        estimated_production_days: design.estimated_production_days,
        status: design.status,
        is_public: design.is_public
      })
      .select()
      .single();

    if (error) throw error;
    return data as CustomDesign;
  }

  static async getUserCustomDesigns(): Promise<CustomDesign[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('custom_designs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as CustomDesign[];
  }

  static async getCustomDesignById(id: string): Promise<CustomDesign | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('custom_designs')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    return data as CustomDesign;
  }

  // Orders
  static async createOrder(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        design_id: order.design_id,
        manufacturing_partner_id: order.manufacturing_partner_id,
        order_number: order.order_number,
        status: order.status,
        total_amount: order.total_amount,
        currency: order.currency,
        manufacturing_cost: order.manufacturing_cost,
        shipping_cost: order.shipping_cost,
        platform_fee: order.platform_fee,
        estimated_delivery_date: order.estimated_delivery_date,
        shipping_address: order.shipping_address,
        billing_address: order.billing_address,
        payment_status: order.payment_status,
        payment_method: order.payment_method,
        payment_id: order.payment_id,
        notes: order.notes
      })
      .select()
      .single();

    if (error) throw error;
    return data as Order;
  }

  static async getUserOrders(): Promise<Order[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Order[];
  }

  // Cost Calculator
  static async calculateCost(
    templateId: string,
    fabricSelections: any,
    measurements: any,
    location: string,
    isRushOrder: boolean = false
  ): Promise<CostEstimate> {
    // Get template and pricing tier
    const template = await this.getDesignTemplates().then(templates => 
      templates.find(t => t.id === templateId)
    );

    if (!template) throw new Error('Template not found');

    // Get pricing tier for location
    const { data: pricingData, error: pricingError } = await supabase
      .from('pricing_tiers')
      .select('*')
      .eq('location', location)
      .eq('category', template.category)
      .eq('is_active', true)
      .single();

    if (pricingError) throw pricingError;
    const pricingTier = pricingData as PricingTier;

    // Get manufacturing partner
    const { data: partnerData, error: partnerError } = await supabase
      .from('manufacturing_partners')
      .select('*')
      .eq('location', location)
      .eq('is_active', true)
      .order('cost_per_item', { ascending: true })
      .limit(1)
      .single();

    if (partnerError) throw partnerError;
    const partner = partnerData as ManufacturingPartner;

    // Calculate costs
    const baseCost = pricingTier.base_price;
    const complexityMultiplier = pricingTier.complexity_multiplier;
    const rushMultiplier = isRushOrder ? pricingTier.rush_order_multiplier : 1.0;

    const manufacturingCost = baseCost * complexityMultiplier * rushMultiplier;
    
    // Calculate fabric cost (simplified - would need more complex logic for actual fabric usage)
    const fabricCost = fabricSelections.fabric_cost || 0;
    
    const complexityCost = (template.complexity_level - 1) * 10; // $10 per complexity level
    
    const shippingCost = this.getShippingCost(location);
    const platformFee = (manufacturingCost + fabricCost + complexityCost + shippingCost) * 0.15; // 15% platform fee
    
    const totalCost = manufacturingCost + fabricCost + complexityCost + shippingCost + platformFee;
    
    const estimatedDeliveryDays = isRushOrder ? 
      Math.ceil(partner.lead_time_days * 0.7) : 
      partner.lead_time_days;

    return {
      base_cost: baseCost,
      manufacturing_cost: manufacturingCost,
      fabric_cost: fabricCost,
      complexity_cost: complexityCost,
      shipping_cost: shippingCost,
      platform_fee: platformFee,
      total_cost: totalCost,
      estimated_delivery_days: estimatedDeliveryDays,
      manufacturing_partner: partner,
      currency: 'USD'
    };
  }

  private static getShippingCost(location: string): number {
    const shippingCosts = {
      'china': 15.00,
      'india': 20.00,
      'vietnam': 18.00,
      'bangladesh': 22.00
    };
    return shippingCosts[location as keyof typeof shippingCosts] || 20.00;
  }

  // Generate order number
  static generateOrderNumber(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `FA-${timestamp}-${random}`.toUpperCase();
  }
}

