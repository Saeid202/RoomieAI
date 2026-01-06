
-- Update Messaging Policies for Renovators
-- Allows both assigned and INVITED renovators to message for the job

-- 1. Update emergency_job_messages RLS
DROP POLICY IF EXISTS "Participants can view messages" ON public.emergency_job_messages;
CREATE POLICY "Participants can view messages" ON public.emergency_job_messages
FOR SELECT USING (
    (sender_user_id = auth.uid()) OR -- I sent it
    EXISTS (
        SELECT 1 FROM public.emergency_jobs j
        LEFT JOIN public.renovation_partners p ON j.assigned_renovator_id = p.id
        WHERE j.id = emergency_job_messages.job_id
        AND (j.landlord_id = auth.uid() OR p.user_id = auth.uid())
    ) OR
    EXISTS (
        -- Allow invited renovators to see messages for that job
        SELECT 1 FROM public.emergency_job_invites i
        JOIN public.renovation_partners p ON i.renovator_id = p.id
        WHERE i.job_id = emergency_job_messages.job_id
        AND p.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Participants can send messages" ON public.emergency_job_messages;
CREATE POLICY "Participants can send messages" ON public.emergency_job_messages
FOR INSERT WITH CHECK (
    (sender_user_id = auth.uid()) AND (
        EXISTS (
            SELECT 1 FROM public.emergency_jobs j
            LEFT JOIN public.renovation_partners p ON j.assigned_renovator_id = p.id
            WHERE j.id = job_id
            AND (j.landlord_id = auth.uid() OR p.user_id = auth.uid())
        ) OR
        EXISTS (
            -- Allow invited renovators to send messages
            SELECT 1 FROM public.emergency_job_invites i
            JOIN public.renovation_partners p ON i.renovator_id = p.id
            WHERE i.job_id = job_id
            AND p.user_id = auth.uid()
        )
    )
);
