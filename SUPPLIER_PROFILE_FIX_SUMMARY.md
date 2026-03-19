# Supplier Profile & Product Ownership Fix

## Problem
Products were not appearing in the seller centre even though they existed in the database and were visible on the public page. The dashboard showed "1 product" but the products list was empty.

## Root Cause
Multiple issues were identified:

1. **Wrong ID used for filtering**: The seller centre was filtering products by `supplier_id = session.user.id`, but `supplier_id` is a foreign key to `construction_supplier_profiles.id`, not the user ID.

2. **Missing supplier profiles**: Some users might not have a supplier profile created, or the profile creation trigger didn't fire properly.

3. **Orphaned products**: Products might have `supplier_id` values that don't match any existing supplier profile.

4. **Incorrect product creation**: The ProductFormModal was setting `supplier_id: session.user.id` instead of the actual supplier profile ID.

## Solution

### 1. Frontend Fixes

#### ConstructionProducts.tsx (Seller Centre)
- Changed from: `.eq('supplier_id', session.user.id)`
- Changed to: Get supplier profile first, then filter by `supplier_id = supplierProfile.id`

#### ConstructionDashboardHome.tsx (Dashboard)
- Applied same fix to product counting logic

#### ProductFormModal.tsx (Product Creation)
- Changed from: `supplier_id: session.user.id`
- Changed to: `supplier_id: supplierProfile.id` (after fetching the profile)

### 2. Database Migrations

#### 20260348_auto_fix_supplier_profiles.sql
- Ensures all users with `construction_supplier` role have a profile
- Fixes orphaned products by assigning them to the first available supplier profile
- Logs the results

#### 20260349_add_user_id_to_supplier_profiles.sql
- Adds explicit `user_id` column for better tracking
- Creates index for faster lookups

## How It Works

1. When a user logs in, the frontend now:
   - Gets the user's session
   - Queries `construction_supplier_profiles` to find the profile with `id = session.user.id`
   - Uses that profile ID to filter products

2. When creating a new product:
   - Gets the supplier profile ID first
   - Validates the profile exists
   - Sets `supplier_id` to the profile ID (not the user ID)

3. The database migration ensures:
   - All construction suppliers have a profile
   - No orphaned products exist
   - All products are properly linked to a supplier

## Testing

After applying these changes:

1. Hard refresh (Ctrl+Shift+R) the seller centre
2. Products should now appear in the Products list
3. Dashboard should show correct product counts
4. New products created will have the correct supplier_id

## Files Modified

- `src/construction/pages/dashboard/ConstructionProducts.tsx`
- `src/construction/pages/dashboard/ConstructionDashboardHome.tsx`
- `src/construction/components/ProductFormModal.tsx`
- `supabase/migrations/20260348_auto_fix_supplier_profiles.sql` (new)
- `supabase/migrations/20260349_add_user_id_to_supplier_profiles.sql` (new)
