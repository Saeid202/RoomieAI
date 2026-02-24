-- ============================================
-- SAFE USER DELETION
-- User: chinaplusgroup@gmail.com
-- ============================================
-- This script only deletes from tables that exist
-- It won't fail if a table doesn't exist

DO $$
DECLARE
  target_user_id UUID;
  target_email TEXT := 'chinaplusgroup@gmail.com';
  rows_deleted INTEGER;
BEGIN
  -- Get user ID
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = target_email;

  IF target_user_id IS NULL THEN
    RAISE NOTICE '⚠ User not found with email: %', target_email;
    RETURN;
  END IF;

  RAISE NOTICE 'Found user ID: %', target_user_id;
  RAISE NOTICE 'Starting deletion process...';
  RAISE NOTICE '========================================';

  -- Delete from mortgage_broker_profiles
  BEGIN
    DELETE FROM mortgage_broker_profiles WHERE user_id = target_user_id;
    GET DIAGNOSTICS rows_deleted = ROW_COUNT;
    RAISE NOTICE '✓ mortgage_broker_profiles: % rows deleted', rows_deleted;
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE '⊘ mortgage_broker_profiles table does not exist';
  END;

  -- Delete from mortgage_profiles
  BEGIN
    DELETE FROM mortgage_profiles WHERE user_id = target_user_id;
    GET DIAGNOSTICS rows_deleted = ROW_COUNT;
    RAISE NOTICE '✓ mortgage_profiles: % rows deleted', rows_deleted;
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE '⊘ mortgage_profiles table does not exist';
  END;

  -- Delete from tenant_profiles
  BEGIN
    DELETE FROM tenant_profiles WHERE user_id = target_user_id;
    GET DIAGNOSTICS rows_deleted = ROW_COUNT;
    RAISE NOTICE '✓ tenant_profiles: % rows deleted', rows_deleted;
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE '⊘ tenant_profiles table does not exist';
  END;

  -- Delete from seeker_profiles (might not exist)
  BEGIN
    DELETE FROM seeker_profiles WHERE user_id = target_user_id;
    GET DIAGNOSTICS rows_deleted = ROW_COUNT;
    RAISE NOTICE '✓ seeker_profiles: % rows deleted', rows_deleted;
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE '⊘ seeker_profiles table does not exist';
  END;

  -- Delete from landlord_profiles
  BEGIN
    DELETE FROM landlord_profiles WHERE user_id = target_user_id;
    GET DIAGNOSTICS rows_deleted = ROW_COUNT;
    RAISE NOTICE '✓ landlord_profiles: % rows deleted', rows_deleted;
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE '⊘ landlord_profiles table does not exist';
  END;

  -- Delete from renovator_profiles
  BEGIN
    DELETE FROM renovator_profiles WHERE user_id = target_user_id;
    GET DIAGNOSTICS rows_deleted = ROW_COUNT;
    RAISE NOTICE '✓ renovator_profiles: % rows deleted', rows_deleted;
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE '⊘ renovator_profiles table does not exist';
  END;

  -- Delete from document_access_requests
  BEGIN
    DELETE FROM document_access_requests WHERE requester_id = target_user_id;
    GET DIAGNOSTICS rows_deleted = ROW_COUNT;
    RAISE NOTICE '✓ document_access_requests: % rows deleted', rows_deleted;
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE '⊘ document_access_requests table does not exist';
  END;

  -- Delete from rental_applications
  BEGIN
    DELETE FROM rental_applications WHERE user_id = target_user_id;
    GET DIAGNOSTICS rows_deleted = ROW_COUNT;
    RAISE NOTICE '✓ rental_applications: % rows deleted', rows_deleted;
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE '⊘ rental_applications table does not exist';
  END;

  -- Delete from property_documents
  BEGIN
    DELETE FROM property_documents WHERE uploaded_by = target_user_id;
    GET DIAGNOSTICS rows_deleted = ROW_COUNT;
    RAISE NOTICE '✓ property_documents: % rows deleted', rows_deleted;
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE '⊘ property_documents table does not exist';
  END;

  -- Delete from properties
  BEGIN
    DELETE FROM properties WHERE user_id = target_user_id;
    GET DIAGNOSTICS rows_deleted = ROW_COUNT;
    RAISE NOTICE '✓ properties: % rows deleted', rows_deleted;
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE '⊘ properties table does not exist';
  END;

  -- Delete from messages
  BEGIN
    DELETE FROM messages WHERE sender_id = target_user_id OR receiver_id = target_user_id;
    GET DIAGNOSTICS rows_deleted = ROW_COUNT;
    RAISE NOTICE '✓ messages: % rows deleted', rows_deleted;
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE '⊘ messages table does not exist';
  END;

  -- Delete from chats
  BEGIN
    DELETE FROM chats WHERE user_id = target_user_id;
    GET DIAGNOSTICS rows_deleted = ROW_COUNT;
    RAISE NOTICE '✓ chats: % rows deleted', rows_deleted;
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE '⊘ chats table does not exist';
  END;

  -- Delete from payment_methods
  BEGIN
    DELETE FROM payment_methods WHERE user_id = target_user_id;
    GET DIAGNOSTICS rows_deleted = ROW_COUNT;
    RAISE NOTICE '✓ payment_methods: % rows deleted', rows_deleted;
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE '⊘ payment_methods table does not exist';
  END;

  -- Delete from transactions
  BEGIN
    DELETE FROM transactions WHERE user_id = target_user_id;
    GET DIAGNOSTICS rows_deleted = ROW_COUNT;
    RAISE NOTICE '✓ transactions: % rows deleted', rows_deleted;
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE '⊘ transactions table does not exist';
  END;

  -- Delete from user_profiles (IMPORTANT: Before auth.users)
  BEGIN
    DELETE FROM user_profiles WHERE id = target_user_id;
    GET DIAGNOSTICS rows_deleted = ROW_COUNT;
    RAISE NOTICE '✓ user_profiles: % rows deleted', rows_deleted;
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE '⊘ user_profiles table does not exist';
  END;

  -- Delete from auth.users (MUST BE LAST!)
  DELETE FROM auth.users WHERE id = target_user_id;
  GET DIAGNOSTICS rows_deleted = ROW_COUNT;
  RAISE NOTICE '✓ auth.users: % rows deleted', rows_deleted;

  RAISE NOTICE '========================================';
  RAISE NOTICE '✓✓✓ USER DELETION COMPLETE! ✓✓✓';
  RAISE NOTICE 'User % has been removed', target_email;
  RAISE NOTICE '========================================';

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '========================================';
    RAISE NOTICE '✗ ERROR OCCURRED: %', SQLERRM;
    RAISE NOTICE 'Deletion may be incomplete';
    RAISE NOTICE '========================================';
    RAISE;
END $$;

-- Verify deletion
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN '✓✓✓ SUCCESS - User completely deleted ✓✓✓'
    ELSE '✗ ERROR - User still exists in auth.users'
  END as final_status,
  COUNT(*) as remaining_records
FROM auth.users
WHERE email = 'chinaplusgroup@gmail.com';
