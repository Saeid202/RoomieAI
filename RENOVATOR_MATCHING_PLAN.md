# Renovator Matching Logic - Comprehensive Plan

## Overview
The system needs to match customers looking for renovators with available renovators in their area. This involves two distinct user flows that converge at the matching engine.

---

## Current State Analysis

### Existing Infrastructure
- **Conversation Engine**: Gemini-powered chat that asks structured questions
- **Session Management**: Stores user intent, answers, and conversation history
- **Matching Engine**: `findRenovationMatches()` already exists but needs enhancement
- **Database**: `renovator_profiles` table with verified, available, city, services, specialization fields
- **Match Storage**: `match_requests` table for double opt-in flow

### Current Renovation Flow
1. User says something about renovation → Intent detected as "RENOVATION"
2. Gemini asks 3 questions in order:
   - "Is this an emergency?" (if YES → immediate dispatch to 4 emergency renovators)
   - "Which property address?"
   - "What type of work?"
3. After 3 answers → `MATCH_READY` signal emitted
4. `findRenovationMatches()` queries renovators by:
   - Emergency: Top 4 verified + emergency_available=true
   - Normal: Verified + available=true + city match + work type filter
5. Returns top 3 matches sorted by profile_completeness

---

## Two-Sided Matching Scenario

### Scenario: Renovator + Customer in Same Area

**User A (Renovator)**: "I'm a renovator in North York and I'm ready to work"
- Intent: RENOVATION (but as provider, not seeker)
- Current system treats this as a customer looking for renovation
- **PROBLEM**: System doesn't distinguish between renovators offering services vs customers seeking them

**User B (Customer)**: "I'm looking for a renovator in North York"
- Intent: RENOVATION (as seeker)
- Asks 3 questions → collects answers
- Triggers `findRenovationMatches()` → finds User A

---

## Issues with Current Approach

1. **No Provider Registration**: System assumes all users are seekers
   - Renovators can't register as "available for work"
   - No way to mark someone as a provider vs seeker
   - No profile type distinction

2. **One-Way Matching**: Only seekers trigger searches
   - Renovators can't proactively find customers
   - No way for renovators to say "I'm available"

3. **Missing Data Fields**:
   - No `user_type` field (provider vs seeker)
   - No `status` field (active, inactive, on-break)
   - No `service_categories` (plumbing, electrical, general, etc.)
   - No `availability_window` (when they can start)

4. **Incomplete Matching Logic**:
   - No scoring based on specialization match
   - No consideration of renovator's availability window
   - No rating/review system for quality matching
   - No geographic radius matching (just city-level)

---

## Proposed Solution Architecture

### Phase 1: Data Model Enhancement

#### New/Modified Fields in `renovator_profiles`
```
- user_type: 'provider' | 'seeker' (NEW)
- status: 'active' | 'inactive' | 'on_break' (NEW)
- service_categories: ['plumbing', 'electrical', 'general', ...] (NEW)
- availability_start: date (NEW)
- availability_end: date (NEW)
- service_radius_km: integer (NEW - how far willing to travel)
- hourly_rate_min: decimal (NEW)
- hourly_rate_max: decimal (NEW)
- rating: decimal (NEW - 0-5 stars)
- completed_jobs: integer (NEW)
- response_time_hours: integer (NEW - avg response time)
```

#### New Table: `renovation_requests`
```
- id: uuid
- user_id: uuid (customer)
- intent: 'renovation'
- emergency: boolean
- address: string
- city: string
- postal_code: string
- latitude: decimal
- longitude: decimal
- work_type: string
- description: text
- budget_min: decimal
- budget_max: decimal
- timeline: string ('urgent', 'this_week', 'this_month', 'flexible')
- status: 'open' | 'matched' | 'completed' | 'cancelled'
- created_at: timestamp
- expires_at: timestamp (24-48 hours)
```

#### New Table: `renovation_matches`
```
- id: uuid
- request_id: uuid (FK to renovation_requests)
- renovator_id: uuid (FK to renovator_profiles)
- customer_id: uuid (FK to users)
- match_score: decimal (0-100)
- match_reason: text (why they matched)
- customer_accepted: boolean
- renovator_accepted: boolean
- status: 'pending' | 'accepted_both' | 'rejected' | 'expired'
- created_at: timestamp
- expires_at: timestamp
```

---

### Phase 2: Conversation Flow Enhancement

#### For Renovators (Providers)
When renovator says "I'm a renovator in North York ready to work":

1. **Intent Detection**: Detect as RENOVATION + provider context
2. **Questions Asked**:
   - "What services do you specialize in?" (plumbing, electrical, general, etc.)
   - "What's your service area?" (North York, or radius in km)
   - "When are you available to start?" (ASAP, this week, this month)
   - "What's your typical hourly rate range?"
   - "How quickly can you respond to requests?" (same day, 24hrs, etc.)
3. **Action**: Create/update `renovator_profiles` with `user_type='provider'` and `status='active'`
4. **Notification**: "You're now visible to customers in North York looking for [services]. You'll get notified when someone matches!"

#### For Customers (Seekers)
When customer says "I'm looking for a renovator in North York":

1. **Intent Detection**: Detect as RENOVATION + seeker context
2. **Questions Asked** (existing flow):
   - "Is this an emergency?"
   - "What's the address?"
   - "What type of work?"
3. **Action**: Create `renovation_requests` record
4. **Matching**: Call enhanced `findRenovationMatches()` with scoring
5. **Notification**: "Found 3 renovators in North York. Sending top match now..."

---

### Phase 3: Matching Algorithm

#### Scoring System (0-100)
```
Base Score = 0

1. Service Match (0-40 points)
   - Exact service match: +40
   - Related service: +20
   - General contractor: +10

2. Location Match (0-30 points)
   - Same city: +30
   - Within service_radius_km: +20
   - Adjacent city: +10

3. Availability Match (0-20 points)
   - Can start within timeline: +20
   - Can start within 2x timeline: +10

4. Quality Match (0-10 points)
   - Rating >= 4.5 stars: +10
   - Rating >= 4.0 stars: +5
   - New (no rating): +2

Final Score = Base Score
```

#### Query Logic
```javascript
// For customer in North York looking for plumbing work, ASAP

SELECT 
  rp.user_id,
  rp.name,
  rp.rating,
  rp.completed_jobs,
  rp.service_categories,
  rp.availability_start,
  rp.hourly_rate_min,
  rp.hourly_rate_max,
  CASE 
    WHEN 'plumbing' = ANY(rp.service_categories) THEN 40
    WHEN 'general' = ANY(rp.service_categories) THEN 10
    ELSE 0
  END +
  CASE 
    WHEN rp.city = 'North York' THEN 30
    WHEN ST_Distance(rp.location, customer_location) < rp.service_radius_km * 1000 THEN 20
    ELSE 0
  END +
  CASE 
    WHEN rp.availability_start <= NOW() + INTERVAL '3 days' THEN 20
    ELSE 10
  END +
  CASE 
    WHEN rp.rating >= 4.5 THEN 10
    WHEN rp.rating >= 4.0 THEN 5
    ELSE 2
  END as match_score
FROM renovator_profiles rp
WHERE rp.user_type = 'provider'
  AND rp.status = 'active'
  AND rp.verified = true
ORDER BY match_score DESC
LIMIT 3
```

---

### Phase 4: Double Opt-In Flow

#### Step 1: Customer Sees Match
- Customer gets top 3 renovators with:
  - Name, rating, completed jobs
  - Services offered
  - Availability
  - Rate range
- Customer clicks "Connect" button

#### Step 2: Renovator Gets Notification
- Renovator receives notification: "A customer in North York needs plumbing work"
- Shows customer's request details (address, work type, timeline, budget)
- Renovator clicks "Accept" or "Decline"

#### Step 3: Both Confirmed
- If renovator accepts → both get contact details
- If renovator declines → show next match to customer
- If customer doesn't respond in 24hrs → match expires

#### Step 4: In-App Chat
- Both parties can message through app
- Negotiate details, schedule, pricing
- Complete work
- Leave review/rating

---

## Implementation Roadmap

### Step 1: Database Schema
- Add fields to `renovator_profiles`
- Create `renovation_requests` table
- Create `renovation_matches` table
- Add indexes for location, city, status

### Step 2: Conversation Logic
- Enhance `detectIntent()` to distinguish provider vs seeker
- Add provider question flow in `QUESTIONS` and `QUESTION_TEXT`
- Create `buildProviderProfile()` function
- Create `buildCustomerRequest()` function

### Step 3: Matching Engine
- Enhance `findRenovationMatches()` with scoring
- Add geographic distance calculation
- Add service category matching
- Add availability window checking

### Step 4: Notification System
- Notify renovators when new requests match their profile
- Notify customers when matches found
- Notify both parties on acceptance/rejection

### Step 5: UI/UX
- Show match cards with renovator details
- Show request details to renovators
- Implement accept/decline buttons
- Show in-app chat interface

---

## Key Differences from Current System

| Aspect | Current | Proposed |
|--------|---------|----------|
| User Types | Only seekers | Providers + Seekers |
| Matching | One-way (seeker finds provider) | Two-way (both notified) |
| Scoring | Profile completeness only | Multi-factor scoring |
| Location | City-level only | City + radius + coordinates |
| Availability | Binary (available/not) | Time window based |
| Quality | None | Rating + completed jobs |
| Notifications | One-way to customer | Both parties notified |

---

## Success Metrics

1. **Match Quality**: % of matches that result in accepted connections
2. **Response Time**: Avg time for renovator to respond to match
3. **Completion Rate**: % of matches that result in completed work
4. **Rating**: Avg customer satisfaction rating
5. **Repeat Business**: % of customers who use same renovator again

---

## Next Steps

1. Review this plan with stakeholder
2. Decide on implementation priority (Phase 1-5)
3. Create database migration scripts
4. Update conversation flows
5. Implement matching algorithm
6. Add notification system
7. Test end-to-end flow
