-- =====================================================
-- PHASE 1: Property Categorization & Document Vault
-- =====================================================
-- Purpose: Implement parent-child property type hierarchy
--          and optional document vault system
-- Date: 2026-02-20
-- =====================================================

-- =====================================================
-- PART 1: Add New Property Categorization Columns
-- =====================================================

-- Add property_category column (Parent level)
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS property_category TEXT;

-- Add property_configuration column (Child level)
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS property_configuration TEXT;

-- Add listing_strength_score column (0-100)
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS listing_strength_score INTEGER DEFAULT 0;

-- Add check constraints for valid values
ALTER TABLE properties
ADD CONSTRAINT valid_property_category 
CHECK (property_category IN ('Condo', 'House', 'Townhouse') OR property_category IS NULL);

-- Note: We keep property_type for backward compatibility
-- It will be deprecated gradually

COMMENT ON COLUMN properties.property_category IS 'Parent category: Condo, House, or Townhouse';
COMMENT ON COLUMN properties.property_configuration IS 'Child configuration based on category (e.g., Studio, Detached, Freehold)';
COMMENT ON COLUMN properties.listing_strength_score IS 'Calculated score (0-100) based on uploaded documents and completeness';

-- =====================================================
-- PART 2: Create Property Documents Table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.property_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    
    -- Document metadata
    document_type TEXT NOT NULL,
    document_label TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER, -- in bytes
    mime_type TEXT,
    
    -- Privacy & Access Control
    is_public BOOLEAN DEFAULT false,
    
    -- Tracking
    uploaded_by UUID REFERENCES auth.users(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Soft delete
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT valid_document_type CHECK (
        document_type IN (
            'title_deed',
            'tax_bill',
            'disclosure',
            'status_certificate',
            'condo_bylaws',
            'land_survey',
            'inspection_report',
            'other'
        )
    )
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_property_documents_property_id 
ON property_documents(property_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_property_documents_type 
ON property_documents(document_type) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_property_documents_public 
ON property_documents(is_public) WHERE deleted_at IS NULL;

-- Add comments
COMMENT ON TABLE property_documents IS 'Stores optional documents for property listings to boost credibility';
COMMENT ON COLUMN property_documents.document_type IS 'Type of document: title_deed, tax_bill, disclosure, status_certificate, condo_bylaws, land_survey, inspection_report, other';
COMMENT ON COLUMN property_documents.is_public IS 'If true, buyers can download immediately. If false, buyers must request access';
COMMENT ON COLUMN property_documents.file_url IS 'Storage URL (Supabase Storage path)';

-- =====================================================
-- PART 3: Create Document Access Requests Table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.document_access_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id UUID NOT NULL REFERENCES property_documents(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    
    -- Requester info
    requester_id UUID NOT NULL REFERENCES auth.users(id),
    requester_email TEXT,
    requester_name TEXT,
    
    -- Request details
    request_message TEXT,
    status TEXT DEFAULT 'pending',
    
    -- Response
    response_message TEXT,
    responded_at TIMESTAMP WITH TIME ZONE,
    responded_by UUID REFERENCES auth.users(id),
    
    -- Tracking
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_request_status CHECK (
        status IN ('pending', 'approved', 'denied')
    )
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_document_access_requests_document 
ON document_access_requests(document_id);

CREATE INDEX IF NOT EXISTS idx_document_access_requests_property 
ON document_access_requests(property_id);

CREATE INDEX IF NOT EXISTS idx_document_access_requests_requester 
ON document_access_requests(requester_id);

CREATE INDEX IF NOT EXISTS idx_document_access_requests_status 
ON document_access_requests(status);

COMMENT ON TABLE document_access_requests IS 'Tracks buyer requests to access private property documents';

-- =====================================================
-- PART 4: Create Storage Bucket for Property Documents
-- =====================================================

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-documents', 'property-documents', false)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- PART 5: Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS
ALTER TABLE property_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_access_requests ENABLE ROW LEVEL SECURITY;

-- Property Documents Policies

-- Landlords can view their own property documents
CREATE POLICY "Landlords can view own property documents"
ON property_documents FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM properties 
        WHERE properties.id = property_documents.property_id 
        AND properties.landlord_id = auth.uid()
    )
);

-- Landlords can insert documents for their properties
CREATE POLICY "Landlords can insert own property documents"
ON property_documents FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM properties 
        WHERE properties.id = property_documents.property_id 
        AND properties.landlord_id = auth.uid()
    )
);

-- Landlords can update their own property documents
CREATE POLICY "Landlords can update own property documents"
ON property_documents FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM properties 
        WHERE properties.id = property_documents.property_id 
        AND properties.landlord_id = auth.uid()
    )
);

-- Landlords can delete their own property documents
CREATE POLICY "Landlords can delete own property documents"
ON property_documents FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM properties 
        WHERE properties.id = property_documents.property_id 
        AND properties.landlord_id = auth.uid()
    )
);

-- Buyers/Seekers can view public documents
CREATE POLICY "Anyone can view public documents"
ON property_documents FOR SELECT
USING (is_public = true AND deleted_at IS NULL);

-- Document Access Request Policies

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
        AND properties.landlord_id = auth.uid()
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
        AND properties.landlord_id = auth.uid()
    )
);

-- =====================================================
-- PART 6: Storage Policies
-- =====================================================

-- Allow landlords to upload documents for their properties
CREATE POLICY "Landlords can upload property documents"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'property-documents' 
    AND auth.role() = 'authenticated'
);

-- Allow landlords to view their own property documents
CREATE POLICY "Landlords can view own property documents in storage"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'property-documents' 
    AND auth.role() = 'authenticated'
);

-- Allow landlords to delete their own property documents
CREATE POLICY "Landlords can delete own property documents in storage"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'property-documents' 
    AND auth.role() = 'authenticated'
);

-- =====================================================
-- PART 7: Helper Function - Calculate Listing Strength
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_listing_strength(p_property_id UUID)
RETURNS INTEGER AS $$
DECLARE
    strength_score INTEGER := 0;
    doc_count INTEGER;
BEGIN
    -- Base score for having any documents
    SELECT COUNT(*) INTO doc_count
    FROM property_documents
    WHERE property_id = p_property_id 
    AND deleted_at IS NULL;
    
    IF doc_count > 0 THEN
        strength_score := 10; -- Base 10% for having documents
    END IF;
    
    -- Title Deed: +20%
    IF EXISTS (
        SELECT 1 FROM property_documents 
        WHERE property_id = p_property_id 
        AND document_type = 'title_deed' 
        AND deleted_at IS NULL
    ) THEN
        strength_score := strength_score + 20;
    END IF;
    
    -- Tax Bill: +15%
    IF EXISTS (
        SELECT 1 FROM property_documents 
        WHERE property_id = p_property_id 
        AND document_type = 'tax_bill' 
        AND deleted_at IS NULL
    ) THEN
        strength_score := strength_score + 15;
    END IF;
    
    -- Disclosure: +15%
    IF EXISTS (
        SELECT 1 FROM property_documents 
        WHERE property_id = p_property_id 
        AND document_type = 'disclosure' 
        AND deleted_at IS NULL
    ) THEN
        strength_score := strength_score + 15;
    END IF;
    
    -- Status Certificate: +20%
    IF EXISTS (
        SELECT 1 FROM property_documents 
        WHERE property_id = p_property_id 
        AND document_type = 'status_certificate' 
        AND deleted_at IS NULL
    ) THEN
        strength_score := strength_score + 20;
    END IF;
    
    -- Condo Bylaws: +10%
    IF EXISTS (
        SELECT 1 FROM property_documents 
        WHERE property_id = p_property_id 
        AND document_type = 'condo_bylaws' 
        AND deleted_at IS NULL
    ) THEN
        strength_score := strength_score + 10;
    END IF;
    
    -- Land Survey: +15%
    IF EXISTS (
        SELECT 1 FROM property_documents 
        WHERE property_id = p_property_id 
        AND document_type = 'land_survey' 
        AND deleted_at IS NULL
    ) THEN
        strength_score := strength_score + 15;
    END IF;
    
    -- Inspection Report: +20%
    IF EXISTS (
        SELECT 1 FROM property_documents 
        WHERE property_id = p_property_id 
        AND document_type = 'inspection_report' 
        AND deleted_at IS NULL
    ) THEN
        strength_score := strength_score + 20;
    END IF;
    
    -- Cap at 100%
    IF strength_score > 100 THEN
        strength_score := 100;
    END IF;
    
    RETURN strength_score;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_listing_strength IS 'Calculates listing strength score (0-100) based on uploaded documents';

-- =====================================================
-- PART 8: Trigger to Auto-Update Listing Strength
-- =====================================================

CREATE OR REPLACE FUNCTION update_listing_strength_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the listing strength score for the property
    UPDATE properties
    SET listing_strength_score = calculate_listing_strength(
        CASE 
            WHEN TG_OP = 'DELETE' THEN OLD.property_id
            ELSE NEW.property_id
        END
    )
    WHERE id = CASE 
        WHEN TG_OP = 'DELETE' THEN OLD.property_id
        ELSE NEW.property_id
    END;
    
    RETURN CASE 
        WHEN TG_OP = 'DELETE' THEN OLD
        ELSE NEW
    END;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_listing_strength ON property_documents;
CREATE TRIGGER trigger_update_listing_strength
AFTER INSERT OR UPDATE OR DELETE ON property_documents
FOR EACH ROW
EXECUTE FUNCTION update_listing_strength_trigger();

-- =====================================================
-- PART 9: Data Migration - Populate Category from Type
-- =====================================================

-- Migrate existing property_type to new categorization
-- This is a best-effort migration based on common patterns

UPDATE properties
SET 
    property_category = CASE
        WHEN property_type ILIKE '%condo%' THEN 'Condo'
        WHEN property_type ILIKE '%house%' THEN 'House'
        WHEN property_type ILIKE '%town%' THEN 'Townhouse'
        ELSE NULL
    END,
    property_configuration = CASE
        WHEN property_type ILIKE '%studio%' THEN 'Studio'
        WHEN property_type ILIKE '%1%bed%' OR property_type ILIKE '%one%bed%' THEN '1-Bedroom'
        WHEN property_type ILIKE '%2%bed%' OR property_type ILIKE '%two%bed%' THEN '2-Bedroom'
        WHEN property_type ILIKE '%3%bed%' OR property_type ILIKE '%three%bed%' THEN '3-Bedroom+'
        WHEN property_type ILIKE '%penthouse%' THEN 'Penthouse'
        WHEN property_type ILIKE '%detached%' THEN 'Detached'
        WHEN property_type ILIKE '%semi%' THEN 'Semi-Detached'
        WHEN property_type ILIKE '%bungalow%' THEN 'Bungalow'
        WHEN property_type ILIKE '%plex%' THEN 'Multi-Unit (Plex)'
        WHEN property_type ILIKE '%freehold%' THEN 'Freehold'
        WHEN property_type ILIKE '%stacked%' THEN 'Stacked'
        ELSE NULL
    END
WHERE property_category IS NULL;

-- =====================================================
-- PART 10: Create Views for Easy Querying
-- =====================================================

-- View: Properties with document counts
CREATE OR REPLACE VIEW properties_with_documents AS
SELECT 
    p.*,
    COUNT(pd.id) FILTER (WHERE pd.deleted_at IS NULL) as total_documents,
    COUNT(pd.id) FILTER (WHERE pd.is_public = true AND pd.deleted_at IS NULL) as public_documents,
    COUNT(pd.id) FILTER (WHERE pd.is_public = false AND pd.deleted_at IS NULL) as private_documents
FROM properties p
LEFT JOIN property_documents pd ON p.id = pd.property_id
GROUP BY p.id;

COMMENT ON VIEW properties_with_documents IS 'Properties with document counts for easy querying';

-- =====================================================
-- END OF MIGRATION
-- =====================================================
