import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from './src/services/homieDB.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '.env');
dotenv.config({ path: envPath });

async function checkDatabase() {
  try {
    console.log('\n📊 Checking database...\n');

    // Check renovator_profiles
    console.log('🔍 Renovator Profiles:');
    const profiles = await query('SELECT user_id, service_categories, city, service_radius_km, status FROM renovator_profiles LIMIT 10');
    console.log(`Found ${profiles.rows.length} profiles:`);
    profiles.rows.forEach(row => {
      console.log(`  - User ${row.user_id}: ${row.service_categories} in ${row.city} (${row.service_radius_km}km) - ${row.status}`);
    });

    // Check renovation_requests
    console.log('\n🔍 Renovation Requests:');
    const requests = await query('SELECT id, user_id, address, city, work_type, status FROM renovation_requests LIMIT 10');
    console.log(`Found ${requests.rows.length} requests:`);
    requests.rows.forEach(row => {
      console.log(`  - Request ${row.id}: User ${row.user_id} in ${row.city} looking for ${row.work_type} - ${row.status}`);
    });

    // Check renovation_matches
    console.log('\n🔍 Renovation Matches:');
    const matches = await query('SELECT id, request_id, renovator_id, customer_id, match_score FROM renovation_matches LIMIT 10');
    console.log(`Found ${matches.rows.length} matches:`);
    matches.rows.forEach(row => {
      console.log(`  - Match ${row.id}: Request ${row.request_id} → Renovator ${row.renovator_id} (score: ${row.match_score})`);
    });

    console.log('\n✅ Database check complete\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkDatabase();
