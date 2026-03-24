require("dotenv").config();

const { Pool } = require("pg");

const connectionString =
  process.env.DATABASE_URL ||
  process.env.RENDER_POSTGRES_INTERNAL_URL ||
  process.env.RENDER_POSTGRES_EXTERNAL_URL;

if (!connectionString) {
  console.warn(
    "DATABASE_URL is not set. Add your Render Postgres internal URL in the environment variables."
  );
}

const pool = new Pool({
  connectionString,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false
});

pool
  .connect()
  .then((client) => {
    console.log("PostgreSQL Connected ✅");
    client.release();
  })
  .catch((error) => {
    console.error("DB Connection Failed ❌", error.message);
  });

function convertPlaceholders(sql) {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
}

function query(sql, params, callback) {
  let values = params;
  let cb = callback;

  if (typeof params === "function") {
    cb = params;
    values = [];
  }

  const text = convertPlaceholders(sql);

  const promise = pool.query(text, values || []);

  if (cb) {
    promise
      .then((result) => cb(null, result.rows))
      .catch((error) => cb(error));
  }

  return promise;
}

module.exports = {
  pool,
  query
};