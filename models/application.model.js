const db = require("../config/db");

/* =========================
   CREATE
========================= */
exports.createApplication = (data, callback) => {
    const sql = `
        INSERT INTO exam_applications
        (user_email, full_name, age, gender, phone, whatsapp, college,
         qualification, passed_out_year, district, pincode,
         reference_name, address, course_name, fees)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(sql, data, callback);
};

/* =========================
   GET ALL
========================= */
exports.getAllApplications = callback => {
    const sql = `
        SELECT * FROM exam_applications
        ORDER BY created_at DESC
    `;
    db.query(sql, callback);
};

/* =========================
   GET BY EMAIL
========================= */
exports.getApplicationsByEmail = (email, callback) => {
    const sql = `
        SELECT * FROM exam_applications
        WHERE user_email = ?
        ORDER BY created_at DESC
    `;
    db.query(sql, [email], callback);
};

/* =========================
   GET BY ID
========================= */
exports.getApplicationById = (id, callback) => {
    const sql = `
        SELECT * FROM exam_applications
        WHERE id = ?
    `;
    db.query(sql, [id], callback);
};
