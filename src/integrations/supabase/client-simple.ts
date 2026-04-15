// Single shared Supabase client instance - avoids multiple auth state machines
import { supabase } from './client';
export { supabase };
export default supabase;
