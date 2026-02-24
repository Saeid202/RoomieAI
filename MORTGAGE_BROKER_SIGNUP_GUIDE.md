# Mortgage Broker Signup & Authentication Guide

## ✅ Complete Implementation

The mortgage broker role is now fully integrated into the authentication system. Users can select it during signup or switch to it later.

## How It Works

### 1. Role Type Definition
**File**: `src/contexts/RoleContext.tsx`
```typescript
export type UserRole = 'seeker' | 'landlord' | 'admin' | 'developer' | 'renovator' | 'mortgage_broker';
```

### 2. Signup Flow

When a new user signs up, they see the **RoleSelectionDialog** with these options:

```
┌─────────────────────────────────────┐
│     Welcome to Roomi AI             │
│                                     │
│  Please select how you'll be using  │
│  Roomi AI:                          │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 👤 Seeker                   │   │
│  │ Looking for a roommate or   │   │
│  │ rental property.            │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🏢 Landlord                 │   │
│  │ List and manage rental      │   │
│  │ properties...               │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 💼 Mortgage Broker          │   │ ← NEW!
│  │ Help clients with mortgage  │   │
│  │ applications and financing. │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### 3. What Happens After Selection

**User clicks "Mortgage Broker"**:
1. Role saved to user metadata: `{ role: 'mortgage_broker' }`
2. User redirected to: `/dashboard/mortgage-broker`
3. Dashboard loads with:
   - Mortgage Broker Sidebar
   - Profile section
   - Clients list
   - Bottom left: My Account, Settings, Log Out

### 4. Role Switching

Users can switch roles anytime using the **RoleSwitcher** dropdown:

```
┌─────────────────────┐
│ 💼 Mortgage Broker ▼│  ← Current role
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│ 👤 Seeker          │
│ 🏢 Landlord        │
│ 🛠️ Renovator       │
└─────────────────────┘
```

## Database Storage

The role is stored in two places:

1. **User Metadata** (Supabase Auth):
   ```json
   {
     "role": "mortgage_broker"
   }
   ```

2. **User Profiles Table**:
   ```sql
   user_profiles (
     id UUID,
     role TEXT  -- 'mortgage_broker'
   )
   ```

## Authentication Flow

```
User Signs Up
     │
     ▼
RoleSelectionDialog Appears
     │
     ├─→ Selects "Seeker" → /dashboard/roommate-recommendations
     ├─→ Selects "Landlord" → /dashboard/landlord
     └─→ Selects "Mortgage Broker" → /dashboard/mortgage-broker
                                            │
                                            ▼
                                  MortgageBrokerDashboard
                                            │
                                            ├─→ Profile Section
                                            ├─→ Clients List
                                            └─→ Account Actions
```

## Code Integration Points

### 1. Role Selection Dialog
**File**: `src/components/auth/RoleSelectionDialog.tsx`
- Added Mortgage Broker card
- Icon: `<Briefcase size={24} />`
- Redirects to `/dashboard/mortgage-broker`

### 2. Role Switcher
**File**: `src/components/dashboard/RoleSwitcher.tsx`
- Added to available roles list
- Icon: `<Briefcase className="h-4 w-4" />`
- Navigation logic included

### 3. Dashboard Routing
**File**: `src/pages/Dashboard.tsx`
```typescript
if (assignedRole === 'mortgage_broker') {
  return <Navigate to="/dashboard/mortgage-broker" replace />;
}
```

### 4. App Routes
**File**: `src/App.tsx`
```typescript
<Route path="mortgage-broker" element={<MortgageBrokerDashboard />} />
<Route path="mortgage-broker/profile" element={<MortgageBrokerDashboard />} />
<Route path="mortgage-broker/clients" element={<MortgageBrokerDashboard />} />
```

### 5. Sidebar Integration
**File**: `src/components/dashboard/DashboardSidebar.tsx`
```typescript
{role === 'mortgage_broker' ? (
  <MortgageBrokerSidebar isActive={isActive} />
) : ...}
```

## Testing the Signup Flow

### Test 1: New User Signup
1. Go to `/auth` (signup page)
2. Create new account
3. RoleSelectionDialog should appear
4. Click "Mortgage Broker" card
5. Should redirect to `/dashboard/mortgage-broker`
6. Dashboard should load with broker interface

### Test 2: Role Switching
1. Log in as any role (e.g., Seeker)
2. Click role dropdown in sidebar
3. Select "Mortgage Broker"
4. Should redirect to `/dashboard/mortgage-broker`
5. Role should persist after page refresh

### Test 3: Direct Access
1. Log in as mortgage broker
2. Navigate to `/dashboard`
3. Should auto-redirect to `/dashboard/mortgage-broker`

## Security & Permissions

### Row Level Security (RLS)
The `mortgage_broker_profiles` table has RLS policies:
- Brokers can only view/edit their own profile
- Brokers can view all mortgage_profiles (clients)

### Role Verification
- Role stored in user metadata (Supabase Auth)
- Verified on every request
- Cannot be changed client-side without authentication

## Summary

✅ Mortgage broker role fully integrated into signup flow
✅ Available in role selection dialog
✅ Available in role switcher
✅ Proper routing and navigation
✅ Secure with RLS policies
✅ Persists across sessions

Users can now:
1. Sign up as mortgage broker
2. Switch to mortgage broker role
3. Access mortgage broker dashboard
4. Manage their profile
5. View all client mortgage applications
