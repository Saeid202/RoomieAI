# Renovator Matching System - Testing Checklist

## Pre-Test Setup
- ✅ Server running on port 3001
- ✅ ngrok tunnel active
- ✅ Telegram bot token configured
- ✅ Gemini API key configured
- ✅ Database connection working
- ✅ Two different Telegram accounts ready (one for renovator, one for customer)

---

## Test Scenarios

### Scenario 1: Customer Looking for Renovator (Seeker Flow)
**Account**: Customer Account (different from renovator)

**Steps**:
1. Send `/start` to bot
2. Send: "I'm looking for a renovator in North York"
3. Bot should ask: "Is this an emergency — active damage right now?"
4. Send: "No, just some repairs"
5. Bot should ask: "Which property address is this for?"
6. Send: "North York"
7. Bot should ask: "What type of work is needed?"
8. Send: "Plumbing repairs"
9. Bot should respond: "Found X great renovators in your area..."

**Expected Behavior**:
- ✅ Role detected as 'seeker' immediately
- ✅ Asked 3 seeker questions (not provider questions)
- ✅ Matches found and displayed
- ✅ No errors or crashes

**Actual Result**: _______________

---

### Scenario 2: Renovator Registration (Provider Flow)
**Account**: Renovator Account (different from customer)

**Steps**:
1. Send `/start` to bot
2. Send: "I'm a renovator based in North York"
3. Bot should ask: "What services do you specialize in?"
4. Send: "Plumbing and electrical"
5. Bot should ask: "What's your service area?"
6. Send: "North York, 25km radius"
7. Bot should ask: "When are you available to start?"
8. Send: "ASAP"
9. Bot should ask: "What's your typical hourly rate range?"
10. Send: "$50-75"
11. Bot should ask: "How quickly can you respond to requests?"
12. Send: "Same day"
13. Bot should respond: "✅ You're now visible to customers..."

**Expected Behavior**:
- ✅ Role detected as 'provider' immediately
- ✅ Asked 5 provider questions (not seeker questions)
- ✅ Profile saved to database
- ✅ No errors or crashes

**Actual Result**: _______________

---

### Scenario 3: Location-Only Response (Ambiguous Message)
**Account**: Customer Account

**Steps**:
1. Send `/reset`
2. Send: "I need a renovator"
3. Bot asks: "Is this an emergency?"
4. Send: "North York"
5. Bot should recognize "North York" as address and ask: "What type of work is needed?"

**Expected Behavior**:
- ✅ "North York" recognized as address (not provider indicator)
- ✅ Continues with seeker flow
- ✅ Does NOT ask provider questions

**Actual Result**: _______________

---

### Scenario 4: Emergency Dispatch
**Account**: Customer Account

**Steps**:
1. Send `/reset`
2. Send: "I need a renovator"
3. Bot asks: "Is this an emergency?"
4. Send: "Yes, pipe burst!"
5. Bot should respond: "🚨 Sending an emergency alert to 4 verified renovators..."

**Expected Behavior**:
- ✅ Emergency detected immediately
- ✅ Skips remaining questions
- ✅ Sends emergency alert
- ✅ No errors or crashes

**Actual Result**: _______________

---

### Scenario 5: Error Handling
**Account**: Any account

**Steps**:
1. Send `/reset`
2. Simulate error by sending malformed data or triggering database error
3. Bot should respond: "I'm having trouble processing that. Can you try again?"

**Expected Behavior**:
- ✅ Graceful error handling
- ✅ No undefined errors
- ✅ User-friendly fallback message
- ✅ No server crashes

**Actual Result**: _______________

---

### Scenario 6: Role Switching (Same Account)
**Account**: Any account

**Steps**:
1. Send `/reset`
2. Send: "I'm a renovator in North York"
3. Bot asks provider questions
4. Send `/reset`
5. Send: "I'm looking for a renovator"
6. Bot should ask seeker questions (not provider questions)

**Expected Behavior**:
- ✅ Session properly reset
- ✅ Role correctly switched
- ✅ No leftover data from previous role
- ✅ Correct questions asked

**Actual Result**: _______________

---

## Bug Report Template

If you find an issue, please document:

**Bug Title**: _______________

**Steps to Reproduce**:
1. _______________
2. _______________
3. _______________

**Expected Behavior**: _______________

**Actual Behavior**: _______________

**Error Message** (if any): _______________

**Account Type** (renovator/customer): _______________

**Timestamp**: _______________

---

## Summary

**Total Tests**: 6
**Passed**: _____ / 6
**Failed**: _____ / 6

**Critical Issues Found**: _______________

**Minor Issues Found**: _______________

**Overall Status**: ✅ READY / ⚠️ NEEDS FIXES / ❌ BLOCKED
