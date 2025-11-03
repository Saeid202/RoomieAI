-- Create fashion design platform tables
-- This migration creates tables for the fashion design platform with manufacturing integration

-- Drop tables if exists (for clean migration)
DROP TABLE IF EXISTS public.manufacturing_partners CASCADE;
DROP TABLE IF EXISTS public.fabric_options CASCADE;
DROP TABLE IF EXISTS public.design_templates CASCADE;
DROP TABLE IF EXISTS public.custom_designs CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.pricing_tiers CASCADE;

-- Create manufacturing_partners table
CREATE TABLE public.manufacturing_partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    location TEXT NOT NULL CHECK (location IN ('china', 'india', 'vietnam', 'bangladesh')),
    specialties TEXT[] NOT NULL DEFAULT '{}',
    min_order INTEGER NOT NULL DEFAULT 1,
    lead_time_days INTEGER NOT NULL DEFAULT 14,
    quality_rating DECIMAL(2,1) NOT NULL DEFAULT 5.0 CHECK (quality_rating >= 1.0 AND quality_rating <= 5.0),
    cost_per_item DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    contact_email TEXT,
    contact_phone TEXT,
    website TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create fabric_options table
CREATE TABLE public.fabric_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('cotton', 'silk', 'wool', 'linen', 'polyester', 'cashmere', 'denim', 'leather')),
    color TEXT NOT NULL,
    pattern TEXT CHECK (pattern IN ('solid', 'stripes', 'checks', 'dots', 'floral', 'geometric', 'abstract')),
    weight_gsm INTEGER,
    cost_per_meter DECIMAL(8,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    availability TEXT NOT NULL DEFAULT 'in_stock' CHECK (availability IN ('in_stock', 'limited', 'out_of_stock')),
    supplier_id UUID REFERENCES public.manufacturing_partners(id),
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create design_templates table
CREATE TABLE public.design_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('suit', 'shirt', 'dress', 'pants', 'jacket', 'blazer')),
    style_type TEXT NOT NULL,
    description TEXT,
    base_price DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    complexity_level INTEGER NOT NULL DEFAULT 1 CHECK (complexity_level >= 1 AND complexity_level <= 5),
    estimated_hours DECIMAL(4,2),
    image_url TEXT,
    design_data JSONB,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create custom_designs table
CREATE TABLE public.custom_designs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    template_id UUID REFERENCES public.design_templates(id),
    name TEXT NOT NULL,
    description TEXT,
    design_data JSONB NOT NULL DEFAULT '{}',
    measurements_data JSONB NOT NULL DEFAULT '{}',
    fabric_selections JSONB NOT NULL DEFAULT '{}',
    color_customizations JSONB NOT NULL DEFAULT '{}',
    estimated_cost DECIMAL(10,2),
    estimated_production_days INTEGER,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'in_production', 'completed', 'cancelled')),
    is_public BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    design_id UUID REFERENCES public.custom_designs(id),
    manufacturing_partner_id UUID REFERENCES public.manufacturing_partners(id),
    order_number TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_production', 'quality_check', 'shipped', 'delivered', 'cancelled', 'refunded')),
    total_amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    manufacturing_cost DECIMAL(10,2) NOT NULL,
    shipping_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    platform_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    estimated_delivery_date DATE,
    actual_delivery_date DATE,
    tracking_number TEXT,
    shipping_address JSONB NOT NULL,
    billing_address JSONB NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_method TEXT,
    payment_id TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pricing_tiers table
CREATE TABLE public.pricing_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    location TEXT NOT NULL CHECK (location IN ('china', 'india', 'vietnam', 'bangladesh')),
    category TEXT NOT NULL CHECK (category IN ('suit', 'shirt', 'dress', 'pants', 'jacket', 'blazer')),
    base_price DECIMAL(10,2) NOT NULL,
    complexity_multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.0,
    rush_order_multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.5,
    min_order_discount DECIMAL(3,2) NOT NULL DEFAULT 1.0,
    currency TEXT NOT NULL DEFAULT 'USD',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_manufacturing_partners_location ON public.manufacturing_partners(location);
CREATE INDEX idx_manufacturing_partners_active ON public.manufacturing_partners(is_active);
CREATE INDEX idx_fabric_options_type ON public.fabric_options(type);
CREATE INDEX idx_fabric_options_supplier ON public.fabric_options(supplier_id);
CREATE INDEX idx_design_templates_category ON public.design_templates(category);
CREATE INDEX idx_custom_designs_user_id ON public.custom_designs(user_id);
CREATE INDEX idx_custom_designs_status ON public.custom_designs(status);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_order_number ON public.orders(order_number);
CREATE INDEX idx_pricing_tiers_location_category ON public.pricing_tiers(location, category);

-- Enable Row Level Security
ALTER TABLE public.manufacturing_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fabric_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_tiers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for manufacturing_partners (public read access)
CREATE POLICY "Anyone can view manufacturing partners" ON public.manufacturing_partners
    FOR SELECT USING (true);

CREATE POLICY "Only authenticated users can insert manufacturing partners" ON public.manufacturing_partners
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create RLS policies for fabric_options (public read access)
CREATE POLICY "Anyone can view fabric options" ON public.fabric_options
    FOR SELECT USING (true);

CREATE POLICY "Only authenticated users can insert fabric options" ON public.fabric_options
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create RLS policies for design_templates (public read access)
CREATE POLICY "Anyone can view design templates" ON public.design_templates
    FOR SELECT USING (true);

CREATE POLICY "Only authenticated users can insert design templates" ON public.design_templates
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create RLS policies for custom_designs (users can only access their own)
CREATE POLICY "Users can view their own designs" ON public.custom_designs
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own designs" ON public.custom_designs
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own designs" ON public.custom_designs
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own designs" ON public.custom_designs
    FOR DELETE USING (user_id = auth.uid());

-- Create RLS policies for orders (users can only access their own)
CREATE POLICY "Users can view their own orders" ON public.orders
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own orders" ON public.orders
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own orders" ON public.orders
    FOR UPDATE USING (user_id = auth.uid());

-- Create RLS policies for pricing_tiers (public read access)
CREATE POLICY "Anyone can view pricing tiers" ON public.pricing_tiers
    FOR SELECT USING (true);

CREATE POLICY "Only authenticated users can insert pricing tiers" ON public.pricing_tiers
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Functions to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_fashion_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers to automatically update updated_at
CREATE TRIGGER trg_update_manufacturing_partners_updated_at
    BEFORE UPDATE ON public.manufacturing_partners
    FOR EACH ROW EXECUTE FUNCTION public.update_fashion_updated_at();

CREATE TRIGGER trg_update_fabric_options_updated_at
    BEFORE UPDATE ON public.fabric_options
    FOR EACH ROW EXECUTE FUNCTION public.update_fashion_updated_at();

CREATE TRIGGER trg_update_design_templates_updated_at
    BEFORE UPDATE ON public.design_templates
    FOR EACH ROW EXECUTE FUNCTION public.update_fashion_updated_at();

CREATE TRIGGER trg_update_custom_designs_updated_at
    BEFORE UPDATE ON public.custom_designs
    FOR EACH ROW EXECUTE FUNCTION public.update_fashion_updated_at();

CREATE TRIGGER trg_update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.update_fashion_updated_at();

CREATE TRIGGER trg_update_pricing_tiers_updated_at
    BEFORE UPDATE ON public.pricing_tiers
    FOR EACH ROW EXECUTE FUNCTION public.update_fashion_updated_at();

-- Insert sample manufacturing partners
INSERT INTO public.manufacturing_partners (name, location, specialties, min_order, lead_time_days, quality_rating, cost_per_item, contact_email, website) VALUES
('Shanghai Tailoring Co.', 'china', ARRAY['suits', 'blazers', 'dresses'], 1, 14, 4.8, 25.00, 'orders@shanghaitailoring.com', 'https://shanghaitailoring.com'),
('Mumbai Fashion House', 'india', ARRAY['suits', 'shirts', 'traditional'], 1, 21, 4.6, 30.00, 'production@mumbaifashion.in', 'https://mumbaifashion.in'),
('Guangzhou Garments Ltd.', 'china', ARRAY['casual', 'formal', 'sportswear'], 5, 10, 4.5, 18.00, 'info@guangzhougarments.com', 'https://guangzhougarments.com'),
('Delhi Craft Studios', 'india', ARRAY['suits', 'blazers', 'wedding'], 1, 18, 4.7, 35.00, 'studio@delhicraft.in', 'https://delhicraft.in'),
('Ho Chi Minh Textiles', 'vietnam', ARRAY['shirts', 'pants', 'casual'], 3, 12, 4.4, 22.00, 'contact@hcmtextiles.vn', 'https://hcmtextiles.vn');

-- Insert sample fabric options
INSERT INTO public.fabric_options (name, type, color, pattern, weight_gsm, cost_per_meter, supplier_id) VALUES
('Premium Cotton', 'cotton', 'Navy Blue', 'solid', 180, 12.50, (SELECT id FROM public.manufacturing_partners WHERE name = 'Shanghai Tailoring Co.' LIMIT 1)),
('Italian Wool', 'wool', 'Charcoal', 'solid', 280, 45.00, (SELECT id FROM public.manufacturing_partners WHERE name = 'Mumbai Fashion House' LIMIT 1)),
('Silk Blend', 'silk', 'Black', 'solid', 150, 35.00, (SELECT id FROM public.manufacturing_partners WHERE name = 'Delhi Craft Studios' LIMIT 1)),
('Linen Mix', 'linen', 'Beige', 'solid', 200, 18.00, (SELECT id FROM public.manufacturing_partners WHERE name = 'Guangzhou Garments Ltd.' LIMIT 1)),
('Cashmere', 'cashmere', 'Grey', 'solid', 300, 85.00, (SELECT id FROM public.manufacturing_partners WHERE name = 'Mumbai Fashion House' LIMIT 1));

-- Insert sample design templates
INSERT INTO public.design_templates (name, category, style_type, description, base_price, complexity_level, estimated_hours) VALUES
('Classic Business Suit', 'suit', 'classic', 'Traditional single-breasted business suit with notch lapels', 150.00, 3, 8.0),
('Modern Slim Suit', 'suit', 'modern', 'Contemporary slim-fit suit with narrow lapels', 180.00, 4, 10.0),
('Double-Breasted Suit', 'suit', 'formal', 'Sophisticated double-breasted formal suit', 200.00, 5, 12.0),
('Casual Blazer', 'blazer', 'casual', 'Relaxed unstructured blazer for casual wear', 120.00, 2, 6.0),
('Dress Shirt', 'shirt', 'formal', 'Classic dress shirt with French cuffs', 45.00, 2, 4.0),
('A-Line Dress', 'dress', 'casual', 'Flattering A-line dress for various occasions', 80.00, 3, 6.0);

-- Insert sample pricing tiers
INSERT INTO public.pricing_tiers (name, location, category, base_price, complexity_multiplier, rush_order_multiplier) VALUES
('China Standard', 'china', 'suit', 25.00, 1.0, 1.5),
('India Premium', 'india', 'suit', 35.00, 1.2, 1.8),
('Vietnam Budget', 'vietnam', 'suit', 22.00, 0.9, 1.4),
('China Standard', 'china', 'shirt', 12.00, 1.0, 1.5),
('India Premium', 'india', 'shirt', 18.00, 1.1, 1.6),
('China Standard', 'china', 'dress', 20.00, 1.0, 1.5),
('India Premium', 'india', 'dress', 28.00, 1.2, 1.7);

