# Availability Not Showing - Fix Applied

## What Was Fixed

The issue was in the `getPropertyAvailability()` method in `src/services/viewingAppointmentService.ts`. The previous logic had two problems:

1. **Inefficient filtering**: It queried by `user_id` first, then filtered in JavaScript
2. **Wrong filter logic**: The JavaScript filter wasn't correctly matching property-specific slots

### The Fix

Changed the database query to use Supabase's `.or()` operator to get the right slots in one query:

```typescript
// OLD (broken):
query = query.eq('user_id', landlordId);
// Then filter in JS...

// NEW (fixed):
query = query
  .eq('user_id', landlordId)
  .or(`property_id.eq.${propertyId},property_id.is.null`);
```

This now correctly fetches:
- Slots specifically for this property (`property_id` matches)
- Global slots for this landlord (`property_id` is NULL)

## How to Test

### Step 1: Verify Availability is Saved

Run `check_property_availability_detailed.sql`:

1. In STEP 1, replace `'YOUR_ADDRESS_HERE'` with part of your property address
2. Copy the `property_id` and `user_id` (landlord_id) from the results
3. In STEP 2, 3, and 4, replace the placeholder IDs with your actual IDs
4. Run each step and verify you see availability records

**Expected**: STEP 4 should return at least 1 row with your availability

### Step 2: Test in Browser

1. **Clear browser cache** (important!)
2. Navigate to a property listing page
3. Click "Schedule Viewing" button
4. **Open browser console** (F12 → Console tab)
5. Look for logs starting with `🔍 [AVAILABILITY SERVICE]`

**Expected console output:**
```
🔍 [AVAILABILITY SERVICE] Fetching for: {propertyId: "...", landlordId: "..."}
👤 [AVAILABILITY SERVICE] User logged in: true
🔍 [AVAILABILITY SERVICE] Filtering by landlordId: ...
📊 [AVAILABILITY SERVICE] Query returned X rows
🔍 [AVAILABILITY SERVICE] First 3 rows:
  [1] property_id: abc123..., day: 1, time: 09:00-17:00
  [2] property_id: abc123..., day: 2, time: 09:00-17:00
✅ [AVAILABILITY SERVICE] Returning X slots
```

### Step 3: Verify UI Shows Dates

After the modal opens:
- Calendar should show blue dots on available days
- Clicking a date should show time slots
- If no availability shows, check console for warnings

## Troubleshooting

### Issue: Console shows "Query returned 0 rows"

**Possible causes:**
1. Availability not saved in database
2. `is_active` is false
3. `user_id` doesn't match the property owner
4. `property_id` doesn't match and isn't NULL

**Solution**: Run the diagnostic SQL (Step 1 above)

### Issue: Console shows "propertyId is missing!"

**Cause**: Property object doesn't have an `id` field

**Solution**: Check the property details page - ensure `property.id` exists

### Issue: Console shows "NO landlordId!"

**Cause**: Property object doesn't have a `user_id` field

**Solution**: The query will only look for property-specific slots (not global ones)

### Issue: Availability exists but calendar is empty

**Possible causes:**
1. Availability is for wrong days of week
2. Date range is outside available dates
3. All slots are already booked

**Solution**: 
- Check `day_of_week` values (0=Sunday, 6=Saturday)
- Try selecting different dates in the calendar
- Check if appointments are blocking slots

## Quick Fix Commands

### Reset and re-save availability:
```sql
-- Delete old availability for a property
DELETE FROM landlord_availability 
WHERE property_id = 'YOUR_PROPERTY_ID';

-- Add fresh availability (Monday-Friday, 9 AM - 5 PM)
INSERT INTO landlord_availability (user_id, property_id, day_of_week, start_time, end_time, is_active)
VALUES 
  ('YOUR_USER_ID', 'YOUR_PROPERTY_ID', 1, '09:00', '17:00', true),
  ('YOUR_USER_ID', 'YOUR_PROPERTY_ID', 2, '09:00', '17:00', true),
  ('YOUR_USER_ID', 'YOUR_PROPERTY_ID', 3, '09:00', '17:00', true),
  ('YOUR_USER_ID', 'YOUR_PROPERTY_ID', 4, '09:00', '17:00', true),
  ('YOUR_USER_ID', 'YOUR_PROPERTY_ID', 5, '09:00', '17:00', true);
```

## Summary

The fix improves the database query to correctly fetch property-specific and global availability in one efficient query. The enhanced logging will help you diagnose any remaining issues.
