# Windows Supabase CLI Setup - Step by Step

## What You've Done So Far ✅
- Downloaded the Supabase CLI binary from GitHub

## What To Do Next 👇

### Step 1: Extract the Downloaded File

1. Find the downloaded file (probably in your Downloads folder)
   - Look for: `supabase_windows_amd64.zip` or similar
2. Right-click the file → "Extract All..."
3. Extract to: `C:\supabase\` (create this folder if needed)
4. After extraction, you should have: `C:\supabase\supabase.exe`

### Step 2: Add to Windows PATH

1. Press `Win + R` (opens Run dialog)
2. Type: `sysdm.cpl` and press Enter
3. Click the "Advanced" tab
4. Click "Environment Variables" button
5. Under "System variables" (bottom section), find "Path"
6. Click "Edit"
7. Click "New"
8. Type: `C:\supabase`
9. Click "OK" on all dialogs

### Step 3: Verify Installation

1. **Close all PowerShell/CMD windows** (important!)
2. Open a NEW PowerShell or CMD window
3. Type: `supabase --version`
4. You should see version number (e.g., `1.x.x`)

### Step 4: Navigate to Your Project

Find your project directory path. Based on your open files, it looks like you're working on a property/rental management system.

```cmd
cd C:\path\to\your\project
```

Replace `C:\path\to\your\project` with your actual project path.

### Step 5: Login to Supabase

```cmd
supabase login
```

This will open a browser window for authentication.

### Step 6: Link Your Project

Your project reference is: `bjssolfouygjamyljys`

```cmd
supabase link --project-ref bjssolfouygjamyljys
```

### Step 7: Get Your Stripe Keys

You need two keys from Stripe:

**A. Get Secret Key:**
1. Go to: https://dashboard.stripe.com/test/apikeys
2. Copy the "Secret key" (starts with `sk_test_`)

**B. Get Webhook Secret:**
1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. URL: `https://bjssolfouygjamyljys.supabase.co/functions/v1/pad-payment-webhook`
4. Select these events:
   - `payment_intent.created`
   - `payment_intent.processing`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Click "Add endpoint"
6. Copy the "Signing secret" (starts with `whsec_`)

### Step 8: Set Stripe Secrets in Supabase

```cmd
supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
```

Replace `YOUR_KEY_HERE` and `YOUR_SECRET_HERE` with your actual keys.

### Step 9: Deploy the Functions

```cmd
supabase functions deploy create-pad-payment-method
supabase functions deploy create-pad-payment-intent
supabase functions deploy pad-payment-webhook
```

### Step 10: Verify Deployment

```cmd
supabase functions list
```

You should see all 3 functions listed.

---

## Alternative: Use Supabase Dashboard (No CLI Needed)

If you prefer not to deal with CLI setup, you can deploy directly from the dashboard:

1. Go to: https://supabase.com/dashboard/project/bjssolfouygjamyljys/functions
2. Click "Create a new function"
3. For each function:
   - Name: `create-pad-payment-method` (then `create-pad-payment-intent`, then `pad-payment-webhook`)
   - Copy the code from the corresponding file in `supabase/functions/[function-name]/index.ts`
   - Click "Deploy"

4. Set environment variables:
   - Go to: https://supabase.com/dashboard/project/bjssolfouygjamyljys/settings/functions
   - Add secrets:
     - `STRIPE_SECRET_KEY` = your Stripe secret key
     - `STRIPE_WEBHOOK_SECRET` = your webhook secret

---

## Which Method Should You Use?

**Use CLI if:**
- You're comfortable with command line
- You want faster deployments in the future
- You want to use the deployment script

**Use Dashboard if:**
- You want to get started quickly
- You prefer visual interface
- You don't want to deal with PATH setup

---

## Need Help?

**Can't find your project directory?**
- Look at the path in your code editor's title bar
- Or check where your files like `package.json` are located

**PATH not working?**
- Make sure you closed ALL terminal windows after adding to PATH
- Try restarting your computer if still not working

**Prefer dashboard method?**
- Just go to the Supabase dashboard link above and start creating functions

---

## What's Your Current Situation?

Tell me:
1. Did you extract the supabase.exe file? Where?
2. Do you want to use CLI or Dashboard method?
3. What's your project directory path?

I'll help you with the next specific steps!
