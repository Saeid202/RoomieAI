# Debug Console Commands

Open your browser console (F12) and run these commands to see what's happening:

## 1. Check Current Auth State
```javascript
// Get current user from Supabase
const { data: { user } } = await window.supabase.auth.getUser();
console.log('User:', user);
console.log('User metadata role:', user?.user_metadata?.role);
```

## 2. Check User Profile in Database
```javascript
// Query user_profiles table
const { data: profile } = await window.supabase
  .from('user_profiles')
  .select('*')
  .eq('id', user.id)
  .single();
console.log('Profile:', profile);
console.log('Profile role:', profile?.role);
```

## 3. Check What's in LocalStorage
```javascript
// Check for any cached role data
console.log('LocalStorage keys:', Object.keys(localStorage));
console.log('Supabase auth:', localStorage.getItem('sb-bjesofgfbuyzjamyliys-auth-token'));
```

## 4. Force Refresh Auth Session
```javascript
// Force refresh the session to get latest metadata
const { data: { session } } = await window.supabase.auth.refreshSession();
console.log('Refreshed session:', session);
console.log('User metadata after refresh:', session?.user?.user_metadata);
```

## What to Look For

1. **User metadata role** should be: `mortgage_broker`
2. **Profile role** should be: `mortgage_broker`
3. If either is wrong, the database update didn't work
4. If both are correct but you still see seeker dashboard, it's a frontend caching issue

## Share These Results

Copy and paste the console output here so we can see what's actually being loaded.
