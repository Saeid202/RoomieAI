# Property Viewing Appointments - System Architecture

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    VIEWING APPOINTMENTS SYSTEM               │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   LANDLORD   │         │    TENANT    │         │   DATABASE   │
│              │         │              │         │              │
│ - Set Avail  │         │ - View Slots │         │ - Properties │
│ - Manage     │◄───────►│ - Book Time  │◄───────►│ - Landlord   │
│   Requests   │         │ - Request    │         │   Availability│
│ - Approve/   │         │   Custom     │         │ - Viewing    │
│   Decline    │         │              │         │   Appointments│
└──────────────┘         └──────────────┘         └──────────────┘
```

## Data Flow

### 1. Landlord Sets Availability

```
Landlord Dashboard
       ↓
Viewing Appointments Page
       ↓
Availability Tab
       ↓
Select Property (or "All Properties")
       ↓
Add Time Slot (Day + Start/End Time)
       ↓
Save to Database
       ↓
landlord_availability table
  - user_id: landlord's ID
  - property_id: specific property OR null (all properties)
  - day_of_week: 0-6 (Sunday-Saturday)
  - start_time: "09:00"
  - end_time: "17:00"
  - is_active: true
```

### 2. Tenant Books Viewing

```
Property Listing Page
       ↓
Click "Schedule Viewing"
       ↓
Modal Opens
       ↓
System Fetches Landlord Availability
       ↓
Generates 30-min Time Slots
       ↓
Tenant Selects Slot (or requests custom time)
       ↓
Fills in Details (name, email, phone, message)
       ↓
Submit Booking
       ↓
property_viewing_appointments table
  - property_id
  - requester_id
  - requested_date
  - requested_time_slot
  - status: "pending"
```

### 3. Landlord Manages Requests

```
Viewing Appointments Dashboard
       ↓
Pending Tab
       ↓
See All Pending Requests
       ↓
Review Details:
  - Date & Time
  - Tenant Info
  - Message
  - Number of Attendees
       ↓
Approve or Decline
       ↓
Update status in database
       ↓
Tenant Notified (future: email)
```

## Database Schema

### landlord_availability
```sql
┌─────────────────┬──────────────┬─────────────────────────┐
│ Column          │ Type         │ Description             │
├─────────────────┼──────────────┼─────────────────────────┤
│ id              │ uuid         │ Primary key             │
│ user_id         │ uuid         │ Landlord's user ID      │
│ property_id     │ uuid (null)  │ Specific property or    │
│                 │              │ NULL for all properties │
│ day_of_week     │ integer      │ 0=Sun, 1=Mon, ... 6=Sat │
│ start_time      │ varchar      │ "09:00" format          │
│ end_time        │ varchar      │ "17:00" format          │
│ is_active       │ boolean      │ Can toggle on/off       │
│ created_at      │ timestamp    │ When created            │
│ updated_at      │ timestamp    │ Last modified           │
└─────────────────┴──────────────┴─────────────────────────┘

Foreign Keys:
  - user_id → auth.users(id)
  - property_id → properties(id)

Indexes:
  - idx_landlord_availability_user
  - idx_landlord_availability_property
  - idx_landlord_availability_day
```

### property_viewing_appointments
```sql
┌──────────────────────┬──────────────┬─────────────────────────┐
│ Column               │ Type         │ Description             │
├──────────────────────┼──────────────┼─────────────────────────┤
│ id                   │ uuid         │ Primary key             │
│ property_id          │ uuid         │ Property being viewed   │
│ requester_id         │ uuid         │ Tenant's user ID        │
│ landlord_id          │ uuid         │ Property owner ID       │
│ requested_date       │ date         │ Viewing date            │
│ requested_time_slot  │ varchar      │ "10:00" format          │
│ status               │ varchar      │ pending/confirmed/etc   │
│ requester_name       │ varchar      │ Tenant's name           │
│ requester_email      │ varchar      │ Contact email           │
│ requester_phone      │ varchar      │ Contact phone           │
│ message              │ text         │ Additional message      │
│ number_of_attendees  │ integer      │ How many people         │
│ is_custom_request    │ boolean      │ Custom time vs slot     │
│ landlord_notes       │ text         │ Landlord's notes        │
│ declined_reason      │ text         │ Why declined            │
│ alternative_date     │ date         │ Suggested alternative   │
│ alternative_time_slot│ varchar      │ Suggested alt time      │
│ created_at           │ timestamp    │ When requested          │
│ updated_at           │ timestamp    │ Last modified           │
│ confirmed_at         │ timestamp    │ When confirmed          │
│ completed_at         │ timestamp    │ When completed          │
└──────────────────────┴──────────────┴─────────────────────────┘

Foreign Keys:
  - property_id → properties(id)
  - requester_id → auth.users(id)
  - landlord_id → auth.users(id)

Indexes:
  - idx_viewing_appointments_property
  - idx_viewing_appointments_requester
  - idx_viewing_appointments_landlord
  - idx_viewing_appointments_status
  - idx_viewing_appointments_date
```

## Component Architecture

```
src/
├── pages/
│   └── dashboard/
│       └── landlord/
│           └── ViewingAppointments.tsx
│               ├── Tabs: Pending, Upcoming, History, Availability
│               ├── AppointmentCard component
│               └── Uses: viewingAppointmentService
│
├── components/
│   ├── landlord/
│   │   └── AvailabilityManager.tsx
│   │       ├── Property Selector Dropdown
│   │       ├── Add Slot Form
│   │       ├── Availability List (grouped by day)
│   │       └── Uses: viewingAppointmentService
│   │
│   └── property/
│       └── ScheduleViewingModal.tsx
│           ├── Date Picker
│           ├── Time Slot Selector
│           ├── Custom Request Form
│           └── Uses: viewingAppointmentService
│
├── services/
│   └── viewingAppointmentService.ts
│       ├── getPropertyAvailability()
│       ├── generateTimeSlots()
│       ├── createAppointment()
│       ├── getPropertyAppointments()
│       ├── getUserAppointments()
│       ├── updateAppointmentStatus()
│       ├── setAvailability()
│       ├── updateAvailability()
│       ├── deleteAvailability()
│       ├── getUserAvailability()
│       ├── getLandlordProperties()
│       └── getAvailabilityByProperty()
│
└── types/
    └── viewingAppointment.ts
        ├── LandlordAvailability
        ├── ViewingAppointment
        ├── TimeSlot
        ├── AvailabilitySlot
        └── Property
```

## Key Features

### Property-Specific Availability
```
┌─────────────────────────────────────────┐
│ Property Selector                       │
├─────────────────────────────────────────┤
│ ○ All Properties (Global)               │
│ ○ 123 Main St, Toronto                  │
│ ○ 456 Oak Ave, Ottawa                   │
│ ○ 789 Pine Rd, Vancouver                │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│ Availability Slots                      │
├─────────────────────────────────────────┤
│ Monday                                  │
│   9:00 AM - 5:00 PM                     │
│   📍 123 Main St, Toronto               │
│   [Active ✓] [Delete]                   │
│                                         │
│ Tuesday                                 │
│   10:00 AM - 6:00 PM                    │
│   📍 All Properties                     │
│   [Active ✓] [Delete]                   │
└─────────────────────────────────────────┘
```

### Time Slot Generation
```
Landlord Availability:
  Monday: 9:00 AM - 5:00 PM

Generated 30-min Slots:
  ✓ 9:00 AM
  ✓ 9:30 AM
  ✓ 10:00 AM
  ✗ 10:30 AM (booked)
  ✓ 11:00 AM
  ... (continues until 5:00 PM)
```

### Appointment Status Flow
```
pending → confirmed → completed
   ↓
declined
   ↓
cancelled
```

## Security & Permissions

### Row Level Security (RLS)

```sql
-- Landlords can manage their own availability
CREATE POLICY "Landlords manage own availability"
ON landlord_availability
FOR ALL
USING (auth.uid() = user_id);

-- Landlords see appointments for their properties
CREATE POLICY "Landlords see own property appointments"
ON property_viewing_appointments
FOR SELECT
USING (
  landlord_id = auth.uid() OR
  requester_id = auth.uid()
);

-- Tenants can create appointments
CREATE POLICY "Tenants create appointments"
ON property_viewing_appointments
FOR INSERT
WITH CHECK (requester_id = auth.uid());
```

## API Endpoints (Service Methods)

### Landlord Operations
- `setAvailability()` - Create new availability slot
- `updateAvailability()` - Modify existing slot
- `deleteAvailability()` - Remove slot
- `getUserAvailability()` - Get all landlord's availability
- `getAvailabilityByProperty()` - Filter by property
- `getLandlordProperties()` - Get landlord's properties
- `updateAppointmentStatus()` - Approve/decline requests

### Tenant Operations
- `getPropertyAvailability()` - See available slots
- `generateTimeSlots()` - Get bookable times
- `createAppointment()` - Book a viewing
- `getUserAppointments()` - See my bookings
- `cancelAppointment()` - Cancel my booking

## User Flows

### Landlord Flow
```
1. Login
2. Navigate to Viewing Appointments
3. Click "Availability" tab
4. Select property from dropdown
5. Click "Add Slot"
6. Choose day, start time, end time
7. Click "Add Availability"
8. See slot appear with property name
9. Toggle active/inactive as needed
10. Switch properties to manage different schedules
```

### Tenant Flow
```
1. Login
2. Browse properties
3. Find interesting property
4. Click "Schedule Viewing"
5. Select date
6. Choose from available time slots
7. Fill in contact details
8. Add optional message
9. Submit booking
10. Wait for landlord confirmation
```

## Future Enhancements

- [ ] Email notifications
- [ ] SMS reminders
- [ ] Calendar integration (Google Calendar, iCal)
- [ ] Recurring availability patterns
- [ ] Bulk availability management
- [ ] Appointment rescheduling
- [ ] Video viewing option
- [ ] Automated reminders
- [ ] Feedback/rating system
- [ ] Analytics dashboard

## Summary

The system provides a complete solution for managing property viewings with:
- ✅ Property-specific availability
- ✅ Global availability option
- ✅ Hybrid booking (slots + custom requests)
- ✅ Full appointment lifecycle management
- ✅ Secure, role-based access
- ✅ Intuitive UI for both landlords and tenants
