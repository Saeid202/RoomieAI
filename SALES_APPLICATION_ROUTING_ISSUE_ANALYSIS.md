# Sales Application Routing Issue - Root Cause Analysis

## Problem
Sales property applications (like "1 Grandview Avenue") are appearing in the "Rental Applications" tab instead of the "Sales Inquiries" tab.

## Root Cause

### Issue Location
**File:** `src/services/rentalApplicationService.ts`
**Function:** `getLandlordApplications()` (Line 309)

### The Bug
The function fetches applications with property data but **DOES NOT include the `listing_category` field**:

```typescript
// CURRENT CODE (Line 348-350) - MISSING listing_category
property:properties!inner(
  id, listing_title, address, city, state, monthly_rent, user_id, images
)
```

### Why This Causes the Issue

1. **Applications page filters by listing_category** (Line 195-203):
   ```typescript
   const rentalApplications = useMemo(
     () => applications.filter(app => 
       app.property?.listing_category === 'rental' || !app.property?.listing_category
     ),
     [applications]
   );
   
   const salesApplications = useMemo(
     () => applications.filter(app => 
       app.property?.listing_category === 'sale'
     ),
     [applications]
   );
   ```

2. **Since `listing_category` is not fetched**, it's `undefined` for all applications

3. **The rental filter has a fallback**: `|| !app.property?.listing_category`
   - This means: "Show in rental tab if listing_category is 'rental' OR if it's undefined"
   - This fallback was meant for backward compatibility but catches ALL applications when the field is missing

4. **The sales filter is strict**: Only shows if `listing_category === 'sale'`
   - Since the field is undefined, NO applications appear in sales tab

5. **Result**: ALL applications (rental AND sales) appear in the Rental Applications tab

## The Fix

Add `listing_category` to the property select in `getLandlordApplications()`:

```typescript
property:properties!inner(
  id, listing_title, address, city, state, monthly_rent, user_id, images, listing_category
)
```

Also add `sales_price` for sales properties:

```typescript
property:properties!inner(
  id, listing_title, address, city, state, monthly_rent, sales_price, user_id, images, listing_category
)
```

## Impact
- Sales property applications will correctly route to "Sales Inquiries" tab
- Rental property applications will stay in "Rental Applications" tab
- Backward compatibility maintained (properties without listing_category default to rental)

## Files to Update
1. `src/services/rentalApplicationService.ts` - Add listing_category and sales_price to select

## Status
🔍 Issue identified
⏳ Fix pending
