# Renovator Matching - Role Detection Fix

## Problem Identified

When a user switched roles (e.g., first registering as a renovator, then later saying "I'm looking for a renovator in North York"), the bot would:

1. **Fail to detect the new role** - "North York" alone didn't match any seeker keywords
2. **Keep the old role** - Session would persist with `role: 'provider'`
3. **Ask wrong questions** - Bot would continue asking provider questions instead of seeker questions

### Root Cause

The `detectRenovationRole()` function had incomplete address pattern detection:
- It checked for street suffixes (street, ave, rd, etc.)
- It checked for numeric addresses (123 Main St)
- **BUT** it didn't check for city names like "North York", "Toronto", etc.

When a user answered with just a city name, the function returned `null`, and the session logic would keep the existing role.

## Solution Implemented

### 1. Enhanced City Detection in `renovatorMatchingEngine.js`

Added a comprehensive list of Canadian cities to the role detection:

```javascript
// Check for known Canadian cities (common seeker responses for address question)
const cities = [
  'toronto', 'north york', 'mississauga', 'brampton', 'scarborough',
  'etobicoke', 'markham', 'richmond hill', 'vaughan', 'pickering',
  'ajax', 'whitby', 'oshawa', 'hamilton', 'london', 'windsor',
  'vancouver', 'calgary', 'edmonton', 'montreal', 'ottawa',
];

if (cities.some(city => lower.includes(city))) {
  return 'seeker';
}
```

Now when a user says "North York", it's correctly detected as a seeker response.

### 2. Improved Session Reset Logic in `renovatorBrain.js`

Made the session reset more robust:

- **Early role check**: If no role is detected and no session exists, ask for clarification immediately
- **Cleaner flow**: Removed redundant role checks
- **Better logging**: Added explicit logging when no role is detected

```javascript
if (!role) {
  // Still no role - ask for clarification
  console.log(`❌ No role detected and no existing role, asking for clarification`);
  const clarification = "Are you a renovator looking to find customers, or a customer looking for a renovator?";
  session.conversation.push({ role: 'assistant', content: clarification });
  await saveSession(channel, userId, session);
  return {
    responseText: clarification,
    matchReady: null,
  };
}
```

## Testing the Fix

### Scenario 1: Same User, Different Roles (with `/reset`)

1. User says: "I'm a renovator based on North York"
   - ✅ Detected as: `provider`
   - ✅ Asked: Provider questions (services, area, availability, rate, response time)

2. User says: `/reset`
   - ✅ Session cleared

3. User says: "I'm looking for a renovator in North York"
   - ✅ Detected as: `seeker` (matches "looking for")
   - ✅ Asked: Seeker questions (emergency, address, work type)

### Scenario 2: City-Only Response

1. User says: "I'm looking for a renovator"
   - ✅ Detected as: `seeker`
   - ✅ Asked: "Is this an emergency?"

2. User says: "North York"
   - ✅ Detected as: `seeker` (matches city name)
   - ✅ Saved as address answer
   - ✅ Asked: "What type of work is needed?"

### Scenario 3: Address Variations

All of these should now be detected as seeker responses:
- "North York" ✅
- "123 Main Street" ✅
- "Toronto" ✅
- "Mississauga" ✅
- "1234 Blvd" ✅

## Files Modified

1. **`homie-connect/src/services/renovatorMatchingEngine.js`**
   - Enhanced `detectRenovationRole()` with city name detection

2. **`homie-connect/src/services/renovatorBrain.js`**
   - Improved session reset logic
   - Better handling of null role detection
   - Cleaner flow control

## How to Test

1. Start the bot: `npm run dev` in `homie-connect/`
2. Test with Telegram:
   - `/start` to begin
   - Say: "I'm a renovator based on North York"
   - Complete provider registration
   - Say: `/reset` to clear session
   - Say: "I'm looking for a renovator in North York"
   - Should now ask seeker questions instead of provider questions

## Expected Behavior After Fix

| User Input | Detected Role | Action |
|-----------|---------------|--------|
| "I'm a renovator" | provider | Ask provider questions |
| "I'm looking for a renovator" | seeker | Ask seeker questions |
| "North York" (after seeker detected) | seeker | Save as address, ask next question |
| "Toronto" (after seeker detected) | seeker | Save as address, ask next question |
| "123 Main St" | seeker | Save as address, ask next question |
| "I need help with plumbing" | seeker | Ask seeker questions |

## Debug Logging

The system now logs:
- Role detection result: `🔍 Role detection: "..." → provider/seeker/null`
- Session state: `📊 Existing session: YES/NO`
- Role changes: `🔄 ROLE CHANGED from provider to seeker`
- Progress: `📊 Progress: 1/5 questions answered`

Use these logs to verify the fix is working correctly.
