-- Phase 1: Renovator Matching - Database Schema Enhancement
-- Adds provider/seeker distinction and matching infrastructure

-- 1. Create or enhance renovator_profiles table with new fields
CREATE TABLE IF NOT EXISTS renovator_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type TEXT DEFAULT 'provider' CHECK (user_type IN ('provider', 'seeker')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_break')),
  service_categories TEXT[] DEFAULT ARRAY[]::TEXT[],
  availability_start DATE,
  availability_end DATE,
  service_radius_km INTEGER DEFAULT 25,
  hourly_rate_min DECIMAL(10, 2),
  hourly_rate_max DECIMAL(10, 2),
  rating DECIMAL(3, 2) DEFAULT 0,
  completed_jobs INTEGER DEFAULT 0,
  response_time_hours INTEGER DEFAULT 24,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  city TEXT,
  verified BOOLEAN DEFAULT FALSE,
  available BOOLEAN DEFAULT TRUE,
  emergency_available BOOLEAN DEFAULT FALSE,
  specialization TEXT,
  services TEXT[],
  profile_completeness INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add columns if table already exists (for idempotency)
ALTER TABLE renovator_profiles
ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'provider' CHECK (user_type IN ('provider', 'seeker')),
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_break')),
ADD COLUMN IF NOT EXISTS service_categories TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS availability_start DATE,
ADD COLUMN IF NOT EXISTS availability_end DATE,
ADD COLUMN IF NOT EXISTS service_radius_km INTEGER DEFAULT 25,
ADD COLUMN IF NOT EXISTS hourly_rate_min DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS hourly_rate_max DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS rating DECIMAL(3, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS completed_jobs INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS response_time_hours INTEGER DEFAULT 24,
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- 2. Create renovation_requests table (customer needs)
CREATE TABLE IF NOT EXISTS renovation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  intent TEXT NOT NULL DEFAULT 'renovation',
  emergency BOOLEAN DEFAULT FALSE,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  work_type TEXT NOT NULL,
  description TEXT,
  budget_min DECIMAL(10, 2),
  budget_max DECIMAL(10, 2),
  timeline TEXT CHECK (timeline IN ('urgent', 'this_week', 'this_month', 'flexible')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'matched', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '48 hours',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create renovation_matches table (connection records)
CREATE TABLE IF NOT EXISTS renovation_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES renovation_requests(id) ON DELETE CASCADE,
  renovator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_score DECIMAL(5, 2) DEFAULT 0,
  match_reason TEXT,
  customer_accepted BOOLEAN DEFAULT FALSE,
  renovator_accepted BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted_both', 'rejected', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '24 hours',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_renovation_requests_user_id ON renovation_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_renovation_requests_city ON renovation_requests(city);
CREATE INDEX IF NOT EXISTS idx_renovation_requests_status ON renovation_requests(status);
CREATE INDEX IF NOT EXISTS idx_renovation_requests_expires_at ON renovation_requests(expires_at);
CREATE INDEX IF NOT EXISTS idx_renovation_matches_request_id ON renovation_matches(request_id);
CREATE INDEX IF NOT EXISTS idx_renovation_matches_renovator_id ON renovation_matches(renovator_id);
CREATE INDEX IF NOT EXISTS idx_renovation_matches_customer_id ON renovation_matches(customer_id);
CREATE INDEX IF NOT EXISTS idx_renovation_matches_status ON renovation_matches(status);
CREATE INDEX IF NOT EXISTS idx_renovator_profiles_user_type ON renovator_profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_renovator_profiles_status ON renovator_profiles(status);
CREATE INDEX IF NOT EXISTS idx_renovator_profiles_city ON renovator_profiles(city);
CREATE INDEX IF NOT EXISTS idx_renovator_profiles_service_categories ON renovator_profiles USING GIN(service_categories);

-- 5. Enable PostGIS for geographic queries (if not already enabled)
CREATE EXTENSION IF NOT EXISTS postgis;

-- 6. Add geographic index for location-based matching
CREATE INDEX IF NOT EXISTS idx_renovator_profiles_location ON renovator_profiles USING GIST(
  ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
);

-- 7. Create function to calculate match score
CREATE OR REPLACE FUNCTION calculate_renovation_match_score(
  p_service_categories TEXT[],
  p_renovator_services TEXT[],
  p_customer_city TEXT,
  p_renovator_city TEXT,
  p_renovator_latitude DECIMAL,
  p_renovator_longitude DECIMAL,
  p_customer_latitude DECIMAL,
  p_customer_longitude DECIMAL,
  p_service_radius_km INTEGER,
  p_availability_start DATE,
  p_timeline TEXT,
  p_rating DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
  v_service_score DECIMAL := 0;
  v_location_score DECIMAL := 0;
  v_availability_score DECIMAL := 0;
  v_quality_score DECIMAL := 0;
  v_distance_km DECIMAL;
BEGIN
  -- Service Match (0-40 points)
  IF p_service_categories && p_renovator_services THEN
    v_service_score := 40; -- Exact match
  ELSIF p_renovator_services @> ARRAY['general'] THEN
    v_service_score := 10; -- General contractor
  ELSE
    v_service_score := 0;
  END IF;

  -- Location Match (0-30 points)
  IF p_customer_city ILIKE p_renovator_city THEN
    v_location_score := 30; -- Same city
  ELSIF p_renovator_latitude IS NOT NULL AND p_renovator_longitude IS NOT NULL 
    AND p_customer_latitude IS NOT NULL AND p_customer_longitude IS NOT NULL THEN
    v_distance_km := ST_Distance(
      ST_SetSRID(ST_MakePoint(p_renovator_longitude, p_renovator_latitude), 4326),
      ST_SetSRID(ST_MakePoint(p_customer_longitude, p_customer_latitude), 4326)
    ) / 1000;
    
    IF v_distance_km <= p_service_radius_km THEN
      v_location_score := 20;
    ELSE
      v_location_score := 0;
    END IF;
  ELSE
    v_location_score := 0;
  END IF;

  -- Availability Match (0-20 points)
  IF p_availability_start <= CURRENT_DATE THEN
    v_availability_score := 20; -- Can start immediately
  ELSIF p_timeline = 'urgent' AND p_availability_start <= CURRENT_DATE + INTERVAL '3 days' THEN
    v_availability_score := 20;
  ELSIF p_timeline = 'this_week' AND p_availability_start <= CURRENT_DATE + INTERVAL '7 days' THEN
    v_availability_score := 15;
  ELSIF p_timeline = 'this_month' AND p_availability_start <= CURRENT_DATE + INTERVAL '30 days' THEN
    v_availability_score := 10;
  ELSE
    v_availability_score := 5;
  END IF;

  -- Quality Match (0-10 points)
  IF p_rating >= 4.5 THEN
    v_quality_score := 10;
  ELSIF p_rating >= 4.0 THEN
    v_quality_score := 5;
  ELSIF p_rating > 0 THEN
    v_quality_score := 2;
  ELSE
    v_quality_score := 0;
  END IF;

  RETURN v_service_score + v_location_score + v_availability_score + v_quality_score;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 8. Create function to find renovation matches
CREATE OR REPLACE FUNCTION find_renovation_matches(
  p_request_id UUID,
  p_limit INTEGER DEFAULT 3
) RETURNS TABLE (
  renovator_id UUID,
  match_score DECIMAL,
  name TEXT,
  rating DECIMAL,
  completed_jobs INTEGER,
  services TEXT[],
  availability_start DATE,
  hourly_rate_min DECIMAL,
  hourly_rate_max DECIMAL
) AS $$
DECLARE
  v_request RECORD;
BEGIN
  -- Get request details
  SELECT * INTO v_request FROM renovation_requests WHERE id = p_request_id;
  
  IF v_request IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT 
    rp.user_id,
    calculate_renovation_match_score(
      ARRAY[v_request.work_type],
      rp.service_categories,
      v_request.city,
      rp.city,
      rp.latitude,
      rp.longitude,
      v_request.latitude,
      v_request.longitude,
      rp.service_radius_km,
      rp.availability_start,
      v_request.timeline,
      rp.rating
    ) as match_score,
    COALESCE(up.full_name, up.email) as name,
    rp.rating,
    rp.completed_jobs,
    rp.service_categories,
    rp.availability_start,
    rp.hourly_rate_min,
    rp.hourly_rate_max
  FROM renovator_profiles rp
  JOIN auth.users up ON rp.user_id = up.id
  WHERE rp.user_type = 'provider'
    AND rp.status = 'active'
    AND rp.verified = true
    AND rp.user_id != v_request.user_id
  ORDER BY match_score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- 9. Create RLS policies for renovation_requests
ALTER TABLE renovation_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own requests" ON renovation_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create requests" ON renovation_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own requests" ON renovation_requests
  FOR UPDATE USING (auth.uid() = user_id);

-- 10. Create RLS policies for renovation_matches
ALTER TABLE renovation_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view their matches" ON renovation_matches
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Renovators can view their matches" ON renovation_matches
  FOR SELECT USING (auth.uid() = renovator_id);

CREATE POLICY "System can create matches" ON renovation_matches
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Both parties can update match status" ON renovation_matches
  FOR UPDATE USING (auth.uid() = customer_id OR auth.uid() = renovator_id);

-- 11. Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER renovation_requests_update_timestamp
  BEFORE UPDATE ON renovation_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER renovation_matches_update_timestamp
  BEFORE UPDATE ON renovation_matches
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();
