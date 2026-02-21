# Routing Cleanup Plan

## Current Messy State

### Pages:
1. **Buying Opportunities** (`/dashboard/buying-opportunities`)
   - Has 2 tabs: "Co-ownership" and "Buy Unit" (Sales)
   - Shows sales listings

### Current Routes (CONFUSING):
- `/dashboard/rental-options/:id` → PropertyDetails (for RENTALS)
- `/dashboard/sales-properties/:id` → PropertyDetails (for SALES) ← NEW, but confusing name
- Both use the SAME component but different URLs

### The Problem:
- "rental-options" in URL for sales properties is WRONG
- "sales-properties" is better but still not clear
- Need consistent, clear naming

## Proposed Clean Structure

### Clear Route Names:
1. **For Rentals**: `/dashboard/rental/:id` or `/dashboard/rent/:id`
2. **For Sales**: `/dashboard/sale/:id` or `/dashboard/buy/:id`
3. **For Co-ownership**: `/dashboard/co-ownership/:id`

### Recommended Final Routes:

```
RENTALS:
/dashboard/rent/:id

SALES (Regular):
/dashboard/buy/:id

SALES (Co-ownership):
/dashboard/co-ownership/:id
```

## Implementation Plan

1. Keep PropertyDetails component (it handles all types)
2. Create 3 clear routes pointing to it
3. Update BuyingOpportunities to use correct routes
4. Update any other navigation to use new routes
5. Remove old confusing routes

## Files to Update:
1. `src/App.tsx` - Route definitions
2. `src/pages/dashboard/BuyingOpportunities.tsx` - Navigation links
3. Any other files that navigate to property details
