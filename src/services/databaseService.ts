
import { supabase } from "@/integrations/supabase/client";

/**
 * Creates and initializes database tables and functions needed for the application
 */
export async function initializeDatabase() {
  // First create the table info function for debugging
  await createTableInfoFunction();
  
  // Then ensure the co-owner table exists with correct structure
  await ensureCoOwnerTableExists();
}

/**
 * Creates a function in Supabase to get table information (columns, types)
 * This helps with debugging database structure issues
 */
export async function createTableInfoFunction() {
  try {
    const { error } = await supabase.rpc('get_table_info', { table_name: 'co_owner' });
    
    // If function doesn't exist, create it
    if (error && error.message.includes('does not exist')) {
      console.log("Creating table info function...");
      
      // Create the function using raw SQL
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE OR REPLACE FUNCTION get_table_info(table_name text)
          RETURNS TABLE(column_name text, data_type text, is_nullable boolean)
          LANGUAGE SQL
          AS $$
            SELECT 
              column_name::text, 
              data_type::text,
              (is_nullable = 'YES') as is_nullable
            FROM 
              information_schema.columns
            WHERE 
              table_name = $1
              AND table_schema = 'public'
            ORDER BY 
              ordinal_position;
          $$;
        `
      });
      
      if (createError) {
        console.error("Error creating table info function:", createError);
      } else {
        console.log("Table info function created successfully");
      }
    }
  } catch (error) {
    console.error("Error with table info function:", error);
  }
}

/**
 * Ensures that the co_owner table exists with the correct structure
 */
export async function ensureCoOwnerTableExists() {
  try {
    console.log("Checking if co_owner table exists...");
    
    // First, check if the table exists
    const { data: tables, error: tablesError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public')
      .eq('tablename', 'co_owner');
      
    if (tablesError) {
      console.error("Error checking for co_owner table:", tablesError);
      return;
    }
    
    // If the hyphenated table exists but not the underscore version, we need to handle it
    const { data: hyphenTables, error: hyphenError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public')
      .eq('tablename', 'co-owner');
      
    if (hyphenError) {
      console.error("Error checking for co-owner table:", hyphenError);
    } else if (hyphenTables && hyphenTables.length > 0) {
      console.log("Found co-owner table with hyphen, data will be accessed using this name");
    }
    
    // If the table doesn't exist at all, create it
    if ((!tables || tables.length === 0) && (!hyphenTables || hyphenTables.length === 0)) {
      console.log("Creating co_owner table...");
      
      // Create the table with proper structure using raw SQL
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS public.co_owner (
            id BIGSERIAL PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id),
            full_name TEXT,
            age TEXT,
            email TEXT,
            phone_number TEXT,
            occupation TEXT,
            preferred_location TEXT,
            investment_capacity NUMERIC[] DEFAULT '{100000, 500000}',
            investment_timeline TEXT DEFAULT '0-6 months',
            property_type TEXT DEFAULT 'Any',
            co_ownership_experience TEXT DEFAULT 'None',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
          );
        `
      });
      
      if (createError) {
        console.error("Error creating co_owner table:", createError);
      } else {
        console.log("Co_owner table created successfully");
      }
    } else {
      console.log("Co_owner table already exists");
    }
  } catch (error) {
    console.error("Error ensuring co_owner table exists:", error);
  }
}
