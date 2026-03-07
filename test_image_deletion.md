# Test Image Deletion - Next Steps

## Storage Policy Status: ✅ CONFIRMED WORKING
The SQL check shows: "Can delete from property-images: YES"

This means the RLS policies are correctly configured and you have permission to delete images.

## What to Test Now

Since the policies are working, we need to identify if it's a:
- **URL parsing issue** (code can't extract the file path)
- **State update issue** (deletion works but UI doesn't refresh)
- **Network issue** (request fails silently)

## Testing Steps

### 1. Open Browser Console
Press F12 or Right-click → Inspect → Console tab

### 2. Navigate to Property Edit Page
- Go to Seller Centre
- Click on a property with images
- Scroll to the photo section

### 3. Try to Delete an Image
Click the red X button on any image and watch the console.

### 4. Look for These Specific Logs

#### Expected Success Pattern:
```
🗑️ ImageUpload: Attempting to delete image at index 0
🗑️ ImageUpload: Image URL: https://[your-project].supabase.co/storage/v1/object/public/property-images/[user-id]/property-[id]/[filename].jpg
🗑️ ImageUpload: User ID: [user-id]
🗑️ Delete attempt: { imageUrl: '...', userId: '...' }
🗑️ Extracted file path: [user-id]/property-[id]/[filename].jpg
✅ Property image deleted successfully
✅ ImageUpload: Image deleted, updating state
```

#### If URL Parsing Fails:
```
❌ Invalid image URL format: ...
❌ URL does not contain /property-images/ separator
```
**Action**: Copy the full image URL and share it

#### If Permission Denied (shouldn't happen now):
```
❌ Error details: { statusCode: 403, error: 'Forbidden' }
```
**Action**: This shouldn't happen since policies are confirmed working

#### If File Not Found:
```
❌ Error details: { message: 'Object not found' }
```
**Action**: The file path extraction might be wrong

### 5. Check Network Tab
- Open Network tab in DevTools
- Filter by "storage" or "property-images"
- Try deleting an image
- Look for DELETE requests
- Check if they return 200 (success) or error codes

## Common Scenarios

### Scenario A: No Console Logs at All
**Problem**: Click handler not firing
**Solution**: Check if button is being blocked by another element

### Scenario B: Logs Show Success But Image Still Visible
**Problem**: State not updating in parent component
**Solution**: The `onImagesChange` callback might not be working

### Scenario C: URL Format Different Than Expected
**Problem**: Images stored with different URL structure
**Solution**: Need to adjust the URL parsing logic

### Scenario D: Query Parameters in URL
**Problem**: URL has `?token=...` or similar
**Solution**: Already fixed! Code now strips query parameters

## What to Share

Please copy and paste:
1. **All console logs** when you click delete (from start to finish)
2. **The image URL** (you can see it in the logs)
3. **Any error messages** from the Network tab
4. **Whether the image disappears** from the UI or not

## Quick Test Script

You can also run this in the browser console to test manually:

```javascript
// Get the current user ID
const { data: { user } } = await supabase.auth.getUser();
console.log('Current User ID:', user.id);

// Try to list files in your folder
const { data: files, error } = await supabase.storage
  .from('property-images')
  .list(user.id, {
    limit: 10,
    offset: 0,
  });

console.log('Your files:', files);
console.log('Any errors:', error);
```

This will show you what files exist in your storage folder.

## If Everything Looks Good in Console

If the console shows:
- ✅ Delete successful
- ✅ State updated
- But the image still shows in the UI

Then it's likely a **React state/rendering issue**. In that case, try:
1. Hard refresh the page (Ctrl+Shift+R)
2. Check if the image is actually gone from storage (use the test script above)
3. The image might be cached by the browser

## Next Actions

Based on what you see in the console, we can:
- Fix URL parsing if needed
- Fix state management if needed
- Add browser cache busting if needed
- Investigate network issues if needed

The enhanced logging will tell us exactly what's happening! 🔍
