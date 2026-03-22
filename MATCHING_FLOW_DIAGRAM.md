# Matching Flow Diagram

## Provider Registration Flow

```
┌─────────────────────────────────────────────────────────────┐
│ Provider: "I'm a renovator in North York"                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │ detectRenovationRole()     │
        │ → "provider"               │
        └────────────┬───────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │ Create session             │
        │ role: "provider"           │
        └────────────┬───────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │ Ask 5 questions:           │
        │ 1. Services                │
        │ 2. Service area            │
        │ 3. Availability            │
        │ 4. Rate range              │
        │ 5. Response time           │
        └────────────┬───────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │ buildProviderProfile()     │
        │ → Profile object           │
        └────────────┬───────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │ updateProviderProfile()    │
        └────────────┬───────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
   ┌─────────────┐          ┌──────────────┐
   │ cacheProvider()        │ Database     │
   │ → In memory ✅         │ INSERT       │
   │ IMMEDIATE              │ (may timeout)│
   └─────────────┘          └──────────────┘
        │                         │
        └────────────┬────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │ Response:                  │
        │ "✅ You're now visible..." │
        └────────────────────────────┘
```

## Seeker Matching Flow

```
┌─────────────────────────────────────────────────────────────┐
│ Seeker: "I'm looking for a renovator in North York"         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │ detectRenovationRole()     │
        │ → "seeker"                 │
        └────────────┬───────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │ Create session             │
        │ role: "seeker"             │
        └────────────┬───────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │ Ask 1 question:            │
        │ Where are you located?     │
        └────────────┬───────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │ buildCustomerRequest()     │
        │ → Request object           │
        └────────────┬───────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │ cacheSeeker()              │
        │ → In memory ✅             │
        └────────────┬───────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │ createRenovationRequest()  │
        │ → Try database INSERT      │
        └────────────┬───────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
   ┌─────────────┐          ┌──────────────┐
   │ Success     │          │ Fail/Timeout │
   │ requestId   │          │ requestId=null
   └──────┬──────┘          └──────┬───────┘
          │                        │
          └────────────┬───────────┘
                       │
                       ▼
        ┌────────────────────────────────┐
        │ findRenovationMatches()        │
        │ (requestId, 3, seekerData)     │
        └────────────┬───────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
   ┌──────────────┐          ┌──────────────┐
   │ Try Database │          │ Database     │
   │ Query        │          │ Timeout      │
   └──────┬───────┘          └──────┬───────┘
          │                         │
          ├─ Success ✅             │
          │  Return DB matches      │
          │                         │
          └─ Fail ❌                │
             │                      │
             └──────────┬───────────┘
                        │
                        ▼
        ┌────────────────────────────────┐
        │ findCachedMatches()            │
        │ (seekerData, 3)                │
        │ → Search in-memory cache       │
        └────────────┬───────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
   ┌─────────────┐          ┌──────────────┐
   │ Matches     │          │ No matches   │
   │ found ✅    │          │ in cache     │
   └──────┬──────┘          └──────┬───────┘
          │                        │
          └────────────┬───────────┘
                       │
                       ▼
        ┌────────────────────────────┐
        │ Response:                  │
        │ "Found X renovators..."    │
        │ or                         │
        │ "No matches right now..."  │
        └────────────────────────────┘
```

## Matching Algorithm Flow

```
┌─────────────────────────────────────────────────────────────┐
│ findCachedMatches(seekerData, limit=3)                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │ For each provider in cache │
        └────────────┬───────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │ Calculate match score      │
        └────────────┬───────────────┘
                     │
        ┌────────────┴────────────────────────────┐
        │                                         │
        ▼                                         ▼
   ┌──────────────┐                      ┌──────────────┐
   │ Location     │                      │ Service      │
   │ Match        │                      │ Match        │
   │              │                      │              │
   │ City ==      │                      │ Services     │
   │ City?        │                      │ includes     │
   │              │                      │ work_type?   │
   │ +30 pts      │                      │              │
   │              │                      │ +40 pts      │
   └──────────────┘                      └──────────────┘
        │                                         │
        └────────────┬────────────────────────────┘
                     │
        ┌────────────┴────────────────────────────┐
        │                                         │
        ▼                                         ▼
   ┌──────────────┐                      ┌──────────────┐
   │ Availability │                      │ Quality      │
   │ Match        │                      │ Match        │
   │              │                      │              │
   │ Available    │                      │ Rating       │
   │ now?         │                      │ >= 4.5?      │
   │              │                      │              │
   │ +20 pts      │                      │ +10 pts      │
   └──────────────┘                      └──────────────┘
        │                                         │
        └────────────┬────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │ Total Score                │
        │ (0-100 points)             │
        └────────────┬───────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │ Add to matches list        │
        │ if score > 0               │
        └────────────┬───────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │ Sort by score (descending) │
        └────────────┬───────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │ Return top N matches       │
        │ (default: 3)               │
        └────────────────────────────┘
```

## Cache Storage Structure

```
┌─────────────────────────────────────────────────────────────┐
│ In-Memory Cache                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Providers Map                                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Key: 5819857900 (User ID)                                   │
│ Value: {                                                     │
│   userId: 5819857900,                                       │
│   user_type: "provider",                                    │
│   service_categories: ["General renovation"],               │
│   city: "North York",                                       │
│   service_radius_km: 25,                                    │
│   availability_start: "2026-03-22T12:10:07.653Z",          │
│   hourly_rate_min: 50,                                      │
│   hourly_rate_max: 100,                                     │
│   response_time_hours: 24,                                  │
│   registeredAt: "2026-03-22T12:10:07.653Z"                 │
│ }                                                            │
│                                                              │
│ Key: 123456789 (Another Provider)                           │
│ Value: { ... }                                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Seekers Map                                                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Key: 402995277 (User ID)                                    │
│ Value: {                                                     │
│   userId: 402995277,                                        │
│   intent: "renovation",                                     │
│   address: "I'm looking for a renovator in North York",    │
│   city: "North York",                                       │
│   work_type: "General renovation",                          │
│   timeline: "flexible",                                     │
│   status: "open",                                           │
│   requestedAt: "2026-03-22T12:15:00.000Z"                  │
│ }                                                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────┐
│ Database Operation                                           │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
   ┌─────────────┐          ┌──────────────┐
   │ Success ✅  │          │ Timeout ❌   │
   │             │          │              │
   │ Return      │          │ Catch error  │
   │ result      │          │              │
   └─────────────┘          └──────┬───────┘
        │                          │
        │                          ▼
        │                  ┌──────────────────┐
        │                  │ For Provider:    │
        │                  │ Already cached   │
        │                  │ Return success   │
        │                  └──────────────────┘
        │                          │
        │                  ┌──────────────────┐
        │                  │ For Seeker:      │
        │                  │ Use fallback     │
        │                  │ matching         │
        │                  └──────────────────┘
        │                          │
        └────────────┬─────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │ Return result to user      │
        │ (from DB or cache)         │
        └────────────────────────────┘
```

## Timeline: Provider → Seeker → Match

```
Time    Provider                    Seeker                  System
────────────────────────────────────────────────────────────────────

T0      Sends message
        "I'm a renovator..."
                                                            Detects: provider
                                                            Creates session

T1      Answers Q1: Services
                                                            Saves answer

T2      Answers Q2: Area
                                                            Saves answer

T3      Answers Q3: Availability
                                                            Saves answer

T4      Answers Q4: Rate
                                                            Saves answer

T5      Answers Q5: Response time
                                                            Builds profile
                                                            Caches in memory ✅
                                                            Tries DB (timeout)
                                                            Returns success

T6      Sees: "You're visible..."
                                                            
T7                                  Sends message
                                    "Looking for renovator..."
                                                            Detects: seeker
                                                            Creates session

T8                                  Provides location
                                                            Caches seeker ✅
                                                            Tries DB (timeout)
                                                            Falls back to cache
                                                            Finds provider ✅

T9                                  Sees: "Found 1..."
                                                            
────────────────────────────────────────────────────────────────────
                                    MATCH FOUND ✅
```

## Success Indicators

```
✅ Provider Registration
   └─ Logs: "💾 Caching provider X in memory"
   └─ Logs: "📊 Total providers in cache: 1"
   └─ User sees: "You're now visible..."

✅ Seeker Search
   └─ Logs: "💾 Caching seeker request X in memory"
   └─ Logs: "🔍 Finding cached matches for seeker in North York"
   └─ Logs: "✅ Found 1 cached matches (score: 70)"
   └─ User sees: "Found 1 great renovators..."

✅ Cache Endpoint
   └─ curl http://localhost:3001/test-cache
   └─ Shows: providersCount: 1, seekersCount: 1
   └─ Shows: Both users in cache
```
