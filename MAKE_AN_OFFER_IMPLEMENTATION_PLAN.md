# Make an Offer Button - Implementation Plan

## Goal
Add a "Make an Offer" button above "Schedule Viewing" on sales property detail pages. When clicked, it creates an application that appears in Landlord Dashboard > Applications > Sales Inquiries tab.

## Current System Analysis

### Existing Components
1. **Quick Apply Modal** (`src/components/application/QuickApplyModal.tsx`)
   - Already exists for rental applications
   - Can be adapted for sales offers

2. **Applications Page** (`src/pages/dashboard/landlord/Applications.tsx`)
   - Has "Sales Inquiries" tab
   - Filters applications by `listing_category === 'sale'`
   - Already displays sales applications

3. **Database Table**: `rental_applications`
   - Stores both rental AND sales applications
   - Has `property_id` that links to properties table
   - Property has `listing_category` field ('rental' or 'sale')

## Implementation Steps

### Step 1: Check Property Details Page
- Find where Schedule Viewing button is located
- Add "Make an Offer" button above it
- Only show for sales properties (`listing_category === 'sale'`)

### Step 2: Create/Adapt Offer Modal
- Option A: Reuse QuickApplyModal with sales-specific fields
- Option B: Create new MakeOfferModal component
- **Recommended**: Option A (reuse existing modal)

### Step 3: Sales-Specific Fields
For a sales offer, we need:
- Buyer name
- Email
- Phone
- Offer amount (new field)
- Financing type (cash, mortgage, etc.)
- Closing date preference
- Additional message/conditions

### Step 4: Update Database Schema (if needed)
Check if `rental_applications` table needs new fields:
- `offer_amount` (for sales offers)
- `financing_type` (cash, mortgage, pre-approved, etc.)
- `preferred_closing_date`

### Step 5: Update Service Layer
- Modify `quickApplyService.ts` to handle sales applications
- Ensure `listing_category` is properly set

### Step 6: Test Flow
1. Buyer clicks "Make an Offer" on sales property
2. Modal opens with offer form
3. Buyer fills in offer details
4. Application is created with `listing_category = 'sale'`
5. Landlord sees it in Applications > Sales Inquiries tab

## UI Design

### Button Placement
```
[View All Documents]
[Make an Offer] ← NEW (purple/gold gradient)
[Schedule Viewing] (blue gradient)
[Message] (pink gradient)
```

### Button Styling
- Use gold/amber gradient to differentiate from other buttons
- Icon: DollarSign or HandCoins
- Text: "Make an Offer" or "Submit Offer"

## Files to Modify

1. **Property Details Page** (need to find the file)
   - Add "Make an Offer" button
   - Add state for modal visibility
   - Import MakeOfferModal

2. **QuickApplyModal.tsx** or create **MakeOfferModal.tsx**
   - Add sales-specific fields
   - Handle offer submission

3. **quickApplyService.ts**
   - Ensure it handles sales applications correctly

4. **Database Migration** (if needed)
   - Add offer-specific columns to rental_applications table

## Next Steps
1. Find the Property Details page file
2. Check existing QuickApplyModal structure
3. Determine if we need new database columns
4. Implement the button and modal
5. Test end-to-end flow

---
**Status**: Planning Complete
**Priority**: HIGH
**Estimated Time**: 30-45 minutes
