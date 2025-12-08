-- =====================================================
-- COMPLETE SETUP FOR RENOVATION PARTNERS
-- Run this entire file in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- STEP 1: CREATE/VERIFY RENOVATION_PARTNERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.renovation_partners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    rating DECIMAL(2,1) DEFAULT 0.0 CHECK (rating >= 0.0 AND rating <= 5.0),
    review_count INTEGER DEFAULT 0 CHECK (review_count >= 0),
    specialties TEXT[] NOT NULL DEFAULT '{}',
    location VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    availability VARCHAR(100),
    hourly_rate VARCHAR(50),
    description TEXT,
    image_url VARCHAR(500),
    verified BOOLEAN DEFAULT false,
    response_time VARCHAR(100),
    completed_projects INTEGER DEFAULT 0 CHECK (completed_projects >= 0),
    years_experience INTEGER DEFAULT 0 CHECK (years_experience >= 0),
    certifications TEXT[] DEFAULT '{}',
    portfolio TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STEP 2: ADD WEBSITE_URL COLUMN
-- =====================================================

ALTER TABLE public.renovation_partners 
ADD COLUMN IF NOT EXISTS website_url VARCHAR(500);

COMMENT ON COLUMN public.renovation_partners.website_url IS 'Website or listing URL for the renovation partner';

-- =====================================================
-- STEP 3: CREATE INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_renovation_partners_active ON public.renovation_partners(is_active);
CREATE INDEX IF NOT EXISTS idx_renovation_partners_verified ON public.renovation_partners(verified);
CREATE INDEX IF NOT EXISTS idx_renovation_partners_rating ON public.renovation_partners(rating DESC);
CREATE INDEX IF NOT EXISTS idx_renovation_partners_location ON public.renovation_partners(location);
CREATE INDEX IF NOT EXISTS idx_renovation_partners_specialties ON public.renovation_partners USING GIN(specialties);
CREATE INDEX IF NOT EXISTS idx_renovation_partners_created_at ON public.renovation_partners(created_at DESC);

-- =====================================================
-- STEP 4: ENABLE RLS AND CREATE TABLE POLICIES
-- =====================================================

-- Enable RLS on the table
ALTER TABLE public.renovation_partners ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them cleanly
DROP POLICY IF EXISTS "Admins can manage renovation partners" ON public.renovation_partners;
DROP POLICY IF EXISTS "Landlords can view active renovation partners" ON public.renovation_partners;
DROP POLICY IF EXISTS "Public can view active renovation partners" ON public.renovation_partners;

-- Policy 1: Admins can manage all renovation partners (INSERT, UPDATE, DELETE, SELECT)
CREATE POLICY "Admins can manage renovation partners" ON public.renovation_partners
    FOR ALL USING (
        auth.role() = 'service_role' OR 
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data ->> 'role' = 'admin'
        )
    );

-- Policy 2: Landlords can view active renovation partners
CREATE POLICY "Landlords can view active renovation partners" ON public.renovation_partners
    FOR SELECT USING (
        is_active = true AND (
            auth.role() = 'service_role' OR 
            EXISTS (
                SELECT 1 FROM auth.users 
                WHERE auth.users.id = auth.uid() 
                AND auth.users.raw_user_meta_data ->> 'role' = 'landlord'
            )
        )
    );

-- Policy 3: Public can view active renovation partners (for non-authenticated users)
CREATE POLICY "Public can view active renovation partners" ON public.renovation_partners
    FOR SELECT USING (is_active = true);

-- =====================================================
-- STEP 5: CREATE TRIGGER FOR UPDATED_AT
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_renovation_partners_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_renovation_partners_updated_at ON public.renovation_partners;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_renovation_partners_updated_at
    BEFORE UPDATE ON public.renovation_partners
    FOR EACH ROW
    EXECUTE FUNCTION update_renovation_partners_updated_at();

-- =====================================================
-- STEP 6: CREATE STORAGE BUCKET FOR IMAGES
-- =====================================================

-- Create the renovation-partner-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'renovation-partner-images',
  'renovation-partner-images',
  true, -- Public bucket for easy access
  5242880, -- 5MB file size limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

-- =====================================================
-- STEP 7: CREATE STORAGE POLICIES
-- =====================================================
-- Note: RLS on storage.objects is already enabled by Supabase
-- We only need to create the policies

-- Drop existing storage policies (to avoid conflicts)
DROP POLICY IF EXISTS "Public can view renovation partner images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload renovation partner images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update renovation partner images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete renovation partner images" ON storage.objects;

-- Policy 1: Anyone can view renovation partner images (public access)
CREATE POLICY "Public can view renovation partner images" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'renovation-partner-images');

-- Policy 2: Admins can upload renovation partner images
CREATE POLICY "Admins can upload renovation partner images" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'renovation-partner-images' AND (
      auth.role() = 'service_role' OR 
      EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND auth.users.raw_user_meta_data ->> 'role' = 'admin'
      )
    )
  );

-- Policy 3: Admins can update renovation partner images
CREATE POLICY "Admins can update renovation partner images" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'renovation-partner-images' AND (
      auth.role() = 'service_role' OR 
      EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND auth.users.raw_user_meta_data ->> 'role' = 'admin'
      )
    )
  );

-- Policy 4: Admins can delete renovation partner images
CREATE POLICY "Admins can delete renovation partner images" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'renovation-partner-images' AND (
      auth.role() = 'service_role' OR 
      EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND auth.users.raw_user_meta_data ->> 'role' = 'admin'
      )
    )
  );

-- =====================================================
-- STEP 8: VERIFICATION QUERIES
-- =====================================================

-- Verify table structure
SELECT '=== TABLE STRUCTURE ===' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'renovation_partners' 
ORDER BY ordinal_position;

-- Verify RLS is enabled
SELECT '=== RLS STATUS ===' as info;
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'renovation_partners';

-- Verify table RLS policies
SELECT '=== TABLE POLICIES ===' as info;
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'renovation_partners'
ORDER BY policyname;

-- Verify storage bucket
SELECT '=== STORAGE BUCKET ===' as info;
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id = 'renovation-partner-images';

-- Verify storage policies
SELECT '=== STORAGE POLICIES ===' as info;
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'objects' 
AND policyname LIKE '%renovation partner%'
ORDER BY policyname;

-- Final success message
SELECT '✅ Renovation Partners setup completed successfully!' as status;

