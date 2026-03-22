# Contact Reveal Implementation - Renovation Matching System

## Overview
Implemented complete double opt-in flow with contact detail exchange for the renovation matching system. When both a customer and renovator accept a match, they receive each other's contact information via Telegram.

## Changes Made

### 1. Database Migration
**File**: `supabase/migrations/20260371_renovation_match_tracking.sql`

Created new table `renovation_match_acceptances` to track:
- `request_id`: The renovation request UUID
- `customer_id`: Telegram user ID of the customer
- `renovator_id`: Telegram user ID of the renovator
- `customer_accepted`: Boolean flag for customer acceptance
- `renovator_accepted`: Boolean flag for renovator acceptance
- `both_accepted_at`: Timestamp when both parties accepted

This table enables the double opt-in flow and contact exchange.

### 2. New Service: Renovation Match Acceptance
**File**: `homie-connect/src/services/renovationMatchAcceptance.js`

New service with functions:
- `recordCustomerAcceptance()` - Records when customer clicks "Connect"
- `recordRenovatorAcceptance()` - Records when renovator clicks "Accept", checks if both accepted
- `getRenovationMatchContacts()` - Retrieves contact details from cache for both parties
- `formatCustomerContactMessage()` - Formats contact details message for customer
- `formatRenovatorContactMessage()` - Formats contact details message for renovator
- `extractPhoneFromProfile()` - Helper to extract phone from renovator profile

### 3. Updated Telegram Handler
**File**: `homie-connect/src/handlers/telegram.js`

Enhanced `handleRenovationButton()` function:

**Customer Flow (Connect button)**:
1. Customer clicks "Connect" on a renovator match
2. System records customer acceptance in database
3. Customer receives confirmation message
4. Renovator is notified with "Accept" and "Decline" buttons

**Renovator Flow (Accept button)**:
1. Renovator clicks "Accept" on a customer match
2. System looks up customer ID from database
3. System records renovator acceptance
4. If both accepted:
   - Contact details are exchanged
   - Customer receives renovator's info (name, phone, email, services, rating)
   - Renovator receives customer's info (name, phone, email, location)
5. If only renovator accepted:
   - Renovator sees "Waiting for customer to confirm" message

**Renovator Flow (Decline button)**:
1. Renovator clicks "Decline"
2. Renovator sees confirmation
3. Customer is notified to find another match

### 4. Updated Renovation Brain
**File**: `homie-connect/src/services/renovatorBrain.js`

Enhanced to include `request_id` in the `matchReady.answers`:
- When seeker shortcut triggers (address provided), includes `request_id`
- When all seeker questions answered, includes `request_id`
- This allows button callbacks to properly identify the match

## Flow Diagram

```
CUSTOMER SIDE                          RENOVATOR SIDE
─────────────────────────────────────────────────────

Customer sees match
    ↓
[Connect] button
    ↓
recordCustomerAcceptance()
    ↓
"Great! Waiting for renovator"  ←→  Renovator notified
                                     [Accept] [Decline]
                                         ↓
                                    recordRenovatorAcceptance()
                                         ↓
                                    Both accepted?
                                    ↙           ↘
                                  YES           NO
                                   ↓             ↓
                            Exchange        "Waiting for
                            contacts        customer..."
                              ↓
                        Customer gets:      Renovator gets:
                        - Name              - Name
                        - Phone             - Phone
                        - Email             - Email
                        - Services          - Location
                        - Rating
```

## Contact Details Shared

**To Customer**:
```
🎉 Match Confirmed!
The renovator has accepted your match!

Renovator Details:
👤 [Name]
⭐ Rating: [X]/5
🔧 Services: [Services]
📱 Phone: [Phone]
📧 Email: [Email]

💬 You can now contact them directly to discuss your project!
```

**To Renovator**:
```
🎉 Match Confirmed!
The customer has accepted your match!

Customer Details:
👤 [Name]
📍 Location: [City]
📱 Phone: [Phone]
📧 Email: [Email]

💬 You can now contact them directly to discuss the project!
```

## Key Features

1. **Double Opt-In**: Both parties must accept before contact details are shared
2. **Database Tracking**: All acceptances recorded in `renovation_match_acceptances` table
3. **Cache Fallback**: Contact details retrieved from in-memory cache
4. **Phone Extraction**: Automatically extracts phone from renovator profile if available
5. **Decline Handling**: If renovator declines, customer is notified to find another match
6. **Waiting State**: If only one party accepts, the other sees "waiting" message

## Testing Steps

1. **Setup**: Start homie-connect with `npm run dev`
2. **Test with 2 Telegram accounts**:
   - Account A: Register as renovator (say "I'm a renovator")
   - Account B: Request renovation (say "I need a renovator in [city]")
3. **Customer Flow**:
   - Account B clicks "Connect" on Account A's match
   - Account B sees: "Great! Waiting for renovator"
   - Account A receives notification with Accept/Decline buttons
4. **Renovator Accepts**:
   - Account A clicks "Accept"
   - Both accounts receive contact details
   - Account A sees renovator's info
   - Account B sees customer's info
5. **Verify Contact Exchange**:
   - Both parties can see each other's phone, email, name, location

## Database Schema

```sql
CREATE TABLE renovation_match_acceptances (
  id BIGSERIAL PRIMARY KEY,
  request_id UUID NOT NULL,
  customer_id BIGINT NOT NULL,
  renovator_id BIGINT NOT NULL,
  customer_accepted BOOLEAN DEFAULT FALSE,
  renovator_accepted BOOLEAN DEFAULT FALSE,
  both_accepted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(request_id, customer_id, renovator_id)
);
```

## Error Handling

- If customer ID lookup fails: Renovator sees error message
- If contact details not found in cache: Fallback to "Contact details being prepared" message
- If database query fails: Graceful error handling with user-friendly messages
- If customer declines: Renovator can see other options

## Next Steps (Optional Enhancements)

1. Add "Show More Matches" button for customers
2. Add rating/review system after match
3. Add chat history between matched parties
4. Add match expiration (e.g., 24 hours)
5. Add ability to re-match if first match doesn't work out
6. Add SMS/WhatsApp as alternative contact channels
