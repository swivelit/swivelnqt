require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const connectDB = async () => {
  let client;
  try {
    client = await pool.connect();
    console.log('PostgreSQL Connected');

    // ── users ──────────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id         SERIAL PRIMARY KEY,
        name       VARCHAR(255)  NOT NULL,
        email      VARCHAR(255)  NOT NULL UNIQUE,
        password   VARCHAR(255)  NOT NULL,
        role       VARCHAR(50)   NOT NULL DEFAULT 'student'
                     CHECK (role IN ('student','trainer','admin')),
        is_active  BOOLEAN       NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ   NOT NULL DEFAULT NOW()
      )
    `);

    // ── live_classes ───────────────────────────────────────────────────────
    // Drop any old status CHECK constraint that blocks updates, then
    // recreate the table fresh if it doesn't exist yet (no data lost).
    await client.query(`
      CREATE TABLE IF NOT EXISTS live_classes (
        id             VARCHAR(100) PRIMARY KEY,
        title          VARCHAR(255) NOT NULL,
        course         VARCHAR(255) NOT NULL,
        date           VARCHAR(20)  NOT NULL,
        time           VARCHAR(10)  NOT NULL,
        duration       INTEGER      NOT NULL DEFAULT 60,
        platform       VARCHAR(100) NOT NULL DEFAULT 'Zoom',
        link           TEXT         NOT NULL,
        description    TEXT         NOT NULL DEFAULT '',
        host           VARCHAR(255) NOT NULL DEFAULT '',
        status         VARCHAR(20)  NOT NULL DEFAULT 'scheduled',
        enrolled       INTEGER      NOT NULL DEFAULT 0,
        joined         INTEGER      NOT NULL DEFAULT 0,
        recurring      BOOLEAN      NOT NULL DEFAULT FALSE,
        recur_type     VARCHAR(20)           DEFAULT 'weekly',
        recur_count    INTEGER               DEFAULT 1,
        notify         JSONB                 DEFAULT '{}',
        manually_ended BOOLEAN      NOT NULL DEFAULT FALSE,
        created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      )
    `);

    // Safety: add manually_ended column if an old version of the table exists
    // without it (ALTER TABLE IF NOT EXISTS column is Postgres 9.6+).
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
           WHERE table_name='live_classes' AND column_name='manually_ended'
        ) THEN
          ALTER TABLE live_classes ADD COLUMN manually_ended BOOLEAN NOT NULL DEFAULT FALSE;
        END IF;
      END$$
    `);

    // ── enrollments ────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS enrollments (
        id           SERIAL PRIMARY KEY,
        student_id   INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        course_title VARCHAR(255) NOT NULL,
        enrolled_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        UNIQUE(student_id, course_title)
      )
    `);

    console.log('All tables ready');
  } catch (error) {
    console.error('PostgreSQL connection error:', error.message);
    process.exit(1);
  } finally {
    if (client) client.release();
  }
};

module.exports = { pool, connectDB };
