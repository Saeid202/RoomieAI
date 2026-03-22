import { Pool } from 'pg';

// PostgreSQL connection pool
console.log('🔧 DATABASE_URL:', process.env.DATABASE_URL);
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000, // 5 second timeout
  idleTimeoutMillis: 30000,
  max: 20,
});

// Test connection
pool.on('connect', () => {
  console.log('Connected to HomieAI PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Helper functions with retry logic
export async function query(text, params, retries = 1) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Query error', { text, error: error.message });
    
    // Retry once on timeout errors
    if ((error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') && retries > 0) {
      console.log(`⏳ Retrying query after timeout (${retries} retries left)...`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
      return query(text, params, retries - 1);
    }
    
    throw error;
  }
}

// Export for use in matchingEngine.js
export default { query };
