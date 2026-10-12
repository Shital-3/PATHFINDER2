const fs = require("fs");
const path = require("path");
const pool = require("../src/config/db");

(async () => {
    try {
        const sql = fs.readFileSync(
            path.join(__dirname, "..", "src", "config", "schema.sql"),
            "utf8"
        );
        await pool.query(sql);

        const { rows } = await pool.query(
            `SELECT table_name FROM information_schema.tables
             WHERE table_schema = 'public' ORDER BY table_name`
        );
        console.log("Tables:", rows.map((r) => r.table_name).join(", "));
    } catch (err) {
        console.error("DB init failed:", err.message);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
})();
