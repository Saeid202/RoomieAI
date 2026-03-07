# 🎯 Test PAD Payment NOW - Step by Step

## ✅ PROBLEM SOLVED!

The error was caused by using fake bank numbers. Stripe validates institution/transit numbers even in test mode.

---

## 🚀 Quick Test (5 Minutes)

### Step 1: Open Your App
```
http://localhost:3000
```

### Step 2: Navigate to Payments
```
Dashboard → Tenant Payments → Digital Wallet
```

### Step 3: Click "Connect Bank Account"

### Step 4: Fill in the Form

```
┌─────────────────────────────────────────────┐
│ Account Holder Name                         │
│ ┌─────────────────────────────────────────┐ │
│ │ Test User                               │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Bank Name (Optional)                        │
│ ┌─────────────────────────────────────────┐ │
│ │ Toronto-Dominion Bank (TD)              │ │ ← Select from dropdown
│ └─────────────────────────────────────────┘ │
│                                             │
│ Institution Number *                        │
│ ┌─────────────────────────────────────────┐ │
│ │ 004                                     │ │ ← Auto-filled
│ └─────────────────────────────────────────┘ │
│                                             │
│ Transit Number *                            │
│ ┌─────────────────────────────────────────┐ │
│ │ 10012                                   │ │ ← Type this
│ └─────────────────────────────────────────┘ │
│                                             │
│ Account Number *                            │
│ ┌─────────────────────────────────────────┐ │
│ │ 1234567                                 │ │ ← Type this
│ └─────────────────────────────────────────┘ │
│                                             │
│ ☑ I authorize Pre-Authorized Debit         │ ← Check this
│                                             │
│ [Connect Bank Account]                      │ ← Click this
└─────────────────────────────────────────────┘
```

### Step 5: See Success! ✅

You should see:
```
✅ Bank account connected successfully!
```

---

## 📋 Copy-Paste Values

Just copy and paste these:

```
Account Holder Name: Test User
Institution Number: 004
Transit Number: 10012
Account Number: 1234567
```

---

## 🎨 Alternative Test Numbers

If you want to try different banks:

### RBC (Royal Bank)
```
Institution: 003
Transit: 00102
Account: 1234567
```

### Scotiabank
```
Institution: 002
Transit: 00102
Account: 1234567
```

### BMO (Bank of Montreal)
```
Institution: 001
Transit: 00102
Account: 1234567
```

---

## ✅ What Should Happen

1. **Form submits successfully** (no validation errors)
2. **Success toast appears** ("Bank account connected successfully!")
3. **Screen changes** to confirmation view
4. **Bank details shown** (last 4 digits: 4567)
5. **Payment method created** in Stripe dashboard

---

## 🔍 Verify in Stripe Dashboard

1. Go to: https://dashboard.stripe.com/test/customers
2. Find your test customer
3. Click on the customer
4. Go to "Payment methods" tab
5. You should see: "ACSS Debit •••• 4567"

---

## ❌ If You Still Get Errors

### Error: "Invalid institution/transit numbers"
**Solution**: Make sure you're using the exact numbers above (004/10012/1234567)

### Error: "Function error" or 500
**Solution**: Check Stripe secret key is set:
```bash
supabase secrets list --project-ref bjesofgfbuyzjamyliys
```

### Error: "Failed to create payment method"
**Solution**: Check function logs:
```bash
supabase functions logs create-pad-payment-method --project-ref bjesofgfbuyzjamyliys
```

---

## 🎯 Why These Numbers Work

| Number | Type | Validation |
|--------|------|------------|
| 004 | Institution | ✅ Real TD Bank code |
| 10012 | Transit | ✅ Real TD branch code |
| 1234567 | Account | ⚠️ Fake (OK in test mode) |

Stripe checks institution/transit against Canadian bank database, but doesn't verify account numbers in test mode.

---

## 🚀 After Successful Connection

You can now:
1. ✅ Make test rent payments
2. ✅ See payment history
3. ✅ Test payment flows
4. ✅ Verify webhooks
5. ✅ Check Stripe dashboard

---

## 📚 Documentation Updated

All guides now have correct test numbers:
- ✅ `STRIPE_SETUP_GUIDE.md`
- ✅ `PAD_PAYMENT_TROUBLESHOOTING.md`
- ✅ `PAD_PAYMENT_FIX_REAL_BANK_NUMBERS.md`

---

## 💡 Remember

### For Testing (Now)
- ✅ Use TEST Stripe keys
- ✅ Use REAL institution/transit
- ✅ Use FAKE account number
- ✅ No real money

### For Production (Later)
- ⚠️ Use LIVE Stripe keys
- ⚠️ Use REAL bank details
- ⚠️ Real money transfers
- ⚠️ Requires verification

---

**Ready to test?** Just use: **004 / 10012 / 1234567** ✅

---

**Last Updated**: March 7, 2026  
**Status**: Ready to test immediately
