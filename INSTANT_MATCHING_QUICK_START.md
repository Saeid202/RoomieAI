# Quick Start: Testing Instant Matching with Fallback

## Prerequisites
- ngrok tunnel running and configured
- Telegram bot token set in `.env`
- Two different Telegram accounts for testing

## Step 1: Start the Server
```bash
cd homie-connect
npm run dev
```

You should see:
```
🔧 DATABASE_URL: postgresql://postgres:Mycity2025$@...
Connected to HomieAI PostgreSQL database
Server running on port 3001
```

## Step 2: Verify ngrok is Running
```bash
# In another terminal
ngrok http 3001
```

You should see the tunnel URL (e.g., `https://unrumoured-ayden-unpolishable.ngrok-free.dev`)

## Step 3: Test with Telegram

### Account 1 (Provider)
1. Open Telegram
2. Message the bot: `/start`
3. Send: `I'm a renovator in North York`
4. Answer the 5 questions:
   - Services: `General renovation`
   - Service area: `North York`
   - Availability: `Immediately`
   - Rate: `50-100`
   - Response time: `24 hours`

**Expected**: ✅ "You're now visible to customers..."

### Account 2 (Seeker)
1. Open Telegram
2. Message the bot: `/start`
3. Send: `I'm looking for a renovator in North York`

**Expected**: ✅ "Found 1 great renovators..."

## Step 4: Check the Cache
```bash
curl http://localhost:3001/test-cache
```

**Expected Response**:
```json
{
  "status": "ok",
  "cache": {
    "stats": {
      "providersCount": 1,
      "seekersCount": 1,
      "providers": [ACCOUNT1_ID],
      "seekers": [ACCOUNT2_ID]
    },
    "providers": [
      {
        "userId": ACCOUNT1_ID,
        "service_categories": ["General renovation"],
        "city": "North York",
        ...
      }
    ]
  }
}
```

## Troubleshooting

### No matches found
1. Check cache: `curl http://localhost:3001/test-cache`
2. Verify both users are in cache
3. Check city names match exactly (case-insensitive)
4. Check service categories include "General" or match exactly

### Database timeout errors in logs
- This is expected and normal
- System automatically falls back to in-memory cache
- Matches should still be found

### Cache is empty
- Restart the server: `npm run dev`
- Re-register provider and seeker
- Cache is in-memory only (lost on restart)

## How to Know It's Working

### Logs to Look For
```
💾 Caching provider 5819857900 in memory
📊 Total providers in cache: 1

💾 Caching seeker request 402995277 in memory
🔍 Finding cached matches for seeker in North York
✅ Found 1 cached matches (score: 70)
```

### Success Indicators
1. ✅ Provider gets confirmation message
2. ✅ Seeker gets match notification
3. ✅ `/test-cache` shows both users
4. ✅ Logs show "Found X cached matches"

## What's Different from Before

**Before**: Database timeouts → No matches found ❌

**Now**: 
- Database timeouts → Falls back to cache → Matches found ✅
- Instant matching even during Supabase downtime
- No user-facing errors

## Next: Database Recovery
When Supabase comes back online:
1. New registrations will save to database
2. In-memory cache continues working
3. System uses database when available
4. Restart server to clear cache and sync with database
