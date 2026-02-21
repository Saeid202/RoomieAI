# Debug Guide: Property Documents Not Showing

## Issue
You uploaded documents when creating/editing a sales property, but they don't appear when viewing the property as a buyer.

## Root Cause Found
The `listing_category` field was NOT being saved to the database when creating/updating properties. The code was using it to decide which service to call, but never actually storing it.

## Fixes Applied

### 1. AddProperty.tsx - Save listing_category
Added `listing_category` to the propertyData object so it gets saved to the database:

```typescript
const propertyData = {
  // ... other fields
  listing_category: formData.listingCategory || 'rental', // NEW: Now saves to DB
  // ... rest of fields
};
```

Also added sales-specific fields to propertyData:
- `sales_price`
- `is_co_ownership`  
- `downpayment_target`

### 2. SQL Fix for Existing Properties
Created `fix_listing_category.sql` to update existing properties that don't have listing_category set.

## Steps to Fix Your Property

### Step 1: Run the SQL Fix
Execute this in your Supabase SQL Editor:

```sql
-- Fix your specific property
UPDATE properties
SET listing_category = 'sale'
WHERE id = '3877de5d-dc70-4995-a92c-da4ac59a159b';

-- Verify it worked
SELECT 
  id,
  listing_title,
  listing_category,
  sales_price,
  property_category,
  property_configuration
FROM properties
WHERE id = '3877de5d-dc70-4995-a92c-da4ac59a159b';
```

### Step 2: Verify Documents Exist
Check if your documents were actually saved:

```sql
SELECT 
  id,
  property_id,
  document_type,
  document_label,
  file_name,
  is_public,
  uploaded_at
FROM property_documents
WHERE property_id = '3877de5d-dc70-4995-a92c-da4ac59a159b'
  AND deleted_at IS NULL;
```

### Step 3: Test the View
1. Log out or use a different browser/incognito window
2. Navigate to the property: `localhost:5173/dashboard/rental-options/3877de5d-dc70-4995-a92c-da4ac59a159b?type=sale`
3. You should now see the "Property Documents" section in the right sidebar

## What Should Happen Now

### For New Properties (After Fix)
When you create or edit a property going forward:
1. Select "Sales" as Listing Category
2. Select Primary Category (e.g., "Residential Sale")
3. Upload documents in Document Vault
4. Click Save
5. ✅ `listing_category = 'sale'` will be saved to database
6. ✅ Documents will be linked to the property
7. ✅ Buyers will see the documents section

### For Existing Properties (Need SQL Fix)
Properties created before this fix:
1. Have documents uploaded ✅
2. But `listing_category` is NULL or wrong ❌
3. Run the SQL fix above to set `listing_category = 'sale'`
4. Refresh the property view page
5. ✅ Documents section will now appear

## Verification Checklist

Run these checks to verify everything is working:

```sql
-- 1. Check property has correct listing_category
SELECT listing_category FROM properties WHERE id = 'YOUR_PROPERTY_ID';
-- Expected: 'sale'

-- 2. Check property has category/configuration
SELECT property_category, property_configuration FROM properties WHERE id = 'YOUR_PROPERTY_ID';
-- Expected: e.g., 'Residential Sale', 'Condo'

-- 3. Check documents exist
SELECT COUNT(*) FROM property_documents WHERE property_id = 'YOUR_PROPERTY_ID' AND deleted_at IS NULL;
-- Expected: > 0

-- 4. Check document details
SELECT document_label, is_public, file_url FROM property_documents WHERE property_id = 'YOUR_PROPERTY_ID';
-- Expected: List of your uploaded documents
```

## Browser Console Debugging

Open browser console (F12) and check for:

1. **Component rendering:**
   - Look for "Property Documents" in the React DevTools component tree
   - Check if PropertyDocumentViewer is mounted

2. **Network requests:**
   - Should see request to `/rest/v1/property_documents?property_id=eq.YOUR_ID`
   - Check the response - should return your documents

3. **Console errors:**
   - Any errors about missing fields or failed queries
   - RLS policy errors (shouldn't happen for public reads)

## Common Issues

### Issue: "No documents available yet" shows
**Cause:** Documents weren't actually uploaded or were deleted
**Fix:** Re-upload documents in Edit Property page

### Issue: Section doesn't appear at all
**Cause:** `listing_category` is not 'sale' or property is not detected as sales listing
**Fix:** Run SQL fix to set `listing_category = 'sale'`

### Issue: You're the owner and don't see it
**Cause:** PropertyDocumentViewer only shows for non-owners (buyers)
**Fix:** Log in as a different user or use incognito mode

### Issue: Documents show for owner but not buyers
**Cause:** RLS policies might be blocking access
**Fix:** Check RLS policies on property_documents table

## Next Steps

1. ✅ Run the SQL fix for your existing property
2. ✅ Verify documents exist in database
3. ✅ Test viewing as a buyer (different user/incognito)
4. ✅ Try uploading a new document to test the flow
5. ✅ Test requesting access to a private document

## Future Properties

All new properties created after this fix will automatically:
- Save `listing_category` correctly
- Show documents to buyers
- Support document access requests
