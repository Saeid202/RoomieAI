# Instant Matching - Quick Reference Card

## What It Does
When a customer provides enough info in ONE message, the bot immediately shows renovators without asking questions.

---

## Examples That Trigger Instant Matching ⚡

```
"I need a plumber in North York"
"Looking for an electrician in Toronto for repairs"
"I'm looking for a renovator in Mississauga for a burst pipe"
"Emergency - burst pipe in Vancouver, need plumber ASAP"
"Need a carpenter in Calgary for renovations"
```

---

## Examples That Fall Back to Multi-Turn ❌

```
"I need a renovator" (missing location)
"North York" (missing work type)
"Plumbing" (missing location)
"I'm looking for someone" (too vague)
```

---

## How to Test

### Test 1: Instant Match
```
You: "I'm looking for a plumber in North York for a burst pipe"
Bot: "Found 3 great renovators in North York..."
✅ No questions asked!
```

### Test 2: Fallback
```
You: "I need a renovator"
Bot: "Is this an emergency?"
✅ Falls back to multi-turn
```

### Test 3: Emergency
```
You: "Burst pipe in Toronto, need emergency plumber!"
Bot: "Found 3 great renovators in Toronto..."
✅ Emergency flag set, urgent matches shown
```

---

## Supported Locations

**Ontario**: Toronto, North York, Mississauga, Brampton, Scarborough, Etobicoke, Markham, Richmond Hill, Vaughan, Pickering, Ajax, Whitby, Oshawa, Hamilton, London, Windsor

**Western Canada**: Vancouver, Calgary, Edmonton

**Eastern Canada**: Montreal, Ottawa

---

## Supported Work Types

| Type | Keywords |
|------|----------|
| Plumbing | plumb, pipe, leak, burst |
| Electrical | electric, wire, outlet |
| Carpentry | carpen, wood, frame |
| General | general, renovation, renovator |
| HVAC | hvac, heating, cooling |
| Roofing | roof, shingle |
| Painting | paint |
| Tiling | tile |

---

## Emergency Keywords

Any of these trigger emergency mode:
- emergency, urgent, burst, leak, damage, broken, asap, now, immediately

---

## Server Commands

```bash
# Start server
cd homie-connect
npm run dev

# Kill existing process
Get-Process -Name node | Stop-Process -Force

# Check if running
netstat -ano | findstr :3001
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Bot asks questions instead of instant matching | Message missing location or work type |
| Database timeout error | Restart server: `npm run dev` |
| Bot not responding | Check server logs for errors |
| Port 3001 in use | Kill process: `Get-Process -Name node \| Stop-Process -Force` |

---

## Key Files

- `homie-connect/src/services/renovatorBrain.js` - Main logic
- `homie-connect/src/services/renovatorMatchingEngine.js` - Matching engine
- `homie-connect/src/handlers/telegram.js` - Telegram handler

---

## Logging

Look for these in server logs:

```
⚡ INSTANT MATCHING detected - extracting data from single message
⚡ Found 3 instant matches
```

Or fallback:
```
⚡ Instant matching error: [error]
❓ Asking question 1/3
```

---

## Performance

- **Before**: 5-6 messages, ~30 seconds
- **After**: 1-2 messages, ~5 seconds ⚡

---

## Next Steps

1. Test with two different Telegram accounts
2. Monitor server logs for patterns
3. Adjust keywords based on real usage
4. Consider AI-powered parsing for even better results

---

**Status**: ✅ Live and ready to test!
