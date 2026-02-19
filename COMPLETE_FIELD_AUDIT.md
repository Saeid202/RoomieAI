# Complete Field Audit - Frontend vs Backend

## Frontend Fields Being Saved to tenant_profiles

From `SeekerProfile.tsx` (lines 245-270):

```typescript
const tenantFields = {
    user_id: user.id,
    linkedin: values.linkedin || null,                    // 1
    about_me: values.about_me || null,                    // 2
    prefer_not_to_say: values.prefer_not_to_say || null,  // 3
    profile_visibility: values.profile_visibility || 'public', // 4
    preferred_location: values.preferred_location || null, // 5
    budget_range: values.budget_range || null,            // 6
    move_in_date_start: values.move_in_date_start || null, // 7
    move_in_date_end: values.move_in_date_end || null,    // 8
    housing_type: values.housing_type || null,            // 9
    living_space: values.living_space || null,            // 10
    work_location: values.work_location || null,          // 11
    work_location_legacy: values.work_location_legacy || null, // 12
    work_schedule: values.work_schedule || null,          // 13
    pet_preference: values.pet_preference || null,        // 14
    has_pets: values.has_pets || false,                   // 15
    pet_type: values.pet_type || null,                    // 16
    smoking: values.smoking || null,                      // 17
    lives_with_smokers: values.lives_with_smokers || null, // 18
    diet: values.diet || null,                            // 19
    diet_other: values.diet_other || null,                // 20
    hobbies: values.hobbies || [],                        // 21
    updated_at: new Date().toISOString(),                 // 22
};
```

## Backend Columns in tenant_profiles Table

From database query result:

1. ✅ user_id
2. ✅ linkedin
3. ✅ about_me
4. ✅ prefer_not_to_say
5. ✅ profile_visibility
6. ✅ preferred_location
7. ✅ budget_range
8. ✅ move_in_date_start
9. ✅ move_in_date_end
10. ✅ housing_type
11. ✅ living_space
12. ✅ smoking
13. ✅ lives_with_smokers
14. ✅ has_pets
15. ✅ pet_type
16. ✅ pet_preference
17. ✅ diet
18. ✅ diet_other
19. ✅ hobbies
20. ✅ work_location
21. ✅ work_location_legacy
22. ✅ work_schedule
23. ✅ created_at
24. ✅ updated_at

## Comparison Result

### Frontend sends (22 fields + user_id):
1. user_id ✅
2. linkedin ✅
3. about_me ✅
4. prefer_not_to_say ✅
5. profile_visibility ✅
6. preferred_location ✅
7. budget_range ✅
8. move_in_date_start ✅
9. move_in_date_end ✅
10. housing_type ✅
11. living_space ✅
12. work_location ✅
13. work_location_legacy ✅
14. work_schedule ✅
15. pet_preference ✅
16. has_pets ✅
17. pet_type ✅
18. smoking ✅
19. lives_with_smokers ✅
20. diet ✅
21. diet_other ✅
22. hobbies ✅
23. updated_at ✅

### Backend has (24 columns):
All 23 frontend fields PLUS:
- created_at (auto-generated)

## ✅ RESULT: ALL FIELDS MATCH!

Every field the frontend is trying to save exists in the backend table.

## If You're Still Getting Errors

The error might be due to:
1. **Schema cache not refreshed** - Run: `NOTIFY pgrst, 'reload schema';`
2. **Browser cache** - Hard refresh (Ctrl+F5 or Cmd+Shift+R)
3. **TypeScript types not updated** - Restart your dev server

## Test Query

```sql
-- This should work without errors
INSERT INTO tenant_profiles (
    user_id, linkedin, about_me, prefer_not_to_say, profile_visibility,
    preferred_location, budget_range, move_in_date_start, move_in_date_end,
    housing_type, living_space, work_location, work_location_legacy,
    work_schedule, pet_preference, has_pets, pet_type, smoking,
    lives_with_smokers, diet, diet_other, hobbies
) VALUES (
    'test-uuid', 'test', 'test', 'test', 'public',
    'test', 'test', 'test', 'test',
    'test', 'test', 'test', 'test',
    'test', 'test', false, 'test', 'test',
    'test', 'test', 'test', ARRAY['test']
);
```
