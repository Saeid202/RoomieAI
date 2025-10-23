# Image Upload Troubleshooting Guide

## Current Issue: Cannot Upload Pictures for Property Listings

### Step 1: Check Storage Bucket Setup

**Run this SQL in your Supabase SQL Editor:**

```sql
-- Simple storage setup
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Verify it was created
SELECT id, name, public, created_at 
FROM storage.buckets 
WHERE id = 'property-images';
```

**Expected Result:** You should see the `property-images` bucket with `public = true`.

### Step 2: Test Storage Access

**Open your browser console (F12) and run this:**

```javascript
// Copy and paste the contents of debug-image-upload-complete.js
// This will test the complete upload flow
```

### Step 3: Check Browser Console

**Look for these specific errors:**

1. **`supabase is not defined`** - Refresh the page
2. **`Permission denied`** - Storage bucket not public
3. **`Bucket not found`** - Run the SQL setup script
4. **`File too large`** - Check file size (must be under 10MB)
5. **`Invalid file type`** - Check file format (JPEG, PNG, WebP, GIF only)

### Step 4: Manual Storage Setup (Alternative)

**If SQL doesn't work, use Supabase Dashboard:**

1. **Go to Supabase Dashboard > Storage**
2. **Click "Create a new bucket"**
3. **Set these values:**
   - **Name**: `property-images`
   - **Public bucket**: ✅ **Check this**
   - **File size limit**: `10 MB`
   - **Allowed MIME types**: `image/jpeg, image/jpg, image/png, image/webp, image/gif`

### Step 5: Test Upload Flow

**Try this step by step:**

1. **Go to your Property Photos section**
2. **Try uploading a small image file (under 1MB)**
3. **Check browser console for errors**
4. **Check Supabase Dashboard > Storage for uploaded files**

### Step 6: Common Issues and Solutions

#### Issue 1: "Supabase is not defined"
**Solution:** Refresh your browser page (Ctrl+F5)

#### Issue 2: "Bucket not found"
**Solution:** Run the storage setup SQL script

#### Issue 3: "Permission denied"
**Solution:** Make sure the bucket is public

#### Issue 4: "File too large"
**Solution:** Use smaller images (under 10MB)

#### Issue 5: "Invalid file type"
**Solution:** Use JPEG, PNG, WebP, or GIF files only

### Step 7: Debug Information

**Run this in browser console to get detailed info:**

```javascript
// Check if supabase is available
console.log('Supabase available:', typeof window.supabase !== 'undefined');

// Check authentication
const { data: { user } } = await supabase.auth.getUser();
console.log('User:', user);

// Check storage buckets
const { data: buckets } = await supabase.storage.listBuckets();
console.log('Buckets:', buckets);
```

### Step 8: If Still Not Working

**Check these:**

1. **Supabase Dashboard > Storage** - Does the bucket exist?
2. **Browser Network Tab** - Are there failed requests?
3. **File Size** - Are your images under 10MB?
4. **File Type** - Are you using supported formats?
5. **Authentication** - Are you logged in?

### Step 9: Alternative Test

**Try uploading through Supabase Dashboard:**

1. **Go to Supabase Dashboard > Storage**
2. **Click on `property-images` bucket**
3. **Try uploading a file manually**
4. **If this works, the issue is in the app code**

### Step 10: Final Check

**Run the complete debug script:**

```javascript
// Copy and paste debug-image-upload-complete.js
// This will test everything end-to-end
```

## Expected Results

After fixing:
- ✅ Storage bucket exists and is public
- ✅ File upload works in browser console
- ✅ Image upload works in Property Photos section
- ✅ Images appear in Supabase Dashboard > Storage

## Next Steps

1. **Run the storage setup SQL script**
2. **Test with the debug script**
3. **Try uploading in Property Photos**
4. **Let me know what errors you see**

The debug script will tell us exactly where the problem is!
