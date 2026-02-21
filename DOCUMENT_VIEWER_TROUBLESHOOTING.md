# Property Document Viewer - Troubleshooting Guide

## Issue: "Property Documents" section not showing for buyers

### Root Causes Fixed:

1. **Wrong listing_type check** - Was checking `'sales'` instead of `'sale'`
2. **Hidden when no documents** - Component returned `null` instead of showing empty state
3. **Inconsistent sale detection** - Only checked `sales_price` instead of `listing_category`

### Changes Made:

#### 1. PropertyDetails.tsx
- Updated `isSale` check to look at both `listing_category === 'sale'` AND `sales_price`
- This ensures it works regardless of how the property was created

#### 2. PublicPropertyDetails.tsx  
- Fixed condition to check for both `'sale'` and `'sales'` (handles both cases)

#### 3. PropertyDocumentViewer.tsx
- Changed behavior when no documents exist
- Now shows an empty state card instead of hiding completely
- Displays: "No documents available yet - The seller hasn't uploaded any property documents"

## How to Test:

### Step 1: Verify Property is a Sales Listing
Run this query with your property ID:
```sql
SELECT id, listing_title, listing_category, sales_price 
FROM properties 
WHERE id = 'YOUR_PROPERTY_ID';
```

Expected result: `listing_category` should be `'sale'` OR `sales_price` should have a value

### Step 2: Check if Documents Exist
```sql
SELECT COUNT(*) as document_count
FROM property_documents
WHERE property_id = 'YOUR_PROPERTY_ID'
  AND deleted_at IS NULL;
```

### Step 3: View as Buyer
1. Log in as a seeker/buyer (NOT the property owner)
2. Navigate to the property details page
3. Look in the right sidebar below the property info card
4. You should now see:
   - **If documents exist**: "Property Documents" card with list of documents
   - **If no documents**: "Property Documents" card with "No documents available yet" message

## What You Should See Now:

### Scenario A: Property has documents
```
┌─────────────────────────────────┐
│ Property Documents          [2] │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │ Title Deed          [Public]│ │
│ │ View | Download            │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ Survey Report      [Private]│ │
│ │ 🔒 Request Access           │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### Scenario B: Property has NO documents (NEW)
```
┌─────────────────────────────────┐
│ Property Documents              │
├─────────────────────────────────┤
│         📄                      │
│  No documents available yet     │
│  The seller hasn't uploaded     │
│  any property documents         │
└─────────────────────────────────┘
```

## To Upload Documents (As Property Owner):

1. Go to "Add Property" or "Edit Property" page
2. Find the "Property Document Vault" section
3. Select property category (e.g., "Residential Sale")
4. Upload documents to the appropriate slots
5. Toggle privacy settings (Public/Private) for each document
6. Save the property

## Next Steps:

If you still don't see the section:
1. Check browser console for errors (F12 → Console tab)
2. Verify you're logged in as a buyer (not the property owner)
3. Confirm the property ID in the URL matches a sales listing
4. Try refreshing the page (Ctrl+F5 for hard refresh)
5. Check the SQL query results to verify property setup

## Quick Test Property Setup:

To test the feature, you need:
1. A property with `listing_category = 'sale'`
2. At least one document uploaded via DocumentVault
3. View the property as a different user (not the owner)
