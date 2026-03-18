-- Fix RLS Policy Bypass for ai_screening_results
-- Issue: WITH CHECK (true) allows any authenticated user to forge results

-- Drop the insecure policy
DROP POLICY IF EXISTS "System can insert screening results" ON ai_screening_results;

-- Create secure policy: users can only insert results for their own landlord_id
CREATE POLICY "Landlords can insert their own screening results" ON ai_screening_results
FOR INSERT TO authenticated
WITH CHECK (landlord_id IN (SELECT id FROM user_profiles WHERE id = auth.uid()));

-- Also fix ai_screening_logs if it has the same issue
DROP POLICY IF EXISTS "System can insert screening logs" ON ai_screening_logs;

CREATE POLICY "Users can insert their own screening logs" ON ai_screening_logs
FOR INSERT TO authenticated
WITH CHECK (landlord_id IN (SELECT id FROM user_profiles WHERE id = auth.uid()));