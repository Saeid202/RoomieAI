# Property-Specific Viewing Availability - Implementation Tasks

## Task Breakdown

### TASK-1: Add Service Methods for Property Management
**Priority**: High  
**Estimated Time**: 30 minutes  
**Dependencies**: None

**Description**: Add new service methods to fetch landlord properties and filter availability by property.

**Implementation Steps**:
1. Open `src/services/viewingAppointmentService.ts`
2. Add `getLandlordProperties()` method:
   ```typescript
   async getLandlordProperties(userId: string): Promise<Property[]> {
     const { data, error } = await supabase
       .from('properties')
       .select('id, address, title, city, province')
       .eq('user_id', userId)
       .neq('status', 'archived')
       .order('created_at', { ascending: false });
     
     if (error) throw error;
     return data || [];
   }
   ```
3. Add `getAvailabilityByProperty()` method:
   ```typescript
   async getAvailabilityByProperty(
     userId: string,
     propertyId: string | null
   ): Promise<LandlordAvailability[]> {
     let query = supabase
       .from('landlord_availability')
       .select('*')
       .eq('user_id', userId);
     
     if (propertyId === null) {
       query = query.is('property_id', null);
     } else {
       query = query.eq('property_id', propertyId);
     }
     
     const { data, error } = await query
       .order('day_of_week', { ascending: true })
       .order('start_time', { ascending: true });
     
     if (error) throw error;
     return data || [];
   }
   ```

**Acceptance Criteria**:
- [ ] `getLandlordProperties()` returns array of properties for given user
- [ ] `getAvailabilityByProperty()` filters by property_id when provided
- [ ] `getAvailabilityByProperty()` filters by NULL when propertyId is null
- [ ] Both methods handle errors gracefully

---

### TASK-2: Add Property Type to Types
**Priority**: High  
**Estimated Time**: 10 minutes  
**Dependencies**: None

**Description**: Add Property interface to viewingAppointment types for type safety.

**Implementation Steps**:
1. Open `src/types/viewingAppointment.ts`
2. Add Property interface:
   ```typescript
   export interface Property {
     id: string;
     address: string;
     title: string;
     city?: string;
     province?: string;
   }
   ```

**Acceptance Criteria**:
- [ ] Property interface is exported
- [ ] Interface matches properties table structure
- [ ] TypeScript compilation succeeds

---

### TASK-3: Add Property State to AvailabilityManager
**Priority**: High  
**Estimated Time**: 20 minutes  
**Dependencies**: TASK-1, TASK-2

**Description**: Add state management for properties and selected property in AvailabilityManager component.

**Implementation Steps**:
1. Open `src/components/landlord/AvailabilityManager.tsx`
2. Import Property type:
   ```typescript
   import type { LandlordAvailability, Property } from "@/types/viewingAppointment";
   ```
3. Add new state variables:
   ```typescript
   const [properties, setProperties] = useState<Property[]>([]);
   const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
   ```
4. Update `useEffect` to fetch properties:
   ```typescript
   useEffect(() => {
     const getCurrentUser = async () => {
       const { data: { user } } = await supabase.auth.getUser();
       setCurrentUser(user);
       if (user) {
         await loadProperties(user.id);
         await loadAvailability(user.id, null); // Load global availability by default
       }
     };
     getCurrentUser();
   }, []);
   ```
5. Add `loadProperties` function:
   ```typescript
   const loadProperties = async (userId: string) => {
     try {
       const data = await viewingAppointmentService.getLandlordProperties(userId);
       setProperties(data);
     } catch (error) {
       console.error("Error loading properties:", error);
       toast.error("Failed to load properties");
     }
   };
   ```
6. Update `loadAvailability` to accept propertyId parameter:
   ```typescript
   const loadAvailability = async (userId: string, propertyId: string | null) => {
     try {
       setLoading(true);
       const data = await viewingAppointmentService.getAvailabilityByProperty(userId, propertyId);
       setAvailability(data);
     } catch (error) {
       console.error("Error loading availability:", error);
       toast.error("Failed to load availability");
     } finally {
       setLoading(false);
     }
   };
   ```

**Acceptance Criteria**:
- [ ] Properties are fetched on component mount
- [ ] Selected property state is managed correctly
- [ ] Availability is filtered by selected property
- [ ] Error handling works for property fetch failures

---

### TASK-4: Add Property Selector UI
**Priority**: High  
**Estimated Time**: 30 minutes  
**Dependencies**: TASK-3

**Description**: Add property selector dropdown to AvailabilityManager UI.

**Implementation Steps**:
1. Open `src/components/landlord/AvailabilityManager.tsx`
2. Remove unused imports and add Building2 icon usage
3. Add property change handler:
   ```typescript
   const handlePropertyChange = (value: string) => {
     const propertyId = value === "all" ? null : value;
     setSelectedPropertyId(propertyId);
     if (currentUser) {
       loadAvailability(currentUser.id, propertyId);
     }
   };
   ```
4. Add property selector UI before the "Add Slot" button section:
   ```tsx
   <div className="mb-6">
     <Label htmlFor="property-selector">Property</Label>
     <Select
       value={selectedPropertyId || "all"}
       onValueChange={handlePropertyChange}
     >
       <SelectTrigger id="property-selector">
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

**Acceptance Criteria**:
- [ ] Property selector displays "All Properties" option
- [ ] Property selector displays all landlord's properties
- [ ] Selecting a property filters the availability list
- [ ] Helper text updates based on selection
- [ ] UI is visually consistent with existing design

---

### TASK-5: Update Add Slot Logic
**Priority**: High  
**Estimated Time**: 15 minutes  
**Dependencies**: TASK-4

**Description**: Update the add slot functionality to use the selected property.

**Implementation Steps**:
1. Open `src/components/landlord/AvailabilityManager.tsx`
2. Update `handleAddSlot` function:
   ```typescript
   const handleAddSlot = async () => {
     if (!currentUser) return;

     // Validate times
     if (newSlot.start_time >= newSlot.end_time) {
       toast.error("End time must be after start time");
       return;
     }

     try {
       await viewingAppointmentService.setAvailability({
         user_id: currentUser.id,
         property_id: selectedPropertyId, // Use selected property
         day_of_week: newSlot.day_of_week,
         start_time: newSlot.start_time,
         end_time: newSlot.end_time,
         is_active: true,
       });

       const propertyName = selectedPropertyId 
         ? properties.find(p => p.id === selectedPropertyId)?.address || "property"
         : "all properties";
       
       toast.success(`Availability added for ${propertyName}!`);
       setShowAddForm(false);
       setNewSlot({ day_of_week: 1, start_time: '09:00', end_time: '17:00' });
       loadAvailability(currentUser.id, selectedPropertyId);
     } catch (error) {
       console.error("Error adding availability:", error);
       toast.error("Failed to add availability");
     }
   };
   ```

**Acceptance Criteria**:
- [ ] New slots are created with selected property_id
- [ ] Success message includes property name
- [ ] Availability list refreshes after adding slot
- [ ] Form resets after successful addition

---

### TASK-6: Display Property Name in Availability List
**Priority**: Medium  
**Estimated Time**: 20 minutes  
**Dependencies**: TASK-5

**Description**: Show property name/address for each availability slot in the list.

**Implementation Steps**:
1. Open `src/components/landlord/AvailabilityManager.tsx`
2. Add helper function to get property name:
   ```typescript
   const getPropertyName = (propertyId: string | null): string => {
     if (!propertyId) return "All Properties";
     const property = properties.find(p => p.id === propertyId);
     return property?.address || property?.title || "Unknown Property";
   };
   ```
3. Update availability slot display to include property badge:
   ```tsx
   <div className="flex items-center gap-4">
     <Clock className="h-4 w-4 text-gray-400" />
     <div>
       <span className="font-medium">
         {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
       </span>
       <div className="flex items-center gap-1 mt-1">
         <Building2 className="h-3 w-3 text-gray-400" />
         <span className="text-xs text-gray-500">
           {getPropertyName(slot.property_id)}
         </span>
       </div>
     </div>
   </div>
   ```

**Acceptance Criteria**:
- [ ] Each slot displays associated property name
- [ ] "All Properties" is shown for global availability (property_id = null)
- [ ] Property name is displayed below the time range
- [ ] Visual styling is consistent with existing design

---

### TASK-7: Update Info Box Documentation
**Priority**: Low  
**Estimated Time**: 5 minutes  
**Dependencies**: TASK-6

**Description**: Update the "How it works" info box to mention property-specific availability.

**Implementation Steps**:
1. Open `src/components/landlord/AvailabilityManager.tsx`
2. Update info box content:
   ```tsx
   <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
     <h4 className="font-medium text-gray-900 mb-2">How it works</h4>
     <ul className="text-sm text-gray-600 space-y-1">
       <li>• Select a property or "All Properties" to set availability</li>
       <li>• Set your availability for each day of the week</li>
       <li>• Tenants will see available 30-minute time slots based on your schedule</li>
       <li>• Global availability applies to all your properties</li>
       <li>• Property-specific availability overrides for individual properties</li>
       <li>• You can still approve/decline custom time requests from tenants</li>
       <li>• Toggle slots on/off without deleting them</li>
     </ul>
   </div>
   ```

**Acceptance Criteria**:
- [ ] Info box explains property-specific vs global availability
- [ ] Instructions are clear and concise
- [ ] Content is accurate and helpful

---

### TASK-8: Handle Edge Cases
**Priority**: Medium  
**Estimated Time**: 20 minutes  
**Dependencies**: TASK-7

**Description**: Add handling for edge cases like no properties, loading states, etc.

**Implementation Steps**:
1. Open `src/components/landlord/AvailabilityManager.tsx`
2. Add loading state for properties:
   ```typescript
   const [propertiesLoading, setPropertiesLoading] = useState(true);
   ```
3. Update `loadProperties`:
   ```typescript
   const loadProperties = async (userId: string) => {
     try {
       setPropertiesLoading(true);
       const data = await viewingAppointmentService.getLandlordProperties(userId);
       setProperties(data);
     } catch (error) {
       console.error("Error loading properties:", error);
       toast.error("Failed to load properties");
     } finally {
       setPropertiesLoading(false);
     }
   };
   ```
4. Add conditional rendering for property selector:
   ```tsx
   {propertiesLoading ? (
     <div className="mb-6">
       <Label>Property</Label>
       <div className="p-2 border rounded-md text-gray-400">
         Loading properties...
       </div>
     </div>
   ) : properties.length === 0 ? (
     <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
       <p className="text-sm text-yellow-800">
         You don't have any properties yet. Availability will apply globally once you add properties.
       </p>
     </div>
   ) : (
     {/* Property selector UI */}
   )}
   ```

**Acceptance Criteria**:
- [ ] Loading state is shown while fetching properties
- [ ] Helpful message shown when landlord has no properties
- [ ] Component handles errors gracefully
- [ ] No console errors or warnings

---

### TASK-9: Testing and Validation
**Priority**: High  
**Estimated Time**: 30 minutes  
**Dependencies**: TASK-8

**Description**: Test the complete feature with various scenarios.

**Test Scenarios**:
1. **Landlord with no properties**:
   - [ ] Component loads without errors
   - [ ] Shows helpful message about no properties
   - [ ] Can still create global availability

2. **Landlord with one property**:
   - [ ] Property selector shows "All Properties" + 1 property
   - [ ] Can create global availability
   - [ ] Can create property-specific availability
   - [ ] Switching between selections works correctly

3. **Landlord with multiple properties**:
   - [ ] All properties appear in dropdown
   - [ ] Filtering works correctly for each property
   - [ ] Can create availability for different properties
   - [ ] Property names display correctly in list

4. **Tenant viewing experience**:
   - [ ] Tenant sees combined availability (global + property-specific)
   - [ ] Time slots are generated correctly
   - [ ] No breaking changes to existing booking flow

5. **Error handling**:
   - [ ] Network errors are handled gracefully
   - [ ] Invalid property IDs are rejected
   - [ ] User sees helpful error messages

**Acceptance Criteria**:
- [ ] All test scenarios pass
- [ ] No console errors or warnings
- [ ] UI is responsive and performant
- [ ] Feature works on different screen sizes

---

### TASK-10: Code Cleanup and Documentation
**Priority**: Low  
**Estimated Time**: 15 minutes  
**Dependencies**: TASK-9

**Description**: Clean up code, remove unused imports, and add comments.

**Implementation Steps**:
1. Remove unused imports (getDayLabel, unused Select components)
2. Add JSDoc comments to new functions
3. Ensure consistent code formatting
4. Update any relevant documentation

**Acceptance Criteria**:
- [ ] No unused imports or variables
- [ ] Code follows project style guidelines
- [ ] Functions have clear comments
- [ ] TypeScript compilation succeeds with no warnings

---

## Implementation Order

1. **Phase 1: Service Layer** (TASK-1, TASK-2)
   - Add backend methods first
   - Test independently

2. **Phase 2: Component State** (TASK-3)
   - Add state management
   - Prepare for UI changes

3. **Phase 3: UI Implementation** (TASK-4, TASK-5, TASK-6, TASK-7)
   - Add property selector
   - Update add slot logic
   - Enhance display

4. **Phase 4: Polish** (TASK-8, TASK-9, TASK-10)
   - Handle edge cases
   - Test thoroughly
   - Clean up code

## Estimated Total Time
**3-4 hours** for complete implementation and testing

## Risk Assessment

### Low Risk
- Database schema already supports feature
- No breaking changes to existing functionality
- Backward compatible (existing global availability still works)

### Potential Issues
- Property fetch might be slow for landlords with many properties (unlikely, most have <10)
- UI might be cluttered if landlord has 20+ properties (edge case)

### Mitigation
- Add pagination or search if property list grows large
- Consider property grouping in future enhancement
