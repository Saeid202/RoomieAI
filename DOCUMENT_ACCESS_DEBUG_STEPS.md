# Document Access Request - Debugging Steps

## Current Status
The buyer (saeid.shabani64@gmail.com) has an approved access request in the database, but the frontend is showing "Access request found: null".

## What We've Done

### 1. Fixed TypeScript Type Issues
- The `document_access_requests` table exists in the database but is not in the Supabase TypeScript types
- Updated `PropertyDocumentViewerSimplified.tsx` to use `as any` to bypass TypeScript checking
- Added comprehensive logging to see exactly what's happening

### 2. Enhanced Error Logging
The component now logs:
- User ID
- Property ID
- Raw query results (data and error)
- Full error details with JSON formatting
- Full request object when found

## Next Steps for Testing

### Step 1: Run SQL Verification
Run these SQL files in order to verify the database setup:

1. `verify_buyer_access.sql` - Checks if the request exists and RLS policies
2. `test_buyer_rls_access.sql` - Tests RLS policy logic

### Step 2: Test in Browser
1. Log in as buyer: saeid.shabani64@gmail.com
2. Navigate to the property page with ID: 3b80948d-74ca-494c-9c4b-9e012fb00add
3. Open browser console (F12)
4. Refresh the page
5. Look for these console messages:
   - `🔍 Checking access status for property:`
   - `👤 User ID:`
   - `📋 Raw query result - data:`
   - `📋 Raw query result - error:`

### Step 3: Analyze Console Output

#### If you see "Access request found: null"
This means the query is not returning data. Possible causes:
- RLS policy is blocking the query
- User ID doesn't match
- Property ID doesn't match

#### If you see an error object
The error will tell us what's wrong:
- `code: "PGRST116"` = Table not found (Supabase can't see the table)
- `code: "42501"` = Permission denied (RLS policy issue)
- Other codes = Different database issues

#### If you see the request object
Success! The query worked and we should see the status.

## Possible Issues and Solutions

### Issue 1: RLS Policy Blocking Access
**Symptom**: Query returns null but SQL shows the request exists

**Solution**: The RLS policy might be using `auth.uid()` which could be null in the frontend context.

**Fix**: Run this SQL to check and fix RLS:
```sql
-- Check current policy
SELECT * FROM pg_policies WHERE tablename = 'document_access_requests';

-- If needed, recreate the policy
DROP POLICY IF EXISTS "Users can view their own requests" ON document_access_requests;

CREATE POLICY "Users can view their own requests"
  ON document_access_requests FOR SELECT
  USING (auth.uid() = requester_id);
```

### Issue 2: Supabase Client Not Authenticated
**Symptom**: `auth.uid()` returns null

**Solution**: Verify the user is logged in:
```javascript
// In browser console
const { data: { user } } = await supabase.auth.getUser();
console.log('Current user:', user);
```

### Issue 3: Table Not Visible to Supabase API
**Symptom**: Error code "PGRST116" or "relation does not exist"

**Solution**: The table might not be exposed through the Supabase API. Check:
```sql
-- Verify table exists
SELECT * FROM information_schema.tables WHERE table_name = 'document_access_requests';

-- Verify it's in the public schema
SELECT schemaname, tablename FROM pg_tables WHERE tablename = 'document_access_requests';
```

## Alternative Solution: Use RPC Function

If the direct query continues to fail, we can use an RPC function instead:

1. Run `create_document_access_rpc.sql` to create the function
2. The component will automatically fall back to using the RPC function

## Expected Behavior After Fix

When working correctly:
1. Buyer logs in
2. Views property page
3. Component queries `document_access_requests` table
4. Finds approved request
5. Shows green "Access Granted" badge
6. Shows "View All Documents" button
7. Clicking button navigates to document vault

## Test Data

- **Property ID**: 3b80948d-74ca-494c-9c4b-9e012fb00add
- **Buyer User ID**: d599e69e-407f-44f4-899d-14a1e3af1103
- **Buyer Email**: saeid.shabani64@gmail.com
- **Seller Email**: info@cargoplus.site
- **Request Status**: approved
- **Request ID**: b489a5a0-6564-4abd-a5d9-0dc4c51f77b0 (or cb53eb92-3f59-4136-9790-6acd5fcf366c)

## Files Modified

1. `src/components/property/PropertyDocumentViewerSimplified.tsx` - Enhanced logging and type handling
2. `verify_buyer_access.sql` - SQL verification script
3. `test_buyer_rls_access.sql` - RLS testing script
4. `create_document_access_rpc.sql` - Alternative RPC function (if needed)
