# Document Viewer Fix - COMPLETE ✅

## Problem Identified
When you created a sales property and uploaded documents, they weren't showing to buyers because the `listing_category` field was NOT being saved to the database.

## Root Cause
In `AddProperty.tsx`, the code was using `formData.listingCategory` to decide which service function to call (`updateSalesListing` vs `updateProperty`), but it was never actually including `listing_category` in the data being saved to the database.

## Fixes Applied

### 1. AddProperty.tsx - Save listing_category Field
**File:** `src/pages/dashboard/landlord/AddProperty.tsx`

**Change:** Added `listing_category` to the propertyData object:
```typescript
const propertyData = {
  user_id: user.id,
  property_type: formData.propertyType,
  property_category: formData.propertyCategory || null,
  property_configuration: formData.propertyConfiguration || null,
  listing_category: formData.listingCategory || 'rental', // ✅ NEW: Now saves to DB
  listing_title: formData.listingTitle || formData.propertyAddress,
  // ... rest of fields
  // ✅ NEW: Added sales-specific fields
  sales_price: formData.salesPrice ? parseFloat(...) : null,
  is_co_ownership: formData.isCoOwnership || false,
  downpayment_target: formData.downpaymentTarget ? parseFloat(...) : null
};
```

### 2. PropertyDetails.tsx - Better Sale Detection
**File:** `src/pages/dashboard/PropertyDetails.tsx`

**Change:** Updated isSale check to look at both fields:
```typescript
const isSale = property ? (property.listing_category === 'sale' || !!(property as any).sales_price) : false;
```

### 3. PublicPropertyDetails.tsx - Handle Both Variations
**File:** `src/pages/PublicPropertyDetails.tsx`

**Change:** Accept both 'sale' and 'sales':
```typescript
{(property.listing_type === 'sale' || property.listing_type === 'sales') && (
  <PropertyDocumentViewer ... />
)}
```

### 4. PropertyDocumentViewer.tsx - Show Empty State
**File:** `src/components/property/PropertyDocumentViewer.tsx`

**Change:** Show helpful message instead of hiding when no documents:
```typescript
if (documents.length === 0) {
  return (
    <Card>
      <CardContent>
        <p>No documents available yet</p>
        <p>The seller hasn't uploaded any property documents</p>
      </CardContent>
    </Card>
  );
}
```

## How to Fix Your Existing Property

### Quick Fix (Run this SQL):
```sql
UPDATE properties
SET listing_category = 'sale'
WHERE id = '3877de5d-dc70-4995-a92c-da4ac59a159b';
```

### Detailed Fix (Use the SQL file):
1. Open Supabase SQL Editor
2. Run the script in `fix_your_property.sql`
3. Verify the results show `listing_category = 'sale'`
4. Check that your documents are listed

### Test the Fix:
1. Refresh your browser (Ctrl+F5)
2. Log in as a buyer (or use incognito mode)
3. Navigate to: `localhost:5173/dashboard/rental-options/3877de5d-dc70-4995-a92c-da4ac59a159b?type=sale`
4. Look in the right sidebar
5. You should see "Property Documents" section with your uploaded documents

## What Happens Now

### For Your Current Property:
- After running the SQL fix, `listing_category` will be set to 'sale'
- PropertyDocumentViewer will detect it as a sales listing
- Documents will load and display to buyers
- Buyers can request access to private documents

### For Future Properties:
- When you create new properties, `listing_category` will be saved automatically
- No manual SQL fixes needed
- Everything will work out of the box

## Verification Steps

1. **Check property category:**
   ```sql
   SELECT listing_category FROM properties WHERE id = 'YOUR_ID';
   ```
   Expected: `'sale'`

2. **Check documents exist:**
   ```sql
   SELECT COUNT(*) FROM property_documents WHERE property_id = 'YOUR_ID';
   ```
   Expected: Number > 0

3. **View as buyer:**
   - Use different user or incognito mode
   - Navigate to property details
   - See "Property Documents" section in sidebar

4. **Test document access:**
   - Public documents: Should have View/Download buttons
   - Private documents: Should have "🔒 Request Access" button

## Files Changed
- ✅ `src/pages/dashboard/landlord/AddProperty.tsx`
- ✅ `src/pages/dashboard/PropertyDetails.tsx`
- ✅ `src/pages/PublicPropertyDetails.tsx`
- ✅ `src/components/property/PropertyDocumentViewer.tsx`

## Files Created
- ✅ `fix_listing_category.sql` - Fix all properties
- ✅ `fix_your_property.sql` - Fix your specific property
- ✅ `check_property_documents.sql` - Debug queries
- ✅ `DEBUG_DOCUMENT_VIEWER.md` - Detailed debugging guide
- ✅ `DOCUMENT_VIEWER_TROUBLESHOOTING.md` - User guide

## Status: READY TO TEST

All code changes are complete. Run the SQL fix and test!
