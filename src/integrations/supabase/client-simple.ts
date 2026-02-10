// Simplified Supabase client for debugging
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://bjesofgfbuyzjamyliys.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqZXNvZmdmYnV5emphbXlsaXlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMDcxOTcsImV4cCI6MjA2Nzc4MzE5N30.V0RSLBpoCehRW_CjIwfOmIm0iJio3Y2auDBoFyjUfOs";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});

export default supabase;
