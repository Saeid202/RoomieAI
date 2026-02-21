# Debug Guide: Document Access Requests Not Showing

## Current Status
The system has been updated but requests are not appearing in Sales Inquiries tab.

## Debugging Steps

### Step 1: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Clear console
4. Navigate to Sales Inquiries tab
5. Look for these log messages:
   - `🔍 Loading document requests for user: [user-id]`
   - `📦 Sales properties found: [count]`
   - `🔑 Property IDs to check: [array]`
   - `📨 Document requests found: [count]`

### Step 2: Try Creating a Request
1. As a BUYER (not the property owner):
   - Go to a sales listing detail page
   - Scroll to "Property Documents" section
   - Click "Request Full Document Access"
   - Add a message and submit

2. Watch console for:
   - `📤 Requesting document access for property: [id]`
   - `👤 User profile: [data]`
   - `📝 Creating request with data: [object]`
   - `✅ Request created successfully: [data]`

3. If you see errors, note them down

### Step 3: Verify Database
Run this in Supabase SQL Editor:

```sql
-- Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'document_access_requests'
) as table_exists;

-- Check for any requests
SELECT COUNT(*) FROM document_access_requests;

-- Show all requests
SELECT * FROM document_access_requests ORDER BY requested_at DESC;
```

### Step 4: Check RLS Policies
Run this in Supabase SQL Editor:

```sql
-- View RLS policies
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'document_access_requests';
```

### Step 5: Test Manual Insert
Run `debug_document_requests.sql` to see detailed information.

## Common Issues & Solutions

### Issue 1: Table Doesn't Exist
**Symptom**: Error about table not found
**Solution**: Run `create_document_access_requests_table.sql` again

### Issue 2: RLS Blocking Queries
**Symptom**: Queries return empty even though data exists
**Solution**: Check if you're logged in as the correct user (property owner)

### Issue 3: No Sales Properties
**Symptom**: Console shows "No sales properties found"
**Solution**: 
- Verify you have properties with `listing_category = 'sale'`
- Run: `SELECT * FROM properties WHERE listing_category = 'sale' AND user_id = auth.uid();`

### Issue 4: Wrong User Context
**Symptom**: Requests created but not visible
**Solution**: 
- Requests are only visible to property owners
- Make sure you're logged in as the seller when checking Sales Inquiries
- Make sure you're logged in as a different user (buyer) when creating requests

### Issue 5: TypeScript Errors Blocking Compilation
**Symptom**: App won't compile due to type errors
**Solution**: The code will work at runtime. To fix types:
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/integrations/supabase/types.ts
```

## Expected Console Output

### When Loading Sales Inquiries (as seller):
```
🔍 Loading document requests for user: abc-123-def
📦 Sales properties found: 2 [{id: "prop-1"}, {id: "prop-2"}]
🔑 Property IDs to check: ["prop-1", "prop-2"]
📨 Document requests found: 1 [{id: "req-1", status: "pending", ...}]
```

### When Creating Request (as buyer):
```
📤 Requesting document access for property: prop-1
👤 User profile: {full_name: "John Doe", email: "john@example.com"}
📝 Creating request with data: {property_id: "prop-1", requester_id: "buyer-123", ...}
✅ Request created successfully: {id: "req-1", status: "pending", ...}
```

## Next Steps

1. **Refresh the page** after making the code changes
2. **Open DevTools Console** before testing
3. **Try creating a request** as a buyer
4. **Check Sales Inquiries** as the seller
5. **Share console logs** if issues persist

## Files with Logging Added
- `src/pages/dashboard/landlord/Applications.tsx` - Sales Inquiries loading
- `src/components/property/PropertyDocumentViewerSimplified.tsx` - Request creation

## SQL Debug Scripts Created
- `debug_document_requests.sql` - Comprehensive database check
- `test_document_access_insert.sql` - Manual insert test
- `verify_document_access_system.sql` - System verification
