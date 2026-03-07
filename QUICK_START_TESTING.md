# Quick Start - Test the Availability Fix

## 30-Second Test

1. **Clear browser cache** (Ctrl+Shift+Delete or Cmd+Shift+Delete)
2. Go to any property listing
3. Click "Schedule Viewing" button
4. Press **F12** to open browser console
5. Look for these logs:

```
🔍 [AVAILABILITY SERVICE] Fetching for: {propertyId: "...", landlordId: "..."}
📊 [AVAILABILITY SERVICE] Query returned X rows
✅ [AVAILABILITY SERVICE] Returning X slots
```

**✅ Success**: If X > 0, availability is working!  
**❌ Problem**: If X = 0, see troubleshooting below

## If X = 0 (No Availability Found)

### Option 1: Check Database (Recommended)

Run this SQL query in Supabase SQL Editor:

```sql
-- Find your property
SELECT id, user_id, address, listing_title
FROM properties
WHERE address ILIKE '%YOUR_ADDRESS%'
LIMIT 5;

-- Check availability (replace IDs from above)
SELECT day_of_week, start_time, end_time, is_active
FROM landlord_availability
WHERE user_id = 'YOUR_USER_ID'
  AND (property_id = 'YOUR_PROPERTY_ID' OR property_id IS NULL);
```

**If returns 0 rows**: Availability not saved → Use Option 2

### Option 2: Add Test Availability

Run this SQL to add Monday-Friday 9 AM-5 PM availability:

```sql
-- Replace YOUR_USER_ID and YOUR_PROPERTY_ID
INSERT INTO landlord_availability (user_id, property_id, day_of_week, start_time, end_time, is_active)
VALUES 
  ('YOUR_USER_ID', 'YOUR_PROPERTY_ID', 1, '09:00:00', '17:00:00', true),
  ('YOUR_USER_ID', 'YOUR_PROPERTY_ID', 2, '09:00:00', '17:00:00', true),
  ('YOUR_USER_ID', 'YOUR_PROPERTY_ID', 3, '09:00:00', '17:00:00', true),
  ('YOUR_USER_ID', 'YOUR_PROPERTY_ID', 4, '09:00:00', '17:00:00', true),
  ('YOUR_USER_ID', 'YOUR_PROPERTY_ID', 5, '09:00:00', '17:00:00', true);
```

Then test again (clear cache first!)

## Console Output Reference

### ✅ Good Output (Working)
```
🔍 [AVAILABILITY SERVICE] Fetching for: {propertyId: "abc123", landlordId: "xyz789"}
👤 [AVAILABILITY SERVICE] User logged in: true
🔍 [AVAILABILITY SERVICE] Filtering by landlordId: xyz789
📊 [AVAILABILITY SERVICE] Query returned 5 rows
🔍 [AVAILABILITY SERVICE] First 3 rows:
  [1] property_id: abc123, day: 1, time: 09:00-17:00
  [2] property_id: abc123, day: 2, time: 09:00-17:00
  [3] property_id: abc123, day: 3, time: 09:00-17:00
✅ [AVAILABILITY SERVICE] Returning 5 slots
```

### ❌ Bad Output (Not Working)
```
🔍 [AVAILABILITY SERVICE] Fetching for: {propertyId: "abc123", landlordId: "xyz789"}
👤 [AVAILABILITY SERVICE] User logged in: true
🔍 [AVAILABILITY SERVICE] Filtering by landlordId: xyz789
📊 [AVAILABILITY SERVICE] Query returned 0 rows
⚠️ [AVAILABILITY SERVICE] No availability found! Check:
  - Is availability saved in database?
  - Is is_active = true?
  - Does user_id match landlordId?
  - Does property_id match or is NULL?
✅ [AVAILABILITY SERVICE] Returning 0 slots
```

## What Should Happen

### When Working Correctly

1. **Modal opens** with property info at top
2. **Calendar shows** with blue dots on available days
3. **Click a date** → Time slots appear below
4. **Select time** → "Request Viewing" button becomes active
5. **Submit** → Success message appears

### When Not Working

1. Modal opens but calendar is empty
2. No blue dots on any dates
3. Message: "No times available"
4. Only option is "Request Custom Time"

## Quick Fixes

### Fix 1: Set Availability via UI

1. Login as landlord
2. Go to "Viewing Appointments" → "Availability" tab
3. Select property from table
4. Click day buttons (M T W T F S S)
5. Add time slots
6. Click "Save Changes"

### Fix 2: Set Availability via Property Form

1. Login as landlord
2. Go to "My Properties" → Edit property
3. Scroll to "Viewing Availability" section
4. Set availability
5. Save property

## Need More Help?

See detailed guides:
- `VIEWING_AVAILABILITY_FIX_SUMMARY.md` - Complete overview
- `AVAILABILITY_FIX_TESTING_GUIDE.md` - Detailed testing steps
- `check_property_availability_detailed.sql` - Database diagnostics
- `add_test_availability_quick.sql` - Quick availability setup

## Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| "Query returned 0 rows" | No availability in DB | Add via UI or SQL |
| "propertyId is missing!" | Property data incomplete | Check property object |
| "NO landlordId!" | Property missing user_id | Check property owner |
| Calendar empty but has data | Wrong day_of_week | Verify 0=Sun, 6=Sat |
| All slots unavailable | Existing appointments | Check bookings table |

---

**Status**: ✅ Fix applied  
**Next**: Test and report results  
**Time**: 30 seconds to test
