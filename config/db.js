const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const assetEnvPath = path.join(process.cwd(), "assets", ".env");
if (fs.existsSync(assetEnvPath)) {
  dotenv.config({ path: assetEnvPath, override: false });
}

const { Pool } = require("pg");

const connectionString =
  process.env.DATABASE_URL ||
  process.env.RENDER_POSTGRES_INTERNAL_URL ||
  process.env.RENDER_POSTGRES_EXTERNAL_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL;

const ssl = process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false;

const poolConfig = connectionString
  ? {
      connectionString,
      ssl
    }
  : {
      host: process.env.PGHOST || process.env.DB_HOST || "127.0.0.1",
      port: Number(process.env.PGPORT || process.env.DB_PORT || 5432),
      user: process.env.PGUSER || process.env.DB_USER || "postgres",
      password: process.env.PGPASSWORD || process.env.DB_PASSWORD || "",
      database: process.env.PGDATABASE || process.env.DB_NAME || "swivel_it",
      ssl
    };

const pool = new Pool(poolConfig);

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