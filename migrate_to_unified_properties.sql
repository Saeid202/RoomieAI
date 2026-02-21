-- =====================================================
-- Migrate Sales Listings to Unified Properties Table
-- =====================================================
-- This migrates all data from sales_listings to properties
-- and updates the system to use only the properties table

-- Step 1: Migrate existing sales_listings to properties table
INSERT INTO properties (
  id,
  user_id,
  listing_title,
  property_type,
  description,
  address,
  city,
  state,
  zip_code,
  neighborhood,
  latitude,
  longitude,
  public_transport_access,
  nearby_amenities,
  sales_price,
  available_date,
  bedrooms,
  bathrooms,
  square_footage,
  furnished,
  amenities,
  parking,
  pet_policy,
  utilities_included,
  special_instructions,
  roommate_preference,
  images,
  description_audio_url,
  three_d_model_url,
  video_script,
  background_music_url,
  video_enabled,
  audio_enabled,
  is_co_ownership,
  downpayment_target,
  listing_category,
  created_at,
  updated_at,
  monthly_rent -- Set to NULL for sales listings
)
SELECT 
  id,
  user_id,
  listing_title,
  property_type,
  description,
  address,
  city,
  state,
  zip_code,
  neighborhood,
  latitude,
  longitude,
  public_transport_access,
  nearby_amenities,
  sales_price,
  available_date,
  bedrooms,
  bathrooms,
  square_footage,
  furnished,
  amenities,
  parking,
  pet_policy,
  utilities_included,
  special_instructions,
  roommate_preference,
  images,
  description_audio_url,
  three_d_model_url,
  video_script,
  background_music_url,
  video_enabled,
  audio_enabled,
  is_co_ownership,
  downpayment_target,
  'sale' as listing_category, -- Mark as sale
  created_at,
  updated_at,
  NULL as monthly_rent
FROM sales_listings
WHERE id NOT IN (SELECT id FROM properties) -- Only insert if not already exists
ON CONFLICT (id) DO NOTHING;

-- Step 2: Verify migration
SELECT 
  'Migration Summary' as info,
  (SELECT COUNT(*) FROM sales_listings) as sales_listings_count,
  (SELECT COUNT(*) FROM properties WHERE listing_category = 'sale') as migrated_sales_count,
  (SELECT COUNT(*) FROM properties WHERE listing_category = 'rental') as rental_count;

-- Step 3: Show migrated properties
SELECT 
  id,
  listing_title,
  listing_category,
  sales_price,
  monthly_rent,
  property_category,
  property_configuration,
  created_at
FROM properties
WHERE listing_category = 'sale'
ORDER BY created_at DESC;

-- Step 4: Check if any documents need property_id updates
-- (They should already be correct, but let's verify)
SELECT 
  pd.id as document_id,
  pd.property_id,
  pd.document_label,
  CASE 
    WHEN p.id IS NOT NULL THEN 'In properties table'
    WHEN sl.id IS NOT NULL THEN 'Only in sales_listings'
    ELSE 'Orphaned'
  END as status
FROM property_documents pd
LEFT JOIN properties p ON p.id = pd.property_id
LEFT JOIN sales_listings sl ON sl.id = pd.property_id
WHERE pd.deleted_at IS NULL;
