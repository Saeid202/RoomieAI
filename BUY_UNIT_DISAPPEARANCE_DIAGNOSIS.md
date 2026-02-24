# Buy Unit Properties Disappearance - Diagnosis Report

## Issue Identified
The properties on the "Buy Unit" page (Sales tab) have disappeared. The page shows "No co-ownership listings available yet" instead of showing the sales properties.

## Root Cause
**CRITICAL BUG on Line 987-1000:**

The code is checking the WRONG variable for the empty state:

```tsx
) : coOwnershipListings.length === 0 ? (  // ❌ WRONG - checking co-ownership
    <div className="col-span-full text-center py-16...">
        <p className="text-slate-400 font-bold text-xl">No co-ownership listings available yet.</p>
    </div>
) : (
    coOwnershipListings.map((listing) => (  // ❌ WRONG - mapping co-ownership
```

## The Problem
On the **"sales" tab** (Buy Unit page), the code should be:
1. Checking `salesOnlyListings.length === 0` (NOT `coOwnershipListings`)
2. Mapping over `salesOnlyListings` (NOT `coOwnershipListings`)

But instead, it's checking and displaying co-ownership listings on the sales tab!

## Data Variables
From line 597-598:
```tsx
const coOwnershipListings = salesListings.filter(l => l.is_co_ownership);
const salesOnlyListings = salesListings.filter(l => !l.is_co_ownership);
```

- `coOwnershipListings` = properties WITH co-ownership flag
- `salesOnlyListings` = properties WITHOUT co-ownership flag (regular sales)

## What Should Happen
On the "sales" tab (Buy Unit page), the code should:
1. Check if `salesOnlyListings.length === 0`
2. Map over `salesOnlyListings` to display regular sale properties
3. Show message "No properties for sale available yet" (not "No co-ownership...")

## Impact
- All regular sale properties are hidden
- Users see co-ownership properties on the wrong tab
- The "Buy Unit" page appears empty even if there are properties
- Access request and secure room features are not visible because properties aren't showing

## Location
**File:** `src/pages/dashboard/BuyingOpportunities.tsx`
**Lines:** 987-1070 (approximately)
**Tab:** `<TabsContent value="sales">`

## Fix Required
Replace lines 987-1000:
```tsx
// WRONG:
) : coOwnershipListings.length === 0 ? (
    // empty state
) : (
    coOwnershipListings.map((listing) => (

// CORRECT:
) : salesOnlyListings.length === 0 ? (
    // empty state with correct message
) : (
    salesOnlyListings.map((listing) => (
```

## Additional Notes
- This is a simple variable name mistake
- The co-ownership tab likely has the same issue in reverse
- Both tabs need to be checked and corrected
- The UI/styling doesn't need to change, just the variable names
