-- ============================================
-- FINAL USER DELETION SCRIPT
-- User: chinaplusgroup@gmail.com
-- ============================================
-- This script handles column name variations and missing tables

DO $$
DECLARE
  target_user_id UUID;
  target_email TEXT := 'chinaplusgroup@gmail.com';
  rows_deleted INTEGER;
  has_column BOOLEAN;
BEGIN
  -- Get user ID
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = target_email;

  IF target_user_id IS NULL THEN
    RAISE NOTICE '⚠ User not found with email: %', target_email;
    RETURN;
  END IF;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'Found user ID: %', target_user_id;
  RAISE NOTICE 'Starting deletion process...';
  RAISE NOTICE '========================================';

  -- Delete from mortgage_broker_profiles
  BEGIN
    DELETE FROM mortgage_broker_profiles WHERE user_id = target_user_id;
    GET DIAGNOSTICS rows_deleted = ROW_COUNT;
    RAISE NOTICE '✓ mortgage_broker_profiles: % rows', rows_deleted;
  EXCEPTION
    WHEN undefined_table THEN RAISE NOTICE '⊘ mortgage_broker_profiles: table not found';
    WHEN undefined_column THEN RAISE NOTICE '⊘ mortgage_broker_profiles: column mismatch';
  END;

  -- Delete from mortgage_profiles
  BEGIN
    DELETE FROM mortgage_profiles WHERE user_id = target_user_id;
    GET DIAGNOSTICS rows_deleted = ROW_COUNT;
    RAISE NOTICE '✓ mortgage_profiles: % rows', rows_deleted;
  EXCEPTION
    WHEN undefined_table THEN RAISE NOTICE '⊘ mortgage_profiles: table not found';
    WHEN undefined_column THEN RAISE NOTICE '⊘ mortgage_profiles: column mismatch';
  END;

  -- Delete from tenant_profiles
  BEGIN
    DELETE FROM tenant_profiles WHERE user_id = target_user_id;
    GET DIAGNOSTICS rows_deleted = ROW_COUNT;
    RAISE NOTICE '✓ tenant_profiles: % rows', rows_deleted;
  EXCEPTION
    WHEN undefined_table THEN RAISE NOTICE '⊘ tenant_profiles: table not found';
    WHEN undefined_column THEN RAISE NOTICE '⊘ tenant_profiles: column mismatch';
  END;

  -- Delete from landlord_profiles
  BEGIN
    DELETE FROM landlord_profiles WHERE user_id = target_user_id;
    GET DIAGNOSTICS rows_deleted = ROW_COUNT;
    RAISE NOTICE '✓ landlord_profiles: % rows', rows_deleted;
  EXCEPTION
    WHEN undefined_table THEN RAISE NOTICE '⊘ landlord_profiles: table not found';
    WHEN undefined_column THEN RAISE NOTICE '⊘ landlord_profiles: column mismatch';
  END;

  -- Delete from renovator_profiles
  BEGIN
    DELETE FROM renovator_profiles WHERE user_id = target_user_id;
    GET DIAGNOSTICS rows_deleted = ROW_COUNT;
    RAISE NOTICE '✓ renovator_profiles: % rows', rows_deleted;
  EXCEPTION
    WHEN undefined_table THEN RAISE NOTICE '⊘ renovator_profiles: table not found';
    WHEN undefined_column THEN RAISE NOTICE '⊘ renovator_profiles: column mismatch';
  END;

  -- Delete from rental_applications (try different column names)
  BEGIN
    -- Try applicant_id first
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'rental_applications' AND column_name = 'applicant_id'
    ) INTO has_column;
    
    IF has_column THEN
      EXECUTE 'DELETE FROM rental_applications WHERE applicant_id = $1' USING target_user_id;
      GET DIAGNOSTICS rows_deleted = ROW_COUNT;
      RAISE NOTICE '✓ rental_applications (applicant_id): % rows', rows_deleted;
    ELSE
      -- Try user_id
      EXECUTE 'DELETE FROM rental_applications WHERE user_id = $1' USING target_user_id;
      GET DIAGNOSTICS rows_deleted = ROW_COUNT;
      RAISE NOTICE '✓ rental_applications (user_id): % rows', rows_deleted;
    END IF;
  EXCEPTION
    WHEN undefined_table THEN RAISE NOTICE '⊘ rental_applications: table not found';
    WHEN undefined_column THEN RAISE NOTICE '⊘ rental_applications: column mismatch';
    WHEN OTHERS THEN RAISE NOTICE '⊘ rental_applications: %', SQLERRM;
  END;

  -- Delete from document_access_requests
  BEGIN
    DELETE FROM document_access_requests WHERE requester_id = target_user_id;
    GET DIAGNOSTICS rows_deleted = ROW_COUNT;
    RAISE NOTICE '✓ document_access_requests: % rows', rows_deleted;
  EXCEPTION
    WHEN undefined_table THEN RAISE NOTICE '⊘ document_access_requests: table not found';
    WHEN undefined_column THEN RAISE NOTICE '⊘ document_access_requests: column mismatch';
  END;

  -- Delete from property_documents
  BEGIN
    DELETE FROM property_documents WHERE uploaded_by = target_user_id;
    GET DIAGNOSTICS rows_deleted = ROW_COUNT;
    RAISE NOTICE '✓ property_documents: % rows', rows_deleted;
  EXCEPTION
    WHEN undefined_table THEN RAISE NOTICE '⊘ property_documents: table not found';
    WHEN undefined_column THEN RAISE NOTICE '⊘ property_documents: column mismatch';
  END;

  -- Delete from properties
  BEGIN
    DELETE FROM properties WHERE user_id = target_user_id;
    GET DIAGNOSTICS rows_deleted = ROW_COUNT;
    RAISE NOTICE '✓ properties: % rows', rows_deleted;
  EXCEPTION
    WHEN undefined_table THEN RAISE NOTICE '⊘ properties: table not found';
    WHEN undefined_column THEN RAISE NOTICE '⊘ properties: column mismatch';
  END;

  -- Delete from user_profiles
  BEGIN
    DELETE FROM user_profiles WHERE id = target_user_id;
    GET DIAGNOSTICS rows_deleted = ROW_COUNT;
    RAISE NOTICE '✓ user_profiles: % rows', rows_deleted;
  EXCEPTION
    WHEN undefined_table THEN RAISE NOTICE '⊘ user_profiles: table not found';
  END;

  -- Delete from auth.users (MUST BE LAST!)
  DELETE FROM auth.users WHERE id = target_user_id;
  GET DIAGNOSTICS rows_deleted = ROW_COUNT;
  RAISE NOTICE '✓ auth.users: % rows', rows_deleted;

  RAISE NOTICE '========================================';
  RAISE NOTICE '✓✓✓ DELETION COMPLETE ✓✓✓';
  RAISE NOTICE '========================================';

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '========================================';
    RAISE NOTICE '✗ ERROR: %', SQLERRM;
    RAISE NOTICE '========================================';
    RAISE;
END $$;

-- Verify deletion
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN '✓✓✓ SUCCESS - User deleted ✓✓✓'
    ELSE '✗ User still exists'
  END as status
FROM auth.users
WHERE email = 'chinaplusgroup@gmail.com';
