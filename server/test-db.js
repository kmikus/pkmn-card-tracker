require('dotenv').config();
const { Pool } = require('pg');

// Test database connection
async function testConnection() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful!');
    console.log('Current time from database:', result.rows[0].now);
    
    // Test table creation
    await pool.query(`
      CREATE TABLE IF NOT EXISTS test_table (
        id SERIAL PRIMARY KEY,
        name TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Table creation test successful!');
    
    // Test insert
    await pool.query('INSERT INTO test_table (name) VALUES ($1)', ['test']);
    console.log('✅ Insert test successful!');
    
    // Test select
    const selectResult = await pool.query('SELECT * FROM test_table WHERE name = $1', ['test']);
    console.log('✅ Select test successful!');
    console.log('Found rows:', selectResult.rows.length);
    
    // Clean up
    await pool.query('DELETE FROM test_table WHERE name = $1', ['test']);
    console.log('✅ Cleanup successful!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testConnection(); 