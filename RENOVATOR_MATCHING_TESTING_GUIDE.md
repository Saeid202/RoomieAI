# Renovator Matching System - Testing Guide

## Prerequisites

Before testing, ensure:

1. **Migration Applied**
   - Run: `supabase/migrations/20260365_renovator_matching_phase1.sql`
   - Verify tables exist: `renovation_requests`, `renovation_matches`, `renovator_profiles`
   - Verify functions exist: `calculate_renovation_match_score()`, `find_renovation_matches()`

2. **Environment Setup**
   - `homie-connect/.env` has correct `DATABASE_URL` with connection pooler
   - `TELEGRAM_BOT_TOKEN` is set
   - `GEMINI_API_KEY` is set
   - ngrok tunnel is running and forwarding to `http://localhost:3001`

3. **Services Running**
   - Telegram webhook URL configured: `https://[ngrok-url]/webhook/telegram`
   - homie-connect server running: `npm run dev`

---

## Test 1: Renovator Registration

### Objective
Test that a renovator can register and their profile is saved correctly.

### Steps

**1. Send Initial Message**
```
User Message: "Hi, I'm a renovator in North York and I'm ready to work"
```

**Expected Response:**
```
Bot: "What services do you specialize in? (e.g., plumbing, electrical, general, carpentry)"
```

**Verification:**
- Check logs: Should see "Route to generateRenovationResponse()"
- Check logs: Should see "detectRenovationRole() → 'provider'"
- Session created with `renovationRole = 'provider'`

---

**2. Answer Service Question**
```
User Message: "Plumbing and electrical"
```

**Expected Response:**
```
Bot: "What's your service area? (city or radius in km)"
```

**Verification:**
- Session updated with `answers.services = "Plumbing and electrical"`
- Progress: 1/5 questions answered

---

**3. Answer Service Area Question**
```
User Message: "North York, 25km radius"
```

**Expected Response:**
```
Bot: "When are you available to start? (ASAP, this week, this month)"
```

**Verification:**
- Session updated with `answers.serviceArea = "North York, 25km radius"`
- Progress: 2/5 questions answered

---

**4. Answer Availability Question**
```
User Message: "ASAP, I'm ready now"
```

**Expected Response:**
```
Bot: "What's your typical hourly rate range? (e.g., $50-75)"
```

**Verification:**
- Session updated with `answers.availability = "ASAP, I'm ready now"`
- Progress: 3/5 questions answered

---

**5. Answer Rate Question**
```
User Message: "$60-80 per hour"
```

**Expected Response:**
```
Bot: "How quickly can you respond to requests? (same day, 24hrs, 48hrs)"
```

**Verification:**
- Session updated with `answers.rateRange = "$60-80 per hour"`
- Progress: 4/5 questions answered

---

**6. Answer Response Time Question**
```
User Message: "Same day, I check messages regularly"
```

**Expected Response:**
```
Bot: "✅ You're now visible to customers in North York looking for plumbing, electrical. 
You'll get notified when someone matches!"
```

**Verification:**
- Session updated with `answers.responseTime = "Same day, I check messages regularly"`
- Progress: 5/5 questions answered ✅
- Check database:
  ```sql
  SELECT * FROM renovator_profiles WHERE user_id = [telegram_id];
  ```
  Should return:
  ```
  user_id: [telegram_id]
  user_type: 'provider'
  status: 'active'
  service_categories: ['plumbing', 'electrical']
  service_radius_km: 25
  availability_start: [today's date]
  hourly_rate_min: 60
  hourly_rate_max: 80
  response_time_hours: 4
  ```

---

## Test 2: Customer Request (Non-Emergency)

### Objective
Test that a customer can create a request and receive matches.

### Steps

**1. Send Initial Message**
```
User Message: "Hi, I'm looking for a renovator in North York"
```

**Expected Response:**
```
Bot: "Is this an emergency — active damage right now?"
```

**Verification:**
- Check logs: Should see "Route to generateRenovationResponse()"
- Check logs: Should see "detectRenovationRole() → 'seeker'"
- Session created with `renovationRole = 'seeker'`

---

**2. Answer Emergency Question**
```
User Message: "No, not emergency. My kitchen faucet is leaking but it's not urgent"
```

**Expected Response:**
```
Bot: "Which property address is this for?"
```

**Verification:**
- Session updated with `answers.isEmergency = "No, not emergency..."`
- Progress: 1/3 questions answered
- Emergency shortcut NOT triggered

---

**3. Answer Address Question**
```
User Message: "123 Main Street, North York, Ontario"
```

**Expected Response:**
```
Bot: "What type of work is needed?"
```

**Verification:**
- Session updated with `answers.address = "123 Main Street, North York, Ontario"`
- Progress: 2/3 questions answered

---

**4. Answer Work Type Question**
```
User Message: "Plumbing repair - kitchen faucet leak"
```

**Expected Response:**
```
Bot: "✅ Found 1 renovator!

Showing the top match below. Both sides confirm before contact details are shared."

🔧 [Renovator Name]
⭐ New • 0 jobs completed

📋 Services: plumbing, electrical
⏰ Available: Today
💰 $60-80/hr
⚡ Response: 4hrs

Match Score: 90/100

[✅ Connect] [❌ Skip]
```

**Verification:**
- Session updated with `answers.workType = "Plumbing repair - kitchen faucet leak"`
- Progress: 3/3 questions answered ✅
- Check database:
  ```sql
  SELECT * FROM renovation_requests WHERE user_id = [customer_telegram_id];
  ```
  Should return:
  ```
  user_id: [customer_telegram_id]
  intent: 'renovation'
  emergency: false
  address: '123 Main Street, North York, Ontario'
  city: 'North York'
  work_type: 'Plumbing repair - kitchen faucet leak'
  timeline: 'flexible'
  status: 'open'
  ```
- Check database:
  ```sql
  SELECT * FROM renovation_matches WHERE request_id = [request_id];
  ```
  Should return:
  ```
  request_id: [request_id]
  renovator_id: [renovator_telegram_id]
  customer_id: [customer_telegram_id]
  match_score: 90
  status: 'pending'
  customer_accepted: false
  renovator_accepted: false
  ```

---

## Test 3: Emergency Dispatch

### Objective
Test that emergency requests skip remaining questions and trigger immediate dispatch.

### Steps

**1. Send Initial Message**
```
User Message: "I need a renovator urgently"
```

**Expected Response:**
```
Bot: "Is this an emergency — active damage right now?"
```

---

**2. Answer Emergency Question with YES**
```
User Message: "Yes, my pipe burst and water is everywhere!"
```

**Expected Response:**
```
Bot: "🚨 Sending an emergency alert to 4 verified renovators near your property right now. 
You'll hear back within 15 minutes."
```

**Verification:**
- Check logs: Should see "Emergency shortcut triggered"
- Session should have `answers.isEmergency = "Yes, my pipe burst..."`
- matchReady signal should have `emergency: true`
- Request should be created with `emergency: true`
- Request should have `timeline: 'urgent'`
- No Q2 or Q3 asked (emergency shortcut skips them)

---

## Test 4: Match Acceptance (Double Opt-In)

### Objective
Test that matches require both parties to accept before contact details are revealed.

### Prerequisites
- Renovator registered (Test 1 completed)
- Customer request created with matches (Test 2 completed)

### Steps

**1. Customer Clicks "Connect" Button**
```
User: Clicks [✅ Connect] button on match card
```

**Expected Response:**
```
Bot: "Great! I've sent your request to the renovator. 
Waiting for them to confirm..."
```

**Verification:**
- Check database:
  ```sql
  SELECT * FROM renovation_matches WHERE request_id = [request_id];
  ```
  Should show:
  ```
  customer_accepted: true
  renovator_accepted: false
  status: 'pending'
  ```

---

**2. Renovator Receives Notification**
```
Bot (to renovator): "🎯 New Match!

Customer looking for: Plumbing repair - kitchen faucet leak
Location: North York

Your match score: 90/100

Accept this match?

[✅ Accept] [❌ Decline]"
```

---

**3. Renovator Clicks "Accept" Button**
```
User: Clicks [✅ Accept] button
```

**Expected Response (to Renovator):**
```
Bot: "✅ Match confirmed!

Customer has accepted your match.

Contact: +1-XXX-XXX-XXXX
Email: customer@example.com

Job: Plumbing repair - kitchen faucet leak
Location: 123 Main Street, North York"
```

**Expected Response (to Customer):**
```
Bot: "✅ Match confirmed!

Renovator Name has accepted your request.

Contact: +1-XXX-XXX-XXXX
Email: renovator@example.com

They'll reach out within 4 hours."
```

**Verification:**
- Check database:
  ```sql
  SELECT * FROM renovation_matches WHERE request_id = [request_id];
  ```
  Should show:
  ```
  customer_accepted: true
  renovator_accepted: true
  status: 'accepted_both'
  ```

---

## Test 5: No Matches Scenario

### Objective
Test that system gracefully handles when no matches are available.

### Steps

**1. Create Request for Specialized Service**
```
User: "I need a specialized HVAC technician in rural area"
```

**Expected Response:**
```
Bot: "I don't have a match right now, but I've saved your criteria. 
I'll notify you when someone joins who fits!"
```

**Verification:**
- Request created in database
- No matches created (because no HVAC specialists available)
- Request status: 'open'
- User should receive notification when matching renovator joins

---

## Test 6: Session Reset

### Objective
Test that users can reset their session and start over.

### Steps

**1. Send Reset Command**
```
User Message: "/reset"
```

**Expected Response:**
```
Bot: "Got it! Let's start fresh. What are you looking for today?"
```

**Verification:**
- Check logs: Should see "Session deleted"
- Session should be removed from session store
- Next message should start fresh conversation

---

## Test 7: Matching Algorithm Verification

### Objective
Verify that the matching algorithm correctly scores matches.

### Setup
Create multiple renovators with different profiles:

**Renovator A:**
- Services: plumbing, electrical
- City: North York
- Availability: ASAP
- Rating: 4.7 stars
- Expected score for plumbing request in North York: 100/100

**Renovator B:**
- Services: general
- City: Mississauga (15km away)
- Availability: Next month
- Rating: 3.5 stars
- Expected score for plumbing request in North York: ~35/100

**Renovator C:**
- Services: carpentry
- City: Toronto (30km away)
- Availability: This week
- Rating: 0 (new)
- Expected score for plumbing request in North York: ~5/100

### Steps

**1. Create Customer Request**
```
User: "I need plumbing repair in North York, not urgent"
```

**Expected Matches (in order):**
1. Renovator A - 100/100 ✅
2. Renovator B - ~35/100
3. Renovator C - ~5/100

**Verification:**
- Check database:
  ```sql
  SELECT * FROM renovation_matches 
  WHERE request_id = [request_id]
  ORDER BY match_score DESC;
  ```
  Should show scores in expected order

---

## Test 8: Database Integrity

### Objective
Verify that all database constraints and RLS policies are working.

### Steps

**1. Test RLS - Customer Can Only See Own Requests**
```sql
-- As customer user
SELECT * FROM renovation_requests;
-- Should only return requests where user_id = current_user_id
```

**2. Test RLS - Renovator Can Only See Own Matches**
```sql
-- As renovator user
SELECT * FROM renovation_matches;
-- Should only return matches where renovator_id = current_user_id
```

**3. Test Cascade Delete**
```sql
-- Delete a user
DELETE FROM auth.users WHERE id = [user_id];

-- Verify related records are deleted
SELECT * FROM renovator_profiles WHERE user_id = [user_id];
-- Should return 0 rows

SELECT * FROM renovation_requests WHERE user_id = [user_id];
-- Should return 0 rows
```

**4. Test Unique Constraint**
```sql
-- Try to create duplicate profile for same user
INSERT INTO renovator_profiles (user_id, user_type) 
VALUES ([existing_user_id], 'provider');
-- Should fail with unique constraint error
```

---

## Test 9: Performance Testing

### Objective
Verify that queries perform well with indexes.

### Steps

**1. Create 100 Renovators**
```sql
-- Insert 100 test renovators
INSERT INTO renovator_profiles (user_id, user_type, service_categories, city)
SELECT 
  gen_random_uuid(),
  'provider',
  ARRAY['plumbing', 'electrical'],
  'North York'
FROM generate_series(1, 100);
```

**2. Create 10 Requests**
```sql
-- Insert 10 test requests
INSERT INTO renovation_requests (user_id, city, work_type)
SELECT 
  gen_random_uuid(),
  'North York',
  'Plumbing repair'
FROM generate_series(1, 10);
```

**3. Measure Query Performance**
```sql
-- Time the match finding query
EXPLAIN ANALYZE
SELECT * FROM find_renovation_matches(
  (SELECT id FROM renovation_requests LIMIT 1), 
  3
);
```

**Expected Performance:**
- Query time: < 100ms
- Should use indexes on city, service_categories, status

---

## Test 10: Error Handling

### Objective
Verify that system handles errors gracefully.

### Steps

**1. Test Database Connection Error**
- Stop Supabase connection
- Send message to bot
- Expected: Error logged, user receives fallback message
- Expected: No crash

**2. Test Invalid Input**
```
User Message: [empty message]
```
- Expected: System handles gracefully

**3. Test Malformed Data**
```
User Message: "Rate: $abc-def per hour"
```
- Expected: System extracts what it can, uses defaults for invalid values

---

## Debugging Commands

### Check Session Status
```javascript
// In browser console or via API
const session = await getSession('telegram', userId);
console.log(session);
```

### Check Database State
```sql
-- View all renovators
SELECT user_id, user_type, service_categories, city FROM renovator_profiles;

-- View all requests
SELECT user_id, city, work_type, status FROM renovation_requests;

-- View all matches
SELECT request_id, renovator_id, customer_id, match_score, status FROM renovation_matches;

-- View specific match details
SELECT 
  rm.match_score,
  rp.service_categories,
  rr.work_type,
  rr.city
FROM renovation_matches rm
JOIN renovator_profiles rp ON rm.renovator_id = rp.user_id
JOIN renovation_requests rr ON rm.request_id = rr.id
WHERE rm.request_id = [request_id];
```

### Check Logs
```bash
# Terminal where homie-connect is running
npm run dev

# Look for:
# - "Route to generateRenovationResponse()"
# - "detectRenovationRole() → 'provider'" or "'seeker'"
# - "Emergency shortcut triggered"
# - "Found X renovation matches"
# - Any error messages
```

### Test Telegram Webhook
```bash
# Send test message to webhook
curl -X POST https://[ngrok-url]/webhook/telegram \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "from": {"id": 123456},
      "chat": {"id": 123456},
      "text": "Hi, I am a renovator"
    }
  }'
```

---

## Common Issues & Solutions

### Issue 1: "relation 'renovator_profiles' does not exist"
**Solution:**
- Run migration: `supabase/migrations/20260365_renovator_matching_phase1.sql`
- Verify in Supabase dashboard that tables exist

### Issue 2: Matches not found
**Solution:**
- Verify renovator has `user_type = 'provider'` and `status = 'active'`
- Verify renovator has `verified = true`
- Check that service categories match
- Check that city matches or distance is within radius

### Issue 3: Session not persisting
**Solution:**
- Check Redis connection
- Verify session store is working
- Check logs for session save errors

### Issue 4: Telegram messages not received
**Solution:**
- Verify ngrok tunnel is running
- Verify webhook URL is correct in Telegram bot settings
- Check logs for webhook errors
- Verify TELEGRAM_BOT_TOKEN is correct

### Issue 5: Gemini API errors
**Solution:**
- Verify GEMINI_API_KEY is correct
- Check API quota
- Verify API is enabled in Google Cloud Console

---

## Test Checklist

- [ ] Migration applied successfully
- [ ] All tables created
- [ ] All functions created
- [ ] All indexes created
- [ ] Renovator registration flow works (5 questions)
- [ ] Customer request flow works (3 questions)
- [ ] Emergency shortcut works
- [ ] Matches are found and scored correctly
- [ ] Double opt-in works
- [ ] Contact details revealed after both accept
- [ ] No matches scenario handled
- [ ] Session reset works
- [ ] RLS policies enforced
- [ ] Database constraints working
- [ ] Error handling graceful
- [ ] Performance acceptable (< 100ms queries)
- [ ] Telegram integration working
- [ ] Logs show expected messages

---

## Next Steps After Testing

1. **Monitor Logs**
   - Watch for errors in production
   - Track match success rates
   - Monitor response times

2. **Gather Feedback**
   - User experience feedback
   - Match quality feedback
   - Feature requests

3. **Optimize**
   - Adjust scoring algorithm based on feedback
   - Add more service categories
   - Improve geographic matching

4. **Enhance**
   - Add rating system
   - Add payment integration
   - Add chat system
   - Add job tracking

