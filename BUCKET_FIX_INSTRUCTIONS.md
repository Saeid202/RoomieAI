# Fix Property Documents Bucket - Instructions

## Problem
The `property-documents` bucket is set to `public: false`, causing "Bucket not found" errors when trying to view documents.

## Root Cause
Direct SQL updates to `storage.buckets` table don't work in Supabase. The bucket privacy setting must be changed through:
1. Supabase Dashboard (easiest)
2. Storage API (programmatic)

## Solution Options

### OPTION 1: Supabase Dashboard (RECOMMENDED - 2 minutes)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/bjesofgfbuyzjamyliys/storage/buckets

2. Find the "property-documents" bucket in the list

3. Click the three dots menu (⋮) next to "property-documents"

4. Click "Edit bucket"

5. Toggle "Public bucket" to ON

6. Click "Save"

7. Verify by running this SQL:
   ```sql
   SELECT name, public FROM storage.buckets WHERE name = 'property-documents';
   ```
   Should show: `public: true`

### OPTION 2: Browser Console (Alternative)

1. Open your app in the browser: http://localhost:5173

2. Log in as the property owner (info@cargoplus.site)

3. Open browser DevTools (F12)

4. Go to Console tab

5. Run this command:
   ```javascript
   import('./src/utils/fixBucketPublic.ts').then(m => m.fixPropertyDocumentsBucket())
   ```

6. Check the console output for success/error messages

### OPTION 3: Add to App Initialization

The `ensureBucketExists()` function in `propertyDocumentService.ts` already has logic to update the bucket to public. It runs automatically when uploading documents.

To force it to run immediately:
1. Try uploading any document
2. The function will detect the bucket is private and attempt to make it public
3. Check console logs for success/error messages

## Verification

After applying the fix, verify it worked:

1. Run this SQL:
   ```sql
   SELECT name, public FROM storage.buckets WHERE name = 'property-documents';
   ```
   Expected result: `public: true`

2. Try viewing a document in the app:
   - Go to property details
   - Click "View All Documents"
   - Click "View" on any document
   - Should open in new tab without "Bucket not found" error

## If Still Not Working

If the bucket is public but you still get errors, check storage policies:

```sql
SELECT * FROM storage.policies WHERE bucket_id = 'property-documents';
```

If no policies exist, you may need to add RLS policies. See `fix_property_documents_bucket_public.sql` for policy examples.

## Current Status

- Bucket exists: ✅ YES
- Bucket is public: ❌ NO (needs fix)
- Documents in storage: ✅ YES
- Documents in database: ✅ YES
- RLS policies: ❓ (check after making bucket public)
