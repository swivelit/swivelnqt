const db = require("../config/db");

exports.getApplicationByEmail = (email, cb) => {
  db.query(
    `SELECT * FROM exam_applications WHERE user_email=? LIMIT 1`,
    [email],
    (err, rows) => cb(err, rows?.[0] || null)
  );
};

exports.getUserByEmail = (email, cb) => {
  db.query(
    `SELECT id FROM users WHERE email=? LIMIT 1`,
    [email],
    (err, rows) => cb(err, rows?.[0] || null)
  );
};

exports.hasAlreadyAttended = (userId, cb) => {
  db.query(
    `SELECT id
         FROM exam_attempts
         WHERE exam_attempt_id = ?
           AND exam_status IN ('COMPLETED', 'TERMINATED')
         LIMIT 1`,
    [userId],
    (err, rows) => {
      if (err) return cb(err);
      cb(null, rows.length > 0);
    }
  );
};

exports.startExam = (data, cb) => {
  db.query(
    `
        INSERT INTO exam_attempts
        (
            exam_attempt_id,
            user_email,
            full_name,
            nqt_id,
            role,
            total_questions,
            exam_status,
            started_at
        )
        VALUES (?, ?, ?, ?, ?, ?, 'IN_PROGRESS', NOW())
        RETURNING id
        `,
    [
      data.user_id,
      data.email,
      data.full_name,
      data.nqt_id,
      data.role,
      data.total_questions
    ]
  )
    .then((result) => cb(null, { insertId: result.rows[0].id }))
    .catch((error) => cb(error));
};

exports.saveViolation = (exam_attempt_id, violation_type, cb) => {
  db.query(
    `
        INSERT INTO exam_violations
        (
            exam_attempt_id,
            user_email,
            full_name,
            nqt_id,
            violation_count,
            violation_types,
            last_violation_at
        )
        SELECT
            ea.id,
            ea.user_email,
            ea.full_name,
            ea.nqt_id,
            1,
            ?,
            NOW()
        FROM exam_attempts ea
        WHERE ea.id = ?
        ON CONFLICT (exam_attempt_id)
        DO UPDATE SET
            violation_count = exam_violations.violation_count + 1,
            violation_types = CONCAT_WS(', ', exam_violations.violation_types, EXCLUDED.violation_types),
            last_violation_at = NOW()
        `,
    [violation_type, exam_attempt_id],
    cb
  );
};

exports.finishExam = (id, attempted, correct, score, cb) => {
  db.query(
    `UPDATE exam_attempts
         SET attempted_questions=?,
             correct_answers=?,
             score=?,
             exam_status='COMPLETED',
             ended_at=NOW()
         WHERE id=?`,
    [attempted, correct, score, id],
    cb
  );
};

exports.terminateExam = (id, cb) => {
  db.query(
    `UPDATE exam_attempts
         SET exam_status='TERMINATED',
             ended_at=NOW()
         WHERE id=?`,
    [id],
    cb
  );
};

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
      cb(null, rows?.[0] || null);
    }
  );
};