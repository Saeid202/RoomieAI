# Update SeekerProfile.tsx to Use tenant_profiles Table

## Current Problem
Right now, `SeekerProfile.tsx` saves ALL fields to `user_profiles` table (80+ columns).

## Solution
Split the save into TWO tables:
1. **Common fields** → `user_profiles`
2. **Tenant-specific fields** → `tenant_profiles`

---

## Code Changes Needed

### Find this code in `SeekerProfile.tsx` (around line 190-240):

```typescript
const onSubmit = async (values: ProfileFormValues) => {
    if (!user) return;

    try {
        console.log("Saving profile for user:", user.id, values);

        // Construct payload
        const updates = {
            id: user.id,
            full_name: values.full_name,
            age: values.age,
            email: values.email,
            linkedin: values.linkedin,
            nationality: values.nationality,
            about_me: values.about_me,
            gender: values.gender,
            prefer_not_to_say: values.prefer_not_to_say,
            phone: values.phone,
            profile_visibility: values.profile_visibility,
            language: values.language,
            ethnicity: values.ethnicity,
            religion: values.religion,
            occupation: values.occupation,
            preferred_location: values.preferred_location,
            budget_range: values.budget_range,
            move_in_date_start: values.move_in_date_start,
            move_in_date_end: values.move_in_date_end,
            housing_type: values.housing_type,
            work_location_legacy: values.work_location_legacy,
            pet_preference: values.pet_preference,
            diet: values.diet,
            diet_other: values.diet_other,
            hobbies: values.hobbies,
            living_space: values.living_space,
            work_schedule: values.work_schedule,
            work_location: values.work_location,
            has_pets: values.has_pets,
            pet_type: values.pet_type,
            smoking: values.smoking,
            lives_with_smokers: values.lives_with_smokers,
            user_type: userType,
            updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
            .from('user_profiles')
            .upsert(updates);

        if (error) throw error;

        toast({
            title: "Profile updated",
            description: "Your profile has been saved successfully.",
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        toast({
            title: "Error",
            description: "Failed to save profile. Please try again.",
            variant: "destructive",
        });
    }
};
```

### Replace with this NEW code:

```typescript
const onSubmit = async (values: ProfileFormValues) => {
    if (!user) return;

    try {
        console.log("Saving profile for user:", user.id, values);

        // 1. Save COMMON fields to user_profiles
        const commonFields = {
            id: user.id,
            full_name: values.full_name,
            age: values.age,
            email: values.email,
            phone: values.phone,
            nationality: values.nationality,
            language: values.language,
            ethnicity: values.ethnicity,
            religion: values.religion,
            occupation: values.occupation,
            gender: values.gender,
            user_type: userType,
            updated_at: new Date().toISOString(),
        };

        const { error: profileError } = await supabase
            .from('user_profiles')
            .upsert(commonFields);

        if (profileError) throw profileError;

        // 2. Save TENANT-SPECIFIC fields to tenant_profiles
        const tenantFields = {
            user_id: user.id,
            linkedin: values.linkedin,
            about_me: values.about_me,
            prefer_not_to_say: values.prefer_not_to_say,
            profile_visibility: values.profile_visibility,
            preferred_location: values.preferred_location,
            budget_range: values.budget_range,
            move_in_date_start: values.move_in_date_start,
            move_in_date_end: values.move_in_date_end,
            housing_type: values.housing_type,
            living_space: values.living_space,
            work_location: values.work_location,
            work_location_legacy: values.work_location_legacy,
            work_schedule: values.work_schedule,
            pet_preference: values.pet_preference,
            has_pets: values.has_pets,
            pet_type: values.pet_type,
            smoking: values.smoking,
            lives_with_smokers: values.lives_with_smokers,
            diet: values.diet,
            diet_other: values.diet_other,
            hobbies: values.hobbies,
            updated_at: new Date().toISOString(),
        };

        const { error: tenantError } = await supabase
            .from('tenant_profiles')
            .upsert(tenantFields);

        if (tenantError) throw tenantError;

        toast({
            title: "Profile updated",
            description: "Your profile has been saved successfully.",
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        toast({
            title: "Error",
            description: "Failed to save profile. Please try again.",
            variant: "destructive",
        });
    }
};
```

---

## What Changed?

### Before:
- ❌ All 30+ fields saved to `user_profiles`
- ❌ One giant table with 80+ columns

### After:
- ✅ 12 common fields → `user_profiles`
- ✅ 18 tenant fields → `tenant_profiles`
- ✅ Clean separation

---

## Fields Split

### Common Fields (user_profiles):
1. id
2. full_name
3. age
4. email
5. phone
6. nationality
7. language
8. ethnicity
9. religion
10. occupation
11. gender
12. user_type

### Tenant Fields (tenant_profiles):
1. linkedin
2. about_me
3. prefer_not_to_say
4. profile_visibility
5. preferred_location
6. budget_range
7. move_in_date_start
8. move_in_date_end
9. housing_type
10. living_space
11. work_location
12. work_location_legacy
13. work_schedule
14. pet_preference
15. has_pets
16. pet_type
17. smoking
18. lives_with_smokers
19. diet
20. diet_other
21. hobbies

---

## Testing

After making the change:

1. **Refresh your browser** (Ctrl+F5)
2. **Go to profile page**
3. **Fill out the form**
4. **Click Save**
5. **Check both tables**:

```sql
-- Check user_profiles
SELECT id, full_name, age, email, nationality 
FROM user_profiles 
WHERE email = 'your-email@example.com';

-- Check tenant_profiles
SELECT user_id, preferred_location, budget_range, housing_type 
FROM tenant_profiles 
WHERE user_id = 'your-user-id';
```

---

## Benefits

✅ **Clean architecture** - Matches landlord_verifications and renovation_partners
✅ **Better performance** - Smaller tables, faster queries
✅ **No NULL waste** - Only tenants have tenant_profiles records
✅ **Easier maintenance** - Clear separation of concerns
✅ **Scalable** - Easy to add new tenant-specific fields

---

## Next Steps

1. Make the code change above
2. Test saving your profile
3. Verify data is in both tables
4. Done! ✅
