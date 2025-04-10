
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client with fallback values if environment variables are not set
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if the required values are available
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase URL and/or Anon Key are missing. Make sure to set the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
