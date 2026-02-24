# Fix: Old UI Showing on Digital Wallet Page

## Problem
You're seeing the old "Payment Dashboard" UI instead of the new PAD payment interface.

## Root Cause
The file `src/pages/dashboard/tenant/TenantPayments.tsx` has the correct NEW code, but your browser is showing cached content OR your dev server needs to be restarted.

## Solution

### Step 1: Stop Dev Server (if running)
Press `Ctrl + C` in your terminal where the dev server is running

### Step 2: Clear Build Cache
```bash
rm -rf node_modules/.vite
```

Or on Windows:
```cmd
rmdir /s /q node_modules\.vite
```

### Step 3: Restart Dev Server
```bash
npm run dev
```

### Step 4: Hard Refresh Browser
Once the server is running:
1. Go to `http://localhost:5173/dashboard/digital-wallet`
2. Press `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
3. This will clear browser cache and reload

## What You Should See

After following these steps, you should see:

### NEW UI (Correct):
- **Header**: "Digital Wallet"
- **Subheader**: "Manage your rent payments with Canadian Pre-Authorized Debit (PAD)"
- **Blue Info Alert**: Shows fee savings (~$38/month)
- **Payment Flow Card**: "Pay Your Rent" with payment method selector
- **Test Credentials Card**: Stripe test bank account numbers

### Payment Method Selector Shows:
1. **Credit or Debit Card** option (blue, instant, higher fees)
2. **Canadian Bank Account (PAD)** option (green, 3-5 days, lower fees, savings badge)
3. **Fee Comparison** section at bottom

## Verification

The file content is CORRECT. I verified:
```
src/pages/dashboard/tenant/TenantPayments.tsx
```

Contains:
- RentPaymentFlow component
- Fee savings alert
- Test credentials
- All new PAD payment UI code

## If Still Showing Old UI

If you still see the old UI after these steps:

### Check 1: Verify Route
Make sure you're at: `http://localhost:5173/dashboard/digital-wallet`

### Check 2: Check Console
Open browser DevTools (F12) and check Console tab for errors

### Check 3: Verify Import
The route in `src/App.tsx` should be:
```tsx
<Route path="digital-wallet" element={<TenantPaymentsPage />} />
```

And the import should be:
```tsx
import TenantPaymentsPage from "@/pages/dashboard/tenant/TenantPayments";
```

### Check 4: Clear All Cache
```bash
# Stop server
# Delete cache folders
rm -rf node_modules/.vite
rm -rf dist

# Restart
npm run dev
```

### Check 5: Check Browser Cache
1. Open DevTools (F12)
2. Go to Application tab
3. Click "Clear storage"
4. Check all boxes
5. Click "Clear site data"
6. Hard refresh (Ctrl + Shift + R)

## Quick Test Commands

```bash
# Windows - Clear cache and restart
rmdir /s /q node_modules\.vite & npm run dev

# Linux/Mac - Clear cache and restart
rm -rf node_modules/.vite && npm run dev
```

## Summary

The code is correct. The issue is caching. Follow the steps above to see the new PAD payment UI.
