# Supabase CLI Installation for Windows

## ❌ Don't Use npm install
The error you got is expected - Supabase CLI cannot be installed via npm globally.

## ✅ Use One of These Methods Instead

### Method 1: Scoop (Recommended for Windows)

**Step 1: Install Scoop (if you don't have it)**
```powershell
# Run in PowerShell (as Administrator)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex
```

**Step 2: Install Supabase CLI**
```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Step 3: Verify Installation**
```powershell
supabase --version
```

---

### Method 2: Direct Download (Easiest)

**Step 1: Download the Windows executable**
- Go to: https://github.com/supabase/cli/releases/latest
- Download: `supabase_windows_amd64.zip`

**Step 2: Extract and add to PATH**
1. Extract the zip file to a folder (e.g., `C:\supabase`)
2. Add that folder to your Windows PATH:
   - Press `Win + X` → System
   - Click "Advanced system settings"
   - Click "Environment Variables"
   - Under "System variables", find "Path"
   - Click "Edit" → "New"
   - Add: `C:\supabase` (or wherever you extracted it)
   - Click OK on all dialogs

**Step 3: Restart your terminal and verify**
```cmd
supabase --version
```

---

### Method 3: Chocolatey

**If you have Chocolatey installed:**
```cmd
choco install supabase
```

---

## After Installation

Once installed, proceed with deployment:

### 1. Login to Supabase
```cmd
supabase login
```

### 2. Link Your Project
```cmd
supabase link --project-ref YOUR_PROJECT_REF
```
Get your project ref from: `https://supabase.com/dashboard/project/YOUR_PROJECT_REF`

### 3. Set Stripe Secrets
```cmd
supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_KEY
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET
```

### 4. Deploy Functions
```cmd
deploy-pad-functions.bat
```

Or manually:
```cmd
supabase functions deploy create-pad-payment-method
supabase functions deploy create-pad-payment-intent
supabase functions deploy pad-payment-webhook
```

---

## Troubleshooting

### "supabase: command not found"
- Make sure you added the folder to PATH
- Restart your terminal/command prompt
- Try opening a new terminal window

### "Access denied" during Scoop install
- Run PowerShell as Administrator
- Run: `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`

### Still having issues?
Use Method 2 (Direct Download) - it's the most reliable for Windows.

---

## Quick Start After Installation

```cmd
# 1. Login
supabase login

# 2. Link project
supabase link --project-ref YOUR_PROJECT_REF

# 3. Set secrets
supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_KEY
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET

# 4. Deploy
deploy-pad-functions.bat

# 5. Verify
supabase functions list
```

---

## Alternative: Use Supabase Dashboard

If you prefer not to use CLI, you can also:

1. Go to your Supabase Dashboard
2. Navigate to Edge Functions
3. Create new functions manually
4. Copy/paste the code from:
   - `supabase/functions/create-pad-payment-method/index.ts`
   - `supabase/functions/create-pad-payment-intent/index.ts`
   - `supabase/functions/pad-payment-webhook/index.ts`

This is less convenient but works without CLI.

---

**Recommended:** Use Method 1 (Scoop) or Method 2 (Direct Download) for Windows.
