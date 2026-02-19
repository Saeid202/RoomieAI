# Frontend vs Backend Field Comparison

## Fields Being Saved by SeekerProfile.tsx

### Common Fields (should stay in user_profiles):
1. ✅ id
2. ✅ full_name
3. ✅ age
4. ✅ email
5. ✅ phone
6. ✅ nationality
7. ✅ occupation
8. ✅ language
9. ✅ ethnicity
10. ✅ religion
11. ✅ gender
12. ✅ user_type

### Tenant-Specific Fields (should go to tenant_profiles):
13. ✅ linkedin
14. ✅ about_me
15. ✅ prefer_not_to_say
16. ✅ profile_visibility
17. ✅ preferred_location (STRING - not array!)
18. ✅ budget_range (STRING - not split!)
19. ✅ move_in_date_start (STRING - not DATE!)
20. ✅ move_in_date_end (STRING)
21. ✅ housing_type
22. ✅ living_space
23. ✅ work_location
24. ✅ work_location_legacy
25. ✅ work_schedule
26. ✅ pet_preference
27. ✅ has_pets (BOOLEAN)
28. ✅ pet_type
29. ✅ smoking (ENUM: "Yes", "No")
30. ✅ lives_with_smokers (ENUM: "yes", "no")
31. ✅ diet
32. ✅ diet_other
33. ✅ hobbies (ARRAY)

## Key Differences Found:

### 1. preferred_location
- **Frontend**: STRING (single value)
- **My table**: TEXT[] (array)
- **Fix**: Change to TEXT (single string)

### 2. budget_range
- **Frontend**: STRING (e.g., "$500 - $1500")
- **My table**: Split into budget_min, budget_max (INTEGER)
- **Fix**: Keep as TEXT (single string) OR split in frontend

### 3. move_in_date_start/end
- **Frontend**: STRING
- **My table**: DATE
- **Fix**: Keep as TEXT or convert in frontend

### 4. smoking
- **Frontend**: ENUM ("Yes", "No")
- **My table**: TEXT
- **Fix**: Already TEXT, OK

### 5. lives_with_smokers
- **Frontend**: ENUM ("yes", "no")
- **My table**: TEXT
- **Fix**: Already TEXT, OK

## Recommendation:

Keep the table structure SIMPLE and match exactly what the frontend sends:
- Don't convert types (keep strings as strings)
- Don't split fields (keep budget_range as one field)
- Don't use arrays unless frontend sends arrays
