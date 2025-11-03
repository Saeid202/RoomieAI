# Storage Troubleshooting Guide

## Issue: Cannot Upload Images to Storage

### Step 1: Check Storage Bucket Configuration

Run this SQL in your Supabase SQL Editor:

```sql
-- Check if bucket exists
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id = 'property-images';

-- Check storage policies
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%property%';
```

**Expected Result**: You should see the `property-images` bucket with `public = true`.

### Step 2: Fix Storage Bucket Setup

If the bucket doesn't exist or has wrong configuration, run:

```sql
-- Run the complete storage setup
-- (Use the setup-storage-complete.sql file)
```

### Step 3: Test Authentication

Check if you're properly authenticated:

```javascript
// Run in browser console
const { data: { user } } = await supabase.auth.getUser();
console.log('User:', user);
```

### Step 4: Test Storage Access

```javascript
// Run in browser console
const { data, error } = await supabase.storage
  .from('property-images')
  .list('', { limit: 10 });
console.log('Files:', data, 'Error:', error);
```

### Step 5: Test File Upload

```javascript
// Run in browser console
const file = new File(['test'], 'test.txt', { type: 'text/plain' });
const { data, error } = await supabase.storage
  .from('property-images')
  .upload('test/test.txt', file);
console.log('Upload result:', data, 'Error:', error);
```

## Common Issues and Solutions

### Issue 1: "Bucket not found" Error
**Solution**: Run the storage setup script
```sql
-- Run setup-storage-complete.sql
```

### Issue 2: "Permission denied" Error
**Solution**: Check RLS policies
```sql
-- Verify policies exist
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%property%';
```

### Issue 3: "File too large" Error
**Solution**: Check file size limits
```sql
-- Update bucket file size limit
UPDATE storage.buckets 
SET file_size_limit = 10485760 
WHERE id = 'property-images';
```

### Issue 4: "Invalid file type" Error
**Solution**: Check allowed MIME types
```sql
-- Update allowed MIME types
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
WHERE id = 'property-images';
```

## Debug Tools

### 1. Use the Debug Component
Navigate to `/debug/storage` in your app to use the interactive debug tool.

### 2. Browser Console Tests
Run the `test-supabase-config.js` script in your browser console.

### 3. Check Network Tab
1. Open browser DevTools
2. Go to Network tab
3. Try to upload an image
4. Look for failed requests to Supabase

## Environment Variables Check

Make sure these are set in your `.env` file:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Step-by-Step Fix Process

1. **Run Storage Setup Script**
   ```sql
   -- Execute setup-storage-complete.sql in Supabase SQL Editor
   ```

2. **Test Authentication**
   - Make sure you're logged in to your app
   - Check browser console for auth errors

3. **Test Storage Access**
   - Use the debug component at `/debug/storage`
   - Check all test results

4. **Test File Upload**
   - Try uploading a small image file
   - Check browser console for errors

5. **Verify Database Integration**
   - Check if images are saved to the database
   - Verify the `images` field in the `properties` table

## If Still Not Working

1. **Check Supabase Dashboard**
   - Go to Storage section
   - Verify bucket exists and is public
   - Check if files are being uploaded

2. **Check Browser Console**
   - Look for JavaScript errors
   - Check network requests to Supabase

3. **Check Supabase Logs**
   - Go to Supabase Dashboard > Logs
   - Look for storage-related errors

4. **Test with Simple File**
   - Try uploading a simple text file first
   - Then try with images

## Contact Support

If none of the above solutions work:
1. Check Supabase status page
2. Verify your Supabase project settings
3. Check if you have the correct permissions
4. Consider creating a new storage bucket with a different name
