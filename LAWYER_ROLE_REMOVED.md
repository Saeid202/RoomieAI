# Lawyer Role Removed - Replaced with Mortgage Broker

## Issue
The "Lawyer" role was still showing in the signup form on the homepage, even though it was supposed to be removed.

## Root Cause
The `SignupForm.tsx` component (used in the Navbar signup dialog) still had the "lawyer" role hardcoded in:
1. The Zod schema validation
2. The radio button options

## Fix Applied

### File: `src/components/auth/SignupForm.tsx`

**Before:**
```typescript
role: z.enum(["seeker", "landlord", "renovator", "lawyer"], {
  required_error: "Please select a role",
}),
```

**After:**
```typescript
role: z.enum(["seeker", "landlord", "renovator", "mortgage_broker"], {
  required_error: "Please select a role",
}),
```

**Radio Button - Before:**
```tsx
<FormItem className="flex items-center space-x-3 space-y-0">
  <FormControl>
    <RadioGroupItem value="lawyer" />
  </FormControl>
  <FormLabel className="font-normal cursor-pointer">
    Lawyer - Legal services & consultations
  </FormLabel>
</FormItem>
```

**Radio Button - After:**
```tsx
<FormItem className="flex items-center space-x-3 space-y-0">
  <FormControl>
    <RadioGroupItem value="mortgage_broker" />
  </FormControl>
  <FormLabel className="font-normal cursor-pointer">
    Mortgage Broker - Help clients with financing
  </FormLabel>
</FormItem>
```

## Current Signup Form Roles

The signup form now shows these 4 roles:

1. ✅ **Seeker** - Looking for rent or co-ownership
2. ✅ **Landlord** - Manage rental properties
3. ✅ **Renovator** - Find jobs & receive requests
4. ✅ **Mortgage Broker** - Help clients with financing (NEW!)

## Where This Form Appears

The `SignupForm` component is used in:
- **Navbar Signup Dialog** (`src/components/navbar/SignupDialog.tsx`)
- Appears when users click "Sign up" button in the top navigation
- This is the main signup entry point for the homepage

## Testing

After restarting the dev server, the signup form should now show:
- ❌ No "Lawyer" option
- ✅ "Mortgage Broker" option instead

## Status
✅ Lawyer role completely removed
✅ Mortgage Broker role added to signup form
✅ No TypeScript errors
✅ Ready to test

## Next Steps
1. Restart development server
2. Clear browser cache (Ctrl+Shift+R)
3. Click "Sign up" in navbar
4. Verify "Mortgage Broker" shows instead of "Lawyer"
