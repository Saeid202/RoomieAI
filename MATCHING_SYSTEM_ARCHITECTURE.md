# Matching System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Telegram User                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Telegram Webhook Handler                        │
│         (homie-connect/src/handlers/telegram.js)            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Brain Service                               │
│         (homie-connect/src/services/brain.js)               │
│  - Detects RENOVATION intent                                │
│  - Routes to renovatorBrain                                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Renovator Brain Service                         │
│      (homie-connect/src/services/renovatorBrain.js)         │
│  - Detects provider vs seeker role                          │
│  - Manages conversation flow                                │
│  - Collects answers                                         │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
   PROVIDER          SEEKER           SESSION
   FLOW              FLOW             STORE
        │                │                │
        ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Build        │  │ Build        │  │ Redis/Memory │
│ Provider     │  │ Customer     │  │ Session      │
│ Profile      │  │ Request      │  │ Storage      │
└──────┬───────┘  └──────┬───────┘  └──────────────┘
       │                 │
       ▼                 ▼
┌─────────────────────────────────────────────────────────────┐
│         Renovator Matching Engine                            │
│  (homie-connect/src/services/renovatorMatchingEngine.js)    │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ updateProviderProfile()                              │  │
│  │  1. Cache in memory (IMMEDIATE) ✅                   │  │
│  │  2. Try database INSERT (may fail)                   │  │
│  │  3. Return success (cached or saved)                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ createRenovationRequest()                            │  │
│  │  1. Try database INSERT                              │  │
│  │  2. Return requestId (or null if fails)              │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ findRenovationMatches(requestId, limit, seekerData)  │  │
│  │  1. Try database query                               │  │
│  │  2. If fails, use in-memory cache                    │  │
│  │  3. Return matches (from DB or cache)                │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
   DATABASE         IN-MEMORY          FORMATTER
   (Supabase)       CACHE              SERVICE
        │                │                │
        │                │                ▼
        │                │         ┌──────────────┐
        │                │         │ Format       │
        │                │         │ Matches      │
        │                │         │ for Telegram │
        │                │         └──────┬───────┘
        │                │                │
        └────────────────┼────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Telegram Response                               │
│  - Match cards with ratings                                 │
│  - Accept/Skip/Decline buttons                              │
│  - Contact reveal on mutual acceptance                      │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow: Provider Registration

```
Provider: "I'm a renovator in North York"
    │
    ▼
detectRenovationRole() → "provider"
    │
    ▼
Create session with role: "provider"
    │
    ▼
Ask 5 questions:
  1. What services? → "General renovation"
  2. Service area? → "North York"
  3. Availability? → "Immediately"
  4. Rate range? → "50-100"
  5. Response time? → "24 hours"
    │
    ▼
buildProviderProfile() → {
  user_type: "provider",
  service_categories: ["General renovation"],
  city: "North York",
  service_radius_km: 25,
  availability_start: NOW,
  hourly_rate_min: 50,
  hourly_rate_max: 100,
  response_time_hours: 24
}
    │
    ▼
updateProviderProfile(userId, profileData)
    │
    ├─→ cacheProvider() → Stored in memory ✅
    │
    └─→ database INSERT (may timeout)
    │
    ▼
Response: "✅ You're now visible to customers..."
```

## Data Flow: Seeker Matching

```
Seeker: "I'm looking for a renovator in North York"
    │
    ▼
detectRenovationRole() → "seeker"
    │
    ▼
Create session with role: "seeker"
    │
    ▼
Ask 1 question:
  1. Where? → "I'm looking for a renovator in North York"
    │
    ▼
buildCustomerRequest() → {
  user_id: 402995277,
  intent: "renovation",
  address: "I'm looking for a renovator in North York",
  city: "North York",
  work_type: "General renovation",
  timeline: "flexible",
  status: "open"
}
    │
    ▼
cacheSeeker() → Stored in memory ✅
    │
    ▼
createRenovationRequest() → Try database INSERT
    │
    ├─→ Success: requestId = 123
    │
    └─→ Fail: requestId = null
    │
    ▼
findRenovationMatches(requestId, 3, seekerData)
    │
    ├─→ Try database query
    │   │
    │   ├─→ Success: Return DB matches
    │   │
    │   └─→ Fail: Fall back to cache
    │
    └─→ findCachedMatches(seekerData, 3)
        │
        ├─→ Loop through cached providers
        │
        ├─→ Calculate match score:
        │   - Location: 30 pts (North York = North York)
        │   - Services: 40 pts (General = General)
        │   - Availability: 20 pts (Available now)
        │   - Quality: 10 pts (Rating >= 4.5)
        │   = 100 pts total
        │
        └─→ Return top 3 matches
    │
    ▼
Response: "Found 1 great renovators..."
    │
    ▼
formatMatchesFound() → Display match cards
    │
    ▼
Telegram: Shows provider card with buttons
```

## In-Memory Cache Structure

```javascript
// Providers Map
Map {
  5819857900 → {
    userId: 5819857900,
    user_type: "provider",
    service_categories: ["General renovation"],
    city: "North York",
    service_radius_km: 25,
    availability_start: "2026-03-22T12:10:07.653Z",
    hourly_rate_min: 50,
    hourly_rate_max: 100,
    response_time_hours: 24,
    registeredAt: "2026-03-22T12:10:07.653Z"
  }
}

// Seekers Map
Map {
  402995277 → {
    userId: 402995277,
    intent: "renovation",
    address: "I'm looking for a renovator in North York",
    city: "North York",
    work_type: "General renovation",
    timeline: "flexible",
    status: "open",
    requestedAt: "2026-03-22T12:15:00.000Z"
  }
}
```

## Matching Algorithm

```javascript
function findCachedMatches(seekerData, limit = 3) {
  let matches = [];
  
  for (each provider in cache) {
    let score = 0;
    
    // Location match (30 points)
    if (provider.city === seeker.city) {
      score += 30;
    }
    
    // Service match (40 points)
    if (provider.services includes seeker.work_type) {
      score += 40;
    }
    
    // Availability (20 points)
    if (provider.availability_start <= now) {
      score += 20;
    }
    
    // Quality (10 points)
    if (provider.rating >= 4.5) {
      score += 10;
    }
    
    if (score > 0) {
      matches.push({ provider, score });
    }
  }
  
  // Sort by score and return top N
  return matches.sort((a, b) => b.score - a.score).slice(0, limit);
}
```

## Error Handling Strategy

```
Database Operation
    │
    ├─→ Success ✅
    │   └─→ Return result
    │
    └─→ Timeout/Error ❌
        │
        ├─→ For Provider: Cache in memory, return success
        │
        └─→ For Seeker: Fall back to in-memory cache
            │
            ├─→ Cache has matches: Return cached matches ✅
            │
            └─→ Cache empty: Return "no matches" message
```

## Session Management

```
Session = {
  channel: "telegram",
  userId: 402995277,
  intent: "RENOVATION",
  renovationRole: "seeker",  // NEW: tracks provider vs seeker
  answers: {
    address: "I'm looking for a renovator in North York",
    city: "North York",
    work_type: "General renovation",
    timeline: "flexible"
  },
  conversation: [
    { role: "user", content: "I'm looking for a renovator..." },
    { role: "assistant", content: "Where are you located?" }
  ],
  messageCount: 2,
  createdAt: "2026-03-22T12:00:00.000Z",
  lastActive: "2026-03-22T12:15:00.000Z"
}
```

## Key Improvements

1. **Instant Caching**: Providers cached immediately, no wait for database
2. **Graceful Fallback**: Seeker matching works even if database is down
3. **No User Errors**: System handles failures transparently
4. **Dual Storage**: Data in both cache and database when possible
5. **Automatic Recovery**: Uses database when it comes back online

## Testing Endpoints

```bash
# Health check
curl http://localhost:3001/health

# Database connection test
curl http://localhost:3001/test-db

# View database data
curl http://localhost:3001/test-renovators

# View in-memory cache
curl http://localhost:3001/test-cache
```
