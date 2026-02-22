# Final Fix Steps - TenantPaymentsPage Error

## Current Status
- ✅ File exists: `src/pages/dashboard/tenant/TenantPayments.tsx`
- ✅ Import exists in App.tsx: `import TenantPaymentsPage from "@/pages/dashboard/tenant/TenantPayments";`
- ✅ Export is correct: `export default function DigitalWallet()`
- ✅ Routes are correct: `<Route path="digital-wallet" element={<TenantPaymentsPage />} />`
- ✅ Vite cache cleared
- ❌ Still getting "TenantPaymentsPage is not defined" error

## Root Cause
Vite's dev server has cached the old module and HMR (Hot Module Replacement) isn't picking up the changes.

## Complete Fix (Do ALL steps in order)

### Step 1: Stop Dev Server COMPLETELY
In your terminal where `npm run dev` is running:
1. Press `Ctrl + C`
2. Wait for it to fully stop
3. If it doesn't stop, close the terminal window entirely

### Step 2: Clear Browser Cache COMPLETELY
1. Open DevTools (F12)
2. Go to "Application" tab
3. Click "Clear storage" in left sidebar
4. Check ALL boxes
5. Click "Clear site data"
6. Close the browser completely
7. Reopen the browser

### Step 3: Clear ALL Build Caches
Run these commands in PowerShell:

```powershell
Remove-Item -Recurse -Force node_modules\.vite -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue  
Remove-Item -Recurse -Force .vite -ErrorAction SilentlyContinue
```

### Step 4: Verify File Integrity
Run this to make sure the file is correct:

```powershell
Get-Content "src\pages\dashboard\tenant\TenantPayments.tsx" | Select-Object -First 15
```

You should see:
```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RentPaymentFlow } from "@/components/payment/RentPaymentFlow";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function DigitalWallet() {
```

### Step 5: Restart Dev Server
```powershell
npm run dev
```

Wait for it to fully start. You should see:
```
VITE v... ready in ...ms
➜  Local:   http://localhost:5173/
```

### Step 6: Access Page Fresh
1. Open a NEW browser window (not a tab)
2. Go to: `http://localhost:5173/dashboard/digital-wallet`
3. Press `Ctrl + Shift + R` to hard refresh

## If STILL Not Working

If you still see the error after ALL the above steps, there might be a module resolution issue. Try this:

### Alternative Fix: Rename and Re-import

1. Stop dev server
2. Rename the component function:

```tsx
// In src/pages/dashboard/tenant/TenantPayments.tsx
// Change from:
export default function DigitalWallet() {

// To:
export default function TenantPayments() {
```

3. Clear caches again
4. Restart dev server
5. Hard refresh browser

## Expected Result

After following ALL steps, you should see:
- **Header**: "Digital Wallet"
- **Subheader**: "Manage your rent payments with Canadian Pre-Authorized Debit (PAD)"
- **Blue Info Alert**: Shows fee savings
- **Payment Flow Card**: "Pay Your Rent" with payment method selector
- **Test Credentials Card**: Stripe test bank accounts

NO errors in console!

## Why This Happens

Vite's HMR can sometimes get confused when:
- Routes are changed while server is running
- Imports are added/removed
- Files are renamed
- Multiple changes happen quickly

A complete clean restart fixes it.
