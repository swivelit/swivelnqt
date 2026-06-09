require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const connectDB = async () => {
  try {
    const client = await pool.connect();

    console.log('PostgreSQL Connected to Render DB');

    // Create users table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id        SERIAL PRIMARY KEY,
        name      VARCHAR(255)        NOT NULL,
        email     VARCHAR(255)        NOT NULL UNIQUE,
        password  VARCHAR(255)        NOT NULL,
        role      VARCHAR(50)         NOT NULL DEFAULT 'student'
                    CHECK (role IN ('student', 'trainer', 'admin')),
        is_active BOOLEAN             NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ        NOT NULL DEFAULT NOW()
      )
    `);

    client.release();
  } catch (error) {
    console.error(`PostgreSQL connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { pool, connectDB };
