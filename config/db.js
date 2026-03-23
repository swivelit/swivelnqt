const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "swivel_it"
});

db.connect((err) => {
    if (err) {
        console.error("DB Connection Failed ❌", err);
    } else {
        console.log("MySQL Connected ✅");
    }
});

module.exports = db;