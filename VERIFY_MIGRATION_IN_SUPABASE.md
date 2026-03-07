# Verify Time-Limited Access Migration

## How to Verify

Go to your Supabase Dashboard → SQL Editor and run this query:

```sql
-- 1. Check if access_expires_at column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'document_access_requests'
  AND column_name IN ('access_expires_at', 'response_message')
ORDER BY column_name;
```

**Expected Result:**
```
column_name         | data_type                   | is_nullable
--------------------+-----------------------------+-------------
access_expires_at   | timestamp with time zone    | YES
response_message    | text                        | YES
```

## What Was Added

✅ **Database Column:** `access_expires_at TIMESTAMPTZ` - stores when access expires (NULL = permanent)
✅ **Status Value:** Added 'expired' to allowed status values
✅ **RLS Policy:** Updated to check `access_expires_at > NOW()` before granting access
✅ **Index:** Created for efficient expiration queries
✅ **Function:** `expire_document_access()` for batch expiration

## Testing the Feature

### As Landlord:
1. Go to Applications page
2. Find a document access request
3. Click "Approve"
4. Select access duration from dropdown (e.g., "24 Hours")
5. Confirm approval
6. You should see expiration countdown on the approved request

### As Buyer:
1. Request document access for a property
2. Wait for landlord approval
3. Once approved, you'll see:
   - "Access Granted" badge
   - Expiration countdown banner (e.g., "Expires in 24h")
   - Orange warning when <24 hours remaining
4. After expiration:
   - Status changes to "Access Expired"
   - Documents become inaccessible
   - Option to "Request Access Again" appears

## Security Features

- RLS policies enforce expiration at database level
- Access automatically blocked after expiration
- No manual revocation needed
- Audit trail with expiration timestamps
- Works even if user tries to bypass UI

## Ready to Test!

The migration is complete and the UI is updated. Test it out with a real document access request!
