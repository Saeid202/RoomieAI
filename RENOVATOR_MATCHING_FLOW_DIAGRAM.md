# Renovator Matching - Flow Diagram

## Role Detection Flow (FIXED)

```
User sends message
    ↓
detectRenovationRole(message)
    ↓
    ├─ Check seeker keywords (i'm looking for, i need, etc.)
    │  └─ FOUND? → return 'seeker' ✅
    │
    ├─ Check provider keywords (i'm a renovator, based on, etc.)
    │  └─ FOUND? → return 'provider' ✅
    │
    ├─ Check street suffixes (street, ave, rd, blvd, etc.)
    │  └─ FOUND? → return 'seeker' ✅
    │
    ├─ Check numeric addresses (123 Main St)
    │  └─ FOUND? → return 'seeker' ✅
    │
    └─ Check city names (Toronto, North York, etc.) ← NEW FIX ✅
       └─ FOUND? → return 'seeker' ✅
       └─ NOT FOUND? → return null
```

## Session Management Flow (IMPROVED)

```
User sends message
    ↓
Detect role from message
    ↓
Session exists?
    │
    ├─ NO → Create new session with detected role
    │       └─ Continue with questions
    │
    └─ YES → Check if role changed
             │
             ├─ Role changed? → RESET session with new role ← IMPROVED ✅
             │                  └─ Clear all answers
             │                  └─ Continue with new questions
             │
             ├─ No role detected? → Keep existing role
             │                      └─ Continue with existing questions
             │
             └─ Same role? → Continue with existing questions
```

## Question Flow by Role

### Provider (Renovator) Flow
```
User: "I'm a renovator based on North York"
    ↓ Detected: provider
    ↓
Q1: What services do you specialize in?
    ↓ User: "plumbing and electrical"
    ↓
Q2: What's your service area?
    ↓ User: "North York, 25km"
    ↓
Q3: When are you available to start?
    ↓ User: "ASAP"
    ↓
Q4: What's your typical hourly rate range?
    ↓ User: "$50-75"
    ↓
Q5: How quickly can you respond?
    ↓ User: "same day"
    ↓
✅ Registration complete
   Save to renovator_profiles table
```

### Seeker (Customer) Flow
```
User: "I'm looking for a renovator in North York"
    ↓ Detected: seeker
    ↓
Q1: Is this an emergency?
    ↓ User: "no"
    ↓
Q2: Which property address is this for?
    ↓ User: "North York" ← NOW DETECTED AS SEEKER ✅
    ↓
Q3: What type of work is needed?
    ↓ User: "plumbing repair"
    ↓
✅ Request complete
   Find matches in renovator_profiles
   Create renovation_requests record
   Create renovation_matches records
```

## Role Switch Scenario (FIXED)

### Before Fix ❌
```
User 402995277 (same account):

Message 1: "I'm a renovator based on North York"
    ↓ Detected: provider
    ↓ Session created: role = 'provider'
    ↓ Asked: Provider Q1

Message 2: "I'm looking for a renovator in North York"
    ↓ Detected: seeker
    ↓ BUT session exists with role = 'provider'
    ↓ Role changed? YES, but old code didn't reset properly
    ↓ Asked: Provider Q2 (WRONG!) ❌
```

### After Fix ✅
```
User 402995277 (same account):

Message 1: "I'm a renovator based on North York"
    ↓ Detected: provider
    ↓ Session created: role = 'provider'
    ↓ Asked: Provider Q1

Message 2: "/reset"
    ↓ Session deleted
    ↓ Asked: "Are you a renovator or customer?"

Message 3: "I'm looking for a renovator in North York"
    ↓ Detected: seeker
    ↓ Session created: role = 'seeker'
    ↓ Asked: Seeker Q1 (CORRECT!) ✅
```

## City Detection Examples

### Recognized as Seeker ✅
```
"North York"           → seeker (city name)
"Toronto"              → seeker (city name)
"Mississauga"          → seeker (city name)
"123 Main Street"      → seeker (numeric address)
"456 Blvd"             → seeker (numeric address)
"I'm looking for help" → seeker (keyword)
"I need a plumber"     → seeker (keyword)
```

### Recognized as Provider ✅
```
"I'm a renovator"      → provider (keyword)
"I'm based in Toronto" → provider (keyword)
"I do plumbing"        → provider (keyword)
"I offer electrical"   → provider (keyword)
```

### Needs Clarification ❓
```
"yes"                  → null (ambiguous)
"maybe"                → null (ambiguous)
"ok"                   → null (ambiguous)
```

## Database Records Created

### For Provider Registration
```
renovator_profiles table:
├─ user_id: 402995277
├─ user_type: 'provider'
├─ status: 'active'
├─ service_categories: ['plumbing', 'electrical']
├─ service_radius_km: 25
├─ availability_start: 2026-03-21
├─ hourly_rate_min: 50
├─ hourly_rate_max: 75
└─ response_time_hours: 4
```

### For Seeker Request
```
renovation_requests table:
├─ user_id: 402995277
├─ intent: 'renovation'
├─ emergency: false
├─ address: 'North York'
├─ city: 'North York'
├─ work_type: 'plumbing repair'
├─ timeline: 'flexible'
└─ status: 'open'

renovation_matches table:
├─ request_id: 1
├─ renovator_id: [matched renovator]
├─ customer_id: 402995277
├─ match_score: 85
├─ match_reason: 'Automated match'
└─ status: 'pending'
```

## Console Log Flow

### Successful Provider Registration
```
🏗️ generateRenovationResponse called for user 402995277
📊 Existing session: NO
🔍 Role detection: "I'm a renovator based on north York" → provider
✨ Creating NEW session with role: provider
📝 New session created with role: provider
👤 Current role: provider
❓ Questions for provider: services, serviceArea, availability, rateRange, responseTime
📊 Progress: 0/5 questions answered
💾 Saved answer for: services
❓ Asking question 1/5
```

### Successful Role Switch
```
🏗️ generateRenovationResponse called for user 402995277
📊 Existing session: YES
🔍 Role detection: "I'm looking for a renovator in north York" → seeker
🔄 ROLE CHANGED from provider to seeker, FORCE resetting session
✨ Session reset with new role: seeker
👤 Current role: seeker
❓ Questions for seeker: isEmergency, address, workType
📊 Progress: 0/3 questions answered
💾 Saved answer for: isEmergency
❓ Asking question 1/3
```

### City Detection
```
🏗️ generateRenovationResponse called for user 402995277
📊 Existing session: YES
🔍 Role detection: "North York" → seeker
👤 Current role: seeker
📊 Progress: 1/3 questions answered
💾 Saved answer for: address
❓ Asking question 2/3
```

---

## Summary of Changes

| Aspect | Before | After |
|--------|--------|-------|
| City detection | ❌ Not recognized | ✅ 20 cities recognized |
| Role switch | ❌ Kept old role | ✅ Resets with new role |
| Null role | ❌ Kept old role | ✅ Asks for clarification |
| Session reset | ❌ Partial | ✅ Complete (clears answers) |
| Error handling | ❌ Minimal | ✅ Robust |
| Logging | ⚠️ Basic | ✅ Comprehensive |

---

## Key Improvements

1. **City Detection** - Now recognizes "North York", "Toronto", etc.
2. **Session Reset** - Properly clears answers when role changes
3. **Error Handling** - Asks for clarification if role is unclear
4. **Code Quality** - Removed redundant checks, improved readability
5. **Debugging** - Better console logs for troubleshooting
