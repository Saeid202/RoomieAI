-- Check if review_status is being updated
-- Replace YOUR_PROFILE_ID with your actual mortgage profile ID

SELECT 
    id,
    user_id,
    review_status,
    last_reviewed_at,
    last_reviewed_by,
    created_at,
    updated_at
FROM mortgage_profiles
WHERE user_id = auth.uid()
ORDER BY created_at DESC
LIMIT 1;
