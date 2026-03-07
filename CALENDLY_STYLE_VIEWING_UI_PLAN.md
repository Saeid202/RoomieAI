# Calendly-Style Viewing Scheduler - UI Design Plan

## Overview

Transform the Schedule Viewing modal to use a Calendly-inspired interface where seekers can visually see landlord availability and select time slots.

## Current vs. Proposed Layout

### Current Layout (in ScheduleViewingModal.tsx)
```
1. Full Name
2. Email Address
3. Phone Number (Optional)
4. Number of Attendees
5. [Request Custom Time section]
6. Preferred Date
7. Preferred Time
8. Why this time? (Optional)
9. Additional Message (Optional)
```

### Proposed Layout (Calendly-Style)
```
1. Full Name
2. Email Address
3. Phone Number (Optional)
4. Number of Attendees

--- NEW CALENDLY-STYLE SECTION ---
5. Select Date & Time
   ┌─────────────────────────────────────────────────┐
   │  📅 Calendar View    |    🕐 Available Times    │
   │                      |                          │
   │  [Month Navigation]  |    [Time Slot Buttons]   │
   │                      |                          │
   │  Sun Mon Tue Wed Thu |    Morning               │
   │   1   2   3   4   5  |    ○ 9:00 AM             │
   │   6   7   8   9  10  |    ○ 9:30 AM             │
   │  11  12  13  14  15  |    ○ 10:00 AM            │
   │  16  17  18  19  20  |                          │
   │  21  22  23  24  25  |    Afternoon             │
   │  26  27  28  29  30  |    ○ 1:00 PM             │
   │                      |    ○ 1:30 PM             │
   │  Days with dots (•)  |    ○ 2:00 PM             │
   │  indicate available  |                          │
   │  time slots          |    Evening               │
   │                      |    ○ 5:00 PM             │
   │                      |    ○ 5:30 PM             │
   └─────────────────────────────────────────────────┘
   
   Selected: Tuesday, March 15, 2024 at 2:00 PM

--- END CALENDLY SECTION ---

6. [Request Custom Time section]
   (Collapsed by default, expandable)
   
7. Additional Message (Optional)
```

## Detailed Component Design

### 1. Calendar Component (Left Side)

**Features:**
- Month/Year navigation (< March 2024 >)
- 7-column grid (Sun-Sat)
- Visual indicators:
  - **Dots under dates** with availability
  - **Disabled styling** for past dates
  - **Disabled styling** for dates with no availability
  - **Highlighted** for selected date
  - **Hover effect** on available dates

**Visual Design:**
```
┌─────────────────────────────────┐
│     < March 2024 >              │
├─────────────────────────────────┤
│ Sun Mon Tue Wed Thu Fri Sat     │
│                  1•  2   3      │
│  4   5•  6   7   8•  9  10      │
│ 11  12• 13  14  15• 16  17      │
│ 18  19• 20  21  22• 23  24      │
│ 25  26• 27  28  29• 30  31      │
└─────────────────────────────────┘

Legend:
• = Has available time slots
Gray = Past date or no availability
Blue highlight = Selected date
```

### 2. Time Slots Component (Right Side)

**Features:**
- Grouped by time of day (Morning, Afternoon, Evening)
- Radio button style selection
- Shows only available slots for selected date
- Disabled slots shown as unavailable
- Selected slot highlighted

**Visual Design:**
```
┌─────────────────────────────────┐
│ Available Times                 │
├─────────────────────────────────┤
│ Morning                         │
│ ○ 9:00 AM                       │
│ ○ 9:30 AM                       │
│ ○ 10:00 AM                      │
│ ○ 10:30 AM                      │
│ ○ 11:00 AM                      │
│ ○ 11:30 AM                      │
│                                 │
│ Afternoon                       │
│ ○ 12:00 PM                      │
│ ○ 12:30 PM                      │
│ ● 1:00 PM  ← Selected           │
│ ○ 1:30 PM                       │
│ ⊗ 2:00 PM  ← Booked             │
│ ○ 2:30 PM                       │
│                                 │
│ Evening                         │
│ ○ 5:00 PM                       │
│ ○ 5:30 PM                       │
│ ○ 6:00 PM                       │
└─────────────────────────────────┘
```

### 3. Selection Summary

**Below the calendar/time picker:**
```
┌─────────────────────────────────────────────────┐
│ ✓ Selected: Tuesday, March 15, 2024 at 1:00 PM │
└─────────────────────────────────────────────────┘
```

### 4. Request Custom Time (Collapsed)

**Default state:**
```
┌─────────────────────────────────────────────────┐
│ ⓘ Don't see a time that works?                 │
│   [Request Custom Time ▼]                       │
└─────────────────────────────────────────────────┘
```

**Expanded state:**
```
┌─────────────────────────────────────────────────┐
│ ⓘ Request Custom Time                           │
│   [Request Custom Time ▲]                       │
│                                                 │
│   The landlord hasn't set availability yet.    │
│   Submit a custom request and they'll respond  │
│   with their availability.                     │
│                                                 │
│   Preferred Date: [mm/dd/yyyy] 📅              │
│   Preferred Time: [--:-- --] 🕐                │
│   Why this time? (Optional)                    │
│   [Text area]                                  │
└─────────────────────────────────────────────────┘
```

## User Flow

### Flow 1: Booking Available Slot
1. User opens "Schedule Viewing" modal
2. Fills in name, email, phone, attendees
3. Sees calendar with dots on available dates
4. Clicks on a date with availability
5. Right side shows available time slots for that date
6. User clicks on a time slot
7. Selection summary appears below
8. User adds optional message
9. Clicks "Request Viewing"
10. Booking submitted

### Flow 2: Requesting Custom Time
1. User opens "Schedule Viewing" modal
2. Fills in name, email, phone, attendees
3. Sees calendar but no suitable times
4. Clicks "Request Custom Time" to expand
5. Enters preferred date and time
6. Explains why this time works
7. Adds optional message
8. Clicks "Request Viewing"
9. Custom request submitted

### Flow 3: No Availability Set
1. User opens "Schedule Viewing" modal
2. Fills in name, email, phone, attendees
3. Sees message: "No availability set yet"
4. Calendar shows all dates as unavailable
5. "Request Custom Time" section auto-expanded
6. User must use custom request flow

## Technical Implementation

### Component Structure
```
ScheduleViewingModal.tsx
├── ContactInfoSection
│   ├── Full Name Input
│   ├── Email Input
│   ├── Phone Input
│   └── Number of Attendees Input
│
├── CalendlyStylePicker (NEW)
│   ├── DateCalendar (LEFT)
│   │   ├── MonthNavigation
│   │   ├── CalendarGrid
│   │   │   ├── DayHeaders
│   │   │   └── DateCells
│   │   │       ├── AvailabilityIndicator (dot)
│   │   │       ├── DisabledState
│   │   │       └── SelectedState
│   │   └── Legend
│   │
│   ├── TimeSlotPicker (RIGHT)
│   │   ├── TimeSlotGroup (Morning)
│   │   ├── TimeSlotGroup (Afternoon)
│   │   ├── TimeSlotGroup (Evening)
│   │   └── TimeSlotButton
│   │       ├── Available (○)
│   │       ├── Selected (●)
│   │       └── Booked (⊗)
│   │
│   └── SelectionSummary
│       └── SelectedDateTime Display
│
├── CustomTimeRequest (Collapsible)
│   ├── ExpandButton
│   ├── InfoMessage
│   ├── DateInput
│   ├── TimeInput
│   └── ReasonTextarea
│
└── AdditionalMessage
    └── Textarea
```

### Data Flow

**1. Load Availability:**
```typescript
// On modal open
const availability = await viewingAppointmentService.getPropertyAvailability(propertyId, landlordId);

// Generate calendar data
const calendarData = generateCalendarWithAvailability(availability, bookedAppointments);
// Returns: { date: Date, hasAvailability: boolean, slots: TimeSlot[] }[]
```

**2. Date Selection:**
```typescript
const handleDateSelect = (date: Date) => {
  setSelectedDate(date);
  const slots = generateTimeSlots(date, availability, bookedAppointments);
  setAvailableSlots(slots);
  setSelectedTime(null); // Reset time selection
};
```

**3. Time Selection:**
```typescript
const handleTimeSelect = (time: string) => {
  setSelectedTime(time);
  setIsCustomRequest(false); // Disable custom request
};
```

**4. Custom Request Toggle:**
```typescript
const handleCustomRequestToggle = () => {
  setIsCustomRequest(!isCustomRequest);
  if (!isCustomRequest) {
    setSelectedDate(null);
    setSelectedTime(null);
  }
};
```

### Styling Approach

**Colors:**
- Primary: Blue (#3B82F6) for selected states
- Success: Green (#10B981) for available
- Disabled: Gray (#9CA3AF) for unavailable
- Booked: Red (#EF4444) for already booked
- Background: Light gray (#F3F4F6) for calendar

**Spacing:**
- Calendar: 2-column grid (40% calendar, 60% time slots)
- Time slots: 2-column grid for compact display
- Padding: Consistent 16px spacing
- Gap: 8px between elements

**Responsive:**
- Desktop: Side-by-side layout
- Tablet: Side-by-side with smaller calendar
- Mobile: Stacked (calendar on top, times below)

## Visual Mockup (ASCII)

```
┌─────────────────────────────────────────────────────────────────┐
│ Schedule a Viewing                                          [X] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Full Name *                    Email Address *                 │
│ [John Doe            ]         [john@example.com        ]      │
│                                                                 │
│ Phone Number (Optional)        Number of Attendees *           │
│ [(555) 123-4567      ]         [1                       ]      │
│                                                                 │
│ ─────────────────────────────────────────────────────────────  │
│                                                                 │
│ Select Date & Time *                                           │
│ ┌──────────────────────┬──────────────────────────────────┐   │
│ │   < March 2024 >     │  Available Times                 │   │
│ ├──────────────────────┼──────────────────────────────────┤   │
│ │ S  M  T  W  T  F  S  │  Morning                         │   │
│ │          1• 2  3     │  ○ 9:00 AM    ○ 10:30 AM        │   │
│ │ 4  5• 6  7  8• 9 10  │  ○ 9:30 AM    ○ 11:00 AM        │   │
│ │11 12•13 14 [15]16 17 │  ○ 10:00 AM   ○ 11:30 AM        │   │
│ │18 19•20 21 22•23 24  │                                  │   │
│ │25 26•27 28 29•30 31  │  Afternoon                       │   │
│ │                      │  ○ 12:00 PM   ○ 1:30 PM         │   │
│ │ • = Available        │  ○ 12:30 PM   ● 2:00 PM ✓       │   │
│ │ Gray = Unavailable   │  ○ 1:00 PM    ⊗ 2:30 PM         │   │
│ └──────────────────────┴──────────────────────────────────┘   │
│                                                                 │
│ ✓ Selected: Tuesday, March 15, 2024 at 2:00 PM                │
│                                                                 │
│ ─────────────────────────────────────────────────────────────  │
│                                                                 │
│ ⓘ Don't see a time that works?                                │
│   [▼ Request Custom Time]                                      │
│                                                                 │
│ Additional Message (Optional)                                  │
│ ┌─────────────────────────────────────────────────────────┐   │
│ │ Any specific questions or requirements for the viewing? │   │
│ │                                                         │   │
│ └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                                    [Cancel] [Request Viewing]  │
└─────────────────────────────────────────────────────────────────┘
```

## Key Features

### 1. Visual Availability Indicators
- Dots under calendar dates show which days have availability
- Reduces cognitive load - user immediately sees available days
- Prevents clicking on unavailable dates

### 2. Grouped Time Slots
- Morning (6 AM - 11:59 AM)
- Afternoon (12 PM - 4:59 PM)
- Evening (5 PM - 11:59 PM)
- Makes it easy to find preferred time of day

### 3. Real-time Feedback
- Selected date/time shown in summary
- Booked slots clearly marked
- Disabled states for past dates

### 4. Fallback to Custom Request
- Always available if no slots work
- Collapsed by default to encourage using available slots
- Clear explanation of what happens with custom requests

### 5. Mobile Responsive
- Calendar stacks on top of time slots
- Touch-friendly button sizes
- Scrollable time slot list

## Benefits Over Current Design

### Current Design Issues:
- ❌ Date picker doesn't show availability
- ❌ Time dropdown shows all times (even unavailable)
- ❌ User must guess which dates/times work
- ❌ No visual feedback on landlord's schedule
- ❌ Custom request not clearly separated

### New Design Benefits:
- ✅ Visual calendar shows availability at a glance
- ✅ Only available times shown for selected date
- ✅ Clear separation between booking and custom request
- ✅ Professional, modern UI (like Calendly)
- ✅ Reduces booking errors and back-and-forth
- ✅ Better user experience for seekers
- ✅ Encourages using available slots over custom requests

## Implementation Priority

### Phase 1: Core Calendar UI
1. Create CalendlyStylePicker component
2. Implement DateCalendar with availability dots
3. Implement TimeSlotPicker with grouped slots
4. Add SelectionSummary display

### Phase 2: Integration
1. Connect to existing availability service
2. Handle date/time selection state
3. Update form submission logic
4. Add validation

### Phase 3: Custom Request
1. Make custom request collapsible
2. Add toggle logic
3. Ensure mutual exclusivity (either slot OR custom)

### Phase 4: Polish
1. Add animations/transitions
2. Improve mobile responsiveness
3. Add loading states
4. Add empty states (no availability)

## Success Metrics

- Reduced custom requests (more slot bookings)
- Faster booking completion time
- Fewer booking errors
- Higher user satisfaction
- Lower landlord response time (fewer custom requests to review)

## Next Steps

1. Review and approve this design plan
2. Create detailed component specifications
3. Build reusable calendar component
4. Build time slot picker component
5. Integrate into ScheduleViewingModal
6. Test with real availability data
7. Gather user feedback
8. Iterate and improve

---

**Status:** Design Plan Complete - Ready for Review
**No Action Taken:** As requested, this is planning only
