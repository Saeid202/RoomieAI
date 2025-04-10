
import { createClient } from '@supabase/supabase-js';

// Use the actual Supabase URL and anon key for the project
const supabaseUrl = "https://xpcvbhhbbtoccvvotikh.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwY3ZiaGhiYnRvY2N2dm90aWtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzMTM5MDMsImV4cCI6MjA1OTg4OTkwM30.yHLBM4j1U2fwsapWLwrqHRrOtTBD1XYhZ96TBYvJsgY";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
