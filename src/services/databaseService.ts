
import { supabase } from "@/integrations/supabase/client";

/**
 * Creates a function in Supabase to get table information (columns, types)
 * This helps with debugging database structure issues
 */
export async function createTableInfoFunction() {
  try {
    const { error } = await supabase.rpc('get_table_info', { table_name: 'co-owner' });
    
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
