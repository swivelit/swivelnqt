const db = require("../config/db");

exports.addEnquiry = (data, cb) => {
  const [user_id, course_id] = data;

  const sql = `
        INSERT INTO course_enquiries (user_id, course_id)
        VALUES (?, ?)
    `;

  db.query(sql, [user_id, course_id], cb);
};

exports.checkExisting = (user_id, course_id, cb) => {
  const sql = `
        SELECT * FROM course_enquiries
        WHERE user_id = ? AND course_id = ?
    `;
  db.query(sql, [user_id, course_id], cb);
};

exports.getUserEnquiry = (user_id, cb) => {
  const sql = `
        SELECT ce.*, c.course_name, c.gmeet_link
        FROM course_enquiries ce
        JOIN courses c ON ce.course_id = c.id
        WHERE ce.user_id = ?
    `;
  db.query(sql, [user_id], cb);
};