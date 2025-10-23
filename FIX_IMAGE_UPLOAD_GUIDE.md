# Fix Image Upload Issue - Complete Guide

## The Problem
You're getting `ReferenceError: supabase is not defined` when trying to upload images in the Property Photos section.

## Root Cause
The Supabase client is not exposed to the browser console, which means it's also not properly accessible in the application context.

## Solution Steps

### Step 1: Fix Supabase Client Exposure ✅ DONE
I've updated `src/integrations/supabase/client.ts` to expose the Supabase client to the browser console in development mode.

### Step 2: Set Up Storage Bucket
Run this SQL script in your Supabase SQL Editor:

```sql
-- Create the property-images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-images',
  'property-images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

-- Verify the bucket was created
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id = 'property-images';
```

### Step 3: Test the Fix
1. **Refresh your browser page** (important!)
2. **Open browser console** (F12)
3. **Run this test**:
   ```javascript
   // Test if supabase is now available
   console.log('Supabase available:', typeof window.supabase !== 'undefined');
   ```
4. **If true, run the full test**:
   ```javascript
   // Copy and paste the contents of test-storage-quick.js
   ```

### Step 4: Test Image Upload
1. Go to your Property Photos section
2. Try uploading an image
3. Check browser console for any errors
4. Check Supabase Dashboard > Storage to see if files appear

## Expected Results

After the fix:
- ✅ `window.supabase` should be available in browser console
- ✅ Storage bucket should exist and be public
- ✅ Image upload should work in the Property Photos section
- ✅ Images should appear in Supabase Dashboard > Storage

## Troubleshooting

### If `supabase` is still not defined:
1. **Hard refresh** the page (Ctrl+F5)
2. **Clear browser cache**
3. **Restart your development server**

### If storage bucket doesn't exist:
1. Run the SQL script in Supabase SQL Editor
2. Check Supabase Dashboard > Storage
3. Verify the bucket is public

### If upload still fails:
1. Check browser console for specific error messages
2. Verify you're logged in to your app
3. Check file size (must be under 10MB)
4. Check file type (JPEG, PNG, WebP, GIF only)

## Debug Tools Available

1. **Browser Console Test**: Use `test-storage-quick.js`
2. **Debug Page**: Navigate to `/debug/image-upload` (if available)
3. **Supabase Dashboard**: Check Storage section for uploaded files

## Next Steps

1. **Refresh your browser page**
2. **Run the storage setup SQL script**
3. **Test with the browser console script**
4. **Try uploading an image in Property Photos**
5. **Let me know if you see any errors**

The fix should resolve the `supabase is not defined` error and allow image uploads to work properly!
