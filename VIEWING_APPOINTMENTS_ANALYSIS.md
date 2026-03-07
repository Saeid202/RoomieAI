# Viewing Appointments - Sales Property Display Analysis

## Current Issue
When a viewing is scheduled from a sales property, it should appear in the Viewing Appointments page with clear indication of which property it's for.

## Current Implementation

### Database Schema
The `property_viewing_appointments` table has:
- `property_id` - References the property
- No `listing_category` field directly

### Service Layer
In `viewingAppointmentService.ts`, the `getLandlordAppointments` function:

```typescript
async getLandlordAppointments(userId: string): Promise<any[]> {
  const { data, error } = await (supabase as any)
    .from('property_viewing_appointments')
    .select('*, properties!inner(address, user_id)')
    .eq('properties.user_id', userId)
    .order('appointment_date', { ascending: true })
    .order('appointment_time', { ascending: true });

  if (error) throw error;
  return data || [];
}
```

**Current fields fetched from properties:**
- `address` ✅
- `user_id` ✅

**Missing fields:**
- `listing_category` ❌ (rental vs sale)
- `listing_title` ❌ (property name/title)
- `city` ❌ (location context)

### UI Layer
In `ViewingAppointments.tsx`, the AppointmentCard component shows:

```typescript
{(appointment as any).properties && (
  <div className="flex items-center gap-2 mb-2">
    <Link
      to={`/dashboard/rent/${appointment.property_id}`}
      className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 font-medium"
    >
      <span>{(appointment as any).properties.address}</span>
      <Eye className="h-3 w-3" />
    </Link>
  </div>
)}
```

**Issues:**
1. Link always goes to `/dashboard/rent/` - wrong for sales properties
2. No indication if property is rental or sale
3. Only shows address, no additional context

## Problems

### 1. Wrong Link for Sales Properties
- All appointments link to `/dashboard/rent/{id}`
- Sales properties should link to `/dashboard/property/{id}` or similar

### 2. No Visual Distinction
- No badge or indicator showing if appointment is for rental or sale
- Landlord can't quickly identify property type

### 3. Limited Property Information
- Only shows address
- Missing: listing_title, city, listing_category

## Solution

### Step 1: Update Service to Fetch More Property Data
```typescript
async getLandlordAppointments(userId: string): Promise<any[]> {
  const { data, error } = await (supabase as any)
    .from('property_viewing_appointments')
    .select('*, properties!inner(address, listing_title, city, listing_category, user_id)')
    .eq('properties.user_id', userId)
    .order('appointment_date', { ascending: true })
    .order('appointment_time', { ascending: true });

  if (error) throw error;
  return data || [];
}
```

### Step 2: Update UI to Show Property Type and Correct Link
```typescript
{(appointment as any).properties && (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      {/* Property Type Badge */}
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        (appointment as any).properties.listing_category === 'sale' 
          ? 'bg-purple-100 text-purple-800' 
          : 'bg-blue-100 text-blue-800'
      }`}>
        {(appointment as any).properties.listing_category === 'sale' ? 'For Sale' : 'For Rent'}
      </span>
      
      {/* Property Link */}
      <Link
        to={
          (appointment as any).properties.listing_category === 'sale'
            ? `/dashboard/property/${appointment.property_id}`
            : `/dashboard/rent/${appointment.property_id}`
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
      <div className="text-xs text-gray-500 ml-2">
        {(appointment as any).properties.address}, {(appointment as any).properties.city}
      </div>
    )}
  </div>
)}
```

## Benefits

1. **Correct Navigation**: Sales properties link to correct page
2. **Visual Clarity**: Badge shows property type at a glance
3. **Better Context**: Shows listing title + address + city
4. **Consistent UX**: Matches property categorization system

## Implementation Priority
HIGH - This affects user experience for sales property viewings

## Files to Modify
1. `src/services/viewingAppointmentService.ts` - Update query
2. `src/pages/dashboard/landlord/ViewingAppointments.tsx` - Update UI

---
**Analysis Date**: March 4, 2026
