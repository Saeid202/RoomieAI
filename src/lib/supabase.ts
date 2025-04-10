
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client with environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if the required values are available
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase URL and/or Anon Key are missing. Make sure to set the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables."
  );
}

// Create a mock client that logs errors when methods are called if credentials are missing
export const supabase = !supabaseUrl || !supabaseAnonKey
  ? createMockSupabaseClient()
  : createClient(supabaseUrl, supabaseAnonKey);

// Create a mock client that prevents errors but logs warnings when methods are called
function createMockSupabaseClient() {
  return {
    auth: {
      getSession: () => {
        console.warn("Supabase credentials missing: auth.getSession called with mock client");
        return Promise.resolve({ data: { session: null } });
      },
      onAuthStateChange: () => {
        console.warn("Supabase credentials missing: auth.onAuthStateChange called with mock client");
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
      signUp: () => {
        console.warn("Supabase credentials missing: auth.signUp called with mock client");
        return Promise.resolve({ error: new Error("Supabase credentials not configured") });
      },
      signInWithPassword: () => {
        console.warn("Supabase credentials missing: auth.signInWithPassword called with mock client");
        return Promise.resolve({ error: new Error("Supabase credentials not configured") });
      },
      signInWithOAuth: () => {
        console.warn("Supabase credentials missing: auth.signInWithOAuth called with mock client");
        return Promise.resolve({ error: new Error("Supabase credentials not configured") });
      },
      resetPasswordForEmail: () => {
        console.warn("Supabase credentials missing: auth.resetPasswordForEmail called with mock client");
        return Promise.resolve({ error: new Error("Supabase credentials not configured") });
      },
      signOut: () => {
        console.warn("Supabase credentials missing: auth.signOut called with mock client");
        return Promise.resolve({ error: new Error("Supabase credentials not configured") });
      }
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => {
            console.warn("Supabase credentials missing: database query called with mock client");
            return Promise.resolve({ data: null, error: new Error("Supabase credentials not configured") });
          },
          update: () => {
            console.warn("Supabase credentials missing: database update called with mock client");
            return Promise.resolve({ error: new Error("Supabase credentials not configured") });
          },
          upsert: () => {
            console.warn("Supabase credentials missing: database upsert called with mock client");
            return Promise.resolve({ error: new Error("Supabase credentials not configured") });
          }
        })
      }),
      upsert: () => {
        console.warn("Supabase credentials missing: database upsert called with mock client");
        return Promise.resolve({ error: new Error("Supabase credentials not configured") });
      }
    })
  };
}
