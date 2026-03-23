const db = require("../config/db");

/* ================= CREATE USER ================= */

exports.createUser = (userData, callback) => {

    const sql = `
        INSERT INTO users (full_name, email, dob, mobile, password, role)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, userData, callback);
};


/* ================= FIND USER ================= */

exports.findUserByEmail = (email, callback) => {

    db.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        callback
    );
};


/* ===================== GET USER SCORE ===================== */

exports.getLatestResultByEmail = (email, cb) => {

    db.query(
        `
        SELECT score, total_questions
        FROM exam_attempts
        WHERE user_email = ?
          AND exam_status = 'COMPLETED'
        ORDER BY id DESC
        LIMIT 1
        `,
        [email],
        (err, rows) => {

            if (err) return cb(err);

            cb(null, rows[0] || null);

        }
    );

};