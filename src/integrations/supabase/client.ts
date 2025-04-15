
import { createClient } from '@supabase/supabase-js';

// Use hardcoded values for Supabase URL and key
const supabaseUrl = 'https://xpcvbhhbbtoccvvotikh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwY3ZiaGhiYnRvY2N2dm90aWtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzMTM5MDMsImV4cCI6MjA1OTg4OTkwM30.yHLBM4j1U2fwsapWLwrqHRrOtTBD1XYhZ96TBYvJsgY';

// Create Supabase client with explicit options for auth
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Log for debugging - will be removed in production
console.info('Supabase client initialized with URL:', supabaseUrl);
