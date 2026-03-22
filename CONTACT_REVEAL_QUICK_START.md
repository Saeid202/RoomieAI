# Contact Reveal - Quick Start

## What's New?
When a customer and renovator both accept a match, they now receive each other's contact details via Telegram and can chat directly.

## How to Test

### Setup
```bash
cd homie-connect
npm run dev
```

### Test Flow (Use 2 Telegram Accounts)

**Account A (Renovator)**:
1. Send: `/start`
2. Send: `I'm a renovator in North York, phone 416-882-5015`
3. Wait for confirmation

**Account B (Customer)**:
1. Send: `/start`
2. Send: `I need a renovator in North York`
3. See renovator match with "Connect" button
4. Click "Connect"
5. See: "Great! Waiting for renovator..."

**Account A (Renovator)**:
1. Receive notification: "New Match! A customer accepted..."
2. See "Accept" and "Decline" buttons
3. Click "Accept"
4. Receive customer's contact details

**Account B (Customer)**:
1. Receive renovator's contact details
2. Can now call/email the renovator

## What Happens

### Customer Clicks "Connect"
- ✅ Customer acceptance recorded
- ✅ Renovator gets notified
- ✅ Customer sees "Waiting..." message

### Renovator Clicks "Accept"
- ✅ Renovator acceptance recorded
- ✅ Both parties receive contact details
- ✅ They can now chat directly

### Renovator Clicks "Decline"
- ✅ Customer is notified
- ✅ Customer can find another match

## Contact Details Shared

**Customer Receives**:
- Renovator name
- Rating
- Services
- Phone
- Email

**Renovator Receives**:
- Customer name
- Location
- Phone
- Email

## Files Changed

1. `homie-connect/src/handlers/telegram.js` - Button handling
2. `homie-connect/src/services/renovatorBrain.js` - Include request_id
3. `homie-connect/src/services/renovationMatchAcceptance.js` - NEW service
4. `supabase/migrations/20260371_renovation_match_tracking.sql` - NEW migration

## Debugging

**Check cache**:
```bash
curl http://localhost:3001/test-cache
```

**Check logs**:
- Look for: `✅ Customer [ID] accepting renovator [ID]`
- Look for: `🎉 Both parties accepted! Exchanging contact details`

**Common Issues**:
- Renovator not notified? Check if renovator ID is in cache
- Contact details not showing? Check if both parties in cache
- Button not working? Check browser console for errors

## Next Steps

1. Test with 2 accounts
2. Verify contact details are exchanged
3. Confirm both can chat directly
4. Report any issues

---

**Ready to test?** Start the server and try it out!
