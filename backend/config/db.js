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

    // ── admins / students / trainers ────────────────────────────────────────

    await client.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id         SERIAL PRIMARY KEY,
        name       VARCHAR(255)  NOT NULL,
        email      VARCHAR(255)  NOT NULL UNIQUE,
        password   VARCHAR(255)  NOT NULL,
        is_active  BOOLEAN       NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ   NOT NULL DEFAULT NOW()
      )
    `);
    console.log('  ✓ table ready: admins');

    await client.query(`
      CREATE TABLE IF NOT EXISTS students (
        id         SERIAL PRIMARY KEY,
        name       VARCHAR(255)  NOT NULL,
        email      VARCHAR(255)  NOT NULL UNIQUE,
        password   VARCHAR(255)  NOT NULL,
        is_active  BOOLEAN       NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ   NOT NULL DEFAULT NOW()
      )
    `);
    console.log('  ✓ table ready: students');

    await client.query(`
      CREATE TABLE IF NOT EXISTS trainers (
        id             SERIAL PRIMARY KEY,
        name           VARCHAR(255)  NOT NULL,
        email          VARCHAR(255)  NOT NULL UNIQUE,
        password       VARCHAR(255)  NOT NULL,
        specialization VARCHAR(255),
        is_active      BOOLEAN       NOT NULL DEFAULT TRUE,
        created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        updated_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
      )
    `);
    console.log('  ✓ table ready: trainers');

    // ── courses ──────────────────────────────────────────────────────────────

    await client.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id           SERIAL PRIMARY KEY,
        title        VARCHAR(255) NOT NULL UNIQUE,
        trainer_name VARCHAR(255) NOT NULL DEFAULT '',
        category     VARCHAR(100) NOT NULL DEFAULT 'General',
        price        VARCHAR(50)  NOT NULL DEFAULT '₹0',
        thumb        VARCHAR(50)  NOT NULL DEFAULT 'code',
        status       VARCHAR(20)  NOT NULL DEFAULT 'active'
                       CHECK (status IN ('active','inactive')),
        created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      )
    `);


    const courseCountRes = await client.query('SELECT COUNT(*) FROM courses');
    if (Number(courseCountRes.rows[0].count) === 0) {
      const seedCourses = [
        ['Full Stack Web Development', 'Pandeeswaran', 'Web Dev',     '₹12,999', 'web'],
        ['Data Science & Machine Learning', 'Antony',   'Data Science', '₹14,999', 'data'],
        ['UI/UX Design Masterclass', 'Ajith',            'Design',     '₹8,999',  'design'],
        ['DevOps & Cloud Engineering', 'Sridhar',        'DevOps',     '₹16,999', 'devops'],
        ['React Native Mobile Dev', 'Yokesh',             'Mobile',     '₹11,499', 'mobile'],
        ['AI & Deep Learning', 'Hari',                    'AI/ML',      '₹18,999', 'ai'],
        ['Digital Marketing with AI', 'Hari',             'AI/ML',      '₹18,999', 'digital'],
        ['Technical Support', 'Hari',                     'IT Support', '₹18,999', 'tech'],
      ];
      for (const [title, trainer_name, category, price, thumb] of seedCourses) {
        await client.query(
          `INSERT INTO courses (title, trainer_name, category, price, thumb)
           VALUES ($1,$2,$3,$4,$5) ON CONFLICT (title) DO NOTHING`,
          [title, trainer_name, category, price, thumb]
        );
      }
      console.log('  ✓ seeded courses table with 8 starter courses');
    }
    console.log('  ✓ table ready: courses');

    // ── live_classes ───────────────────────────────────────────────────────

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
    console.log('  ✓ table ready: live_classes');

    // ── enrollments ────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS enrollments (
        id           SERIAL PRIMARY KEY,
        student_id   INTEGER      NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        course_title VARCHAR(255) NOT NULL,
        enrolled_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        UNIQUE(student_id, course_title)
      )
    `);
    console.log('  ✓ table ready: enrollments');

    // ── quizzes ────────────────────────────────────────────────────────────

    await client.query(`
      CREATE TABLE IF NOT EXISTS quizzes (
        id                 SERIAL PRIMARY KEY,
        title              VARCHAR(255) NOT NULL,
        course             VARCHAR(255) NOT NULL,
        time_limit_minutes INTEGER      NOT NULL DEFAULT 15,
        pass_mark          INTEGER      NOT NULL DEFAULT 60,
        questions          JSONB        NOT NULL DEFAULT '[]',
        status             VARCHAR(20)  NOT NULL DEFAULT 'published'
                             CHECK (status IN ('published','draft')),
        created_by         INTEGER,
        created_by_role    VARCHAR(20)  CHECK (created_by_role IN ('trainer','admin')),
        created_by_name    VARCHAR(255) NOT NULL DEFAULT '',
        created_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      )
    `);


    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
           WHERE table_name='quizzes' AND column_name='created_by_role'
        ) THEN
          ALTER TABLE quizzes ADD COLUMN created_by_role VARCHAR(20) CHECK (created_by_role IN ('trainer','admin'));
        END IF;
      END$$
    `);
    console.log('  ✓ table ready: quizzes');

    // ── quiz_attempts ──────────────────────────────────────────────────────

    await client.query(`
      CREATE TABLE IF NOT EXISTS quiz_attempts (
        id           SERIAL PRIMARY KEY,
        quiz_id      INTEGER      NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
        student_id   INTEGER      NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        answers      JSONB        NOT NULL DEFAULT '[]',
        score        INTEGER      NOT NULL DEFAULT 0,
        total_marks  INTEGER      NOT NULL DEFAULT 0,
        percentage   NUMERIC(5,2) NOT NULL DEFAULT 0,
        passed       BOOLEAN      NOT NULL DEFAULT FALSE,
        submitted_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        UNIQUE(quiz_id, student_id)
      )
    `);
    console.log('  ✓ table ready: quiz_attempts');


    const tablesRes = await client.query(`
      SELECT table_name FROM information_schema.tables
       WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
       ORDER BY table_name
    `);
    console.log('All tables ready:', tablesRes.rows.map((r) => r.table_name).join(', '));
  } catch (error) {
    console.error('PostgreSQL connection error:', error.message);
    process.exit(1);
  } finally {
    if (client) client.release();
  }
};

module.exports = { pool, connectDB };