# Renovator Matching System - Complete Flow Documentation

## Overview
The renovator matching system is a two-sided marketplace that connects renovators (providers) with customers (seekers) looking for renovation services. The system uses intelligent matching based on service type, location, availability, and quality ratings.

---

## System Architecture

### Core Components

1. **Database Schema** (`supabase/migrations/20260365_renovator_matching_phase1.sql`)
   - `renovator_profiles` - Provider/seeker profiles with capabilities and availability
   - `renovation_requests` - Customer requests for work
   - `renovation_matches` - Connection records between customers and renovators

2. **Matching Engine** (`homie-connect/src/services/renovatorMatchingEngine.js`)
   - Role detection (provider vs seeker)
   - Question flows for both roles
   - Profile building from answers
   - Match finding and scoring

3. **Conversation Logic** (`homie-connect/src/services/renovatorBrain.js`)
   - Session management
   - Multi-turn conversation handling
   - Emergency shortcut logic
   - Integration with Gemini API

4. **Message Formatting** (`homie-connect/src/services/renovatorFormatter.js`)
   - Telegram-specific formatting
   - Match card display
   - Button generation for interactions

5. **Telegram Handler** (`homie-connect/src/handlers/telegram.js`)
   - Webhook processing
   - Message routing
   - Match display and button handling

---

## User Flows

### FLOW 1: Renovator Registration (Provider)

**Trigger:** User says "I'm a renovator" or similar provider keywords

**Steps:**

1. **Role Detection**
   - System detects provider keywords
   - Creates session with `renovationRole = 'provider'`

2. **Question Flow** (5 questions)
   ```
   Q1: What services do you specialize in? (e.g., plumbing, electrical, general, carpentry)
   Q2: What's your service area? (city or radius in km)
   Q3: When are you available to start? (ASAP, this week, this month)
   Q4: What's your typical hourly rate range? (e.g., $50-75)
   Q5: How quickly can you respond to requests? (same day, 24hrs, 48hrs)
   ```

3. **Profile Building**
   - Answers parsed into structured data:
     - `service_categories` - Array of services (plumbing, electrical, etc.)
     - `service_radius_km` - Service area radius (default 25km)
     - `availability_start` - When they can start
     - `hourly_rate_min/max` - Rate range
     - `response_time_hours` - Response time in hours
     - `user_type` - Set to 'provider'
     - `status` - Set to 'active'

4. **Database Storage**
   - Profile saved to `renovator_profiles` table
   - User marked as `user_type = 'provider'`

5. **Confirmation**
   - System responds: "✅ You're now visible to customers in [area] looking for [services]. You'll get notified when someone matches!"

**Result:** Renovator is now discoverable by customers

---

### FLOW 2: Customer Request (Seeker)

**Trigger:** User says "I need a renovator" or similar seeker keywords

**Steps:**

1. **Role Detection**
   - System detects seeker keywords
   - Creates session with `renovationRole = 'seeker'`

2. **Question Flow** (3 questions)
   ```
   Q1: Is this an emergency — active damage right now?
   Q2: Which property address is this for?
   Q3: What type of work is needed?
   ```

3. **Emergency Shortcut**
   - If customer answers "yes" to Q1 (emergency):
     - System immediately triggers emergency dispatch
     - Skips remaining questions
     - Sends alert to 4 verified emergency renovators
     - Response: "🚨 Sending an emergency alert to 4 verified renovators near your property right now. You'll hear back within 15 minutes."

4. **Request Building** (if not emergency)
   - Answers parsed into structured data:
     - `address` - Property address
     - `city` - Extracted from address
     - `work_type` - Type of work needed
     - `emergency` - Boolean flag
     - `timeline` - Parsed from emergency answer (urgent, this_week, this_month, flexible)
     - `status` - Set to 'open'

5. **Database Storage**
   - Request saved to `renovation_requests` table
   - Request ID returned

6. **Match Finding**
   - System calls `find_renovation_matches(request_id, limit=3)`
   - Database function scores all available providers
   - Returns top 3 matches with scores

7. **Match Record Creation**
   - For each match found, creates record in `renovation_matches` table
   - Status: 'pending' (awaiting both parties' confirmation)

8. **Display Matches**
   - Shows header: "✅ Found [N] renovators! Showing the top match below."
   - Displays first match with:
     - Renovator name and rating
     - Services offered
     - Availability
     - Rate range
     - Response time
     - Match score (0-100)
   - Shows buttons: "✅ Connect" | "❌ Skip"

**Result:** Customer sees top-matched renovators

---

## Matching Algorithm

### Scoring Function: `calculate_renovation_match_score()`

**Total Score: 0-100 points**

#### 1. Service Match (0-40 points)
- **40 points**: Exact service match (customer's work type in renovator's services)
- **10 points**: General contractor (can do any work)
- **0 points**: No service match

#### 2. Location Match (0-30 points)
- **30 points**: Same city
- **20 points**: Within service radius (using PostGIS geographic distance)
- **0 points**: Outside service radius

#### 3. Availability Match (0-20 points)
- **20 points**: Can start immediately (availability_start ≤ today)
- **20 points**: Emergency request + can start within 3 days
- **15 points**: This week request + can start within 7 days
- **10 points**: This month request + can start within 30 days
- **5 points**: Flexible timeline

#### 4. Quality Match (0-10 points)
- **10 points**: Rating ≥ 4.5 stars
- **5 points**: Rating ≥ 4.0 stars
- **2 points**: Rating > 0 (new but has some reviews)
- **0 points**: No rating (brand new)

### Example Scoring

**Scenario:** Customer in North York needs plumbing, emergency

**Renovator A:**
- Services: plumbing, electrical → 40 pts (exact match)
- City: North York → 30 pts (same city)
- Availability: ASAP → 20 pts (can start immediately)
- Rating: 4.7 stars → 10 pts (excellent)
- **Total: 100/100** ✅ Perfect match

**Renovator B:**
- Services: general → 10 pts (general contractor)
- City: Mississauga (15km away, within 25km radius) → 20 pts (within radius)
- Availability: This week → 15 pts (not immediate)
- Rating: 3.8 stars → 0 pts (below 4.0)
- **Total: 45/100** ⚠️ Partial match

---

## Database Schema Details

### renovator_profiles Table

```sql
id UUID PRIMARY KEY
user_id UUID UNIQUE (references auth.users)
user_type TEXT ('provider' or 'seeker')
status TEXT ('active', 'inactive', 'on_break')
service_categories TEXT[] (array of services)
availability_start DATE
availability_end DATE
service_radius_km INTEGER (default 25)
hourly_rate_min DECIMAL
hourly_rate_max DECIMAL
rating DECIMAL (0-5)
completed_jobs INTEGER
response_time_hours INTEGER
latitude DECIMAL
longitude DECIMAL
city TEXT
verified BOOLEAN
available BOOLEAN
emergency_available BOOLEAN
specialization TEXT
services TEXT[]
profile_completeness INTEGER (0-100)
created_at TIMESTAMP
updated_at TIMESTAMP
```

### renovation_requests Table

```sql
id UUID PRIMARY KEY
user_id UUID (references auth.users)
intent TEXT ('renovation')
emergency BOOLEAN
address TEXT
city TEXT
postal_code TEXT
latitude DECIMAL
longitude DECIMAL
work_type TEXT
description TEXT
budget_min DECIMAL
budget_max DECIMAL
timeline TEXT ('urgent', 'this_week', 'this_month', 'flexible')
status TEXT ('open', 'matched', 'completed', 'cancelled')
created_at TIMESTAMP
expires_at TIMESTAMP (48 hours from creation)
updated_at TIMESTAMP
```

### renovation_matches Table

```sql
id UUID PRIMARY KEY
request_id UUID (references renovation_requests)
renovator_id UUID (references auth.users)
customer_id UUID (references auth.users)
match_score DECIMAL (0-100)
match_reason TEXT
customer_accepted BOOLEAN
renovator_accepted BOOLEAN
status TEXT ('pending', 'accepted_both', 'rejected', 'expired')
created_at TIMESTAMP
expires_at TIMESTAMP (24 hours from creation)
updated_at TIMESTAMP
```

---

## Integration Points

### 1. Brain Service (`homie-connect/src/services/brain.js`)

**Role:** Main conversation router

**Logic:**
```javascript
if (message contains renovation keywords) {
  route to generateRenovationResponse()
}
```

**Keywords detected:**
- renovator, renovation, repair, plumb, electric

### 2. Telegram Handler (`homie-connect/src/handlers/telegram.js`)

**Role:** Webhook processor and match display

**Flow:**
```
1. Receive message from Telegram
2. Call generateResponse()
3. If matchReady signal:
   - If RENOVATION intent:
     - If provider: Show registration confirmation
     - If seeker: Show matches with buttons
   - If other intent: Show existing match flow
4. Send formatted message to Telegram
```

**Match Display:**
- Header with match count
- First match card with details
- Buttons for user action (Connect/Skip for customers, Accept/Decline for renovators)

### 3. Session Management

**Session Structure:**
```javascript
{
  channel: 'telegram',
  userId: 123456,
  intent: 'RENOVATION',
  renovationRole: 'provider' or 'seeker',
  answers: {
    services: 'plumbing, electrical',
    serviceArea: 'North York, 25km',
    availability: 'ASAP',
    rateRange: '$50-75',
    responseTime: 'same day',
    // OR for seeker:
    isEmergency: 'yes',
    address: '123 Main St, North York',
    workType: 'plumbing repair'
  },
  conversation: [
    { role: 'user', content: '...' },
    { role: 'assistant', content: '...' }
  ],
  messageCount: 5,
  lastActive: '2026-03-21T...',
  createdAt: '2026-03-21T...'
}
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    TELEGRAM USER MESSAGE                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │ Telegram Handler│
                    └────────┬────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │ Brain Service  │
                    │ (Router)       │
                    └────────┬────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                    ▼                 ▼
            ┌──────────────┐  ┌──────────────┐
            │ Renovation   │  │ Other Intent │
            │ Brain        │  │ (Roommate,   │
            │              │  │  CoBuy, etc) │
            └──────┬───────┘  └──────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
    ┌────────┐          ┌──────────┐
    │Provider│          │Seeker    │
    │Flow    │          │Flow      │
    └───┬────┘          └────┬─────┘
        │                    │
        │ 5 Questions        │ 3 Questions
        │                    │
        ▼                    ▼
    ┌────────────┐      ┌──────────────┐
    │Build       │      │Build Request │
    │Provider    │      │+ Find Matches│
    │Profile     │      │              │
    └───┬────────┘      └────┬─────────┘
        │                    │
        ▼                    ▼
    ┌────────────┐      ┌──────────────┐
    │Save to DB  │      │Save to DB    │
    │(provider)  │      │(request +    │
    │            │      │matches)      │
    └───┬────────┘      └────┬─────────┘
        │                    │
        ▼                    ▼
    ┌────────────┐      ┌──────────────┐
    │Confirmation│      │Display Matches│
    │Message     │      │with Buttons  │
    └────────────┘      └──────────────┘
```

---

## Key Features

### 1. Emergency Dispatch
- Customer can trigger emergency mode by answering "yes" to first question
- Immediately sends alert to 4 verified emergency renovators
- Skips remaining questions
- 15-minute response target

### 2. Double Opt-In
- Matches start in 'pending' status
- Both customer and renovator must accept
- Contact details only shared after both confirm
- Prevents spam and ensures mutual interest

### 3. Geographic Matching
- Uses PostGIS for accurate distance calculations
- Respects service radius preferences
- Prioritizes same-city matches

### 4. Quality-Based Ranking
- Considers renovator ratings and completed jobs
- Newer renovators still get matched but ranked lower
- Encourages quality service delivery

### 5. Session Persistence
- Conversations stored in Redis/session store
- Users can pause and resume
- Sessions expire after inactivity
- Emergency shortcut available at any time

---

## Testing Scenarios

### Scenario 1: Perfect Match
```
User 1 (Renovator): "I'm a renovator in North York, do plumbing, available ASAP, $50-75/hr"
User 2 (Customer): "I need plumbing in North York, emergency"
Result: 100/100 match score, immediate connection
```

### Scenario 2: Partial Match
```
User 1 (Renovator): "I'm a general contractor in Mississauga, available next month, $40-60/hr"
User 2 (Customer): "I need plumbing in North York, this week"
Result: ~45/100 match score (general contractor, different city, wrong timeline)
```

### Scenario 3: Emergency Dispatch
```
User (Customer): "I'm looking for a renovator"
System: "Is this an emergency?"
User: "Yes, my pipe burst!"
Result: Immediate alert sent to 4 emergency renovators, no more questions
```

### Scenario 4: No Matches
```
User (Customer): "I need a specialized HVAC technician in rural area"
System: Saves request, notifies when matching renovator joins
Result: "I've saved your criteria. I'll notify you when someone joins who fits."
```

---

## Next Steps for Enhancement

1. **Renovator Notifications**
   - Send push notifications when new matching requests arrive
   - Show match details and customer info

2. **Contact Reveal**
   - Implement contact reveal after double opt-in
   - Send contact info to both parties

3. **Rating System**
   - Allow customers to rate renovators after job completion
   - Update renovator ratings in real-time

4. **Payment Integration**
   - Integrate Stripe for payment processing
   - Escrow system for job security

5. **Chat System**
   - Direct messaging between matched parties
   - Job details and timeline discussion

6. **Job Tracking**
   - Track job status (pending, in-progress, completed)
   - Update completed_jobs counter

7. **Analytics**
   - Track match success rates
   - Monitor response times
   - Identify popular services and areas

---

## Database Indexes

For optimal performance, the following indexes are created:

```sql
idx_renovation_requests_user_id
idx_renovation_requests_city
idx_renovation_requests_status
idx_renovation_requests_expires_at
idx_renovation_matches_request_id
idx_renovation_matches_renovator_id
idx_renovation_matches_customer_id
idx_renovation_matches_status
idx_renovator_profiles_user_type
idx_renovator_profiles_status
idx_renovator_profiles_city
idx_renovator_profiles_service_categories (GIN index for array search)
idx_renovator_profiles_location (GIST index for geographic queries)
```

---

## Security & RLS Policies

### Row Level Security (RLS)

**renovation_requests:**
- Users can only view their own requests
- Users can only create/update their own requests

**renovation_matches:**
- Customers can only view their matches
- Renovators can only view their matches
- System can create matches
- Both parties can update match status

**renovator_profiles:**
- Inherits existing RLS policies
- New fields follow same security model

---

## Error Handling

### Database Errors
- Gracefully handled in matching engine
- Returns empty array if query fails
- Logs error for debugging

### Session Errors
- Expired sessions automatically deleted
- New session created on next message
- No data loss

### Telegram Errors
- Webhook returns 200 OK even on errors
- Errors logged for debugging
- User receives fallback message

---

## Performance Considerations

1. **Match Finding**
   - Limited to top 3 matches per request
   - Indexes on city, status, service_categories
   - Geographic index for distance queries

2. **Session Storage**
   - In-memory storage (Redis)
   - Automatic expiration
   - Minimal memory footprint

3. **Database Queries**
   - Prepared statements prevent SQL injection
   - Indexes optimize common queries
   - Connection pooling via Supabase

---

## Deployment Checklist

- [ ] Run migration: `20260365_renovator_matching_phase1.sql`
- [ ] Verify tables created: `renovation_requests`, `renovation_matches`
- [ ] Verify functions created: `calculate_renovation_match_score()`, `find_renovation_matches()`
- [ ] Verify indexes created
- [ ] Test provider registration flow
- [ ] Test customer request flow
- [ ] Test emergency dispatch
- [ ] Test match display in Telegram
- [ ] Monitor logs for errors
- [ ] Verify RLS policies working

