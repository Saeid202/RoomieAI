# Viewing Appointments Not Showing - Missing landlord_id Column 🔧

## Issue
When a buyer schedules a viewing appointment, it's not showing up on the landlord's Viewing Appointments page.

## Root Cause
The `property_viewing_appointments` table is **missing the `landlord_id` column**.

### Evidence

1. **Migration file** (`supabase/migrations/20260227_property_viewing_appointments.sql`):
   - Does NOT include `landlord_id` column
   - Only has: `property_id`, `requester_id`, `requester_name`, etc.

2. **Service code** (`viewingAppointmentService.ts`):
   - `createAppointment` function tries to insert `landlord_id`
   - `getLandlordAppointments` function queries by `properties.user_id` (works around missing column)

3. **Modal code** (`ScheduleViewingModal.tsx`):
   - Passes `landlord_id: property.user_id` when creating appointment
   - This data is being sent but can't be stored

## Why This Causes the Problem

### The Query Chain:
1. **Buyer creates appointment** → Tries to insert `landlord_id` → Column doesn't exist → Insert fails OR data is ignored
2. **Landlord views appointments** → Query uses `properties.user_id` → Works, but...
3. **If insert failed** → No appointment record exists
4. **If insert succeeded without landlord_id** → Appointment exists but query might not find it efficiently

### The Actual Query:
```typescript
// In getLandlordAppointments:
.select('*, properties!inner(address, listing_title, city, listing_category, user_id)')
.eq('properties.user_id', userId)
```

This query SHOULD work even without `landlord_id` because it joins through `properties` table. But:
- If the insert is failing silently, no record exists
- If there's an RLS policy checking `landlord_id`, it would fail

## Solution

### Step 1: Add landlord_id Column
Run the migration: `add_landlord_id_to_viewing_appointments.sql`

This will:
1. Add `landlord_id UUID` column with foreign key to `auth.users`
2. Backfill existing appointments from `properties.user_id`
3. Make column NOT NULL
4. Create index for efficient queries

### Step 2: Verify the Fix
After running the migration, check:

```sql
-- Check column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'property_viewing_appointments'
AND column_name = 'landlord_id';

-- Check appointments have landlord_id
SELECT 
  id,
  property_id,
  landlord_id,
  requester_name,
  appointment_date,
  created_at
FROM property_viewing_appointments
ORDER BY created_at DESC
LIMIT 5;
```

### Step 3: Test End-to-End
1. As buyer: Schedule a viewing appointment
2. Check database: Verify appointment was created with `landlord_id`
3. As landlord: Check Viewing Appointments page
4. Verify: Appointment appears in "Pending" tab

## Alternative Query (If Still Not Working)

If appointments still don't show after adding the column, we can simplify the query:

```typescript
// Option 1: Query directly by landlord_id (faster)
async getLandlordAppointments(userId: string): Promise<any[]> {
  const { data, error } = await (supabase as any)
    .from('property_viewing_appointments')
    .select('*, properties!inner(address, listing_title, city, listing_category)')
    .eq('landlord_id', userId)  // Direct query
    .order('appointment_date', { ascending: true })
    .order('appointment_time', { ascending: true });

  if (error) throw error;
  return data || [];
}
```

## Why landlord_id is Important

1. **Performance**: Direct index lookup vs JOIN through properties table
2. **Clarity**: Explicit relationship between appointment and landlord
3. **RLS Policies**: Can create policies based on `landlord_id`
4. **Data Integrity**: Ensures every appointment has a landlord
5. **Future Features**: Easier to implement landlord-specific features

## Files Involved

- ✅ `add_landlord_id_to_viewing_appointments.sql` - Migration to add column
- ✅ `debug_viewing_appointment_issue.sql` - Diagnostic queries
- ✅ `check_appointment_columns.sql` - Column verification
- 📝 `supabase/migrations/20260227_property_viewing_appointments.sql` - Original migration (missing column)
- 📝 `src/services/viewingAppointmentService.ts` - Service expecting column
- 📝 `src/components/property/ScheduleViewingModal.tsx` - Modal passing landlord_id

## Next Steps

1. **Run the migration** in Supabase SQL Editor
2. **Test creating a new appointment** from buyer side
3. **Verify it appears** on landlord side
4. **Check console logs** for any errors
5. **If still not working**, run diagnostic queries to investigate further

## Expected Behavior After Fix

### Buyer Side:
1. Click "Schedule Viewing" button
2. Fill in contact info and select time
3. Click "Request Viewing"
4. See success toast
5. Appointment is created with `landlord_id` populated

### Landlord Side:
1. Navigate to "Viewing Appointments" page
2. See appointment in "Pending (1)" tab
3. See property badge (For Sale/For Rent)
4. See requester info and requested time
5. Can approve or decline

---

**Issue Date**: March 4, 2026
**Status**: FIX READY - Run migration to resolve
**Priority**: HIGH - Blocking core functionality
**Impact**: Viewing appointments not visible to landlords
