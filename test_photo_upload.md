# Photo Upload Testing Guide

## Quick Test Steps

### 1. Apply the Database Fix
Open Supabase SQL Editor and run:
```sql
-- Copy and paste contents of fix_property_images_upload.sql
```

### 2. Clear Browser Cache
- Press `Ctrl + Shift + Delete` (Windows)
- Clear cached images and files
- Close and reopen browser

### 3. Test Upload Flow

#### Navigate to Add Property
1. Go to: `http://localhost:5173/dashboard/add-property`
2. Wait for page to load completely

#### Check Upload Section
You should see:
- "Property Photos" label
- Upload area with drag & drop zone
- Text: "Drag & drop images here, or click to select"
- Counter: "0 of 10 uploaded"

If you see a spinning loader instead, wait a few seconds for authentication to complete.

#### Upload a Test Image
1. Click the upload area OR drag an image file
2. Select a JPEG or PNG image (under 5MB)
3. Watch for:
   - Upload area shows "Uploading..."
   - Success toast appears
   - Image appears in gallery below

#### Verify Upload Success
- Image should display in a grid
- First image should have "Main" badge
- Hover over image to see delete (X) button

#### Test Delete
1. Hover over uploaded image
2. Click the X button in top-right corner
3. Image should be removed
4. Success toast: "Image has been successfully deleted"

### 4. Check Console for Errors

Open browser DevTools (F12) and check Console tab:

#### Expected Logs (Success):
```
📤 Uploading property image: { fileName: "...", filePath: "...", ... }
✅ Property image uploaded successfully: https://...
```

#### Error Logs to Watch For:
- "Upload error:" - Check error message
- "policy" in error - RLS policy issue, re-run SQL fix
- "bucket" in error - Bucket doesn't exist, re-run SQL fix
- "403" or "401" - Authentication issue

### 5. Verify in Supabase Dashboard

#### Check Storage:
1. Go to Supabase Dashboard → Storage
2. Find `property-images` bucket
3. Navigate to your user folder
4. Should see `property-temp` folder with uploaded images

#### Check Policies:
1. Go to Storage → property-images → Policies
2. Should see 4 policies:
   - "Authenticated users can upload property images" (INSERT)
   - "Public can view property images" (SELECT)
   - "Users can delete their own property images" (DELETE)
   - "Users can update their own property images" (UPDATE)

## Common Issues & Solutions

### Issue: Upload area shows loading spinner forever
**Solution:** 
- Check if user is authenticated
- Open DevTools Console and look for auth errors
- Try logging out and back in

### Issue: "Storage permission error"
**Solution:**
- Re-run `fix_property_images_upload.sql`
- Verify policies exist in Supabase Dashboard
- Check if user is authenticated

### Issue: "Storage bucket not configured"
**Solution:**
- Re-run `fix_property_images_upload.sql`
- Verify `property-images` bucket exists in Supabase Dashboard
- Check bucket is set to public

### Issue: Upload succeeds but image doesn't display
**Solution:**
- Check browser console for image URL
- Verify URL is accessible (paste in new tab)
- Check if bucket is public
- Clear browser cache

### Issue: "Image size must be less than 5MB"
**Solution:**
- Use a smaller image
- Or update validation in `imageUploadService.ts` to allow larger files
- Note: Bucket limit is 10MB, but service validates at 5MB

## Success Criteria
✅ Upload area is visible (not loading spinner)
✅ Can drag & drop images
✅ Can click to select images
✅ Upload shows progress
✅ Success toast appears
✅ Image displays in gallery
✅ Can delete uploaded images
✅ No console errors
✅ Images visible in Supabase Storage

## If All Tests Pass
The photo upload feature is working correctly! You can now:
- Upload up to 10 images per property
- Delete images before saving property
- Images are stored temporarily until property is saved
- First image becomes the main/featured image
