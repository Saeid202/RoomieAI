# Calendly-Style Picker Troubleshooting

## Issue: Calendar Picker Not Showing

From your screenshot, the debug info shows:
- **Slots: 0**
- **Active: 0**

This means the landlord hasn't set up any availability yet.

## How the System Works

The Schedule Viewing modal has two modes:

### 1. Calendly-Style Picker (When Availability Exists)
Shows when:
- `hasAvailability = true` (availability.length > 0)
- `showCustomRequest = false`

Displays:
- Interactive calendar with blue dots on available dates
- Time slots grouped by Morning/Afternoon/Evening
- Selection summary

### 2. Custom Request Form (Fallback)
Shows when:
- No availability set by landlord (`hasAvailability = false`), OR
- User toggles "Request Custom Time" button

Displays:
- Date picker input
- Time picker input
- Reason textarea
- Blue info box explaining landlord hasn't set availability

## To See the Calendly Picker

The landlord needs to set up availability first:

### Option 1: Set Global Availability (All Properties)
1. Go to landlord dashboard
2. Navigate to "Viewing Appointments" or "Availability Manager"
3. Add availability slots (e.g., Monday 9:00-17:00)
4. Save with `property_id = null` (global)

### Option 2: Set Property-Specific Availability
1. Go to the specific property
2. Set availability for that property only
3. Save with the property's ID

### Quick Test SQL
```sql
-- Check if landlord has ANY availability
SELECT * FROM landlord_availability 
WHERE user_id = '[LANDLORD_USER_ID]' 
AND is_active = true;

-- Add test availability (Monday 9 AM - 5 PM, global)
INSERT INTO landlord_availability (
  user_id,
  property_id,
  day_of_week,
  start_time,
  end_time,
  is_active
) VALUES (
  '[LANDLORD_USER_ID]',
  NULL,  -- Global (all properties)
  1,     -- Monday
  '09:00',
  '17:00',
  true
);
```

## Current Behavior is Correct

The modal is working as designed:
- ✅ Shows custom request form when no availability exists
- ✅ Will show Calendly picker once landlord sets availability
- ✅ Allows toggle between modes when availability exists

## Next Steps

1. **For Testing**: Add availability slots for the landlord using SQL or the UI
2. **Refresh the modal**: Click the "Refresh" button in the debug section
3. **Verify**: You should see "Slots: 1+" and the Calendly picker will appear

## Debug Info Explained

In the blue property info box:
- **Prop**: Property ID (first 8 chars)
- **Owner**: Landlord user_id (first 8 chars)
- **Slots**: Total availability records for this property
- **Active**: Number of active (is_active=true) slots
- **Refresh**: Reloads availability data

When Slots > 0 and Active > 0, the Calendly picker will show!
