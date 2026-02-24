# User Deletion Guide

## User to Delete
**Email:** chinaplusgroup@gmail.com

## ⚠️ WARNING
This will **permanently delete** the user and **ALL their data** from the database. This action **CANNOT be undone**.

## Step-by-Step Process

### Step 1: Preview What Will Be Deleted (RECOMMENDED)
Run `preview_user_deletion.sql` in Supabase SQL Editor to see:
- All tables where this user has data
- How many records will be deleted
- Details of what will be removed

This is a **read-only** query that won't delete anything.

### Step 2: Choose Your Deletion Method

#### Option A: Simple Script (Recommended)
**File:** `DELETE_USER_SIMPLE.sql`

This is a straightforward script that:
- Deletes from all tables in the correct order
- Handles foreign key constraints properly
- Verifies the deletion was successful

**How to use:**
1. Open Supabase SQL Editor
2. Copy and paste the entire contents of `DELETE_USER_SIMPLE.sql`
3. Click "Run"
4. Check the verification message at the end

#### Option B: Advanced Script with Logging
**File:** `delete_user_chinaplusgroup_complete.sql`

This script:
- Uses a PL/pgSQL block for better error handling
- Logs each deletion step
- Handles tables that might not exist
- More verbose output

**How to use:**
1. Open Supabase SQL Editor
2. Copy and paste the entire contents of `delete_user_chinaplusgroup_complete.sql`
3. Click "Run"
4. Check the detailed log messages

### Step 3: Verify Deletion
Both scripts include verification queries at the end. You should see:
- `✓ SUCCESS - User completely deleted`
- `remaining_records: 0`

## What Gets Deleted

The user will be removed from these tables:
1. `mortgage_broker_profiles` - Broker profile data
2. `mortgage_profiles` - Mortgage application data
3. `tenant_profiles` - Tenant profile data
4. `seeker_profiles` - Seeker profile data
5. `landlord_profiles` - Landlord profile data
6. `renovator_profiles` - Renovator profile data
7. `properties` - Any properties they own
8. `rental_applications` - Any rental applications they submitted
9. `document_access_requests` - Any document access requests
10. `property_documents` - Any documents they uploaded
11. `user_profiles` - Main user profile
12. `auth.users` - Authentication record (DELETED LAST)

## Deletion Order (Important!)

The scripts delete in this order to respect foreign key constraints:
1. Child tables first (profiles, applications, documents)
2. `user_profiles` second-to-last
3. `auth.users` LAST (because other tables reference it)

## After Deletion

Once deleted:
- ✅ User cannot log in anymore
- ✅ All their data is removed from the database
- ✅ Their email can be used to create a new account
- ✅ No trace of the user remains in the system

## Troubleshooting

### Error: "violates foreign key constraint"
This means there's a table with data referencing this user that wasn't included in the script.

**Solution:**
1. Check the error message for the table name
2. Add a DELETE statement for that table before deleting from `user_profiles`
3. Run the script again

### Error: "permission denied"
You need admin/superuser access to delete from `auth.users`.

**Solution:**
1. Make sure you're logged into Supabase as the project owner
2. Use the SQL Editor in the Supabase Dashboard (not a client connection)

### User still exists after running script
**Solution:**
1. Run `preview_user_deletion.sql` to see what's left
2. Check for any error messages in the SQL output
3. Try running the script again

## Files Reference

- `preview_user_deletion.sql` - Preview what will be deleted (READ-ONLY)
- `DELETE_USER_SIMPLE.sql` - Simple deletion script (RECOMMENDED)
- `delete_user_chinaplusgroup_complete.sql` - Advanced script with logging
- `USER_DELETION_GUIDE.md` - This guide

## Quick Start

If you just want to delete the user quickly:

1. Open Supabase SQL Editor
2. Run `DELETE_USER_SIMPLE.sql`
3. Done!

The script handles everything automatically and shows you a success message when complete.
