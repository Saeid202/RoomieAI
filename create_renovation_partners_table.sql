-- Create renovation_partners table for admin management
-- Run this in Supabase SQL Editor

-- =====================================================
-- 1. CREATE TABLE
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
-- 2. CREATE INDEXES
-- =====================================================

-- Index on active status for filtering
CREATE INDEX IF NOT EXISTS idx_renovation_partners_active ON public.renovation_partners(is_active);

-- Index on verified status for filtering
CREATE INDEX IF NOT EXISTS idx_renovation_partners_verified ON public.renovation_partners(verified);

-- Index on rating for sorting
CREATE INDEX IF NOT EXISTS idx_renovation_partners_rating ON public.renovation_partners(rating DESC);

-- Index on location for filtering
CREATE INDEX IF NOT EXISTS idx_renovation_partners_location ON public.renovation_partners(location);

-- Index on specialties for filtering (GIN index for array operations)
CREATE INDEX IF NOT EXISTS idx_renovation_partners_specialties ON public.renovation_partners USING GIN(specialties);

-- Index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_renovation_partners_created_at ON public.renovation_partners(created_at DESC);

-- =====================================================
-- 3. ENABLE RLS AND CREATE POLICIES
-- =====================================================

-- Enable RLS on the table
ALTER TABLE public.renovation_partners ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can manage renovation partners" ON public.renovation_partners;
DROP POLICY IF EXISTS "Landlords can view active renovation partners" ON public.renovation_partners;
DROP POLICY IF EXISTS "Public can view active renovation partners" ON public.renovation_partners;

-- Policy: Admins can manage all renovation partners
CREATE POLICY "Admins can manage renovation partners" ON public.renovation_partners
    FOR ALL USING (
        auth.role() = 'service_role' OR 
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data ->> 'role' = 'admin'
        )
    );

-- Policy: Landlords can view active renovation partners
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

-- Policy: Public can view active renovation partners (for non-authenticated users)
CREATE POLICY "Public can view active renovation partners" ON public.renovation_partners
    FOR SELECT USING (is_active = true);

-- =====================================================
-- 4. CREATE TRIGGER FOR UPDATED_AT
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_renovation_partners_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_update_renovation_partners_updated_at
    BEFORE UPDATE ON public.renovation_partners
    FOR EACH ROW
    EXECUTE FUNCTION update_renovation_partners_updated_at();

-- =====================================================
-- 5. INSERT SAMPLE DATA (Optional)
-- =====================================================

-- Insert sample renovation partners for testing
INSERT INTO public.renovation_partners (
    name, company, rating, review_count, specialties, location, 
    phone, email, availability, hourly_rate, description, 
    verified, response_time, completed_projects, years_experience,
    certifications, portfolio, is_active, created_by
) VALUES 
(
    'Mike Johnson',
    'Premier Renovations',
    4.9,
    127,
    ARRAY['Kitchen Remodeling', 'Bathroom Renovation', 'Flooring', 'Painting'],
    'Downtown Toronto',
    '(416) 555-0123',
    'mike@premierrenovations.ca',
    'Available this week',
    '$85/hour',
    'Licensed contractor with 15+ years experience in residential renovations. Specializing in kitchen and bathroom remodels with attention to detail and quality craftsmanship.',
    true,
    'Within 2 hours',
    234,
    15,
    ARRAY['Licensed Contractor', 'WSIB Certified', 'First Aid Certified'],
    ARRAY['Modern Kitchen Remodel', 'Luxury Bathroom', 'Hardwood Flooring'],
    true,
    (SELECT id FROM auth.users LIMIT 1)
),
(
    'Sarah Chen',
    'EcoBuild Solutions',
    4.8,
    89,
    ARRAY['Eco-Friendly Renovations', 'Solar Installation', 'Green Building', 'Energy Efficiency'],
    'North York',
    '(416) 555-0456',
    'sarah@ecobuild.ca',
    'Available next week',
    '$95/hour',
    'Environmental engineer turned contractor, specializing in sustainable and eco-friendly home renovations. LEED certified with focus on energy efficiency.',
    true,
    'Within 4 hours',
    156,
    12,
    ARRAY['LEED Certified', 'Green Building Professional', 'Solar Installation Certified'],
    ARRAY['Eco Kitchen Renovation', 'Solar Panel Installation', 'Green Bathroom'],
    true,
    (SELECT id FROM auth.users LIMIT 1)
),
(
    'David Rodriguez',
    'Classic Home Improvements',
    4.7,
    203,
    ARRAY['General Contracting', 'Roofing', 'Siding', 'Windows', 'Doors'],
    'Scarborough',
    '(416) 555-0789',
    'david@classichome.ca',
    'Available in 2 weeks',
    '$75/hour',
    'Full-service contractor with 20+ years experience. Specializing in exterior home improvements, roofing, and general contracting services.',
    true,
    'Within 6 hours',
    312,
    20,
    ARRAY['Licensed Contractor', 'Roofing Specialist', 'Window Installation Certified'],
    ARRAY['Complete Roof Replacement', 'Siding Installation', 'Window Upgrade'],
    true,
    (SELECT id FROM auth.users LIMIT 1)
);

-- =====================================================
-- 6. VERIFICATION QUERIES
-- =====================================================

-- Verify the table was created successfully
SELECT 'Renovation partners table created successfully' as status;

-- Check table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'renovation_partners' 
ORDER BY ordinal_position;

-- Check indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'renovation_partners';

-- Check RLS policies
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'renovation_partners';

-- Check sample data
SELECT id, name, company, rating, specialties, location, is_active, verified
FROM public.renovation_partners 
ORDER BY created_at DESC;
