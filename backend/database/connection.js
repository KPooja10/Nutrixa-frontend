const { Pool } = require('pg');

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:yourpassword@localhost:5432/ponis_db',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('[PONIS DB] Failed to connect to PostgreSQL:', err.message);
    console.error('[PONIS DB] Make sure PostgreSQL is running and your DATABASE_URL in .env is correct.');
    process.exit(1);
  } else {
    console.log('[PONIS DB] Successfully connected to PostgreSQL database.');
    release();
  }
});

// Unified query interface
const db = {
  /**
   * Execute a raw SQL string (used for schema creation)
   * @param {string} sql 
   */
  exec: async (sql) => {
    await pool.query(sql);
  },

  /**
   * Run a parameterised query and return { rows, lastInsertId, changes }
   * @param {string} sql 
   * @param {Array} params 
   */
  query: async (sql, params = []) => {
    const result = await pool.query(sql, params);
    return {
      rows: result.rows,
      lastInsertId: result.rows.length > 0 ? result.rows[0].id : null,
      changes: result.rowCount
    };
  }
};

module.exports = db;
