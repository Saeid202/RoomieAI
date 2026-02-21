# Photo Upload Fix - Complete Solution

## Issue
Users cannot upload property photos in the AddProperty form.

## Root Cause
The `property-images` storage bucket either doesn't exist or lacks proper RLS policies for authenticated users to upload images.

## Solution Applied

### 1. UI Improvements
- Added loading spinner while user authentication is being verified
- Enhanced error messages to distinguish between policy errors, bucket errors, and other issues
- Added console logging for debugging

### 2. Storage Bucket Configuration
Run the SQL file `fix_property_images_upload.sql` to:
- Create/update the `property-images` bucket with proper configuration
- Set file size limit to 10MB
- Allow image MIME types: jpeg, jpg, png, webp, gif
- Make bucket public for easy viewing
- Create comprehensive RLS policies:
  - Authenticated users can upload images
  - Public can view images
  - Users can delete/update their own images

## How to Apply the Fix

### Step 1: Run the SQL Migration
```bash
# In Supabase SQL Editor, run:
fix_property_images_upload.sql
```

### Step 2: Verify the Configuration
```bash
# Run this to check:
check_property_images_bucket.sql
```

### Step 3: Test the Upload
1. Go to Add Property page
2. You should see the photo upload section (not a loading spinner)
3. Try dragging and dropping an image or clicking to select
4. Image should upload successfully

## Expected Behavior After Fix

### Before Upload:
- Upload area shows: "Drag & drop images here, or click to select"
- Shows "0 of 10 uploaded"

### During Upload:
- Upload area shows: "Uploading..."
- Area is slightly dimmed

### After Upload:
- Success toast: "Successfully uploaded X image(s)"
- Images appear in gallery grid below
- First image shows "Main" badge
- Hover over images to see delete button

### Error Scenarios:
- If policy error: "Storage permission error. Please contact support."
- If bucket error: "Storage bucket not configured. Please contact support."
- If file too large: "Image size must be less than 5MB"
- If wrong file type: "Please upload a valid image file (JPEG, PNG, WebP, or GIF)"

## Technical Details

### Upload Flow:
1. User selects/drops images
2. `ImageUpload` component validates files
3. `ImageUploadService.uploadPropertyImage()` uploads to Supabase Storage
4. Files stored at path: `{userId}/property-temp/{filename}`
5. Public URL returned and added to form state
6. Images displayed in gallery

### Storage Structure:
```
property-images/
  └── {userId}/
      └── property-temp/
          ├── 1234567890-abc123.jpg
          ├── 1234567891-def456.png
          └── ...
```

### Why "property-temp"?
- During property creation, we don't have a property ID yet
- Images are uploaded to a temporary folder
- When property is saved, images can be moved to `property-{propertyId}` folder
- This allows users to upload photos before saving the property

## Files Modified
1. `src/pages/dashboard/landlord/AddProperty.tsx` - Added loading state for photo upload
2. `src/components/ui/image-upload.tsx` - Enhanced error handling and messages

## Files Created
1. `fix_property_images_upload.sql` - Complete bucket and policy setup
2. `check_property_images_bucket.sql` - Verification queries
3. `PHOTO_UPLOAD_FIX.md` - This documentation

## Testing Checklist
- [ ] Run SQL migration
- [ ] Verify bucket exists and is public
- [ ] Verify policies are created
- [ ] Test upload with JPEG image
- [ ] Test upload with PNG image
- [ ] Test upload with multiple images
- [ ] Test delete image
- [ ] Test upload limit (10 images max)
- [ ] Test file size limit (5MB per image)
- [ ] Test invalid file type (should show error)

## Next Steps
After fixing the upload, consider:
1. Moving images from `property-temp` to `property-{id}` after property is saved
2. Adding image compression before upload
3. Adding image preview before upload
4. Adding drag-to-reorder functionality for images
