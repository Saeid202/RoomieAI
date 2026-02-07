-- Enable pg_cron if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the Monthly Credit Reporting Job (Dry Run)
-- Cron syntax: min hour day month day_of_week
-- "0 2 1 * *" = At 02:00 on day-of-month 1.

SELECT cron.schedule(
    'generate-credit-report-batch-monthly', -- unique job name
    '0 2 1 * *',                            -- schedule
    $$
    select
      net.http_post(
          url:='https://PROJECT_REF.supabase.co/functions/v1/generate-credit-report-batch',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer SERVICE_ROLE_KEY"}'::jsonb,
          body:='{}'::jsonb
      ) as request_id;
    $$
);

-- Note: You will need to replace PROJECT_REF and SERVICE_ROLE_KEY with your actual project details
-- Or use the Supabase Dashboard to set up the cron job if you prefer UI management.
