# Image Deletion Troubleshooting Guide

## What Was Fixed

I've enhanced the image deletion functionality with better error logging and diagnostics. The changes will help identify exactly why deletion is failing.

## Changes Made

### 1. Enhanced Logging in `imageUploadService.ts`
- Added detailed console logs for delete attempts
- Shows the extracted file path
- Displays full error details including status codes
- Cleans query parameters from URLs before deletion

### 2. Improved Error Messages in `image-upload.tsx`
- Added detailed console logs when delete button is clicked
- Shows which image is being deleted
- Displays user ID for verification
- Better error messages in toast notifications

## How to Test

1. **Open Browser Console** (F12 or Right-click → Inspect → Console tab)

2. **Navigate to Property Edit Page**
   - Go to Seller Centre
   - Click on a property to edit
   - Scroll to the photo section

3. **Try to Delete an Image**
   - Hover over an image
   - Click the red X button
   - Watch the console for detailed logs

## What to Look For in Console

### Success Case:
```
🗑️ ImageUpload: Attempting to delete image at index 0
🗑️ ImageUpload: Image URL: https://...
🗑️ ImageUpload: User ID: abc-123-def
🗑️ Delete attempt: { imageUrl: '...', userId: '...' }
🗑️ Extracted file path: abc-123-def/property-temp/filename.jpg
✅ Property image deleted successfully
✅ Delete response: [...]
✅ ImageUpload: Image deleted, updating state
```

### Failure Cases:

#### Case 1: Invalid URL Format
```
❌ Invalid image URL format: ...
❌ URL does not contain /property-images/ separator
```
**Solution**: The image URL structure is wrong. Check how images are being stored.

#### Case 2: Permission Denied
```
❌ Property image delete error: { message: 'new row violates row-level security policy' }
❌ Error details: { statusCode: 403, error: 'Forbidden' }
```
**Solution**: Run the SQL script below to fix storage policies.

#### Case 3: File Not Found
```
❌ Property image delete error: { message: 'Object not found' }
```
**Solution**: The file path doesn't match what's in storage. Check the file path extraction.

## SQL Fix for Storage Policies

If you see permission errors, run this in Supabase SQL Editor:

```sql
-- Fix DELETE policy for property-images bucket
DROP POLICY IF EXISTS "Users can delete their own property images" ON storage.objects;
DROP POLICY IF EXISTS "property_images_delete_policy" ON storage.objects;

-- Create new DELETE policy that allows users to delete their own images
CREATE POLICY "property_images_delete_policy"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'property-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
);
```

## Verify Storage Policies

Run this script to check your current setup:
```bash
# In your workspace
cat check_property_images_policies.sql
```

Then copy the output and run it in Supabase SQL Editor.

## Common Issues and Solutions

### Issue 1: Images Not Updating After Delete
**Symptom**: Delete succeeds but image still shows
**Solution**: The parent component state might not be updating. Check that `onImagesChange` is being called correctly.

### Issue 2: Wrong User ID
**Symptom**: User ID in logs doesn't match folder name in URL
**Solution**: Make sure you're logged in as the same user who uploaded the images.

### Issue 3: URL Has Query Parameters
**Symptom**: File path includes `?token=...` or similar
**Solution**: Already fixed! The new code strips query parameters before deletion.

## Next Steps

1. **Test the deletion** with console open
2. **Copy the console logs** (all of them)
3. **Share the logs** so we can see exactly what's happening
4. **Check storage policies** using the SQL script if needed

## Expected Behavior

When deletion works correctly:
1. Click delete button
2. See detailed logs in console
3. Image disappears from UI immediately
4. Toast shows "Image has been successfully deleted"
5. File is removed from Supabase storage

## Additional Debugging

If issues persist, check:
- Are you logged in as the correct user?
- Do the image URLs contain `/property-images/` in the path?
- Does the folder name in the URL match your user ID?
- Are there any network errors in the Network tab?
