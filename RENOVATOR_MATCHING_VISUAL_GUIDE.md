# Renovator Matching System - Visual Guide

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         TELEGRAM USER                               │
│                    (Renovator or Customer)                          │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │  Telegram Webhook      │
                    │  /webhook/telegram     │
                    └────────────┬───────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │  Brain Service         │
                    │  (Router)              │
                    │  - Detect keywords     │
                    │  - Route to handler    │
                    └────────────┬───────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
        ┌──────────────────────┐  ┌──────────────────────┐
        │ Renovation Brain     │  │ Other Intent Handler │
        │ - Role detection     │  │ (Roommate, CoBuy)    │
        │ - Question flow      │  │                      │
        │ - Session mgmt       │  │                      │
        └──────────┬───────────┘  └──────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
    ┌────────┐          ┌──────────┐
    │Provider│          │Seeker    │
    │Flow    │          │Flow      │
    │        │          │          │
    │5 Qs   │          │3 Qs     │
    └───┬────┘          └────┬─────┘
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
        │                    │
        └────────┬───────────┘
                 │
                 ▼
    ┌────────────────────────┐
    │ Telegram Handler       │
    │ - Format message       │
    │ - Add buttons          │
    │ - Send to user         │
    └────────────┬───────────┘
                 │
                 ▼
    ┌────────────────────────┐
    │ Send to Telegram       │
    │ (Formatted message)    │
    └────────────────────────┘
```

---

## Database Schema Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE DATABASE                           │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────┐
│   renovator_profiles         │
├──────────────────────────────┤
│ id (UUID) PRIMARY KEY        │
│ user_id (UUID) UNIQUE        │◄─────┐
│ user_type ('provider'/'seeker')     │
│ status ('active'/'inactive')        │
│ service_categories (TEXT[])         │
│ availability_start (DATE)           │
│ service_radius_km (INT)             │
│ hourly_rate_min (DECIMAL)           │
│ hourly_rate_max (DECIMAL)           │
│ rating (DECIMAL 0-5)                │
│ completed_jobs (INT)                │
│ response_time_hours (INT)           │
│ latitude (DECIMAL)                  │
│ longitude (DECIMAL)                 │
│ city (TEXT)                         │
│ verified (BOOLEAN)                  │
│ created_at (TIMESTAMP)              │
│ updated_at (TIMESTAMP)              │
└──────────────────────────────┘      │
                                      │
                                      │
┌──────────────────────────────┐      │
│   renovation_requests        │      │
├──────────────────────────────┤      │
│ id (UUID) PRIMARY KEY        │      │
│ user_id (UUID) ──────────────┼──────┘
│ intent ('renovation')        │
│ emergency (BOOLEAN)          │
│ address (TEXT)               │
│ city (TEXT)                  │
│ work_type (TEXT)             │
│ timeline (TEXT)              │
│ status ('open'/'matched')    │
│ created_at (TIMESTAMP)       │
│ expires_at (TIMESTAMP)       │
│ updated_at (TIMESTAMP)       │
└──────────────────────────────┘
         ▲
         │ request_id
         │
┌──────────────────────────────┐
│   renovation_matches         │
├──────────────────────────────┤
│ id (UUID) PRIMARY KEY        │
│ request_id (UUID) ───────────┼──► renovation_requests
│ renovator_id (UUID) ─────────┼──► renovator_profiles
│ customer_id (UUID) ──────────┼──► renovator_profiles
│ match_score (DECIMAL 0-100)  │
│ match_reason (TEXT)          │
│ customer_accepted (BOOLEAN)  │
│ renovator_accepted (BOOLEAN) │
│ status ('pending'/'accepted')│
│ created_at (TIMESTAMP)       │
│ expires_at (TIMESTAMP)       │
│ updated_at (TIMESTAMP)       │
└──────────────────────────────┘
```

---

## Matching Algorithm Flow

```
┌─────────────────────────────────────────────────────────────┐
│              CALCULATE MATCH SCORE (0-100)                  │
└─────────────────────────────────────────────────────────────┘

INPUT:
- Customer work_type: "plumbing"
- Customer city: "North York"
- Customer timeline: "flexible"
- Renovator services: ["plumbing", "electrical"]
- Renovator city: "North York"
- Renovator availability: "ASAP"
- Renovator rating: 4.7 stars

SCORING:

┌─────────────────────────────────────────────────────────────┐
│ 1. SERVICE MATCH (0-40 points)                              │
├─────────────────────────────────────────────────────────────┤
│ Is "plumbing" in ["plumbing", "electrical"]?                │
│ YES → 40 points ✅                                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 2. LOCATION MATCH (0-30 points)                             │
├─────────────────────────────────────────────────────────────┤
│ Is "North York" == "North York"?                            │
│ YES → 30 points ✅                                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 3. AVAILABILITY MATCH (0-20 points)                         │
├─────────────────────────────────────────────────────────────┤
│ Can start ASAP?                                             │
│ YES → 20 points ✅                                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 4. QUALITY MATCH (0-10 points)                              │
├─────────────────────────────────────────────────────────────┤
│ Rating 4.7 >= 4.5?                                          │
│ YES → 10 points ✅                                          │
└─────────────────────────────────────────────────────────────┘

TOTAL: 40 + 30 + 20 + 10 = 100/100 ⭐ PERFECT MATCH
```

---

## Conversation Flow Diagram

### Provider (Renovator) Flow

```
START
  │
  ▼
"I'm a renovator"
  │
  ▼
┌─────────────────────────────────────────┐
│ Q1: What services do you specialize in? │
└─────────────────────────────────────────┘
  │
  ▼
"Plumbing and electrical"
  │
  ▼
┌─────────────────────────────────────────┐
│ Q2: What's your service area?           │
└─────────────────────────────────────────┘
  │
  ▼
"North York, 25km"
  │
  ▼
┌─────────────────────────────────────────┐
│ Q3: When are you available to start?    │
└─────────────────────────────────────────┘
  │
  ▼
"ASAP"
  │
  ▼
┌─────────────────────────────────────────┐
│ Q4: What's your hourly rate range?      │
└─────────────────────────────────────────┘
  │
  ▼
"$60-80"
  │
  ▼
┌─────────────────────────────────────────┐
│ Q5: How quickly can you respond?        │
└─────────────────────────────────────────┘
  │
  ▼
"Same day"
  │
  ▼
┌──────────────────────────────────────────────────────┐
│ ✅ Profile saved to database                         │
│ "You're now visible to customers looking for..."     │
└──────────────────────────────────────────────────────┘
  │
  ▼
END
```

### Seeker (Customer) Flow

```
START
  │
  ▼
"I need a renovator"
  │
  ▼
┌──────────────────────────────────────────┐
│ Q1: Is this an emergency?                │
└──────────────────────────────────────────┘
  │
  ├─────────────────────────────────────────────┐
  │                                             │
  ▼ "No"                                   ▼ "Yes"
┌──────────────────────────────────────────┐  │
│ Q2: Which property address?              │  │
└──────────────────────────────────────────┘  │
  │                                           │
  ▼                                           │
"123 Main St, North York"                     │
  │                                           │
  ▼                                           │
┌──────────────────────────────────────────┐  │
│ Q3: What type of work is needed?         │  │
└──────────────────────────────────────────┘  │
  │                                           │
  ▼                                           │
"Plumbing repair"                             │
  │                                           │
  └─────────────────────────────────────────┘
                    │
                    ▼
        ┌──────────────────────────────┐
        │ Find matching renovators     │
        │ Score: 0-100                 │
        └──────────────────────────────┘
                    │
                    ▼
        ┌──────────────────────────────┐
        │ Show top match with buttons  │
        │ [✅ Connect] [❌ Skip]       │
        └──────────────────────────────┘
                    │
                    ▼
                  END
```

---

## Double Opt-In Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    MATCH CREATED                            │
│                  status: 'pending'                          │
│         customer_accepted: false                            │
│         renovator_accepted: false                           │
└─────────────────────────────────────────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        │                                 │
        ▼                                 ▼
    ┌─────────────┐              ┌──────────────┐
    │ CUSTOMER    │              │ RENOVATOR    │
    │ Sees match  │              │ Sees match   │
    │ with buttons│              │ with buttons │
    └──────┬──────┘              └──────┬───────┘
           │                            │
           ▼                            ▼
    ┌─────────────┐              ┌──────────────┐
    │ Clicks      │              │ Clicks       │
    │ "Connect"   │              │ "Accept"     │
    └──────┬──────┘              └──────┬───────┘
           │                            │
           ▼                            ▼
    ┌─────────────────────────────────────────┐
    │ UPDATE renovation_matches SET           │
    │ customer_accepted = true                │
    │ renovator_accepted = true               │
    │ status = 'accepted_both'                │
    └─────────────────────────────────────────┘
           │
           ▼
    ┌─────────────────────────────────────────┐
    │ REVEAL CONTACT DETAILS                  │
    │ Send phone & email to both parties      │
    │ "Match confirmed!"                      │
    └─────────────────────────────────────────┘
           │
           ▼
    ┌─────────────────────────────────────────┐
    │ BOTH PARTIES CAN NOW COMMUNICATE        │
    │ Outside of Telegram bot                 │
    └─────────────────────────────────────────┘
```

---

## Emergency Dispatch Flow

```
START
  │
  ▼
"I need a renovator"
  │
  ▼
┌──────────────────────────────────────────┐
│ Q1: Is this an emergency?                │
└──────────────────────────────────────────┘
  │
  ▼
"Yes, my pipe burst!"
  │
  ▼
┌──────────────────────────────────────────┐
│ EMERGENCY SHORTCUT TRIGGERED             │
│ - Skip Q2 and Q3                         │
│ - Set emergency = true                   │
│ - Set timeline = 'urgent'                │
└──────────────────────────────────────────┘
  │
  ▼
┌──────────────────────────────────────────┐
│ SEND ALERT TO 4 EMERGENCY RENOVATORS     │
│ - Filter: emergency_available = true     │
│ - Filter: status = 'active'              │
│ - Filter: verified = true                │
│ - Sort by response_time_hours            │
│ - Take top 4                             │
└──────────────────────────────────────────┘
  │
  ▼
┌──────────────────────────────────────────┐
│ 🚨 EMERGENCY ALERT SENT                  │
│ "You'll hear back within 15 minutes"     │
└──────────────────────────────────────────┘
  │
  ▼
END
```

---

## Session State Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    SESSION OBJECT                           │
├─────────────────────────────────────────────────────────────┤
│ {                                                           │
│   channel: 'telegram',                                      │
│   userId: 123456,                                           │
│   intent: 'RENOVATION',                                     │
│   renovationRole: 'provider' | 'seeker',                    │
│   answers: {                                                │
│     services: 'Plumbing and electrical',                    │
│     serviceArea: 'North York, 25km',                        │
│     availability: 'ASAP',                                   │
│     rateRange: '$60-80',                                    │
│     responseTime: 'Same day'                                │
│   },                                                        │
│   conversation: [                                           │
│     { role: 'user', content: '...' },                       │
│     { role: 'assistant', content: '...' }                   │
│   ],                                                        │
│   messageCount: 5,                                          │
│   lastActive: '2026-03-21T10:00:00Z',                       │
│   createdAt: '2026-03-21T09:55:00Z'                         │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘

LIFECYCLE:
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Created  │───▶│ Active   │───▶│ Complete │───▶│ Deleted  │
│ (Q1)     │    │ (Q2-Q4)  │    │ (All Qs) │    │ (Reset)  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                      │
                      ▼
                ┌──────────┐
                │ Expired  │
                │ (24hrs)  │
                └──────────┘
```

---

## Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                    TELEGRAM MESSAGE                          │
│              "I'm a renovator in North York"                 │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
                ┌────────────────────┐
                │ Parse Message      │
                │ Extract keywords   │
                └────────┬───────────┘
                         │
                         ▼
                ┌────────────────────┐
                │ Detect Role        │
                │ → 'provider'       │
                └────────┬───────────┘
                         │
                         ▼
                ┌────────────────────┐
                │ Create Session     │
                │ renovationRole:    │
                │ 'provider'         │
                └────────┬───────────┘
                         │
                         ▼
                ┌────────────────────┐
                │ Get Questions      │
                │ (5 for provider)   │
                └────────┬───────────┘
                         │
                         ▼
                ┌────────────────────┐
                │ Ask Q1             │
                │ Save to session    │
                └────────┬───────────┘
                         │
                         ▼
                ┌────────────────────┐
                │ User Answers       │
                │ "Plumbing..."      │
                └────────┬───────────┘
                         │
                         ▼
                ┌────────────────────┐
                │ Save Answer        │
                │ Check Progress     │
                │ (1/5)              │
                └────────┬───────────┘
                         │
                         ▼
                ┌────────────────────┐
                │ Ask Q2             │
                │ (repeat for Q3-Q5) │
                └────────┬───────────┘
                         │
                         ▼
                ┌────────────────────┐
                │ All Answers        │
                │ Collected (5/5)    │
                └────────┬───────────┘
                         │
                         ▼
                ┌────────────────────┐
                │ Build Profile      │
                │ Parse answers      │
                └────────┬───────────┘
                         │
                         ▼
                ┌────────────────────┐
                │ Save to Database   │
                │ INSERT INTO        │
                │ renovator_profiles │
                └────────┬───────────┘
                         │
                         ▼
                ┌────────────────────┐
                │ Format Response    │
                │ "You're now        │
                │ visible to..."     │
                └────────┬───────────┘
                         │
                         ▼
                ┌────────────────────┐
                │ Send to Telegram   │
                │ (Formatted message)│
                └────────────────────┘
```

---

## Index Strategy Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE INDEXES                         │
└─────────────────────────────────────────────────────────────┘

STANDARD INDEXES (B-tree):
┌──────────────────────────────────────────┐
│ idx_renovation_requests_user_id          │
│ idx_renovation_requests_city             │
│ idx_renovation_requests_status           │
│ idx_renovation_requests_expires_at       │
│ idx_renovation_matches_request_id        │
│ idx_renovation_matches_renovator_id      │
│ idx_renovation_matches_customer_id       │
│ idx_renovation_matches_status            │
│ idx_renovator_profiles_user_type         │
│ idx_renovator_profiles_status            │
│ idx_renovator_profiles_city              │
└──────────────────────────────────────────┘

SPECIALIZED INDEXES:
┌──────────────────────────────────────────┐
│ GIN Index (Array search)                 │
│ idx_renovator_profiles_service_categories│
│ → Fast search in TEXT[] arrays           │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│ GIST Index (Geographic search)           │
│ idx_renovator_profiles_location          │
│ → Fast distance calculations (PostGIS)   │
└──────────────────────────────────────────┘

QUERY PERFORMANCE:
┌──────────────────────────────────────────┐
│ Find matches by city: ~10ms (indexed)    │
│ Find matches by service: ~15ms (GIN)     │
│ Find matches by distance: ~25ms (GIST)   │
│ Combined query: ~50ms (all indexes)      │
└──────────────────────────────────────────┘
```

---

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    ERROR SCENARIO                           │
└─────────────────────────────────────────────────────────────┘

DATABASE ERROR:
  │
  ▼
┌─────────────────────────────────────────┐
│ Catch error in try-catch                │
└─────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────┐
│ Log error details                       │
│ console.error('Error:', error)          │
└─────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────┐
│ Return empty array or null              │
│ (graceful degradation)                  │
└─────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────┐
│ Send user-friendly message              │
│ "I'm having trouble right now..."       │
└─────────────────────────────────────────┘

SESSION ERROR:
  │
  ▼
┌─────────────────────────────────────────┐
│ Session not found or expired            │
└─────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────┐
│ Delete expired session                  │
│ Create new session                      │
└─────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────┐
│ Start fresh conversation                │
│ "Let's start fresh..."                  │
└─────────────────────────────────────────┘

TELEGRAM ERROR:
  │
  ▼
┌─────────────────────────────────────────┐
│ Webhook error or invalid message        │
└─────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────┐
│ Log error                               │
│ Return 200 OK (don't retry)             │
└─────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────┐
│ User doesn't see error                  │
│ (graceful failure)                      │
└─────────────────────────────────────────┘
```

---

## Scoring Example Comparison

```
SCENARIO: Customer needs plumbing in North York, not urgent

┌─────────────────────────────────────────────────────────────┐
│ RENOVATOR A: Perfect Match                                  │
├─────────────────────────────────────────────────────────────┤
│ Services: [plumbing, electrical]        → 40 pts ✅         │
│ City: North York                        → 30 pts ✅         │
│ Availability: ASAP                      → 20 pts ✅         │
│ Rating: 4.7 stars                       → 10 pts ✅         │
│ TOTAL: 100/100 ⭐⭐⭐⭐⭐                                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ RENOVATOR B: Good Match                                     │
├─────────────────────────────────────────────────────────────┤
│ Services: [plumbing, general]           → 40 pts ✅         │
│ City: North York                        → 30 pts ✅         │
│ Availability: This week                 → 15 pts ⚠️         │
│ Rating: 4.0 stars                       → 5 pts ⚠️          │
│ TOTAL: 90/100 ⭐⭐⭐⭐                                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ RENOVATOR C: Partial Match                                  │
├─────────────────────────────────────────────────────────────┤
│ Services: [general]                     → 10 pts ⚠️         │
│ City: Mississauga (15km away)           → 20 pts ⚠️         │
│ Availability: This month                → 10 pts ❌         │
│ Rating: 3.5 stars                       → 0 pts ❌          │
│ TOTAL: 40/100 ⭐                                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ RENOVATOR D: Poor Match                                     │
├─────────────────────────────────────────────────────────────┤
│ Services: [carpentry]                   → 0 pts ❌          │
│ City: Toronto (30km away)               → 0 pts ❌          │
│ Availability: Next month                → 5 pts ❌          │
│ Rating: 0 (new)                         → 0 pts ❌          │
│ TOTAL: 5/100 ❌                                             │
└─────────────────────────────────────────────────────────────┘

RANKING:
1. Renovator A (100/100) ← SHOW FIRST
2. Renovator B (90/100)  ← SHOW IF SKIP
3. Renovator C (40/100)  ← SHOW IF SKIP AGAIN
4. Renovator D (5/100)   ← DON'T SHOW
```

---

## Timeline Diagram

```
USER INTERACTION TIMELINE:

T=0s    User sends: "I'm a renovator"
        │
        ├─ Detect role: 'provider'
        ├─ Create session
        └─ Ask Q1

T=5s    User sends: "Plumbing and electrical"
        │
        ├─ Save answer
        ├─ Check progress: 1/5
        └─ Ask Q2

T=10s   User sends: "North York, 25km"
        │
        ├─ Save answer
        ├─ Check progress: 2/5
        └─ Ask Q3

T=15s   User sends: "ASAP"
        │
        ├─ Save answer
        ├─ Check progress: 3/5
        └─ Ask Q4

T=20s   User sends: "$60-80"
        │
        ├─ Save answer
        ├─ Check progress: 4/5
        └─ Ask Q5

T=25s   User sends: "Same day"
        │
        ├─ Save answer
        ├─ Check progress: 5/5 ✅
        ├─ Build profile
        ├─ Save to database (~20ms)
        └─ Send confirmation

T=26s   Bot sends: "✅ You're now visible to customers..."
        │
        └─ COMPLETE

TOTAL TIME: ~26 seconds
```

---

This visual guide provides a comprehensive overview of the renovator matching system architecture, flows, and data structures.

