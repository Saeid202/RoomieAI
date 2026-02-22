# Fix: ReferenceError - TenantPaymentsPage is not defined

## Problem
The dev server is using cached/old code and doesn't recognize the TenantPaymentsPage component.

## Solution

### Step 1: Stop Dev Server
In your terminal, press `Ctrl + C` to stop the dev server

### Step 2: Clear ALL Caches
```cmd
rmdir /s /q node_modules\.vite
rmdir /s /q dist
```

### Step 3: Restart Dev Server
```cmd
npm run dev
```

### Step 4: Hard Refresh Browser
Once the server starts:
1. Go to `http://localhost:5173/dashboard/digital-wallet`
2. Press `Ctrl + Shift + F5` (or `Ctrl + Shift + R`)
3. If that doesn't work, open DevTools (F12), right-click the refresh button, select "Empty Cache and Hard Reload"

## Alternative: If Still Not Working

If the above doesn't work, try a complete clean restart:

```cmd
# Stop server (Ctrl + C)

# Clear all caches
rmdir /s /q node_modules\.vite
rmdir /s /q dist
rmdir /s /q .vite

# Clear browser cache completely
# Open DevTools (F12) > Application tab > Clear storage > Clear site data

# Restart
npm run dev
```

## What's Happening

The files are correct:
- ✅ `src/App.tsx` has the import: `import TenantPaymentsPage from "@/pages/dashboard/tenant/TenantPayments";`
- ✅ `src/pages/dashboard/tenant/TenantPayments.tsx` has the export: `export default function DigitalWallet()`
- ✅ Route is correct: `<Route path="digital-wallet" element={<TenantPaymentsPage />} />`

The issue is Vite's dev server is using old cached code. A full cache clear and restart will fix it.

## Expected Result

After following these steps, you should see:
- **Header**: "Digital Wallet"
- **Blue alert**: Fee savings info
- **Payment card**: With payment method selector
- **Test credentials**: Stripe test accounts

No more errors!
