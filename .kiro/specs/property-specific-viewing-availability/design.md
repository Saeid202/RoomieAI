# Property-Specific Viewing Availability - Design Document

## Architecture Overview

### System Components
```
┌─────────────────────────────────────────────────────────────┐
│                    AvailabilityManager                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Property Selector Dropdown                            │ │
│  │  - All Properties (property_id = null)                 │ │
│  │  - Property A: 123 Main St                             │ │
│  │  - Property B: 456 Oak Ave                             │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Filtered Availability Slots                           │ │
│  │  - Monday: 9:00 AM - 5:00 PM [Property A]             │ │
│  │  - Tuesday: 6:00 PM - 9:00 PM [All Properties]        │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              viewingAppointmentService                       │
│  - getLandlordProperties(userId)          [NEW]             │
│  - getAvailabilityByProperty(userId, propertyId) [NEW]      │
│  - getUserAvailability(userId)            [EXISTING]        │
│  - setAvailability(...)                   [EXISTING]        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Database Layer                            │
│  - landlord_availability (property_id nullable FK)          │
│  - properties (landlord ownership)                          │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Component Initialization
```typescript
useEffect(() => {
  1. Get current user (supabase.auth.getUser())
  2. Fetch landlord's properties (getLandlordProperties)
  3. Set default selection to "All Properties"
  4. Load availability for selected property
})
```

### 2. Property Selection Change
```typescript
onPropertyChange(propertyId) {
  1. Update selectedProperty state
  2. Filter availability by property_id
  3. Re-render availability list
}
```

### 3. Add Availability Slot
```typescript
handleAddSlot() {
  1. Validate time range
  2. Create availability with selectedProperty.id (or null)
  3. Show success toast with property name
  4. Refresh availability list
}
```

### 4. Tenant Viewing (Existing Flow - No Changes)
```typescript
ScheduleViewingModal(propertyId) {
  1. Fetch availability: property_id = X OR property_id IS NULL
  2. Generate time slots from combined availability
  3. Display available slots to tenant
}
```

## Component State Management

### AvailabilityManager State
```typescript
interface AvailabilityManagerState {
  currentUser: User | null;
  properties: Property[];              // NEW: Landlord's properties
  selectedPropertyId: string | null;   // NEW: null = "All Properties"
  availability: LandlordAvailability[];
  loading: boolean;
  showAddForm: boolean;
  newSlot: {
    day_of_week: number;
    start_time: string;
    end_time: string;
  };
}
```

## Service Layer Changes

### New Service Methods

#### getLandlordProperties
```typescript
async getLandlordProperties(userId: string): Promise<Property[]> {
  // Fetch all properties where user_id = userId
  // Return array of properties with id, address, title
  // Used to populate property selector dropdown
}
```

#### getAvailabilityByProperty
```typescript
async getAvailabilityByProperty(
  userId: string, 
  propertyId: string | null
): Promise<LandlordAvailability[]> {
  // If propertyId is null: fetch where property_id IS NULL
  // If propertyId is UUID: fetch where property_id = UUID
  // Used for filtered display in AvailabilityManager
}
```

## UI/UX Design

### Property Selector Component
```tsx
<div className="mb-6">
  <Label htmlFor="property-selector">Property</Label>
  <Select
    value={selectedPropertyId || "all"}
    onValueChange={handlePropertyChange}
  >
    <SelectTrigger>
      <SelectValue placeholder="Select property" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          <span>All Properties</span>
        </div>
      </SelectItem>
      {properties.map(property => (
        <SelectItem key={property.id} value={property.id}>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span>{property.address || property.title}</span>
          </div>
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
  <p className="text-sm text-gray-500 mt-1">
    {selectedPropertyId 
      ? "Setting availability for this property only"
      : "Setting availability for all properties"}
  </p>
</div>
```

### Availability Slot Display Enhancement
```tsx
<div className="flex items-center justify-between p-4 bg-white border rounded-lg">
  <div className="flex items-center gap-4">
    <Clock className="h-4 w-4 text-gray-400" />
    <div>
      <span className="font-medium">
        {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
      </span>
      {/* NEW: Property badge */}
      <div className="flex items-center gap-1 mt-1">
        <Building2 className="h-3 w-3 text-gray-400" />
        <span className="text-xs text-gray-500">
          {slot.property_id 
            ? getPropertyName(slot.property_id)
            : "All Properties"}
        </span>
      </div>
    </div>
  </div>
  {/* ... existing controls ... */}
</div>
```

## Database Queries

### Fetch Landlord Properties
```sql
SELECT id, address, title, city, province
FROM properties
WHERE user_id = $1
  AND status != 'archived'
ORDER BY created_at DESC;
```

### Fetch Filtered Availability
```sql
-- For specific property
SELECT *
FROM landlord_availability
WHERE user_id = $1
  AND property_id = $2
ORDER BY day_of_week, start_time;

-- For "All Properties" (global)
SELECT *
FROM landlord_availability
WHERE user_id = $1
  AND property_id IS NULL
ORDER BY day_of_week, start_time;
```

### Fetch Combined Availability (Tenant View)
```sql
-- This query already exists and works correctly
SELECT *
FROM landlord_availability
WHERE (property_id = $1 OR property_id IS NULL)
  AND is_active = true
ORDER BY day_of_week, start_time;
```

## Error Handling

### Property Fetch Failure
- Display error toast: "Failed to load properties"
- Disable property selector
- Allow user to retry with refresh button

### Availability Creation Failure
- Display error toast with specific message
- Keep form open with user's input preserved
- Allow user to retry

### Invalid Property Selection
- Validate property ownership before saving
- Return 403 error if user doesn't own property
- Display error: "You don't have permission to set availability for this property"

## Performance Considerations

### Optimization Strategies
1. **Memoization**: Cache property list (doesn't change frequently)
2. **Debouncing**: Not needed (dropdown selection is instant)
3. **Lazy Loading**: Load availability only when property is selected
4. **Index Usage**: Existing indexes on property_id and user_id are sufficient

### Expected Query Performance
- Fetch properties: ~10-50ms (typical landlord has 1-10 properties)
- Fetch availability: ~5-20ms (indexed query)
- Insert availability: ~10-30ms (single row insert)

## Security Considerations

### Authorization Checks
1. **Property Ownership**: Verify user owns property before allowing availability creation
2. **RLS Policies**: Existing policies already enforce user_id matching
3. **Input Validation**: Validate property_id exists and belongs to user

### RLS Policy Verification
```sql
-- Existing policy already handles this correctly
CREATE POLICY "Users can manage their own availability"
  ON landlord_availability
  FOR ALL
  USING (auth.uid() = user_id);
```

## Testing Strategy

### Unit Tests
- Service method: `getLandlordProperties()` returns correct properties
- Service method: `getAvailabilityByProperty()` filters correctly
- Component: Property selector displays all properties
- Component: Availability list filters by selected property

### Integration Tests
- Create availability for specific property → verify property_id is set
- Create availability for "All Properties" → verify property_id is null
- Switch property selection → verify list updates correctly
- Tenant views property → verify combined availability is shown

### Manual Testing Scenarios
1. Landlord with 0 properties → should see "No properties" message
2. Landlord with 1 property → should see property + "All Properties"
3. Landlord with multiple properties → should see all properties in dropdown
4. Create global availability → should appear for all properties
5. Create property-specific availability → should only appear for that property
6. Tenant books viewing → should see both global and property-specific slots

## Migration Path

### Phase 1: Service Layer (No UI Changes)
- Add `getLandlordProperties()` method
- Add `getAvailabilityByProperty()` method
- Test service methods independently

### Phase 2: UI Enhancement
- Add property selector to AvailabilityManager
- Add property state management
- Update availability list to show property names

### Phase 3: Testing & Refinement
- Test with real data
- Gather user feedback
- Refine UI/UX based on feedback

## Rollback Plan

If issues arise, the feature can be rolled back by:
1. Remove property selector from UI
2. Revert to showing all availability (existing behavior)
3. No database changes needed (schema already supports both modes)

## Future Enhancements (Out of Scope)

- Bulk copy availability from one property to another
- Recurring patterns (e.g., "same schedule for all weekdays")
- Calendar view of availability
- Conflict detection between overlapping slots
- Property groups (e.g., "Downtown Properties")
