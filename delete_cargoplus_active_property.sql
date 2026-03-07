-- FORCE DELETE ACTIVE PROPERTY for info@cargoplus.site
-- This will delete the property and ALL related data in the correct order

-- ============================================
-- STEP 1: Find the active property ID
-- ============================================
DO $$
DECLARE
  v_property_id UUID;
  v_user_id UUID;
BEGIN
  -- Get user ID
  SELECT u.id INTO v_user_id
  FROM auth.users u
  WHERE u.email = 'info@cargoplus.site';

  -- Get the active property ID
  SELECT p.id INTO v_property_id
  FROM properties p
  WHERE p.user_id = v_user_id
    AND p.status = 'active'
  LIMIT 1;

  RAISE NOTICE 'User ID: %', v_user_id;
  RAISE NOTICE 'Active Property ID: %', v_property_id;

  IF v_property_id IS NULL THEN
    RAISE NOTICE 'No active property found for this landlord';
    RETURN;
  END IF;

  -- ============================================
  -- STEP 2: Delete in correct order to avoid foreign key errors
  -- ============================================

  -- 1. Delete lease contracts
  DELETE FROM lease_contracts WHERE property_id = v_property_id;
  RAISE NOTICE '✓ Deleted lease contracts';

  -- 2. Delete rental applications
  DELETE FROM rental_applications WHERE property_id = v_property_id;
  RAISE NOTICE '✓ Deleted rental applications';

  -- 3. Delete rental payments
  DELETE FROM rental_payments WHERE property_id = v_property_id;
  RAISE NOTICE '✓ Deleted rental payments';

  -- 4. Delete property documents
  DELETE FROM property_documents WHERE property_id = v_property_id;
  RAISE NOTICE '✓ Deleted property documents';

  -- 5. Delete landlord availability (if table exists)
  BEGIN
    DELETE FROM landlord_availability WHERE property_id = v_property_id;
    RAISE NOTICE '✓ Deleted landlord availability';
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE '⚠ landlord_availability table does not exist, skipping';
  END;

  -- 6. Delete sales listings (if any)
  BEGIN
    DELETE FROM sales_listings WHERE property_id = v_property_id;
    RAISE NOTICE '✓ Deleted sales listings';
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE '⚠ sales_listings table does not exist, skipping';
  END;

  -- 7. Delete document access requests (if table exists)
  BEGIN
    DELETE FROM document_access_requests WHERE property_id = v_property_id;
    RAISE NOTICE '✓ Deleted document access requests';
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE '⚠ document_access_requests table does not exist, skipping';
  END;

  -- 8. Delete AI property knowledge (if table exists)
  BEGIN
    DELETE FROM ai_property_knowledge WHERE property_id = v_property_id;
    RAISE NOTICE '✓ Deleted AI property knowledge';
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE '⚠ ai_property_knowledge table does not exist, skipping';
  END;

  -- 9. Finally, delete the property itself
  DELETE FROM properties WHERE id = v_property_id;
  RAISE NOTICE '✓ Deleted property';

  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ PROPERTY DELETED SUCCESSFULLY';
  RAISE NOTICE '========================================';

END $$;

-- ============================================
-- VERIFICATION: Check if property still exists
-- ============================================
SELECT 
  '=== VERIFICATION ===' as section,
  COUNT(*) as remaining_active_properties
FROM properties p
INNER JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'info@cargoplus.site'
  AND p.status = 'active';
