# Renovator Matching System - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Two different Telegram accounts (one for testing renovator, one for customer)
- Telegram bot already configured with HomieAI
- Server running on port 3001
- ngrok tunnel active

### Start the Server
```bash
cd homie-connect
npm run dev
```

Expected output:
```
Homie Connect server running on port 3001
Environment: development
```

---

## 📱 Testing with Telegram

### Account 1: Renovator (Provider)
1. Open Telegram
2. Search for HomieAI bot
3. Send `/start`
4. Send: `I'm a renovator in North York`
5. Answer the 5 questions:
   - Services: `Plumbing and electrical`
   - Service area: `North York, 25km`
   - Availability: `ASAP`
   - Rate: `$50-75`
   - Response time: `Same day`
6. Bot confirms: `✅ You're now visible to customers...`

### Account 2: Customer (Seeker)
1. Open Telegram
2. Search for HomieAI bot
3. Send `/start`
4. Send: `I'm looking for a renovator in North York`
5. Answer the 3 questions:
   - Emergency: `No`
   - Address: `North York`
   - Work type: `Plumbing repairs`
6. Bot shows: `Found X great renovators...`

---

## 🔧 Troubleshooting

### Issue: Bot asks wrong questions
**Solution**: Send `/reset` to clear session, then try again

### Issue: "North York" not recognized
**Solution**: Try "North York, Ontario" or "123 Main St, North York"

### Issue: Server won't start
**Solution**: 
```bash
# Kill existing process
Get-Process -Name node | Stop-Process -Force

# Restart
npm run dev
```

### Issue: Port 3001 already in use
**Solution**:
```bash
# Find and kill process on port 3001
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

---

## 📊 Monitoring

### Check Server Logs
The server logs all interactions:
- 🔍 Role detection
- 📊 Session status
- 💾 Answer saving
- ✅ Match finding

### Database Queries
Check Supabase dashboard:
- `renovator_profiles` - Registered renovators
- `renovation_requests` - Customer requests
- `renovation_matches` - Connections

---

## 🎯 Key Features

### Role Detection
- **Provider**: "I'm a renovator", "I'm a plumber", "I do electrical work"
- **Seeker**: "I need a renovator", "Looking for a plumber", "North York" (when answering address)

### Emergency Dispatch
- User: "Is this an emergency?"
- User: "Yes, burst pipe!"
- Bot: "🚨 Sending emergency alert..."
- Skips remaining questions

### Match Display
Shows renovator card with:
- Name and rating
- Services offered
- Hourly rate range
- Availability
- Match score

---

## 📝 Common Commands

| Command | Effect |
|---------|--------|
| `/start` | Start conversation |
| `/reset` | Clear session and start over |
| `North York` | Recognized as location/address |
| `Yes` / `No` | Recognized as boolean answers |
| `ASAP` | Recognized as availability |
| `$50-75` | Recognized as rate range |

---

## 🐛 Debug Mode

All functions have comprehensive logging. Look for:
- 🔍 `Role detection: "..." → provider/seeker/null`
- 📊 `Progress: X/Y questions answered`
- 💾 `Saved answer for: <key>`
- ✅ `All questions answered for <role>`
- 🎯 `Found X renovation matches`

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `RENOVATOR_MATCHING_FIXES_APPLIED.md` | Details of fixes applied |
| `RENOVATOR_MATCHING_TESTING_CHECKLIST.md` | Comprehensive test scenarios |
| `INSTANT_MATCHING_FEATURE_PROPOSAL.md` | Future enhancement proposal |
| `RENOVATOR_MATCHING_CURRENT_STATUS.md` | Full system status report |
| `QUICK_START_GUIDE.md` | This file |

---

## ✅ Verification Checklist

Before testing, verify:
- [ ] Server running on port 3001
- [ ] ngrok tunnel active
- [ ] Telegram bot token configured
- [ ] Gemini API key configured
- [ ] Database connection working
- [ ] Two different Telegram accounts ready

---

## 🎓 Example Conversations

### Example 1: Renovator Registration
```
User: I'm a renovator in North York
Bot: What services do you specialize in?
User: Plumbing and electrical
Bot: What's your service area?
User: North York, 25km
Bot: When are you available to start?
User: ASAP
Bot: What's your typical hourly rate range?
User: $50-75
Bot: How quickly can you respond to requests?
User: Same day
Bot: ✅ You're now visible to customers...
```

### Example 2: Customer Matching
```
User: I'm looking for a renovator in North York
Bot: Is this an emergency?
User: No, just repairs
Bot: Which property address is this for?
User: North York
Bot: What type of work is needed?
User: Plumbing repairs
Bot: Found 3 great renovators in your area...
[Shows match cards with buttons]
```

### Example 3: Emergency
```
User: I need a renovator
Bot: Is this an emergency?
User: Yes, burst pipe!
Bot: 🚨 Sending emergency alert to 4 verified renovators...
```

---

## 🚨 Emergency Contacts

If system is down:
1. Check server logs: `npm run dev`
2. Check database connection
3. Check Telegram bot token
4. Check ngrok tunnel status
5. Restart server: `npm run dev`

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the comprehensive documentation files
3. Check server logs for error messages
4. Verify all environment variables are set

---

## 🎉 You're Ready!

The renovator matching system is now operational. Start testing with your Telegram accounts and refer to the testing checklist for comprehensive scenarios.

Good luck! 🚀
