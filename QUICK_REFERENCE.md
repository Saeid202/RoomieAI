# Quick Reference: Instant Matching System

## Start Server
```bash
cd homie-connect
npm run dev
```

## Test Endpoints

### Health Check
```bash
curl http://localhost:3001/health
```

### Database Connection
```bash
curl http://localhost:3001/test-db
```

### View Cache
```bash
curl http://localhost:3001/test-cache
```

### View Database Data
```bash
curl http://localhost:3001/test-renovators
```

## Telegram Commands

### Start Bot
```
/start
```

### Reset Session
```
/reset
```

## Test Scenarios

### Provider Registration
1. Send: `I'm a renovator in North York`
2. Answer 5 questions
3. Expected: "✅ You're now visible..."

### Seeker Search
1. Send: `I'm looking for a renovator in North York`
2. Expected: "Found 1 great renovators..."

## Key Files

| File | Purpose |
|------|---------|
| `inMemoryMatchingCache.js` | In-memory storage and matching |
| `renovatorMatchingEngine.js` | Matching engine with fallback |
| `renovatorBrain.js` | Conversation logic |
| `index.js` | Express server and endpoints |

## Matching Score

| Factor | Points |
|--------|--------|
| Location match | 30 |
| Service match | 40 |
| Availability | 20 |
| Quality (rating) | 10 |
| **Total** | **100** |

## Cache Functions

```javascript
// Store provider
cacheProvider(userId, profileData)

// Store seeker
cacheSeeker(userId, requestData)

// Find matches
findCachedMatches(seekerData, limit)

// Get stats
getCacheStats()

// Get providers
getCachedProviders()

// Get seekers
getCachedSeekers()

// Clear cache
clearAllCaches()
```

## Logs to Monitor

| Log | Meaning |
|-----|---------|
| `💾 Caching provider` | Provider stored in memory |
| `💾 Caching seeker` | Seeker stored in memory |
| `🔍 Finding cached matches` | Searching cache |
| `✅ Found X cached matches` | Matches found in cache |
| `⚠️ Database query failed` | Database timeout, using cache |
| `Query error` | Database error occurred |

## Troubleshooting

| Issue | Solution |
|-------|----------|
| No matches found | Check cache endpoint, verify city names match |
| Database timeout | Expected, system falls back to cache |
| Cache is empty | Restart server, re-register users |
| No response from bot | Check ngrok tunnel is running |
| Wrong matches | Check service categories and cities |

## Cache Endpoint Response

```json
{
  "status": "ok",
  "cache": {
    "stats": {
      "providersCount": 1,
      "seekersCount": 1,
      "providers": [5819857900],
      "seekers": [402995277]
    },
    "providers": [
      {
        "userId": 5819857900,
        "service_categories": ["General renovation"],
        "city": "North York",
        "service_radius_km": 25,
        "hourly_rate_min": 50,
        "hourly_rate_max": 100
      }
    ],
    "seekers": [
      {
        "userId": 402995277,
        "city": "North York",
        "work_type": "General renovation",
        "status": "open"
      }
    ]
  }
}
```

## Success Indicators

✅ Provider sees: "You're now visible..."
✅ Seeker sees: "Found X great renovators..."
✅ Cache endpoint shows both users
✅ Logs show cache messages
✅ No error messages to users

## Performance Targets

| Operation | Target |
|-----------|--------|
| Provider registration | < 5 seconds |
| Seeker search | < 2 seconds |
| Match display | Instant |
| Cache endpoint | < 1 second |

## Database vs Cache

| Aspect | Database | Cache |
|--------|----------|-------|
| Speed | Slow (may timeout) | Instant |
| Persistence | Permanent | Session only |
| Reliability | May fail | Always works |
| Fallback | None | Used when DB fails |

## Session Flow

```
User sends message
    ↓
Detect role (provider/seeker)
    ↓
Create/load session
    ↓
Collect answers
    ↓
Cache data
    ↓
Try database
    ↓
If fails: Use cache
    ↓
Return matches
    ↓
Display to user
```

## Common Messages

| Scenario | Message |
|----------|---------|
| Provider registered | "✅ You're now visible to customers..." |
| Matches found | "Found X great renovators..." |
| No matches | "I don't have a match right now..." |
| Database error | "I'm having trouble saving your request..." |
| Emergency | "🚨 Sending emergency alert..." |

## Debug Commands

```bash
# View all providers in cache
curl http://localhost:3001/test-cache | jq '.cache.providers'

# View all seekers in cache
curl http://localhost:3001/test-cache | jq '.cache.seekers'

# View cache stats
curl http://localhost:3001/test-cache | jq '.cache.stats'

# View database data
curl http://localhost:3001/test-renovators | jq '.renovators'
```

## Environment Variables

```bash
PORT=3001
GEMINI_API_KEY=...
TELEGRAM_BOT_TOKEN=...
DATABASE_URL="postgresql://postgres:Mycity2025$@..."
NODE_ENV=development
```

## Important Notes

- Use TWO different Telegram accounts for testing
- Database URL must be quoted in .env (special character handling)
- Cache is in-memory only (lost on restart)
- Fallback is automatic (no code changes needed)
- System works even if Supabase is down

## Documentation Files

1. `START_HERE_INSTANT_MATCHING.md` - Start here
2. `INSTANT_MATCHING_WITH_FALLBACK.md` - Technical details
3. `MATCHING_SYSTEM_ARCHITECTURE.md` - System design
4. `MATCHING_FLOW_DIAGRAM.md` - Visual diagrams
5. `TESTING_CHECKLIST.md` - Testing steps
6. `SOLUTION_COMPLETE.md` - Full summary

---

**Last Updated**: March 22, 2026
**Status**: ✅ Ready for Testing
