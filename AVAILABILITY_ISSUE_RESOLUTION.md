# Availability Not Showing - Issue Resolution

## Problem Summary

User set availability for a property, but when tenants try to schedule a viewing, the modal shows "No times available".

## Root Cause

The `getPropertyAvailability()` method in `src/services/viewingAppointmentService.ts` had flawed query logic:

1. It queried by `user_id` first
2. Then tried to filter in JavaScript for property-specific or global slots
3. The JavaScript filter logic wasn't correctly identifying matching slots

## Solution Applied

### Code Changes

**File**: `src/services/viewingAppointmentService.ts`

**Changed**: Lines 6-68 (the `getPropertyAvailability` method)

**Key improvement**: Use Supabase's `.or()` operator to fetch the correct slots in a single database query:

```typescript
// Before (broken):
query = query.eq('user_id', landlordId);
// Then filter in JavaScript...

// After (fixed):
query = query
  .eq('user_id', landlordId)
  .or(`property_id.eq.${propertyId},property_id.is.null`);
```

This correctly fetches:
- Slots specifically for this property (`property_id` matches)
- Global slots for this landlord (`property_id` is NULL)

### Enhanced Logging

Added detailed console logging to help diagnose issues:
- Shows property ID and landlord ID being queried
- Shows number of rows returned from database
- Shows sample availability slots
- Provides troubleshooting hints when no availability found

## Testing Instructions

### For the User

1. **Run diagnostic SQL**:
   - Open `check_property_availability_detailed.sql`
   - Follow STEP 1-4 to verify availability is saved in database
   - Expected: STEP 4 should return at least 1 row

2. **Test in browser**:
   - Clear browser cache
   - Navigate to property listing
   - Click "Schedule Viewing"
   - Open browser console (F12)
   - Look for logs starting with `🔍 [AVAILABILITY SERVICE]`
   - Should see: "Query returned X rows" where X > 0

3. **Verify UI**:
   - Calendar should show blue dots on available days
   - Clicking a date should show time slots
   - Should be able to select and book a time

### Expected Console Output

```
-----------------------------------------
🔍 [AVAILABILITY SERVICE] Fetching for: {propertyId: "abc123...", landlordId: "xyz789..."}
👤 [AVAILABILITY SERVICE] User logged in: true
🔍 [AVAILABILITY SERVICE] Filtering by landlordId: xyz789...
📊 [AVAILABILITY SERVICE] Query returned 5 rows
🔍 [AVAILABILITY SERVICE] First 3 rows:
  [1] property_id: abc123..., day: 1, time: 09:00-17:00
  [2] property_id: abc123..., day: 2, time: 09:00-17:00
  [3] property_id: abc123..., day: 3, time: 09:00-17:00
✅ [AVAILABILITY SERVICE] Returning 5 slots
-----------------------------------------
```

## Troubleshooting

### If still showing "No times available"

1. **Check database**: Run `check_property_availability_detailed.sql`
   - If STEP 4 returns 0 rows → Availability not saved properly
   - If STEP 4 returns rows → Check browser console for errors

2. **Check console logs**:
   - "Query returned 0 rows" → Availability not in database or wrong IDs
   - "propertyId is missing!" → Property object missing `id` field
   - "NO landlordId!" → Property object missing `user_id` field

3. **Verify data integrity**:
   - `is_active` should be `true`
   - `user_id` should match property owner
   - `property_id` should match property OR be NULL (for global)
   - `day_of_week` should be 0-6 (0=Sunday, 6=Saturday)

### Common Issues

**Issue**: Availability saved but not showing
- **Cause**: `is_active = false`
- **Fix**: Update to `is_active = true`

**Issue**: Wrong days showing
- **Cause**: `day_of_week` values incorrect
- **Fix**: Verify 0=Sunday, 1=Monday, ..., 6=Saturday

**Issue**: All slots show as unavailable
- **Cause**: Existing appointments blocking all slots
- **Fix**: Check `property_viewing_appointments` table

## Files Modified

1. `src/services/viewingAppointmentService.ts` - Fixed query logic

## Files Created

1. `check_property_availability_detailed.sql` - Diagnostic queries
2. `AVAILABILITY_FIX_TESTING_GUIDE.md` - Testing instructions
3. `AVAILABILITY_ISSUE_RESOLUTION.md` - This file

## Next Steps

1. User should test with their specific property
2. Check browser console for detailed logs
3. Run diagnostic SQL if issues persist
4. Report back with console output if still not working

## Technical Notes

- TypeScript errors about table names are expected (tables not in generated types)
- These don't affect runtime functionality
- The fix is backward compatible with existing data
- Works with both property-specific and global availability slots
