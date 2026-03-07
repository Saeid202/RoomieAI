# 🎯 USE THESE EXACT NUMBERS

## ✅ FINAL WORKING TEST NUMBERS

```
Account Holder Name: Test User
Bank Name: Toronto-Dominion Bank (TD)
Institution Number: 004
Transit Number: 10012
Account Number: 000123456789
```

## 📋 Copy & Paste

Just copy these three numbers:

```
004
10012
000123456789
```

## ✅ Why These Work

| Number | What It Is | Why It's Required |
|--------|------------|-------------------|
| 004 | Real TD Bank code | Stripe validates against Canadian bank database |
| 10012 | Real TD branch code | Stripe validates against Canadian bank database |
| 000123456789 | Stripe test account | Stripe requires test account number in test mode |

## 🚀 Quick Test (2 Minutes)

1. **Open**: http://localhost:3000
2. **Go to**: Dashboard → Tenant Payments → Digital Wallet
3. **Click**: "Connect Bank Account"
4. **Select**: "Toronto-Dominion Bank (TD)" from dropdown
5. **Institution**: 004 (auto-filled)
6. **Transit**: 10012
7. **Account**: 000123456789
8. **Check**: "I authorize Pre-Authorized Debit"
9. **Click**: "Connect Bank Account"

## ✅ Success!

You should see:
```
✅ Bank account connected successfully!
```

And in Stripe dashboard:
```
ACSS Debit •••• 6789
```

## 🎨 Alternative Banks (Same Account Number)

All use account: **000123456789**

### RBC
```
Institution: 003
Transit: 00102
Account: 000123456789
```

### Scotiabank
```
Institution: 002
Transit: 00102
Account: 000123456789
```

### BMO
```
Institution: 001
Transit: 00102
Account: 000123456789
```

### CIBC
```
Institution: 010
Transit: 00102
Account: 000123456789
```

## 📚 Other Valid Stripe Test Accounts

From Stripe docs, these also work:

```
000123456789  ← Recommended
000111111116
000222222227
000333333338
000444444449
000555555550
```

All must be combined with real institution/transit numbers.

## ❌ What Doesn't Work

### Wrong Account Numbers
```
❌ 1234567 - Not a Stripe test account
❌ 0001234567 - Wrong format
❌ 123456789 - Too short
```

### Wrong Institution/Transit
```
❌ 000/00000 - Not real Canadian bank codes
❌ 999/99999 - Not real Canadian bank codes
```

## 🔍 Error Messages Explained

### "Invalid institution/transit numbers"
**Cause**: Using fake bank codes (000/00000)  
**Solution**: Use real codes (004/10012)

### "You must use a test bank account number"
**Cause**: Using random account number (1234567)  
**Solution**: Use Stripe test account (000123456789)

## 📞 Still Having Issues?

### Check Your Stripe Keys
Make sure you're using TEST keys:
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### Check Supabase Secret
```bash
supabase secrets list --project-ref bjesofgfbuyzjamyliys
```
Should show: `STRIPE_SECRET_KEY`

### Check Function Logs
```bash
supabase functions logs create-pad-payment-method --project-ref bjesofgfbuyzjamyliys
```

## 💡 Remember

This is for **TESTING ONLY**. In production, you'll use:
- Real institution/transit (same as test)
- Real customer account numbers (not test numbers)
- Live Stripe keys (pk_live_... / sk_live_...)

---

**JUST USE**: 004 / 10012 / 000123456789 ✅

---

**Last Updated**: March 7, 2026  
**Status**: READY TO TEST NOW
