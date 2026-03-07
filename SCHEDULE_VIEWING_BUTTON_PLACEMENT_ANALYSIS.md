# Schedule Viewing Button Placement Analysis

## Current Status
✅ Schedule Viewing functionality EXISTS in the codebase
✅ Calendar/availability system is working in Seller Centre
❌ Button is NOT visible on property cards in listings

## Current Implementation

### Where It Currently Exists
**File**: `src/pages/dashboard/PropertyDetails.tsx` (Line 883-889)

The "Schedule Viewing" button is already implemented on the **Property Details Page** (the page you showed in the screenshot).

```typescript
<Button
  variant="outline"
  className="w-full border-2 border-blue-200 hover:bg-blue-50 text-blue-700 font-semibold"
  onClick={() => setShowScheduleViewingModal(true)}
>
  <CalendarCheck className="h-4 w-4 mr-2" />
  Schedule Viewing
</Button>
```

### Current Button Order (Property Details Page - Right Sidebar)
1. **Schedule Viewing** (blue outline button)
2. **Quick Apply** (gradient purple/pink button)
3. **Message/Join Co-Ownership** (pink/purple gradient button)
4. **Back** button (purple outline)

---

## The Problem

Based on your screenshot and description, the issue is:
- ✅ Button exists on **Property Details Page** (full page view)
- ❌ Button missing on **Property Cards** (list/grid view)

You're looking at property cards in a listing view (like search results, buying opportunities, etc.), not the full details page.

---

## Recommended Solutions

### Option 1: Add to Property Card Footer (RECOMMENDED) ⭐

**Location**: `src/components/dashboard/recommendations/PropertyCard.tsx` (Line 82-90)

**Current Footer**:
```tsx
<CardFooter className="flex gap-2">
  <Button variant="outline" className="flex-1" onClick={() => onViewDetails(property)}>
    View Details
  </Button>
  <Button className="flex-1">Contact</Button>
</CardFooter>
```

**Proposed Change**:
```tsx
<CardFooter className="flex flex-col gap-2">
  <div className="flex gap-2 w-full">
    <Button variant="outline" className="flex-1" onClick={() => onViewDetails(property)}>
      View Details
    </Button>
    <Button className="flex-1">Contact</Button>
  </div>
  <Button 
    variant="outline" 
    className="w-full border-blue-200 hover:bg-blue-50 text-blue-700"
    onClick={() => setShowScheduleViewingModal(true)}
  >
    <CalendarCheck className="h-4 w-4 mr-2" />
    Schedule Viewing
  </Button>
</CardFooter>
```

**Visual Layout**:
```
┌─────────────────────────────────┐
│  Property Card                  │
│  [Image]                        │
│  Title, Price, Details          │
├─────────────────────────────────┤
│  [View Details] [Contact]       │  ← Existing buttons
│  [📅 Schedule Viewing]          │  ← NEW button (full width)
└─────────────────────────────────┘
```

**Pros**:
- ✅ Prominent placement
- ✅ Doesn't crowd existing buttons
- ✅ Clear call-to-action
- ✅ Consistent with detail page design

**Cons**:
- ⚠️ Makes card slightly taller

---

### Option 2: Replace "Contact" with "Schedule Viewing"

**Proposed Change**:
```tsx
<CardFooter className="flex gap-2">
  <Button variant="outline" className="flex-1" onClick={() => onViewDetails(property)}>
    View Details
  </Button>
  <Button 
    className="flex-1 bg-blue-600 hover:bg-blue-700"
    onClick={() => setShowScheduleViewingModal(true)}
  >
    <CalendarCheck className="h-4 w-4 mr-2" />
    Schedule
  </Button>
</CardFooter>
```

**Visual Layout**:
```
┌─────────────────────────────────┐
│  Property Card                  │
│  [Image]                        │
│  Title, Price, Details          │
├─────────────────────────────────┤
│  [View Details] [📅 Schedule]   │  ← Modified buttons
└─────────────────────────────────┘
```

**Pros**:
- ✅ No height increase
- ✅ Direct action
- ✅ Clean layout

**Cons**:
- ❌ Removes "Contact" button
- ⚠️ Less flexibility

---

### Option 3: Three-Button Layout (Horizontal)

**Proposed Change**:
```tsx
<CardFooter className="flex gap-2">
  <Button variant="outline" className="flex-1" onClick={() => onViewDetails(property)}>
    Details
  </Button>
  <Button 
    variant="outline" 
    className="flex-1 border-blue-200 text-blue-700"
    onClick={() => setShowScheduleViewingModal(true)}
  >
    <CalendarCheck className="h-4 w-4" />
  </Button>
  <Button className="flex-1">Contact</Button>
</CardFooter>
```

**Visual Layout**:
```
┌─────────────────────────────────┐
│  Property Card                  │
│  [Image]                        │
│  Title, Price, Details          │
├─────────────────────────────────┤
│  [Details] [📅] [Contact]       │  ← Three buttons
└─────────────────────────────────┘
```

**Pros**:
- ✅ No height increase
- ✅ All actions visible
- ✅ Icon-only saves space

**Cons**:
- ⚠️ Buttons might be too narrow
- ⚠️ Less clear what calendar icon does

---

### Option 4: Dropdown Menu (Advanced)

**Proposed Change**:
```tsx
<CardFooter className="flex gap-2">
  <Button variant="outline" className="flex-1" onClick={() => onViewDetails(property)}>
    View Details
  </Button>
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button className="flex-1">Actions ▼</Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem onClick={() => setShowScheduleViewingModal(true)}>
        <CalendarCheck className="h-4 w-4 mr-2" />
        Schedule Viewing
      </DropdownMenuItem>
      <DropdownMenuItem>
        <MessageSquare className="h-4 w-4 mr-2" />
        Contact
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</CardFooter>
```

**Pros**:
- ✅ Scalable for more actions
- ✅ Clean appearance

**Cons**:
- ❌ Requires extra click
- ❌ Less discoverable

---

## Other Locations to Consider

### 1. Buying Opportunities Page
**File**: `src/pages/dashboard/BuyingOpportunities.tsx`

This page shows property cards for sale listings. The Schedule Viewing button should be added here too.

### 2. Search Results / Rental Options
Any page that displays property cards in a grid/list format.

### 3. Enhanced Property Card Component
**File**: `src/components/dashboard/recommendations/PropertyCard.tsx`

This is the main property card component used across the app.

---

## Implementation Priority

### Phase 1: Property Card Component (HIGH PRIORITY) ⭐
**File**: `src/components/dashboard/recommendations/PropertyCard.tsx`

Add Schedule Viewing button to the base PropertyCard component. This will automatically add it to all pages that use this component.

### Phase 2: Buying Opportunities Page (MEDIUM PRIORITY)
**File**: `src/pages/dashboard/BuyingOpportunities.tsx`

If BuyingOpportunities uses a different card component (EnhancedCard), add the button there.

### Phase 3: Other Listing Pages (LOW PRIORITY)
Any other pages that show property listings.

---

## Recommended Approach: Option 1 (Two-Row Layout)

### Why Option 1 is Best:

1. **Visibility**: Full-width button is hard to miss
2. **Hierarchy**: Primary actions (View/Contact) on top, secondary action (Schedule) below
3. **Consistency**: Matches the Property Details page layout
4. **Flexibility**: Doesn't remove existing functionality
5. **User Flow**: Natural progression: View → Schedule → Contact

### Visual Mockup:

```
┌────────────────────────────────────────┐
│  🏠 Property Card                      │
│  ┌──────────────────────────────────┐ │
│  │                                  │ │
│  │        [Property Image]          │ │
│  │                                  │ │
│  └──────────────────────────────────┘ │
│                                        │
│  Share with John Doe                   │
│  123 Main Street, Toronto              │
│                                        │
│  Monthly Rent: $1,500 - $2,000        │
│  Available: March 2026                 │
│  Property Type: Apartment              │
│  Listed by: Property Owner             │
│                                        │
│  🛏️ 2 BR  🏢 Apartment                │
│                                        │
├────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  │
│  │ View Details │  │   Contact    │  │
│  └──────────────┘  └──────────────┘  │
│  ┌──────────────────────────────────┐│
│  │  📅 Schedule Viewing             ││  ← NEW
│  └──────────────────────────────────┘│
└────────────────────────────────────────┘
```

---

## Implementation Steps (No Action Yet)

### Step 1: Update PropertyCard Component
1. Add `showScheduleViewing` state
2. Import `ScheduleViewingModal` component
3. Add button to CardFooter
4. Add modal at bottom of component

### Step 2: Pass Property ID
Ensure the property ID is available for the ScheduleViewingModal.

### Step 3: Test on Multiple Pages
- Buying Opportunities
- Rental Options
- Search Results
- Recommendations

### Step 4: Responsive Design
Ensure buttons work well on mobile devices.

---

## Additional Considerations

### 1. Conditional Display
Only show "Schedule Viewing" if:
- Property has availability set by landlord
- Property is active/available
- User is not the property owner

### 2. Button State
- Disabled if no availability
- Show tooltip: "Landlord hasn't set viewing times yet"

### 3. Analytics
Track button clicks to measure engagement.

### 4. A/B Testing
Consider testing different button placements to see which gets more clicks.

---

## Conclusion

**RECOMMENDED**: Implement Option 1 (Two-Row Layout) in the PropertyCard component.

This provides:
- ✅ Maximum visibility
- ✅ Clear call-to-action
- ✅ Consistent user experience
- ✅ Easy to implement
- ✅ Works across all listing pages

The button should be added to `src/components/dashboard/recommendations/PropertyCard.tsx` as a full-width button below the existing "View Details" and "Contact" buttons.
