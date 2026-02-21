-- =====================================================
-- Setup Property Documents Storage System
-- Run this in Supabase SQL Editor
-- =====================================================

-- STEP 1: Create Storage Bucket
-- =====================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'property-documents',
    'property-documents',
    false, -- Private bucket
    10485760, -- 10MB file size limit
    ARRAY[
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
)
ON CONFLICT (id) DO NOTHING;

-- STEP 2: Create property_documents Table
-- =====================================================
CREATE TABLE IF NOT EXISTS property_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    document_label TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size BIGINT,
    mime_type TEXT,
    is_public BOOLEAN DEFAULT false,
    uploaded_by UUID REFERENCES auth.users(id),
    uploaded_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT valid_document_type CHECK (
        document_type IN (
            'title_deed',
            'property_tax_bill',
            'disclosures',
            'status_certificate',
            'condo_bylaws',
            'reserve_fund_study',
            'building_inspection',
            'appraisal_report',
            'survey_plan',
            'zoning_documents',
            'rental_income_statement',
            'tenant_lease_agreements',
            'maintenance_records',
            'utility_bills',
            'insurance_policy',
            'hoa_documents',
            'environmental_reports',
            'permits_licenses',
            'floor_plans',
            'other'
        )
    )
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_property_documents_property_id ON property_documents(property_id);
CREATE INDEX IF NOT EXISTS idx_property_documents_type ON property_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_property_documents_public ON property_documents(is_public);

-- STEP 3: Create document_access_requests Table
-- =====================================================
CREATE TABLE IF NOT EXISTS document_access_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES property_documents(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    requester_id UUID NOT NULL REFERENCES auth.users(id),
    requester_email TEXT NOT NULL,
    requester_name TEXT NOT NULL,
    request_message TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    response_message TEXT,
    requested_at TIMESTAMPTZ DEFAULT now(),
    responded_at TIMESTAMPTZ,
    responded_by UUID REFERENCES auth.users(id),
    CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'denied'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_access_requests_document_id ON document_access_requests(document_id);
CREATE INDEX IF NOT EXISTS idx_access_requests_property_id ON document_access_requests(property_id);
CREATE INDEX IF NOT EXISTS idx_access_requests_requester_id ON document_access_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_access_requests_status ON document_access_requests(status);

-- STEP 4: Enable Row Level Security
-- =====================================================
ALTER TABLE property_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_access_requests ENABLE ROW LEVEL SECURITY;

-- STEP 5: RLS Policies for property_documents
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Landlords can view own property documents" ON property_documents;
DROP POLICY IF EXISTS "Landlords can insert own property documents" ON property_documents;
DROP POLICY IF EXISTS "Landlords can update own property documents" ON property_documents;
DROP POLICY IF EXISTS "Landlords can delete own property documents" ON property_documents;
DROP POLICY IF EXISTS "Anyone can view public documents" ON property_documents;

-- Landlords can view their own property documents
CREATE POLICY "Landlords can view own property documents"
ON property_documents FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM properties 
        WHERE properties.id = property_documents.property_id 
        AND properties.user_id = auth.uid()
    )
);

-- Landlords can insert documents for their properties
CREATE POLICY "Landlords can insert own property documents"
ON property_documents FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM properties 
        WHERE properties.id = property_documents.property_id 
        AND properties.user_id = auth.uid()
    )
);

-- Landlords can update their own property documents
CREATE POLICY "Landlords can update own property documents"
ON property_documents FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM properties 
        WHERE properties.id = property_documents.property_id 
        AND properties.user_id = auth.uid()
    )
);

-- Landlords can delete their own property documents
CREATE POLICY "Landlords can delete own property documents"
ON property_documents FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM properties 
        WHERE properties.id = property_documents.property_id 
        AND properties.user_id = auth.uid()
    )
);

-- Anyone can view public documents
CREATE POLICY "Anyone can view public documents"
ON property_documents FOR SELECT
USING (is_public = true AND deleted_at IS NULL);

-- STEP 6: RLS Policies for document_access_requests
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own access requests" ON document_access_requests;
DROP POLICY IF EXISTS "Landlords can view property access requests" ON document_access_requests;
DROP POLICY IF EXISTS "Authenticated users can request document access" ON document_access_requests;
DROP POLICY IF EXISTS "Landlords can respond to access requests" ON document_access_requests;

-- Users can view their own requests
CREATE POLICY "Users can view own access requests"
ON document_access_requests FOR SELECT
USING (requester_id = auth.uid());

-- Landlords can view requests for their properties
CREATE POLICY "Landlords can view property access requests"
ON document_access_requests FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM properties 
        WHERE properties.id = document_access_requests.property_id 
        AND properties.user_id = auth.uid()
    )
);

-- Authenticated users can create access requests
CREATE POLICY "Authenticated users can request document access"
ON document_access_requests FOR INSERT
WITH CHECK (auth.uid() = requester_id);

-- Landlords can update requests for their properties
CREATE POLICY "Landlords can respond to access requests"
ON document_access_requests FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM properties 
        WHERE properties.id = document_access_requests.property_id 
        AND properties.user_id = auth.uid()
    )
);

-- STEP 7: Storage Policies
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Landlords can upload property documents" ON storage.objects;
DROP POLICY IF EXISTS "Landlords can view own property documents in storage" ON storage.objects;
DROP POLICY IF EXISTS "Landlords can delete own property documents in storage" ON storage.objects;

-- Allow authenticated users to upload documents
CREATE POLICY "Landlords can upload property documents"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'property-documents' 
    AND auth.role() = 'authenticated'
);

-- Allow authenticated users to view documents
CREATE POLICY "Landlords can view own property documents in storage"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'property-documents' 
    AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete documents
CREATE POLICY "Landlords can delete own property documents in storage"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'property-documents' 
    AND auth.role() = 'authenticated'
);

-- STEP 8: Verify Setup
-- =====================================================
SELECT 'Bucket created:' as status, id, name FROM storage.buckets WHERE id = 'property-documents';
SELECT 'Tables created:' as status, table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN ('property_documents', 'document_access_requests');
