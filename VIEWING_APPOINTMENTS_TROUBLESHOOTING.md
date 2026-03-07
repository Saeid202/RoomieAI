# Viewing Appointments System - Troubleshooting Guide

## Current Status

✅ Database tables created successfully:
- `landlord_availability` table exists
- `property_viewing_appointments` table exists

✅ Frontend components implemented:
- AvailabilityManager with property selector
- ViewingAppointments dashboard page
- ScheduleViewingModal for tenants

## The Issue You're Experiencing

The errors you're seeing are because **you're not logged in**:

```
LoginDialog.tsx:91  Login failed: AuthApiError: Invalid login credentials
viewingAppointmentService.ts:205  Supabase error fetching properties
```

When you're not authenticated:
- `auth.uid()` returns null
- All queries that filter by `user_id` fail
- The properties query can't find any data

## Solution: Log In First!

### Step 1: Log In to Your Account

1. Open your application in the browser
2. Click the login button
3. Enter your credentials (the landlord account you've been using)
4. Make sure you see a successful login

### Step 2: Navigate to Viewing Appointments

1. After logging in, go to the landlord dashboard
2. Click on "Viewing Appointments" in the sidebar
3. You should now see the page load without errors

### Step 3: Test the Property Selector

1. Go to the "Availability" tab
2. You should see a dropdown with your properties
3. Select "All Properties" or a specific property
4. Add an availability slot
5. Verify it appears in the list with the correct property name

## Verification Steps

Run these queries in Supabase SQL Editor to verify everything is set up:

### 1. Check if landlord_availability table exists
```sql
SELECT COUNT(*) FROM landlord_availability;
```

### 2. Check your properties
```sql
SELECT id, address, city, province, status, user_id
FROM properties
WHERE user_id = auth.uid()
ORDER BY created_at DESC;
```

### 3. Check your availability slots
```sql
SELECT 
  la.*,
  p.address as property_address
FROM landlord_availability la
LEFT JOIN properties p ON la.property_id = p.id
WHERE la.user_id = auth.uid()
ORDER BY la.day_of_week, la.start_time;
```

## Expected Behavior After Login

### Property Selector
- Shows "All Properties" option
- Lists all your non-archived properties
- Each property shows its address

### Adding Availability
- Select a property (or "All Properties")
- Choose day of week
- Set start and end times
- Click "Add Availability"
- See success message with property name

### Viewing Availability
- Slots grouped by day of week
- Each slot shows:
  - Time range (e.g., "9:00 AM - 5:00 PM")
  - Property name (e.g., "123 Main St" or "All Properties")
  - Active/Inactive toggle
  - Delete button

## Common Issues

### Issue: "No properties found"
**Cause**: You don't have any properties in the database yet
**Solution**: Create a property first from the landlord dashboard

### Issue: "Failed to load properties"
**Cause**: Not logged in or RLS policies blocking access
**Solution**: 
1. Make sure you're logged in
2. Check that you're logged in as a landlord
3. Verify RLS policies allow landlords to read their own properties

### Issue: "Table does not exist"
**Cause**: Migration not run or connected to wrong database
**Solution**:
1. Run the verification query in Supabase SQL Editor
2. Check you're connected to the correct project
3. Re-run the migration if needed

## Testing the Full Flow

### As a Landlord:
1. Log in as landlord
2. Go to Viewing Appointments → Availability tab
3. Select a property
4. Add availability: Monday 9:00 AM - 5:00 PM
5. Verify it appears in the list
6. Toggle it active/inactive
7. Try adding availability for "All Properties"

### As a Tenant:
1. Log in as tenant
2. Browse properties
3. Click "Schedule Viewing" on a property
4. See available time slots based on landlord's availability
5. Book a viewing
6. Landlord should see it in "Pending" tab

## Files Modified

- `src/components/landlord/AvailabilityManager.tsx` - Added property selector and better auth handling
- `src/services/viewingAppointmentService.ts` - Added `getLandlordProperties()` and `getAvailabilityByProperty()`
- `src/types/viewingAppointment.ts` - Added `Property` interface
- `src/pages/dashboard/landlord/ViewingAppointments.tsx` - Better error handling for unauthenticated users

## Next Steps

Once you're logged in and can see the property selector working:

1. Test creating availability for specific properties
2. Test creating global availability (All Properties)
3. Test the tenant booking flow
4. Verify landlords see appointments in their dashboard
5. Test approve/decline functionality

## Need Help?

If you're still seeing errors after logging in:
1. Open browser console (F12)
2. Copy the exact error message
3. Run the verification queries above
4. Check which step is failing
