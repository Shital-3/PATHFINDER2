require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
    max: 10,
});

pool.on("error", (err) => {
    console.error("Unexpected DB error:", err.message);
});

module.exports = pool;
