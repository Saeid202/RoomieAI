-- ============================================
-- COMPLETE USER DELETION SCRIPT
-- User: chinaplusgroup@gmail.com
-- ============================================
-- This script removes the user from ALL tables in the database
-- Run this in Supabase SQL Editor

-- First, get the user ID for reference
DO $$
DECLARE
  target_user_id UUID;
  target_email TEXT := 'chinaplusgroup@gmail.com';
BEGIN
  -- Get user ID
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = target_email;

  IF target_user_id IS NULL THEN
    RAISE NOTICE 'User not found with email: %', target_email;
    RETURN;
  END IF;

  RAISE NOTICE 'Found user ID: %', target_user_id;
  RAISE NOTICE 'Starting deletion process...';

  -- Delete from mortgage_broker_profiles
  DELETE FROM mortgage_broker_profiles WHERE user_id = target_user_id;
  RAISE NOTICE '✓ Deleted from mortgage_broker_profiles';

  -- Delete from mortgage_profiles
  DELETE FROM mortgage_profiles WHERE user_id = target_user_id;
  RAISE NOTICE '✓ Deleted from mortgage_profiles';

  -- Delete from tenant_profiles
  DELETE FROM tenant_profiles WHERE user_id = target_user_id;
  RAISE NOTICE '✓ Deleted from tenant_profiles';

  -- Delete from seeker_profiles
  DELETE FROM seeker_profiles WHERE user_id = target_user_id;
  RAISE NOTICE '✓ Deleted from seeker_profiles';

  -- Delete from landlord_profiles
  DELETE FROM landlord_profiles WHERE user_id = target_user_id;
  RAISE NOTICE '✓ Deleted from landlord_profiles';

  -- Delete from renovator_profiles
  DELETE FROM renovator_profiles WHERE user_id = target_user_id;
  RAISE NOTICE '✓ Deleted from renovator_profiles';

  -- Delete from properties (if user owns any)
  DELETE FROM properties WHERE user_id = target_user_id;
  RAISE NOTICE '✓ Deleted from properties';

  -- Delete from rental_applications
  DELETE FROM rental_applications WHERE user_id = target_user_id;
  RAISE NOTICE '✓ Deleted from rental_applications';

  -- Delete from document_access_requests
  DELETE FROM document_access_requests WHERE requester_id = target_user_id;
  RAISE NOTICE '✓ Deleted from document_access_requests';

  -- Delete from property_documents (if user uploaded any)
  DELETE FROM property_documents WHERE uploaded_by = target_user_id;
  RAISE NOTICE '✓ Deleted from property_documents';

  -- Delete from messages (if table exists)
  BEGIN
    DELETE FROM messages WHERE sender_id = target_user_id OR receiver_id = target_user_id;
    RAISE NOTICE '✓ Deleted from messages';
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE '⊘ messages table does not exist, skipping';
  END;

  -- Delete from chats (if table exists)
  BEGIN
    DELETE FROM chats WHERE user_id = target_user_id;
    RAISE NOTICE '✓ Deleted from chats';
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE '⊘ chats table does not exist, skipping';
  END;

  -- Delete from payment_methods (if table exists)
  BEGIN
    DELETE FROM payment_methods WHERE user_id = target_user_id;
    RAISE NOTICE '✓ Deleted from payment_methods';
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE '⊘ payment_methods table does not exist, skipping';
  END;

  -- Delete from transactions (if table exists)
  BEGIN
    DELETE FROM transactions WHERE user_id = target_user_id;
    RAISE NOTICE '✓ Deleted from transactions';
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE '⊘ transactions table does not exist, skipping';
  END;

  -- Delete from user_profiles (IMPORTANT: Do this before auth.users)
  DELETE FROM user_profiles WHERE id = target_user_id;
  RAISE NOTICE '✓ Deleted from user_profiles';

  -- Delete from auth.users (THIS MUST BE LAST!)
  DELETE FROM auth.users WHERE id = target_user_id;
  RAISE NOTICE '✓ Deleted from auth.users';

  RAISE NOTICE '========================================';
  RAISE NOTICE '✓ USER DELETION COMPLETE!';
  RAISE NOTICE 'User % has been removed from all tables', target_email;
  RAISE NOTICE '========================================';

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '✗ ERROR: %', SQLERRM;
    RAISE NOTICE 'Deletion may be incomplete. Check error above.';
END $$;

-- Verify deletion
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN '✓ SUCCESS - User completely deleted'
    ELSE '✗ ERROR - User still exists in some tables'
  END as deletion_status
FROM auth.users
WHERE email = 'chinaplusgroup@gmail.com';
