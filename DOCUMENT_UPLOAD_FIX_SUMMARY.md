# Property Document Upload & Viewing - Fix Summary

## Issue Report
User reported that property documents are not uploading and viewing fails with "Bucket not found" error.

## Investigation Results

### What We Found
1. ✅ Documents ARE uploading to storage successfully
2. ✅ Documents ARE being saved to `property_documents` table
3. ✅ Bucket `property-documents` exists in Supabase
4. ❌ Bucket is set to `public: false` (PRIVATE)
5. ❌ Code generates public URLs, but bucket is private → "Bucket not found" error

### Root Cause
The `property-documents` storage bucket was created as PRIVATE (`public: false`), but the application code generates public URLs using:
```typescript
supabase.storage.from('property-documents').getPublicUrl(filePath)
```

When a bucket is private, public URLs don't work and return "Bucket not found" error.

## Solution

### Quick Fix (2 minutes) - RECOMMENDED
Use Supabase Dashboard to make the bucket public:

1. Go to: https://supabase.com/dashboard/project/bjesofgfbuyzjamyliys/storage/buckets
2. Find "property-documents" bucket
3. Click three dots (⋮) → "Edit bucket"
4. Toggle "Public bucket" to ON
5. Click "Save"

### Why SQL Didn't Work
The SQL command `UPDATE storage.buckets SET public = true` returned "Success. No rows returned" because:
- Supabase doesn't allow direct SQL updates to `storage.buckets` table
- Bucket settings must be changed through Dashboard or Storage API

## Code Improvements Made

### 1. Enhanced Bucket Check Function
Updated `ensureBucketExists()` in `propertyDocumentService.ts`:
- Better logging to show bucket status
- Attempts to update bucket to public automatically
- Provides manual fix instructions if API update fails
- Verifies the update worked

### 2. Improved Document Viewing
Updated `DocumentSlot.tsx` View button:
- Dynamically regenerates URLs with correct bucket name
- Uses `property-documents` (with hyphen, not underscore)
- Fallback to original URL if regeneration fails

### 3. Added Comprehensive Logging
All document operations now log:
- Upload progress and status
- Bucket checks and updates
- File paths and URLs
- Success/error messages

## Files Modified

1. `src/services/propertyDocumentService.ts`
   - Enhanced `ensureBucketExists()` function
   - Better error handling and logging

2. `src/components/property/DocumentSlot.tsx`
   - Fixed View button to regenerate URLs
   - Uses correct bucket name

3. `fix_property_documents_bucket_public.sql`
   - Updated with proper instructions
   - Added RLS policy examples

## New Files Created

1. `src/utils/fixBucketPublic.ts`
   - Utility to fix bucket from browser console
   - Can be run programmatically

2. `BUCKET_FIX_INSTRUCTIONS.md`
   - Step-by-step fix instructions
   - Multiple solution options
   - Verification steps

3. `DOCUMENT_UPLOAD_FIX_SUMMARY.md` (this file)
   - Complete issue analysis
   - Solution documentation

## Testing Steps

### After Making Bucket Public

1. Verify bucket is public:
   ```sql
   SELECT name, public FROM storage.buckets WHERE name = 'property-documents';
   ```
   Expected: `public: true`

2. Test document viewing:
   - Log in as property owner (info@cargoplus.site)
   - Go to property: 88f6d735-4d0a-4788-8589-44bc3fa646fe
   - Click "View All Documents"
   - Click "View" on any document
   - Should open in new tab without error

3. Test document upload:
   - Upload a new document
   - Check console logs for success messages
   - Verify document appears in list
   - Click "View" to confirm it works

## Next Steps

1. **IMMEDIATE**: Make bucket public using Supabase Dashboard (see Quick Fix above)

2. **VERIFY**: Run test steps to confirm documents can be viewed

3. **OPTIONAL**: If still having issues, check storage policies:
   ```sql
   SELECT * FROM storage.policies WHERE bucket_id = 'property-documents';
   ```

4. **OPTIONAL**: If no policies exist, add RLS policies (see `fix_property_documents_bucket_public.sql`)

## Expected Outcome

After making the bucket public:
- ✅ Documents upload successfully
- ✅ Documents appear in vault
- ✅ "View" button opens documents in new tab
- ✅ No "Bucket not found" errors
- ✅ Public/Private toggle works correctly

## Support

If issues persist after making bucket public:
1. Check browser console for error messages
2. Check Supabase logs for storage errors
3. Verify RLS policies allow access
4. Check file paths in database match storage paths
