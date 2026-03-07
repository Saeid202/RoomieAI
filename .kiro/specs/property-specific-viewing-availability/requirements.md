# Property-Specific Viewing Availability - Requirements

## Overview
Enhance the viewing appointment system to allow landlords with multiple properties to set different availability schedules for each property, rather than having a single global schedule.

## User Stories

### US-1: Property Selection in Availability Manager
**As a** landlord with multiple properties  
**I want to** select which property I'm setting availability for  
**So that** I can have different viewing schedules for properties in different locations

**Acceptance Criteria:**
- AC-1.1: Availability Manager displays a property selector dropdown above the availability form
- AC-1.2: Property selector shows all properties owned by the logged-in landlord
- AC-1.3: Property selector includes an "All Properties" option (represents property_id = null)
- AC-1.4: Property selector displays property address or name for easy identification
- AC-1.5: Default selection is "All Properties" when component loads

### US-2: Property-Specific Availability Display
**As a** landlord  
**I want to** see which availability slots apply to which properties  
**So that** I can easily manage different schedules

**Acceptance Criteria:**
- AC-2.1: Each availability slot displays the associated property name/address (or "All Properties")
- AC-2.2: Availability slots are filtered by the currently selected property in the dropdown
- AC-2.3: When "All Properties" is selected, only global availability slots (property_id = null) are shown
- AC-2.4: When a specific property is selected, only that property's availability slots are shown
- AC-2.5: Visual indicator (icon or badge) distinguishes property-specific vs global availability

### US-3: Property-Specific Availability Creation
**As a** landlord  
**I want to** create availability slots for specific properties  
**So that** I can accommodate different schedules based on property location

**Acceptance Criteria:**
- AC-3.1: When adding a new availability slot, the system uses the currently selected property_id
- AC-3.2: If "All Properties" is selected, new slots are created with property_id = null
- AC-3.3: If a specific property is selected, new slots are created with that property's ID
- AC-3.4: Success message indicates which property the availability was added for
- AC-3.5: After adding a slot, the list refreshes to show the new slot

### US-4: Tenant Viewing Experience
**As a** tenant viewing a property listing  
**I want to** see only the availability relevant to that specific property  
**So that** I can book viewings at times when the landlord is actually available for that property

**Acceptance Criteria:**
- AC-4.1: Schedule Viewing Modal fetches availability for the specific property being viewed
- AC-4.2: System combines property-specific availability (property_id = X) with global availability (property_id = null)
- AC-4.3: Available time slots are generated based on both property-specific and global availability
- AC-4.4: No changes needed to tenant-facing UI (works transparently)

## Business Rules

### BR-1: Availability Hierarchy
- Global availability (property_id = null) applies to ALL properties
- Property-specific availability (property_id = UUID) applies ONLY to that property
- When generating time slots for a property, BOTH global and property-specific availability are considered

### BR-2: Property Ownership
- Landlords can only set availability for properties they own
- System must verify property ownership before allowing availability creation

### BR-3: Data Integrity
- Availability slots must have valid time ranges (end_time > start_time)
- day_of_week must be between 0 (Sunday) and 6 (Saturday)
- property_id must reference an existing property or be null

## Technical Constraints

### TC-1: Database Schema
- Database schema already supports property-specific availability via property_id foreign key
- No database migrations required for this enhancement

### TC-2: Service Layer
- New service method needed: `getLandlordProperties(userId)` to fetch landlord's properties
- Existing `getPropertyAvailability()` already handles property-specific + global availability correctly

### TC-3: Component State
- AvailabilityManager must maintain selected property state
- Component must fetch and display landlord's properties on mount

## Out of Scope
- Bulk operations (copying availability from one property to another)
- Recurring availability patterns (e.g., "same schedule for all weekdays")
- Calendar view of availability
- Conflict detection between overlapping slots

## Success Metrics
- Landlords with multiple properties can set different schedules per property
- Tenants see correct availability when booking viewings
- No breaking changes to existing functionality
- Zero data migration required
