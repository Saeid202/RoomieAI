# Viewing Appointments - Sales Property Display Fix ✅

## Issue
When scheduling a viewing from a sales property, the appointment appeared in the Viewing Appointments page but:
1. Didn't show which property type (rental vs sale)
2. Always linked to `/dashboard/rent/{id}` (wrong for sales properties)
3. Only showed address without additional context

## Solution Implemented

### 1. Updated Service Layer
**File**: `src/services/viewingAppointmentService.ts`

Enhanced `getLandlordAppointments` to fetch additional property fields:

```typescript
async getLandlordAppointments(userId: string): Promise<any[]> {
  const { data, error } = await (supabase as any)
    .from('property_viewing_appointments')
    .select('*, properties!inner(address, listing_title, city, listing_category, user_id)')
    //                            ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    //                            Added: listing_title, city, listing_category
    .eq('properties.user_id', userId)
    .order('appointment_date', { ascending: true })
    .order('appointment_time', { ascending: true });

  if (error) throw error;
  return data || [];
}
```

**New fields fetched:**
- `listing_title` - Property name/title
- `city` - Location context
- `listing_category` - 'rental' or 'sale'

### 2. Updated UI Layer
**File**: `src/pages/dashboard/landlord/ViewingAppointments.tsx`

Enhanced AppointmentCard to show property type and correct link:

```typescript
{(appointment as any).properties && (
  <div className="space-y-1 mb-2">
    <div className="flex items-center gap-2">
      {/* Property Type Badge */}
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        (appointment as any).properties.listing_category === 'sale' 
          ? 'bg-purple-100 text-purple-800'    // Purple for sales
          : 'bg-blue-100 text-blue-800'        // Blue for rentals
      }`}>
        {(appointment as any).properties.listing_category === 'sale' ? 'For Sale' : 'For Rent'}
      </span>
      
      {/* Property Link - Routes correctly based on type */}
      <Link
        to={
          (appointment as any).properties.listing_category === 'sale'
            ? `/dashboard/property/${appointment.property_id}`  // Sales route
            : `/dashboard/rent/${appointment.property_id}`      // Rental route
        }
        className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 font-medium"
      >
        <span>
          {(appointment as any).properties.listing_title || (appointment as any).properties.address}
        </span>
        <Eye className="h-3 w-3" />
      </Link>
    </div>
    
    {/* Address if title is shown */}
    {(appointment as any).properties.listing_title && (
      <div className="text-xs text-gray-500 ml-2 pl-16">
        {(appointment as any).properties.address}{(appointment as any).properties.city ? `, ${(appointment as any).properties.city}` : ''}
      </div>
    )}
  </div>
)}
```

## Features Added

### 1. Property Type Badge
- **For Sale**: Purple badge (`bg-purple-100 text-purple-800`)
- **For Rent**: Blue badge (`bg-blue-100 text-blue-800`)
- Appears before property link for instant identification

### 2. Smart Routing
- **Sales properties**: Link to `/dashboard/property/{id}`
- **Rental properties**: Link to `/dashboard/rent/{id}`
- Automatically determined by `listing_category`

### 3. Enhanced Property Information
- Shows `listing_title` if available (more descriptive)
- Falls back to `address` if no title
- Shows full address + city below title (if title exists)
- Provides better context for landlord

## Visual Example

### Before:
```
[Date/Time]
123 Main St [View Icon]
[Requester info...]
```

### After:
```
[Date/Time]
[For Sale] Luxury Downtown Condo [View Icon]
           123 Main St, Toronto
[Requester info...]
```

or

```
[Date/Time]
[For Rent] Cozy 2BR Apartment [View Icon]
           456 Oak Ave, Vancouver
[Requester info...]
```

## Benefits

1. **Clear Identification**: Landlord can instantly see if appointment is for rental or sale property
2. **Correct Navigation**: Clicking property link goes to correct page
3. **Better Context**: More descriptive property information
4. **Consistent UX**: Matches property categorization system colors
5. **Professional Look**: Badge + title + address provides complete information

## Testing Checklist

- [x] TypeScript diagnostics pass (ViewingAppointments.tsx)
- [ ] Schedule viewing from rental property → shows blue "For Rent" badge
- [ ] Schedule viewing from sales property → shows purple "For Sale" badge
- [ ] Click rental property link → goes to `/dashboard/rent/{id}`
- [ ] Click sales property link → goes to `/dashboard/property/{id}`
- [ ] Property with listing_title → shows title + address below
- [ ] Property without listing_title → shows address only
- [ ] Multiple appointments → each shows correct badge and link

## Database Schema
No changes needed - uses existing fields:
- `properties.listing_category` (already exists)
- `properties.listing_title` (already exists)
- `properties.city` (already exists)

## Related Files
- `src/services/viewingAppointmentService.ts` ✅
- `src/pages/dashboard/landlord/ViewingAppointments.tsx` ✅
- `VIEWING_APPOINTMENTS_ANALYSIS.md` (analysis document)

## Notes

### TypeScript Warnings
The service file shows TypeScript warnings about Supabase types not including custom tables (`property_viewing_appointments`, `landlord_availability`). These are pre-existing and don't affect functionality - the code uses `(supabase as any)` to bypass type checking for custom tables.

### Future Enhancements
- Add property image thumbnail
- Show property price/rent amount
- Add filter by property type
- Add property status indicator (active/pending/sold)

---

**Fix Date**: March 4, 2026
**Status**: COMPLETE ✅
**Priority**: HIGH - Improves UX for sales property viewings
**Impact**: Landlords can now clearly identify and navigate to sales properties from viewing appointments
