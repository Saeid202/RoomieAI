import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bjesofgfbuyzjamyliys.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqZXNvZmdmYnV5emphbXlsaXlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjIwNzE5NywiZXhwIjoyMDY3NzgzMTk3fQ.fGUSD4T-VvDMtuTPBkxHdlBdz1zA3B6cy-RPxSmRpqg';
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyNewUser() {
  const userId = '887241cf-0551-4003-ad25-3f4a1d2fa8bc';
  console.log(`🔍 Checking new user: ${userId}`);
  
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('email, role')
    .eq('id', userId)
    .single();

  console.log('User Role Details:');
  console.log(JSON.stringify(profile, null, 2));
}

verifyNewUser();
