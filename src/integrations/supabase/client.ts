
import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// For development, provide fallback values if environment variables are missing
const url = supabaseUrl || 'https://xpcvbhhbbtoccvvotikh.supabase.co';
const key = supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwY3ZiaGhiYnRvY2N2dm90aWtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Njk5ODgyMzYsImV4cCI6MTk4NTU2NDIzNn0.F6uxQYnQ6ZT4OP_EH9mBuEMenYD_P9VYE6mLe61icPc';

// Create Supabase client with explicit options for auth
export const supabase = createClient(url, key, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Log for debugging - will be removed in production
console.info('Supabase client initialized with URL:', url);
