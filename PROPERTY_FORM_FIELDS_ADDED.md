# Property Form Fields Update

## Changes Made

### Added Fields to Property Listing Form
1. **Bathrooms** - Number input with 0.5 step (allows 1, 1.5, 2, etc.)
2. **Square Footage** - Number input for property size
3. **Neighborhood** - Text input (already existed in DB, now added to form)

### Removed Fields
- **Bedrooms** - Removed from form since it's already defined by Unit Configuration (e.g., "1-Bedroom", "2-Bedroom", "Studio")

## Implementation Details

### 1. Updated PropertyFormData Interface
```typescript
interface PropertyFormData {
  // ... existing fields
  
  // Property Details
  bathrooms: string;
  squareFootage: string;
  
  // neighborhood already existed
}
```

### 2. Added Form Fields

**For Sales Listings:**
- Fields appear after "Downpayment Target"
- Grid layout: 3 columns (bathrooms, square footage, neighborhood)

**For Rental Listings:**
- Fields appear after "Furnishing" dropdown
- Grid layout: 3 columns (bathrooms, square footage, neighborhood)

### 3. Database Mapping
```typescript
const propertyData = {
  // ... existing fields
  bathrooms: formData.bathrooms ? parseFloat(formData.bathrooms) : null,
  square_footage: formData.squareFootage ? parseInt(formData.squareFootage) : null,
  neighborhood: formData.neighborhood || null // Already existed
};
```

### 4. Data Loading (Edit Mode)
When editing a property, these fields now load from the database:
```typescript
bathrooms: data.bathrooms?.toString() || "",
squareFootage: data.square_footage?.toString() || "",
neighborhood: data.neighborhood || "" // Already existed
```

## Database Columns
These columns already exist in the `properties` table:
- `bathrooms` - NUMERIC(3, 1) - Allows values like 1.0, 1.5, 2.0
- `square_footage` - INTEGER
- `neighborhood` - TEXT

## Why Remove Bedrooms?
The bedrooms field is redundant because:
- Unit Configuration already specifies bedroom count:
  - "Studio" = 0 bedrooms
  - "1-Bedroom" = 1 bedroom
  - "2-Bedroom" = 2 bedrooms
  - "3-Bedroom+" = 3+ bedrooms
- Having both creates confusion and potential data inconsistency
- The `bedrooms` column still exists in the database for backward compatibility

## Files Modified
- `src/pages/dashboard/landlord/AddProperty.tsx`
  - Added bathrooms, squareFootage to PropertyFormData interface
  - Added form input fields for both sales and rental listings
  - Updated data loading to populate these fields when editing
  - Updated propertyData object to save these fields to database

## Testing
After refreshing the browser:
1. Create a new property listing
2. You should see:
   - Bathrooms field (number input with 0.5 step)
   - Square Footage field (number input)
   - Neighborhood field (text input)
3. Fill in these fields and save
4. Edit the property - fields should load with saved values
5. Verify data is saved to database

## Next Steps
1. Clear browser cache or use incognito mode to see changes
2. Test creating a new property with these fields
3. Test editing an existing property to verify fields load correctly
