-- Create the Missing Seeker Policy - One statement at a time

-- Step 1: Create the seeker policy on user_profiles table
CREATE POLICY "Allow seekers to view landlord names" ON user_profiles
    FOR SELECT USING (
        id IN (SELECT user_id FROM properties WHERE user_id IS NOT NULL)
    );
