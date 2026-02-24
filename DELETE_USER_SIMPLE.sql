-- ============================================
-- SIMPLE USER DELETION
-- User: chinaplusgroup@gmail.com
-- ============================================
-- WARNING: This will permanently delete the user and all their data!
-- Run preview_user_deletion.sql first to see what will be deleted

-- Delete from all tables (order matters due to foreign keys)
-- 1. Delete from child tables first
DELETE FROM mortgage_broker_profiles 
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'chinaplusgroup@gmail.com');

DELETE FROM mortgage_profiles 
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'chinaplusgroup@gmail.com');

DELETE FROM tenant_profiles 
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'chinaplusgroup@gmail.com');

DELETE FROM landlord_profiles 
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'chinaplusgroup@gmail.com');

DELETE FROM renovator_profiles 
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'chinaplusgroup@gmail.com');

DELETE FROM document_access_requests 
WHERE requester_id IN (SELECT id FROM auth.users WHERE email = 'chinaplusgroup@gmail.com');

DELETE FROM rental_applications 
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'chinaplusgroup@gmail.com');

DELETE FROM property_documents 
WHERE uploaded_by IN (SELECT id FROM auth.users WHERE email = 'chinaplusgroup@gmail.com');

DELETE FROM properties 
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'chinaplusgroup@gmail.com');

-- 2. Delete from user_profiles
DELETE FROM user_profiles 
WHERE id IN (SELECT id FROM auth.users WHERE email = 'chinaplusgroup@gmail.com');

-- 3. Delete from auth.users (MUST BE LAST!)
DELETE FROM auth.users 
WHERE email = 'chinaplusgroup@gmail.com';

-- Verify deletion
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN '✓ SUCCESS - User completely deleted'
    ELSE '✗ ERROR - User still exists'
  END as status,
  COUNT(*) as remaining_records
FROM auth.users
WHERE email = 'chinaplusgroup@gmail.com';
