# Quick Test Guide - Renovator Matching Role Detection Fix

## What Was Fixed

The bot now correctly detects when a user switches from renovator (provider) to customer (seeker) role, even when they just say a city name like "North York".

## Quick Test (5 minutes)

### Prerequisites
- homie-connect running: `npm run dev`
- ngrok tunnel active
- Telegram bot configured

### Test Steps

#### Test 1: Provider Registration
```
You: /start
Bot: [greeting]

You: I'm a renovator based on North York
Bot: What services do you specialize in?

You: plumbing and electrical
Bot: What's your service area?

You: North York, 25km radius
Bot: When are you available to start?

You: ASAP
Bot: What's your typical hourly rate range?

You: $50-75
Bot: How quickly can you respond to requests?

You: same day
Bot: ✅ You're now visible to customers...
```

#### Test 2: Role Switch (Same User)
```
You: /reset
Bot: Session cleared

You: I'm looking for a renovator in North York
Bot: Is this an emergency?

You: no
Bot: Which property address is this for?

You: North York
Bot: What type of work is needed?

You: plumbing repair
Bot: Found X renovators in your area...
```

#### Test 3: City-Only Response
```
You: /start
Bot: [greeting]

You: I need help with my kitchen
Bot: Is this an emergency?

You: no
Bot: Which property address is this for?

You: Toronto
Bot: ✅ Detected as seeker (city name)
Bot: What type of work is needed?
```

## What to Look For

### In Console Logs
```
🔍 Role detection: "North York" → seeker  ✅ (should be 'seeker', not 'null')
🔄 ROLE CHANGED from provider to seeker   ✅ (should show role switch)
📊 Progress: 1/3 questions answered       ✅ (should be seeker questions, not provider)
```

### In Bot Responses
- ✅ Provider questions: services, area, availability, rate, response time
- ✅ Seeker questions: emergency, address, work type
- ✅ Bot should NOT ask provider questions when user is a seeker

## Common Issues & Solutions

### Issue: Bot still asks "When are you available to work?" after role switch
**Solution**: Make sure you ran `/reset` between role switches, or use a different Telegram account

### Issue: "North York" not detected as seeker
**Solution**: Check console logs for role detection. If showing `null`, the city name might not be in the list. Add it to `renovatorMatchingEngine.js`

### Issue: Session not clearing on role change
**Solution**: Check that `deleteSession()` is being called. Look for `🔄 ROLE CHANGED` in logs

## Success Criteria

✅ User can register as renovator  
✅ User can switch to seeker role (with `/reset`)  
✅ City names are detected as seeker responses  
✅ Bot asks correct questions for each role  
✅ No syntax errors in console  

## Next Steps

Once this test passes:
1. Test with TWO different Telegram accounts (one renovator, one customer)
2. Verify matches are found and displayed correctly
3. Test the double opt-in flow (both sides confirm)
4. Test emergency dispatch flow
