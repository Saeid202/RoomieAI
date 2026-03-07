# Image Deletion Fix - Complete Summary

## Problem
Images could be uploaded successfully in the property edit page, but clicking the delete button (red X) didn't remove them.

## Root Cause Analysis
The issue could be caused by one or more of these factors:
1. **Storage Policy Issues**: RLS policies blocking DELETE operations
2. **URL Parsing Problems**: File path extraction failing for certain URL formats
3. **State Management**: Parent component not updating after deletion
4. **Insufficient Error Logging**: Hard to diagnose without detailed logs

## Solutions Implemented

### 1. Enhanced Error Logging (`imageUploadService.ts`)
**Changes:**
- Added detailed console logs at every step of deletion
- Shows the exact file path being deleted
- Displays full error details including status codes
- Cleans query parameters from URLs (e.g., `?token=...`)
- Better error messages for debugging

**Benefits:**
- You can now see exactly what's happening in the browser console
- Easier to identify if it's a permission issue, URL issue, or file not found

### 2. Improved UI Feedback (`image-upload.tsx`)
**Changes:**
- Added console logs when delete button is clicked
- Shows which image index is being deleted
- Displays the image URL and user ID
- Better error toast messages

**Benefits:**
- Clear feedback about what's being attempted
- Helps verify the correct image is being targeted

### 3. SQL Scripts for Verification and Fixes

#### `check_property_images_policies.sql`
- Checks if the bucket exists
- Lists all storage policies
- Shows current user ID and role

#### `fix_image_delete_policy.sql`
- Drops conflicting DELETE policies
- Creates a clean, working DELETE policy
- Verifies the policy was created correctly
- Tests if current user can delete

## How to Use

### Step 1: Test with Enhanced Logging
1. Open your browser's Developer Console (F12)
2. Navigate to Seller Centre → Edit a property
3. Try to delete an image
4. Watch the console for detailed logs

### Step 2: Identify the Issue
Look for these patterns in the console:

**If you see:**
```
❌ Invalid image URL format
```
→ The image URL structure is wrong

**If you see:**
```
❌ Error details: { statusCode: 403, error: 'Forbidden' }
```
→ Run `fix_image_delete_policy.sql` in Supabase

**If you see:**
```
❌ Error details: { message: 'Object not found' }
```
→ The file path doesn't match storage

**If you see:**
```
✅ Property image deleted successfully
```
But the image still shows → State management issue

### Step 3: Apply Fixes

#### For Permission Errors:
```bash
# Run this in Supabase SQL Editor
cat fix_image_delete_policy.sql
```

#### For State Issues:
The code already handles this correctly with:
```typescript
onImagesChange(newImages);
```

## Testing Checklist

- [ ] Open browser console (F12)
- [ ] Navigate to property edit page
- [ ] Click delete button on an image
- [ ] Check console logs for detailed output
- [ ] Verify image disappears from UI
- [ ] Check Supabase storage to confirm file is deleted
- [ ] Try uploading a new image after deletion
- [ ] Test with multiple images

## Expected Console Output (Success)

```
🗑️ ImageUpload: Attempting to delete image at index 0
🗑️ ImageUpload: Image URL: https://[project].supabase.co/storage/v1/object/public/property-images/[user-id]/property-temp/[filename].jpg
🗑️ ImageUpload: User ID: [user-id]
🗑️ Delete attempt: { imageUrl: '...', userId: '...' }
🗑️ Extracted file path: [user-id]/property-temp/[filename].jpg
🗑️ User ID for verification: [user-id]
✅ Property image deleted successfully
✅ Delete response: [...]
✅ ImageUpload: Image deleted, updating state
✅ ImageUpload: New images array: [...]
```

## Files Modified

1. `src/services/imageUploadService.ts` - Enhanced deletePropertyImage() with logging
2. `src/components/ui/image-upload.tsx` - Improved removeImage() with diagnostics

## Files Created

1. `IMAGE_DELETE_TROUBLESHOOTING.md` - Detailed troubleshooting guide
2. `check_property_images_policies.sql` - Verification script
3. `fix_image_delete_policy.sql` - Policy fix script
4. `IMAGE_DELETE_FIX_SUMMARY.md` - This file

## Next Steps

1. **Test the deletion** with the browser console open
2. **Share the console logs** if issues persist
3. **Run the SQL fix** if you see permission errors (403)
4. **Verify storage policies** using the check script

## Common Scenarios

### Scenario 1: First Time Setup
If this is a new property or first time uploading:
- Images might be in a temporary folder
- Deletion should work immediately
- No SQL fixes needed

### Scenario 2: Editing Existing Property
If editing a property with existing images:
- Make sure you're logged in as the property owner
- User ID in URL must match your auth.uid()
- May need to run SQL fix if policies are outdated

### Scenario 3: Multiple Users
If multiple users manage properties:
- Each user can only delete their own images
- Folder structure: `{user-id}/property-{id}/{filename}`
- RLS policies enforce this automatically

## Support

If deletion still doesn't work after these fixes:
1. Copy ALL console logs (from clicking delete)
2. Run `check_property_images_policies.sql` and share results
3. Check Network tab for failed requests
4. Verify you're logged in as the correct user

The enhanced logging will show exactly what's happening at each step!
