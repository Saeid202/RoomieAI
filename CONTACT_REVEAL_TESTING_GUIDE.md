# Contact Reveal Testing Guide

## Prerequisites
- Two separate Telegram accounts (or use a test bot account)
- homie-connect running: `npm run dev`
- ngrok tunnel active and configured
- Telegram bot token configured in `.env`

## Test Scenario: Complete Double Opt-In Flow

### Step 1: Register Renovator (Account A)
1. Open Telegram with Account A
2. Send `/start` to the bot
3. Send: "I'm a renovator based in North York and my phone number is 416-882-5015"
4. Bot should respond with registration confirmation
5. **Expected**: Account A is now registered as a renovator

### Step 2: Request Renovation (Account B)
1. Open Telegram with Account B
2. Send `/start` to the bot
3. Send: "I need a renovator in North York"
4. Bot should find Account A as a match
5. **Expected**: Account B sees renovator card with "Connect" and "Skip" buttons

### Step 3: Customer Accepts (Account B)
1. Account B clicks "Connect" button
2. **Expected**: 
   - Account B sees: "Great! You've accepted this match. The renovator will be notified..."
   - Account A receives: "🎉 New Match! A customer has accepted your match!" with Accept/Decline buttons

### Step 4: Renovator Accepts (Account A)
1. Account A clicks "Accept" button
2. **Expected**:
   - Account A receives contact details:
     ```
     🎉 Match Confirmed!
     The customer has accepted your match!
     
     Customer Details:
     👤 [Customer Name]
     📍 Location: North York
     📱 Phone: [Customer Phone]
     📧 Email: [Customer Email]
     
     💬 You can now contact them directly...
     ```
   - Account B receives contact details:
     ```
     🎉 Match Confirmed!
     The renovator has accepted your match!
     
     Renovator Details:
     👤 [Renovator Name]
     ⭐ Rating: [Rating]/5
     🔧 Services: [Services]
     📱 Phone: 416-882-5015
     📧 Email: [Renovator Email]
     
     💬 You can now contact them directly...
     ```

### Step 5: Verify Contact Exchange
- Account A can see Account B's contact info
- Account B can see Account A's contact info
- Both can now communicate directly

## Test Scenario: Renovator Declines

### Step 1-3: Same as above (Customer accepts)

### Step 4: Renovator Declines (Account A)
1. Account A clicks "Decline" button
2. **Expected**:
   - Account A sees: "❌ Declined. Let me know if you'd like to see other options!"
   - Account B receives: "⏭️ The renovator isn't available for this project. Let me find you another match!"

## Test Scenario: Renovator Waits

### Step 1-3: Same as above (Customer accepts)

### Step 4: Renovator Accepts but Customer Hasn't Yet
1. Account A clicks "Accept" button
2. **Expected**:
   - Account A sees: "✅ Perfect! You've accepted this match. ⏳ Waiting for the customer to confirm..."
   - Account B still sees the match card (hasn't clicked anything yet)

### Step 5: Customer Accepts Later
1. Account B clicks "Connect" button
2. **Expected**:
   - Both parties now receive contact details

## Debugging

### Check Cache Contents
```bash
curl http://localhost:3001/test-cache
```

Expected output shows:
- Providers (renovators) with their details
- Seekers (customers) with their requests

### Check Database
```bash
# Connect to Supabase
# Query: SELECT * FROM renovation_match_acceptances;
```

Should show records with:
- `customer_accepted` and `renovator_accepted` flags
- `both_accepted_at` timestamp when both accepted

### Check Logs
Look for messages like:
- `✅ Customer [ID] accepting renovator [ID]`
- `✅ Renovator [ID] accepting customer [ID]`
- `🎉 Both parties accepted! Exchanging contact details`
- `✅ Contact details exchanged between [ID] and [ID]`

## Common Issues

### Issue: Renovator doesn't receive notification
**Solution**: 
- Check that renovator ID is correctly extracted from button callback
- Verify renovator is in cache with correct user ID
- Check Telegram bot token is valid

### Issue: Contact details not showing
**Solution**:
- Verify both parties are in cache (check `/test-cache`)
- Check that phone number is properly extracted from renovator profile
- Look for error logs about contact retrieval

### Issue: "Waiting for customer" message doesn't change
**Solution**:
- Verify customer clicked "Connect" button (should record acceptance)
- Check database for `renovation_match_acceptances` record
- Verify `customer_accepted` flag is TRUE

### Issue: Button callbacks not working
**Solution**:
- Verify button callback data format: `reno_action:requestId_renovatorId`
- Check that `request_id` is included in `matchReady.answers`
- Verify `handleRenovationButton` is being called (check logs)

## Success Criteria

✅ Customer can click "Connect" and see confirmation
✅ Renovator receives notification with Accept/Decline buttons
✅ Renovator can click "Accept" and see confirmation
✅ Both parties receive each other's contact details
✅ Contact details include name, phone, email, and relevant info
✅ Renovator can click "Decline" and customer is notified
✅ System handles waiting state correctly

## Performance Notes

- Contact details are retrieved from in-memory cache (fast)
- Database queries for customer ID lookup should be quick
- No external API calls needed for contact exchange
- All messages sent via Telegram API (standard latency)
