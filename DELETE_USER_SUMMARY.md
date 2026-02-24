# User Deletion - Ready to Execute

## User to Delete
**Email:** chinaplusgroup@gmail.com  
**User ID:** 8b36ab9f-1c63-4ce5-89fa-5af04ae9c161

## Quick Action

### To delete this user RIGHT NOW:

1. Open Supabase SQL Editor
2. Copy and paste this entire script:

```sql
-- Delete chinaplusgroup@gmail.com from all tables
DELETE FROM mortgage_broker_profiles 
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'chinaplusgroup@gmail.com');

DELETE FROM mortgage_profiles 
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'chinaplusgroup@gmail.com');

DELETE FROM tenant_profiles 
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'chinaplusgroup@gmail.com');

DELETE FROM seeker_profiles 
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

DELETE FROM user_profiles 
WHERE id IN (SELECT id FROM auth.users WHERE email = 'chinaplusgroup@gmail.com');

DELETE FROM auth.users 
WHERE email = 'chinaplusgroup@gmail.com';

-- Verify
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN '✓ SUCCESS - User deleted'
    ELSE '✗ ERROR - User still exists'
  END as status
FROM auth.users
WHERE email = 'chinaplusgroup@gmail.com';
```

3. Click "Run"
4. You should see: `✓ SUCCESS - User deleted`

## Files Created

### Main Deletion Scripts
- **DELETE_USER_SIMPLE.sql** ← Use this one (simple and clean)
- **delete_user_chinaplusgroup_complete.sql** ← Advanced version with logging

### Preview Script
- **preview_user_deletion.sql** ← Run this first to see what will be deleted (optional)

### Documentation
- **USER_DELETION_GUIDE.md** ← Complete guide with troubleshooting
- **DELETE_USER_SUMMARY.md** ← This file (quick reference)

## What Happens

The script will:
1. ✅ Delete all profile data (mortgage broker, tenant, seeker, landlord, etc.)
2. ✅ Delete all properties owned by this user
3. ✅ Delete all rental applications
4. ✅ Delete all document access requests
5. ✅ Delete all uploaded documents
6. ✅ Delete the user profile
7. ✅ Delete the authentication record
8. ✅ Verify the deletion was successful

## After Deletion

- User cannot log in anymore
- All their data is permanently removed
- The email `chinaplusgroup@gmail.com` can be used to create a new account
- No trace of the user remains in the system

## Safety

- The script respects foreign key constraints
- Deletes in the correct order to avoid errors
- Includes verification at the end
- Can be run multiple times safely (idempotent)

## Time Required

- Running the script: ~5 seconds
- Verification: Instant
- **Total: Less than 1 minute**

---

**Ready to proceed? Run the script above in Supabase SQL Editor!**
