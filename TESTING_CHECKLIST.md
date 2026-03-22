# Testing Checklist: Instant Matching System

## Pre-Testing Setup

- [ ] Server is running: `npm run dev` in `homie-connect` directory
- [ ] ngrok tunnel is active: `ngrok http 3001`
- [ ] Telegram bot token is set in `.env`
- [ ] Two different Telegram accounts available
- [ ] Terminal is open to view logs

## Provider Registration Test

### Account 1: Register as Provider

- [ ] Send `/start` command to bot
- [ ] Send: `I'm a renovator in North York`
- [ ] Bot asks: "What services do you offer?"
  - [ ] Send: `General renovation`
- [ ] Bot asks: "What area do you service?"
  - [ ] Send: `North York`
- [ ] Bot asks: "When are you available?"
  - [ ] Send: `Immediately`
- [ ] Bot asks: "What's your hourly rate?"
  - [ ] Send: `50-100`
- [ ] Bot asks: "How quickly do you respond?"
  - [ ] Send: `24 hours`
- [ ] Bot responds: "✅ You're now visible to customers..."
  - [ ] Verify message received

### Check Logs for Provider Caching

- [ ] Look for: `💾 Caching provider [USER_ID] in memory`
- [ ] Look for: `📊 Total providers in cache: 1`
- [ ] Look for: `✅ Provider profile saved: true` (or false if DB timeout)

### Verify Provider in Cache

```bash
curl http://localhost:3001/test-cache
```

- [ ] Response status: `"status": "ok"`
- [ ] Cache stats: `"providersCount": 1`
- [ ] Provider data shows:
  - [ ] `"city": "North York"`
  - [ ] `"service_categories": ["General renovation"]`
  - [ ] `"service_radius_km": 25`
  - [ ] `"hourly_rate_min": 50`
  - [ ] `"hourly_rate_max": 100`

## Seeker Matching Test

### Account 2: Search as Seeker

- [ ] Send `/start` command to bot
- [ ] Send: `I'm looking for a renovator in North York`
- [ ] Bot asks: "Where are you located?"
  - [ ] Send: `I'm looking for a renovator in North York`
- [ ] Bot responds: "Found 1 great renovators..."
  - [ ] Verify message received
  - [ ] Verify match card is displayed

### Check Logs for Seeker Caching

- [ ] Look for: `💾 Caching seeker request [USER_ID] in memory`
- [ ] Look for: `📊 Total seekers in cache: 1`
- [ ] Look for: `🔍 Finding cached matches for seeker in North York`
- [ ] Look for: `✅ Found 1 cached matches (score: 70)`

### Verify Seeker in Cache

```bash
curl http://localhost:3001/test-cache
```

- [ ] Response status: `"status": "ok"`
- [ ] Cache stats: `"seekersCount": 1`
- [ ] Seeker data shows:
  - [ ] `"city": "North York"`
  - [ ] `"work_type": "General renovation"`
  - [ ] `"status": "open"`

## Match Display Test

### Verify Match Card

- [ ] Match card shows provider information
- [ ] Match card shows rating (if available)
- [ ] Match card shows services
- [ ] Match card shows rate range
- [ ] Match card has buttons: Accept, Skip, Decline

### Verify Match Score

- [ ] Expected score: 70 points
  - [ ] Location match: 30 pts (North York = North York)
  - [ ] Service match: 40 pts (General = General)
  - [ ] Availability: 0 pts (not immediately available)
  - [ ] Quality: 0 pts (no rating yet)

## Database Timeout Handling

### Verify Graceful Fallback

- [ ] Check logs for: `Query error` or `Connection terminated`
- [ ] Verify user still sees matches (from cache)
- [ ] Verify no error messages shown to user
- [ ] Verify system continues working

### Verify Cache is Used

- [ ] Look for: `⚠️ Database query failed, trying in-memory cache...`
- [ ] Look for: `✅ Found X matches from in-memory cache`

## Edge Cases

### Test 1: Same City, Different Services

- [ ] Provider: "Plumber in North York"
- [ ] Seeker: "Looking for electrician in North York"
- [ ] Expected: No match (different services)
- [ ] Verify: Seeker sees "No matches right now"

### Test 2: Same Service, Different City

- [ ] Provider: "General renovation in Toronto"
- [ ] Seeker: "Looking for renovator in North York"
- [ ] Expected: No match (different cities)
- [ ] Verify: Seeker sees "No matches right now"

### Test 3: Multiple Providers

- [ ] Register 3 providers in different cities
- [ ] Seeker searches in one city
- [ ] Expected: Only matches from that city
- [ ] Verify: Top 3 matches returned (or fewer if not enough)

### Test 4: Emergency Request

- [ ] Seeker: "Emergency! Roof leak in North York"
- [ ] Expected: Emergency flag set
- [ ] Verify: Different response message

## Performance Tests

### Test 1: Response Time

- [ ] Provider registration: < 5 seconds
- [ ] Seeker search: < 2 seconds
- [ ] Match display: Instant

### Test 2: Cache Endpoint

```bash
curl http://localhost:3001/test-cache
```

- [ ] Response time: < 1 second
- [ ] Shows all cached data

## Cleanup Tests

### Test 1: Reset Session

- [ ] Send `/reset` command
- [ ] Verify session is cleared
- [ ] Verify can start fresh conversation

### Test 2: Clear Cache (Manual)

- [ ] Restart server: `npm run dev`
- [ ] Verify cache is empty
- [ ] Verify `/test-cache` shows 0 providers/seekers

## Integration Tests

### Test 1: Full Flow

- [ ] Provider registers
- [ ] Seeker searches
- [ ] Match found
- [ ] Both users see results
- [ ] Cache shows both users

### Test 2: Multiple Matches

- [ ] Register 5 providers
- [ ] Seeker searches
- [ ] Expected: Top 3 matches returned
- [ ] Verify: Sorted by score

### Test 3: Concurrent Users

- [ ] Multiple providers register simultaneously
- [ ] Multiple seekers search simultaneously
- [ ] Expected: All matches found correctly
- [ ] Verify: No race conditions

## Verification Endpoints

### Health Check
```bash
curl http://localhost:3001/health
```
- [ ] Response: `{"status":"ok","service":"homie-connect"}`

### Database Connection
```bash
curl http://localhost:3001/test-db
```
- [ ] Response: `{"status":"ok","message":"Database connection successful"}`
- [ ] Or: `{"status":"error","message":"Database connection failed"}` (expected if Supabase is down)

### Cache Status
```bash
curl http://localhost:3001/test-cache
```
- [ ] Response: Shows cache contents

### Database Data
```bash
curl http://localhost:3001/test-renovators
```
- [ ] Response: Shows database data (if available)

## Final Verification

- [ ] ✅ Provider registration works
- [ ] ✅ Seeker search works
- [ ] ✅ Matches are found
- [ ] ✅ Cache is populated
- [ ] ✅ Fallback works (even if DB times out)
- [ ] ✅ No user-facing errors
- [ ] ✅ Logs show cache usage
- [ ] ✅ All endpoints respond correctly

## Sign-Off

- [ ] All tests passed
- [ ] System is ready for production
- [ ] Documentation is complete
- [ ] Logs are clear and helpful

---

**Test Date**: _______________

**Tester**: _______________

**Status**: ✅ READY / ❌ NEEDS FIXES

**Notes**: _______________________________________________
