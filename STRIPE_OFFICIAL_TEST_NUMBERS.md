# ✅ STRIPE OFFICIAL TEST NUMBERS FOR ACSS DEBIT

## 🎯 THE CORRECT TEST NUMBERS (From Stripe Docs)

According to [Stripe's official ACSS Debit documentation](https://docs.stripe.com/payments/acss-debit/accept-a-payment):

```
Institution Number: 000
Transit Number: 11000
Account Number: 000123456789
```

## 📋 Copy & Paste These Exact Values

```
Account Holder Name: Test User
Institution Number: 000
Transit Number: 11000
Account Number: 000123456789
```

## 🚀 Test It Now

1. **Open**: http://localhost:3000
2. **Go to**: Dashboard → Tenant Payments → Digital Wallet
3. **Click**: "Connect Bank Account"
4. **Fill in**:
   - Account Holder Name: Test User
   - Bank Name: (Leave blank or select any)
   - Institution Number: 000
   - Transit Number: 11000
   - Account Number: 000123456789
5. **Check**: "I authorize Pre-Authorized Debit"
6. **Click**: "Connect Bank Account"

## ✅ Expected Result

```
✅ Bank account connected successfully!
```

## 📚 All Official Stripe Test Numbers

From Stripe documentation:

| Institution | Transit | Account | Scenario |
|-------------|---------|---------|----------|
| 000 | 11000 | 000123456789 | Succeeds immediately after verification |
| 000 | 11009 | 000123456789 | Succeeds with 3-minute delay |
| 000 | 11000 | 000222222227 | Fails immediately after verification |
| 000 | 11009 | 000222222227 | Fails with 3-minute delay |
| 000 | 11000 | 000666666661 | Fails to send verification micro-deposits |
| 000 | 11000 | 000777777771 | Fails due to weekly payment volume limit |
| 000 | 11000 | 000888888881 | Fails due to transaction limit exceeded |

## 🎨 Test Payment Method Tokens (Alternative)

Instead of entering bank details, you can use these tokens directly in API calls:

```
pm_acssDebit_success - Payment succeeds
pm_acssDebit_noAccount - Payment fails (no account)
pm_acssDebit_accountClosed - Payment fails (account closed)
pm_acssDebit_insufficientFunds - Payment fails (insufficient funds)
pm_acssDebit_debitNotAuthorized - Payment fails (debits not authorized)
pm_acssDebit_dispute - Payment succeeds but triggers dispute
```

## 🔍 Why Previous Numbers Didn't Work

### What We Tried (Didn't Work)
```
❌ Institution: 004, Transit: 10012 - Real TD Bank codes
   Error: "Invalid institution/transit numbers"
   
❌ Institution: 004, Transit: 10012, Account: 000123456789
   Error: "Invalid institution/transit numbers"
```

### Why It Failed
Stripe's test mode doesn't accept real Canadian bank codes. It only accepts the special test codes (000/11000) documented in their testing guide.

## 💡 Important Notes

### For Testing (Now)
- ✅ Use Stripe test codes: 000/11000/000123456789
- ✅ Use TEST Stripe keys (pk_test_... / sk_test_...)
- ✅ No real money transferred
- ✅ Instant verification in test mode

### For Production (Later)
- ✅ Use REAL Canadian bank codes (004, 003, 002, etc.)
- ✅ Use REAL customer account numbers
- ✅ Use LIVE Stripe keys (pk_live_... / sk_live_...)
- ⚠️ Real money transfers
- ⚠️ 1-2 day micro-deposit verification

## 🆘 If Still Having Issues

### Check Stripe Secret Key
```bash
supabase secrets list --project-ref bjesofgfbuyzjamyliys
```
Should show: `STRIPE_SECRET_KEY`

### Check Function Logs
```bash
supabase functions logs create-pad-payment-method --project-ref bjesofgfbuyzjamyliys
```

### Test with Stripe CLI
```bash
stripe payment_methods create \
  --type acss_debit \
  --acss-debit[account_number]=000123456789 \
  --acss-debit[institution_number]=000 \
  --acss-debit[transit_number]=11000 \
  --billing-details[name]="Test User"
```

## 📊 What We Learned

1. **Test Mode**: Stripe uses special test codes (000/11000)
2. **Live Mode**: Stripe uses real Canadian bank codes (004, 003, 002, etc.)
3. **Don't Mix**: Can't use real bank codes in test mode
4. **Documentation**: Always check official Stripe docs for test numbers

## 📞 Reference

- **Stripe ACSS Debit Docs**: https://docs.stripe.com/payments/acss-debit/accept-a-payment
- **Test Numbers Section**: Scroll to "Test account numbers"
- **Stripe Testing Guide**: https://docs.stripe.com/testing

---

**JUST USE**: 000 / 11000 / 000123456789 ✅

---

**Source**: Stripe Official Documentation  
**Last Updated**: March 7, 2026  
**Status**: READY TO TEST NOW
