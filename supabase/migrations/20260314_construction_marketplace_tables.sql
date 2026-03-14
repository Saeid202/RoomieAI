-- Construction Marketplace Database Schema
-- All tables prefixed with construction_ for isolation

-- ============================================
-- TABLE 1: construction_supplier_profiles
-- ============================================
CREATE TABLE IF NOT EXISTS public.construction_supplier_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.construction_supplier_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "suppliers_can_access_own_profile" ON public.construction_supplier_profiles
    FOR ALL USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ============================================
-- TABLE 2: construction_products
-- ============================================
CREATE TABLE IF NOT EXISTS public.construction_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID NOT NULL REFERENCES public.construction_supplier_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    price_cad NUMERIC NOT NULL,
    product_type TEXT NOT NULL CHECK (product_type IN ('expandable', 'foldable', 'flatpack', 'capsule', 'modular')),
    size_ft TEXT,
    bedrooms TEXT,
    bathrooms TEXT,
    area_sqm NUMERIC,
    lead_time TEXT,
    frame_type TEXT,
    shipping_port TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'live', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.construction_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_can_view_live_products" ON public.construction_products
    FOR SELECT USING (status = 'live');

CREATE POLICY "suppliers_can_insert_products" ON public.construction_products
    FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM public.construction_supplier_profiles WHERE id = auth.uid()));

CREATE POLICY "suppliers_can_update_own_products" ON public.construction_products
    FOR UPDATE USING (supplier_id = auth.uid())
    WITH CHECK (supplier_id = auth.uid());

CREATE POLICY "suppliers_can_delete_own_products" ON public.construction_products
    FOR DELETE USING (supplier_id = auth.uid());

-- ============================================
-- TABLE 3: construction_product_images
-- ============================================
CREATE TABLE IF NOT EXISTS public.construction_product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.construction_products(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    public_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.construction_product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_can_view_product_images" ON public.construction_product_images
    FOR SELECT USING (
        product_id IN (SELECT id FROM public.construction_products WHERE status = 'live')
    );

CREATE POLICY "suppliers_can_manage_images" ON public.construction_product_images
    FOR ALL USING (
        product_id IN (SELECT id FROM public.construction_products WHERE supplier_id = auth.uid())
    );

-- ============================================
-- TABLE 4: construction_product_documents
-- ============================================
CREATE TABLE IF NOT EXISTS public.construction_product_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.construction_products(id) ON DELETE CASCADE,
    doc_type TEXT NOT NULL CHECK (doc_type IN ('brochure', 'spec_sheet', 'floor_plan', 'compliance', 'install_guide')),
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_size_kb INTEGER,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.construction_product_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_can_view_product_docs" ON public.construction_product_documents
    FOR SELECT USING (
        product_id IN (SELECT id FROM public.construction_products WHERE status = 'live')
    );

CREATE POLICY "suppliers_can_manage_docs" ON public.construction_product_documents
    FOR ALL USING (
        product_id IN (SELECT id FROM public.construction_products WHERE supplier_id = auth.uid())
    );

-- ============================================
-- TABLE 5: construction_quotes
-- ============================================
CREATE TABLE IF NOT EXISTS public.construction_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.construction_products(id) ON DELETE SET NULL,
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    total_price NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.construction_quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_can_view_their_quotes" ON public.construction_quotes
    FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = supplier_id);

CREATE POLICY "buyers_can_insert_quotes" ON public.construction_quotes
    FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "suppliers_can_update_quotes" ON public.construction_quotes
    FOR UPDATE USING (auth.uid() = supplier_id);

-- ============================================
-- TABLE 6: construction_conversations
-- ============================================
CREATE TABLE IF NOT EXISTS public.construction_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.construction_products(id) ON DELETE SET NULL,
    buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_id, buyer_id, supplier_id)
);

ALTER TABLE public.construction_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_can_view_their_conversations" ON public.construction_conversations
    FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = supplier_id);

CREATE POLICY "users_can_create_conversations" ON public.construction_conversations
    FOR INSERT WITH CHECK (auth.uid() = buyer_id OR auth.uid() = supplier_id);

-- ============================================
-- TABLE 7: construction_messages
-- ============================================
CREATE TABLE IF NOT EXISTS public.construction_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.construction_conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.construction_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_can_view_their_messages" ON public.construction_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.construction_conversations
            WHERE construction_conversations.id = construction_messages.conversation_id
            AND (construction_conversations.buyer_id = auth.uid() OR construction_conversations.supplier_id = auth.uid())
        )
    );

CREATE POLICY "users_can_send_messages" ON public.construction_messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id
        AND EXISTS (
            SELECT 1 FROM public.construction_conversations
            WHERE construction_conversations.id = construction_messages.conversation_id
            AND (construction_conversations.buyer_id = auth.uid() OR construction_conversations.supplier_id = auth.uid())
        )
    );

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_construction_products_supplier_id ON public.construction_products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_construction_products_status ON public.construction_products(status);
CREATE INDEX IF NOT EXISTS idx_construction_products_slug ON public.construction_products(slug);
CREATE INDEX IF NOT EXISTS idx_construction_product_images_product_id ON public.construction_product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_construction_product_documents_product_id ON public.construction_product_documents(product_id);
CREATE INDEX IF NOT EXISTS idx_construction_quotes_buyer_id ON public.construction_quotes(buyer_id);
CREATE INDEX IF NOT EXISTS idx_construction_quotes_supplier_id ON public.construction_quotes(supplier_id);
CREATE INDEX IF NOT EXISTS idx_construction_quotes_status ON public.construction_quotes(status);
CREATE INDEX IF NOT EXISTS idx_construction_conversations_buyer_id ON public.construction_conversations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_construction_conversations_supplier_id ON public.construction_conversations(supplier_id);
CREATE INDEX IF NOT EXISTS idx_construction_messages_conversation_id ON public.construction_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_construction_messages_created_at ON public.construction_messages(created_at);

-- ============================================
-- TRIGGER: Create supplier profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_construction_supplier()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_company_name TEXT;
    v_contact_name TEXT;
    v_email TEXT;
    v_phone TEXT;
BEGIN
    v_company_name := COALESCE(
        NEW.raw_user_meta_data->>'company_name',
        'Unknown Company'
    );
    
    v_contact_name := COALESCE(
        NEW.raw_user_meta_data->>'contact_name',
        'Unknown Contact'
    );
    
    v_email := NEW.email;
    v_phone := NEW.raw_user_meta_data->>'phone';
    
    INSERT INTO public.construction_supplier_profiles (
        id,
        company_name,
        contact_name,
        email,
        phone,
        verified
    ) VALUES (
        NEW.id,
        v_company_name,
        v_contact_name,
        v_email,
        v_phone,
        FALSE
    )
    ON CONFLICT (id) DO UPDATE
    SET
        company_name = EXCLUDED.company_name,
        contact_name = EXCLUDED.contact_name,
        phone = EXCLUDED.phone,
        updated_at = NOW();
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error creating construction supplier profile: %', SQLERRM;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_construction_supplier_created ON auth.users;
CREATE TRIGGER on_construction_supplier_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_construction_supplier();

-- ============================================
-- STORAGE BUCKETS
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'construction-images',
    'construction-images',
    true,
    10485760,
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'construction-documents',
    'construction-documents',
    false,
    20971520,
    ARRAY['application/pdf', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for construction-images (public)
CREATE POLICY "Public read access to construction images" ON storage.objects
    FOR SELECT USING (bucket_id = 'construction-images');

CREATE POLICY "Suppliers can upload construction images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'construction-images'
        AND auth.uid() IN (SELECT id FROM public.construction_supplier_profiles)
    );

CREATE POLICY "Suppliers can delete their construction images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'construction-images'
        AND auth.uid() IN (SELECT id FROM public.construction_supplier_profiles)
    );

-- Storage Policies for construction-documents (private)
CREATE POLICY "Suppliers can read their construction documents" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'construction-documents'
        AND auth.uid() IN (SELECT id FROM public.construction_supplier_profiles)
    );

CREATE POLICY "Suppliers can upload construction documents" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'construction-documents'
        AND auth.uid() IN (SELECT id FROM public.construction_supplier_profiles)
    );

CREATE POLICY "Suppliers can delete their construction documents" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'construction-documents'
        AND auth.uid() IN (SELECT id FROM public.construction_supplier_profiles)
    );

-- ============================================
-- VERIFY SETUP
-- ============================================
SELECT 'Construction marketplace tables created successfully' as status;
