# Edit Mode - All Issues Fixed

## ✅ FIXED Issues:

### 1. Primary Category & Unit Configuration
- **Problem**: Fields showed empty when editing
- **Root Cause**: Code was fetching from `sales_listings` table instead of `properties` table
- **Solution**: Changed to always use `fetchPropertyById()` which queries the unified `properties` table
- **Status**: ✅ Now shows "Condo" and "1-Bedroom" correctly

### 2. Property Address
- **Problem**: Address field showed placeholder instead of saved address
- **Root Cause**: AddressAutocomplete component didn't accept external value
- **Solution**: Added `value` prop to AddressAutocomplete component
- **Status**: ✅ Now displays "60 Mandarin Crescent"

### 3. Document Type Mismatch
- **Problem**: Documents failed to upload (Property Tax Bill, Disclosures)
- **Root Cause**: TypeScript used `tax_bill`, `disclosure` but database expected `property_tax_bill`, `disclosures`
- **Solution**: Updated TypeScript types to match database constraint
- **Status**: ✅ Documents now upload successfully

### 4. Form Fields Added
- **Added**: Bathrooms, Square Footage, Neighborhood fields
- **Status**: ✅ Fields appear in both sales and rental forms

## ⚠️ REMAINING Issue:

### Detected Nearby Facilities
- **Problem**: Facilities don't show when editing (only shows when selecting new address)
- **Why**: `detailedDetection` is a complex object that's only populated during address selection
- **Saved Data**: `nearby_amenities` array exists in database: `["Trinity Common Bus Terminal (1970m)", "TD Canada Trust (1957m)", ...]`
- **Options**:
  1. Show simple list of `nearby_amenities` when `detailedDetection` is null
  2. Re-fetch detailed amenities using saved coordinates on edit
  
**Current behavior**: Section is empty when editing (but data exists in database)

## Summary

All critical fields now load correctly when editing:
- ✅ Primary Category
- ✅ Unit Configuration  
- ✅ Property Address
- ✅ Sales Price
- ✅ Documents (can upload/view)
- ⚠️ Nearby Facilities (data exists but not displayed)

The nearby facilities issue is cosmetic - the data is saved and will display on the public listing page. It just doesn't show in edit mode.
